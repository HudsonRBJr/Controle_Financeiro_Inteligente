import { Tabs, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { auth } from "../../lib/auth";

export default function TabsLayout() {
  const router = useRouter();
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
          minWidth: 64,
        },
        tabBarScrollEnabled: false,
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
        name="orcamento"
        options={{
          title: "Orçamento",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="pie-chart" size={size ?? 20} color={color} />
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
        name="recorrentes"
        options={{
          title: "Recorrentes",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="repeat" size={size ?? 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{
          title: "Relatórios",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="assessment" size={size ?? 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sair"
        options={{
          title: "Sair",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="logout" size={size ?? 20} color={color} />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={async () => {
                await auth.logout();
                router.replace("/(auth)/login");
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
