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
  SlideInUp // Cambiado desde SlideInRight para las barras
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Define some common colors for better consistency
const COLORS = {
  primary: '#1E3A8A', // Deep Blue
  primaryLight: '#3B82F6', // Lighter Blue
  secondary: '#10b981', // Green
  secondaryDark: '#059669', // Darker Green
  accentYellow: '#f59e0b',
  accentRed: '#ef4444',
  background: '#f0f4f8', // Light grayish-blue background
  cardBackground: '#ffffff',
  textPrimary: '#111827', // Darker text for titles
  textSecondary: '#374151', // Medium text
  textMuted: '#6b7280',   // Lighter text
  textLight: '#ffffff',
  lightGray: '#e5e7eb',
  separator: '#f3f4f6',
};

export default function PilotStatistics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '12m'>('7d');

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
      safetyStreak: 45
    }
  };

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
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] // Labels más descriptivos
    }
  };

  const turbineStats = [
    { id: 'T001', name: 'Turbina A-01', inspections: 8, status: 'excellent', efficiency: 98 },
    { id: 'T002', name: 'Turbina A-02', inspections: 6, status: 'good', efficiency: 94 },
    { id: 'T003', name: 'Turbina B-12', inspections: 12, status: 'excellent', efficiency: 97 },
    { id: 'T004', name: 'Turbina C-07', inspections: 4, status: 'average', efficiency: 89 },
    { id: 'T005', name: 'Turbina D-15', inspections: 9, status: 'excellent', efficiency: 96 }
  ];

  const achievements = [
    { id: 1, name: 'Piloto del Mes', icon: 'trophy-outline', color: COLORS.accentYellow, earned: true },
    { id: 2, name: 'Racha Segura', icon: 'shield-checkmark-outline', color: COLORS.secondary, earned: true },
    { id: 3, name: 'Max. Eficiencia', icon: 'speedometer-outline', color: COLORS.primaryLight, earned: true },
    { id: 4, name: '100 Vuelos', icon: 'airplane-outline', color: '#8b5cf6', earned: true },
    { id: 5, name: 'Mentor Experto', icon: 'school-outline', color: COLORS.accentRed, earned: false },
    { id: 6, name: '1000 Fotos OK', icon: 'camera-outline', color: '#06b6d4', earned: true }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return COLORS.secondary;
      case 'good': return COLORS.primaryLight;
      case 'average': return COLORS.accentYellow;
      default: return COLORS.textMuted;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return 'checkmark-circle-outline';
      case 'good': return 'thumbs-up-outline';
      case 'average': return 'alert-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const currentChartData = chartData[selectedPeriod];
  const maxValue = Math.max(...currentChartData.efficiency, 0);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Estadísticas de Piloto",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.textLight,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          headerShadowVisible: false,
        }}
      />
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100)} style={styles.headerCardWrapper}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            style={styles.gradientCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.rankBadge}>
                <Ionicons name="ribbon-outline" size={18} color={COLORS.accentYellow} />
                <Text style={styles.rankText}>Top #{pilotStats.overall.rank} / {pilotStats.overall.totalPilots}</Text>
              </View>
              <Text style={styles.efficiencyBig}>{pilotStats.overall.efficiency}%</Text>
              <Text style={styles.efficiencyLabel}>Eficiencia General</Text>
              <View style={styles.headerStats}>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>{pilotStats.overall.totalFlights}</Text>
                  <Text style={styles.headerStatLabel}>Vuelos</Text>
                </View>
                <View style={styles.headerStatSeparator} />
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>{pilotStats.overall.flightHours}</Text>
                  <Text style={styles.headerStatLabel}>Horas</Text>
                </View>
                <View style={styles.headerStatSeparator} />
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>{pilotStats.incidents.safetyStreak}</Text>
                  <Text style={styles.headerStatLabel}>Días Seguros</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.periodSelectorContainer}>
          <Text style={styles.sectionTitle}>Rendimiento Periódico</Text>
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
                  {period === '7d' ? '7 Días' : period === '30d' ? '30 Días' : '12 Meses'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.card}>
          <Text style={styles.cardTitle}>Eficiencia ({selectedPeriod === '7d' ? 'Diaria' : selectedPeriod === '30d' ? 'Semanal' : 'Mensual'})</Text>
          <View style={styles.chart}>
            {currentChartData.efficiency.map((value, index) => {
              const barHeightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const isHighest = value === maxValue && maxValue > 0;
              // Ajustar posición y color del valor para mejor legibilidad
              const valueIsVeryLow = barHeightPercent < 15; // Umbral para barras muy cortas

              return (
                <View key={index} style={styles.chartColumn}>
                  <View style={styles.chartBarContainer}>
                    <Text style={[
                        styles.chartValue,
                        isHighest && styles.chartValueHighest,
                        // Si es muy bajo y no es el más alto, moverlo más arriba y oscurecerlo
                        valueIsVeryLow && !isHighest && styles.chartValueLow
                      ]}>
                      {value}%
                    </Text>
                    <Animated.View
                      entering={SlideInUp.delay(450 + index * 70).duration(400)} // Animación mejorada
                      style={[
                        styles.chartBar,
                        { height: `${barHeightPercent}%` },
                        isHighest && styles.chartBarHighest,
                      ]}
                    >
                      <LinearGradient
                        colors={isHighest ? [COLORS.secondary, COLORS.secondaryDark] : ['#d1d5db', '#9ca3af']} // Barras por defecto un poco más oscuras
                        style={styles.chartBarGradient}
                      />
                    </Animated.View>
                  </View>
                  <Text style={styles.chartLabel}>{currentChartData.labels[index]}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)} style={styles.metricsGridContainer}>
           <Text style={styles.sectionTitle}>Métricas Clave</Text>
          <View style={styles.metricsGrid}>
            {[
              { icon: "time-outline", value: pilotStats.performance.avgTimePerTurbine, label: "Prom. Turbina", color: COLORS.primaryLight, bgColor: '#dbeafe' },
              { icon: "checkmark-done-outline", value: `${pilotStats.performance.completionRate}%`, label: "Finalización", color: COLORS.secondary, bgColor: '#d1fae5' },
              { icon: "star-outline", value: String(pilotStats.performance.qualityScore), label: "Calidad Fotos", color: COLORS.accentYellow, bgColor: '#fef3c7' },
              { icon: "shield-checkmark-outline", value: String(pilotStats.performance.safetyScore), label: "Seguridad", color: COLORS.accentRed, bgColor: '#fecaca' },
            ].map((metric, index) => (
                <Animated.View
                  key={index}
                  style={styles.metricCard}
                  entering={FadeInDown.delay(600 + index * 100)}
                >
                    <View style={[styles.metricIconContainer, { backgroundColor: metric.bgColor }]}>
                    <Ionicons name={metric.icon as any} size={28} color={metric.color} />
                    </View>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                    <Text style={styles.metricLabel} numberOfLines={2}>{metric.label}</Text>
                </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700)} style={[styles.card, { marginTop: 0}]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Estado de Seguridad</Text>
            <View style={styles.safetyBadge}>
              <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.secondaryDark} />
              <Text style={styles.safetyBadgeText}>Impecable</Text>
            </View>
          </View>

          <View style={styles.incidentsGrid}>
            <View style={styles.incidentMetric}>
              <Text style={styles.incidentValue}>{pilotStats.incidents.total}</Text>
              <Text style={styles.incidentLabel}>Total Incidencias</Text>
            </View>
            <View style={styles.incidentMetric}>
              <Text style={[styles.incidentValue, { color: COLORS.secondary }]}>{pilotStats.incidents.resolved}</Text>
              <Text style={styles.incidentLabel}>Resueltas</Text>
            </View>
            <View style={styles.incidentMetric}>
              <Text style={[styles.incidentValue, { color: COLORS.accentRed }]}>{pilotStats.incidents.pending}</Text>
              <Text style={styles.incidentLabel}>Pendientes</Text>
            </View>
          </View>

          <View style={styles.safetyStreak}>
            <LinearGradient
              colors={[COLORS.secondary, COLORS.secondaryDark]}
              style={styles.streakBadge}
              start={{x:0, y:0}} end={{x:1, y:0}}
            >
              <Ionicons name="flame-outline" size={22} color={COLORS.textLight} />
              <Text style={styles.streakText}>{pilotStats.incidents.safetyStreak} días sin incidentes</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800)} style={styles.card}>
          <Text style={styles.cardTitle}>Turbinas Destacadas</Text>
          {turbineStats.slice(0,3).map((turbine, index) => (
            <Animated.View
              key={turbine.id}
              style={[styles.turbineItem, index === turbineStats.slice(0,3).length - 1 && styles.lastTurbineItem]}
              entering={FadeInDown.delay(900 + index * 100)}
            >
              <View style={styles.turbineInfo}>
                 <Ionicons name={getStatusIcon(turbine.status) as any} size={24} color={getStatusColor(turbine.status)} style={styles.turbineStatusIcon} />
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
           {turbineStats.length > 3 && (
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllButtonText}>Ver Todas las Turbinas</Text>
              <Ionicons name="chevron-forward-outline" size={16} color={COLORS.primaryLight} />
            </TouchableOpacity>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000)} style={styles.card}>
          <Text style={styles.cardTitle}>Logros Obtenidos</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement, index) => (
              <Animated.View
                key={achievement.id}
                style={[
                  styles.achievementItem,
                  !achievement.earned && styles.achievementLocked
                ]}
                entering={FadeInUp.delay(1100 + index * 100)} // Changed to FadeInUp for variety
              >
                <View style={[
                  styles.achievementIconContainer,
                  { backgroundColor: achievement.earned ? achievement.color : COLORS.lightGray }
                ]}>
                  <Ionicons
                    name={achievement.icon as any}
                    size={24}
                    color={achievement.earned ? COLORS.textLight : COLORS.textMuted}
                  />
                </View>
                <Text style={[
                  styles.achievementName,
                  !achievement.earned && styles.achievementNameLocked
                ]} numberOfLines={2} ellipsizeMode="tail">
                  {achievement.name}
                </Text>
                {achievement.earned && (
                  <View style={styles.earnedBadge}>
                    <Ionicons name="checkmark-outline" size={12} color={COLORS.secondaryDark} />
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
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.textSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
    paddingHorizontal: 4, // Small padding if it's directly in a container with margin
  },
  headerCardWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  gradientCard: {
    padding: 24,
    borderRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  rankText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  efficiencyBig: {
    fontSize: 52,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  efficiencyLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 24,
    fontWeight: '500',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  headerStat: {
    alignItems: 'center',
    flex: 1,
  },
  headerStatSeparator: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  headerStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  periodSelectorContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  periodButtons: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 6,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.cardBackground,
    shadowColor: COLORS.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButtonText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150, // Aumentada la altura para más espacio
    paddingHorizontal: 0,
    marginTop: 25, // Más espacio para los valores de arriba
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  chartBarContainer: {
    height: '100%', // Usa toda la altura disponible en chartColumn (después de la etiqueta)
    width: '80%',
    maxWidth: 28,
    justifyContent: 'flex-end', // Las barras crecen desde abajo
    position: 'relative', // Para posicionar el valor absoluto a la barra
    // marginBottom: 8, // Ya no es necesario si chartColumn se encarga del espaciado con la etiqueta
  },
  chartBar: {
    width: '100%',
    borderTopLeftRadius: 6, // Redondeo más sutil
    borderTopRightRadius: 6,
    overflow: 'hidden',
    minHeight: 4, // Barra mínima visible
  },
  chartBarGradient: {
    flex: 1,
  },
  chartBarHighest: {
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
  chartValue: {
    position: 'absolute',
    top: -22, // Posición inicial del valor encima de la barra
    alignSelf: 'center',
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    backgroundColor: COLORS.cardBackground, // Para evitar solapamiento con gradiente de barra
    paddingHorizontal: 2, // Pequeño padding si el fondo es visible
    borderRadius: 2,
  },
  chartValueHighest: {
    color: COLORS.secondaryDark,
    fontWeight: 'bold',
  },
  chartValueLow: { // Estilo para valores en barras muy cortas
    top: -25, // Un poco más arriba
    color: COLORS.textSecondary, // Un poco más oscuro para contraste
  },
  chartLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 8, // Espacio entre barra y etiqueta
    textAlign: 'center',
  },
  metricsGridContainer: {
    marginHorizontal: 16, // Contenedor principal con márgenes de pantalla
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Para el espacio entre las tarjetas
    // No necesita marginHorizontal si el padre (metricsGridContainer) ya lo tiene
  },
  metricCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    // Calcula el ancho para dos columnas con un espacio de 12px entre ellas
    // (AnchoTotalPantalla - MargenesDelContenedor(16*2) - EspacioEntreTarjetas) / NumeroColumnas
    width: (width - (16 * 2) - 12) / 2,
    marginBottom: 12,
    shadowColor: COLORS.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 150, // Para asegurar alturas consistentes
  },
  metricIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  safetyBadgeText: {
    fontSize: 13,
    color: COLORS.secondaryDark,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  incidentsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingTop: 8,
  },
  incidentMetric: {
    alignItems: 'center',
  },
  incidentValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  incidentLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
  safetyStreak: {
    alignItems: 'center',
    marginTop: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  streakText: {
    color: COLORS.textLight,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  turbineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  lastTurbineItem: {
    borderBottomWidth: 0,
  },
  turbineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8, // Espacio para que no se pegue a los metrics
  },
  turbineStatusIcon: {
    marginRight: 12,
  },
  turbineDetails: {
    flex: 1,
  },
  turbineName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  turbineInspections: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  turbineMetrics: {
    alignItems: 'flex-end',
  },
  turbineEfficiency: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  turbineStatusText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  seeAllButtonText: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // Calcula el gap para que 3 items quepan con padding de tarjeta y márgenes de pantalla
    // El ancho de cada item se encarga del espaciado principal.
    // justifyContent: 'space-between', // Puede ayudar si los anchos son flexibles
    gap: 12, // Usar gap para el espaciado es más moderno
    marginTop: 8,
  },
  achievementItem: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    // Ancho para 3 columnas: (AnchoPantalla - MargenesLateralesPantalla(16*2) - PaddingTarjeta(20*2) - GapsTotales(12*2)) / 3
    width: (width - (16 * 2) - (20 * 2) - (12 * 2)) / 3,
    minHeight: 110, // Aumentado para más espacio vertical
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  achievementName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 14,
    minHeight: 28, // Para 2 líneas
  },
  achievementNameLocked: {
    color: COLORS.textMuted,
  },
  earnedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#d1fae5',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  bottomSpacing: {
    height: 40,
  },
});