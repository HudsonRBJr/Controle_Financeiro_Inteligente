import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { trackClick } from "../../lib/metrics";
import { useScreenMetrics } from "../../lib/screen-metrics";
import { getTransactions, type Transaction } from "../../lib/transaction";

const CATEGORY_COLORS = [
  "#4CAF50", "#2196F3", "#9C27B0", "#FF9800", "#F44336",
  "#00BCD4", "#E91E63", "#8BC34A", "#FF5722", "#607D8B",
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardScreen() {
  useScreenMetrics("screen_dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = income - expense;
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  const cards = [
    {
      title: "Saldo Total",
      value: `R$ ${balance.toFixed(2)}`,
      icon: "account-balance-wallet" as const,
      iconBg: "#E3F2FD",
    },
    {
      title: "Receitas",
      value: `R$ ${income.toFixed(2)}`,
      icon: "trending-up" as const,
      iconBg: "#E8F5E9",
    },
    {
      title: "Despesas",
      value: `R$ ${expense.toFixed(2)}`,
      icon: "trending-down" as const,
      iconBg: "#FCE4EC",
    },
    {
      title: "Economia",
      value: `${savingsRate.toFixed(1)}%`,
      icon: "savings" as const,
      iconBg: "#F3E5F5",
    },
  ];

  const expenseTransactions = transactions.filter((t) => t.type === "EXPENSE");
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryMap = new Map<string, { label: string; value: number; color: string }>();
  expenseTransactions.forEach((t) => {
    const key = t.category?.id ?? "sem-categoria";
    const label = t.category?.name ?? "Outros";
    const existing = categoryMap.get(key);
    if (existing) {
      existing.value += Number(t.amount);
    } else {
      const colorIndex = categoryMap.size % CATEGORY_COLORS.length;
      categoryMap.set(key, {
        label,
        value: Number(t.amount),
        color: t.category?.color ?? CATEGORY_COLORS[colorIndex],
      });
    }
  });

  const categorias = Array.from(categoryMap.values())
    .map((cat) => ({
      ...cat,
      percent: totalExpense > 0 ? Math.round((cat.value / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5);

  const recentTransactions = transactions.slice(0, 5);

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
          <TouchableOpacity
            style={styles.btnNovaTransacao}
            onPress={() => trackClick("dashboard_nova_transacao_click")}
          >
            <MaterialIcons name="add" size={22} color="#fff" />
            <Text style={styles.btnNovaTransacaoText}>Nova Transação</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1976D2" style={styles.loader} />
        ) : (
          <>
            {/* Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsRow}
            >
              {cards.map((card) => (
                <View key={card.title} style={styles.card}>
                  <View style={[styles.cardIconWrap, { backgroundColor: card.iconBg }]}>
                    <MaterialIcons name={card.icon} size={24} color="#333" />
                  </View>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardValue}>{card.value}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Duas colunas: gráfico + transações */}
            <View style={styles.twoCols}>
              {/* Despesas por categoria */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Despesas por Categoria</Text>
                {categorias.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhuma despesa registrada.</Text>
                ) : (
                  <>
                    <View style={styles.pieContainer}>
                      {categorias.map((cat) => (
                        <View key={cat.label} style={styles.catRow}>
                          <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                          <Text style={styles.catLabel}>{cat.label}</Text>
                          <Text style={styles.catPercent}>{cat.percent}%</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.legendBars}>
                      {categorias.map((cat) => (
                        <View
                          key={cat.label}
                          style={[
                            styles.legendBar,
                            { width: `${cat.percent}%`, backgroundColor: cat.color },
                          ]}
                        />
                      ))}
                    </View>
                  </>
                )}
              </View>

              {/* Transações recentes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Transações Recentes</Text>
                {recentTransactions.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
                ) : (
                  recentTransactions.map((t) => {
                    const isEntrada = t.type === "INCOME";
                    return (
                      <View key={t.id} style={styles.transacaoCard}>
                        <View
                          style={[
                            styles.transacaoIconWrap,
                            isEntrada ? styles.entradaIcon : styles.saidaIcon,
                          ]}
                        >
                          <MaterialIcons
                            name={isEntrada ? "trending-up" : "trending-down"}
                            size={18}
                            color={isEntrada ? "#2E7D32" : "#C62828"}
                          />
                        </View>
                        <View style={styles.transacaoInfo}>
                          <Text style={styles.transacaoNome}>{t.title}</Text>
                          <Text style={styles.transacaoMeta}>
                            {t.category?.name ?? "Sem categoria"} • {formatDate(t.date)}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.transacaoValor,
                            isEntrada ? styles.valorEntrada : styles.valorSaida,
                          ]}
                        >
                          {isEntrada ? "+" : "-"} R$ {Number(t.amount).toFixed(2)}
                        </Text>
                        <TouchableOpacity
                          style={styles.transacaoDelete}
                          onPress={() =>
                            trackClick("dashboard_transacao_delete_click", {
                              transactionId: t.id,
                            })
                          }
                        >
                          <MaterialIcons name="delete-outline" size={20} color="#999" />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          </>
        )}
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
  loader: {
    marginTop: 40,
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
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 12,
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
