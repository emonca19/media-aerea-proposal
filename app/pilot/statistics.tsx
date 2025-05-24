import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function PilotStatistics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '12m'>('7d');

  // Datos mockeados para motivar al piloto
  const pilotStats = {
    overall: {
      totalFlights: 248,
      flightHours: '156h 42min',
      inspectedTurbines: 18,
      capturedPhotos: 1234,
      efficiency: 94,
      rank: 3,
      totalPilots: 25,
      achievements: 12
    },
    performance: {
      avgTimePerTurbine: '42min',
      avgPhotoUploadTime: '8min',
      completionRate: 96,
      qualityScore: 4.8,
      safetyScore: 5.0,
      punctuality: 98
    },
    incidents: {
      total: 2,
      resolved: 2,
      pending: 0,
      lastIncident: '15 días atrás',
      safetyStreak: 45 // días sin incidentes
    }
  };

  // Datos para gráficos por período
  const chartData = {
    '7d': {
      efficiency: [85, 88, 92, 96, 94, 97, 98],
      flights: [3, 4, 5, 6, 4, 7, 5],
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    },
    '30d': {
      efficiency: [82, 85, 88, 90, 92, 94, 96],
      flights: [15, 18, 22, 25, 20, 28, 24],
      labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7']
    },
    '12m': {
      efficiency: [78, 82, 85, 88, 90, 92, 94, 95, 96, 97, 96, 98],
      flights: [45, 52, 58, 62, 68, 75, 72, 78, 82, 85, 88, 92],
      labels: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
    }
  };

  // Datos de turbinas inspeccionadas
  const turbineStats = [
    { id: 'T001', name: 'Turbina A-01', inspections: 8, status: 'excellent', efficiency: 98 },
    { id: 'T002', name: 'Turbina A-02', inspections: 6, status: 'good', efficiency: 94 },
    { id: 'T003', name: 'Turbina B-12', inspections: 12, status: 'excellent', efficiency: 97 },
    { id: 'T004', name: 'Turbina C-07', inspections: 4, status: 'average', efficiency: 89 },
    { id: 'T005', name: 'Turbina D-15', inspections: 9, status: 'excellent', efficiency: 96 }
  ];

  // Logros y badges
  const achievements = [
    { id: 1, name: 'Piloto del Mes', icon: 'trophy', color: '#f59e0b', earned: true },
    { id: 2, name: 'Sin Incidentes 45 días', icon: 'shield-checkmark', color: '#10b981', earned: true },
    { id: 3, name: 'Eficiencia +95%', icon: 'speedometer', color: '#3b82f6', earned: true },
    { id: 4, name: '100 Vuelos', icon: 'airplane', color: '#8b5cf6', earned: true },
    { id: 5, name: 'Mentor', icon: 'school', color: '#ef4444', earned: false },
    { id: 6, name: '1000 Fotos', icon: 'camera', color: '#06b6d4', earned: true }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'average': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bueno';
      case 'average': return 'Regular';
      default: return 'N/A';
    }
  };

  const maxValue = Math.max(...chartData[selectedPeriod].efficiency);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: "Estadísticas",
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      <StatusBar backgroundColor="#1E3A8A" barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header con resumen general */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.headerCard}>
          <LinearGradient
            colors={['#1E3A8A', '#3B82F6']}
            style={styles.gradientCard}
          >
            <View style={styles.headerContent}>
              <View style={styles.rankBadge}>
                <Ionicons name="trophy" size={16} color="#f59e0b" />
                <Text style={styles.rankText}>#{pilotStats.overall.rank} de {pilotStats.overall.totalPilots}</Text>
              </View>
              <Text style={styles.efficiencyBig}>{pilotStats.overall.efficiency}%</Text>
              <Text style={styles.efficiencyLabel}>Eficiencia General</Text>
              <View style={styles.headerStats}>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>{pilotStats.overall.totalFlights}</Text>
                  <Text style={styles.headerStatLabel}>Vuelos</Text>
                </View>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>{pilotStats.overall.flightHours}</Text>
                  <Text style={styles.headerStatLabel}>Horas</Text>
                </View>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>{pilotStats.incidents.safetyStreak}</Text>
                  <Text style={styles.headerStatLabel}>Días Seguros</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Selector de período */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.periodSelector}>
          <Text style={styles.sectionTitle}>Rendimiento</Text>
          <View style={styles.periodButtons}>
            {(['7d', '30d', '12m'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive
                ]}>
                  {period === '7d' ? '7 días' : period === '30d' ? '30 días' : '12 meses'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Gráfico de eficiencia */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.chartCard}>
          <Text style={styles.chartTitle}>Eficiencia por {selectedPeriod === '7d' ? 'Día' : selectedPeriod === '30d' ? 'Semana' : 'Mes'}</Text>
          <View style={styles.chart}>
            {chartData[selectedPeriod].efficiency.map((value, index) => {
              const height = (value / maxValue) * 100;
              const isHighest = value === maxValue;
              
              return (
                <Animated.View 
                  key={index} 
                  style={styles.chartColumn}
                  entering={SlideInRight.delay(400 + index * 50)}
                >
                  <View style={styles.chartBarContainer}>
                    <View style={[
                      styles.chartBar,
                      { height: `${height}%` },
                      isHighest && styles.chartBarHighest
                    ]}>
                      <LinearGradient
                        colors={isHighest ? ['#10b981', '#059669'] : ['#e0e7ff', '#c7d2fe']}
                        style={styles.chartBarGradient}
                      />
                    </View>
                    <Text style={[styles.chartValue, isHighest && styles.chartValueHighest]}>
                      {value}%
                    </Text>
                  </View>
                  <Text style={styles.chartLabel}>{chartData[selectedPeriod].labels[index]}</Text>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* Métricas de rendimiento */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="time" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.metricValue}>{pilotStats.performance.avgTimePerTurbine}</Text>
            <Text style={styles.metricLabel}>Tiempo promedio por turbina</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#d1fae5' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            </View>
            <Text style={styles.metricValue}>{pilotStats.performance.completionRate}%</Text>
            <Text style={styles.metricLabel}>Tasa de finalización</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="star" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.metricValue}>{pilotStats.performance.qualityScore}</Text>
            <Text style={styles.metricLabel}>Puntuación de calidad</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#fecaca' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#ef4444" />
            </View>
            <Text style={styles.metricValue}>{pilotStats.performance.safetyScore}</Text>
            <Text style={styles.metricLabel}>Puntuación de seguridad</Text>
          </View>
        </Animated.View>

        {/* Estado de incidencias */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.incidentsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Estado de Seguridad</Text>
            <View style={styles.safetyBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#10b981" />
              <Text style={styles.safetyBadgeText}>Excelente</Text>
            </View>
          </View>
          
          <View style={styles.incidentsGrid}>
            <View style={styles.incidentMetric}>
              <Text style={styles.incidentValue}>{pilotStats.incidents.total}</Text>
              <Text style={styles.incidentLabel}>Incidencias totales</Text>
            </View>
            <View style={styles.incidentMetric}>
              <Text style={[styles.incidentValue, { color: '#10b981' }]}>{pilotStats.incidents.resolved}</Text>
              <Text style={styles.incidentLabel}>Resueltas</Text>
            </View>
            <View style={styles.incidentMetric}>
              <Text style={[styles.incidentValue, { color: '#ef4444' }]}>{pilotStats.incidents.pending}</Text>
              <Text style={styles.incidentLabel}>Pendientes</Text>
            </View>
          </View>

          <View style={styles.safetyStreak}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.streakBadge}
            >
              <Ionicons name="flame" size={20} color="#ffffff" />
              <Text style={styles.streakText}>{pilotStats.incidents.safetyStreak} días sin incidencias</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Turbinas inspeccionadas */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.turbinesCard}>
          <Text style={styles.cardTitle}>Turbinas Inspeccionadas</Text>
          {turbineStats.map((turbine, index) => (
            <Animated.View 
              key={turbine.id} 
              style={styles.turbineItem}
              entering={FadeInDown.delay(800 + index * 100)}
            >
              <View style={styles.turbineInfo}>
                <View style={[styles.turbineStatus, { backgroundColor: getStatusColor(turbine.status) }]} />
                <View style={styles.turbineDetails}>
                  <Text style={styles.turbineName}>{turbine.name}</Text>
                  <Text style={styles.turbineInspections}>{turbine.inspections} inspecciones</Text>
                </View>
              </View>
              <View style={styles.turbineMetrics}>
                <Text style={[styles.turbineEfficiency, { color: getStatusColor(turbine.status) }]}>
                  {turbine.efficiency}%
                </Text>
                <Text style={styles.turbineStatusText}>{getStatusText(turbine.status)}</Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Logros y badges */}
        <Animated.View entering={FadeInDown.delay(900)} style={styles.achievementsCard}>
          <Text style={styles.cardTitle}>Logros y Reconocimientos</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement, index) => (
              <Animated.View 
                key={achievement.id} 
                style={[
                  styles.achievementItem,
                  !achievement.earned && styles.achievementLocked
                ]}
                entering={SlideInRight.delay(1000 + index * 100)}
              >
                <View style={[
                  styles.achievementIcon,
                  { backgroundColor: achievement.earned ? achievement.color : '#f3f4f6' }
                ]}>
                  <Ionicons 
                    name={achievement.icon as any} 
                    size={20} 
                    color={achievement.earned ? '#ffffff' : '#9ca3af'} 
                  />
                </View>
                <Text style={[
                  styles.achievementName,
                  !achievement.earned && styles.achievementNameLocked
                ]}>
                  {achievement.name}
                </Text>
                {achievement.earned && (
                  <View style={styles.earnedBadge}>
                    <Ionicons name="checkmark" size={12} color="#10b981" />
                  </View>
                )}
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientCard: {
    padding: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  rankText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  efficiencyBig: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  efficiencyLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  periodSelector: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#1e293b',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingHorizontal: 8,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarContainer: {
    height: 80,
    width: 24,
    justifyContent: 'flex-end',
    marginBottom: 8,
    position: 'relative',
  },
  chartBar: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 4,
  },
  chartBarGradient: {
    flex: 1,
    borderRadius: 12,
  },
  chartBarHighest: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chartValue: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  chartValueHighest: {
    color: '#10b981',
    fontWeight: '700',
  },
  chartLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 44) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  incidentsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    color: '#1f2937',
  },
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  safetyBadgeText: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '600',
    marginLeft: 4,
  },
  incidentsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  incidentMetric: {
    alignItems: 'center',
  },
  incidentValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  incidentLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  safetyStreak: {
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  streakText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  turbinesCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  turbineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  turbineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  turbineStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  turbineDetails: {
    flex: 1,
  },
  turbineName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  turbineInspections: {
    fontSize: 12,
    color: '#6b7280',
  },
  turbineMetrics: {
    alignItems: 'flex-end',
  },
  turbineEfficiency: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  turbineStatusText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  achievementsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: (width - 76) / 3,
    position: 'relative',
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 12,
  },
  achievementNameLocked: {
    color: '#9ca3af',
  },
  earnedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacing: {
    height: 32,
  },
});