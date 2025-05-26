import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text, // Asegúrate de que TextInput esté importado si lo usas en la pestaña comentada
  TouchableOpacity,
  View
} from 'react-native';

// Import incident types
import { incidentTypes } from './components/pilot-dashboard-data';

// Mock incident data - distribuido de manera más realista
const mockIncidents = [
  {
    id: 'INC001',
    type: 'INC_WEATHER',
    description: 'Condiciones meteorológicas adversas detectadas durante la inspección.',
    activityId: '2', // Asegúrate que este ID exista en mockActivities
    timestamp: '2023-05-18T09:30:00',
    severity: 'medium',
    status: 'resolved'
  }
];


// Datos simulados más completos
const mockTurbines = [
  { id: '1', name: 'T-001', status: 'IN_PROGRESS', lastInspection: '2023-05-15' },
  { id: '2', name: 'T-002', status: 'COMPLETED', lastInspection: '2023-05-16' },
  { id: '3', name: 'T-003', status: 'PENDING', lastInspection: '2023-04-28' },
  { id: '4', name: 'T-004', status: 'IN_PROGRESS', lastInspection: '2023-05-17' },
  { id: '5', name: 'T-005', status: 'PENDING', lastInspection: '2023-04-30' },
];

// Datos para el nuevo PilotProjectDetails
const mockProjectForDetails = {
  name: 'Inspección Parque Eólico Norte', // Usaremos este nombre para consistencia
  client: 'Energía Renovable S.A.',
  description: 'Inspección trimestral de las turbinas del parque norte con drone DJI M300',
  completedTurbines: mockTurbines.filter(t => t.status === 'COMPLETED').length,
  totalTurbines: mockTurbines.length,
  progress: Math.round((mockTurbines.filter(t => t.status === 'COMPLETED').length / mockTurbines.length) * 100),
  location: 'Carretera Nacional KM 124, Sinaloa', // De mockProjects[0]
  parkName: 'Parque Eólico Norte', // De mockProjects[0]
  startDate: '2023-05-10', // De mockProjects[0]
  endDate: '2023-06-20',   // De mockProjects[0]
  contractId: 'CON-2023-045', // De mockProjects[0]
};

const projectMembers = [
  {
    id: 1,
    name: 'Juan Pérez', // Usuario actual como piloto líder
    role: 'Piloto Líder',
    // Necesitarás estas imágenes en tu proyecto o usa placeholders
    avatar: require('../../assets/images/pilot-avatar.jpg'),
  },
  {
    id: 2,
    name: 'Ana Torres',
    role: 'Técnica de Mantenimiento',
    avatar: require('../../assets/images/wind-turbine-icon.png'),
  },
  {
    id: 3,
    name: 'Luis García',
    role: 'Supervisor de Campo',
    avatar: require('../../assets/images/media-logo.png'),
  },
];


const mockDrones = [
  { id: '1', model: 'DJI Matrice 300 RTK', serialNumber: 'SN-M300-78451', batteryStatus: 85 },
  { id: '2', model: 'DJI Phantom 4 Pro', serialNumber: 'SN-P4P-45213', batteryStatus: 60 }
];

const mockActivities = [
  {
    id: '0',
    type: 'OTHER',
    startTime: new Date('2023-05-18T07:00:00'),
    endTime: new Date('2023-05-18T07:05:00'),
    notes: 'Inicio de jornada',
    operator: 'Juan Pérez'
  },
  {
    id: '1',
    type: 'MOBILIZATION',
    startTime: new Date('2023-05-18T07:05:00'),
    endTime: new Date('2023-05-18T08:00:00'),
    notes: 'Movilización al parque eólico',
    operator: 'Juan Pérez'
  },
  {
    id: '2', // Este ID es usado por mockIncidents
    type: 'OTHER',
    startTime: new Date('2023-05-18T08:00:00'),
    endTime: new Date('2023-05-18T08:10:00'),
    notes: 'Llegada al sitio',
    operator: 'Juan Pérez',
    subActivities: [
      {
        id: '2-1',
        type: 'BREAK',
        startTime: new Date('2023-05-18T08:10:00'),
        endTime: new Date('2023-05-18T08:30:00'),
        notes: 'Esperando permiso de acceso',
        operator: 'Juan Pérez'
      }
    ]
  },
  {
    id: '3',
    type: 'TURBINE_WORK',
    turbineId: '1',
    startTime: new Date('2023-05-18T08:30:00'),
    endTime: new Date('2023-05-18T10:00:00'),
    notes: 'Inspección de aspas y sistemas eléctricos.',
    operator: 'Juan Pérez',
    subActivities: [
      {
        id: '3-1',
        type: 'BREAK',
        startTime: new Date('2023-05-18T09:00:00'),
        endTime: new Date('2023-05-18T09:15:00'),
        notes: 'Pausa para hidratación',
        operator: 'Juan Pérez'
      }
    ]
  }
];

type ActivityType = 'MOBILIZATION' | 'TURBINE_WORK' | 'BREAK' | 'WEATHER_DELAY' | 'OTHER' | 'MEAL';

const activityTypes = [
  { type: 'MOBILIZATION', label: 'Movilización', icon: 'bus' },
  { type: 'TURBINE_WORK', label: 'Trabajo en Turbina', icon: 'wind-turbine' },
  { type: 'BREAK', label: 'Pausa', icon: 'pause-circle' },
  { type: 'MEAL', label: 'Tiempo de Comida', icon: 'food' },
  { type: 'WEATHER_DELAY', label: 'Retraso por Clima', icon: 'weather-cloudy' },
  { type: 'OTHER', label: 'Llegada al sitio', icon: 'map-marker' }
];

// --- Componente para la pestaña de Proyecto ---
function PilotProjectDetailsView() {
  const router = useRouter();
  const projectData = mockProjectForDetails; // Usar los datos unificados

  // Formatear fechas si son strings
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };


  return (
    <ScrollView contentContainerStyle={projectDetailStyles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={projectDetailStyles.container}>
        {/* El título general de la pantalla ya lo maneja Stack.Screen */}
        {/* <Text style={projectDetailStyles.pageTitle}>Proyecto Actual</Text> */}
        {/* El botón de back global lo maneja Stack.Screen, no necesitamos uno específico aquí */}

        <View style={projectDetailStyles.card}>
          <Ionicons name="briefcase-outline" size={40} color="#a78bfa" style={{ marginBottom: 10 }} />
          <Text style={projectDetailStyles.title}>{projectData.name}</Text>
          <Text style={projectDetailStyles.client}>{projectData.client}</Text>
          <Text style={projectDetailStyles.description}>{projectData.description}</Text>

          <View style={projectDetailStyles.detailsSection}>
            <View style={projectDetailStyles.detailRow}>
              <Ionicons name="business-outline" size={16} color="#6b7280" style={projectDetailStyles.detailIcon} />
              <Text style={projectDetailStyles.detailLabel}>Cliente:</Text>
              <Text style={projectDetailStyles.detailValue}>{projectData.client}</Text>
            </View>
            <View style={projectDetailStyles.detailRow}>
              <Ionicons name="map-outline" size={16} color="#6b7280" style={projectDetailStyles.detailIcon} />
              <Text style={projectDetailStyles.detailLabel}>Parque:</Text>
              <Text style={projectDetailStyles.detailValue}>{projectData.parkName}</Text>
            </View>
            <View style={projectDetailStyles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#6b7280" style={projectDetailStyles.detailIcon} />
              <Text style={projectDetailStyles.detailLabel}>Ubicación:</Text>
              <Text style={projectDetailStyles.detailValue}>{projectData.location}</Text>
            </View>
            <View style={projectDetailStyles.detailRow}>
              <Ionicons name="document-text-outline" size={16} color="#6b7280" style={projectDetailStyles.detailIcon} />
              <Text style={projectDetailStyles.detailLabel}>Contrato:</Text>
              <Text style={projectDetailStyles.detailValue}>{projectData.contractId}</Text>
            </View>
            <View style={projectDetailStyles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" style={projectDetailStyles.detailIcon} />
              <Text style={projectDetailStyles.detailLabel}>Fechas:</Text>
              <Text style={projectDetailStyles.detailValue}>{formatDate(projectData.startDate)} - {formatDate(projectData.endDate)}</Text>
            </View>
          </View>

          <View style={projectDetailStyles.progressContainer}>
            <Text style={projectDetailStyles.progressLabel}>Turbinas completadas: {projectData.completedTurbines} / {projectData.totalTurbines}</Text>
            <View style={projectDetailStyles.progressBarBg}>
              <View style={[projectDetailStyles.progressBar, { width: `${projectData.progress}%` }]} />
            </View>
            <Text style={projectDetailStyles.progressPercent}>{projectData.progress}%</Text>
          </View>
        </View>

        <View style={projectDetailStyles.actionButtonsContainer}>
          <TouchableOpacity style={projectDetailStyles.actionButton} onPress={() => router.push('/pilot/site-map')}>
            <Ionicons name="map-outline" size={22} color="#10b981" />
            <Text style={projectDetailStyles.actionButtonText}>Mapa de Sitio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={projectDetailStyles.actionButton} onPress={() => router.push('/pilot/turbines')}>
            <Ionicons name="flash-outline" size={22} color="#0ea5e9" />
            <Text style={projectDetailStyles.actionButtonText}>Turbinas</Text>
          </TouchableOpacity>
        </View>

        <View style={projectDetailStyles.membersCard}>
          <Text style={projectDetailStyles.membersTitle}>Integrantes del Proyecto</Text>
          {projectMembers.map((member) => (
            <View key={member.id} style={projectDetailStyles.memberRow}>
              <View style={projectDetailStyles.avatarWrapper}>
                <View style={projectDetailStyles.avatarBorder}>
                  <Image
                    source={member.avatar}
                    style={projectDetailStyles.avatarImage}
                  />
                </View>
              </View>
              <View style={projectDetailStyles.memberInfo}>
                <Text style={projectDetailStyles.memberName}>{member.name}</Text>
                <Text style={projectDetailStyles.memberRole}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
// --- Fin del componente para la pestaña de Proyecto ---


export default function ActivityLogScreen() {
  const router = useRouter();
  const { newActivity, message, initialTab } = useLocalSearchParams();
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [selectedTurbine, setSelectedTurbine] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'activities' | 'project'>(initialTab === 'project' ? 'project' : 'activities');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');

  // Filtra las actividades del día actual
  const todayActivities = mockActivities; // Mostrar todas las actividades, no solo las de hoy

  // Sincroniza el tab con el parámetro initialTab cada vez que cambia
  React.useEffect(() => {
    if (initialTab === 'project') setActiveTab('project');
    else if (initialTab === 'activities') setActiveTab('activities');
  }, [initialTab]);

  useEffect(() => {
    if (newActivity && message) {
      Alert.alert(
        'Actividad Iniciada',
        typeof message === 'string' ? message : 'Actividad iniciada exitosamente',
        [{ text: 'OK' }]
      );
      setActiveTab('activities');
    }
  }, [newActivity, message]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleStartActivity = () => {
    if (!selectedType) {
      Alert.alert('Error', 'Selecciona un tipo de actividad');
      return;
    }

    if (selectedType === 'TURBINE_WORK' && !selectedTurbine) {
      Alert.alert('Error', 'Selecciona una turbina');
      return;
    }

    if (selectedType === 'TURBINE_WORK' && selectedTurbine) {
      Alert.alert(
        "Checklist Prevuelo Requerido",
        "Para trabajar en una turbina, primero debes completar el checklist de prevuelo. ¿Deseas ir al checklist ahora?",
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Ir al Checklist',
            onPress: () => {
              setSelectedType(null);
              setSelectedTurbine('');
              setNotes('');
              router.push(`/pilot/preflight-checklist?turbineId=${selectedTurbine}`);
            }
          }
        ]
      );
      return;
    }

    const newActivityData = { // Renombrado para evitar conflicto con el param
      id: Date.now().toString(),
      type: selectedType,
      turbineId: selectedType === 'TURBINE_WORK' ? selectedTurbine : undefined,
      startTime: currentTime,
      endTime: null,
      notes: notes,
      operator: 'Usuario Actual'
    };

    Alert.alert(
      'Actividad Iniciada',
      `Has comenzado: ${activityTypes.find(at => at.type === selectedType)?.label || selectedType}${selectedTurbine ? ` en ${mockTurbines.find(t => t.id === selectedTurbine)?.name}` : ''}`
    );

    setSelectedType(null);
    setSelectedTurbine('');
    setNotes('');
    console.log('Nueva actividad iniciada:', newActivityData);
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (start: Date, end: Date | null) => {
    if (!end) return '';
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getFilteredActivities = () => {
    const now = new Date();
    return todayActivities.filter(activity => {
      const activityHour = activity.startTime.getHours();
      switch (selectedTimeFilter) {
        case 'morning': return activityHour >= 6 && activityHour < 12;
        case 'afternoon': return activityHour >= 12 && activityHour < 18;
        case 'last2h':
          const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
          return activity.startTime >= twoHoursAgo;
        case 'all': default: return true;
      }
    });
  };

  const filteredActivities = getFilteredActivities();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Registro Operativo',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#1e3a8a',
          headerShadowVisible: false
        }}
      />

      <View style={styles.tabContainer}>
        {/* Pestaña Registrar comentada */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'activities' && styles.activeTab]}
          onPress={() => setActiveTab('activities')}
        >
          <Ionicons name="time-outline" size={20} color={activeTab === 'activities' ? '#2563eb' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'activities' && styles.activeTabText]}>Actividades</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'project' && styles.activeTab]}
          onPress={() => setActiveTab('project')}
        >
          <FontAwesome name="folder-o" size={20} color={activeTab === 'project' ? '#2563eb' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'project' && styles.activeTabText]}>Proyecto</Text>
        </TouchableOpacity>
      </View>

      {/* El ScrollView ahora es condicional o envuelve el contenido de cada pestaña */}
      {activeTab === 'activities' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.activitiesSection}>
            <View style={styles.enhancedStatsContainer}>
              <View style={styles.statsHeader}>
                <View style={styles.statsTitleContainer}>
                  <View style={styles.statsIconWrapper}>
                    <MaterialCommunityIcons name="chart-line" size={24} color="#2563eb" />
                  </View>
                  <Text style={styles.statsTitle}>Registro del Día</Text>
                </View>
                <View style={styles.dateContainer}>
                  <MaterialCommunityIcons name="calendar-today" size={16} color="#64748b" style={{ marginRight: 6 }} />
                  <Text style={styles.statsDate}>
                    {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </Text>
                </View>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: '#eff6ff' }]}>
                    <MaterialCommunityIcons name="clock-outline" size={22} color="#3b82f6" />
                  </View>
                  <Text style={styles.statValue}>4:00:45</Text>{/* TODO: Calcular dinámicamente */}
                  <Text style={styles.statLabel}>Tiempo Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: '#ecfdf5' }]}>
                    <MaterialCommunityIcons name="chart-timeline-variant" size={22} color="#059669" />
                  </View>
                  <Text style={[styles.statValue, { color: '#059669' }]}>3:35:12</Text>{/* TODO: Calcular dinámicamente */}
                  <Text style={styles.statLabel}>Tiempo Productivo</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: '#fef2f2' }]}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={22} color="#ef4444" />
                  </View>
                  <Text style={[styles.statValue, { color: '#ef4444' }]}>{mockIncidents.length}</Text>
                  <Text style={styles.statLabel}>Incidencias</Text>
                </View>
              </View>
            </View>
            <View style={styles.timeFilterContainer}>
              <View style={styles.timeFilterHeader}>
                <Text style={styles.timeFilterTitle}>Filtrar por:</Text>
                <Text style={styles.filterResultText}>
                  {filteredActivities.length} de {todayActivities.length} actividades
                </Text>
              </View>
              <View style={styles.timeFilterButtons}>
                {[{ id: 'all', label: 'Todo el día' }, { id: 'morning', label: 'Mañana' }, { id: 'afternoon', label: 'Tarde' }, { id: 'last2h', label: 'Últimas 2h' }].map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[styles.timeFilterButton, selectedTimeFilter === filter.id && styles.timeFilterButtonActive]}
                    onPress={() => setSelectedTimeFilter(filter.id)}
                  >
                    <Text style={[styles.timeFilterButtonText, selectedTimeFilter === filter.id && styles.timeFilterButtonTextActive]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.activitiesTimeline}>
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => {
                  const isStartOfDay = activity.notes && activity.notes.toLowerCase().includes('inicio de jornada');
                  if (isStartOfDay) {
                    return (
                      <View key={activity.id} style={styles.startOfDayContainer}>
                        <View style={styles.dottedLineContainer}>
                          <View style={styles.dottedLine} />
                          <View style={styles.startDayBlock}>
                            <MaterialCommunityIcons name="weather-sunset" size={20} color="#2563eb" style={{ marginRight: 8 }} />
                            <Text style={styles.startDayText}>Inicio de Jornada</Text>
                            <Text style={styles.startDayHour}>{formatTime(activity.startTime)}</Text>
                          </View>
                          <View style={styles.dottedLine} />
                        </View>
                      </View>
                    );
                  }
                  const activityTypeData = activityTypes.find(t => t.type === activity.type);
                  const turbine = activity.turbineId ? mockTurbines.find(t => t.id === activity.turbineId) : null;
                  return (
                    <View key={activity.id} style={styles.activityCardContainer}>
                      <View style={styles.activityCardWrapper}>
                        <View style={styles.activityHeaderRow}>
                          <View style={styles.activityTitleSection}>
                            <View style={styles.activityIconWrapper}>
                              <MaterialCommunityIcons name={(activityTypeData?.icon || 'clock') as any} size={24} color="#2563eb" />
                            </View>
                            <Text style={styles.activityTitle}>{activityTypeData?.label || activity.type}</Text>
                          </View>
                          {activity.endTime && (
                            <View style={styles.activityDurationBadge}>
                              <Text style={styles.activityDurationText}>{formatDuration(activity.startTime, activity.endTime)}</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.activityDetailsSection}>
                          {turbine && (
                            <View style={styles.activityDetailRow}>
                              <Ionicons name="cog" size={16} color="#64748b" style={styles.activityDetailIcon} />
                              <Text style={styles.activityDetailText}>{turbine.name} • {turbine.status === 'COMPLETED' ? 'Completada' : 'En progreso'}</Text>
                            </View>
                          )}
                          {activity.notes && (
                            <View style={styles.activityDetailRow}>
                              <Ionicons name="document-text" size={16} color="#64748b" style={styles.activityDetailIcon} />
                              <Text style={styles.activityDetailText}>{activity.notes}</Text>
                            </View>
                          )}
                          <View style={styles.activityDetailRow}>
                            <MaterialCommunityIcons name="clock-start" size={16} color="#64748b" style={styles.activityDetailIcon} />
                            <Text style={styles.activityDetailText}>Inicio: {formatTime(activity.startTime)}{activity.endTime && ` • Fin: ${formatTime(activity.endTime)}`}</Text>
                          </View>
                          {activity.type === 'TURBINE_WORK' && (
                            <View style={styles.activityDetailRow}>
                              <MaterialCommunityIcons name="drone" size={16} color="#64748b" style={styles.activityDetailIcon} />
                              <Text style={styles.activityDetailText}>
                                Dron: {
                                  // Asignar el primer dron como ejemplo, o puedes mejorar la lógica según tus datos
                                  (mockDrones[0]?.model || 'No asignado')
                                }
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {mockIncidents.filter(incident => incident.activityId === activity.id).map((incident) => {
                        const incidentTypeData = incidentTypes.find(t => t.id === incident.type);
                        return (
                          <View key={incident.id} style={styles.incidentCardWrapper}>
                            <View style={styles.incidentHeader}>
                              <View style={styles.incidentTitleSection}>
                                <MaterialCommunityIcons name={incidentTypeData?.icon as any} size={18} color="#ef4444" style={{ marginRight: 8 }} />
                                <Text style={styles.incidentTitle}>{incidentTypeData?.label || 'Incidente'}</Text>
                              </View>
                            </View>
                            <Text style={styles.incidentDescription}>{incident.description}</Text>
                            <View style={styles.incidentDetails}>
                              <Text style={styles.incidentDetailText}>{formatTime(new Date(incident.timestamp))}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Image source={require('../../assets/images/no-activities.png')} style={styles.emptyImage} />
                  <Text style={styles.emptyText}>No hay actividades registradas hoy</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {activeTab === 'project' && (
        // El ScrollView ya está dentro de PilotProjectDetailsView
        <PilotProjectDetailsView />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Color de fondo general de la app
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    color: '#64748b',
    fontWeight: '500',
    fontSize: 14,
    marginTop: 4,
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  content: { // Estilo para el ScrollView de la pestaña 'activities'
    paddingHorizontal: 12, // Aplicar padding aquí para que el scroll funcione bien
    paddingTop: 16, // Espacio arriba dentro del scroll
    paddingBottom: 16, // Espacio abajo dentro del scroll
  },
  // --- Estilos de la pestaña 'activities' ---
  activitiesSection: {
    // No necesita marginBottom si el content del ScrollView ya tiene paddingBottom
  },
  enhancedStatsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIconWrapper: {
    marginRight: 10,
    padding: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statsDate: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },
  timeFilterContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  timeFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeFilterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterResultText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  timeFilterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeFilterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  timeFilterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  timeFilterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  timeFilterButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  activitiesTimeline: {
    // No necesita marginTop si el timeFilterContainer ya tiene marginBottom
  },
  startOfDayContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: -1,
    marginBottom: 16,
  },
  dottedLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
  },
  dottedLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderStyle: 'dotted',
    borderColor: '#cbd5e1',
    height: 1,
  },
  startDayBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e7ef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  startDayText: {
    fontWeight: '600',
    color: '#2563eb',
    fontSize: 15,
    marginRight: 8,
  },
  startDayHour: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '400',
  },
  activityCardContainer: {
    marginBottom: 16,
  },
  activityCardWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activityTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#dbeafe',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  activityDurationBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activityDurationText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  activityDetailsSection: {
    gap: 8,
  },
  activityDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDetailIcon: {
    marginRight: 10,
    width: 18,
    textAlign: 'center',
  },
  activityDetailText: {
    color: '#64748b',
    fontSize: 13,
    flex: 1,
  },
  incidentCardWrapper: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 12,
    marginLeft: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  incidentTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  incidentTitle: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
  },
  incidentDescription: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 18,
  },
  incidentDetails: {
    marginTop: 2,
  },
  incidentDetailText: {
    color: '#64748b',
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 20, // Para que no quede pegado al filtro si no hay actividades
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
  // ... (otros estilos que ya tenías para 'register' si los quieres mantener)
});

// --- Estilos para PilotProjectDetailsView (integrados y ajustados) ---
const projectDetailStyles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 32, // Espacio al final del scroll
    paddingTop: 16,    // Espacio al inicio del scroll
  },
  container: { // Contenedor principal dentro del ScrollView
    flex: 1,
    // backgroundColor: '#f0f2f5', // El fondo general ya está en styles.container
    alignItems: 'center',
    paddingHorizontal: 12, // Para que las tarjetas no peguen a los bordes
  },
  // pageTitle: { // Ya no es necesario aquí, lo maneja Stack.Screen
  //   fontSize: 24,
  //   fontWeight: 'bold',
  //   color: '#1e293b',
  //   textAlign: 'center',
  //   marginTop: 0,
  //   marginBottom: 8,
  //   letterSpacing: 0.2,
  // },
  // backButton: { // Ya no es necesario aquí
  //   position: 'absolute',
  //   top: 18,
  //   left: 12,
  //   zIndex: 10,
  //   backgroundColor: '#fff',
  //   borderRadius: 20,
  //   padding: 6,
  // },
  card: {
    width: '100%', // Ocupar todo el ancho disponible (con padding del container)
    backgroundColor: '#fff',
    borderRadius: 16, // Consistente con otras tarjetas
    padding: 20, // Consistente
    // marginTop: 40, // Ya no es necesario, el scrollContainer da el padding superior
    alignItems: 'center',
    borderWidth: 1, // Añadido para consistencia
    borderColor: '#e5e7eb', // Añadido para consistencia
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 16, // Espacio antes de los botones de acción
  },
  title: {
    fontSize: 20, // Ajustado
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },
  client: {
    fontSize: 15, // Ajustado
    color: '#a78bfa',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14, // Ajustado
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  detailsSection: { // Nuevo contenedor para los detalles
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    width: '100%',
    gap: 8, // Espacio entre filas de detalles
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 10,
    width: 20, // Para alinear mejor los textos
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
    width: 75, // Ancho fijo para etiquetas
  },
  detailValue: {
    fontSize: 14,
    color: '#1e3a8a', // Un azul más oscuro para el valor
    flex: 1, // Para que ocupe el resto del espacio
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 18,
    width: '100%',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 13, // Ajustado
    color: '#374151',
    marginBottom: 6, // Ajustado
    fontWeight: '500',
  },
  progressBarBg: {
    width: '100%',
    height: 12, // Ajustado
    backgroundColor: '#ede9fe',
    borderRadius: 6, // Ajustado
    overflow: 'hidden',
    marginBottom: 6, // Ajustado
  },
  progressBar: {
    height: '100%', // Ocupa toda la altura del BG
    backgroundColor: '#a78bfa',
    borderRadius: 6, // Ajustado
  },
  progressPercent: {
    fontSize: 13,
    color: '#a78bfa',
    fontWeight: 'bold',
    marginTop: 2,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%', // Ocupar todo el ancho (con padding del container)
    // paddingHorizontal: 0, // Ya no es necesario si width es 100%
    marginTop: 0, // El margen lo da la card de arriba
    marginBottom: 20, // Espacio antes de la tarjeta de miembros
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centrar contenido del botón
    backgroundColor: '#fff',
    paddingVertical: 14, // Más padding vertical
    paddingHorizontal: 12,
    borderRadius: 10, // Consistente
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    marginLeft: 10, // Más espacio
    fontSize: 14, // Ajustado
    fontWeight: '600',
    color: '#1f2937',
  },
  membersCard: {
    width: '100%', // Ocupar todo el ancho
    backgroundColor: '#fff',
    borderRadius: 16, // Consistente
    padding: 18, // Ajustado
    // marginTop: 22, // El margen lo da el actionButtonsContainer
    alignItems: 'flex-start',
    borderWidth: 1, // Añadido
    borderColor: '#e5e7eb', // Añadido
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  membersTitle: {
    fontSize: 17, // Ajustado
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 14, // Ajustado
    textAlign: 'left',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    width: '100%', // Para que el borde inferior ocupe todo
    paddingBottom: 10, // Espacio antes del borde
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatarWrapper: { // No se usa directamente si avatarBorder es el principal
    // ...
  },
  avatarBorder: {
    width: 44, // Ajustado
    height: 44, // Ajustado
    borderRadius: 22, // Ajustado
    borderWidth: 2, // Ajustado
    borderColor: '#a78bfa', // Color del proyecto
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  avatarImage: { // Estilo directo para la imagen
    width: 36, // Ajustado
    height: 36, // Ajustado
    borderRadius: 18, // Ajustado
    resizeMode: 'cover',
  },
  memberInfo: { // Nuevo contenedor para nombre y rol
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 15, // Ajustado
    fontWeight: '600',
    color: '#111827',
  },
  memberRole: {
    fontSize: 13, // Ajustado
    color: '#6b7280',
  },
});