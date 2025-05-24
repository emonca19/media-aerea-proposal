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

const styles = StyleSheet.create({  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: -7,
    marginBottom: 10,
    shadowColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    marginBottom: 16,
    minHeight: 80,
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
  },
  statusBadge: {
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
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ActivityTimeline;
