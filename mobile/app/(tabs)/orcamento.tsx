import { useState, useEffect, useCallback, useMemo } from "react";
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
  getAllBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  type BudgetItem,
} from "../../lib/budget";
import {
  getCategories,
  createCategory,
  type Category,
} from "../../lib/category";
import { trackClick } from "../../lib/metrics";
import { useScreenMetrics } from "../../lib/screen-metrics";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const CORES_CATEGORIA = [
  "#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336",
  "#00BCD4", "#795548", "#E91E63", "#3F51B5", "#009688",
];

function formatMoney(value: number) {
  return value.toFixed(2).replace(".", ",");
}

export default function OrcamentoScreen() {
  useScreenMetrics("screen_orcamento");
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [allBudgets, setAllBudgets] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const budgets = useMemo(
    () => allBudgets.filter((b) => b.month === month && b.year === year),
    [allBudgets, month, year]
  );

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<BudgetItem | null>(null);

  // Form state
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formMonth, setFormMonth] = useState(now.getMonth() + 1);
  const [formYear, setFormYear] = useState(now.getFullYear());
  const [formCategoryName, setFormCategoryName] = useState("");
  const [formCategoryColor, setFormCategoryColor] = useState(CORES_CATEGORIA[0]);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchBudgets = useCallback(async () => {
    try {
      setError("");
      const data = await getAllBudgets();
      setAllBudgets(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Erro ao carregar orçamentos."
      );
      setAllBudgets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchBudgets();
  }, [fetchBudgets]);

  useEffect(() => {
    if (createModalVisible || editModalVisible || categoryModalVisible) {
      fetchCategories();
    }
  }, [createModalVisible, editModalVisible, categoryModalVisible, fetchCategories]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBudgets();
  };

  const totalDefinido = budgets.reduce((s, b) => s + b.amount, 0);
  const totalGasto = budgets.reduce((s, b) => s + b.spent, 0);

  const handlePrevPeriod = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextPeriod = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const openCreateModal = () => {
    trackClick("orcamento_open_create_modal");
    setFormCategoryId("");
    setFormAmount("");
    setFormMonth(month);
    setFormYear(year);
    setFormError("");
    setCreateModalVisible(true);
  };

  const openEditModal = (item: BudgetItem) => {
    trackClick("orcamento_open_edit_modal", { budgetId: item.id });
    setEditingBudget(item);
    setFormCategoryId(item.categoryId);
    setFormAmount(String(item.amount));
    setFormMonth(item.month);
    setFormYear(item.year);
    setFormError("");
    setEditModalVisible(true);
  };

  const openCategoryModal = () => {
    trackClick("orcamento_open_category_modal");
    setFormCategoryName("");
    setFormCategoryColor(CORES_CATEGORIA[0]);
    setFormError("");
    setCategoryModalVisible(true);
  };

  const openDeleteModal = (item: BudgetItem) => {
    trackClick("orcamento_open_delete_modal", { budgetId: item.id });
    setDeletingBudget(item);
    setFormError("");
    setDeleteModalVisible(true);
  };

  const handleCreate = async () => {
    setFormError("");
    const amount = parseFloat(formAmount.replace(",", "."));
    if (!formCategoryId) {
      setFormError("Selecione uma categoria.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setFormError("Informe um valor válido.");
      return;
    }

    setFormLoading(true);
    try {
      await createBudget({
        categoryId: formCategoryId,
        amount,
        month: formMonth,
        year: formYear,
      });
      trackClick("orcamento_create_success");
      setCreateModalVisible(false);
      fetchBudgets();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Erro ao criar orçamento."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingBudget) return;
    setFormError("");
    const amount = parseFloat(formAmount.replace(",", "."));
    if (!formCategoryId) {
      setFormError("Selecione uma categoria.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setFormError("Informe um valor válido.");
      return;
    }

    setFormLoading(true);
    try {
      await updateBudget(editingBudget.id, {
        categoryId: formCategoryId,
        amount,
        month: formMonth,
        year: formYear,
      });
      trackClick("orcamento_update_success", { budgetId: editingBudget.id });
      setEditModalVisible(false);
      setEditingBudget(null);
      fetchBudgets();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Erro ao atualizar orçamento."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBudget) return;
    setFormLoading(true);
    try {
      await deleteBudget(deletingBudget.id);
      trackClick("orcamento_delete_success", { budgetId: deletingBudget.id });
      setDeleteModalVisible(false);
      setDeletingBudget(null);
      fetchBudgets();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Erro ao excluir orçamento."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    setFormError("");
    const name = formCategoryName.trim();
    if (!name) {
      setFormError("Informe o nome da categoria.");
      return;
    }
    setFormLoading(true);
    try {
      await createCategory({ name, color: formCategoryColor });
      trackClick("orcamento_create_category_success");
      setCategoryModalVisible(false);
      fetchCategories();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Erro ao criar categoria."
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>Orçamento</Text>
              <Text style={styles.subtitle}>Acompanhe seus gastos por categoria</Text>
            </View>
            <TouchableOpacity style={styles.btnDefinir} onPress={openCreateModal}>
              <MaterialIcons name="add" size={22} color="#fff" />
              <Text style={styles.btnDefinirText}>Definir orçamento</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Período */}
        <View style={styles.periodoWrap}>
          <TouchableOpacity onPress={handlePrevPeriod} style={styles.periodoArrow}>
            <MaterialIcons name="chevron-left" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.periodoCenter}>
            <Text style={styles.periodoLabel}>Período</Text>
            <Text style={styles.periodoValor}>
              {MESES[month - 1]} {year}
            </Text>
          </View>
          <TouchableOpacity onPress={handleNextPeriod} style={styles.periodoArrow}>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#1976D2" />
          </View>
        ) : (
          <>
            {/* Resumo */}
            <View style={styles.resumoCard}>
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>Total definido</Text>
                <Text style={styles.resumoValor}>
                  R$ {formatMoney(totalDefinido)}
                </Text>
              </View>
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>Gasto no período</Text>
                <Text style={[styles.resumoValor, styles.resumoGasto]}>
                  R$ {formatMoney(totalGasto)}
                </Text>
              </View>
            </View>

            {/* Lista por categoria */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Por categoria</Text>
              {budgets.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <MaterialIcons name="pie-chart" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>
                    Nenhum orçamento definido para este período.
                  </Text>
                  <Text style={styles.emptyHint}>
                    Toque em "Definir orçamento" para começar.
                  </Text>
                </View>
              ) : (
                budgets.map((item) => {
                  const limite = item.amount;
                  const gasto = item.spent;
                  const percent =
                    limite > 0
                      ? Math.min(100, Math.round((gasto / limite) * 100))
                      : 0;
                  const overflow = gasto > limite;
                  const color = item.category.color ?? "#4CAF50";
                  return (
                    <View key={item.id} style={styles.orçamentoCard}>
                      <TouchableOpacity
                        style={styles.orçamentoContent}
                        onLongPress={() => openEditModal(item)}
                        activeOpacity={1}
                      >
                        <View style={styles.orçamentoTop}>
                          <View
                            style={[styles.catDot, { backgroundColor: color }]}
                          />
                          <Text style={styles.catNome}>
                            {item.category.name}
                          </Text>
                          <View style={styles.orçamentoActions}>
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
                              <MaterialIcons name="delete-outline" size={18} color="#C62828" />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={styles.catValoresRow}>
                          <Text style={styles.catValores}>
                            R$ {formatMoney(gasto)} / R$ {formatMoney(limite)}
                          </Text>
                        </View>
                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressBar,
                              {
                                width: `${percent}%`,
                                backgroundColor: overflow ? "#C62828" : color,
                              },
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.percentText,
                            overflow && styles.percentOverflow,
                          ]}
                        >
                          {percent}% utilizado
                          {overflow ? " (acima do limite)" : ""}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal Criar */}
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
              <Text style={styles.modalTitle}>Novo orçamento</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Período</Text>
            <View style={styles.modalPeriodRow}>
              <View style={styles.modalPeriodHalf}>
                <Text style={styles.modalPeriodLabel}>Mês</Text>
                <View style={styles.modalPeriodBtns}>
                  <TouchableOpacity
                    style={styles.modalPeriodBtn}
                    onPress={() =>
                      setFormMonth((m) => (m <= 1 ? 12 : m - 1))
                    }
                  >
                    <MaterialIcons name="chevron-left" size={20} color="#666" />
                  </TouchableOpacity>
                  <Text style={styles.modalPeriodValor}>
                    {MESES[formMonth - 1]}
                  </Text>
                  <TouchableOpacity
                    style={styles.modalPeriodBtn}
                    onPress={() =>
                      setFormMonth((m) => (m >= 12 ? 1 : m + 1))
                    }
                  >
                    <MaterialIcons name="chevron-right" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.modalPeriodHalf}>
                <Text style={styles.modalPeriodLabel}>Ano</Text>
                <View style={styles.modalPeriodBtns}>
                  <TouchableOpacity
                    style={styles.modalPeriodBtn}
                    onPress={() => setFormYear((y) => y - 1)}
                  >
                    <MaterialIcons name="chevron-left" size={20} color="#666" />
                  </TouchableOpacity>
                  <Text style={styles.modalPeriodValor}>{formYear}</Text>
                  <TouchableOpacity
                    style={styles.modalPeriodBtn}
                    onPress={() => setFormYear((y) => y + 1)}
                  >
                    <MaterialIcons name="chevron-right" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.modalLabel}>Categoria</Text>
            <ScrollView style={styles.categoryList} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.categoryItemNew}
                onPress={openCategoryModal}
              >
                <MaterialIcons name="add-circle-outline" size={20} color="#1976D2" />
                <Text style={styles.categoryItemNewText}>Nova categoria</Text>
              </TouchableOpacity>
              {categories.length === 0 ? (
                <Text style={styles.modalHint}>
                  Nenhuma categoria cadastrada. Crie uma acima.
                </Text>
              ) : (
                categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryItem,
                      formCategoryId === cat.id && styles.categoryItemSelected,
                    ]}
                    onPress={() => setFormCategoryId(cat.id)}
                  >
                    <View
                      style={[
                        styles.catDot,
                        { backgroundColor: cat.color ?? "#4CAF50" },
                      ]}
                    />
                    <Text style={styles.categoryItemText}>{cat.name}</Text>
                    {formCategoryId === cat.id && (
                      <MaterialIcons name="check" size={20} color="#1976D2" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <Text style={styles.modalLabel}>Valor limite (R$)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0,00"
              placeholderTextColor="#999"
              value={formAmount}
              onChangeText={setFormAmount}
              keyboardType="decimal-pad"
            />

            {formError ? (
              <Text style={styles.modalError}>{formError}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.modalBtn, formLoading && styles.modalBtnDisabled]}
              onPress={handleCreate}
              disabled={formLoading || categories.length === 0}
            >
              <Text style={styles.modalBtnText}>
                {formLoading ? "Salvando..." : "Criar"}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal Editar */}
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
              <Text style={styles.modalTitle}>Editar orçamento</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Período</Text>
            <View style={styles.modalPeriodRow}>
              <View style={styles.modalPeriodHalf}>
                <Text style={styles.modalPeriodLabel}>Mês</Text>
                <View style={styles.modalPeriodBtns}>
                  <TouchableOpacity
                    style={styles.modalPeriodBtn}
                    onPress={() =>
                      setFormMonth((m) => (m <= 1 ? 12 : m - 1))
                    }
                  >
                    <MaterialIcons name="chevron-left" size={20} color="#666" />
                  </TouchableOpacity>
                  <Text style={styles.modalPeriodValor}>
                    {MESES[formMonth - 1]}
                  </Text>
                  <TouchableOpacity
                    style={styles.modalPeriodBtn}
                    onPress={() =>
                      setFormMonth((m) => (m >= 12 ? 1 : m + 1))
                    }
                  >
                    <MaterialIcons name="chevron-right" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.modalPeriodHalf}>
                <Text style={styles.modalPeriodLabel}>Ano</Text>
                <View style={styles.modalPeriodBtns}>
                  <TouchableOpacity
                    style={styles.modalPeriodBtn}
                    onPress={() => setFormYear((y) => y - 1)}
                  >
                    <MaterialIcons name="chevron-left" size={20} color="#666" />
                  </TouchableOpacity>
                  <Text style={styles.modalPeriodValor}>{formYear}</Text>
                  <TouchableOpacity
                    style={styles.modalPeriodBtn}
                    onPress={() => setFormYear((y) => y + 1)}
                  >
                    <MaterialIcons name="chevron-right" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.modalLabel}>Categoria</Text>
            <ScrollView style={styles.categoryList} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.categoryItemNew}
                onPress={openCategoryModal}
              >
                <MaterialIcons name="add-circle-outline" size={20} color="#1976D2" />
                <Text style={styles.categoryItemNewText}>Nova categoria</Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    formCategoryId === cat.id && styles.categoryItemSelected,
                  ]}
                  onPress={() => setFormCategoryId(cat.id)}
                >
                  <View
                    style={[
                      styles.catDot,
                      { backgroundColor: cat.color ?? "#4CAF50" },
                    ]}
                  />
                  <Text style={styles.categoryItemText}>{cat.name}</Text>
                  {formCategoryId === cat.id && (
                    <MaterialIcons name="check" size={20} color="#1976D2" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Valor limite (R$)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0,00"
              placeholderTextColor="#999"
              value={formAmount}
              onChangeText={setFormAmount}
              keyboardType="decimal-pad"
            />

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

      {/* Modal Nova Categoria */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCategoryModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova categoria</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Nome</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Alimentação"
              placeholderTextColor="#999"
              value={formCategoryName}
              onChangeText={setFormCategoryName}
              autoCapitalize="words"
            />

            <Text style={styles.modalLabel}>Cor</Text>
            <View style={styles.colorPickerRow}>
              {CORES_CATEGORIA.map((cor) => (
                <TouchableOpacity
                  key={cor}
                  style={[
                    styles.colorPickerItem,
                    { backgroundColor: cor },
                    formCategoryColor === cor && styles.colorPickerItemSelected,
                  ]}
                  onPress={() => setFormCategoryColor(cor)}
                >
                  {formCategoryColor === cor && (
                    <MaterialIcons name="check" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {formError ? (
              <Text style={styles.modalError}>{formError}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.modalBtn, formLoading && styles.modalBtnDisabled]}
              onPress={handleCreateCategory}
              disabled={formLoading}
            >
              <Text style={styles.modalBtnText}>
                {formLoading ? "Salvando..." : "Criar categoria"}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal Excluir */}
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
              <Text style={styles.modalTitle}>Excluir orçamento</Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDeleteText}>
              Deseja excluir o orçamento de{" "}
              <Text style={styles.modalDeleteBold}>
                {deletingBudget?.category.name}
              </Text>
              ?
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
                style={[styles.modalBtnDanger, formLoading && styles.modalBtnDisabled]}
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
    flexShrink: 0,
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  periodoArrow: {
    padding: 4,
  },
  periodoCenter: {
    flex: 1,
    alignItems: "center",
  },
  periodoLabel: {
    fontSize: 12,
    color: "#666",
  },
  periodoValor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#263238",
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
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
  },
  emptyHint: {
    fontSize: 12,
    color: "#999",
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
  orçamentoContent: {
    flex: 1,
  },
  orçamentoTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  orçamentoActions: {
    flexDirection: "row",
    gap: 4,
  },
  actionBtn: {
    padding: 4,
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
  catValoresRow: {
    marginBottom: 4,
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
  // Modal
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
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#263238",
  },
  modalPeriodRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  modalPeriodHalf: {
    flex: 1,
  },
  modalPeriodLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  modalPeriodBtns: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingVertical: 8,
  },
  modalPeriodBtn: {
    padding: 4,
  },
  modalPeriodValor: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#263238",
    textAlign: "center",
  },
  categoryItemNew: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1976D2",
    borderStyle: "dashed",
  },
  categoryItemNewText: {
    fontSize: 15,
    color: "#1976D2",
    fontWeight: "600",
  },
  colorPickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  colorPickerItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorPickerItemSelected: {
    borderColor: "#263238",
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
  categoryList: {
    maxHeight: 160,
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryItemSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#1976D2",
  },
  categoryItemText: {
    flex: 1,
    fontSize: 15,
    color: "#263238",
  },
  modalHint: {
    fontSize: 14,
    color: "#666",
    paddingVertical: 12,
  },
  modalError: {
    fontSize: 14,
    color: "#C62828",
    marginBottom: 12,
  },
  modalBtn: {
    backgroundColor: "#1976D2",
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
    color: "#263238",
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
