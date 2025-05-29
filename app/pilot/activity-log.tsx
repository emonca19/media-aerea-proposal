import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
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
import { incidentTypes } from '../../src/mocks/incident-types';
import { mockTurbines } from '../../src/mocks/turbines';
import { useActivity } from '../contexts/ActivityContext';


const mockDrones = [
  { id: '1', model: 'DJI Matrice 300 RTK', serialNumber: 'SN-M300-78451', batteryStatus: 85 },
  { id: '2', model: 'DJI Phantom 4 Pro', serialNumber: 'SN-P4P-45213', batteryStatus: 60 }
];

const activityTypes = [
  { type: 'MOBILIZATION', label: 'Movilización', icon: 'bus' },
  { type: 'TURBINE_WORK', label: 'Trabajo en Turbina', icon: 'wind-turbine' },
  { type: 'BREAK', label: 'Pausa', icon: 'pause-circle' },
  { type: 'MEAL', label: 'Tiempo de Comida', icon: 'food' },
  { type: 'WEATHER_DELAY', label: 'Retraso por Clima', icon: 'weather-cloudy' },
  { type: 'OTHER', label: 'Llegada al sitio', icon: 'map-marker' }
];

export default function ActivityLogScreen() {
  const { newActivity, message } = useLocalSearchParams(); // Eliminado initialTab
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  
  // Use the activity context instead of mock data
  const { activities, incidents } = useActivity();

  // Filtra las actividades del día actual
  const todayActivities = activities; // Usar actividades del contexto
  useEffect(() => {
    if (newActivity && message) {
      Alert.alert(
        'Actividad Iniciada',
        typeof message === 'string' ? message : 'Actividad iniciada exitosamente',
        [{ text: 'OK' }]
      );
    }
  }, [newActivity, message]);

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
      {/* El ScrollView ahora siempre muestra las actividades, sin tabs */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}><View style={styles.activitiesSection}>
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
                  {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
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
                <Text style={[styles.statValue, { color: '#ef4444' }]}>{incidents.length}</Text>
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
                            <Text style={styles.activityDetailText}>{turbine.name} • {turbine.status === 'APPROVED' ? 'Completada' : 'En progreso'}</Text>
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
                    {incidents.filter(incident => incident.activityId === activity.id).map((incident) => {
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Color de fondo general de la app
  },  content: { // Estilo para el ScrollView de la pestaña 'activities'
    paddingHorizontal: 8, // Reducido de 12 a 8 para más espacio en pantalla
    paddingTop: 12, // Reducido de 16 a 12
    paddingBottom: 16, // Espacio abajo dentro del scroll
  },
  // --- Estilos de la pestaña 'activities' ---
  activitiesSection: {
    // No necesita marginBottom si el content del ScrollView ya tiene paddingBottom
  },  enhancedStatsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10, // Reducido de 12 a 10
    padding: 12, // Reducido de 16 a 12
    marginBottom: 12, // Reducido de 16 a 12
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },  statsIconWrapper: {
    marginRight: 8,
    padding: 2,
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
  },  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
  },  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 10,
  },timeFilterContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },  timeFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  },  timeFilterButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  timeFilterButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
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
  },  startOfDayContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: -1,
    marginBottom: 12,
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
  },  startDayBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingVertical: 3,
    paddingHorizontal: 12,
    marginHorizontal: 10,
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
    fontSize: 14,
    marginRight: 6,
  },
  startDayHour: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '400',
  },activityCardContainer: {
    marginBottom: 12,
  },
  activityCardWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },  activityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activityTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },  activityIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#dbeafe',
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },  activityDurationBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activityDurationText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },  activityDetailsSection: {
    gap: 6,
  },
  activityDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },  activityDetailIcon: {
    marginRight: 8,
    width: 16,
    textAlign: 'center',
  },
  activityDetailText: {
    color: '#64748b',
    fontSize: 12,
    flex: 1,
  },  incidentCardWrapper: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 10,
    marginLeft: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  incidentTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },  incidentTitle: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 13,
  },
  incidentDescription: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  incidentDetails: {
    marginTop: 2,
  },
  incidentDetailText: {
    color: '#64748b',
    fontSize: 11,
  },  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 16, // Para que no quede pegado al filtro si no hay actividades
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 15,
  },
});