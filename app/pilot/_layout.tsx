import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SafeAreaView, View } from 'react-native';

export default function PilotLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
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
            name="activity-log"
            options={{
              title: 'Actividades',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons 
                  name={focused ? "time" : "time-outline"} 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
          <Tabs.Screen
            name="preflight-checklist"
            options={{
              title: 'Checklist',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons 
                  name={focused ? "checkbox" : "checkbox-outline"} 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
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
          <Tabs.Screen
            name="project-history"
            options={{
              title: 'Historial',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons 
                  name={focused ? "archive" : "archive-outline"} 
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
