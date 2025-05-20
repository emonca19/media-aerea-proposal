import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

// Initial Data (will be moved to state)
const initialCurrentProject = {
  name: 'Inspección Parque Eólico Norte',
  client: 'Energía Renovable S.A.',
  contract: 'CON-2023-045',
  location: 'Carretera Nacional KM 124, Sinaloa',
  drone: 'DJI Matrice 300 RTK (SN-M300-78451)',
  startDate: '15/05/2023',
  endDate: '20/06/2023',
  progress: 65,
  activities: [
    { id: '1', name: 'T-001: Calibración de sensores', status: 'Completada', time: 'Ayer, 09:30 - 11:45' },
    { id: '4', name: 'T-004: Revisión de equipos', status: 'Completada', time: 'Hace 2 días, 14:00 - 15:00' },
    { id: '2', name: 'T-002: Vuelo de inspección Zona A', status: 'En progreso', time: 'Hoy, 13:30 - 15:00' },
    { id: '3', name: 'T-003: Procesamiento de datos Zona A', status: 'Pendiente', time: 'Hoy, 15:15 - 17:00' },
    { id: '5', name: 'T-005: Vuelo de inspección Zona B', status: 'Pendiente', time: 'Mañana, 10:00 - 12:00' }
  ],
  weather: {
    temperature: 28,
    condition: 'Soleado',
    windSpeed: 12,
    humidity: 45
  },
  alerts: [
    { id: '1', type: 'warning', message: 'Revisión de batería de drone requerida pronto.' },
    { id: '2', type: 'info', message: 'Actualización de firmware disponible para Matrice 300.' }
  ]
};

const pilot = {
  name: "Piloto de Pruebas",
  avatar: require('../../assets/images/pilot-avatar.jpg') // Ensure this path is correct
};

const PilotDashboard = () => {
  const router = useRouter();
  const [currentProject, setCurrentProject] = useState(initialCurrentProject);
  const [isNewActivityModalVisible, setIsNewActivityModalVisible] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityTime, setNewActivityTime] = useState('');

  const [pastActivities, setPastActivities] = useState([]);
  const [ongoingActivities, setOngoingActivities] = useState([]);
  const [futureActivities, setFutureActivities] = useState([]);

  useEffect(() => {
    setPastActivities(currentProject.activities.filter(act => act.status === 'Completada'));
    setOngoingActivities(currentProject.activities.filter(act => act.status === 'En progreso'));
    setFutureActivities(currentProject.activities.filter(act => act.status === 'Pendiente'));
  }, [currentProject.activities]);


  const getStatusIcon = (status: string) => {
    if (status === 'Completada') return <Ionicons name="checkmark-circle" size={22} color="#10b981" />;
    if (status === 'En progreso') return <Ionicons name="sync-circle" size={22} color="#3b82f6" />;
    if (status === 'Pendiente') return <Ionicons name="time-outline" size={22} color="#f59e0b" />;
    return null;
  };

  const handleActivityAction = (activityId: string, newStatus: 'Completada' | 'En progreso') => {
    setCurrentProject(prev => ({
      ...prev,
      activities: prev.activities.map(act =>
        act.id === activityId
          ? {
              ...act,
              status: newStatus,
              time: newStatus === 'En progreso'
                ? `Hoy, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - En curso`
                : act.status === 'En progreso' // If completing, set end time (simplified)
                ? act.time.replace(' - En curso', ` - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
                : act.time
            }
          : act
      )
    }));
  };

  const handleCreateNewActivityInModal = () => {
    if (!newActivityName.trim()) {
      Alert.alert("Error", "El nombre de la actividad no puede estar vacío.");
      return;
    }
    const newActivity = {
      id: Date.now().toString(),
      name: newActivityName,
      status: 'Pendiente',
      time: newActivityTime || `Programada para hoy`,
    };
    setCurrentProject(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity]
    }));
    setNewActivityName('');
    setNewActivityTime('');
    setIsNewActivityModalVisible(false);
    Alert.alert("Éxito", "Nueva actividad creada como 'Pendiente'.");
  };


  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'checklist':
        router.push('/pilot/preflight-checklist');
        break;
      case 'new_activity_modal': // Changed from new_flight
        setIsNewActivityModalVisible(true);
        break;
      case 'report_incident':
        router.push('/pilot/incidents');
        break;
      default:
        break;
    }
  };

  const renderActivityItem = (activity: any) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={styles.activityInfoContainer}>
        {getStatusIcon(activity.status)}
        <View style={styles.activityInfo}>
          <Text style={styles.activityName}>{activity.name}</Text>
          <Text style={styles.activityTime}>{activity.time}</Text>
        </View>
      </View>
      <View style={styles.activityActionsContainer}>
        {activity.status === 'En progreso' && (
          <TouchableOpacity
            style={[styles.activityActionButton, styles.completeButton]}
            onPress={() => handleActivityAction(activity.id, 'Completada')}
          >
            <Ionicons name="checkmark-done-circle-outline" size={20} color="white" />
            <Text style={styles.activityActionButtonText}>Completar</Text>
          </TouchableOpacity>
        )}
        {activity.status === 'Pendiente' && (
          <TouchableOpacity
            style={[styles.activityActionButton, styles.startButton]}
            onPress={() => handleActivityAction(activity.id, 'En progreso')}
          >
            <Ionicons name="play-circle-outline" size={20} color="white" />
            <Text style={styles.activityActionButtonText}>Iniciar</Text>
          </TouchableOpacity>
        )}
        {(activity.status === 'Completada') && (
             <View style={[
                styles.activityStatus,
                styles.completedStatus,
              ]}>
                <Text style={styles.statusText}>{activity.status}</Text>
              </View>
        )}
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1d4ed8" barStyle="light-content" />

      {/* Header (Static) */}
      <LinearGradient
        colors={['#1d4ed8', '#3b82f6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Dashboard Operativo</Text>
            <Text style={styles.headerSubtitle}>Bienvenido, {pilot.name.split(' ')[0]}</Text>
          </View>
          <Image source={pilot.avatar} style={styles.pilotAvatar} />
        </View>
        <View style={styles.weatherContainer}>
          <Ionicons name="sunny" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.weatherText}>
            {currentProject.weather.temperature}°C, {currentProject.weather.condition}
          </Text>
          <Text style={styles.weatherDetailText}>
            | Viento: {currentProject.weather.windSpeed} km/h | Humedad: {currentProject.weather.humidity}%
          </Text>
        </View>
      </LinearGradient>

      {/* Contenido principal (Scrollable) */}
      <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
        {/* Acciones Rápidas */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Acciones Rápidas</Text>
            <MaterialCommunityIcons name="gesture-tap-button" size={24} color="#3b82f6" />
          </View>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction('checklist')}>
              <Ionicons name="shield-checkmark-outline" size={28} color="#3b82f6" />
              <Text style={styles.quickActionText}>Checklist Pre-vuelo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction('new_activity_modal')}>
              <Ionicons name="add-circle-outline" size={28} color="#10b981" />
              <Text style={styles.quickActionText}>Actividad Rápida</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction('report_incident')}>
              <Ionicons name="alert-circle-outline" size={28} color="#ef4444" />
              <Text style={styles.quickActionText}>Reportar Incidente</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Alertas */}
        {currentProject.alerts && currentProject.alerts.length > 0 && (
          <View style={[styles.card, styles.alertsCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Alertas Importantes</Text>
              <Ionicons name="notifications-outline" size={24} color="#f59e0b" />
            </View>
            {currentProject.alerts.map(alert => (
              <View key={alert.id} style={styles.alertItem}>
                <Ionicons
                  name={alert.type === 'warning' ? "warning-outline" : "information-circle-outline"}
                  size={20}
                  color={alert.type === 'warning' ? '#f59e0b' : '#3b82f6'}
                  style={styles.alertIcon}
                />
                <Text style={styles.alertText}>{alert.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actividades en Curso */}
        {ongoingActivities.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Actividades en Curso</Text>
              <MaterialCommunityIcons name="progress-clock" size={24} color="#3b82f6" />
            </View>
            {ongoingActivities.map(activity => renderActivityItem(activity))}
          </View>
        )}

        {/* Actividades Programadas */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Actividades Programadas</Text>
            <MaterialCommunityIcons name="calendar-clock-outline" size={24} color="#f59e0b" />
          </View>
          <TouchableOpacity
            style={styles.addDetailedActivityButton}
            onPress={() => {
              // **IMPORTANT**: Make sure '/pilot/activity-log' is the correct route
              // to your ActivityLogScreen.js file as configured in expo-router.
              router.push('/pilot/activity-log');
            }}
          >
            <Ionicons name="add-circle" size={22} color="#3b82f6" />
            <Text style={styles.addDetailedActivityButtonText}>Programar Actividad Detallada</Text>
          </TouchableOpacity>
          {futureActivities.length > 0 ? (
            futureActivities.map(activity => renderActivityItem(activity))
          ) : (
            <Text style={styles.noActivitiesInSectionText}>No hay actividades programadas.</Text>
          )}
        </View>

        {/* Actividades Pasadas */}
        {pastActivities.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Actividades Pasadas</Text>
              <MaterialCommunityIcons name="history" size={24} color="#6b7280" />
            </View>
            {pastActivities.map(activity => renderActivityItem(activity))}
          </View>
        )}

        {/* Mensaje si no hay NINGUNA actividad de ningún tipo */}
        {currentProject.activities.length === 0 && !isNewActivityModalVisible && ( // Don't show if modal is open
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Actividades</Text>
                </View>
                <View style={styles.emptyStateContainer}>
                    <Ionicons name="file-tray-outline" size={48} color="#cbd5e1" />
                    <Text style={styles.emptyStateText}>No hay actividades registradas.</Text>
                </View>
            </View>
        )}

        {/* Resumen del proyecto */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Proyecto Actual</Text>
            <MaterialCommunityIcons name="clipboard-text-outline" size={24} color="#3b82f6" />
          </View>
          <View style={styles.projectInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="business" size={20} color="#64748b" />
              <Text style={styles.infoLabel}>Cliente:</Text>
              <Text style={styles.infoValue}>{currentProject.client}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={20} color="#64748b" />
              <Text style={styles.infoLabel}>Contrato:</Text>
              <Text style={styles.infoValue}>{currentProject.contract}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#64748b" />
              <Text style={styles.infoLabel}>Ubicación:</Text>
              <Text style={styles.infoValue} numberOfLines={2} ellipsizeMode="tail">{currentProject.location}</Text>
            </View>
          </View>
        </View>

        {/* Progreso del proyecto */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Progreso</Text>
            <Text style={styles.progressText}>{currentProject.progress}% completado</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${currentProject.progress}%` }]} />
          </View>
          <View style={styles.datesContainer}>
            <Text style={styles.dateText}>Inicio: {currentProject.startDate}</Text>
            <Text style={styles.dateText}>Fin: {currentProject.endDate}</Text>
          </View>
        </View>

        {/* Equipo asignado */}
        <View style={[styles.card, { marginBottom: 30 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Equipo Asignado</Text>
            <MaterialCommunityIcons name="drone" size={24} color="#3b82f6" />
          </View>
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentName}>{currentProject.drone}</Text>
            <View style={styles.batteryContainer}>
              <Text style={styles.batteryText}>Batería: 85%</Text>
              <View style={styles.batteryBar}>
                <View style={styles.batteryLevel} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal para Nueva Actividad Rápida */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isNewActivityModalVisible}
        onRequestClose={() => {
          setIsNewActivityModalVisible(!isNewActivityModalVisible);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Crear Actividad Rápida</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre de la actividad"
              placeholderTextColor="#9ca3af"
              value={newActivityName}
              onChangeText={setNewActivityName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Tiempo (ej: Hoy, 10:00 - 12:00)"
              placeholderTextColor="#9ca3af"
              value={newActivityTime}
              onChangeText={setNewActivityTime}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonClose]}
                onPress={() => setIsNewActivityModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleCreateNewActivityInModal}
              >
                <Text style={styles.modalButtonText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 70,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 4,
  },
  pilotAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
    marginLeft: 16,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  weatherText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  weatherDetailText: {
    color: 'white',
    fontSize: 13,
    marginLeft: 5,
  },
  scrollableContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#9ca3af',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e40af',
  },
  projectInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#4b5563',
    width: 75,
  },
  infoValue: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '500',
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    marginVertical: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 5,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 14,
    color: '#4b5563',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityItemLast: {
      borderBottomWidth: 0,
  },
  activityInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e3a8a',
  },
  activityTime: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  activityActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  startButton: {
    backgroundColor: '#3b82f6',
  },
  activityActionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  activityStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  completedStatus: {
    backgroundColor: '#dcfce7',
    borderColor: '#6ee7b7',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  equipmentInfo: {
    gap: 16,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e3a8a',
  },
  batteryContainer: {
    gap: 6,
  },
  batteryText: {
    fontSize: 14,
    color: '#4b5563',
  },
  batteryBar: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
  },
  batteryLevel: {
    height: '100%',
    width: '85%',
    backgroundColor: '#10b981',
    borderRadius: 5,
  },
  quickActionsContainer: { // Reverted to space-around
    flexDirection: 'row',
    justifyContent: 'space-around', // Changed back from 'center'
    alignItems: 'flex-start',
    // gap: 16, // Removed explicit gap for space-around
    marginTop: 8,
    flexWrap: 'wrap',
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    minWidth: 90,
    maxWidth: 110,
    height: 90,
    justifyContent: 'center',
  },
  quickActionText: {
    marginTop: 6,
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  alertsCard: {
    borderColor: '#facc15',
    borderWidth: 1,
    backgroundColor: '#fffbeb',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fef3c7',
  },
  alertItemLast: {
    borderBottomWidth: 0,
  },
  alertIcon: {
    marginRight: 10,
  },
  alertText: {
    fontSize: 14,
    color: '#78350f',
    flex: 1,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9ca3af',
  },
  // New styles for "Add Detailed Activity Button" and "No Activities in Section"
  addDetailedActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#e0e7ff', // A light blue, distinct from other buttons
    borderRadius: 8,
    marginBottom: 16, // Space before activity list or message
  },
  addDetailedActivityButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#3b82f6', // Blue text
  },
  noActivitiesInSectionText: {
    textAlign: 'center',
    color: '#6b7280', // Medium gray
    fontSize: 14,
    paddingVertical: 10,
    fontStyle: 'italic',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#1f2937',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  modalButtonClose: {
    backgroundColor: '#6b7280',
  },
  modalButtonSave: {
    backgroundColor: '#2563eb',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default PilotDashboard;