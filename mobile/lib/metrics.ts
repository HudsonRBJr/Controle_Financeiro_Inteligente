import { api } from "./api";

export type MetricEventType =
  | "CLICK"
  | "IMPRESSION"
  | "SCREEN_VIEW"
  | "SESSION_START"
  | "SESSION_END";

export type RecordMetricEventInput = {
  eventType: MetricEventType;
  target?: string;
  experimentId?: string;
  variantId?: string;
  metadata?: Record<string, unknown>;
};

export type CtrByVariantItem = {
  variantId: string;
  impressions: number;
  clicks: number;
  ctr: number;
};

export type TimeInAppByVariantItem = {
  variantId: string;
  totalSeconds: number;
  sessionCount: number;
  averageSecondsPerSession: number;
};

export type ExperimentSummaryItem = {
  variantId: string;
  ctr: {
    impressions: number;
    clicks: number;
    ctr: number;
  };
  timeInApp: TimeInAppByVariantItem;
};

export async function recordMetricEvent(data: RecordMetricEventInput) {
  return api.postAuth("/metrics/events", data);
}

export async function getExperimentCtr(experimentId: string) {
  return api.getAuth<{ experimentId: string; byVariant: CtrByVariantItem[] }>(
    `/metrics/experiments/${experimentId}/ctr`
  );
}

export async function getExperimentTimeInApp(experimentId: string) {
  return api.getAuth<{ experimentId: string; byVariant: TimeInAppByVariantItem[] }>(
    `/metrics/experiments/${experimentId}/time-in-app`
  );
}

export async function getExperimentSummary(experimentId: string) {
  return api.getAuth<{ experimentId: string; summary: ExperimentSummaryItem[] }>(
    `/metrics/experiments/${experimentId}/summary`
  );
}

export async function trackScreenView(
  target: string,
  metadata?: Record<string, unknown>
) {
  try {
    await recordMetricEvent({
      eventType: "SCREEN_VIEW",
      target,
      metadata,
    });
  } catch {
    // Telemetria não deve quebrar o fluxo principal da tela.
  }
}

export async function trackClick(
  target: string,
  metadata?: Record<string, unknown>
) {
  try {
    await recordMetricEvent({
      eventType: "CLICK",
      target,
      metadata,
    });
  } catch {
    // Telemetria não deve quebrar o fluxo principal da tela.
  }
}
