import { prisma } from "../prisma/client";
import { RecordMetricEventInput } from "../interfaces/experiment";

export class MetricsService {
  async recordEvent(data: RecordMetricEventInput) {
    return prisma.metricEvent.create({
      data: {
        eventType: data.eventType as
          | "CLICK"
          | "IMPRESSION"
          | "SCREEN_VIEW"
          | "SESSION_START"
          | "SESSION_END",
        target: data.target,
        experimentId: data.experimentId,
        variantId: data.variantId,
        metadata: (data.metadata ?? undefined) as any,
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
      select: { eventType: true, variantId: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const durationsByVariant: Record<string, number[]> = {};
    let lastStart: { variantId: string | null; at: Date } | null = null;

    for (const e of sessions) {
      const v = e.variantId ?? "none";
      if (!durationsByVariant[v]) durationsByVariant[v] = [];

      if (e.eventType === "SESSION_START") {
        lastStart = { variantId: e.variantId, at: e.createdAt };
      } else if (e.eventType === "SESSION_END" && lastStart) {
        const durationSeconds =
          (e.createdAt.getTime() - lastStart.at.getTime()) / 1000;

        if (durationSeconds > 0) {
          durationsByVariant[v].push(durationSeconds);
        }

        lastStart = null;
      }
    }

    return Object.entries(durationsByVariant).map(([variantId, durations]) => {
      const total = durations.reduce((a, b) => a + b, 0);
      const count = durations.length;

      return {
        variantId,
        totalSeconds: Math.round(total * 100) / 100,
        sessionCount: count,
        averageSecondsPerSession:
          count > 0 ? Math.round((total / count) * 100) / 100 : 0,
      };
    });
  }

  async getSummaryByExperiment(experimentId: string) {
    const [ctr, timeInApp] = await Promise.all([
      this.getCtrByExperiment(experimentId),
      this.getTimeInAppByExperiment(experimentId),
    ]);

    const variantIds = new Set([
      ...ctr.map((c) => c.variantId),
      ...timeInApp.map((t) => t.variantId),
    ]);

    return Array.from(variantIds).map((variantId) => {
      const ctrRow = ctr.find((c) => c.variantId === variantId);
      const timeRow = timeInApp.find((t) => t.variantId === variantId);

      return {
        variantId,
        ctr: ctrRow ?? { impressions: 0, clicks: 0, ctr: 0 },
        timeInApp:
          timeRow ?? {
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
    const screenViews = events.filter((e) => e.eventType === "SCREEN_VIEW").length;
    const clicks = events.filter((e) => e.eventType === "CLICK").length;
    const sessionsStarted = events.filter((e) => e.eventType === "SESSION_START").length;

    // timeline básica
    const timelineMap = new Map<string, any>();

    for (const event of events) {
      const date = event.createdAt.toISOString().slice(0, 10);

      const row = timelineMap.get(date) ?? {
        date,
        total: 0,
        screenViews: 0,
        clicks: 0,
        sessionsStarted: 0,
      };

      row.total++;
      if (event.eventType === "SCREEN_VIEW") row.screenViews++;
      if (event.eventType === "CLICK") row.clicks++;
      if (event.eventType === "SESSION_START") row.sessionsStarted++;

      timelineMap.set(date, row);
    }

    const eventsTimeline = Array.from(timelineMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const recentEvents = [...events]
      .reverse()
      .slice(0, 20);

    return {
      rangeDays: safeDays,
      since,
      overview: {
        totalEvents,
        screenViews,
        clicks,
        sessionsStarted,
      },
      eventsTimeline,
      recentEvents,
    };
  }
}