import { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { trackClick } from "../../lib/metrics";
import { useScreenMetrics } from "../../lib/screen-metrics";
import {
  getTransactions,
  deleteTransaction,
  type Transaction,
} from "../../lib/transaction";
import { getAccounts, type Account } from "../../lib/account";

const BAR_HEIGHT = 100;
const CATEGORY_COLORS = [
  "#4CAF50", "#2196F3", "#9C27B0", "#FF9800", "#F44336",
  "#00BCD4", "#E91E63", "#8BC34A", "#FF5722", "#607D8B",
];

function fmt(value: number) {
  return Math.abs(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardScreen() {
  useScreenMetrics("screen_dashboard");
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [txData, accData] = await Promise.all([
        getTransactions(),
        getAccounts().catch(() => [] as Account[]),
      ]);
      setTransactions(txData);
      setAccounts(accData);
    } catch {
      setTransactions([]);
      setAccounts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  // ── Computed stats ───────────────────────────────────────────
  const income = useMemo(
    () => transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + Number(t.amount), 0),
    [transactions]
  );
  const expense = useMemo(
    () => transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0),
    [transactions]
  );
  const balance = income - expense;
  const savingsRate = income > 0 ? Math.max(0, ((income - expense) / income) * 100) : 0;
  const totalAccountBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);

  // ── Monthly trend (last 6 months) ────────────────────────────
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = cap(
        d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")
      );
      return { key: monthKey(d), label, income: 0, expense: 0, isCurrent: i === 5 };
    });
    transactions.forEach(t => {
      const key = monthKey(new Date(t.date));
      const entry = months.find(m => m.key === key);
      if (!entry) return;
      if (t.type === "INCOME") entry.income += Number(t.amount);
      if (t.type === "EXPENSE") entry.expense += Number(t.amount);
    });
    return months;
  }, [transactions]);

  const monthlyMax = Math.max(...monthlyData.flatMap(m => [m.income, m.expense]), 1);

  // ── Category breakdown (expenses) ───────────────────────────
  const { categories, totalCatExpense } = useMemo(() => {
    const expenseTxs = transactions.filter(t => t.type === "EXPENSE");
    const total = expenseTxs.reduce((s, t) => s + Number(t.amount), 0);
    const map = new Map<string, { label: string; value: number; color: string }>();
    expenseTxs.forEach(t => {
      const key = t.category?.id ?? "__none";
      const existing = map.get(key);
      if (existing) {
        existing.value += Number(t.amount);
      } else {
        const idx = map.size % CATEGORY_COLORS.length;
        map.set(key, {
          label: t.category?.name ?? "Outros",
          value: Number(t.amount),
          color: t.category?.color ?? CATEGORY_COLORS[idx],
        });
      }
    });
    const cats = Array.from(map.values())
      .map(c => ({ ...c, percent: total > 0 ? (c.value / total) * 100 : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    return { categories: cats, totalCatExpense: total };
  }, [transactions]);

  const savingsInfo = useMemo(() => {
    if (savingsRate >= 30) return { label: "Excelente", color: "#2E7D32" };
    if (savingsRate >= 20) return { label: "Muito bom", color: "#558B2F" };
    if (savingsRate >= 10) return { label: "Bom", color: "#F57C00" };
    if (savingsRate > 0) return { label: "Atenção", color: "#E65100" };
    return { label: expense > 0 ? "Déficit" : "—", color: "#B71C1C" };
  }, [savingsRate, expense]);

  const recent = transactions.slice(0, 6);
  const nowLabel = cap(
    new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  );

  const handleDelete = async (id: string) => {
    trackClick("dashboard_delete_tx", { transactionId: id });
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch {}
  };

  return (
    <SafeAreaView style={s.safeArea} edges={["top"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1976D2" />
        }
      >
        {/* ── Top bar ───────────────────────────────────────── */}
        <View style={s.topBar}>
          <View>
            <Text style={s.topTitle}>Dashboard</Text>
            <Text style={s.topSub}>{nowLabel}</Text>
          </View>
          <TouchableOpacity
            style={s.btnNova}
            onPress={() => {
              trackClick("dashboard_nova_transacao_click");
              router.push("/(tabs)/transacoes");
            }}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={s.btnNovaText}>Nova</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1976D2" style={s.loader} />
        ) : (
          <>
            {/* ── Hero card ─────────────────────────────────── */}
            <View style={s.hero}>
              {/* Decorative circles */}
              <View style={s.heroCircle1} />
              <View style={s.heroCircle2} />

              <Text style={s.heroLabel}>Saldo total</Text>
              <Text style={[s.heroBalance, balance < 0 && s.heroBalanceNeg]}>
                {balance < 0 ? "−" : ""} R$ {fmt(Math.abs(balance))}
              </Text>

              {accounts.length > 0 && (
                <View style={s.heroAccountRow}>
                  <MaterialIcons name="account-balance" size={13} color="rgba(255,255,255,0.65)" />
                  <Text style={s.heroAccountText}>
                    Contas bancárias: R$ {fmt(totalAccountBalance)}
                  </Text>
                </View>
              )}

              {/* Comparison bar */}
              {(income + expense) > 0 && (
                <View style={s.heroBar}>
                  <View style={[s.heroBarIncome, { flex: income }]} />
                  <View style={[s.heroBarExpense, { flex: expense }]} />
                </View>
              )}

              {/* Income / Expense chips */}
              <View style={s.heroChips}>
                <View style={s.heroChip}>
                  <MaterialIcons name="trending-up" size={14} color="#A5D6A7" />
                  <Text style={s.heroChipLbl}>Receitas</Text>
                  <Text style={s.heroChipVal}>R$ {fmt(income)}</Text>
                </View>
                <View style={s.heroChipLine} />
                <View style={s.heroChip}>
                  <MaterialIcons name="trending-down" size={14} color="#EF9A9A" />
                  <Text style={s.heroChipLbl}>Despesas</Text>
                  <Text style={s.heroChipVal}>R$ {fmt(expense)}</Text>
                </View>
                <View style={s.heroChipLine} />
                <View style={s.heroChip}>
                  <MaterialIcons name="receipt-long" size={14} color="rgba(255,255,255,0.65)" />
                  <Text style={s.heroChipLbl}>Transações</Text>
                  <Text style={s.heroChipVal}>{transactions.length}</Text>
                </View>
              </View>
            </View>

            {/* ── Savings rate ──────────────────────────────── */}
            {income > 0 && (
              <View style={s.savingsCard}>
                <View style={s.savingsTop}>
                  <View>
                    <Text style={s.savingsTitle}>Taxa de Economia</Text>
                    <Text style={[s.savingsStatus, { color: savingsInfo.color }]}>
                      {savingsInfo.label}
                    </Text>
                  </View>
                  <Text style={[s.savingsPct, { color: savingsInfo.color }]}>
                    {savingsRate.toFixed(1)}%
                  </Text>
                </View>
                <View style={s.savingsTrack}>
                  <View
                    style={[
                      s.savingsFill,
                      {
                        width: `${Math.min(savingsRate, 100)}%`,
                        backgroundColor: savingsInfo.color,
                      },
                    ]}
                  />
                </View>
                <View style={s.savingsLegend}>
                  <Text style={s.savingsLegendTxt}>0%</Text>
                  <Text style={s.savingsLegendTxt}>25%</Text>
                  <Text style={s.savingsLegendTxt}>50%+</Text>
                </View>
              </View>
            )}

            {/* ── Accounts quick card ───────────────────────── */}
            {accounts.length > 0 && (
              <TouchableOpacity
                style={s.accountsCard}
                onPress={() => router.push("/(tabs)/contas")}
                activeOpacity={0.8}
              >
                <View style={s.accountsLeft}>
                  <View style={s.accountsIcon}>
                    <MaterialIcons name="account-balance" size={20} color="#1976D2" />
                  </View>
                  <View>
                    <Text style={s.accountsTitle}>
                      {accounts.length} conta{accounts.length > 1 ? "s" : ""}
                    </Text>
                    <Text style={s.accountsSub}>
                      R$ {fmt(totalAccountBalance)} no total
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#90A4AE" />
              </TouchableOpacity>
            )}

            {/* ── Monthly bar chart ─────────────────────────── */}
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitle}>Tendência Mensal</Text>
                <View style={s.legendRow}>
                  <View style={[s.legendDot, { backgroundColor: "#43A047" }]} />
                  <Text style={s.legendTxt}>Receita</Text>
                  <View style={[s.legendDot, { backgroundColor: "#E53935" }]} />
                  <Text style={s.legendTxt}>Despesa</Text>
                </View>
              </View>

              <View style={s.chartWrap}>
                {/* Horizontal gridlines */}
                {[0.25, 0.5, 0.75, 1].map(frac => (
                  <View
                    key={frac}
                    style={[
                      s.gridLine,
                      { bottom: frac * BAR_HEIGHT },
                    ]}
                  />
                ))}

                {/* Bars */}
                <View style={s.chartBars}>
                  {monthlyData.map(month => {
                    const ih = (month.income / monthlyMax) * BAR_HEIGHT;
                    const eh = (month.expense / monthlyMax) * BAR_HEIGHT;
                    return (
                      <View key={month.key} style={s.barGroup}>
                        <View style={s.barPair}>
                          <View
                            style={[
                              s.bar,
                              s.barI,
                              { height: month.income > 0 ? Math.max(ih, 4) : 0 },
                            ]}
                          />
                          <View
                            style={[
                              s.bar,
                              s.barE,
                              { height: month.expense > 0 ? Math.max(eh, 4) : 0 },
                            ]}
                          />
                        </View>
                        <Text
                          style={[s.barLbl, month.isCurrent && s.barLblActive]}
                        >
                          {month.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* ── Category breakdown ────────────────────────── */}
            {categories.length > 0 && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Despesas por Categoria</Text>

                {/* Segmented bar */}
                <View style={s.segBar}>
                  {categories.map(cat => (
                    <View
                      key={cat.label}
                      style={{
                        flex: cat.percent,
                        height: "100%",
                        backgroundColor: cat.color,
                      }}
                    />
                  ))}
                  {categories.reduce((s, c) => s + c.percent, 0) < 100 && (
                    <View
                      style={{
                        flex: 100 - categories.reduce((sum, c) => sum + c.percent, 0),
                        height: "100%",
                        backgroundColor: "#E0E0E0",
                      }}
                    />
                  )}
                </View>

                {/* Total */}
                <Text style={s.catTotal}>
                  Total: R$ {fmt(totalCatExpense)}
                </Text>

                {/* Category rows */}
                <View style={s.catList}>
                  {categories.map(cat => (
                    <View key={cat.label} style={s.catRow}>
                      <View style={[s.catDot, { backgroundColor: cat.color }]} />
                      <Text style={s.catName} numberOfLines={1}>{cat.label}</Text>
                      <View style={s.catBarWrap}>
                        <View
                          style={[
                            s.catBarFill,
                            {
                              width: `${cat.percent}%`,
                              backgroundColor: cat.color + "99",
                            },
                          ]}
                        />
                      </View>
                      <View style={s.catMeta}>
                        <Text style={s.catAmt}>R$ {fmt(cat.value)}</Text>
                        <Text style={[s.catPct, { color: cat.color }]}>
                          {Math.round(cat.percent)}%
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ── Income vs Expense visual ──────────────────── */}
            {(income > 0 || expense > 0) && (
              <View style={s.compareCard}>
                <Text style={s.cardTitle}>Receitas vs Despesas</Text>
                <View style={s.compareRow}>
                  {/* Income */}
                  <View style={s.compareSide}>
                    <Text style={s.compareLabel}>Receitas</Text>
                    <View style={s.compareBarWrap}>
                      <View
                        style={[
                          s.compareBarFill,
                          {
                            height: `${income > 0 ? Math.max((income / Math.max(income, expense)) * 100, 10) : 0}%`,
                            backgroundColor: "#43A047",
                          },
                        ]}
                      />
                    </View>
                    <Text style={[s.compareAmount, { color: "#2E7D32" }]}>
                      R$ {fmt(income)}
                    </Text>
                  </View>

                  {/* Center divider */}
                  <View style={s.compareDivider}>
                    <Text style={s.compareDiff}>
                      {balance >= 0 ? "+" : ""}
                      {balance.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                    </Text>
                    <Text style={s.compareDiffSub}>saldo</Text>
                  </View>

                  {/* Expense */}
                  <View style={s.compareSide}>
                    <Text style={s.compareLabel}>Despesas</Text>
                    <View style={s.compareBarWrap}>
                      <View
                        style={[
                          s.compareBarFill,
                          {
                            height: `${expense > 0 ? Math.max((expense / Math.max(income, expense)) * 100, 10) : 0}%`,
                            backgroundColor: "#E53935",
                          },
                        ]}
                      />
                    </View>
                    <Text style={[s.compareAmount, { color: "#C62828" }]}>
                      R$ {fmt(expense)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── Recent transactions ───────────────────────── */}
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitle}>Transações Recentes</Text>
                <TouchableOpacity
                  onPress={() => {
                    trackClick("dashboard_ver_todas_click");
                    router.push("/(tabs)/transacoes");
                  }}
                >
                  <Text style={s.verTodas}>Ver todas →</Text>
                </TouchableOpacity>
              </View>

              {recent.length === 0 ? (
                <View style={s.emptyWrap}>
                  <MaterialIcons name="receipt-long" size={44} color="#B0BEC5" />
                  <Text style={s.emptyText}>Nenhuma transação ainda.</Text>
                  <TouchableOpacity
                    style={s.emptyBtn}
                    onPress={() => router.push("/(tabs)/transacoes")}
                  >
                    <Text style={s.emptyBtnText}>+ Adicionar transação</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                recent.map((t, idx) => {
                  const isIn = t.type === "INCOME";
                  return (
                    <View
                      key={t.id}
                      style={[s.txRow, idx < recent.length - 1 && s.txDivider]}
                    >
                      <View style={[s.txIcon, isIn ? s.txIconIn : s.txIconOut]}>
                        <MaterialIcons
                          name={isIn ? "trending-up" : "trending-down"}
                          size={16}
                          color={isIn ? "#2E7D32" : "#C62828"}
                        />
                      </View>
                      <View style={s.txInfo}>
                        <Text style={s.txTitle} numberOfLines={1}>{t.title}</Text>
                        <Text style={s.txMeta}>
                          {t.category?.name ?? "Sem cat."} •{" "}
                          {new Date(t.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </Text>
                      </View>
                      <Text style={[s.txAmt, isIn ? s.txIn : s.txOut]}>
                        {isIn ? "+" : "−"} R$ {fmt(Number(t.amount))}
                      </Text>
                      <TouchableOpacity
                        style={s.txDel}
                        onPress={() => handleDelete(t.id)}
                      >
                        <MaterialIcons name="delete-outline" size={18} color="#BDBDBD" />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F0F4F8" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 100 },
  loader: { marginTop: 60 },

  // ── Top bar ─────────────────────────────────────────────────
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 8,
    paddingBottom: 16,
  },
  topTitle: { fontSize: 26, fontWeight: "800", color: "#1A237E" },
  topSub: { fontSize: 13, color: "#78909C", marginTop: 2 },
  btnNova: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1976D2",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  btnNovaText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // ── Hero card ────────────────────────────────────────────────
  hero: {
    backgroundColor: "#1565C0",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  heroCircle1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -60,
    right: -50,
  },
  heroCircle2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: -30,
    left: -20,
  },
  heroLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
    fontWeight: "500",
  },
  heroBalance: {
    fontSize: 38,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroBalanceNeg: { color: "#EF9A9A" },
  heroAccountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 16,
  },
  heroAccountText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },
  heroBar: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  heroBarIncome: { backgroundColor: "#66BB6A" },
  heroBarExpense: { backgroundColor: "#EF5350" },
  heroChips: {
    flexDirection: "row",
    gap: 0,
  },
  heroChip: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  heroChipLine: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 4,
  },
  heroChipLbl: { fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: "500" },
  heroChipVal: { fontSize: 13, color: "#fff", fontWeight: "700" },

  // ── Savings card ─────────────────────────────────────────────
  savingsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  savingsTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  savingsTitle: { fontSize: 15, fontWeight: "700", color: "#263238" },
  savingsStatus: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  savingsPct: { fontSize: 28, fontWeight: "800" },
  savingsTrack: {
    height: 10,
    backgroundColor: "#ECEFF1",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 6,
  },
  savingsFill: { height: "100%", borderRadius: 5 },
  savingsLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  savingsLegendTxt: { fontSize: 10, color: "#90A4AE" },

  // ── Accounts quick card ───────────────────────────────────────
  accountsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accountsLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  accountsIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  accountsTitle: { fontSize: 15, fontWeight: "600", color: "#263238" },
  accountsSub: { fontSize: 12, color: "#78909C", marginTop: 2 },

  // ── Generic card ─────────────────────────────────────────────
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#263238" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontSize: 11, color: "#78909C" },

  // ── Bar chart ─────────────────────────────────────────────────
  chartWrap: {
    height: BAR_HEIGHT + 24,
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  chartBars: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    height: BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
    height: BAR_HEIGHT + 24,
    justifyContent: "flex-end",
  },
  barPair: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: BAR_HEIGHT,
  },
  bar: { width: 11, borderRadius: 4 },
  barI: { backgroundColor: "#43A047" },
  barE: { backgroundColor: "#E53935" },
  barLbl: { fontSize: 11, color: "#90A4AE", marginTop: 6 },
  barLblActive: { color: "#1976D2", fontWeight: "700" },

  // ── Category breakdown ───────────────────────────────────────
  segBar: {
    flexDirection: "row",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  catTotal: {
    fontSize: 12,
    color: "#90A4AE",
    marginBottom: 12,
    textAlign: "right",
  },
  catList: { gap: 10 },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  catDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  catName: { fontSize: 13, color: "#37474F", width: 80, flexShrink: 0 },
  catBarWrap: {
    flex: 1,
    height: 7,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  catBarFill: { height: "100%", borderRadius: 4 },
  catMeta: { flexDirection: "row", gap: 6, alignItems: "center" },
  catAmt: { fontSize: 12, color: "#546E7A", fontWeight: "500", width: 70, textAlign: "right" },
  catPct: { fontSize: 12, fontWeight: "700", width: 32, textAlign: "right" },

  // ── Compare card ─────────────────────────────────────────────
  compareCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  compareRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 12,
    height: 120,
    gap: 8,
  },
  compareSide: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
    gap: 6,
  },
  compareLabel: { fontSize: 12, color: "#78909C", fontWeight: "600" },
  compareBarWrap: {
    width: "60%",
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  compareBarFill: { width: "100%", borderRadius: 8 },
  compareAmount: { fontSize: 13, fontWeight: "700" },
  compareDivider: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingBottom: 24,
  },
  compareDiff: { fontSize: 16, fontWeight: "800", color: "#263238" },
  compareDiffSub: { fontSize: 10, color: "#90A4AE" },

  // ── Recent transactions ───────────────────────────────────────
  verTodas: { fontSize: 13, color: "#1976D2", fontWeight: "600" },
  emptyWrap: { alignItems: "center", paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 14, color: "#90A4AE" },
  emptyBtn: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  emptyBtnText: { fontSize: 13, color: "#1976D2", fontWeight: "600" },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  txDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  txIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  txIconIn: { backgroundColor: "#E8F5E9" },
  txIconOut: { backgroundColor: "#FFEBEE" },
  txInfo: { flex: 1, minWidth: 0 },
  txTitle: { fontSize: 14, fontWeight: "600", color: "#263238" },
  txMeta: { fontSize: 11, color: "#90A4AE", marginTop: 2 },
  txAmt: { fontSize: 13, fontWeight: "700", flexShrink: 0 },
  txIn: { color: "#2E7D32" },
  txOut: { color: "#C62828" },
  txDel: { padding: 4, flexShrink: 0 },
});
