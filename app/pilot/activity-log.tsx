import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
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
    activityId: '2',
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

const mockProjects = [
  {
    id: '1',
    name: 'Inspección Parque Eólico Norte',
    status: 'ACTIVE',
    startDate: new Date('2023-05-10'),
    endDate: new Date('2023-06-20'),
    clientName: 'Energía Renovable S.A.',
    contractId: 'CON-2023-045',
    description: 'Inspección trimestral de las turbinas del parque norte con drone DJI M300',
    parkName: 'Parque Eólico Norte',
    location: 'Carretera Nacional KM 124, Sinaloa',
  }
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
    id: '2',
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

export default function ActivityLogScreen() {
  const router = useRouter();
  const { newActivity, message } = useLocalSearchParams();  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [selectedTurbine, setSelectedTurbine] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'register' | 'activities' | 'project'>('register');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');

  const currentProject = mockProjects[0];
  const assignedDrone = mockDrones[0];
  const todayActivities = mockActivities;
  const filteredTurbines = mockTurbines.filter(t => t.status !== 'COMPLETED');

  // Handle new activity from preflight checklist
  useEffect(() => {
    if (newActivity && message) {
      // Show success message for automatically started activity
      Alert.alert(
        'Actividad Iniciada',
        typeof message === 'string' ? message : 'Actividad iniciada exitosamente',
        [{ text: 'OK' }]
      );
      
      // Switch to activities tab to show the current activities
      setActiveTab('activities');
    }
  }, [newActivity, message]);

  // Actualizar la hora currente cada minuto
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

    // Validación especial para trabajo en turbina - requiere checklist prevuelo
    if (selectedType === 'TURBINE_WORK' && selectedTurbine) {
      Alert.alert(
        "Checklist Prevuelo Requerido",
        "Para trabajar en una turbina, primero debes completar el checklist de prevuelo. ¿Deseas ir al checklist ahora?",
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Ir al Checklist', 
            onPress: () => {
              // Limpiar formulario antes de navegar
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

    const newActivity = {
      id: Date.now().toString(),
      type: selectedType,
      turbineId: selectedType === 'TURBINE_WORK' ? selectedTurbine : undefined,
      startTime: currentTime,
      endTime: null,
      notes: notes,
      operator: 'Usuario Actual' // En una app real, tomaría el usuario logeado
    };

    Alert.alert(
      'Actividad Iniciada',
      `Has comenzado: ${activityTypes.find(at => at.type === selectedType)?.label || selectedType}${selectedTurbine ? ` en ${mockTurbines.find(t => t.id === selectedTurbine)?.name}` : ''}`
    );

    // Limpiar el formulario
    setSelectedType(null);
    setSelectedTurbine('');
    setNotes('');
    
    // Aquí en una app real, harías un dispatch o API call para guardar la actividad
    console.log('Nueva actividad iniciada:', newActivity);
  };  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'ALTA';
      case 'medium': return 'MEDIA';
      case 'low': return 'BAJA';
      default: return 'BAJA';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Abierto';
      case 'investigating': return 'En investigación';
      case 'resolved': return 'Resuelto';
      default: return 'Resuelto';
    }
  };
  const formatDuration = (start: Date, end: Date | null) => {
    if (!end) return '';
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  // Filter activities based on selected time filter
  const getFilteredActivities = () => {
    const now = new Date();

    return todayActivities.filter(activity => {
      const activityHour = activity.startTime.getHours();

      switch (selectedTimeFilter) {
        case 'morning':
          return activityHour >= 6 && activityHour < 12;
        case 'afternoon':
          return activityHour >= 12 && activityHour < 18;
        case 'last2h':
          const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
          return activity.startTime >= twoHoursAgo;
        case 'all':
        default:
          return true;
      }
    });
  };

  const filteredActivities = getFilteredActivities();

  // ... [Resto del código de renderizado permanece igual hasta el return]
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

      {/* Tabs de navegación */}
      <View style={styles.tabContainer}>
        {/* <TouchableOpacity
          style={[
            styles.tabButton, 
            activeTab === \'register\' && styles.activeTab
          ]}
          onPress={() => setActiveTab(\'register\')}
        >
          <Ionicons 
            name="add-circle-outline" 
            size={20} 
            color={activeTab === \'register\' ? \'#2563eb\' : \'#64748b\'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === \'register\' && styles.activeTabText
          ]}>
            Registrar
          </Text>
        </TouchableOpacity> */}
        
        <TouchableOpacity
          style={[
            styles.tabButton, 
            activeTab === 'activities' && styles.activeTab
          ]}
          onPress={() => setActiveTab('activities')}
        >
          <Ionicons 
            name="time-outline" 
            size={20} 
            color={activeTab === 'activities' ? '#2563eb' : '#64748b'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'activities' && styles.activeTabText
          ]}>
            Actividades
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton, 
            activeTab === 'project' && styles.activeTab
          ]}
          onPress={() => setActiveTab('project')}
        >
          <FontAwesome 
            name="folder-o" 
            size={20} 
            color={activeTab === 'project' ? '#2563eb' : '#64748b'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'project' && styles.activeTabText
          ]}>
            Proyecto
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* {activeTab === 'register' && (
          <View style={styles.registerSection}>
            <Text style={styles.sectionTitle}>Nueva Actividad</Text>
            <Text style={styles.currentTime}>
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' - '}
              {formatTime(currentTime)}
            </Text>
            
            <View style={styles.typeSelection}>
              {activityTypes.map(({ type, label, icon }) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeCard,
                    selectedType === type && styles.typeCardSelected
                  ]}
                  onPress={() => setSelectedType(type as ActivityType)}
                >
                  <MaterialCommunityIcons 
                    name={icon as any} 
                    size={24} 
                    color={selectedType === type ? '#ffffff' : '#3b82f6'} 
                  />
                  <Text style={[
                    styles.typeLabel,
                    selectedType === type && styles.typeLabelSelected
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedType === 'TURBINE_WORK' && (
              <View style={styles.turbineSelection}>
                <Text style={styles.subtitle}>Selecciona Turbina</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.turbineScroll}
                >
                  {filteredTurbines.map(turbine => (
                    <TouchableOpacity
                      key={turbine.id}
                      style={[
                        styles.turbineCard,
                        selectedTurbine === turbine.id && styles.turbineCardSelected
                      ]}
                      onPress={() => setSelectedTurbine(turbine.id)}
                    >
                      <Ionicons 
                        name="cog" 
                        size={24} 
                        color={selectedTurbine === turbine.id ? '#ffffff' : '#f59e0b'} 
                      />
                      <Text style={[
                        styles.turbineName,
                        selectedTurbine === turbine.id && styles.turbineNameSelected
                      ]}>
                        {turbine.name}
                      </Text>
                      <Text style={[
                        styles.turbineStatus,
                        selectedTurbine === turbine.id && styles.turbineStatusSelected
                      ]}>
                        {turbine.status === 'COMPLETED' ? 'Completada' : 
                         turbine.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.notesSection}>
              <Text style={styles.subtitle}>Notas</Text>
              <TextInput
                style={styles.notesInput}
                multiline
                placeholder="Describe los detalles de la actividad..."
                placeholderTextColor="#94a3b8"
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleStartActivity}
            >
              <Text style={styles.actionButtonText}>
                {selectedType === 'TURBINE_WORK' && selectedTurbine 
                  ? `Iniciar en ${mockTurbines.find(t => t.id === selectedTurbine)?.name}`
                  : 'Iniciar Actividad'}
              </Text>
            </TouchableOpacity>
          </View>
        )} */} 
        {activeTab === 'activities' && (
          <View style={styles.activitiesSection}>
            {/* Enhanced Statistics Container */}
            <View style={styles.enhancedStatsContainer}>
              {/* Header with title and date */}              <View style={styles.statsHeader}>
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
              
              {/* Enhanced Statistics Grid */}              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: '#eff6ff' }]}>
                    <MaterialCommunityIcons name="clock-outline" size={22} color="#3b82f6" />
                  </View>
                  <Text style={styles.statValue}>4:00:45</Text>
                  <Text style={styles.statLabel}>Tiempo Total</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: '#ecfdf5' }]}>
                    <MaterialCommunityIcons name="chart-timeline-variant" size={22} color="#059669" />
                  </View>
                  <Text style={[styles.statValue, { color: '#059669' }]}>3:35:12</Text>
                  <Text style={styles.statLabel}>Tiempo Productivo</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: '#fef2f2' }]}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={22} color="#ef4444" />
                  </View>
                  <Text style={[styles.statValue, { color: '#ef4444' }]}>1</Text>
                  <Text style={styles.statLabel}>Incidencias</Text>
                </View>
              </View>
            </View>            {/* Time Filter Component */}
            <View style={styles.timeFilterContainer}>
              <View style={styles.timeFilterHeader}>
                <Text style={styles.timeFilterTitle}>Filtrar por:</Text>
                <Text style={styles.filterResultText}>
                  {filteredActivities.length} de {todayActivities.length} actividades
                </Text>
              </View>
              <View style={styles.timeFilterButtons}>
                {[
                  { id: 'all', label: 'Todo el día' },
                  { id: 'morning', label: 'Mañana' },
                  { id: 'afternoon', label: 'Tarde' },
                  { id: 'last2h', label: 'Últimas 2h' }
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.timeFilterButton,
                      selectedTimeFilter === filter.id && styles.timeFilterButtonActive
                    ]}
                    onPress={() => setSelectedTimeFilter(filter.id)}
                  >
                    <Text style={[
                      styles.timeFilterButtonText,
                      selectedTimeFilter === filter.id && styles.timeFilterButtonTextActive
                    ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
              {/* Activities Timeline */}
            <View style={styles.activitiesTimeline}>              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity, index, arr) => {
                  // Detectar si es 'Inicio de jornada'
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

                  const activityType = activityTypes.find(t => t.type === activity.type);
                  const turbine = activity.turbineId ? mockTurbines.find(t => t.id === activity.turbineId) : null;
                  
                  return (
                    <View key={activity.id} style={styles.activityCardContainer}>
                      {/* Main Activity Card */}
                      <View style={styles.activityCardWrapper}>
                        <View style={styles.activityHeaderRow}>
                          <View style={styles.activityTitleSection}>
                            <View style={styles.activityIconWrapper}>
                              <MaterialCommunityIcons
                                name={(activityType?.icon || 'clock') as any}
                                size={24}
                                color="#2563eb"
                              />
                            </View>
                            <Text style={styles.activityTitle}>{activityType?.label || activity.type}</Text>
                          </View>
                          {activity.endTime && (
                            <View style={styles.activityDurationBadge}>
                              <Text style={styles.activityDurationText}>
                                {formatDuration(activity.startTime, activity.endTime)}
                              </Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.activityDetailsSection}>
                          {turbine && (
                            <View style={styles.activityDetailRow}>
                              <Ionicons name="cog" size={16} color="#64748b" style={styles.activityDetailIcon} />
                              <Text style={styles.activityDetailText}>
                                {turbine.name} • {turbine.status === 'COMPLETED' ? 'Completada' : 'En progreso'}
                              </Text>
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
                            <Text style={styles.activityDetailText}>
                              Inicio: {formatTime(activity.startTime)}
                              {activity.endTime && ` • Fin: ${formatTime(activity.endTime)}`}
                            </Text>
                          </View>

                          {activity.type === 'TURBINE_WORK' && (
                            <View style={styles.activityDetailRow}>
                              <MaterialCommunityIcons name="drone" size={16} color="#64748b" style={styles.activityDetailIcon} />
                              <Text style={styles.activityDetailText}>Dron: {assignedDrone.model}</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Incidencias asociadas */}
                      {mockIncidents.filter(incident => incident.activityId === activity.id).map((incident) => {
                        const incidentType = incidentTypes.find(t => t.id === incident.type);
                        return (
                          <View key={incident.id} style={styles.incidentCardWrapper}>
                            <View style={styles.incidentHeader}>
                              <View style={styles.incidentTitleSection}>
                                <MaterialCommunityIcons 
                                  name={incidentType?.icon as any} 
                                  size={18} 
                                  color="#ef4444" 
                                  style={{ marginRight: 8 }} 
                                />
                                <Text style={styles.incidentTitle}>
                                  {incidentType?.label || 'Incidente'}
                                </Text>
                              </View>
                            </View>
                            
                            <Text style={styles.incidentDescription}>{incident.description}</Text>                            <View style={styles.incidentDetails}>
                              <Text style={styles.incidentDetailText}>
                                {formatTime(new Date(incident.timestamp))}
                                {/* • Estado: {getStatusLabel(incident.status)} */}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Image
                    source={require('../../assets/images/no-activities.png')}
                    style={styles.emptyImage}
                  />
                  <Text style={styles.emptyText}>No hay actividades registradas hoy</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === 'project' && (
          <View style={styles.projectSection}>
            <Text style={styles.sectionTitle}>Proyecto Actual</Text>
            
            <View style={styles.projectCard}>
              <Text style={styles.projectName}>{currentProject.name}</Text>
              <Text style={styles.projectClient}>{currentProject.clientName}</Text>
              
              <View style={styles.projectStatus}>
                <View style={[
                  styles.statusBadge,
                  { 
                    backgroundColor: currentProject.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                    borderColor: currentProject.status === 'ACTIVE' ? '#10b981' : '#ef4444'
                  }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: currentProject.status === 'ACTIVE' ? '#10b981' : '#ef4444' }
                  ]}>
                    {currentProject.status === 'ACTIVE' ? 'En Progreso' : 'Completado'}
                  </Text>
                </View>
                <Text style={styles.projectId}>Contrato: {currentProject.contractId}</Text>
              </View>
              
              <View style={styles.projectTimeline}>
                <View style={styles.projectDate}>
                  <Text style={styles.projectDateLabel}>Inicio</Text>
                  <Text style={styles.projectDateValue}>
                    {currentProject.startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '65%' }]} />
                  </View>
                  <Text style={styles.progressText}>65% completado</Text>
                </View>
                
                <View style={styles.projectDate}>
                  <Text style={styles.projectDateLabel}>Fin</Text>
                  <Text style={styles.projectDateValue}>
                    {currentProject.endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
              </View>
              
              <View style={styles.projectDetail}>
                <Ionicons name="location" size={20} color="#3b82f6" />
                <Text style={styles.projectDetailText}>{currentProject.location}</Text>
              </View>
              
              <View style={styles.projectDetail}>
                <MaterialCommunityIcons name="drone" size={20} color="#3b82f6" />
                <Text style={styles.projectDetailText}>
                  {assignedDrone.model} (Batería: {assignedDrone.batteryStatus}%)
                </Text>
              </View>
              
              <Text style={styles.turbinesTitle}>Turbinas ({mockTurbines.length})</Text>
              <View style={styles.turbinesContainer}>
                {mockTurbines.map(turbine => (
                  <View key={turbine.id} style={styles.turbineItem}>
                    <View style={styles.turbineInfo}>
                      <Ionicons name="cog" size={20} color="#f59e0b" />
                      <Text style={styles.turbineItemName}>{turbine.name}</Text>
                    </View>
                    <View style={[
                      styles.turbineStatusBadge,
                      { 
                        backgroundColor: turbine.status === 'COMPLETED' ? '#d1fae5' : 
                                        turbine.status === 'IN_PROGRESS' ? '#dbeafe' : '#e2e8f0',
                        borderColor: turbine.status === 'COMPLETED' ? '#10b981' : 
                                    turbine.status === 'IN_PROGRESS' ? '#3b82f6' : '#94a3b8'
                       }
                    ]}>
                      <Text style={[
                        styles.turbineStatusText,
                        { 
                          color: turbine.status === 'COMPLETED' ? '#10b981' : 
                                turbine.status === 'IN_PROGRESS' ? '#3b82f6' : '#64748b'
                        }
                      ]}>
                        {turbine.status === 'COMPLETED' ? 'Completada' : 
                         turbine.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  },  content: {
    padding: 12, // Reduced from 16
  },
  registerSection: {
    marginBottom: 0, // Reduced from 24
  },
  currentTime: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1e3a8a',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  typeSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  typeCardSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  typeLabel: {
    color: '#1e3a8a',
    fontWeight: '500',
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: '#ffffff',
  },
  turbineSelection: {
    marginBottom: 16,
  },
  turbineScroll: {
    gap: 12,
    paddingRight: 16,
  },
  turbineCard: {
    width: 120,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  turbineCardSelected: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
  },
  turbineName: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 16,
  },
  turbineNameSelected: {
    color: '#ffffff',
  },
  turbineStatus: {
    color: '#64748b',
    fontSize: 12,
  },
  turbineStatusSelected: {
    color: '#ffffff',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#1e3a8a',
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },  // Activities Tab Styles (Updated for Consistency)
  activitiesSection: {
    marginBottom: 16, // Reduced from 24
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 16,
  },
  activityDuration: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 2,
  },  activityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  stopButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  stopButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500',
  },  // Project Tab Styles (Updated for Consistency)
  projectSection: {
    marginBottom: 16, // Reduced from 24
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  projectName: {
    color: '#1e3a8a',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  projectClient: {
    color: '#64748b',
    fontSize: 16,
    marginBottom: 12,
  },
  projectStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  projectId: {
    color: '#64748b',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  projectTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  projectDate: {
    width: 60,
  },
  projectDateLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  projectDateValue: {
    color: '#1e3a8a',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  progressBarContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  progressText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  projectDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 8,
  },
  projectDetailText: {
    color: '#475569',
    fontSize: 14,
  },
  turbinesTitle: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  turbinesContainer: {
    gap: 8,
  },
  turbineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  turbineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  turbineItemName: {
    color: '#1e3a8a',
    fontSize: 14,
    fontWeight: '500',
  },
  turbineStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  turbineStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },  // Activities Timeline
  activitiesTimeline: {
    marginTop: 0, // Adjusted from 8 for consistent spacing with time filter
  },
  startOfDayContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: -1, // Adjusted from marginVertical
    marginBottom: 16, // Added for consistency
  },
  // Activity Card Styles (Updated for Consistency)
  activityCardContainer: {
    marginBottom: 16, // Consistent spacing between timeline items
  },
  activityCardWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 0, // Spacing to incident handled by incident's marginTop
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
    marginBottom: 12, // Reduced from 16
  },
  activityTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIconWrapper: {
    width: 36, // Reduced from 48
    height: 36, // Reduced from 48
    borderRadius: 18, // Reduced from 24
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12, // Reduced from 16
    borderWidth: 1.5, // Reduced from 2
    borderColor: '#dbeafe',
  },
  activityTitle: {
    fontSize: 16, // Reduced from 18
    fontWeight: '600', // Reduced from '700'
    color: '#1e293b',
  },
  activityDurationBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12, // Reduced from 16
    paddingVertical: 6, // Reduced from 8
    borderRadius: 10, // Reduced from 12
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activityDurationText: {
    color: '#475569',
    fontSize: 13, // Reduced from 14
    fontWeight: '600',
  },
  activityDetailsSection: {
    gap: 8, // Reduced from 12
  },
  activityDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDetailIcon: {
    marginRight: 10, // Reduced from 12
    width: 18, // Reduced from 20
    textAlign: 'center',
  },
  activityDetailText: {
    color: '#64748b',
    fontSize: 13, // Reduced from 14
    flex: 1,
  },  // Time Filter Styles
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
  },// Incident Card Styles (Updated for Consistency)
  incidentCardWrapper: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 12,
    marginLeft: 16,
    marginTop: 16, // Increased from 12 to add more space
    marginBottom: 0, // Spacing to next activity handled by activityCardContainer
    borderWidth: 1,
    borderColor: '#fecaca',
    borderLeftWidth: 3, // Reduced from 4
    borderLeftColor: '#ef4444',
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6, // Reduced from 8
  },
  incidentTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  incidentTitle: {
    color: '#ef4444',
    fontWeight: '600', // Reduced from '700'
    fontSize: 14, // Reduced from 16
  },
  incidentDescription: {
    color: '#64748b',
    fontSize: 13, // Reduced from 14
    marginBottom: 6, // Reduced from 8
    lineHeight: 18, // Reduced from 20
  },
  incidentDetails: {
    marginTop: 2, // Reduced from 4
  },
  incidentDetailText: {
    color: '#64748b',
    fontSize: 11, // Reduced from 12
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  fixedActivityCard: {
    width: '100%',
    minHeight: 64,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 0,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
  },
  fixedSubActivityCard: {
    width: '100%',
    minHeight: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 0,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
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
  },  startDayHour: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '400',
  },  // Enhanced Statistics Container Styles (Updated for Consistency)
  enhancedStatsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12, // Reduced from 16
    padding: 16, // Reduced from 20
    marginBottom: 16, // Reduced from 20
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // Reduced shadow
    shadowOpacity: 0.03, // Reduced from 0.05
    shadowRadius: 4, // Reduced from 8
    elevation: 1, // Reduced from 2
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16, // Reduced from 20
  },
  statsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIconWrapper: {
    marginRight: 10, // Reduced from 12
    padding: 3, // Reduced from 4
  },
  statsTitle: {
    fontSize: 18, // Reduced from 20
    fontWeight: '600', // Reduced from '700'
    color: '#1e293b',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10, // Reduced from 12
    paddingVertical: 6, // Reduced from 8
    borderRadius: 10, // Reduced from 12
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statsDate: {
    fontSize: 11, // Reduced from 12
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
    width: 36, // Reduced from 40
    height: 36, // Reduced from 40
    borderRadius: 18, // Reduced from 20
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6, // Reduced from 8
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 18, // Reduced from 20
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 3, // Reduced from 4
  },
  statLabel: {
    fontSize: 11, // Reduced from 12
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 36, // Reduced from 40
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12, // Reduced from 16
  },// Incident Card Styles (Legacy - Replaced by enhanced version)
  incidentSeverityBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  incidentSeverityText: {
    color: '#b91c1c',
    fontSize: 11,
    fontWeight: '600',
  },
});
