import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { auth } from "../../lib/auth";
import { getConfiguration, type Configuration } from "../../lib/configuration";

export default function LoginScreen() {
  const router = useRouter();
  const [config, setConfig] = useState<Configuration | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getConfiguration().then(setConfig);
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (isLogin) {
      if (!email.trim() || !senha) {
        setError("E-mail e senha são obrigatórios.");
        return;
      }
    } else {
      if (!nome.trim() || !email.trim() || !senha) {
        setError("Nome, e-mail e senha são obrigatórios.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await auth.login(email.trim(), senha);
        await auth.saveToken(res.token);
        router.replace("/(tabs)/dashboard");
      } else {
        await auth.register(nome.trim(), email.trim(), senha);
        const res = await auth.login(email.trim(), senha);
        await auth.saveToken(res.token);
        router.replace("/(tabs)/dashboard");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao conectar. Verifique se o backend está rodando.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo e título */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <MaterialIcons name="account-balance-wallet" size={48} color="#1976D2" />
            </View>
            <Text style={styles.title}>
              {config?.name ?? "Controle Financeiro"}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin ? "Entre na sua conta" : "Crie sua conta"}
            </Text>
            {config?.description ? (
              <Text style={styles.configDescription}>{config.description}</Text>
            ) : null}
            {config?.version ? (
              <Text style={styles.configVersion}>v{config.version}</Text>
            ) : null}
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#999"
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
                />
              </View>
            )}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
              />
            </View>

            {error ? (
              <View style={styles.errorWrap}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>
                  {isLogin ? "Entrar" : "Criar conta"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleMode}
              onPress={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
            >
              <Text style={styles.toggleModeText}>
                {isLogin
                  ? "Não tem conta? "
                  : "Já tem conta? "}
                <Text style={styles.toggleModeLink}>
                  {isLogin ? "Registre-se" : "Entrar"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    minHeight: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#263238",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 8,
  },
  configDescription: {
    fontSize: 13,
    color: "#546E7A",
    marginTop: 12,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  configVersion: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#37474F",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#263238",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  btnPrimary: {
    backgroundColor: "#1976D2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  errorWrap: {
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
    textAlign: "center",
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  toggleMode: {
    alignItems: "center",
    marginTop: 16,
  },
  toggleModeText: {
    fontSize: 14,
    color: "#666",
  },
  toggleModeLink: {
    color: "#1976D2",
    fontWeight: "600",
  },
});
