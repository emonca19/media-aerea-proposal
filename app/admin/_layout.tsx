import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f8fafc',
        },
        headerTintColor: '#1e293b',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e2e8f0',
        },
        tabBarActiveTintColor: '#3949ab',
        tabBarInactiveTintColor: '#64748b',
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
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />

      {/* Ocultar todas las pantallas secundarias */}
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="parks" options={{ href: null }} />
      <Tabs.Screen name="projects" options={{ href: null }} />
      <Tabs.Screen name="photos" options={{ href: null }} />
      <Tabs.Screen name="equipment" options={{ href: null }} />
      <Tabs.Screen name="(project-details)" options={{ href: null }} />
      <Tabs.Screen name="turbine" options={{ href: null }} />
      <Tabs.Screen name="turbineId" options={{ href: null }} />
      <Tabs.Screen name="projectDetails" options={{ href: null }} />
    </Tabs>
  );
}
