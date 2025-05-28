import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Import global state management
import { getCurrentActivities, setGlobalProjectData } from '../../src/utils/globalState';

// Re-export for backward compatibility
export { setGlobalProjectData };

// Mock turbine data - All turbines ready for inspection
const initialTurbines: Turbine[] = [
  {
    id: 'turbine-001',
    name: 'T-001',
    status: 'READY' as TurbineStatus,
    isCompleted: false,
    power: '2.5 MW',
    efficiency: 95,
    lastMaintenance: '2024-05-15',
    currentActivityId: null,
  },
  {
    id: 'turbine-002',
    name: 'T-002',
    status: 'READY' as TurbineStatus,
    isCompleted: false,
    power: '2.5 MW',
    efficiency: 92,
    lastMaintenance: '2024-05-20',
    currentActivityId: null,
  },
  {
    id: 'turbine-003',
    name: 'T-003',
    status: 'READY' as TurbineStatus,
    isCompleted: false,
    power: '2.5 MW',
    efficiency: 88,
    lastMaintenance: '2024-05-10',
    currentActivityId: null,
  },
  {
    id: 'turbine-004',
    name: 'T-004',
    status: 'READY' as TurbineStatus,
    isCompleted: false,
    power: '2.5 MW',
    efficiency: 93,
    lastMaintenance: '2024-05-12',
    currentActivityId: null,
  },
  {
    id: 'turbine-005',
    name: 'T-005',
    status: 'READY' as TurbineStatus,
    isCompleted: false,
    power: '2.5 MW',
    efficiency: 90,
    lastMaintenance: '2024-05-08',
    currentActivityId: null,
  },
  {
    id: 'turbine-006',
    name: 'T-006',
    status: 'READY' as TurbineStatus,
    isCompleted: false,
    power: '2.5 MW',
    efficiency: 87,
    lastMaintenance: '2024-05-05',
    currentActivityId: null,
  },
  {
    id: 'turbine-007',
    name: 'T-007',
    status: 'READY' as TurbineStatus,
    isCompleted: false,
    power: '2.5 MW',
    efficiency: 94,
    lastMaintenance: '2024-05-18',
    currentActivityId: null,
  },
];

type TurbineStatus = 'OPERATIONAL' | 'STANDBY' | 'MAINTENANCE_PLANNED' | 'OFFLINE' | 'READY' | 'ACCESSIBLE' | 'EN_CURSO';

interface Turbine {
  id: string;
  name: string;
  status: TurbineStatus;
  isCompleted: boolean;
  power: string;
  efficiency: number;
  lastMaintenance: string;
  currentActivityId?: string | null;
}

const COLORS = {
  // Backgrounds (exactly matching project-info-menu)
  background: '#f8fafc',
  cardBackground: '#f9fafb',
  cardBackgroundWhite: '#ffffff',
  
  // Primary colors (matching project-info-menu gradients)
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#1d4ed8',
  
  // Text colors (exactly matching project-info-menu)
  textPrimary: '#1f2937',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  textLight: '#4b5563',
  
  // Status colors (exactly matching project-info-menu)
  success: '#10b981',
  successLight: '#059669',
  successBg: '#f0fdf4',
  successBorder: '#bbf7d0',
  warning: '#f59e0b',
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',
  danger: '#ef4444',
  dangerBg: '#fef2f2',
  dangerBorder: '#fecaca',
  inProgress: '#8b5cf6',
  inProgressBg: '#f3f4f6',
  inProgressBorder: '#e5e7eb',
  
  // Icon containers (matching project-info-menu)
  iconContainer: '#eff6ff',
  iconContainerGreen: '#f0fdf4',
  
  // Accent colors
  accent: '#06b6d4',
  
  // Borders and dividers (exactly matching project-info-menu)
  border: '#e5e7eb',
  borderLight: '#e2e8f0',
  
  // Special
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: '#000000',
};

const getTurbineStatusColor = (status?: TurbineStatus | string): string => {
  switch (status) {
    case 'OPERATIONAL':
    case 'READY':
      return '#059669'; // Verde más suave
    case 'STANDBY':
    case 'ACCESSIBLE':
      return '#d97706'; // Naranja más suave
    case 'MAINTENANCE_PLANNED':
      return '#2563eb'; // Azul más suave
    case 'EN_CURSO':
      return '#7c3aed'; // Púrpura más suave
    case 'OFFLINE':
      return '#dc2626'; // Rojo más suave
    default:
      return COLORS.textMuted;
  }
};

const getTurbineStatusText = (status?: TurbineStatus | string): string => {
  switch (status) {
    case 'OPERATIONAL':
      return 'Operacional';
    case 'STANDBY':
      return 'En Espera';
    case 'MAINTENANCE_PLANNED':
      return 'Mantenimiento';
    case 'EN_CURSO':
      return 'En Curso';
    case 'OFFLINE':
      return 'Fuera de Línea';
    case 'READY':
      return 'Listo';
    case 'ACCESSIBLE':
      return 'Accesible';
    default:
      return status || 'Desconocido';
  }
};

const TurbinesStatusScreen = () => {
  const router = useRouter();
  const [turbines, setTurbines] = useState<Turbine[]>(initialTurbines);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  // Filter turbines based on selected filter
  const filteredTurbines = turbines.filter(turbine => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'OPERATIONAL') return turbine.status === 'OPERATIONAL' || turbine.status === 'READY';
    if (selectedFilter === 'MAINTENANCE') return turbine.status === 'MAINTENANCE_PLANNED';
    if (selectedFilter === 'IN_PROGRESS') return turbine.status === 'EN_CURSO';
    if (selectedFilter === 'COMPLETED') return turbine.isCompleted;
    return turbine.status === selectedFilter;
  });

  // Calculate statistics
  const stats = {
    total: turbines.length,
    operational: turbines.filter(t => t.status === 'OPERATIONAL' || t.status === 'READY').length,
    completed: turbines.filter(t => t.isCompleted).length,
    avgEfficiency: Math.round(turbines.reduce((acc, t) => acc + t.efficiency, 0) / turbines.length),
  };

  // Filter Buttons Component
  const FilterButtons = () => {
    const filters = [
      { key: 'ALL', label: 'Todas', count: turbines.length },
      { key: 'OPERATIONAL', label: 'Operativas', count: turbines.filter(t => t.status === 'OPERATIONAL' || t.status === 'READY').length },
      { key: 'MAINTENANCE', label: 'Mantenimiento', count: turbines.filter(t => t.status === 'MAINTENANCE_PLANNED').length },
      { key: 'IN_PROGRESS', label: 'En Curso', count: turbines.filter(t => t.status === 'EN_CURSO').length },
      { key: 'COMPLETED', label: 'Completadas', count: turbines.filter(t => t.isCompleted).length },
    ];

    return (
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.filterButtonTextActive
              ]}>
                {filter.label}
              </Text>
              <View style={[
                styles.filterCount,
                selectedFilter === filter.key && styles.filterCountActive
              ]}>
                <Text style={[
                  styles.filterCountText,
                  selectedFilter === filter.key && styles.filterCountTextActive
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Update turbine statuses based on current activities
  useEffect(() => {
    const updateTurbineStatuses = () => {
      const activities = getCurrentActivities();
      const ongoingActivities = activities.filter((act: any) => act.status === 'EN_PROGRESO');
      const completedActivities = activities.filter((act: any) => act.status === 'COMPLETADA');
      
      setTurbines(prevTurbines => 
        prevTurbines.map(turbine => {
          // Check if there's an ongoing activity for this turbine
          const ongoingActivity = ongoingActivities.find((act: any) => {
            const activityTurbineId = act.turbineId;
            const turbineId = turbine.id;
            
            return activityTurbineId === turbineId ||
                   activityTurbineId === turbineId.replace(/-/g, '_') ||
                   activityTurbineId === turbineId.replace(/_/g, '-') ||
                   act.name?.toLowerCase().includes(turbine.name.toLowerCase()) ||
                   (act.type === 'TURBINE_WORK' && act.name?.includes(turbine.name));
          });

          // Check if there's a recently completed activity for this turbine
          const recentlyCompletedActivity = completedActivities.find((act: any) => {
            const activityTurbineId = act.turbineId;
            const turbineId = turbine.id;
            
            const completedTime = new Date(act.actualEnd || act.scheduledEnd || 0).getTime();
            const now = Date.now();
            const isRecent = (now - completedTime) < 10000; // 10 seconds
            
            const matchesTurbine = activityTurbineId === turbineId ||
                                  activityTurbineId === turbineId.replace(/-/g, '_') ||
                                  activityTurbineId === turbineId.replace(/_/g, '-') ||
                                  act.name?.toLowerCase().includes(turbine.name.toLowerCase()) ||
                                  (act.type === 'TURBINE_WORK' && act.name?.includes(turbine.name));
            
            return matchesTurbine && isRecent;
          });

          if (ongoingActivity) {
            return {
              ...turbine,
              status: 'EN_CURSO' as TurbineStatus,
              currentActivityId: ongoingActivity.id,
              isCompleted: false,
            };
          } else if (recentlyCompletedActivity) {
            return {
              ...turbine,
              status: 'OPERATIONAL' as TurbineStatus,
              currentActivityId: null,
              isCompleted: true,
            };
          } else {
            const originalTurbine = initialTurbines.find(t => t.id === turbine.id);
            return {
              ...turbine,
              status: originalTurbine?.status || turbine.status,
              currentActivityId: null,
              isCompleted: turbine.isCompleted || false,
            };
          }
        })
      );
    };

    updateTurbineStatuses();
    const interval = setInterval(updateTurbineStatuses, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleTurbinePress = (turbine: Turbine) => {
    if (turbine.status === 'EN_CURSO' && turbine.currentActivityId) {
      router.push('/pilot/dashboard');
      return;
    }

    if (turbine.isCompleted) {
      return;
    }

    const temporaryActivityId = `turbine-activity-${turbine.id}-${Date.now()}`;
    
    router.push({
      pathname: '/pilot/preflight-checklist',
      params: { 
        turbineId: turbine.id,
        activityToStart: temporaryActivityId,
        isNewTurbineActivity: 'true',
        turbineName: turbine.name
      }
    });
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Stack.Screen 
        options={{ 
          title: 'Estado de Turbinas',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: { fontWeight: '600', fontSize: 18, color: COLORS.textPrimary },
          headerShadowVisible: false,
        }}
      />
      
      {/* Minimalist Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleSection}>
            <Text style={styles.headerTitle}>Turbinas</Text>
            <Text style={styles.headerSubtitle}>Parque Eólico Sierra Norte</Text>
          </View>
          
          {/* Clean Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completadas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total - stats.completed}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Filter Buttons */}
      <FilterButtons />
      
      {/* Enhanced Turbines Grid */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.turbinesGrid}>
          {filteredTurbines.map((turbine) => (
            <TouchableOpacity
              key={turbine.id}
              style={[
                styles.turbineCard,
                turbine.isCompleted && styles.turbineCardCompleted,
                turbine.status === 'EN_CURSO' && styles.turbineCardInProgress
              ]}
              onPress={() => handleTurbinePress(turbine)}
              activeOpacity={0.7}
            >
              {/* Status Indicator */}
              <View style={[
                styles.statusIndicator,
                { backgroundColor: getTurbineStatusColor(turbine.status) }
              ]} />
              
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.turbineIconContainer}>
                  <LinearGradient
                    colors={turbine.isCompleted 
                      ? ['#10b981', '#059669'] 
                      : turbine.status === 'EN_CURSO'
                      ? ['#3b82f6', '#1d4ed8']
                      : ['#f3f4f6', '#e5e7eb']
                    }
                    style={styles.turbineIconGradient}
                  >
                    <Ionicons 
                      name={turbine.isCompleted ? "checkmark" : "nuclear-outline"} 
                      size={18} 
                      color={turbine.isCompleted || turbine.status === 'EN_CURSO' ? "#fff" : "#6b7280"} 
                    />
                  </LinearGradient>
                </View>
                
                <View style={styles.turbineInfo}>
                  <Text style={styles.turbineName}>{turbine.name}</Text>
                  <Text style={[
                    styles.turbineStatus,
                    { color: getTurbineStatusColor(turbine.status) }
                  ]}>
                    {getTurbineStatusText(turbine.status)}
                  </Text>
                </View>
                
                {/* Action Badge */}
                <View style={[
                  styles.actionBadge,
                  turbine.isCompleted && styles.actionBadgeCompleted,
                  turbine.status === 'EN_CURSO' && styles.actionBadgeInProgress
                ]}>
                  <Ionicons 
                    name={
                      turbine.isCompleted ? "checkmark" :
                      turbine.status === 'EN_CURSO' ? "play" :
                      "chevron-forward"
                    } 
                    size={12} 
                    color="#fff" 
                  />
                </View>
              </View>

              {/* Card Content */}
              <View style={styles.cardContent}>
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <View style={styles.metricIconContainer}>
                      <Ionicons name="flash" size={12} color="#3b82f6" />
                    </View>
                    <Text style={styles.metricValue}>{turbine.power}</Text>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <View style={styles.metricIconContainer}>
                      <Ionicons name="speedometer" size={12} color="#10b981" />
                    </View>
                    <Text style={styles.metricValue}>{turbine.efficiency}%</Text>
                  </View>
                </View>
                
                <View style={styles.lastMaintenanceContainer}>
                  <Ionicons name="build-outline" size={10} color="#9ca3af" />
                  <Text style={styles.lastMaintenanceText}>
                    {new Date(turbine.lastMaintenance).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </Text>
                </View>
              </View>

              {/* Progress Indicator for Completed */}
              {turbine.isCompleted && (
                <View style={styles.completedOverlay}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.completedText}>Completada</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Empty State */}
        {filteredTurbines.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIconContainer}>
              <Ionicons name="search" size={48} color="#9ca3af" />
            </View>
            <Text style={styles.emptyStateTitle}>No se encontraron turbinas</Text>
            <Text style={styles.emptyStateSubtitle}>
              Intenta cambiar los filtros para ver más resultados
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Minimalist Header
  headerContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleSection: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 4,
  },
  
  // Filter styles
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  filterScrollContent: {
    paddingVertical: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginRight: 6,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  filterCount: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterCountTextActive: {
    color: COLORS.white,
  },
  
  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  
  // Minimalist Grid Layout
  turbinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  // Clean Cards
  turbineCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    position: 'relative',
  },
  turbineCardCompleted: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
  },
  turbineCardInProgress: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  
  // Status Indicator
  statusIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  
  // Card Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
  },
  turbineIconContainer: {
    marginRight: 10,
  },
  turbineIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turbineInfo: {
    flex: 1,
  },
  turbineName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 1,
  },
  turbineStatus: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadgeCompleted: {
    backgroundColor: COLORS.success,
  },
  actionBadgeInProgress: {
    backgroundColor: COLORS.primary,
  },
  
  // Card Content
  cardContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 1,
  },
  metricIconContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  lastMaintenanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  lastMaintenanceText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 3,
    fontWeight: '500',
  },
  
  // Completed Overlay
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  completedText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  
  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  emptyStateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 18,
  },
});

export default TurbinesStatusScreen;
