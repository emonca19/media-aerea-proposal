import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
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
import { mockActivities, mockTurbines, mockProjects, mockDrones, mockParks } from '../../src/mocks/data';
import { MaterialCommunityIcons, Ionicons, FontAwesome } from '@expo/vector-icons';

// Función segura para obtener el proyecto actual
const getCurrentProject = () => {
  const base = mockProjects && mockProjects[0] ? mockProjects[0] : {
    id: '1',
    name: 'Proyecto Ejemplo',
    status: 'ACTIVE',
    startDate: new Date('2025-05-20'),
    endDate: new Date('2025-06-20'),
    clientId: '1',
    contractId: 'CON-001',
    description: '',
  };
  return {
    ...base,
    clientName: 'Cliente Ejemplo',
    contractId: 'CON-001',
    parkName: mockParks && mockParks[0] ? mockParks[0].name : 'Parque Ejemplo',
    location: mockParks && mockParks[0] ? mockParks[0].location.address : 'Dirección del parque',
    startDate: base.startDate ? new Date(base.startDate) : new Date('2025-05-20'),
    endDate: base.endDate ? new Date(base.endDate) : new Date('2025-06-20'),
  };
};

const getAssignedDrone = () => {
  return mockDrones && mockDrones[0] ? mockDrones[0] : {
    id: '1',
    model: 'DJI Phantom 4',
    serialNumber: 'SN-12345'
  };
};

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

  const currentProject = getCurrentProject();
  const assignedDrone = getAssignedDrone();
  const todayActivities = mockActivities.filter(
    activity => new Date(activity.startTime).toDateString() === new Date().toDateString()
  );

  const handleStartActivity = () => {
    if (!selectedType) {
      Alert.alert('Error', 'Selecciona un tipo de actividad');
      return;
    }

    if (selectedType === 'TURBINE_WORK' && !selectedTurbine) {
      Alert.alert('Error', 'Selecciona una turbina');
      return;
    }

    Alert.alert('Éxito', 'Actividad iniciada');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
          style={[styles.tabButton, activeTab === 'register' && styles.activeTab]}
          onPress={() => setActiveTab('register')}
        >
          <MaterialCommunityIcons 
            name="clock-outline" 
            size={20} 
            color={activeTab === 'register' ? '#ffffff' : '#1e3a8a'} 
          />
          <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
            Registrar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'activities' && styles.activeTab]}
          onPress={() => setActiveTab('activities')}
        >
          <Ionicons 
            name="time-outline" 
            size={20} 
            color={activeTab === 'activities' ? '#ffffff' : '#1e3a8a'} 
          />
          <Text style={[styles.tabText, activeTab === 'activities' && styles.activeTabText]}>
            Actividades
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'project' && styles.activeTab]}
          onPress={() => setActiveTab('project')}
        >
          <FontAwesome 
            name="folder-o" 
            size={20} 
            color={activeTab === 'project' ? '#ffffff' : '#1e3a8a'} 
          />
          <Text style={[styles.tabText, activeTab === 'project' && styles.activeTabText]}>
            Proyecto
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'register' && (
          <View style={styles.registerSection}>
            <Text style={styles.sectionTitle}>Registrar Actividad</Text>
            
            <View style={styles.typeSelection}>
              {activityTypes.map(({ type, label, icon }) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeCard,
                    selectedType === type && styles.typeCardSelected
                  ]}
                  onPress={() => setSelectedType(type)}
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
                <Text style={styles.subtitle}>Seleccionar Turbina</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.turbineScroll}
                >
                  {mockTurbines.map(turbine => (
                    <TouchableOpacity
                      key={turbine.id}
                      style={[
                        styles.turbineCard,
                        selectedTurbine === turbine.id && styles.turbineCardSelected
                      ]}
                      onPress={() => setSelectedTurbine(turbine.id)}
                    >
                      <Ionicons 
                        name="md-cog" 
                        size={24} 
                        color={selectedTurbine === turbine.id ? '#ffffff' : '#f59e0b'} 
                      />
                      <Text style={[
                        styles.turbineName,
                        selectedTurbine === turbine.id && styles.turbineNameSelected
                      ]}>
                        {turbine.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.notesSection}>
              <Text style={styles.subtitle}>Notas Adicionales</Text>
              <TextInput
                style={styles.notesInput}
                multiline
                placeholder="Describa detalles de la actividad..."
                placeholderTextColor="#94a3b8"
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleStartActivity}
            >
              <Text style={styles.actionButtonText}>Iniciar Actividad</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'activities' && (
          <View style={styles.activitiesSection}>
            <Text style={styles.sectionTitle}>Actividades de Hoy</Text>
            
            {todayActivities.length > 0 ? (
              todayActivities.map(activity => {
                const activityType = activityTypes.find(t => t.type === activity.type);
                return (
                  <Card key={activity.id} style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <MaterialCommunityIcons 
                        name={activityType?.icon || 'clock'} 
                        size={24} 
                        color="#3b82f6" 
                      />
                      <Text style={styles.activityType}>{activityType?.label || activity.type}</Text>
                      {activity.endTime ? (
                        <Text style={styles.activityDuration}>
                          {formatTime(new Date(activity.startTime))} - {formatTime(new Date(activity.endTime))}
                        </Text>
                      ) : (
                        <View style={styles.inProgressBadge}>
                          <Text style={styles.inProgressText}>En Progreso</Text>
                        </View>
                      )}
                    </View>
                    
                    {activity.turbineId && (
                      <View style={styles.activityDetail}>
                        <Ionicons name="md-cog" size={16} color="#64748b" />
                        <Text style={styles.activityDetailText}>
                          Turbina: {mockTurbines.find(t => t.id === activity.turbineId)?.name}
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
            <Text style={styles.sectionTitle}>Detalles del Proyecto</Text>
            
            <Card title="Info" style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Ionicons name="business" size={20} color="#3b82f6" />
                <Text style={styles.infoLabel}>Cliente:</Text>
                <Text style={styles.infoValue}>{currentProject.clientName}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="file-document" size={20} color="#3b82f6" />
                <Text style={styles.infoLabel}>Contrato:</Text>
                <Text style={styles.infoValue}>{currentProject.contractId}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="airplane" size={20} color="#3b82f6" />
                <Text style={styles.infoLabel}>Proyecto:</Text>
                <Text style={styles.infoValue}>{currentProject.name}</Text>
              </View>
            </Card>
            
            <Card title="Ubicación" style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Ionicons name="location" size={20} color="#3b82f6" />
                <Text style={styles.infoLabel}>Parque Eólico:</Text>
                <Text style={styles.infoValue}>{currentProject.parkName}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#3b82f6" />
                <Text style={styles.infoLabel}>Ubicación:</Text>
                <Text style={styles.infoValue}>{currentProject.location}</Text>
              </View>
            </Card>
            
            <Card title="Dron Asignado" style={styles.infoCard}>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="drone" size={20} color="#3b82f6" />
                <Text style={styles.infoLabel}>Dron Asignado:</Text>
                <Text style={styles.infoValue}>{assignedDrone.model} (Serial: {assignedDrone.serialNumber})</Text>
              </View>
            </Card>
            
            <View style={styles.datesContainer}>
              <Card style={styles.dateCard}>
                <Text style={styles.dateLabel}>Fecha Inicio</Text>
                <Text style={styles.dateValue}>
                  {new Date(currentProject.startDate).toLocaleDateString()}
                </Text>
              </Card>
              
              <Card style={styles.dateCard}>
                <Text style={styles.dateLabel}>Fecha Fin</Text>
                <Text style={styles.dateValue}>
                  {new Date(currentProject.endDate).toLocaleDateString()}
                </Text>
              </Card>
            </View>
            
            <Text style={styles.subtitle}>Turbinas Asignadas ({mockTurbines.length})</Text>
            {mockTurbines.map(turbine => (
              <Card key={turbine.id} style={styles.turbineInfoCard}>
                <View style={styles.turbineInfo}>
                  <Ionicons name="md-cog" size={24} color="#f59e0b" />
                  <Text style={styles.turbineInfoName}>{turbine.name}</Text>
                  <StatusBadge 
                    status={turbine.status} 
                    color={turbine.status === 'COMPLETED' ? '#10b981' : '#f59e0b'}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const StatusBadge = ({ status, color }: { status: string; color: string }) => (
  <View style={[styles.statusBadge, { backgroundColor: `${color}20`, borderColor: color }]}>
    <Text style={[styles.statusText, { color }]}>{status}</Text>
  </View>
);

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#1e3a8a',
    borderBottomWidth: 3,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    color: '#1e3a8a',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  registerSection: {
    marginBottom: 24,
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  turbineCardSelected: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
  },
  turbineName: {
    color: '#1e3a8a',
    fontWeight: '500',
  },
  turbineNameSelected: {
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
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
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
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  activityType: {
    color: '#1e3a8a',
    fontWeight: '600',
    flex: 1,
  },
  activityDuration: {
    color: '#64748b',
    fontSize: 14,
  },
  inProgressBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inProgressText: {
    color: '#0ea5e9',
    fontSize: 12,
    fontWeight: '500',
  },
  activityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  activityDetailText: {
    color: '#64748b',
    fontSize: 14,
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
    textAlign: 'center',
  },
  projectSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  infoLabel: {
    color: '#3b82f6',
    fontWeight: '600',
    width: 100,
  },
  infoValue: {
    color: '#1e3a8a',
    flex: 1,
  },
  datesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  dateLabel: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 4,
  },
  dateValue: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 16,
  },
  turbineInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  turbineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  turbineInfoName: {
    color: '#1e3a8a',
    fontWeight: '500',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});
