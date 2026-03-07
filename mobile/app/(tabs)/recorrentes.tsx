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
  Switch,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  type RecurringTransactionItem,
  type TransactionType,
  type RecurrenceFrequency,
} from "../../lib/recurring-transaction";
import { trackClick } from "../../lib/metrics";
import { useScreenMetrics } from "../../lib/screen-metrics";

const TIPOS: { value: TransactionType; label: string }[] = [
  { value: "INCOME", label: "Receita" },
  { value: "EXPENSE", label: "Despesa" },
  { value: "TRANSFER", label: "Transferência" },
];

const FREQUENCIAS: { value: RecurrenceFrequency; label: string }[] = [
  { value: "DAILY", label: "Diária" },
  { value: "WEEKLY", label: "Semanal" },
  { value: "MONTHLY", label: "Mensal" },
  { value: "YEARLY", label: "Anual" },
];

function formatMoney(value: number) {
  return value.toFixed(2).replace(".", ",");
}

function parseDateBR(str: string): string | null {
  const m = str.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const day = parseInt(d!, 10);
  const month = parseInt(mo!, 10) - 1;
  const year = parseInt(y!, 10);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day)
    return null;
  return date.toISOString().slice(0, 10);
}

function formatDateToBR(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function RecorrentesScreen() {
  useScreenMetrics("screen_recorrentes");
  const [items, setItems] = useState<RecurringTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransactionItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<RecurringTransactionItem | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formType, setFormType] = useState<TransactionType>("EXPENSE");
  const [formFrequency, setFormFrequency] = useState<RecurrenceFrequency>("MONTHLY");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setError("");
      const data = await getRecurringTransactions();
      setItems(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Erro ao carregar recorrentes."
      );
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const toNum = (v: number | string) =>
    typeof v === "string" ? parseFloat(v) || 0 : v;
  const totalReceita = items
    .filter((i) => i.type === "INCOME" && i.active)
    .reduce((s, i) => s + toNum(i.amount), 0);
  const totalDespesa = items
    .filter((i) => i.type === "EXPENSE" && i.active)
    .reduce((s, i) => s + toNum(i.amount), 0);

  const openCreateModal = () => {
    trackClick("recorrentes_open_create_modal");
    setFormTitle("");
    setFormAmount("");
    setFormType("EXPENSE");
    setFormFrequency("MONTHLY");
    setFormStartDate(formatDateToBR(todayISO()));
    setFormEndDate("");
    setFormActive(true);
    setFormError("");
    setCreateModalVisible(true);
  };

  const openEditModal = (item: RecurringTransactionItem) => {
    trackClick("recorrentes_open_edit_modal", { recurringId: item.id });
    setEditingItem(item);
    setFormTitle(item.title);
    setFormAmount(
      String(typeof item.amount === "string" ? parseFloat(item.amount) : item.amount)
    );
    setFormType(item.type);
    setFormFrequency(item.frequency);
    setFormStartDate(formatDateToBR(item.startDate.slice(0, 10)));
    setFormEndDate(item.endDate ? formatDateToBR(item.endDate.slice(0, 10)) : "");
    setFormActive(item.active);
    setFormError("");
    setEditModalVisible(true);
  };

  const openDeleteModal = (item: RecurringTransactionItem) => {
    trackClick("recorrentes_open_delete_modal", { recurringId: item.id });
    setDeletingItem(item);
    setFormError("");
    setDeleteModalVisible(true);
  };

  const validateForm = (): CreatePayload | false => {
    const title = formTitle.trim();
    const amount = parseFloat(formAmount.replace(",", "."));
    const startISO = parseDateBR(formStartDate);
    const endISO = formEndDate.trim() ? parseDateBR(formEndDate) : null;

    if (!title) {
      setFormError("Informe o título.");
      return false;
    }
    if (isNaN(amount) || amount <= 0) {
      setFormError("Informe um valor válido.");
      return false;
    }
    if (!startISO) {
      setFormError("Data inicial inválida. Use DD/MM/AAAA.");
      return false;
    }
    if (formEndDate.trim() && !endISO) {
      setFormError("Data final inválida. Use DD/MM/AAAA.");
      return false;
    }
    if (endISO && endISO < startISO) {
      setFormError("Data final deve ser após a data inicial.");
      return false;
    }

    return {
      title,
      amount,
      type: formType,
      frequency: formFrequency,
      startDate: startISO,
      endDate: endISO || undefined,
      active: formActive,
    };
  };

  type CreatePayload = {
    title: string;
    amount: number;
    type: TransactionType;
    frequency: RecurrenceFrequency;
    startDate: string;
    endDate?: string;
    active: boolean;
  };

  const handleCreate = async () => {
    setFormError("");
    const validated = validateForm();
    if (!validated) return;

    setFormLoading(true);
    try {
      await createRecurringTransaction(validated);
      trackClick("recorrentes_create_success");
      setCreateModalVisible(false);
      fetchItems();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Erro ao criar transação."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingItem) return;
    setFormError("");
    const validated = validateForm();
    if (!validated) return;

    setFormLoading(true);
    try {
      await updateRecurringTransaction(editingItem.id, validated);
      trackClick("recorrentes_update_success", { recurringId: editingItem.id });
      setEditModalVisible(false);
      setEditingItem(null);
      fetchItems();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Erro ao atualizar transação."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setFormLoading(true);
    try {
      await deleteRecurringTransaction(deletingItem.id);
      trackClick("recorrentes_delete_success", { recurringId: deletingItem.id });
      setDeleteModalVisible(false);
      setDeletingItem(null);
      fetchItems();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Erro ao excluir transação."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const getTypeLabel = (t: TransactionType) =>
    TIPOS.find((x) => x.value === t)?.label ?? t;
  const getFreqLabel = (f: RecurrenceFrequency) =>
    FREQUENCIAS.find((x) => x.value === f)?.label ?? f;

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
              <Text style={styles.title}>Transações Recorrentes</Text>
              <Text style={styles.subtitle}>
                Receitas e despesas que se repetem
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
            <ActivityIndicator size="large" color="#00796B" />
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Receitas recorrentes</Text>
                <Text style={[styles.summaryValue, styles.summaryIncome]}>
                  R$ {formatMoney(totalReceita)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowLast]}>
                <Text style={styles.summaryLabel}>Despesas recorrentes</Text>
                <Text style={[styles.summaryValue, styles.summaryExpense]}>
                  R$ {formatMoney(totalDespesa)}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minhas recorrentes</Text>
              {items.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <MaterialIcons name="repeat" size={56} color="#B0BEC5" />
                  <Text style={styles.emptyText}>
                    Nenhuma transação recorrente.
                  </Text>
                  <Text style={styles.emptyHint}>
                    Toque em "Adicionar" para criar uma.
                  </Text>
                </View>
              ) : (
                items.map((item) => {
                  const isIncome = item.type === "INCOME";
                  const color = isIncome ? "#2E7D32" : "#C62828";
                  return (
                    <View key={item.id} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <View
                          style={[
                            styles.itemIconWrap,
                            { backgroundColor: color + "20" },
                          ]}
                        >
                          <MaterialIcons
                            name={isIncome ? "trending-up" : "trending-down"}
                            size={22}
                            color={color}
                          />
                        </View>
                        <View style={styles.itemContent}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          <Text style={styles.itemMeta}>
                            {getFreqLabel(item.frequency)} •{" "}
                            {formatDateToBR(item.startDate.slice(0, 10))}
                            {item.endDate
                              ? ` até ${formatDateToBR(item.endDate.slice(0, 10))}`
                              : ""}
                          </Text>
                        </View>
                        <View style={styles.itemRight}>
                          <Text
                            style={[
                              styles.itemAmount,
                              isIncome ? styles.itemAmountIncome : styles.itemAmountExpense,
                            ]}
                          >
                            {isIncome ? "+" : "-"} R${" "}
                            {formatMoney(toNum(item.amount))}
                          </Text>
                          {!item.active && (
                            <View style={styles.inactiveBadge}>
                              <Text style={styles.inactiveText}>Inativa</Text>
                            </View>
                          )}
                          <View style={styles.itemActions}>
                            <TouchableOpacity
                              onPress={() => openEditModal(item)}
                              style={styles.actionBtn}
                            >
                              <MaterialIcons name="edit" size={18} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => openDeleteModal(item)}
                              style={styles.actionBtn}
                            >
                              <MaterialIcons
                                name="delete-outline"
                                size={18}
                                color="#C62828"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
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
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.modalScrollInner}
              contentContainerStyle={styles.modalScrollInnerContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nova recorrente</Text>
                <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.modalLabel}>Título</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Aluguel, Salário..."
                    placeholderTextColor="#999"
                    value={formTitle}
                    onChangeText={setFormTitle}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.formFieldShort}>
                  <Text style={styles.modalLabel}>Valor</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="0,00"
                    placeholderTextColor="#999"
                    value={formAmount}
                    onChangeText={setFormAmount}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Text style={styles.modalLabel}>Tipo</Text>
              <View style={styles.pickerRow}>
                {TIPOS.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[
                      styles.pickerItem,
                      formType === t.value && styles.pickerItemSelected,
                    ]}
                    onPress={() => setFormType(t.value)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        formType === t.value && styles.pickerItemTextSelected,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Frequência</Text>
              <View style={styles.pickerRow}>
                {FREQUENCIAS.map((f) => (
                  <TouchableOpacity
                    key={f.value}
                    style={[
                      styles.pickerItem,
                      formFrequency === f.value && styles.pickerItemSelected,
                    ]}
                    onPress={() => setFormFrequency(f.value)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        formFrequency === f.value && styles.pickerItemTextSelected,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.modalLabel}>Início (DD/MM/AAAA)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="01/01/2025"
                    placeholderTextColor="#999"
                    value={formStartDate}
                    onChangeText={setFormStartDate}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.modalLabel}>Fim (opcional)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#999"
                    value={formEndDate}
                    onChangeText={setFormEndDate}
                  />
                </View>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Ativa</Text>
                <Switch
                  value={formActive}
                  onValueChange={setFormActive}
                  trackColor={{ false: "#ccc", true: "#00796B" }}
                  thumbColor="#fff"
                />
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
            </ScrollView>
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
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.modalScrollInner}
              contentContainerStyle={styles.modalScrollInnerContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar recorrente</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.modalLabel}>Título</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Aluguel, Salário..."
                    placeholderTextColor="#999"
                    value={formTitle}
                    onChangeText={setFormTitle}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.formFieldShort}>
                  <Text style={styles.modalLabel}>Valor</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="0,00"
                    placeholderTextColor="#999"
                    value={formAmount}
                    onChangeText={setFormAmount}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Text style={styles.modalLabel}>Tipo</Text>
              <View style={styles.pickerRow}>
                {TIPOS.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[
                      styles.pickerItem,
                      formType === t.value && styles.pickerItemSelected,
                    ]}
                    onPress={() => setFormType(t.value)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        formType === t.value && styles.pickerItemTextSelected,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Frequência</Text>
              <View style={styles.pickerRow}>
                {FREQUENCIAS.map((f) => (
                  <TouchableOpacity
                    key={f.value}
                    style={[
                      styles.pickerItem,
                      formFrequency === f.value && styles.pickerItemSelected,
                    ]}
                    onPress={() => setFormFrequency(f.value)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        formFrequency === f.value && styles.pickerItemTextSelected,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.modalLabel}>Início (DD/MM/AAAA)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="01/01/2025"
                    placeholderTextColor="#999"
                    value={formStartDate}
                    onChangeText={setFormStartDate}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.modalLabel}>Fim (opcional)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#999"
                    value={formEndDate}
                    onChangeText={setFormEndDate}
                  />
                </View>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Ativa</Text>
                <Switch
                  value={formActive}
                  onValueChange={setFormActive}
                  trackColor={{ false: "#ccc", true: "#00796B" }}
                  thumbColor="#fff"
                />
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
            </ScrollView>
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
              <Text style={styles.modalTitle}>Excluir recorrente</Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDeleteText}>
              Deseja excluir a transação recorrente{" "}
              <Text style={styles.modalDeleteBold}>{deletingItem?.title}</Text>?
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
  safeArea: { flex: 1, backgroundColor: "#ECEFF1" },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 96,
  },
  header: { marginBottom: 20 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  headerTitleWrap: { flex: 1, minWidth: 0 },
  title: { fontSize: 28, fontWeight: "bold", color: "#00796B" },
  subtitle: { fontSize: 14, color: "#546E7A", marginTop: 4 },
  btnAdd: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#00796B",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexShrink: 0,
  },
  btnAddText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  errorWrap: {
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#C62828", fontSize: 14, textAlign: "center" },
  loadingWrap: { paddingVertical: 48, alignItems: "center" },
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
  summaryRowLast: { borderBottomWidth: 0 },
  summaryLabel: { fontSize: 14, color: "#546E7A" },
  summaryValue: { fontSize: 18, fontWeight: "700", color: "#00796B" },
  summaryIncome: { color: "#2E7D32" },
  summaryExpense: { color: "#C62828" },
  section: { gap: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00796B",
    marginBottom: 4,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: { fontSize: 16, color: "#546E7A" },
  emptyHint: { fontSize: 14, color: "#90A4AE" },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: { flex: 1, minWidth: 0 },
  itemTitle: { fontSize: 16, fontWeight: "600", color: "#263238" },
  itemMeta: { fontSize: 12, color: "#90A4AE", marginTop: 4 },
  itemRight: { alignItems: "flex-end" },
  itemAmount: { fontSize: 15, fontWeight: "700" },
  itemAmountIncome: { color: "#2E7D32" },
  itemAmountExpense: { color: "#C62828" },
  inactiveBadge: {
    backgroundColor: "#FFE0B2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  inactiveText: { fontSize: 10, color: "#E65100", fontWeight: "600" },
  itemActions: { flexDirection: "row", gap: 4, marginTop: 8 },
  actionBtn: { padding: 4 },
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
    maxHeight: Dimensions.get("window").height * 0.85,
  },
  modalScrollInner: {
    maxHeight: Dimensions.get("window").height * 0.7,
  },
  modalScrollInnerContent: {
    paddingBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#00796B" },
  modalLabel: { fontSize: 14, fontWeight: "600", color: "#37474F", marginBottom: 6 },
  formRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  formField: { flex: 1 },
  formFieldShort: { width: 100 },
  modalInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#263238",
  },
  pickerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  pickerItemSelected: {
    backgroundColor: "#00796B",
    borderColor: "#00796B",
  },
  pickerItemText: { fontSize: 14, color: "#37474F" },
  pickerItemTextSelected: { color: "#fff", fontWeight: "600" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  switchLabel: { fontSize: 16, color: "#37474F" },
  modalError: { fontSize: 14, color: "#C62828", marginBottom: 12 },
  modalBtn: {
    backgroundColor: "#00796B",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalBtnDisabled: { opacity: 0.7 },
  modalBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  modalDeleteText: { fontSize: 16, color: "#37474F", marginBottom: 20, lineHeight: 24 },
  modalDeleteBold: { fontWeight: "700", color: "#00796B" },
  modalDeleteActions: { flexDirection: "row", gap: 12 },
  modalBtnCancel: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalBtnCancelText: { fontSize: 16, fontWeight: "600", color: "#666" },
  modalBtnDanger: {
    flex: 1,
    backgroundColor: "#C62828",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
});
