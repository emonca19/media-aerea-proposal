import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Ejemplo de datos de actividades para la línea de tiempo
export interface TimelineActivity {
  id: string;
  icon: React.ReactNode;
  title: string;
  time: string;
  duration?: string;
  statusColor: string;
  statusLabel: string;
  statusBg: string;
  isPaused?: boolean;
  isTurbineWork?: boolean;
  turbineId?: string;
}

interface ActivityTimelineProps {
  activities: TimelineActivity[];
  onViewHistory?: () => void;
  onGoToPreflightChecklist?: (turbineId?: string) => void;
  onItemPress?: (item: TimelineActivity) => void;
  onActionPress?: (action: string, activityId: string, turbineId?: string) => void;
  currentOngoingActivityId?: string;
  activityPauseState?: { isPaused: boolean; reason?: string; start?: string; end?: string };
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ 
  activities, 
  onViewHistory, 
  onGoToPreflightChecklist, 
  onItemPress,
  onActionPress,
  currentOngoingActivityId,
  activityPauseState
}) => {  
  const router = useRouter();
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Línea de tiempo</Text>
        <Ionicons name="trending-up-outline" size={20} color="#22223b" />
      </View>
      <View style={styles.timelineContainer}>
        {activities.length > 0 ? (
          activities.map((activity, idx) => (
            <View key={activity.id} style={styles.timelineRow}>
              {/* Línea vertical y círculo del icono */}
            <View style={styles.timelineLineContainer}>
                <View style={styles.timelineIconWrapper}>
                <View 
                    style={[
                      styles.timelineIconCircle, 
                      { 
                        backgroundColor: '#fff', 
                        borderColor: activity.isPaused ? '#dc2626' : activity.statusBg 
                      }
                    ]}> 
                    {/* Aseguramos que siempre haya un icono, y que sea rojo si está pausada */}
                    <TouchableOpacity
                      onPress={() => onItemPress && onItemPress(activity)}
                      activeOpacity={0.7}
                    >
                      {activity.icon ? activity.icon : 
                        <Ionicons name="briefcase-outline" size={28} color={activity.isPaused ? "#dc2626" : "#3b82f6"} />}
                    </TouchableOpacity>
                  </View>
                  {idx !== activities.length - 1 && <View style={styles.timelineLine} />}
                </View>
              </View>
              {/* Contenido */}
              <View style={styles.timelineContent}>
                <TouchableOpacity
                  onPress={() => onItemPress && onItemPress(activity)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={15} color="#9ca3af" style={{ marginRight: 4 }} />
                    <Text style={styles.activityTime}>{activity.time}</Text>
                    {activity.duration && (
                      <Text style={styles.activityDuration}> · {activity.duration}</Text>
                    )}
                  </View>                {/* Action buttons for activities - Simplificado a solo mostrar el botón Iniciar */}
                  {onActionPress && (
                    <View style={styles.actionButtonsRow}>
                      {/* Solo mostrar el botón "Iniciar" para actividades pendientes */}
                      {activity.statusLabel === "Próxima" && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => onActionPress("start_pending", activity.id)}
                        >
                          <Ionicons name="play" size={14} color="#3b82f6" />
                          <Text style={styles.actionButtonText}>Iniciar</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </View>            {/* Estado o duración */}            <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: activity.isPaused ? '#fee2e2' : activity.statusBg }
                ]}> 
                  <Text style={[
                    styles.statusText, 
                    { color: activity.isPaused ? '#dc2626' : activity.statusColor }
                  ]}>
                    {activity.statusLabel}
                  </Text>
                </View>
              </View>
            </View>        ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="time-outline" size={32} color="#9ca3af" />
            <Text style={styles.emptyStateText}>No hay actividades pendientes</Text>
            <Text style={styles.emptyStateSubtext}>Las nuevas actividades aparecerán aquí</Text>
          </View>
        )}

        {/* History button - always visible inside timeline container */}
        {onViewHistory && (
          <TouchableOpacity 
            style={styles.historyButton} 
            onPress={() => {
              if (Platform.OS === 'web') {
                window.location.href = '/pilot/activity-log?initialTab=activities';
              } else {
                router.push('/pilot/activity-log?initialTab=activities');
              }
            }}
          >
            <Ionicons name="time-outline" size={18} color="#6b7280" />
            <Text style={styles.historyButtonText}>Ver historial completo</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: -7,
    marginBottom: 8,
    shadowColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22223b',
  },
  timelineContainer: {
    marginTop: 0,
  },  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    minHeight: 60,
    paddingVertical: 4,
  },
  timelineLineContainer: {
    width: 40,
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  timelineIconWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: 60,
  },  timelineLine: {
    position: 'absolute',
    top: 36,
    left: 18,
    width: 2,
    height: 64,
    backgroundColor: '#e5e7eb',
    zIndex: 0,
  },
  timelineIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    marginBottom: 2,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 8,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#22223b',
    marginBottom: 6,
    lineHeight: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginRight: 4,
  },
  activityDuration: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },  statusBadge: {
    minWidth: 60,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },  preflightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#7dd3fc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 8,
    gap: 6,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  preflightButtonText: {
    fontSize: 11,
    color: '#0369a1',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historyButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginHorizontal: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },  actionButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
});

export default ActivityTimeline;
