import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../../lib/auth";
import { recordMetricEvent } from "../../lib/metrics";
import { useScreenMetrics } from "../../lib/screen-metrics";

export default function SairScreen() {
  const router = useRouter();
  useScreenMetrics("screen_sair");

  useEffect(() => {
    (async () => {
      await recordMetricEvent({
        eventType: "SESSION_END",
        target: "mobile_app",
        metadata: { source: "sair_screen" },
      });
      await auth.logout();
      router.replace("/(auth)/login");
    })();
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1976D2" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
});
