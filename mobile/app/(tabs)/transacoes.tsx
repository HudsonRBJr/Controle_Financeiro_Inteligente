import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { trackClick } from "../../lib/metrics";
import { useScreenMetrics } from "../../lib/screen-metrics";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type Transaction,
  type TransactionType,
} from "../../lib/transaction";
import { getCategories, type Category } from "../../lib/category";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type FilterType = "all" | "entrada" | "saida";

export default function TransacoesScreen() {
  useScreenMetrics("screen_transacoes");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<TransactionType>("EXPENSE");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(todayISO());
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, cats] = await Promise.all([getTransactions(), getCategories()]);
      setTransactions(data);
      setCategories(cats);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setFormTitle("");
    setFormType("EXPENSE");
    setFormAmount("");
    setFormDate(todayISO());
    setFormCategoryId("");
    setFormDescription("");
    setFormError("");
  };

  const openCreate = () => {
    trackClick("transacoes_nova_transacao_click");
    resetForm();
    setCreateModalVisible(true);
  };

  const openEdit = (tx: Transaction) => {
    trackClick("transacoes_open_edit_modal", { transactionId: tx.id });
    setEditingTx(tx);
    setFormTitle(tx.title);
    setFormType(tx.type);
    setFormAmount(String(Number(tx.amount).toFixed(2)));
    setFormDate(tx.date.slice(0, 10));
    setFormCategoryId(tx.categoryId ?? "");
    setFormDescription(tx.description ?? "");
    setFormError("");
    setEditModalVisible(true);
  };

  const openDelete = (tx: Transaction) => {
    setDeletingTx(tx);
    setFormError("");
    setDeleteModalVisible(true);
  };

  const validateForm = () => {
    const title = formTitle.trim();
    const amount = parseFloat(formAmount.replace(",", "."));
    if (!title) {
      setFormError("Informe o título.");
      return null;
    }
    if (isNaN(amount) || amount <= 0) {
      setFormError("Informe um valor válido.");
      return null;
    }
    if (!formDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setFormError("Data inválida. Use o formato AAAA-MM-DD.");
      return null;
    }
    return {
      title,
      amount,
      type: formType,
      date: formDate,
      categoryId: formCategoryId || undefined,
      description: formDescription.trim() || undefined,
    };
  };

  const handleCreate = async () => {
    setFormError("");
    const data = validateForm();
    if (!data) return;
    setFormLoading(true);
    try {
      const created = await createTransaction(data);
      trackClick("transacoes_create_success");
      setTransactions((prev) => [created, ...prev]);
      setCreateModalVisible(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao criar transação.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingTx) return;
    setFormError("");
    const data = validateForm();
    if (!data) return;
    setFormLoading(true);
    try {
      const updated = await updateTransaction(editingTx.id, data);
      trackClick("transacoes_update_success", { transactionId: editingTx.id });
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingTx.id ? updated : t))
      );
      setEditModalVisible(false);
      setEditingTx(null);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao atualizar transação.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTx) return;
    setFormLoading(true);
    try {
      await deleteTransaction(deletingTx.id);
      trackClick("transacoes_delete_click", { transactionId: deletingTx.id });
      setTransactions((prev) => prev.filter((t) => t.id !== deletingTx.id));
      setDeleteModalVisible(false);
      setDeletingTx(null);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao excluir.");
    } finally {
      setFormLoading(false);
    }
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

  const renderForm = (isEdit: boolean) => (
    <>
      <Text style={styles.modalLabel}>Título *</Text>
      <TextInput
        style={styles.modalInput}
        placeholder="Ex: Salário, Aluguel, Mercado..."
        placeholderTextColor="#999"
        value={formTitle}
        onChangeText={setFormTitle}
        autoCapitalize="sentences"
      />

      <Text style={styles.modalLabel}>Tipo *</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[
            styles.typeBtn,
            formType === "INCOME" && styles.typeBtnActiveIncome,
          ]}
          onPress={() => setFormType("INCOME")}
        >
          <MaterialIcons
            name="trending-up"
            size={18}
            color={formType === "INCOME" ? "#fff" : "#2E7D32"}
          />
          <Text
            style={[
              styles.typeBtnText,
              { color: formType === "INCOME" ? "#fff" : "#2E7D32" },
            ]}
          >
            Receita
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeBtn,
            formType === "EXPENSE" && styles.typeBtnActiveExpense,
          ]}
          onPress={() => setFormType("EXPENSE")}
        >
          <MaterialIcons
            name="trending-down"
            size={18}
            color={formType === "EXPENSE" ? "#fff" : "#C62828"}
          />
          <Text
            style={[
              styles.typeBtnText,
              { color: formType === "EXPENSE" ? "#fff" : "#C62828" },
            ]}
          >
            Despesa
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.modalRow}>
        <View style={styles.modalHalf}>
          <Text style={styles.modalLabel}>Valor (R$) *</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="0,00"
            placeholderTextColor="#999"
            value={formAmount}
            onChangeText={setFormAmount}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.modalHalf}>
          <Text style={styles.modalLabel}>Data *</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="AAAA-MM-DD"
            placeholderTextColor="#999"
            value={formDate}
            onChangeText={setFormDate}
          />
        </View>
      </View>

      {categories.length > 0 && (
        <>
          <Text style={styles.modalLabel}>Categoria</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.catScroll}
            contentContainerStyle={styles.catScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.catChip,
                !formCategoryId && styles.catChipActive,
              ]}
              onPress={() => setFormCategoryId("")}
            >
              <Text
                style={[
                  styles.catChipText,
                  !formCategoryId && styles.catChipTextActive,
                ]}
              >
                Nenhuma
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catChip,
                  formCategoryId === cat.id && styles.catChipActive,
                ]}
                onPress={() => setFormCategoryId(cat.id)}
              >
                <Text
                  style={[
                    styles.catChipText,
                    formCategoryId === cat.id && styles.catChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <Text style={styles.modalLabel}>Descrição</Text>
      <TextInput
        style={[styles.modalInput, styles.modalInputMulti]}
        placeholder="Observações (opcional)"
        placeholderTextColor="#999"
        value={formDescription}
        onChangeText={setFormDescription}
        multiline
        numberOfLines={2}
      />

      {formError ? <Text style={styles.modalError}>{formError}</Text> : null}

      <TouchableOpacity
        style={[
          styles.modalBtn,
          {
            backgroundColor:
              formType === "INCOME" ? "#2E7D32" : "#1976D2",
          },
          formLoading && styles.modalBtnDisabled,
        ]}
        onPress={isEdit ? handleEdit : handleCreate}
        disabled={formLoading}
      >
        <Text style={styles.modalBtnText}>
          {formLoading ? "Salvando..." : isEdit ? "Salvar" : "Criar transação"}
        </Text>
      </TouchableOpacity>
    </>
  );

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
          <TouchableOpacity style={styles.btnNovaTransacao} onPress={openCreate}>
            <MaterialIcons name="add" size={22} color="#fff" />
            <Text style={styles.btnNovaTransacaoText}>Nova</Text>
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

        {/* Lista */}
        {loading ? (
          <ActivityIndicator size="large" color="#1976D2" style={styles.loader} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialIcons name="receipt-long" size={48} color="#B0BEC5" />
            <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
            <Text style={styles.emptyHint}>Toque em "Nova" para adicionar.</Text>
          </View>
        ) : (
          <View style={styles.lista}>
            {filtered.map((t) => {
              const isEntrada = t.type === "INCOME";
              return (
                <TouchableOpacity
                  key={t.id}
                  style={styles.transacaoCard}
                  onPress={() => openEdit(t)}
                  activeOpacity={0.75}
                >
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
                          <Text style={styles.categoriaPillText}>
                            {t.category.name}
                          </Text>
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
                      onPress={() => openDelete(t)}
                    >
                      <MaterialIcons name="delete-outline" size={20} color="#999" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal: Criar */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCreateModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Transação</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {renderForm(false)}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal: Editar */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Transação</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {renderForm(true)}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

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
            style={styles.modalContentSmall}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Excluir transação</Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDeleteText}>
              Deseja excluir{" "}
              <Text style={styles.modalDeleteBold}>{deletingTx?.title}</Text>?
              {"\n"}Esta ação não pode ser desfeita.
            </Text>
            {formError ? <Text style={styles.modalError}>{formError}</Text> : null}
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
  safeArea: { flex: 1, backgroundColor: "#F5F5F5" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 96 },
  loader: { marginTop: 40 },
  emptyWrap: { alignItems: "center", paddingVertical: 48, gap: 8 },
  emptyText: { fontSize: 15, color: "#546E7A", fontWeight: "500" },
  emptyHint: { fontSize: 13, color: "#90A4AE" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#263238" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  btnNovaTransacao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1976D2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnNovaTransacaoText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  buscaRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
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
  searchInput: { flex: 1, fontSize: 14, color: "#263238", padding: 0 },
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
  filterText: { fontSize: 14, color: "#263238", fontWeight: "500" },
  lista: { gap: 12 },
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
  transacaoInfo: { flex: 1, minWidth: 0 },
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
  categoriaPillText: { fontSize: 11, color: "#546E7A", fontWeight: "500" },
  transacaoData: { fontSize: 12, color: "#666", marginTop: 4 },
  transacaoRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  transacaoValor: { fontSize: 14, fontWeight: "700" },
  valorEntrada: { color: "#2E7D32" },
  valorSaida: { color: "#C62828" },
  transacaoDelete: { padding: 4 },
  // Modals
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
    maxHeight: "90%",
  },
  modalContentSmall: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#263238" },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#37474F",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#263238",
    marginBottom: 16,
  },
  modalInputMulti: { height: 70, textAlignVertical: "top" },
  modalRow: { flexDirection: "row", gap: 12 },
  modalHalf: { flex: 1 },
  modalError: { fontSize: 14, color: "#C62828", marginBottom: 12 },
  modalBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  modalBtnDisabled: { opacity: 0.65 },
  modalBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  modalDeleteText: {
    fontSize: 15,
    color: "#37474F",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalDeleteBold: { fontWeight: "700", color: "#263238" },
  modalDeleteActions: { flexDirection: "row", gap: 12 },
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
  typeRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#F8F9FA",
  },
  typeBtnActiveIncome: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  typeBtnActiveExpense: {
    backgroundColor: "#C62828",
    borderColor: "#C62828",
  },
  typeBtnText: { fontSize: 14, fontWeight: "600" },
  catScroll: { marginBottom: 16 },
  catScrollContent: { gap: 8, paddingRight: 4 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  catChipActive: {
    backgroundColor: "#1976D2",
    borderColor: "#1976D2",
  },
  catChipText: { fontSize: 13, color: "#546E7A", fontWeight: "500" },
  catChipTextActive: { color: "#fff" },
});
