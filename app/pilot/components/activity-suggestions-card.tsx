import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActivitySuggestionsCardProps {
  activities: any[]; 
  onActivitySelect: (activityId: string, isTurbineActivity: boolean) => void;
  onClose: () => void;
  onGoToPreflightChecklist?: (turbineId: string, activityId: string) => void;
  terminationType?: 'completed' | 'incident'; 
}

const ActivitySuggestionsCard: React.FC<ActivitySuggestionsCardProps> = ({
  activities,
  onActivitySelect,
  onClose,
  onGoToPreflightChecklist,
  terminationType = 'completed' 
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.98)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150, 
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200, 
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim]);
  
  if (!activities || activities.length === 0) {
    console.log("No activities to suggest, not rendering suggestions card");
    return null;
  }
  
  const isTurbineActivity = (activity: any) => {
    return (
      activity.type === 'TURBINE_WORK' || 
      activity.type?.toLowerCase().includes('turbine') ||
      (activity.name || '').toLowerCase().includes('turbina') ||
      (activity.name || '').toLowerCase().includes('aerogenerador')
    );
  };
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
        color: '#aa74f0',
        title: 'Actividad completada',
        subtitle: 'Próximas actividades:'
      };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: fadeAnim, 
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={styles.header}>
        <Ionicons name={headerInfo.icon} size={24} color={headerInfo.color} />
        <Text style={styles.title}>{headerInfo.title}</Text>
      </View>

      <Text style={styles.subtitle}>{headerInfo.subtitle}</Text>

      <View style={styles.activitiesContainer}>
        {activities.length > 0 ? (
          activities.map((activity, index) => {
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
                    color="#8b5cf6" // Changed to purple
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
          })
        ) : (
          <View style={styles.noActivitiesContainer}>
            <Text style={styles.noActivitiesText}>No hay actividades sugeridas disponibles</Text>
          </View>
        )}
      </View>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={onClose} // Simply close without additional confirmation
      >
        <Ionicons name="checkmark-circle-outline" size={18} color="#6b7280" style={{ marginRight: 6 }} />
        <Text style={styles.closeButtonText}>Cerrar</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    paddingTop: 16, // Reduced from 16 to 12
    paddingBottom: 4, // Increased from 20 to 24
    marginTop: 4, // Less space above the card
    marginBottom: 16, // More space below the card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
    maxWidth: 500,
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
    color: '#8b5cf6', // Changed to purple
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
    backgroundColor: '#8b5cf6', // Changed to purple
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
    backgroundColor: '#f3e8ff', // Changed to purple background
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  preflightText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8b5cf6', // Changed to purple
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
  noActivitiesContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noActivitiesText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ActivitySuggestionsCard;
