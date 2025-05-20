import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Changed import
import React from 'react';
import {
  Image, // Added Image
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity, // Added TouchableOpacity
  View,
  Alert // Added Alert for placeholder actions
} from 'react-native';
import { useRouter } from 'expo-router'; // Added useRouter

const PilotDashboard = () => {
  const router = useRouter(); // Initialize router

  // Datos de ejemplo
  const currentProject = {
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
    avatar: require('../../assets/images/pilot-avatar.jpg') // Added avatar
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Completada') return <Ionicons name="checkmark-circle" size={22} color="#10b981" />;
    if (status === 'En progreso') return <Ionicons name="sync-circle" size={22} color="#3b82f6" />; // Changed icon
    if (status === 'Pendiente') return <Ionicons name="time-outline" size={22} color="#f59e0b" />; // Changed icon
    return null;
  };

  const pastActivities = currentProject.activities.filter(act => act.status === 'Completada');
  const ongoingActivities = currentProject.activities.filter(act => act.status === 'En progreso');
  const futureActivities = currentProject.activities.filter(act => act.status === 'Pendiente');

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'checklist':
        router.push('/pilot/preflight-checklist');
        break;
      case 'new_flight':
        // router.push('/pilot/new-flight'); // Uncomment when screen is ready
        Alert.alert("Acción no disponible", "La pantalla 'Nuevo Vuelo' aún no está implementada.");
        console.log('Navigate to New Flight screen');
        break;
      case 'report_incident':
        router.push('/pilot/incidents');
        break;
      default:
        break;
    }
  };

  const renderActivityItem = (activity: any, cardType: string) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={styles.activityInfoContainer}>
        {getStatusIcon(activity.status)}
        <View style={styles.activityInfo}>
          <Text style={styles.activityName}>{activity.name}</Text>
          <Text style={styles.activityTime}>{activity.time}</Text>
        </View>
      </View>
      <View style={[
        styles.activityStatus,
        activity.status === 'Completada' && styles.completedStatus,
        activity.status === 'En progreso' && styles.inProgressStatus,
        activity.status === 'Pendiente' && styles.pendingStatus,
      ]}>
        <Text style={styles.statusText}>{activity.status}</Text>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1d4ed8" barStyle="light-content" />

      {/* Header con gradiente */}
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
          <Ionicons name="sunny" size={20} color="white" style={{ marginRight: 8 }}/>
          <Text style={styles.weatherText}>
            {currentProject.weather.temperature}°C, {currentProject.weather.condition}
          </Text>
          <Text style={styles.weatherDetailText}>
            | Viento: {currentProject.weather.windSpeed} km/h | Humedad: {currentProject.weather.humidity}%
          </Text>
        </View>
      </LinearGradient>

      {/* Contenido principal */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
            <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction('new_flight')}>
              <Ionicons name="paper-plane-outline" size={28} color="#3b82f6" />
              <Text style={styles.quickActionText}>Nuevo Vuelo</Text>
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
            {ongoingActivities.map(activity => renderActivityItem(activity, 'ongoing'))}
          </View>
        )}

        {/* Actividades Programadas */}
        {futureActivities.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Actividades Programadas</Text>
              <MaterialCommunityIcons name="calendar-clock-outline" size={24} color="#f59e0b" />
            </View>
            {futureActivities.map(activity => renderActivityItem(activity, 'future'))}
          </View>
        )}
        
        {/* Actividades Pasadas */}
        {pastActivities.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Actividades Pasadas</Text>
              <MaterialCommunityIcons name="history" size={24} color="#6b7280" />
            </View>
            {pastActivities.map(activity => renderActivityItem(activity, 'past'))}
          </View>
        )}

        {/* Mensaje si no hay actividades */}
        {currentProject.activities.length === 0 && (
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
              <Text style={styles.infoValue}>{currentProject.location}</Text>
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
        <View style={styles.card}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light gray background for the whole screen
  },
  header: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 70, // Dynamic padding for status bar
    paddingHorizontal: 24,
    paddingBottom: 20, // Reduced bottom padding
    borderBottomLeftRadius: 30, // Increased radius
    borderBottomRightRadius: 30, // Increased radius
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16, // Added margin for weather info separation
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26, // Slightly larger
    fontWeight: 'bold', // Bolder
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff', // Lighter blue for subtitle
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
    flexDirection: 'row', // Align items in a row
    alignItems: 'center', // Center items vertically
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Slightly less transparent
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12, // Added horizontal padding
  },
  weatherText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600', // Bolder
  },
  weatherDetailText: {
    color: 'white',
    fontSize: 13, // Slightly smaller for details
    marginLeft: 5,
  },
  content: {
    paddingHorizontal: 16, // Horizontal padding for the scroll content
    paddingTop: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20, // Increased padding
    marginBottom: 20, // Increased margin
    shadowColor: '#9ca3af', // Softer shadow color
    shadowOffset: { width: 0, height: 4 }, // Adjusted shadow offset
    shadowOpacity: 0.15, // Slightly more opacity
    shadowRadius: 8, // Larger radius
    elevation: 3, // Slightly more elevation
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
    color: '#1e40af', // Dark blue
  },
  projectInfo: {
    gap: 16, // Increased gap
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#4b5563', // Darker gray for labels
    width: 75, // Slightly wider
  },
  infoValue: {
    fontSize: 14,
    color: '#1e3a8a', // Slightly darker blue for values
    fontWeight: '500',
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold', // Bolder
    color: '#059669', // Darker green
  },
  progressBarContainer: {
    height: 10, // Thicker progress bar
    backgroundColor: '#e5e7eb', // Lighter gray background
    borderRadius: 5,
    marginVertical: 16, // Increased margin
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563eb', // Brighter blue
    borderRadius: 5,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 14,
    color: '#4b5563', // Darker gray
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16, // Increased padding
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // Lighter border
  },
  activityInfoContainer: { // New container for icon and text
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12, // Space between icon and text
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e3a8a', // Darker blue
  },
  activityTime: {
    fontSize: 13, // Slightly smaller
    color: '#6b7280', // Medium gray
    marginTop: 2, // Reduced margin
  },
  activityStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16, // More rounded
    minWidth: 100, // Minimum width for status
    alignItems: 'center', // Center text
  },
  completedStatus: {
    backgroundColor: '#dcfce7', // Lighter green
    borderColor: '#6ee7b7', // Green border
    borderWidth: 1,
  },
  inProgressStatus: {
    backgroundColor: '#dbeafe', // Lighter blue
    borderColor: '#93c5fd', // Blue border
    borderWidth: 1,
  },
  pendingStatus: { // Added style for pending
    backgroundColor: '#fef3c7', // Lighter yellow
    borderColor: '#fcd34d', // Yellow border
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13, // Slightly smaller
    fontWeight: '600', // Bolder
    color: '#1f2937', // Dark gray text for better contrast on light backgrounds
  },
  equipmentInfo: {
    gap: 16, // Increased gap
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e3a8a', // Darker blue
  },
  batteryContainer: {
    gap: 6, // Increased gap
  },
  batteryText: {
    fontSize: 14,
    color: '#4b5563', // Darker gray
  },
  batteryBar: {
    height: 10, // Thicker bar
    backgroundColor: '#e5e7eb', // Lighter gray background
    borderRadius: 5,
    overflow: 'hidden',
  },
  batteryLevel: {
    height: '100%',
    width: '85%', // Example, should be dynamic
    backgroundColor: '#10b981', // Green
    borderRadius: 5,
  },
  // Styles for Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Changed from space-around
    alignItems: 'flex-start', // Align items to the top if text wraps
    gap: 16, // Added gap for spacing when centered
    marginTop: 8,
    flexWrap: 'wrap', // Allow buttons to wrap on smaller screens
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8, // Adjust horizontal padding
    borderRadius: 12,
    backgroundColor: '#eef2ff', 
    minWidth: 90, // Adjusted minWidth
    maxWidth: 110, // Added maxWidth to control width
    height: 90, // Fixed height for uniformity
    justifyContent: 'center', // Center content vertically
  },
  quickActionText: {
    marginTop: 6,
    fontSize: 12,
    color: '#374151', // Dark gray text
    fontWeight: '500',
    textAlign: 'center',
  },
  // Styles for Alerts
  alertsCard: {
    borderColor: '#facc15', // Yellow border for alerts card
    borderWidth: 1,
    backgroundColor: '#fffbeb', // Light yellow background
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fef3c7', // Lighter yellow border for items
  },
  alertItemLast: { // To remove border for the last item if needed
    borderBottomWidth: 0,
  },
  alertIcon: {
    marginRight: 10,
  },
  alertText: {
    fontSize: 14,
    color: '#78350f', // Dark amber text
    flex: 1,
  },
  // Styles for Empty State
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
});

export default PilotDashboard;
