// app/pilot/dashboard/components/ActivitiesDisplayList.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet as CompStyles } from 'react-native';

// Define la interfaz para una actividad individual (debe coincidir con PilotDashboard)
interface Activity {
  id: string; name: string; time?: string; status: string; type?: string;
  description?: string; scheduledStart?: string | null; scheduledEnd?: string | null;
  actualStart?: string | null; actualEnd?: string | null; notes?: string;
}

interface ActivitiesDisplayListProps {
  lists?: { // lists puede ser undefined
    ongoing?: Activity[]; // las sub-listas pueden ser undefined o array vacío
    pendingToday?: Activity[];
    genericPending?: Activity[];
    unassignedTime?: Activity[];
    past?: Activity[];
  };
  onActivityAction: (activityId: string, newStatus: string, taskType?: string) => void;
  getStatusStyling: (status: string) => { icon: keyof typeof Ionicons.glyphMap; color: string };
  onViewDetails?: (activity: Activity) => void;
}

const ActivityItem = React.memo(({ item, onActivityAction, getStatusStyling, onViewDetails }: { item: Activity, onActivityAction: ActivitiesDisplayListProps['onActivityAction'], getStatusStyling: ActivitiesDisplayListProps['getStatusStyling'], onViewDetails?: ActivitiesDisplayListProps['onViewDetails'] }) => {
  // console.log(`ActivityItem RENDERED - ID: ${item.id}`); // Descomentar para depurar renders de items
  const { icon, color } = getStatusStyling(item.status);

  const handlePressAction = (newStatus: string) => {
    onActivityAction(item.id, newStatus, item.status);
  };

  // Estandarizar estados para la lógica de botones
  const normalizedStatus = item.status?.toUpperCase().replace(' ', '_');

  return (
    <TouchableOpacity
      style={styles.activityItem_container}
      onPress={() => onViewDetails && onViewDetails(item)}
      activeOpacity={onViewDetails ? 0.7 : 1}
    >
      <View style={styles.activityItem_iconContainer}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <View style={styles.activityItem_detailsContainer}>
        <Text style={styles.activityItem_name} numberOfLines={1}>{item.name || "Actividad sin nombre"}</Text>
        {item.time && <Text style={styles.activityItem_time}>{item.time}</Text>}
        {item.description && <Text style={styles.activityItem_description} numberOfLines={1}>{item.description}</Text>}
      </View>
      <View style={styles.activityItem_actionsContainer}>
        {normalizedStatus === 'PENDIENTE' || normalizedStatus === 'POR_ASIGNAR' ? (
          <TouchableOpacity style={[styles.activityItem_actionButton, styles.activityItem_actionButtonStart]} onPress={() => handlePressAction('EN_PROGRESO')}>
            <Ionicons name="play-circle-outline" size={28} color="#2563eb" />
          </TouchableOpacity>
        ) : normalizedStatus === 'EN_PROGRESO' ? (
          <TouchableOpacity style={[styles.activityItem_actionButton, styles.activityItem_actionButtonComplete]} onPress={() => handlePressAction('COMPLETADA')}>
            <Ionicons name="checkmark-circle-outline" size={28} color="#10b981" />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});
ActivityItem.displayName = "ActivityItem";


const ListSection = ({ title, data, onActivityAction, getStatusStyling, onViewDetails, ListEmptyComponent }: {
    title: string,
    data?: Activity[], // data puede ser undefined
    onActivityAction: ActivitiesDisplayListProps['onActivityAction'],
    getStatusStyling: ActivitiesDisplayListProps['getStatusStyling'],
    onViewDetails?: ActivitiesDisplayListProps['onViewDetails'],
    ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null
}) => {
  const validData = Array.isArray(data) ? data : []; // Asegura que data sea un array

  if (validData.length === 0 && ListEmptyComponent) { // Mostrar ListEmptyComponent si no hay datos
    return <>{ListEmptyComponent}</>;
  }
  if (validData.length === 0 && !ListEmptyComponent) { // No mostrar nada si no hay datos y no hay ListEmptyComponent
      return null;
  }

  return (
    <View style={styles.activitySection_container}>
      <Text style={styles.activitySection_title}>{title}</Text>
      <FlatList
        data={validData}
        renderItem={({ item }) => <ActivityItem item={item} onActivityAction={onActivityAction} getStatusStyling={getStatusStyling} onViewDetails={onViewDetails} />}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.activityItem_separator} />}
        scrollEnabled={false}
      />
    </View>
  );
};

// Exportación NOMBRADA para este componente
const ActivitiesDisplayListComponent: React.FC<ActivitiesDisplayListProps> = ({
  lists,
  onActivityAction,
  getStatusStyling,
  onViewDetails
}) => {
  console.log('ActivitiesDisplayList RENDERED. Received lists prop:', lists);
  console.log('ActivitiesDisplayList: lists.ongoing count =', lists?.ongoing?.length);


  const safeLists = {
    ongoing: lists?.ongoing || [],
    pendingToday: lists?.pendingToday || [],
    genericPending: lists?.genericPending || [],
    unassignedTime: lists?.unassignedTime || [],
    past: lists?.past || [],
  };

  if (!lists) {
    console.warn('ActivitiesDisplayList: lists prop is undefined. Displaying loading state.');
    return (
      <View style={styles.card_container}>
        <Text style={styles.card_title_large}>Plan de Hoy y Actividades</Text>
        <View style={styles.noActivities_container}>
          <Ionicons name="hourglass-outline" size={48} color="#9ca3af" style={styles.noActivities_icon} />
          <Text style={styles.noActivities_text}>Cargando actividades...</Text>
        </View>
      </View>
    );
  }

  const NoActivitiesComponent = (message: string) => (
    <View style={styles.noActivities_container}>
      <Ionicons name="file-tray-stacked-outline" size={48} color="#9ca3af" style={styles.noActivities_icon} />
      <Text style={styles.noActivities_text}>{message}</Text>
    </View>
  );

  return (
    <View style={styles.card_container}>
      <Text style={styles.card_title_large}>Plan de Hoy y Actividades</Text>

      <ListSection title="En Curso" data={safeLists.ongoing} onActivityAction={onActivityAction} getStatusStyling={getStatusStyling} onViewDetails={onViewDetails} ListEmptyComponent={NoActivitiesComponent("Ninguna actividad en progreso.")} />
      <ListSection title="Pendientes (Hoy)" data={safeLists.pendingToday} onActivityAction={onActivityAction} getStatusStyling={getStatusStyling} onViewDetails={onViewDetails} ListEmptyComponent={NoActivitiesComponent("No hay actividades programadas para hoy.")}/>
      {(safeLists.unassignedTime?.length ?? 0) > 0 && (
        <ListSection title="Tareas Programadas (Sin Hora)" data={safeLists.unassignedTime} onActivityAction={onActivityAction} getStatusStyling={getStatusStyling} onViewDetails={onViewDetails} ListEmptyComponent={NoActivitiesComponent("No hay tareas programadas sin hora específica.")}/>
      )}
      <ListSection title="Otras Pendientes" data={safeLists.genericPending} onActivityAction={onActivityAction} getStatusStyling={getStatusStyling} onViewDetails={onViewDetails} ListEmptyComponent={NoActivitiesComponent("No hay otras actividades pendientes.")}/>
      <ListSection title="Historial Reciente" data={safeLists.past.slice(0, 5)} onActivityAction={onActivityAction} getStatusStyling={getStatusStyling} onViewDetails={onViewDetails} ListEmptyComponent={NoActivitiesComponent("No hay actividades completadas recientemente.")}/>

      {(safeLists.past?.length ?? 0) > 5 && (
        <TouchableOpacity style={styles.seeMoreButton_container} onPress={() => console.log('Ver historial completo')}>
          <Text style={styles.seeMoreButton_text}>Ver Historial Completo</Text>
          <Ionicons name="arrow-forward-outline" size={16} color={(styles.seeMoreButton_text as any).color || '#333'} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// ESTILOS (simplificados, ajusta según tus necesidades)
const styles = CompStyles.create({
  card_container: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2, },
  card_title_large: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12, },
  noActivities_container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20, backgroundColor: '#f9fafb', borderRadius: 8, minHeight: 100, },
  noActivities_icon: { marginBottom: 12, },
  noActivities_text: { fontSize: 15, color: '#6b7280', textAlign: 'center', },
  activitySection_container: { marginBottom: 12, },
  activitySection_title: { fontSize: 17, fontWeight: '600', color: '#374151', marginBottom: 10, },
  activityItem_container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', },
  activityItem_iconContainer: { marginRight: 12, width: 30, alignItems: 'center', },
  activityItem_detailsContainer: { flex: 1, },
  activityItem_name: { fontSize: 15, fontWeight: '500', color: '#1f2937', },
  activityItem_time: { fontSize: 13, color: '#6b7280', marginTop: 2, },
  activityItem_description: { fontSize: 13, color: '#4b5563', marginTop: 2, fontStyle: 'italic' },
  activityItem_actionsContainer: { flexDirection: 'row', alignItems: 'center', paddingLeft: 8, },
  activityItem_actionButton: { padding: 6, },
  activityItem_actionButtonStart: {},
  activityItem_actionButtonComplete: {},
  activityItem_separator: { height: 0, }, // Sin separador visible, el borderBottom del item es suficiente
  seeMoreButton_container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, marginTop: 8, backgroundColor: '#e5e7eb', borderRadius: 8, },
  seeMoreButton_text: { fontSize: 15, fontWeight: '500', color: '#374151', marginRight: 6, },
});

// EXPORTACIÓN NOMBRADA
export { ActivitiesDisplayListComponent as ActivitiesDisplayList };