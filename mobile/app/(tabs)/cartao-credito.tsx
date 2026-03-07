import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  getCreditCards,
  createCreditCard,
  updateCreditCard,
  deleteCreditCard,
  type CreditCardItem,
} from "../../lib/credit-card";
import { trackClick } from "../../lib/metrics";
import { useScreenMetrics } from "../../lib/screen-metrics";

function formatMoney(value: number) {
  return value.toFixed(2).replace(".", ",");
}

function padDay(n: number) {
  return String(n).padStart(2, "0");
}

export default function CartaoCreditoScreen() {
  useScreenMetrics("screen_cartao_credito");
  const [cards, setCards] = useState<CreditCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardItem | null>(null);
  const [deletingCard, setDeletingCard] = useState<CreditCardItem | null>(null);

  const [formName, setFormName] = useState("");
  const [formLimit, setFormLimit] = useState("");
  const [formClosingDay, setFormClosingDay] = useState("");
  const [formDueDay, setFormDueDay] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchCards = useCallback(async () => {
    try {
      setError("");
      const data = await getCreditCards();
      setCards(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Erro ao carregar cartões."
      );
      setCards([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchCards();
  }, [fetchCards]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCards();
  };

  const totalLimit = cards.reduce((s, c) => s + c.limit, 0);
  const totalSpent = cards.reduce((s, c) => s + (c.spent ?? 0), 0);
  const totalAvailable = totalLimit - totalSpent;

  const openCreateModal = () => {
    trackClick("cartao_credito_open_create_modal");
    setFormName("");
    setFormLimit("");
    setFormClosingDay("10");
    setFormDueDay("15");
    setFormError("");
    setCreateModalVisible(true);
  };

  const openEditModal = (item: CreditCardItem) => {
    trackClick("cartao_credito_open_edit_modal", { cardId: item.id });
    setEditingCard(item);
    setFormName(item.name);
    setFormLimit(String(item.limit));
    setFormClosingDay(String(item.closingDay));
    setFormDueDay(String(item.dueDay));
    setFormError("");
    setEditModalVisible(true);
  };

  const openDeleteModal = (item: CreditCardItem) => {
    trackClick("cartao_credito_open_delete_modal", { cardId: item.id });
    setDeletingCard(item);
    setFormError("");
    setDeleteModalVisible(true);
  };

  const validateForm = () => {
    const name = formName.trim();
    const limit = parseFloat(formLimit.replace(",", "."));
    const closing = parseInt(formClosingDay, 10);
    const due = parseInt(formDueDay, 10);

    if (!name) {
      setFormError("Informe o nome do cartão.");
      return false;
    }
    if (isNaN(limit) || limit <= 0) {
      setFormError("Informe um limite válido.");
      return false;
    }
    if (isNaN(closing) || closing < 1 || closing > 31) {
      setFormError("Dia de fechamento deve ser entre 1 e 31.");
      return false;
    }
    if (isNaN(due) || due < 1 || due > 31) {
      setFormError("Dia de vencimento deve ser entre 1 e 31.");
      return false;
    }
    return { name, limit, closingDay: closing, dueDay: due };
  };

  const handleCreate = async () => {
    setFormError("");
    const validated = validateForm();
    if (!validated) return;

    setFormLoading(true);
    try {
      await createCreditCard(validated);
      trackClick("cartao_credito_create_success");
      setCreateModalVisible(false);
      fetchCards();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Erro ao criar cartão."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingCard) return;
    setFormError("");
    const validated = validateForm();
    if (!validated) return;

    setFormLoading(true);
    try {
      await updateCreditCard(editingCard.id, validated);
      trackClick("cartao_credito_update_success", { cardId: editingCard.id });
      setEditModalVisible(false);
      setEditingCard(null);
      fetchCards();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Erro ao atualizar cartão."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCard) return;
    setFormLoading(true);
    try {
      await deleteCreditCard(deletingCard.id);
      trackClick("cartao_credito_delete_success", { cardId: deletingCard.id });
      setDeleteModalVisible(false);
      setDeletingCard(null);
      fetchCards();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Erro ao excluir cartão."
      );
    } finally {
      setFormLoading(false);
    }
  };

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
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>Cartões de Crédito</Text>
              <Text style={styles.subtitle}>
                Acompanhe limite e fatura dos seus cartões
              </Text>
            </View>
            <TouchableOpacity style={styles.btnAdd} onPress={openCreateModal}>
              <MaterialIcons name="add" size={22} color="#fff" />
              <Text style={styles.btnAddText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#1A237E" />
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Limite total</Text>
                <Text style={styles.summaryValue}>
                  R$ {formatMoney(totalLimit)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Utilizado</Text>
                <Text style={[styles.summaryValue, styles.summarySpent]}>
                  R$ {formatMoney(totalSpent)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowLast]}>
                <Text style={styles.summaryLabel}>Disponível</Text>
                <Text style={[styles.summaryValue, styles.summaryAvailable]}>
                  R$ {formatMoney(totalAvailable)}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meus cartões</Text>
              {cards.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <MaterialIcons name="credit-card" size={56} color="#B0BEC5" />
                  <Text style={styles.emptyText}>
                    Nenhum cartão cadastrado.
                  </Text>
                  <Text style={styles.emptyHint}>
                    Toque em "Adicionar" para cadastrar seu primeiro cartão.
                  </Text>
                </View>
              ) : (
                cards.map((item) => {
                  const spent = item.spent ?? 0;
                  const limit = item.limit;
                  const available = limit - spent;
                  const percent =
                    limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
                  const overflow = spent > limit;
                  return (
                    <View key={item.id} style={styles.cardWrapper}>
                      <View style={styles.cardVisual}>
                        <View style={styles.cardHeader}>
                          <MaterialIcons
                            name="credit-card"
                            size={28}
                            color="rgba(255,255,255,0.9)"
                          />
                          <View style={styles.cardActions}>
                            <TouchableOpacity
                              onPress={() => openEditModal(item)}
                              style={styles.cardActionBtn}
                            >
                              <MaterialIcons
                                name="edit"
                                size={20}
                                color="rgba(255,255,255,0.9)"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => openDeleteModal(item)}
                              style={styles.cardActionBtn}
                            >
                              <MaterialIcons
                                name="delete-outline"
                                size={20}
                                color="rgba(255,255,255,0.9)"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <Text style={styles.cardName}>{item.name}</Text>
                        <View style={styles.cardDetails}>
                          <View>
                            <Text style={styles.cardDetailLabel}>Limite</Text>
                            <Text style={styles.cardDetailValue}>
                              R$ {formatMoney(limit)}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.cardDetailLabel}>Fatura</Text>
                            <Text style={styles.cardDetailValue}>
                              R$ {formatMoney(spent)}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.cardDetailLabel}>Disponível</Text>
                            <Text
                              style={[
                                styles.cardDetailValue,
                                overflow && styles.cardDetailOverflow,
                              ]}
                            >
                              R$ {formatMoney(available)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.cardMeta}>
                          <Text style={styles.cardMetaText}>
                            Fecha dia {padDay(item.closingDay)} • Vence dia{" "}
                            {padDay(item.dueDay)}
                          </Text>
                        </View>
                        <View style={styles.cardProgressTrack}>
                          <View
                            style={[
                              styles.cardProgressBar,
                              {
                                width: `${Math.min(percent, 100)}%`,
                                backgroundColor: overflow ? "#FF5252" : "#4CAF50",
                              },
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.cardPercentText,
                            overflow && styles.cardPercentOverflow,
                          ]}
                        >
                          {percent}% do limite utilizado
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCreateModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo cartão</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Nome do cartão</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Nubank, Itaú..."
              placeholderTextColor="#999"
              value={formName}
              onChangeText={setFormName}
              autoCapitalize="words"
            />
            <Text style={styles.modalLabel}>Limite (R$)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0,00"
              placeholderTextColor="#999"
              value={formLimit}
              onChangeText={setFormLimit}
              keyboardType="decimal-pad"
            />
            <View style={styles.modalRow}>
              <View style={styles.modalHalf}>
                <Text style={styles.modalLabel}>Fechamento (dia)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="10"
                  placeholderTextColor="#999"
                  value={formClosingDay}
                  onChangeText={setFormClosingDay}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <View style={styles.modalHalf}>
                <Text style={styles.modalLabel}>Vencimento (dia)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="15"
                  placeholderTextColor="#999"
                  value={formDueDay}
                  onChangeText={setFormDueDay}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            </View>
            {formError ? (
              <Text style={styles.modalError}>{formError}</Text>
            ) : null}
            <TouchableOpacity
              style={[styles.modalBtn, formLoading && styles.modalBtnDisabled]}
              onPress={handleCreate}
              disabled={formLoading}
            >
              <Text style={styles.modalBtnText}>
                {formLoading ? "Salvando..." : "Cadastrar"}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar cartão</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Nome do cartão</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Nubank, Itaú..."
              placeholderTextColor="#999"
              value={formName}
              onChangeText={setFormName}
              autoCapitalize="words"
            />
            <Text style={styles.modalLabel}>Limite (R$)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0,00"
              placeholderTextColor="#999"
              value={formLimit}
              onChangeText={setFormLimit}
              keyboardType="decimal-pad"
            />
            <View style={styles.modalRow}>
              <View style={styles.modalHalf}>
                <Text style={styles.modalLabel}>Fechamento (dia)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="10"
                  placeholderTextColor="#999"
                  value={formClosingDay}
                  onChangeText={setFormClosingDay}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <View style={styles.modalHalf}>
                <Text style={styles.modalLabel}>Vencimento (dia)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="15"
                  placeholderTextColor="#999"
                  value={formDueDay}
                  onChangeText={setFormDueDay}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            </View>
            {formError ? (
              <Text style={styles.modalError}>{formError}</Text>
            ) : null}
            <TouchableOpacity
              style={[styles.modalBtn, formLoading && styles.modalBtnDisabled]}
              onPress={handleEdit}
              disabled={formLoading}
            >
              <Text style={styles.modalBtnText}>
                {formLoading ? "Salvando..." : "Salvar"}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

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
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Excluir cartão</Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDeleteText}>
              Deseja excluir o cartão{" "}
              <Text style={styles.modalDeleteBold}>{deletingCard?.name}</Text>?
              Esta ação não pode ser desfeita.
            </Text>
            {formError ? (
              <Text style={styles.modalError}>{formError}</Text>
            ) : null}
            <View style={styles.modalDeleteActions}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtnDanger,
                  formLoading && styles.modalBtnDisabled,
                ]}
                onPress={handleDelete}
                disabled={formLoading}
              >
                <Text style={styles.modalBtnText}>
                  {formLoading ? "Excluindo..." : "Excluir"}
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
  safeArea: {
    flex: 1,
    backgroundColor: "#ECEFF1",
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
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  headerTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A237E",
  },
  subtitle: {
    fontSize: 14,
    color: "#546E7A",
    marginTop: 4,
  },
  btnAdd: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1A237E",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexShrink: 0,
  },
  btnAddText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  errorWrap: {
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
    textAlign: "center",
  },
  loadingWrap: {
    paddingVertical: 48,
    alignItems: "center",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#546E7A",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A237E",
  },
  summarySpent: {
    color: "#E65100",
  },
  summaryAvailable: {
    color: "#2E7D32",
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A237E",
    marginBottom: 4,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#546E7A",
  },
  emptyHint: {
    fontSize: 14,
    color: "#90A4AE",
  },
  cardWrapper: {
    marginBottom: 16,
  },
  cardVisual: {
    backgroundColor: "#1A237E",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#1A237E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  cardActionBtn: {
    padding: 4,
  },
  cardName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardDetailLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 2,
  },
  cardDetailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  cardDetailOverflow: {
    color: "#FF5252",
  },
  cardMeta: {
    marginBottom: 12,
  },
  cardMetaText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  cardProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  cardProgressBar: {
    height: "100%",
    borderRadius: 3,
  },
  cardPercentText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
  },
  cardPercentOverflow: {
    color: "#FF5252",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A237E",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#37474F",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#263238",
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalHalf: {
    flex: 1,
  },
  modalError: {
    fontSize: 14,
    color: "#C62828",
    marginBottom: 12,
  },
  modalBtn: {
    backgroundColor: "#1A237E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalBtnDisabled: {
    opacity: 0.7,
  },
  modalBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalDeleteText: {
    fontSize: 16,
    color: "#37474F",
    marginBottom: 20,
    lineHeight: 24,
  },
  modalDeleteBold: {
    fontWeight: "700",
    color: "#1A237E",
  },
  modalDeleteActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalBtnCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modalBtnDanger: {
    flex: 1,
    backgroundColor: "#C62828",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
});
