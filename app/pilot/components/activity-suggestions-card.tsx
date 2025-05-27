import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActivitySuggestionsCardProps {
  activities: any[]; // Usando any en lugar de Activity para evitar problemas con tipos
  onActivitySelect: (activityId: string, isTurbineActivity: boolean) => void;
  onClose: () => void;
  onGoToPreflightChecklist?: (turbineId: string, activityId: string) => void; // Added activityId
  terminationType?: 'completed' | 'incident'; // New prop to indicate how the activity ended
}

const ActivitySuggestionsCard: React.FC<ActivitySuggestionsCardProps> = ({
  activities,
  onActivitySelect,
  onClose,
  onGoToPreflightChecklist,
  terminationType = 'completed' // Default to completed for backward compatibility
}) => {  // Determina si una actividad está relacionada con turbinas
  const isTurbineActivity = (activity: any) => {
    return (
      activity.type === 'TURBINE_WORK' || 
      activity.type?.toLowerCase().includes('turbine') ||
      (activity.name || '').toLowerCase().includes('turbina') ||
      (activity.name || '').toLowerCase().includes('aerogenerador')
    );
  };
  // Get the appropriate message based on termination type
  const getHeaderInfo = () => {
    if (terminationType === 'incident') {
      return {
        icon: 'warning' as const,
        color: '#ef4444',
        title: 'Actividad no exitosa',
        subtitle: 'Actividades sugeridas:'
      };
    } else {
      return {
        icon: 'checkmark-circle' as const,
        color: '#10b981',
        title: 'Actividad completada',
        subtitle: 'Próximas actividades:'
      };
    }
  };

  const headerInfo = getHeaderInfo();

  return (    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={headerInfo.icon} size={24} color={headerInfo.color} />
        <Text style={styles.title}>{headerInfo.title}</Text>
      </View>

      <Text style={styles.subtitle}>{headerInfo.subtitle}</Text>

      <View style={styles.activitiesContainer}>
        {activities.map((activity, index) => {
          const isTurbine = isTurbineActivity(activity);
          const turbineId = activity.turbineId || activity.id;
          
          return (
            <TouchableOpacity 
              key={activity.id} 
              style={styles.activityButton}
              onPress={() => onActivitySelect(activity.id, false)}
            >
              <View style={styles.activityNumberContainer}>
                <Text style={styles.activityNumber}>{index + 1}</Text>
              </View>
              
              <View style={styles.activityContent}>
                <Ionicons 
                  name={isTurbine ? "nuclear-outline" : "calendar-outline"} 
                  size={22} 
                  color="#3b82f6" 
                />
                <Text style={styles.activityName} numberOfLines={1} ellipsizeMode="tail">
                  {activity.name}
                </Text>
              </View>
              
              {isTurbine ? (
                <TouchableOpacity 
                  style={styles.preflightButton}
                  onPress={() => onGoToPreflightChecklist && onGoToPreflightChecklist(turbineId, activity.id)} // Pass activity.id
                >
                  <Ionicons name="clipboard-outline" size={16} color="#0369a1" />
                  <Text style={styles.preflightText}>Preflight</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={() => onActivitySelect(activity.id, false)}
                >
                  <Ionicons name="play" size={16} color="#10b981" />
                  <Text style={styles.startText}>Iniciar</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </View>      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={onClose} // Simplificado para llamar directamente a la función onClose
        activeOpacity={0.7}
      >
        <Ionicons name="checkmark-circle-outline" size={18} color="#6b7280" style={{ marginRight: 6 }} />
        <Text style={styles.closeButtonText}>Solo terminar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#10b981',
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 16,
  },
  activitiesContainer: {
    marginBottom: 16,
  },
  activityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  activityNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  activityNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityName: {
    fontSize: 15,
    marginLeft: 10,
    color: '#1f2937',
    flex: 1,
  },
  preflightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  preflightText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0369a1',
    marginLeft: 4,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  startText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10b981',
    marginLeft: 4,
  },  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
  },
  closeButtonText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default ActivitySuggestionsCard;
