import { prisma } from "../prisma/client";
import { RecordMetricEventInput } from "../interfaces/experiment";

type MetricEventLite = {
  id: string;
  createdAt: Date;
  eventType: string;
  target: string | null;
  metadata: unknown;
};

export class MetricsService {
  async recordEvent(data: RecordMetricEventInput) {
    return prisma.metricEvent.create({
      data: {
        eventType: data.eventType as any,
        target: data.target ?? null,
        experimentId: data.experimentId ?? null,
        variantId: data.variantId ?? null,
        ...(data.metadata !== undefined ? { metadata: data.metadata as any } : {}),
      },
      select: {
        id: true,
        eventType: true,
        target: true,
        experimentId: true,
        variantId: true,
        createdAt: true,
      },
    });
  }

  async getCtrByExperiment(experimentId: string) {
    const events = await prisma.metricEvent.findMany({
      where: { experimentId },
      select: { eventType: true, variantId: true },
    });

    const byVariant: Record<string, { impressions: number; clicks: number }> = {};
    for (const e of events) {
      const v = e.variantId ?? "none";
      if (!byVariant[v]) byVariant[v] = { impressions: 0, clicks: 0 };
      if (e.eventType === "IMPRESSION") byVariant[v].impressions++;
      if (e.eventType === "CLICK") byVariant[v].clicks++;
    }

    return Object.entries(byVariant).map(([variantId, counts]) => ({
      variantId,
      impressions: counts.impressions,
      clicks: counts.clicks,
      ctr: counts.impressions > 0 ? counts.clicks / counts.impressions : 0,
    }));
  }

  async getTimeInAppByExperiment(experimentId: string) {
    const sessions = await prisma.metricEvent.findMany({
      where: {
        experimentId,
        eventType: { in: ["SESSION_START", "SESSION_END"] },
      },
      select: {
        eventType: true,
        variantId: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Sem userId: pareamento simplificado por variante na ordem temporal.
    const durationsByVariant: Record<string, number[]> = {};
    const startsByVariant: Record<string, Date[]> = {};

    for (const e of sessions) {
      const v = e.variantId ?? "none";
      if (!durationsByVariant[v]) durationsByVariant[v] = [];
      if (!startsByVariant[v]) startsByVariant[v] = [];

      if (e.eventType === "SESSION_START") {
        startsByVariant[v].push(e.createdAt);
      } else if (e.eventType === "SESSION_END") {
        const start = startsByVariant[v].shift();
        if (start) {
          const meta = e.metadata as { durationSeconds?: number } | null;
          const durationSeconds =
            typeof meta?.durationSeconds === "number"
              ? meta.durationSeconds
              : (e.createdAt.getTime() - start.getTime()) / 1000;
          durationsByVariant[v].push(durationSeconds);
        }
      }
    }

    return Object.entries(durationsByVariant).map(([variantId, durations]) => {
      const total = durations.reduce((a, b) => a + b, 0);
      const count = durations.length;
      return {
        variantId,
        totalSeconds: Math.round(total * 100) / 100,
        sessionCount: count,
        averageSecondsPerSession: count > 0 ? Math.round((total / count) * 100) / 100 : 0,
      };
    });
  }

  async getSummaryByExperiment(experimentId: string) {
    const [ctr, timeInApp] = await Promise.all([
      this.getCtrByExperiment(experimentId),
      this.getTimeInAppByExperiment(experimentId),
    ]);

    const variantIds = new Set([...ctr.map((c) => c.variantId), ...timeInApp.map((t) => t.variantId)]);
    return Array.from(variantIds).map((variantId) => {
      const ctrRow = ctr.find((c) => c.variantId === variantId);
      const timeRow = timeInApp.find((t) => t.variantId === variantId);
      return {
        variantId,
        ctr: ctrRow ?? { impressions: 0, clicks: 0, ctr: 0 },
        timeInApp: timeRow ?? {
          totalSeconds: 0,
          sessionCount: 0,
          averageSecondsPerSession: 0,
        },
      };
    });
  }

  async getDashboardData(days = 30) {
    const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 30;
    const since = new Date();
    since.setDate(since.getDate() - safeDays);

    const events: MetricEventLite[] = await prisma.metricEvent.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        createdAt: true,
        eventType: true,
        target: true,
        metadata: true,
      },
    });

    const totalEvents = events.length;
    // Sem userId no módulo de métricas, este indicador deixa de existir.
    const activeUsers = 0;
    const screenViews = events.filter((e) => e.eventType === "SCREEN_VIEW").length;
    const clicks = events.filter((e) => e.eventType === "CLICK").length;
    const screenSessionStarts = events.filter(
      (e) => e.eventType === "SESSION_START" && e.target?.startsWith("screen_")
    );
    const screenSessionEnds = events.filter(
      (e) => e.eventType === "SESSION_END" && e.target?.startsWith("screen_")
    );
    const sessionsStarted = screenSessionStarts.length;
    const sessionsEnded = screenSessionEnds.length;

    const eventsByTypeMap = new Map<string, number>();
    for (const event of events) {
      eventsByTypeMap.set(
        event.eventType,
        (eventsByTypeMap.get(event.eventType) ?? 0) + 1
      );
    }
    const eventsByType = Array.from(eventsByTypeMap.entries())
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count);

    const screenStats = new Map<
      string,
      { views: number; sessions: number; durationTotal: number; durationCount: number }
    >();
    for (const event of events) {
      if (!event.target?.startsWith("screen_")) continue;
      const current =
        screenStats.get(event.target) ?? {
          views: 0,
          sessions: 0,
          durationTotal: 0,
          durationCount: 0,
        };

      if (event.eventType === "SCREEN_VIEW") current.views++;
      if (event.eventType === "SESSION_START") current.sessions++;

      screenStats.set(event.target, current);
    }

    const sessionEndsByDate = new Map<string, number>();
    let durationTotal = 0;
    let durationCount = 0;

    for (const end of screenSessionEnds) {
      const meta = end.metadata as { durationSeconds?: number } | null;
      if (typeof meta?.durationSeconds === "number" && meta.durationSeconds >= 0) {
        durationTotal += meta.durationSeconds;
        durationCount++;
      }

      if (end.target) {
        const stats = screenStats.get(end.target) ?? {
          views: 0,
          sessions: 0,
          durationTotal: 0,
          durationCount: 0,
        };
        if (typeof meta?.durationSeconds === "number" && meta.durationSeconds >= 0) {
          stats.durationTotal += meta.durationSeconds;
          stats.durationCount++;
        }
        screenStats.set(end.target, stats);
      }

      const endDate = end.createdAt.toISOString().slice(0, 10);
      sessionEndsByDate.set(endDate, (sessionEndsByDate.get(endDate) ?? 0) + 1);
    }

    const avgSessionSeconds =
      durationCount > 0 ? Math.round((durationTotal / durationCount) * 100) / 100 : 0;

    const topScreens = Array.from(screenStats.entries())
      .map(([screen, stats]) => ({
        screen,
        views: stats.views,
        sessions: stats.sessions,
        avgSessionSeconds:
          stats.durationCount > 0
            ? Math.round((stats.durationTotal / stats.durationCount) * 100) / 100
            : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    const topClicksMap = new Map<string, number>();
    for (const event of events) {
      if (event.eventType !== "CLICK" || !event.target) continue;
      topClicksMap.set(event.target, (topClicksMap.get(event.target) ?? 0) + 1);
    }
    const topClicks = Array.from(topClicksMap.entries())
      .map(([target, count]) => ({ target, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const timelineMap = new Map<
      string,
      {
        date: string;
        total: number;
        screenViews: number;
        clicks: number;
        sessionsStarted: number;
        sessionsEnded: number;
      }
    >();

    for (const event of events) {
      const date = event.createdAt.toISOString().slice(0, 10);
      const row = timelineMap.get(date) ?? {
        date,
        total: 0,
        screenViews: 0,
        clicks: 0,
        sessionsStarted: 0,
        sessionsEnded: 0,
      };
      row.total++;
      if (event.eventType === "SCREEN_VIEW") row.screenViews++;
      if (event.eventType === "CLICK") row.clicks++;
      if (event.eventType === "SESSION_START" && event.target?.startsWith("screen_")) {
        row.sessionsStarted++;
      }
      timelineMap.set(date, row);
    }

    for (const [date, count] of sessionEndsByDate.entries()) {
      const row = timelineMap.get(date) ?? {
        date,
        total: 0,
        screenViews: 0,
        clicks: 0,
        sessionsStarted: 0,
        sessionsEnded: 0,
      };
      row.sessionsEnded = count;
      timelineMap.set(date, row);
    }

    const eventsTimeline = Array.from(timelineMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const recentEvents = [...events]
      .reverse()
      .slice(0, 20)
      .map((event) => ({
        id: event.id,
        createdAt: event.createdAt,
        eventType: event.eventType,
        target: event.target,
        metadata: event.metadata,
      }));

    return {
      rangeDays: safeDays,
      since,
      overview: {
        totalEvents,
        activeUsers,
        screenViews,
        clicks,
        sessionsStarted,
        sessionsEnded,
        avgSessionSeconds,
      },
      eventsByType,
      topScreens,
      topClicks,
      eventsTimeline,
      recentEvents,
    };
  }
}
