import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { mockProjects } from '../../src/mocks/index';

export default function ProjectDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const project = mockProjects.find((p) => p.id === id);

  if (!project) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(12,4,67,1)', 'rgba(151,68,195,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/admin/clients')}
            >
              <Text style={styles.headerButtonText}>← Volver</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text style={styles.errorText}>Proyecto no encontrado</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#4caf50';
      case 'PAUSED': return '#ff9800';
      case 'FINISHED': return '#2196f3';
      case 'COMPLETED': return '#8bc34a';
      default: return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/admin/clients')}
          >
            <Text style={styles.headerButtonText}>← Volver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, styles.logoutButton]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.headerButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.title}>{project.name}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(project.status) }]} />
            <Text style={styles.statusText}>{project.status}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Fechas del Proyecto</Text>
            <Text style={styles.info}>Inicio: {project.startDate.toLocaleDateString()}</Text>
            <Text style={styles.info}>Fin: {project.endDate.toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Descripción</Text>
            <Text style={styles.description}>{project.description}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  headerButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    color: '#1e293b',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    color: '#3b82f6',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  info: {
    color: '#64748b',
    fontSize: 16,
    marginBottom: 8,
  },
  description: {
    color: '#1e293b',
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});
