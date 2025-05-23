import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SafeAreaView, View } from 'react-native';

export default function PilotLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 0 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopColor: '#e2e2e2',
              borderTopWidth: 1,
              elevation: 0,
              shadowOpacity: 0,
              height: 60,
              paddingBottom: 4,
            },
            tabBarItemStyle: {
              paddingVertical: 8,
            },
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: '#64748b',
            tabBarLabelStyle: {
              fontSize: 12,
              marginBottom: 4,
            },
          }}
        >
          <Tabs.Screen
            name="dashboard"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons 
                  name={focused ? "home" : "home-outline"} 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
          <Tabs.Screen
            name="new-activity"
            options={{
              title: 'Registrar',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "reader" : "reader-outline"}
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen name="activity-log" options={{ href: null }} /> 
          <Tabs.Screen name="statistics" options={{ href: null }} />
          <Tabs.Screen name="incidents" options={{ href: null }} />
          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Notificaciones',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "notifications" : "notifications-outline"}
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen name="preflight-checklist" options={{ href: null }} />
          <Tabs.Screen name="project-history" options={{ href: null }} />
          <Tabs.Screen name="components/pilot-dashboard" options={{ href: null }} />
          <Tabs.Screen name="components/header-info-card" options={{ href: null }} />
          <Tabs.Screen name="components/alerts-display-card" options={{ href: null }} />
          <Tabs.Screen name="components/my-indicators-button" options={{ href: null }} />
          <Tabs.Screen name="components/project-details-card" options={{ href: null }} />
          <Tabs.Screen name="components/new-activity-formmodal" options={{ href: null }} />
          <Tabs.Screen name="components/new-incident-formmodal" options={{ href: null }} />
          <Tabs.Screen name="components/quick-actions-menu-card" options={{ href: null }} />
          <Tabs.Screen name="components/quick-register-activity-form" options={{ href: null }} />
          <Tabs.Screen name="components/activity-form-modal" options={{ href: null }} />
          <Tabs.Screen name="calendar" options={{ href: null }} />
          <Tabs.Screen name="site-map" options={{ href: null }} />
          <Tabs.Screen name="turbines" options={{ href: null }} />
          <Tabs.Screen name="support-chat" options={{ href: null }} />
          <Tabs.Screen name="components" options={{ href: null }} />
          
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Perfil',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}
