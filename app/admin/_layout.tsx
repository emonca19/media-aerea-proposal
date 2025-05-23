import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e2e8f0",
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: "#3949ab",
        tabBarInactiveTintColor: "#64748b",
      }}
    >
      {/* Redirección inicial */}
      <Tabs.Screen
        name="index"
        options={{ href: null }}
        listeners={{
          tabPress: (e: { preventDefault: () => void }) => {
            e.preventDefault();
            return <Redirect href="/admin/dashboard" />;
          },
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="projectss"
        options={{
          title: "Proyectos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="resources"
        options={{
          title: "Recursos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="airplane" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="indicators"
        options={{
          title: "Indicadores",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />

      {/* Screens to hide from tab bar */}
      <Tabs.Screen name="[id]" options={{ href: null }} />
      <Tabs.Screen name="[turbineId]" options={{ href: null }} />
      <Tabs.Screen name="admin-layout" options={{ href: null }} />
      <Tabs.Screen name="equipment" options={{ href: null }} />
      <Tabs.Screen name="parks" options={{ href: null }} />
      <Tabs.Screen name="photos" options={{ href: null }} />
      <Tabs.Screen name="project-details" options={{ href: null }} />
      <Tabs.Screen name="projects" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
    </Tabs>
  );
}
