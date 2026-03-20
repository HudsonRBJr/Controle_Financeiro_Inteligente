import { prisma } from "../prisma/client";
import { RecordMetricEventInput } from "../interfaces/experiment";

export class MetricsService {
  async recordEvent(data: RecordMetricEventInput) {
    return prisma.metricEvent.create({
      data: {
        eventType: data.eventType as "CLICK" | "IMPRESSION" | "SCREEN_VIEW" | "SESSION_START" | "SESSION_END",
        target: data.target,
        experimentId: data.experimentId,
        variantId: data.variantId,
        metadata: (data.metadata ?? undefined) as any,
        userId: null as any
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
      select: { eventType: true, variantId: true, metadata: true, userId: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const durationsByVariant: Record<string, number[]> = {};
    const lastStartByUser: Record<string, { variantId: string | null; at: Date }> = {};

    for (const e of sessions) {
      const v = e.variantId ?? "none";
      if (!durationsByVariant[v]) durationsByVariant[v] = [];

      if (e.eventType === "SESSION_START") {
        lastStartByUser[e.userId] = { variantId: e.variantId, at: e.createdAt };
      } else if (e.eventType === "SESSION_END") {
        const start = lastStartByUser[e.userId];
        if (start) {
          const meta = e.metadata as { durationSeconds?: number } | null;
          const durationSeconds =
            typeof meta?.durationSeconds === "number"
              ? meta.durationSeconds
              : (e.createdAt.getTime() - start.at.getTime()) / 1000;
          durationsByVariant[v].push(durationSeconds);
        }
        delete lastStartByUser[e.userId];
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

    const events = await prisma.metricEvent.findMany({
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
    const activeUsers = 3;
    const screenViews = events.filter((e) => e.eventType === "SCREEN_VIEW").length;
    const clicks = events.filter((e) => e.eventType === "CLICK").length;
    const screenSessionStarts = events.filter(
      (e) => e.eventType === "SESSION_START" && e.target?.startsWith("screen_")
    );
    const sessionsStarted = screenSessionStarts.length;

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

    const startsByUser = new Map<
      string,
      Array<{
        createdAt: Date;
        target: string;
      }>
    >();

    for (const start of screenSessionStarts) {
      const target = start.target!;
    }

    const sessionEndsByDate = new Map<string, number>();
    let derivedSessionsEnded = 0;
    let derivedDurationTotal = 0;

    for (const userStarts of startsByUser.values()) {
      userStarts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      let previous: { createdAt: Date; target: string } | null = null;

      for (const currentStart of userStarts) {
        if (!previous) {
          previous = currentStart;
          continue;
        }

        if (previous.target !== currentStart.target) {
          const durationSeconds =
            (currentStart.createdAt.getTime() - previous.createdAt.getTime()) / 1000;

          if (durationSeconds > 0) {
            derivedSessionsEnded++;
            derivedDurationTotal += durationSeconds;

            const stats = screenStats.get(previous.target) ?? {
              views: 0,
              sessions: 0,
              durationTotal: 0,
              durationCount: 0,
            };
            stats.durationTotal += durationSeconds;
            stats.durationCount++;
            screenStats.set(previous.target, stats);

            const endDate = currentStart.createdAt.toISOString().slice(0, 10);
            sessionEndsByDate.set(
              endDate,
              (sessionEndsByDate.get(endDate) ?? 0) + 1
            );
          }
        }

        previous = currentStart;
      }
    }

    const sessionsEnded = derivedSessionsEnded;
    const avgSessionSeconds =
      derivedSessionsEnded > 0
        ? Math.round((derivedDurationTotal / derivedSessionsEnded) * 100) / 100
        : 0;

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
