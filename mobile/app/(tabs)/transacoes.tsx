import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { trackClick } from "../../lib/metrics";
import { useScreenMetrics } from "../../lib/screen-metrics";
import { getTransactions, deleteTransaction, type Transaction } from "../../lib/transaction";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type FilterType = "all" | "entrada" | "saida";

export default function TransacoesScreen() {
  useScreenMetrics("screen_transacoes");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

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

  const handleDelete = async (id: string) => {
    trackClick("transacoes_delete_click", { transactionId: id });
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch {}
  };

  const cycleFilter = () => {
    trackClick("transacoes_open_filter_click");
    setFilter((f) => (f === "all" ? "entrada" : f === "entrada" ? "saida" : "all"));
  };

  const filterLabel: Record<FilterType, string> = {
    all: "Todas",
    entrada: "Entradas",
    saida: "Saídas",
  };

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.category?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "entrada" && t.type === "INCOME") ||
      (filter === "saida" && t.type === "EXPENSE");
    return matchSearch && matchFilter;
  });

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
            <Text style={styles.title}>Transações</Text>
            <Text style={styles.subtitle}>Gerencie todas as suas transações</Text>
          </View>
          <TouchableOpacity
            style={styles.btnNovaTransacao}
            onPress={() => trackClick("transacoes_nova_transacao_click")}
          >
            <MaterialIcons name="add" size={22} color="#fff" />
            <Text style={styles.btnNovaTransacaoText}>Nova Transação</Text>
          </TouchableOpacity>
        </View>

        {/* Busca + Filtro */}
        <View style={styles.buscaRow}>
          <View style={styles.searchWrap}>
            <MaterialIcons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar transações..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterWrap} onPress={cycleFilter}>
            <MaterialIcons name="filter-list" size={20} color="#666" />
            <Text style={styles.filterText}>{filterLabel[filter]}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Lista de transações */}
        {loading ? (
          <ActivityIndicator size="large" color="#1976D2" style={styles.loader} />
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
        ) : (
          <View style={styles.lista}>
            {filtered.map((t) => {
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
                      size={20}
                      color={isEntrada ? "#2E7D32" : "#C62828"}
                    />
                  </View>
                  <View style={styles.transacaoInfo}>
                    <View style={styles.transacaoNomeRow}>
                      <Text style={styles.transacaoNome} numberOfLines={1}>
                        {t.title}
                      </Text>
                      {t.category && (
                        <View style={styles.categoriaPill}>
                          <Text style={styles.categoriaPillText}>{t.category.name}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.transacaoData}>{formatDate(t.date)}</Text>
                  </View>
                  <View style={styles.transacaoRight}>
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
                      onPress={() => handleDelete(t.id)}
                    >
                      <MaterialIcons name="delete-outline" size={20} color="#999" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
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
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  buscaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#263238",
    padding: 0,
  },
  filterWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    color: "#263238",
    fontWeight: "500",
  },
  lista: {
    gap: 12,
  },
  transacaoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  transacaoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  entradaIcon: { backgroundColor: "#E8F5E9" },
  saidaIcon: { backgroundColor: "#FFEBEE" },
  transacaoInfo: {
    flex: 1,
    minWidth: 0,
  },
  transacaoNomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  transacaoNome: {
    fontSize: 15,
    fontWeight: "600",
    color: "#263238",
    flexShrink: 1,
  },
  categoriaPill: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoriaPillText: {
    fontSize: 11,
    color: "#546E7A",
    fontWeight: "500",
  },
  transacaoData: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  transacaoRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
