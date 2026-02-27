import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../../lib/auth";

export default function SairScreen() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
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
