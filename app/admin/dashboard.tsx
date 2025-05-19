import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type NavigationButton = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: '/admin/projects' | '/admin/parks' | '/admin/equipment' | '/admin/reports' | '/admin/photos';
  color: string;
  gradient: [string, string];
};

export default function AdminDashboard() {
  const router = useRouter();
  const navigationButtons: NavigationButton[] = [
    {
      title: 'Proyectos',
      icon: 'folder-outline',
      route: '/admin/projects',
      color: '#3b82f6',
      gradient: ['#3b82f6', '#60a5fa'],
    },
    {
      title: 'Parques Eólicos',
      icon: 'business-outline',
      route: '/admin/parks',
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#a78bfa'],
    },
    {
      title: 'Equipamiento',
      icon: 'hardware-chip-outline',
      route: '/admin/equipment',
      color: '#06b6d4',
      gradient: ['#06b6d4', '#67e8f9'],
    },
    {
      title: 'Reportes',
      icon: 'document-text-outline',
      route: '/admin/reports',
      color: '#22c55e',
      gradient: ['#22c55e', '#86efac'],
    },
    {
      title: 'Fotos',
      icon: 'images-outline',
      route: '/admin/photos',
      color: '#f59e0b',
      gradient: ['#f59e0b', '#fcd34d'],
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Dashboard',
        headerStyle: { backgroundColor: '#3b82f6' },
        headerTintColor: '#fff',
        headerRight: () => (
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => router.push('/login')}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }} />
      
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Panel de Administración</Text>
          
          <View style={styles.grid}>
            {navigationButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={styles.gridItem}
                onPress={() => {
                  router.push(button.route as any);
                }}
              >
                <LinearGradient
                  colors={button.gradient}
                  style={styles.gridItemGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={button.icon} size={32} color="#fff" />
                  <Text style={styles.gridItemText}>{button.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    color: '#1e293b',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 24,
    marginHorizontal: 16,
  },
  logoutButton: {
    marginRight: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
  gridItemGradient: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gridItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
});
