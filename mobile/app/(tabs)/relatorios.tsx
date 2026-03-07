import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getExperimentCtr,
  getExperimentSummary,
  getExperimentTimeInApp,
  trackClick,
  type ExperimentSummaryItem,
} from "../../lib/metrics";
import { useScreenMetrics } from "../../lib/screen-metrics";

const TENDENCIA_MENSAL = [
  { mes: "Jan.", receitas: 5500, despesas: 1500 },
  { mes: "Fev.", receitas: 2800, despesas: 1200 },
];
const TENDENCIA_MAX = 6000;

const DESPESAS_CATEGORIA = [
  { label: "Alimentação", valor: 400, color: "#2196F3" },
  { label: "Transporte", valor: 250, color: "#F44336" },
  { label: "Moradia", valor: 1200, color: "#4CAF50" },
  { label: "Lazer", valor: 150, color: "#FF9800" },
  { label: "Saúde", valor: 300, color: "#9C27B0" },
];
const BARRAS_MAX = 1200;
const BARRAS_ALTURA = 80;

const DISTRIBUICAO = [
  { label: "Moradia", percent: 52, color: "#4CAF50" },
  { label: "Alimentação", percent: 20, color: "#2196F3" },
  { label: "Saúde", percent: 13, color: "#9C27B0" },
  { label: "Transporte", percent: 9, color: "#F44336" },
  { label: "Lazer", percent: 7, color: "#FF9800" },
];

const MAIORES_DESPESAS = [
  { id: "1", nome: "Aluguel", categoria: "Moradia", data: "31/01/2026", valor: 1200 },
  { id: "2", nome: "Supermercado", categoria: "Alimentação", data: "04/02/2026", valor: 450 },
  { id: "3", nome: "Plano de saúde", categoria: "Saúde", data: "14/02/2026", valor: 300 },
  { id: "4", nome: "Combustível", categoria: "Transporte", data: "07/02/2026", valor: 200 },
  { id: "5", nome: "Cinema e restaurante", categoria: "Lazer", data: "11/02/2026", valor: 150 },
];

export default function RelatoriosScreen() {
  useScreenMetrics("screen_relatorios");
  const [experimentId, setExperimentId] = useState("");
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState("");
  const [summary, setSummary] = useState<ExperimentSummaryItem[]>([]);
  const [totals, setTotals] = useState({
    impressions: 0,
    clicks: 0,
    sessions: 0,
  });

  const handleLoadMetrics = async () => {
    const id = experimentId.trim();
    if (!id) {
      setMetricsError("Informe o ID do experimento.");
      return;
    }

    setMetricsError("");
    setMetricsLoading(true);
    trackClick("relatorios_load_metrics_click", { experimentId: id });
    try {
      const [ctrRes, timeRes, summaryRes] = await Promise.all([
        getExperimentCtr(id),
        getExperimentTimeInApp(id),
        getExperimentSummary(id),
      ]);

      setSummary(summaryRes.summary);
      setTotals({
        impressions: ctrRes.byVariant.reduce((acc, item) => acc + item.impressions, 0),
        clicks: ctrRes.byVariant.reduce((acc, item) => acc + item.clicks, 0),
        sessions: timeRes.byVariant.reduce((acc, item) => acc + item.sessionCount, 0),
      });
    } catch (e) {
      setSummary([]);
      setTotals({ impressions: 0, clicks: 0, sessions: 0 });
      setMetricsError(
        e instanceof Error ? e.message : "Erro ao carregar métricas do experimento."
      );
    } finally {
      setMetricsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Relatórios</Text>
            <Text style={styles.subtitle}>Análise detalhada das suas finanças</Text>
          </View>
        </View>

        {/* Tendência Mensal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tendência Mensal</Text>
          <View style={styles.tendenciaChart}>
            {TENDENCIA_MENSAL.map((item) => (
              <View key={item.mes} style={styles.tendenciaCol}>
                <View style={styles.tendenciaBars}>
                  <View
                    style={[
                      styles.tendenciaBarReceitas,
                      { height: (item.receitas / TENDENCIA_MAX) * 100 },
                    ]}
                  />
                  <View
                    style={[
                      styles.tendenciaBarDespesas,
                      { height: (item.despesas / TENDENCIA_MAX) * 100 },
                    ]}
                  />
                </View>
                <Text style={styles.tendenciaLabel}>{item.mes}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendQuad, { backgroundColor: "#C62828" }]} />
              <Text style={styles.legendText}>Despesas</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendQuad, { backgroundColor: "#2E7D32" }]} />
              <Text style={styles.legendText}>Receitas</Text>
            </View>
          </View>
        </View>

        {/* Duas colunas: Despesas por Categoria + Distribuição */}
        <View style={styles.twoCols}>
          {/* Despesas por Categoria (barras verticais) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Despesas por Categoria</Text>
            <View style={styles.barrasContainer}>
              {DESPESAS_CATEGORIA.map((cat) => (
                <View key={cat.label} style={styles.barraRow}>
                  <View style={styles.barraTrack}>
                    <View
                      style={[
                        styles.barraFill,
                        {
                          height: `${(cat.valor / BARRAS_MAX) * 100}%`,
                          backgroundColor: cat.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barraLabel} numberOfLines={1}>{cat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Distribuição de Gastos */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Distribuição de Gastos</Text>
            <View style={styles.distribuicaoList}>
              {DISTRIBUICAO.map((cat) => (
                <View key={cat.label} style={styles.distRow}>
                  <View style={[styles.distDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.distLabel}>{cat.label} {cat.percent}%</Text>
                </View>
              ))}
            </View>
            <View style={styles.legendBars}>
              {DISTRIBUICAO.map((cat) => (
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
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Métricas de Experimento (A/B)</Text>
          <Text style={styles.metricsHint}>
            Consulte os endpoints de métricas por ID do experimento.
          </Text>
          <TextInput
            style={styles.metricsInput}
            placeholder="ID do experimento"
            placeholderTextColor="#999"
            value={experimentId}
            onChangeText={setExperimentId}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.metricsButton}
            onPress={handleLoadMetrics}
            disabled={metricsLoading}
          >
            {metricsLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.metricsButtonText}>Carregar métricas</Text>
            )}
          </TouchableOpacity>
          {metricsError ? (
            <Text style={styles.metricsError}>{metricsError}</Text>
          ) : null}
          {summary.length > 0 ? (
            <View style={styles.metricsSummaryWrap}>
              <Text style={styles.metricsTotals}>
                Impressões: {totals.impressions} • Cliques: {totals.clicks} • Sessões:{" "}
                {totals.sessions}
              </Text>
              {summary.map((item) => (
                <View key={item.variantId} style={styles.metricsVariantCard}>
                  <Text style={styles.metricsVariantTitle}>
                    Variante: {item.variantId}
                  </Text>
                  <Text style={styles.metricsVariantText}>
                    CTR: {(item.ctr.ctr * 100).toFixed(2)}% ({item.ctr.clicks}/
                    {item.ctr.impressions})
                  </Text>
                  <Text style={styles.metricsVariantText}>
                    Tempo médio por sessão:{" "}
                    {item.timeInApp.averageSecondsPerSession.toFixed(2)}s
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Maiores Despesas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Maiores Despesas</Text>
          {MAIORES_DESPESAS.map((item, index) => (
            <View key={item.id} style={styles.maiorRow}>
              <View style={styles.maiorBadge}>
                <Text style={styles.maiorBadgeText}>{index + 1}</Text>
              </View>
              <View style={styles.maiorInfo}>
                <Text style={styles.maiorNome}>{item.nome}</Text>
                <Text style={styles.maiorMeta}>{item.categoria} - {item.data}</Text>
              </View>
              <Text style={styles.maiorValor}>R$ {item.valor.toFixed(2)}</Text>
            </View>
          ))}
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#263238",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  card: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#263238",
    marginBottom: 16,
  },
  tendenciaChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
    marginBottom: 12,
  },
  tendenciaCol: {
    alignItems: "center",
    flex: 1,
  },
  tendenciaBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    height: 100,
  },
  tendenciaBarReceitas: {
    width: 14,
    backgroundColor: "#2E7D32",
    borderRadius: 4,
    minHeight: 4,
  },
  tendenciaBarDespesas: {
    width: 14,
    backgroundColor: "#C62828",
    borderRadius: 4,
    minHeight: 4,
  },
  tendenciaLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendQuad: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: "#546E7A",
  },
  twoCols: {
    gap: 16,
  },
  barrasContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: BARRAS_ALTURA + 28,
  },
  barraRow: {
    flex: 1,
    alignItems: "center",
  },
  barraTrack: {
    width: 24,
    height: BARRAS_ALTURA,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barraFill: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  barraLabel: {
    fontSize: 10,
    color: "#546E7A",
    marginTop: 6,
    textAlign: "center",
  },
  distribuicaoList: {
    gap: 8,
  },
  distRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  distDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  distLabel: {
    fontSize: 13,
    color: "#37474F",
  },
  legendBars: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 12,
  },
  legendBar: {
    height: "100%",
  },
  maiorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  maiorBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  maiorBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#263238",
  },
  maiorInfo: {
    flex: 1,
    minWidth: 0,
  },
  maiorNome: {
    fontSize: 15,
    fontWeight: "600",
    color: "#263238",
  },
  maiorMeta: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  maiorValor: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C62828",
  },
  metricsHint: {
    fontSize: 13,
    color: "#546E7A",
    marginBottom: 10,
  },
  metricsInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#263238",
    marginBottom: 10,
  },
  metricsButton: {
    backgroundColor: "#1976D2",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  metricsButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  metricsError: {
    fontSize: 13,
    color: "#C62828",
    marginBottom: 8,
  },
  metricsSummaryWrap: {
    marginTop: 6,
    gap: 8,
  },
  metricsTotals: {
    fontSize: 13,
    color: "#37474F",
    fontWeight: "600",
  },
  metricsVariantCard: {
    backgroundColor: "#F7F9FC",
    borderRadius: 8,
    padding: 10,
  },
  metricsVariantTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#263238",
    marginBottom: 4,
  },
  metricsVariantText: {
    fontSize: 12,
    color: "#546E7A",
  },
});
