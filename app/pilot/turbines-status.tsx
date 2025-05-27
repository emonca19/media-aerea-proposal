import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Import global state management
import { getCurrentActivities, setGlobalProjectData } from '../../src/utils/globalState';

// Re-export for backward compatibility
export { setGlobalProjectData };

// Mock turbine data that will be updated with activity status
const initialTurbines = [
  {
    id: 'turbine-001',
    name: 'T-001',
    status: 'OPERATIONAL',
    isCompleted: false,
    power: '2.5 MW',
    efficiency: 87,
    lastMaintenance: '2024-01-15',
    currentActivityId: null,
  },
  {
    id: 'turbine-002',
    name: 'T-002',
    status: 'STANDBY',
    isCompleted: false,
    power: '2.5 MW',
    efficiency: 92,
    lastMaintenance: '2024-01-20',
    currentActivityId: null,
  },
  {
    id: 'turbine-003',
    name: 'T-003',
    status: 'MAINTENANCE_PLANNED',
    isCompleted: true,
    power: '2.5 MW',
    efficiency: 0,
    lastMaintenance: '2024-01-10',
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
  background: '#f8fafc',
  cardBackground: '#ffffff',
  primary: '#2563eb',
  primaryLight: '#eff6ff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e5e7eb',
  borderLight: '#f1f5f9',
  success: '#059669',
  successLight: '#ecfdf5',
  danger: '#ef4444',
  dangerLight: '#fef2f2',
  warning: '#f59e0b',
  warningLight: '#fffbeb',
  iconDefault: '#64748b',
  white: '#ffffff',
  inProgress: '#3b82f6',
  inProgressLight: '#dbeafe',
};

const getTurbineStatusColor = (status?: TurbineStatus | string): string => {
  switch (status) {
    case 'OPERATIONAL':
    case 'READY':
      return COLORS.success;
    case 'STANDBY':
    case 'ACCESSIBLE':
      return COLORS.warning;
    case 'MAINTENANCE_PLANNED':
      return COLORS.primary;
    case 'EN_CURSO':
      return COLORS.inProgress;
    case 'OFFLINE':
      return COLORS.danger;
    default:
      return COLORS.textMuted;
  }
};

const getTurbineStatusIcon = (status?: TurbineStatus | string) => {
  const color = getTurbineStatusColor(status);
  switch (status) {
    case 'OPERATIONAL':
    case 'READY':
      return <Ionicons name="checkmark-circle" size={22} color={color} />;
    case 'STANDBY':
    case 'ACCESSIBLE':
      return <Ionicons name="pause-circle" size={22} color={color} />;
    case 'MAINTENANCE_PLANNED':
      return <Ionicons name="construct" size={22} color={color} />;
    case 'EN_CURSO':
      return <Ionicons name="play-circle" size={22} color={color} />;
    case 'OFFLINE':
      return <Ionicons name="close-circle" size={22} color={color} />;
    default:
      return <Ionicons name="help-circle-outline" size={22} color={color} />;
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

  // Update turbine statuses based on current activities
  useEffect(() => {
    const updateTurbineStatuses = () => {
      const activities = getCurrentActivities();
      const ongoingActivities = activities.filter((act: any) => act.status === 'EN_PROGRESO');
      const completedActivities = activities.filter((act: any) => act.status === 'COMPLETADA');
      
      console.log('Activities found:', {
        total: activities.length,
        ongoing: ongoingActivities.length,
        completed: completedActivities.length
      });
      
      setTurbines(prevTurbines => 
        prevTurbines.map(turbine => {
          // Check if there's an ongoing activity for this turbine
          const ongoingActivity = ongoingActivities.find((act: any) => {
            const activityTurbineId = act.turbineId;
            const turbineId = turbine.id;
            
            // Try multiple matching patterns
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
            
            // Check if completed in the last 10 seconds
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
            console.log(`Setting turbine ${turbine.name} to EN_CURSO due to activity:`, ongoingActivity.name);
            return {
              ...turbine,
              status: 'EN_CURSO' as TurbineStatus,
              currentActivityId: ongoingActivity.id,
              isCompleted: false,
            };
          } else if (recentlyCompletedActivity) {
            console.log(`Setting turbine ${turbine.name} to completed due to recent activity:`, recentlyCompletedActivity.name);
            return {
              ...turbine,
              status: 'OPERATIONAL' as TurbineStatus,
              currentActivityId: null,
              isCompleted: true,
            };
          } else {
            // Reset to original status if no ongoing or recent activity
            const originalTurbine = initialTurbines.find(t => t.id === turbine.id);
            return {
              ...turbine,
              status: originalTurbine?.status || turbine.status,
              currentActivityId: null,
              // Keep completed status if it was already completed
              isCompleted: turbine.isCompleted || false,
            };
          }
        })
      );
    };

    // Update immediately
    updateTurbineStatuses();

    // Set up periodic updates
    const interval = setInterval(updateTurbineStatuses, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleTurbinePress = (turbine: Turbine) => {
    // If turbine has ongoing activity, navigate to dashboard
    if (turbine.status === 'EN_CURSO' && turbine.currentActivityId) {
      router.push('/pilot/dashboard');
      return;
    }

    // If turbine is already completed, don't allow new activities
    if (turbine.isCompleted) {
      return;
    }

    // Generate a unique activity ID for this turbine
    const temporaryActivityId = `turbine-activity-${turbine.id}-${Date.now()}`;
    
    console.log("Navigating to preflight with params:", {
      turbineId: turbine.id,
      activityToStart: temporaryActivityId,
      isNewTurbineActivity: 'true',
      turbineName: turbine.name
    });
    
    // Navigate to preflight checklist
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
      <Stack.Screen 
        options={{ 
          title: 'Estado de Turbinas',
          headerStyle: { backgroundColor: COLORS.cardBackground },
          headerTintColor: COLORS.primary,
          headerTitleStyle: { fontWeight: '600', fontSize: 17, color: COLORS.textPrimary },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {turbines.map((turbine) => (
          <TouchableOpacity
            key={turbine.id}
            style={[
              styles.turbineCard,
              turbine.isCompleted && styles.turbineCardCompleted,
              turbine.status === 'EN_CURSO' && styles.turbineCardInProgress
            ]}
            onPress={() => handleTurbinePress(turbine)}
            activeOpacity={turbine.isCompleted ? 1 : 0.7}
          >
            <View style={styles.turbineHeader}>
              <View style={styles.turbineNameSection}>
                <Text style={styles.turbineName}>{turbine.name}</Text>
                <View style={styles.statusContainer}>
                  {getTurbineStatusIcon(turbine.status)}
                  <Text style={[styles.statusText, { color: getTurbineStatusColor(turbine.status) }]}>
                    {getTurbineStatusText(turbine.status)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.actionSection}>
                {turbine.isCompleted ? (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                    <Text style={styles.completedText}>Completado</Text>
                  </View>
                ) : turbine.status === 'EN_CURSO' ? (
                  <View style={styles.inProgressBadge}>
                    <Ionicons name="play" size={16} color={COLORS.white} />
                    <Text style={styles.inProgressText}>En Curso</Text>
                  </View>
                ) : (
                  <View style={styles.startButton}>
                    <Ionicons name="play" size={16} color={COLORS.white} />
                    <Text style={styles.startButtonText}>Iniciar</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.turbineDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="flash" size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{turbine.power}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="speedometer" size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{turbine.efficiency}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="build" size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>
                  {new Date(turbine.lastMaintenance).toLocaleDateString('es-ES')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  turbineCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  turbineCardCompleted: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
    opacity: 0.7,
  },
  turbineCardInProgress: {
    backgroundColor: COLORS.inProgressLight,
    borderColor: COLORS.inProgress,
    borderWidth: 2,
  },
  turbineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  turbineNameSection: {
    flex: 1,
  },
  turbineName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionSection: {
    alignItems: 'flex-end',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  completedText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  inProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inProgress,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  inProgressText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  turbineDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default TurbinesStatusScreen;
