import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  getInstallments,
  updateInstallment,
  deleteInstallment,
  type Installment,
} from "../../lib/installment";
import { trackClick } from "../../lib/metrics";
import { useScreenMetrics } from "../../lib/screen-metrics";

type FilterType = "all" | "pending" | "paid";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(dueDate: string, paid: boolean) {
  if (paid) return false;
  return new Date(dueDate) < new Date();
}

export default function ParcelasScreen() {
  useScreenMetrics("screen_parcelas");
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingInstallment, setDeletingInstallment] = useState<Installment | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchInstallments = useCallback(async () => {
    try {
      setError("");
      const data = await getInstallments();
      setInstallments(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar parcelas.");
      setInstallments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchInstallments();
  }, [fetchInstallments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInstallments();
  };

  const togglePaid = async (installment: Installment) => {
    trackClick("parcelas_toggle_paid", { installmentId: installment.id });
    const newPaid = !installment.paid;
    setInstallments((prev) =>
      prev.map((i) => (i.id === installment.id ? { ...i, paid: newPaid } : i))
    );
    try {
      await updateInstallment(installment.id, { paid: newPaid });
    } catch {
      setInstallments((prev) =>
        prev.map((i) =>
          i.id === installment.id ? { ...i, paid: installment.paid } : i
        )
      );
    }
  };

  const openDelete = (installment: Installment) => {
    setDeletingInstallment(installment);
    setDeleteError("");
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!deletingInstallment) return;
    setDeleteLoading(true);
    try {
      await deleteInstallment(deletingInstallment.id);
      trackClick("parcelas_delete_success", { installmentId: deletingInstallment.id });
      setInstallments((prev) => prev.filter((i) => i.id !== deletingInstallment.id));
      setDeleteModalVisible(false);
      setDeletingInstallment(null);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Erro ao excluir parcela.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filterLabel: Record<FilterType, string> = {
    all: "Todas",
    pending: "Pendentes",
    paid: "Pagas",
  };

  const cycleFilter = () => {
    setFilter((f) => (f === "all" ? "pending" : f === "pending" ? "paid" : "all"));
  };

  const filtered = installments.filter((i) => {
    if (filter === "pending") return !i.paid;
    if (filter === "paid") return i.paid;
    return true;
  });

  const totalPending = installments
    .filter((i) => !i.paid)
    .reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid = installments
    .filter((i) => i.paid)
    .reduce((s, i) => s + Number(i.amount), 0);
  const overdueCount = installments.filter((i) => isOverdue(i.dueDate, i.paid)).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Parcelas</Text>
            <Text style={styles.subtitle}>Acompanhe suas compras parceladas</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={cycleFilter}>
            <MaterialIcons name="filter-list" size={20} color="#666" />
            <Text style={styles.filterBtnText}>{filterLabel[filter]}</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" color="#1976D2" style={styles.loader} />
        ) : (
          <>
            {/* Resumo */}
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.summaryCardPending]}>
                <MaterialIcons name="schedule" size={22} color="#E65100" />
                <Text style={styles.summaryLabel}>A pagar</Text>
                <Text style={[styles.summaryValue, { color: "#E65100" }]}>
                  R$ {totalPending.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.summaryCard, styles.summaryCardPaid]}>
                <MaterialIcons name="check-circle" size={22} color="#2E7D32" />
                <Text style={styles.summaryLabel}>Pagas</Text>
                <Text style={[styles.summaryValue, { color: "#2E7D32" }]}>
                  R$ {totalPaid.toFixed(2)}
                </Text>
              </View>
              {overdueCount > 0 && (
                <View style={[styles.summaryCard, styles.summaryCardOverdue]}>
                  <MaterialIcons name="warning" size={22} color="#C62828" />
                  <Text style={styles.summaryLabel}>Vencidas</Text>
                  <Text style={[styles.summaryValue, { color: "#C62828" }]}>
                    {overdueCount}
                  </Text>
                </View>
              )}
            </View>

            {filtered.length === 0 ? (
              <View style={styles.emptyWrap}>
                <MaterialIcons name="date-range" size={56} color="#B0BEC5" />
                <Text style={styles.emptyText}>
                  {filter === "all"
                    ? "Nenhuma parcela encontrada."
                    : filter === "pending"
                    ? "Nenhuma parcela pendente."
                    : "Nenhuma parcela paga."}
                </Text>
              </View>
            ) : (
              <View style={styles.lista}>
                {filtered.map((installment) => {
                  const overdue = isOverdue(installment.dueDate, installment.paid);
                  return (
                    <View key={installment.id} style={styles.installmentCard}>
                      <TouchableOpacity
                        style={[
                          styles.checkBtn,
                          installment.paid && styles.checkBtnPaid,
                          overdue && !installment.paid && styles.checkBtnOverdue,
                        ]}
                        onPress={() => togglePaid(installment)}
                      >
                        <MaterialIcons
                          name={installment.paid ? "check-circle" : overdue ? "warning" : "radio-button-unchecked"}
                          size={26}
                          color={
                            installment.paid
                              ? "#2E7D32"
                              : overdue
                              ? "#C62828"
                              : "#B0BEC5"
                          }
                        />
                      </TouchableOpacity>

                      <View style={styles.installmentInfo}>
                        <Text
                          style={[
                            styles.installmentTitle,
                            installment.paid && styles.installmentTitlePaid,
                          ]}
                          numberOfLines={1}
                        >
                          {installment.transaction?.title ?? `Parcela #${installment.number}`}
                        </Text>
                        <View style={styles.installmentMetaRow}>
                          <View
                            style={[
                              styles.installmentBadge,
                              overdue && !installment.paid
                                ? styles.installmentBadgeOverdue
                                : installment.paid
                                ? styles.installmentBadgePaid
                                : styles.installmentBadgePending,
                            ]}
                          >
                            <Text
                              style={[
                                styles.installmentBadgeText,
                                overdue && !installment.paid
                                  ? { color: "#C62828" }
                                  : installment.paid
                                  ? { color: "#2E7D32" }
                                  : { color: "#E65100" },
                              ]}
                            >
                              {installment.number}/{installment.total}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.installmentDue,
                              overdue && !installment.paid && styles.installmentDueOverdue,
                            ]}
                          >
                            Vence: {formatDate(installment.dueDate)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.installmentRight}>
                        <Text
                          style={[
                            styles.installmentAmount,
                            installment.paid && styles.installmentAmountPaid,
                            overdue && !installment.paid && styles.installmentAmountOverdue,
                          ]}
                        >
                          R$ {Number(installment.amount).toFixed(2)}
                        </Text>
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => openDelete(installment)}
                        >
                          <MaterialIcons name="delete-outline" size={18} color="#BDBDBD" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal: Confirmar exclusão */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDeleteModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Excluir parcela</Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDeleteText}>
              Deseja excluir a parcela{" "}
              <Text style={styles.modalDeleteBold}>
                {deletingInstallment?.number}/{deletingInstallment?.total}
              </Text>{" "}
              de{" "}
              <Text style={styles.modalDeleteBold}>
                {deletingInstallment?.transaction?.title ?? "esta compra"}
              </Text>
              ?{"\n"}Esta ação não pode ser desfeita.
            </Text>
            {deleteError ? (
              <Text style={styles.modalError}>{deleteError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnDanger, deleteLoading && styles.modalBtnDisabled]}
                onPress={handleDelete}
                disabled={deleteLoading}
              >
                <Text style={styles.modalBtnText}>
                  {deleteLoading ? "Excluindo..." : "Excluir"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F5" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 96 },
  loader: { marginTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#263238" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  filterBtnText: { fontSize: 13, color: "#546E7A", fontWeight: "500" },
  errorWrap: {
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#C62828", fontSize: 14, textAlign: "center" },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCardPending: { borderTopWidth: 3, borderTopColor: "#E65100" },
  summaryCardPaid: { borderTopWidth: 3, borderTopColor: "#2E7D32" },
  summaryCardOverdue: { borderTopWidth: 3, borderTopColor: "#C62828" },
  summaryLabel: { fontSize: 11, color: "#90A4AE", fontWeight: "500" },
  summaryValue: { fontSize: 14, fontWeight: "700" },
  emptyWrap: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 15, color: "#546E7A", fontWeight: "500" },
  lista: { gap: 10 },
  installmentCard: {
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
  checkBtn: { padding: 2 },
  checkBtnPaid: {},
  checkBtnOverdue: {},
  installmentInfo: { flex: 1, minWidth: 0 },
  installmentTitle: { fontSize: 15, fontWeight: "600", color: "#263238" },
  installmentTitlePaid: { color: "#90A4AE", textDecorationLine: "line-through" },
  installmentMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  installmentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  installmentBadgePending: { backgroundColor: "#FFF3E0" },
  installmentBadgePaid: { backgroundColor: "#E8F5E9" },
  installmentBadgeOverdue: { backgroundColor: "#FFEBEE" },
  installmentBadgeText: { fontSize: 11, fontWeight: "700" },
  installmentDue: { fontSize: 11, color: "#90A4AE" },
  installmentDueOverdue: { color: "#C62828", fontWeight: "600" },
  installmentRight: { alignItems: "flex-end", gap: 6 },
  installmentAmount: { fontSize: 15, fontWeight: "700", color: "#263238" },
  installmentAmountPaid: { color: "#90A4AE" },
  installmentAmountOverdue: { color: "#C62828" },
  deleteBtn: { padding: 2 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#263238" },
  modalDeleteText: {
    fontSize: 15,
    color: "#37474F",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalDeleteBold: { fontWeight: "700", color: "#263238" },
  modalError: { fontSize: 14, color: "#C62828", marginBottom: 12 },
  modalActions: { flexDirection: "row", gap: 12 },
  modalBtnCancel: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalBtnCancelText: { fontSize: 15, fontWeight: "600", color: "#666" },
  modalBtnDanger: {
    flex: 1,
    backgroundColor: "#C62828",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalBtnDisabled: { opacity: 0.65 },
  modalBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
