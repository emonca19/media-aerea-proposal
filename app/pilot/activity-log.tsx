import { Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import { Card } from '../../src/components/common';
import { MaterialCommunityIcons, Ionicons, FontAwesome } from '@expo/vector-icons';


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
    id: '1',
    type: 'TURBINE_WORK',
    turbineId: '1',
    startTime: new Date('2023-05-18T09:30:00'),
    endTime: new Date('2023-05-18T11:45:00'),
    notes: 'Inspección de aspas y sistemas eléctricos. Se encontró desgaste moderado en el aspa norte.',
    operator: 'Juan Pérez'
  },
  {
    id: '2',
    type: 'MOBILIZATION',
    startTime: new Date('2023-05-18T08:00:00'),
    endTime: new Date('2023-05-18T09:15:00'),
    notes: 'Traslado al parque eólico con equipo de inspección',
    operator: 'Juan Pérez'
  },
  {
    id: '3',
    type: 'TURBINE_WORK',
    turbineId: '4',
    startTime: new Date('2023-05-18T13:30:00'),
    endTime: null, // En progreso
    notes: 'Inspección de la base y torre. Pendiente reporte completo.',
    operator: 'Juan Pérez'
  },
];

type ActivityType = 'MOBILIZATION' | 'TURBINE_WORK' | 'BREAK' | 'WEATHER_DELAY' | 'OTHER' | 'MEAL';

const activityTypes = [
  { type: 'MOBILIZATION', label: 'Movilización', icon: 'bus' },
  { type: 'TURBINE_WORK', label: 'Trabajo en Turbina', icon: 'wind-turbine' },
  { type: 'BREAK', label: 'Descanso', icon: 'coffee' },
  { type: 'MEAL', label: 'Tiempo de Comida', icon: 'food' },
  { type: 'WEATHER_DELAY', label: 'Retraso por Clima', icon: 'weather-cloudy' },
  { type: 'OTHER', label: 'Otro', icon: 'dots-horizontal' }
];

export default function ActivityLogScreen() {
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [selectedTurbine, setSelectedTurbine] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'register' | 'activities' | 'project'>('register');
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentProject = mockProjects[0];
  const assignedDrone = mockDrones[0];
  const todayActivities = mockActivities;
  const filteredTurbines = mockTurbines.filter(t => t.status !== 'COMPLETED');

  // Actualizar la hora actual cada minuto
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
  };

  const handleStopActivity = (activityId: string) => {
    Alert.alert(
      'Actividad Finalizada',
      'La actividad se ha marcado como completada'
    );
    // En una app real, actualizarías el estado o harías un API call
    console.log('Actividad finalizada:', activityId);
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
        <TouchableOpacity
          style={[
            styles.tabButton, 
            activeTab === 'register' && styles.activeTab
          ]}
          onPress={() => setActiveTab('register')}
        >
          <MaterialCommunityIcons 
            name="clock-outline" 
            size={20} 
            color={activeTab === 'register' ? '#ffffff' : '#64748b'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'register' && styles.activeTabText
          ]}>
            Registrar
          </Text>
        </TouchableOpacity>
        
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
            color={activeTab === 'activities' ? '#ffffff' : '#64748b'} 
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
            color={activeTab === 'project' ? '#ffffff' : '#64748b'} 
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
        {activeTab === 'register' && (
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
        )}

        {activeTab === 'activities' && (
          <View style={styles.activitiesSection}>
            <Text style={styles.sectionTitle}>Registro del Día</Text>
            <Text style={styles.subtitle}>
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            
            {todayActivities.length > 0 ? (
              todayActivities.map((activity, index) => {
                const activityType = activityTypes.find(t => t.type === activity.type);
                const turbine = activity.turbineId ? mockTurbines.find(t => t.id === activity.turbineId) : null;
                
                return (
                  <Card key={activity.id} style={[
                    styles.activityCard,
                    index === todayActivities.length - 1 && { marginBottom: 0 }
                  ]}>
                    <View style={styles.activityHeader}>
                      <View style={styles.activityIconContainer}>
                        <MaterialCommunityIcons 
                          name={(activityType?.icon || 'clock') as any} 
                          size={24} 
                          color={activity.endTime ? '#10b981' : '#3b82f6'} 
                        />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityType}>{activityType?.label || activity.type}</Text>
                        <Text style={styles.activityDuration}>
                          {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                          {activity.endTime && ` • ${formatDuration(activity.startTime, activity.endTime)}`}
                        </Text>
                        {!activity.endTime && (
                          <TouchableOpacity 
                            style={styles.stopButton}
                            onPress={() => handleStopActivity(activity.id)}
                          >
                            <Text style={styles.stopButtonText}>Finalizar</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    
                    {turbine && (
                      <View style={styles.activityDetail}>
                        <Ionicons name="cog" size={16} color="#64748b" />
                        <Text style={styles.activityDetailText}>
                          {turbine.name} • {turbine.status === 'COMPLETED' ? 'Completada' : 'En progreso'}
                        </Text>
                      </View>
                    )}
                    
                    {activity.notes && (
                      <View style={styles.activityDetail}>
                        <Ionicons name="document-text" size={16} color="#64748b" />
                        <Text style={styles.activityDetailText}>{activity.notes}</Text>
                      </View>
                    )}
                  </Card>
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
  },
  content: {
    padding: 16,
  },
  registerSection: {
    marginBottom: 24,
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
  },
  // Activities Tab Styles
  activitiesSection: {
    marginBottom: 24,
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
  },
  activityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  activityDetailText: {
    color: '#475569',
    fontSize: 14,
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
  },
  // Project Tab Styles
  projectSection: {
    marginBottom: 24,
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
  },
  // Empty State
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
});
