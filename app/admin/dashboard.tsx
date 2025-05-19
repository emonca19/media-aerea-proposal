import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../src/components/common';
import { mockClients } from '../../src/mocks/clients';
import { mockProjects, mockTurbines } from '../../src/mocks/data';

export default function AdminDashboard() {
  const router = useRouter();
  // Calcular estadísticas
  const totalProjects = mockProjects.length;
  const totalTurbines = mockTurbines.length;
  const inspectedTurbines = mockTurbines.filter(t => t.status === 'INSPECTED').length;
  const approvedTurbines = mockTurbines.filter(t => t.status === 'APPROVED').length;
  const totalClients = mockClients.length;

  // Calcular progreso general
  const progressPercentage = Math.round((approvedTurbines / totalTurbines) * 100);

  // Animación para la barra de progreso
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage, progressAnim]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Dashboard',
          headerStyle: { backgroundColor: '#f8fafc' },
          headerTintColor: '#1e293b',
        }}
      />
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.gradient}
      >
        <ScrollView style={styles.content}>
          {/* Tarjeta de Progreso General */}
          <Card title="Estado General">
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Progreso General</Text>
              <View style={styles.progressBadgeShadow}>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressText}>{progressPercentage}%</Text>
                </View>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <Animated.View style={[styles.progressBar, { width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
            </View>
            <Text style={styles.progressSubtext}>
              {approvedTurbines} de {totalTurbines} turbinas completadas
            </Text>
          </Card>

          {/* Resumen de Proyectos */}
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.statCard, styles.statCardShadow, { backgroundColor: '#fff', borderColor: '#e2e8f0', borderWidth: 1 }]}
              onPress={() => router.push('/admin/clients')}
              activeOpacity={0.85}
            >
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="office-building" size={28} color="#3949ab" />
              </View>
              <Text style={styles.statValue}>{totalClients}</Text>
              <Text style={styles.statLabel}>Clientes Activos</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.statCard, styles.statCardShadow, { backgroundColor: '#fff', borderColor: '#e2e8f0', borderWidth: 1 }]}
              onPress={() => router.push('/admin/clients')}
              activeOpacity={0.85}
            >
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="folder-multiple" size={28} color="#5c6bc0" />
              </View>
              <Text style={styles.statValue}>{totalProjects}</Text>
              <Text style={styles.statLabel}>Proyectos Totales</Text>
            </TouchableOpacity>
          </View>

          {/* Estadísticas de Turbinas */}
          <Card title="Estado de Turbinas">
            <Text style={styles.sectionTitle}>Estado de Turbinas</Text>
            <View style={styles.turbineStats}>
              <View style={styles.turbineStat}>
                <View style={[styles.statusDot, { backgroundColor: '#fb923c' }]} />
                <Text style={styles.turbineValue}>{inspectedTurbines}</Text>
                <Text style={styles.turbineLabel}>Inspeccionadas</Text>
              </View>
              <View style={styles.turbineStat}>
                <View style={[styles.statusDot, { backgroundColor: '#22c55e' }]} />
                <Text style={styles.turbineValue}>{approvedTurbines}</Text>
                <Text style={styles.turbineLabel}>Aprobadas</Text>
              </View>
              <View style={styles.turbineStat}>
                <View style={[styles.statusDot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.turbineValue}>{totalTurbines - inspectedTurbines - approvedTurbines}</Text>
                <Text style={styles.turbineLabel}>Pendientes</Text>
              </View>
            </View>
          </Card>

          {/* Acciones Rápidas */}
          <Card title="Acción Rápida">
            <Text style={styles.sectionTitle}>Acción Rápida</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/admin/clients')}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={22} color="#3949ab" />
                <Text style={styles.actionButtonText}>Nuevo Cliente</Text>
              </TouchableOpacity>
            </View>
          </Card>
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
  content: {
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  progressBadgeShadow: {
    shadowColor: '#3949ab',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderRadius: 16,
  },
  progressBadge: {
    backgroundColor: '#3949ab',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 56,
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3949ab',
    borderRadius: 5,
  },
  progressSubtext: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statCardShadow: {
    shadowColor: '#3949ab',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 6,
  },
  iconCircle: {
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    padding: 10,
    marginBottom: 8,
  },
  statValue: {
    color: '#1e293b',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#3949ab',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 2,
  },
  turbineStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  turbineStat: {
    alignItems: 'center',
    minWidth: 80,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#3949ab',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  turbineValue: {
    color: '#1e293b',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  turbineLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#3949ab',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#3949ab',
    fontSize: 16,
    fontWeight: '700',
  },
});
