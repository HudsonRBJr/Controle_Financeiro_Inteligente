import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, type Href } from "expo-router";
import { auth } from "../../lib/auth";
import { recordMetricEvent, trackClick } from "../../lib/metrics";
import { useScreenMetrics } from "../../lib/screen-metrics";

const MENU_OPTIONS = [
  {
    id: "orcamento",
    title: "Orçamento",
    subtitle: "Acompanhe seus gastos por categoria",
    icon: "pie-chart" as const,
    iconBg: "#E3F2FD",
    route: "/(tabs)/orcamento" as Href,
  },
  {
    id: "cartao-credito",
    title: "Cartões de crédito",
    subtitle: "Gerencie faturas e limites",
    icon: "credit-card" as const,
    iconBg: "#FFF3E0",
    route: "/(tabs)/cartao-credito" as Href,
  },
  {
    id: "recorrentes",
    title: "Recorrentes",
    subtitle: "Despesas e receitas fixas",
    icon: "repeat" as const,
    iconBg: "#E8F5E9",
    route: "/(tabs)/recorrentes" as Href,
  },
  {
    id: "relatorios",
    title: "Relatórios",
    subtitle: "Análises e gráficos",
    icon: "assessment" as const,
    iconBg: "#F3E5F5",
    route: "/(tabs)/relatorios" as Href,
  },
  {
    id: "categorias",
    title: "Categorias",
    subtitle: "Organize suas categorias",
    icon: "category" as const,
    iconBg: "#E0F7FA",
    route: "/(tabs)/categorias" as Href,
  },
];

export default function MaisScreen() {
  const router = useRouter();
  useScreenMetrics("screen_mais");

  const handleLogout = () => {
    trackClick("mais_open_logout_confirm");
    Alert.alert(
      "Sair",
      "Deseja realmente sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await recordMetricEvent({
              eventType: "SESSION_END",
              target: "mobile_app",
              metadata: { source: "mais_logout" },
            });
            await auth.logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mais</Text>
        <Text style={styles.headerSubtitle}>
          Outras ferramentas do seu controle financeiro
        </Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MENU_OPTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.optionCard}
            activeOpacity={0.7}
            onPress={() => {
              trackClick("mais_menu_navigation_click", { menuId: item.id });
              router.push(item.route);
            }}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
              <MaterialIcons
                name={item.icon}
                size={24}
                color="#1976D2"
              />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{item.title}</Text>
              <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.optionCard, styles.logoutCard]}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <View style={[styles.iconWrap, { backgroundColor: "#FFEBEE" }]}>
            <MaterialIcons name="logout" size={24} color="#C62828" />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.logoutTitle}>Sair da conta</Text>
            <Text style={styles.optionSubtitle}>Encerrar sessão</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  logoutCard: {
    marginTop: 8,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#C62828",
  },
});
