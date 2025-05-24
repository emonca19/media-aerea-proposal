import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
}

interface ActivityTimelineProps {
  activities: TimelineActivity[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Línea de tiempo</Text>
        <Ionicons name="trending-up-outline" size={20} color="#22223b" />
      </View>
      <View style={styles.timelineContainer}>
        {activities.map((activity, idx) => (
          <View key={activity.id} style={styles.timelineRow}>
            {/* Línea vertical y círculo del icono */}
            <View style={styles.timelineLineContainer}>
              <View style={styles.timelineIconWrapper}>
                <View style={[styles.timelineIconCircle, { backgroundColor: '#fff', borderColor: activity.statusBg }]}> 
                  {activity.icon}
                </View>
                {idx !== activities.length - 1 && <View style={styles.timelineLine} />}
              </View>
            </View>
            {/* Contenido */}
            <View style={styles.timelineContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={15} color="#9ca3af" style={{ marginRight: 4 }} />
                <Text style={styles.activityTime}>{activity.time}</Text>
                {activity.duration && (
                  <Text style={styles.activityDuration}> · {activity.duration}</Text>
                )}
              </View>
            </View>
            {/* Estado o duración */}
            <View style={[styles.statusBadge, { backgroundColor: activity.statusBg }]}> 
              <Text style={[styles.statusText, { color: activity.statusColor }]}>{activity.statusLabel}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16, // Un poco más grande
    marginVertical: 10, // Un poco más de margen
    shadowColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8, // Un poco más de espacio
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22223b',
    letterSpacing: 0.2,
  },
  timelineContainer: {
    marginTop: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Un poco más de espacio entre actividades
    minHeight: 48, // Un poco más alto
  },
  timelineLineContainer: {
    width: 40, // Un poco más ancho
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'flex-start',
  },
  timelineIconWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: 48, // Un poco más alto
  },
  timelineLine: {
    position: 'absolute',
    top: 30,
    left: 18,
    width: 2,
    height: 32,
    backgroundColor: '#e5e7eb',
    zIndex: 0,
  },
  timelineIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    marginBottom: 1,
    marginTop: 1,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 8,
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#22223b',
    marginBottom: 3,
    letterSpacing: 0.1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  activityTime: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginRight: 2,
  },
  activityDuration: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 2,
  },
  statusBadge: {
    minWidth: 50,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },  statusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});

export default ActivityTimeline;
