import { useEffect } from "react";
import { recordMetricEvent, trackScreenView } from "./metrics";

export function useScreenMetrics(screenTarget: string) {
  useEffect(() => {
    const startedAt = Date.now();

    trackScreenView(screenTarget);
    recordMetricEvent({
      eventType: "SESSION_START",
      target: screenTarget,
      metadata: { scope: "screen", screen: screenTarget },
    }).catch(() => {
      // Telemetria não deve quebrar render da tela.
    });

    return () => {
      const durationSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      recordMetricEvent({
        eventType: "SESSION_END",
        target: screenTarget,
        metadata: {
          scope: "screen",
          screen: screenTarget,
          durationSeconds,
        },
      }).catch(() => {
        // Telemetria não deve quebrar unmount da tela.
      });
    };
  }, [screenTarget]);
}
