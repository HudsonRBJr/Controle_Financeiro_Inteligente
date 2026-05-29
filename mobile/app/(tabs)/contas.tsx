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
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  type Account,
  type AccountType,
} from "../../lib/account";
import { trackClick } from "../../lib/metrics";
import { useScreenMetrics } from "../../lib/screen-metrics";

const ACCOUNT_TYPES: { value: AccountType; label: string; icon: "account-balance" | "savings" | "account-balance-wallet" }[] = [
  { value: "checking", label: "Conta Corrente", icon: "account-balance" },
  { value: "savings", label: "Poupança", icon: "savings" },
  { value: "wallet", label: "Carteira", icon: "account-balance-wallet" },
];

function getTypeInfo(type: AccountType) {
  return ACCOUNT_TYPES.find((t) => t.value === type) ?? ACCOUNT_TYPES[0];
}

function formatMoney(value: number) {
  return value.toFixed(2).replace(".", ",");
}

export default function ContasScreen() {
  useScreenMetrics("screen_contas");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);

  const [formName, setFormName] = useState("");
  const [formBalance, setFormBalance] = useState("0");
  const [formType, setFormType] = useState<AccountType>("checking");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      setError("");
      const data = await getAccounts();
      setAccounts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar contas.");
      setAccounts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAccounts();
  }, [fetchAccounts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAccounts();
  };

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);

  const openCreate = () => {
    trackClick("contas_open_create_modal");
    setFormName("");
    setFormBalance("0");
    setFormType("checking");
    setFormError("");
    setCreateModalVisible(true);
  };

  const openEdit = (account: Account) => {
    trackClick("contas_open_edit_modal", { accountId: account.id });
    setEditingAccount(account);
    setFormName(account.name);
    setFormBalance(String(Number(account.balance).toFixed(2)));
    setFormType(account.type);
    setFormError("");
    setEditModalVisible(true);
  };

  const openDelete = (account: Account) => {
    trackClick("contas_open_delete_modal", { accountId: account.id });
    setDeletingAccount(account);
    setFormError("");
    setDeleteModalVisible(true);
  };

  const validateForm = () => {
    const name = formName.trim();
    const balance = parseFloat(formBalance.replace(",", "."));
    if (!name) { setFormError("Informe o nome da conta."); return null; }
    if (isNaN(balance)) { setFormError("Saldo inválido."); return null; }
    return { name, balance, type: formType };
  };

  const handleCreate = async () => {
    setFormError("");
    const data = validateForm();
    if (!data) return;
    setFormLoading(true);
    try {
      await createAccount(data);
      trackClick("contas_create_success");
      setCreateModalVisible(false);
      fetchAccounts();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao criar conta.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingAccount) return;
    setFormError("");
    const data = validateForm();
    if (!data) return;
    setFormLoading(true);
    try {
      await updateAccount(editingAccount.id, data);
      trackClick("contas_update_success", { accountId: editingAccount.id });
      setEditModalVisible(false);
      setEditingAccount(null);
      fetchAccounts();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao atualizar conta.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;
    setFormLoading(true);
    try {
      await deleteAccount(deletingAccount.id);
      trackClick("contas_delete_success", { accountId: deletingAccount.id });
      setDeleteModalVisible(false);
      setDeletingAccount(null);
      fetchAccounts();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao excluir conta.");
    } finally {
      setFormLoading(false);
    }
  };

  const renderForm = (isEdit: boolean) => (
    <>
      <Text style={styles.modalLabel}>Nome da conta *</Text>
      <TextInput
        style={styles.modalInput}
        placeholder="Ex: Nubank, Bradesco, Carteira..."
        placeholderTextColor="#999"
        value={formName}
        onChangeText={setFormName}
        autoCapitalize="words"
      />

      <Text style={styles.modalLabel}>Tipo *</Text>
      <View style={styles.typeGrid}>
        {ACCOUNT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[styles.typeCard, formType === t.value && styles.typeCardActive]}
            onPress={() => setFormType(t.value)}
          >
            <MaterialIcons
              name={t.icon}
              size={24}
              color={formType === t.value ? "#1976D2" : "#90A4AE"}
            />
            <Text
              style={[
                styles.typeCardText,
                formType === t.value && styles.typeCardTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.modalLabel}>Saldo atual (R$)</Text>
      <TextInput
        style={styles.modalInput}
        placeholder="0,00"
        placeholderTextColor="#999"
        value={formBalance}
        onChangeText={setFormBalance}
        keyboardType="decimal-pad"
      />

      {formError ? <Text style={styles.modalError}>{formError}</Text> : null}

      <TouchableOpacity
        style={[styles.modalBtn, formLoading && styles.modalBtnDisabled]}
        onPress={isEdit ? handleEdit : handleCreate}
        disabled={formLoading}
      >
        <Text style={styles.modalBtnText}>
          {formLoading ? "Salvando..." : isEdit ? "Salvar" : "Criar conta"}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Contas</Text>
            <Text style={styles.subtitle}>Gerencie suas contas bancárias</Text>
          </View>
          <TouchableOpacity style={styles.btnAdd} onPress={openCreate}>
            <MaterialIcons name="add" size={22} color="#fff" />
            <Text style={styles.btnAddText}>Adicionar</Text>
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
            {/* Card de saldo total */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Saldo total</Text>
              <Text
                style={[
                  styles.totalValue,
                  totalBalance < 0 && styles.totalValueNegative,
                ]}
              >
                R$ {formatMoney(totalBalance)}
              </Text>
              <Text style={styles.totalSub}>
                {accounts.length} conta{accounts.length !== 1 ? "s" : ""}
              </Text>
            </View>

            {accounts.length === 0 ? (
              <View style={styles.emptyWrap}>
                <MaterialIcons name="account-balance" size={56} color="#B0BEC5" />
                <Text style={styles.emptyText}>Nenhuma conta cadastrada.</Text>
                <Text style={styles.emptyHint}>
                  Toque em "Adicionar" para cadastrar sua primeira conta.
                </Text>
              </View>
            ) : (
              <View style={styles.accountsList}>
                {accounts.map((account) => {
                  const typeInfo = getTypeInfo(account.type);
                  const balance = Number(account.balance);
                  return (
                    <View key={account.id} style={styles.accountCard}>
                      <View style={styles.accountCardLeft}>
                        <View style={styles.accountIconWrap}>
                          <MaterialIcons
                            name={typeInfo.icon}
                            size={26}
                            color="#1976D2"
                          />
                        </View>
                        <View style={styles.accountInfo}>
                          <Text style={styles.accountName}>{account.name}</Text>
                          <Text style={styles.accountType}>{typeInfo.label}</Text>
                        </View>
                      </View>
                      <View style={styles.accountCardRight}>
                        <Text
                          style={[
                            styles.accountBalance,
                            balance < 0 && styles.accountBalanceNegative,
                          ]}
                        >
                          R$ {formatMoney(balance)}
                        </Text>
                        <View style={styles.accountActions}>
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => openEdit(account)}
                          >
                            <MaterialIcons name="edit" size={18} color="#1976D2" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => openDelete(account)}
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
                  );
                })}
              </View>
            )}
          </>
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
              <Text style={styles.modalTitle}>Nova conta</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
              <Text style={styles.modalTitle}>Editar conta</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
            style={styles.modalContentCenter}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Excluir conta</Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDeleteText}>
              Deseja excluir a conta{" "}
              <Text style={styles.modalDeleteBold}>{deletingAccount?.name}</Text>?
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
  safeArea: { flex: 1, backgroundColor: "#F5F5F5" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 96 },
  loader: { marginTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: { flex: 1, minWidth: 0 },
  title: { fontSize: 28, fontWeight: "bold", color: "#263238" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  btnAdd: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1976D2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnAddText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  errorWrap: {
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#C62828", fontSize: 14, textAlign: "center" },
  totalCard: {
    backgroundColor: "#1976D2",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  totalLabel: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  totalValue: { fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  totalValueNegative: { color: "#FFCDD2" },
  totalSub: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  emptyWrap: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 16, color: "#546E7A", fontWeight: "500" },
  emptyHint: { fontSize: 13, color: "#90A4AE", textAlign: "center" },
  accountsList: { gap: 12 },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  accountCardLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  accountIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  accountInfo: { flex: 1, minWidth: 0 },
  accountName: { fontSize: 16, fontWeight: "600", color: "#263238" },
  accountType: { fontSize: 12, color: "#90A4AE", marginTop: 2 },
  accountCardRight: { alignItems: "flex-end", gap: 8 },
  accountBalance: { fontSize: 18, fontWeight: "700", color: "#2E7D32" },
  accountBalanceNegative: { color: "#C62828" },
  accountActions: { flexDirection: "row", gap: 4 },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
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
    maxHeight: "85%",
  },
  modalContentCenter: {
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
  modalError: { fontSize: 14, color: "#C62828", marginBottom: 12 },
  modalBtn: {
    backgroundColor: "#1976D2",
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
  typeGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  typeCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#F8F9FA",
    gap: 6,
  },
  typeCardActive: {
    borderColor: "#1976D2",
    backgroundColor: "#E3F2FD",
  },
  typeCardText: { fontSize: 11, color: "#90A4AE", fontWeight: "500", textAlign: "center" },
  typeCardTextActive: { color: "#1976D2", fontWeight: "700" },
});
