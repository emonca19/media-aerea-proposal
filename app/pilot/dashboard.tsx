import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { StatusBadge } from '../../src/components/common';
import { mockActivities, mockProjects, mockTurbines } from '../../src/mocks/data';
import { MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';

export default function PilotDashboard() {
  const router = useRouter();
  const todayActivities = mockActivities.filter(
    activity => new Date(activity.startTime).toDateString() === new Date().toDateString()
  );

  const currentProject = mockProjects[0];
  const pendingTurbines = mockTurbines.filter(t => t.status === 'NOT_STARTED');
  const completedTurbines = mockTurbines.filter(t => t.status === 'COMPLETED');

  // Stats bubbles data
  const stats = [
    { value: pendingTurbines.length, label: 'Pendientes', color: '#f59e0b', bgColor: '#fef3c7' },
    { value: completedTurbines.length, label: 'Completadas', color: '#10b981', bgColor: '#d1fae5' },
    { value: todayActivities.length, label: 'Actividades hoy', color: '#3b82f6', bgColor: '#dbeafe' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Dashboard',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#1e3a8a',
          headerShadowVisible: false
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bienvenido de vuelta,</Text>
          <Text style={styles.pilotName}>Piloto</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: stat.bgColor }]}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Current Project */}
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text" size={20} color="#1e3a8a" />
          <Text style={styles.sectionTitle}>Proyecto actual</Text>
        </View>
        
        <TouchableOpacity style={styles.projectCard}>
          <View style={styles.projectHeader}>
            <MaterialCommunityIcons name="airplane" size={24} color="#1e3a8a" />
            <Text style={styles.projectName}>{currentProject.name}</Text>
            <StatusBadge 
              status={currentProject.status} 
              color={currentProject.status === 'ACTIVE' ? '#10b981' : '#f59e0b'}
            />
          </View>
          
          <View style={styles.projectDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color="#64748b" />
              <Text style={styles.detailText}>
                Fin: {new Date(currentProject.endDate).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="time" size={16} color="#64748b" />
              <Text style={styles.detailText}>
                Progreso: 75%
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Ionicons name="flash" size={20} color="#1e3a8a" />
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        </View>
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/pilot/preflight-checklist')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#e0f2fe' }]}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#0ea5e9" />
            </View>
            <Text style={styles.actionText}>Checklist</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/pilot/activities')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons name="time" size={24} color="#10b981" />
            </View>
            <Text style={styles.actionText}>Actividades</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/pilot/incidents')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="warning" size={24} color="#ef4444" />
            </View>
            <Text style={styles.actionText}>Incidencias</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Turbines */}
        <View style={styles.sectionHeader}>
          <Ionicons name="warning" size={20} color="#1e3a8a" />
          <Text style={styles.sectionTitle}>Turbinas pendientes</Text>
        </View>
        
        {pendingTurbines.length > 0 ? (
          pendingTurbines.map(turbine => (
            <TouchableOpacity 
              key={turbine.id} 
              style={styles.turbineCard}
              onPress={() => router.push(`/pilot/turbine/${turbine.id}`)}
            >
              <View style={styles.turbineInfo}>
                <Ionicons name="md-cog" size={24} color="#f59e0b" />
                <Text style={styles.turbineName}>{turbine.name}</Text>
              </View>
              <AntDesign name="right" size={16} color="#94a3b8" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="check-all" size={48} color="#d1fae5" />
            <Text style={styles.emptyStateText}>¡Todo completado!</Text>
            <Text style={styles.emptyStateSubtext}>No hay turbinas pendientes</Text>
          </View>
        )}

        {/* Today's Activity */}
        <View style={styles.sectionHeader}>
          <Ionicons name="today" size={20} color="#1e3a8a" />
          <Text style={styles.sectionTitle}>Actividad de hoy</Text>
        </View>
        
        {todayActivities.length > 0 ? (
          todayActivities.slice(0, 3).map(activity => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={[styles.activityDot, { backgroundColor: '#0ea5e9' }]} />
                <Text style={styles.activityType}>{activity.type}</Text>
              </View>
              <Text style={styles.activityTime}>
                {new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {activity.endTime && ` - ${new Date(activity.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </Text>
              {activity.notes && (
                <Text style={styles.activityNotes}>{activity.notes}</Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time" size={48} color="#e2e8f0" />
            <Text style={styles.emptyStateText}>No hay actividades hoy</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    color: '#64748b',
    fontSize: 16,
  },
  pilotName: {
    color: '#1e3a8a',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#1e3a8a',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectName: {
    color: '#1e3a8a',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  projectDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: '#64748b',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#1e3a8a',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  turbineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  turbineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  turbineName: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyStateText: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSubtext: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityType: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  activityTime: {
    color: '#64748b',
    fontSize: 14,
    paddingLeft: 16,
  },
  activityNotes: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
});
