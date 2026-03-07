import { Tabs } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1976D2",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#E0E0E0",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarItemStyle: {
          minWidth: 48,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size ?? 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transacoes"
        options={{
          title: "Transações",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list-alt" size={size ?? 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cartao-credito"
        options={{
          title: "Cartões",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="credit-card" size={size ?? 20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="mais"
        options={{
          title: "Mais",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="menu" size={size ?? 20} color={color} />
          ),
        }}
      />
      {/* Telas acessíveis pelo menu "Mais" — ocultas da barra de abas */}
      <Tabs.Screen
        name="orcamento"
        options={{
          href: null,
          title: "Orçamento",
        }}
      />


      <Tabs.Screen
        name="recorrentes"
        options={{
          href: null,
          title: "Recorrentes",
        }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{
          href: null,
          title: "Relatórios",
        }}
      />
      <Tabs.Screen
        name="categorias"
        options={{
          href: null,
          title: "Categorias",
        }}
      />
      <Tabs.Screen
        name="sair"
        options={{
          href: null,
          title: "Sair",
        }}
      />
    </Tabs>
  );
}
