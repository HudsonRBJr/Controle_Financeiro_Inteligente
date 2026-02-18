import { prisma } from "../prisma/client";
import { RecordMetricEventInput } from "../interfaces/experiment";

export class MetricsService {
  async recordEvent(userId: string, data: RecordMetricEventInput) {
    return prisma.metricEvent.create({
      data: {
        userId,
        eventType: data.eventType as "CLICK" | "IMPRESSION" | "SCREEN_VIEW" | "SESSION_START" | "SESSION_END",
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
}
