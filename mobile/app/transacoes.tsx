import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const TRANSACOES = [
  { id: "1", nome: "Salário mensal", categoria: "Salário", data: "31 de jan. de 2026", valor: 5000, tipo: "entrada" as const },
  { id: "2", nome: "Supermercado", categoria: "Alimentação", data: "04 de fev. de 2026", valor: -450, tipo: "saida" as const },
  { id: "3", nome: "Combustível", categoria: "Transporte", data: "07 de fev. de 2026", valor: -200, tipo: "saida" as const },
  { id: "4", nome: "Aluguel", categoria: "Moradia", data: "31 de jan. de 2026", valor: -1200, tipo: "saida" as const },
  { id: "5", nome: "Projeto web", categoria: "Freelance", data: "09 de fev. de 2026", valor: 800, tipo: "entrada" as const },
  { id: "6", nome: "Cinema e restaurante", categoria: "Lazer", data: "11 de fev. de 2026", valor: -150, tipo: "saida" as const },
  { id: "7", nome: "Plano de saúde", categoria: "Saúde", data: "14 de fev. de 2026", valor: -300, tipo: "saida" as const },
];

export default function TransacoesScreen() {
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
          <TouchableOpacity style={styles.btnNovaTransacao}>
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
            />
          </View>
          <TouchableOpacity style={styles.filterWrap}>
            <MaterialIcons name="filter-list" size={20} color="#666" />
            <Text style={styles.filterText}>Todas</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Lista de transações */}
        <View style={styles.lista}>
          {TRANSACOES.map((t) => (
            <View key={t.id} style={styles.transacaoCard}>
              <View style={[styles.transacaoIconWrap, t.tipo === "entrada" ? styles.entradaIcon : styles.saidaIcon]}>
                <MaterialIcons
                  name={t.tipo === "entrada" ? "trending-up" : "trending-down"}
                  size={20}
                  color={t.tipo === "entrada" ? "#2E7D32" : "#C62828"}
                />
              </View>
              <View style={styles.transacaoInfo}>
                <View style={styles.transacaoNomeRow}>
                  <Text style={styles.transacaoNome} numberOfLines={1}>{t.nome}</Text>
                  <View style={styles.categoriaPill}>
                    <Text style={styles.categoriaPillText}>{t.categoria}</Text>
                  </View>
                </View>
                <Text style={styles.transacaoData}>{t.data}</Text>
              </View>
              <View style={styles.transacaoRight}>
                <Text style={[styles.transacaoValor, t.tipo === "entrada" ? styles.valorEntrada : styles.valorSaida]}>
                  {t.tipo === "entrada" ? "+" : "-"} R$ {Math.abs(t.valor).toFixed(2)}
                </Text>
                <TouchableOpacity style={styles.transacaoDelete}>
                  <MaterialIcons name="delete-outline" size={20} color="#999" />
                </TouchableOpacity>
              </View>
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
