import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a237e',
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#0a192f',
          borderTopColor: 'rgba(255,255,255,0.1)',
        },
        tabBarActiveTintColor: '#64ffda',
        tabBarInactiveTintColor: '#8892b0',
      }}
    >
      {/* Redirección inicial */}
      <Tabs.Screen
        name="index"
        options={{ href: null }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            return <Redirect href="/admin/dashboard" />;
          },
        })}
      />
      
      {/* Pantallas principales */}
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
    </Tabs>
  );
}