import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const ORCAMENTOS = [
  { id: "1", categoria: "Moradia", limite: 1500, gasto: 1200, color: "#4CAF50" },
  { id: "2", categoria: "Alimentação", limite: 800, gasto: 450, color: "#2196F3" },
  { id: "3", categoria: "Transporte", limite: 400, gasto: 200, color: "#F44336" },
  { id: "4", categoria: "Saúde", limite: 400, gasto: 300, color: "#9C27B0" },
  { id: "5", categoria: "Lazer", limite: 300, gasto: 150, color: "#FF9800" },
];

export default function OrcamentoScreen() {
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
            <Text style={styles.title}>Orçamento</Text>
            <Text style={styles.subtitle}>Acompanhe seus gastos por categoria</Text>
          </View>
          <TouchableOpacity style={styles.btnDefinir}>
            <MaterialIcons name="add" size={22} color="#fff" />
            <Text style={styles.btnDefinirText}>Definir orçamento</Text>
          </TouchableOpacity>
        </View>

        {/* Período */}
        <TouchableOpacity style={styles.periodoWrap}>
          <Text style={styles.periodoLabel}>Período</Text>
          <Text style={styles.periodoValor}>Fevereiro 2026</Text>
          <MaterialIcons name="keyboard-arrow-down" size={22} color="#666" />
        </TouchableOpacity>

        {/* Resumo */}
        <View style={styles.resumoCard}>
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Total definido</Text>
            <Text style={styles.resumoValor}>R$ 3.400,00</Text>
          </View>
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Gasto no período</Text>
            <Text style={[styles.resumoValor, styles.resumoGasto]}>R$ 2.300,00</Text>
          </View>
        </View>

        {/* Lista por categoria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por categoria</Text>
          {ORCAMENTOS.map((item) => {
            const percent = Math.min(100, Math.round((item.gasto / item.limite) * 100));
            const overflow = item.gasto > item.limite;
            return (
              <View key={item.id} style={styles.orçamentoCard}>
                <View style={styles.orçamentoTop}>
                  <View style={[styles.catDot, { backgroundColor: item.color }]} />
                  <Text style={styles.catNome}>{item.categoria}</Text>
                  <Text style={styles.catValores}>
                    R$ {item.gasto.toFixed(2).replace(".", ",")} / R$ {item.limite.toFixed(2).replace(".", ",")}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${percent}%`,
                        backgroundColor: overflow ? "#C62828" : item.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.percentText, overflow && styles.percentOverflow]}>
                  {percent}% utilizado{overflow ? " (acima do limite)" : ""}
                </Text>
              </View>
            );
          })}
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
  btnDefinir: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1976D2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnDefinirText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  periodoWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  periodoLabel: {
    fontSize: 14,
    color: "#666",
  },
  periodoValor: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#263238",
  },
  resumoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  resumoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  resumoLabel: {
    fontSize: 14,
    color: "#666",
  },
  resumoValor: {
    fontSize: 16,
    fontWeight: "700",
    color: "#263238",
  },
  resumoGasto: {
    color: "#1976D2",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#263238",
    marginBottom: 4,
  },
  orçamentoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  orçamentoTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  catDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  catNome: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#263238",
  },
  catValores: {
    fontSize: 12,
    color: "#666",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  percentText: {
    fontSize: 11,
    color: "#546E7A",
    marginTop: 6,
  },
  percentOverflow: {
    color: "#C62828",
    fontWeight: "600",
  },
});
