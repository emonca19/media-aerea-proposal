// app/pilot/dashboard/project-details-card.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Definición de la interfaz Activity
interface Activity {
  id: string;
  name: string;
  status: string;
  time?: string;
  description?: string;
}

// Props esperadas por ProjectDetailsCard
interface ProjectForCard {
  id?: string;
  name?: string;
  client?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  drone?: string;
}

interface ProjectDetailsCardProps {
  project?: ProjectForCard;
  ongoingActivities?: Activity[];
  pendingActivities?: Activity[];
  isVisible: boolean;
  onToggleVisibility: () => void;
  onFinishActivity?: (activityId: string) => void;
  onStartActivity?: (activityId: string) => void;
  onViewHistory?: () => void;
}

// Componente InfoRow
const InfoRow = ({ iconName, label, value }: { iconName: keyof typeof Ionicons.glyphMap, label: string, value: string | undefined }) => (
  <View style={cardStyles.infoRow_projectDetail}>
    <Ionicons name={iconName} size={16} color={cardStyles.infoRow_icon.color} style={cardStyles.infoRow_icon} />
    <Text style={cardStyles.infoRow_label}>{label}</Text>
    <Text style={cardStyles.infoRow_value} numberOfLines={1} ellipsizeMode="tail">{value || 'N/A'}</Text>
  </View>
);

// Componente ActivityItem
const ActivityItem = React.memo(({ 
  activity, 
  isOngoing,
  onFinish,
  onStart 
}: { 
  activity: Activity, 
  isOngoing: boolean,
  onFinish?: () => void,
  onStart?: () => void
}) => {
  return (
    <View style={cardStyles.activityItem}>
      <View style={cardStyles.activityContent}>
        <Text style={cardStyles.activityName}>{activity.name}</Text>
        {activity.time && (
          <Text style={cardStyles.activityTime}>{activity.time}</Text>
        )}
      </View>
      <TouchableOpacity 
        style={[
          cardStyles.activityButton,
          isOngoing ? cardStyles.finishButton : cardStyles.startButton
        ]}
        onPress={isOngoing ? onFinish : onStart}
      >
        <Ionicons 
          name={isOngoing ? "checkmark-circle-outline" : "play-circle-outline"} 
          size={24} 
          color={isOngoing ? "#10b981" : "#2563eb"} 
        />
      </TouchableOpacity>
    </View>
  );
});
ActivityItem.displayName = "ActivityItem";

const ProjectDetailsCard: React.FC<ProjectDetailsCardProps> = ({
  project,
  ongoingActivities = [],
  pendingActivities = [],
  isVisible,
  onToggleVisibility,
  onFinishActivity,
  onStartActivity,
  onViewHistory,
}) => {
  if (!project || typeof project.name === 'undefined') {
    return (
      <View style={[cardStyles.card_container, cardStyles.loadingContainer]}>
        <Text style={cardStyles.loadingText}>Cargando detalles del proyecto...</Text>
      </View>
    );
  }

  const totalActivities = ongoingActivities.length + pendingActivities.length;

  return (
    <View style={cardStyles.card_container}>
      <TouchableOpacity onPress={onToggleVisibility} style={cardStyles.cardHeaderTouchable}>
        <View style={cardStyles.titleContainer}>
          <Text style={cardStyles.card_title_large}>Mi Jornada Hoy</Text>
          <View style={cardStyles.badge}>
            <Text style={cardStyles.badgeText}>
              {totalActivities > 0 ? `${ongoingActivities.length} En Curso • ${pendingActivities.length} Pendiente${pendingActivities.length !== 1 ? 's' : ''}` : "Sin Actividades"}
            </Text>
          </View>
        </View>
        <Ionicons name={isVisible ? "chevron-up-outline" : "chevron-down-outline"} size={24} color="#1f2937" />
      </TouchableOpacity>

      {isVisible && (
        <>
          <View style={cardStyles.projectBrief_container}>
            <Text style={cardStyles.projectBrief_name}>{project.name || 'Proyecto sin Nombre'}</Text>
            <InfoRow iconName="business-outline" label="Cliente:" value={project.client} />
            <InfoRow iconName="map-outline" label="Parque:" value={project.location?.split(',')[0]} />
            <InfoRow iconName="calendar-outline" label="Fechas:" value={project.startDate && project.endDate ? `${project.startDate.substring(0,10)} - ${project.endDate.substring(0,10)}` : undefined} />
            <InfoRow iconName="airplane-outline" label="Drone:" value={project.drone} />
          </View>
          
          <View style={cardStyles.activitiesContainer}>
            {ongoingActivities.length > 0 && (
              <>
                <Text style={cardStyles.sectionTitle}>Actividades en Curso</Text>
                <FlatList
                  data={ongoingActivities}
                  renderItem={({ item }) => (
                    <ActivityItem
                      activity={item}
                      isOngoing={true}
                      onFinish={() => onFinishActivity?.(item.id)}
                    />
                  )
                  }
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={cardStyles.separator} />}
                />
              </>
            )}

            {pendingActivities.length > 0 && (
              <>
                <Text style={[cardStyles.sectionTitle, cardStyles.pendingTitle]}>Actividades Pendientes</Text>
                <FlatList
                  data={pendingActivities}
                  renderItem={({ item }) => (
                    <ActivityItem
                      activity={item}
                      isOngoing={false}
                      onStart={() => onStartActivity?.(item.id)}
                    />
                  )}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={cardStyles.separator} />}
                />
              </>
            )}

            {totalActivities === 0 && (
              <View style={cardStyles.emptyState}>
                <Ionicons name="file-tray-outline" size={48} color="#9ca3af" />
                <Text style={cardStyles.emptyStateText}>No hay actividades programadas</Text>
              </View>
            )}

            <TouchableOpacity 
              style={cardStyles.historyButton} 
              onPress={onViewHistory}
            >
              <View style={cardStyles.historyButtonContent}>
                <Ionicons name="time-outline" size={20} color="#4b5563" />
                <Text style={cardStyles.historyButtonText}>Ver Historial Completo</Text>
                <Ionicons name="chevron-forward-outline" size={20} color="#4b5563" />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card_container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  cardHeaderTouchable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  card_title_large: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  badge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  projectBrief_container: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 16,
  },
  projectBrief_name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  infoRow_projectDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoRow_icon: {
    marginRight: 8,
    color: '#6b7280',
  },
  infoRow_label: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
    width: 75,
  },
  infoRow_value: {
    fontSize: 14,
    color: '#1e3a8a',
    flex: 1,
  },
  activitiesContainer: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  pendingTitle: {
    marginTop: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  activityTime: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  activityButton: {
    padding: 8,
    borderRadius: 20,
  },
  finishButton: {
    backgroundColor: '#dcfce7',
  },
  startButton: {
    backgroundColor: '#dbeafe',
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  historyButton: {
    marginTop: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
  },
  historyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  historyButtonText: {
    color: '#4b5563',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default ProjectDetailsCard;