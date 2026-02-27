import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const CARDS = [
  {
    title: "Saldo Total",
    value: "R$ 3500.00",
    icon: "account-balance-wallet" as const,
    iconBg: "#E3F2FD",
    trend: null,
  },
  {
    title: "Receitas",
    value: "R$ 5800.00",
    icon: "trending-up" as const,
    iconBg: "#E8F5E9",
    trend: "+ 12.5%",
    trendUp: true,
  },
  {
    title: "Despesas",
    value: "R$ 2300.00",
    icon: "trending-down" as const,
    iconBg: "#FCE4EC",
    trend: "- 8.2%",
    trendUp: false,
  },
  {
    title: "Economia",
    value: "60.3%",
    icon: "savings" as const,
    iconBg: "#F3E5F5",
    trend: null,
  },
];

const CATEGORIAS = [
  { label: "Moradia", percent: 52, color: "#4CAF50" },
  { label: "Alimentação", percent: 19, color: "#2196F3" },
  { label: "Saúde", percent: 13, color: "#9C27B0" },
  { label: "Lazer", percent: 7, color: "#FF9800" },
  { label: "Transporte", percent: 9, color: "#F44336" },
];

const TRANSACOES = [
  { id: "1", nome: "Salário mensal", categoria: "Salário", data: "04 de fev. de 2026", valor: 5000, tipo: "entrada" as const },
  { id: "2", nome: "Supermercado", categoria: "Alimentação", data: "04 de fev. de 2026", valor: -450, tipo: "saida" as const },
  { id: "3", nome: "Combustível", categoria: "Transporte", data: "07 de fev. de 2026", valor: -200, tipo: "saida" as const },
  { id: "4", nome: "Aluguel", categoria: "Moradia", data: "31 de jan. de 2026", valor: -1200, tipo: "saida" as const },
  { id: "5", nome: "Projeto web", categoria: "Freelance", data: "09 de fev. de 2026", valor: 800, tipo: "entrada" as const },
];

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Título + botão */}
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.dashboardTitle}>Dashboard</Text>
            <Text style={styles.dashboardSubtitle}>Visão geral das suas finanças</Text>
          </View>
          <TouchableOpacity style={styles.btnNovaTransacao}>
            <MaterialIcons name="add" size={22} color="#fff" />
            <Text style={styles.btnNovaTransacaoText}>Nova Transação</Text>
          </TouchableOpacity>
        </View>

        {/* Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}
        >
          {CARDS.map((card) => (
            <View key={card.title} style={styles.card}>
              <View style={[styles.cardIconWrap, { backgroundColor: card.iconBg }]}>
                <MaterialIcons name={card.icon} size={24} color="#333" />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardValue}>{card.value}</Text>
              {card.trend && (
                <View style={styles.trendRow}>
                  <MaterialIcons
                    name={card.trendUp ? "trending-up" : "trending-down"}
                    size={14}
                    color={card.trendUp ? "#2E7D32" : "#C62828"}
                  />
                  <Text style={[styles.trendText, card.trendUp ? styles.trendUp : styles.trendDown]}>
                    {card.trend}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Duas colunas: gráfico + transações */}
        <View style={styles.twoCols}>
          {/* Despesas por categoria */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Despesas por Categoria</Text>
            <View style={styles.pieContainer}>
              {CATEGORIAS.map((cat) => (
                <View key={cat.label} style={styles.catRow}>
                  <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.catLabel}>{cat.label}</Text>
                  <Text style={styles.catPercent}>{cat.percent}%</Text>
                </View>
              ))}
            </View>
            <View style={styles.legendBars}>
              {CATEGORIAS.map((cat) => (
                <View
                  key={cat.label}
                  style={[
                    styles.legendBar,
                    { width: `${cat.percent}%`, backgroundColor: cat.color },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Transações recentes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transações Recentes</Text>
            {TRANSACOES.map((t) => (
              <View key={t.id} style={styles.transacaoCard}>
                <View style={[styles.transacaoIconWrap, t.tipo === "entrada" ? styles.entradaIcon : styles.saidaIcon]}>
                  <MaterialIcons
                    name={t.tipo === "entrada" ? "trending-up" : "trending-down"}
                    size={18}
                    color={t.tipo === "entrada" ? "#2E7D32" : "#C62828"}
                  />
                </View>
                <View style={styles.transacaoInfo}>
                  <Text style={styles.transacaoNome}>{t.nome}</Text>
                  <Text style={styles.transacaoMeta}>{t.categoria} • {t.data}</Text>
                </View>
                <Text style={[styles.transacaoValor, t.tipo === "entrada" ? styles.valorEntrada : styles.valorSaida]}>
                  {t.tipo === "entrada" ? "+" : "-"} R$ {Math.abs(t.valor).toFixed(2)}
                </Text>
                <TouchableOpacity style={styles.transacaoDelete}>
                  <MaterialIcons name="delete-outline" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 96,
  },
  dashboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#263238",
  },
  dashboardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  btnNovaTransacao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1976D2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnNovaTransacaoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#263238",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  trendUp: { color: "#2E7D32" },
  trendDown: { color: "#C62828" },
  twoCols: {
    gap: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#263238",
    marginBottom: 16,
  },
  pieContainer: {
    gap: 10,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  catDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  catLabel: {
    flex: 1,
    fontSize: 14,
    color: "#37474F",
  },
  catPercent: {
    fontSize: 14,
    fontWeight: "600",
    color: "#263238",
  },
  legendBars: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 16,
  },
  legendBar: {
    height: "100%",
  },
  transacaoCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  transacaoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  entradaIcon: { backgroundColor: "#E8F5E9" },
  saidaIcon: { backgroundColor: "#FFEBEE" },
  transacaoInfo: {
    flex: 1,
  },
  transacaoNome: {
    fontSize: 14,
    fontWeight: "600",
    color: "#263238",
  },
  transacaoMeta: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  transacaoValor: {
    fontSize: 14,
    fontWeight: "700",
  },
  valorEntrada: { color: "#2E7D32" },
  valorSaida: { color: "#C62828" },
  transacaoDelete: {
    padding: 4,
  },
});
