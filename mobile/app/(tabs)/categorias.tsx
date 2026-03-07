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
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "../../lib/category";
import { trackClick } from "../../lib/metrics";
import { useScreenMetrics } from "../../lib/screen-metrics";

const CORES_CATEGORIA = [
  "#4CAF50",
  "#2196F3",
  "#FF9800",
  "#9C27B0",
  "#F44336",
  "#00BCD4",
  "#795548",
  "#E91E63",
  "#3F51B5",
  "#009688",
];

export default function CategoriasScreen() {
  useScreenMetrics("screen_categorias");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  // Form
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState(CORES_CATEGORIA[0]);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setError("");
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar categorias.");
      setCategories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (createModalVisible || editModalVisible) {
      fetchCategories();
    }
  }, [createModalVisible, editModalVisible, fetchCategories]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const openCreateModal = () => {
    trackClick("categorias_open_create_modal");
    setFormName("");
    setFormColor(CORES_CATEGORIA[0]);
    setFormError("");
    setCreateModalVisible(true);
  };

  const openEditModal = (cat: Category) => {
    trackClick("categorias_open_edit_modal", { categoryId: cat.id });
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormColor(cat.color ?? CORES_CATEGORIA[0]);
    setFormError("");
    setEditModalVisible(true);
  };

  const openDeleteModal = (cat: Category) => {
    trackClick("categorias_open_delete_modal", { categoryId: cat.id });
    setDeletingCategory(cat);
    setFormError("");
    setDeleteModalVisible(true);
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      setFormError("Informe o nome da categoria.");
      return;
    }

    setFormLoading(true);
    try {
      await createCategory({ name: formName.trim(), color: formColor });
      trackClick("categorias_create_success");
      setCreateModalVisible(false);
      fetchCategories();
    } catch {
      setFormError("Erro ao criar categoria.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingCategory) return;

    if (!formName.trim()) {
      setFormError("Informe o nome da categoria.");
      return;
    }

    setFormLoading(true);
    try {
      await updateCategory(editingCategory.id, {
        name: formName.trim(),
        color: formColor,
      });
      trackClick("categorias_update_success", { categoryId: editingCategory.id });
      setEditModalVisible(false);
      fetchCategories();
    } catch {
      setFormError("Erro ao atualizar categoria.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    setFormLoading(true);
    try {
      await deleteCategory(deletingCategory.id);
      trackClick("categorias_delete_success", { categoryId: deletingCategory.id });
      setDeleteModalVisible(false);
      fetchCategories();
    } catch {
      setFormError("Erro ao excluir categoria.");
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
              <Text style={styles.title}>Categorias</Text>
              <Text style={styles.subtitle}>
                Gerencie todas as suas categorias
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
            <ActivityIndicator size="large" color="#1976D2" />
          </View>
        ) : (
          <>
            <View style={styles.section}>
              {categories.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <MaterialIcons name="category" size={56} color="#B0BEC5" />
                  <Text style={styles.emptyText}>
                    Nenhuma categoria cadastrada.
                  </Text>
                  <Text style={styles.emptyHint}>
                    Toque em "Adicionar" para criar sua primeira categoria.
                  </Text>
                </View>
              ) : (
                categories.map((cat) => (
                  <View key={cat.id}>
                    <View style={styles.card}>
                      <View style={styles.cardTop}>
                        <View
                          style={[
                            styles.colorDot,
                            { backgroundColor: cat.color ?? "#4CAF50" },
                          ]}
                        />
                        <Text style={styles.cardTitle}>{cat.name}</Text>
                        <View style={styles.cardActions}>
                          <TouchableOpacity
                            onPress={() => openEditModal(cat)}
                            style={styles.cardActionBtn}
                          >
                            <MaterialIcons name="edit" size={18} color="#666"/>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => openDeleteModal(cat)}
                            style={styles.cardActionBtn}
                          >
                            <MaterialIcons name="delete-outline" size={18} color="#C62828"/>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
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
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova categoria</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Nome</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Alimentação"
              placeholderTextColor="#999"
              value={formName}
              onChangeText={setFormName}
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
                    formColor === cor && styles.colorPickerItemSelected,
                  ]}
                  onPress={() => setFormColor(cor)}
                >
                  {formColor === cor && (
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
              onPress={handleCreate}
              disabled={formLoading}
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
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar categoria</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Nome</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Transporte"
              placeholderTextColor="#999"
              value={formName}
              onChangeText={setFormName}
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
                    formColor === cor && styles.colorPickerItemSelected,
                  ]}
                  onPress={() => setFormColor(cor)}
                >
                  {formColor === cor && (
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
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Excluir categoria</Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDeleteText}>
              Deseja excluir a categoria{" "}
              <Text style={styles.modalDeleteBold}>
                {deletingCategory?.name}
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
    backgroundColor: "#F5F5F5",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 96,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  btnAdd: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1976D2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnAddText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Section
  section: {
    gap: 12,
  },

  //Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#263238",
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
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
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  cardActionBtn: {
    padding: 4,
  },

  //Modal
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#263238",
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

  // Color Picker
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
});
