
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    BarChart,
    LineChart,
} from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

import { mockPilotStats } from '../../../src/mocks/pilots';

const pilotStats = mockPilotStats[0];
const screenWidth = Dimensions.get('window').width;

const weeklyFlightData = {
  labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  datasets: [{ data: [45, 55, 60, 70, 65, 40, 0], color: () => '#3b82f6', strokeWidth: 2 }],
};
const weeklyTurbineData = {
  labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  datasets: [{ data: [4, 5, 3, 6, 4, 2, 0] }],
};
const weeklyMetrics = {
  efficiency: 85,
  safety: 95,
  quality: 90,
  incidents: 2,
  completion: 92
};

const monthlyFlightData = {
  labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
  datasets: [{ data: [280, 310, 350, 325], color: () => '#3b82f6', strokeWidth: 2 }],
};
const monthlyTurbineData = {
  labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
  datasets: [{ data: [16, 22, 18, 12] }],
};
const monthlyMetrics = {
  efficiency: 82,
  safety: 93,
  quality: 88,
  incidents: 5,
  completion: 90
};

const yearlyFlightData = {
  labels: ["T1", "T2", "T3", "T4"],
  datasets: [{ data: [850, 920, 780, 790], color: () => '#3b82f6', strokeWidth: 2 }],
};
const yearlyTurbineData = {
  labels: ["T1", "T2", "T3", "T4"],
  datasets: [{ data: [46, 52, 38, 40] }],
};

const yearlyMetrics = {
  efficiency: 80,
  safety: 91,
  quality: 87,
  incidents: 12,
  completion: 89
};

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  paddingLeft: 0, 
  paddingRight: 0, 
};

const CircularProgress = ({
  percentage,
  size = 80,
  strokeWidth = 8,
  color = '#3b82f6',
  label,
  animated = true
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  animated?: boolean;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circum = radius * 2 * Math.PI;
  const svgProgress = 100 - percentage;
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayedPercentage, setDisplayedPercentage] = useState(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
   
    if (animated && !hasAnimatedRef.current) {
      setDisplayedPercentage(0);
      animatedValue.setValue(0);
      
      Animated.timing(animatedValue, {
        toValue: percentage,
        duration: 1800,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic), 
      }).start(() => {
        hasAnimatedRef.current = true; 
      });
      
      animatedValue.addListener(({ value }) => {
        setDisplayedPercentage(Math.floor(value));
      });
      
      return () => {
        animatedValue.removeAllListeners();
      };
    } else if (!animated) {
      setDisplayedPercentage(percentage);
      hasAnimatedRef.current = false;
    } else {
      setDisplayedPercentage(percentage);
    }
  }, [animated]); 

  useEffect(() => {
    if (hasAnimatedRef.current || !animated) {
      setDisplayedPercentage(percentage);
      animatedValue.setValue(percentage);
    }
  }, [percentage]);

  const animatedOffset = useMemo(() => {
    if (!animated) return circum * svgProgress / 100;
    return animatedValue.interpolate({
      inputRange: [0, percentage],
      outputRange: [circum, circum * svgProgress / 100],
      extrapolate: 'clamp'
    });
  }, [circum, svgProgress, percentage, animated]);

  return (
    <View style={{ margin: 4, alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        {animated ? (
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circum}
            strokeDashoffset={animatedOffset}
            strokeLinecap="round"
            transform={`rotate(-90, ${size / 2}, ${size / 2})`}
          />
        ) : (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circum}
            strokeDashoffset={circum * svgProgress / 100}
            strokeLinecap="round"
            transform={`rotate(-90, ${size / 2}, ${size / 2})`}
          />
        )}
        <SvgText x={size / 2.7} y={size / 2 + 4} fontSize={size / 5} fontWeight="bold" fill={color} textAnchor="middle">
          {displayedPercentage}
        </SvgText>
      </Svg>
      <Text style={{ fontSize: 12, color: '#64748b', marginTop: 8, fontWeight: '500', textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
};

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();
  const [animateCircles, setAnimateCircles] = useState(true);
  const animationCompletedRef = useRef(false);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    
    if (animationCompletedRef.current) {
      setAnimateCircles(false);
    } else {
      setAnimateCircles(true);
      setTimeout(() => {
        animationCompletedRef.current = true;
      }, 2000);
    }
  }, [fadeAnim]);
  
  const flightData = useMemo(() => {
    switch(selectedPeriod) {
      case 'month': return monthlyFlightData;
      case 'year': return yearlyFlightData;
      default: return weeklyFlightData;
    }
  }, [selectedPeriod]);

  const turbineData = useMemo(() => {
    switch(selectedPeriod) {
      case 'month': return monthlyTurbineData;
      case 'year': return yearlyTurbineData;
      default: return weeklyTurbineData;
    }
  }, [selectedPeriod]);

  const currentMetrics = useMemo(() => {
    switch(selectedPeriod) {
      case 'month': return monthlyMetrics;
      case 'year': return yearlyMetrics;
      default: return weeklyMetrics;
    }
  }, [selectedPeriod]);

  const handlePeriodChange = (period: 'week' | 'month' | 'year') => {
    setIsLoading(true);
    setSelectedPeriod(period);
    setTimeout(() => setIsLoading(false), 500);
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Estadísticas de Rendimiento', 
          headerStyle: { backgroundColor: '#f8fafc' }, 
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/pilot/features/user-profile/profile')}
              style={{ marginLeft: 5, padding: 8 }}
            >
              <View style={styles.backButtonContainer}>
                <MaterialIcons name="arrow-back" size={24} color="#3b82f6" />
              </View>
            </TouchableOpacity>
          )
        }} 
      />

      <View style={{
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        borderRadius: 12,
        padding: 4,
        position: 'absolute',
        top: 10, 
        left: 15,
        right: 15,
        zIndex: 10,
        elevation: 3,
      }}>
        <TouchableOpacity style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]} onPress={() => handlePeriodChange('week')}>
          <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>Semana</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]} onPress={() => handlePeriodChange('month')}>
          <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>Mes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.periodButton, selectedPeriod === 'year' && styles.periodButtonActive]} onPress={() => handlePeriodChange('year')}>
          <Text style={[styles.periodButtonText, selectedPeriod === 'year' && styles.periodButtonTextActive]}>Año</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{
          flex: 1,
          marginTop: 60
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 10, paddingTop: 10 }}>
        
        <View style={[styles.summaryContainer, styles.cardStyle, {marginTop: 0}]}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="insights" size={20} color="#3b82f6" />
              <Text style={styles.summaryTitle}>Resumen de Rendimiento</Text>
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryText}>
                <Text style={styles.highlight}>{pilotStats.totalProjectsCompleted}</Text> proyectos completados •{' '}
                <Text style={styles.highlight}>{pilotStats.onTimePhotoDeliveryRatePercentage}%</Text> entregados a tiempo
              </Text>
              <View style={styles.overallMetrics}>
                <View style={styles.metricItem}>
                  <MaterialIcons name="trending-up" size={18} color="#22c55e" />
                  <Text style={styles.metricValue}>+15%</Text>
                  <Text style={styles.metricLabel}>vs promedio</Text>
                </View>
                <View style={styles.metricItem}>
                  <MaterialIcons name="star" size={18} color="#f59e0b" />
                  <Text style={styles.metricValue}>4.8/5</Text>
                  <Text style={styles.metricLabel}>valoración</Text>
                </View>
                <View style={styles.metricItem}>
                  <MaterialIcons name="calendar-today" size={18} color="#3b82f6" />
                  <Text style={styles.metricValue}>97%</Text>
                  <Text style={styles.metricLabel}>asistencia</Text>
                </View>
              </View>
            </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
          <View style={[styles.chartContainer, styles.progressContainer]}>
            <Text style={styles.progressTitle}>Rendimiento Técnico</Text>
            <View style={styles.progressRow}>
              <CircularProgress percentage={currentMetrics.efficiency} color="#22c55e" label="Eficiencia de Vuelo" size={80} animated={animateCircles}/>
              <CircularProgress percentage={currentMetrics.safety} color="#3b82f6" label="Índice de Seguridad" size={80} animated={animateCircles}/>
              <CircularProgress percentage={currentMetrics.quality} color="#8b5cf6" label="Calidad de Entrega" size={80} animated={animateCircles}/>
            </View>
            <View style={styles.technicalMetrics}>
              <View style={styles.techMetricItem}>
                <MaterialIcons name="speed" size={16} color="#64748b" />
                <Text style={styles.techMetricValue}>{formatTime(pilotStats.averageTimePerTurbineSeconds)}</Text>
                <Text style={styles.techMetricLabel}>Tiempo medio</Text>
              </View>
              <View style={styles.techMetricItem}>
                <MaterialIcons name="flight" size={16} color="#64748b" />
                <Text style={styles.techMetricValue}>{(pilotStats.totalFlightMinutes / pilotStats.totalTurbinesInspected).toFixed(1)} min</Text>
                <Text style={styles.techMetricLabel}>Por turbina</Text>
              </View>
              <View style={styles.techMetricItem}>
                <MaterialIcons name="photo-camera" size={16} color="#64748b" />
                <Text style={styles.techMetricValue}>{pilotStats.photoDeliveryTimeMinutes} min</Text>
                <Text style={styles.techMetricLabel}>Tiempo foto</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Text style={styles.sectionTitle}>Métricas Clave</Text>
        <View style={styles.statsContainer}>
          <View style={styles.compactStatsGrid}>
            <View style={styles.compactStatItem}>
              <MaterialIcons name="speed" size={20} color="#3b82f6" />
              <Text style={styles.compactStatValue}>{formatTime(pilotStats.averageTimePerTurbineSeconds)}</Text>
              <Text style={styles.compactStatLabel}>Tiempo/turbina</Text>
            </View>
            <View style={styles.compactStatItem}>
              <MaterialIcons name="timer" size={20} color="#8b5cf6" />
              <Text style={styles.compactStatValue}>{pilotStats.photoDeliveryTimeMinutes}m</Text>
              <Text style={styles.compactStatLabel}>Entrega</Text>
            </View>
            <View style={styles.compactStatItem}>
              <MaterialIcons name="check-circle" size={20} color="#22c55e" />
              <Text style={styles.compactStatValue}>{pilotStats.totalTurbinesInspected}</Text>
              <Text style={styles.compactStatLabel}>Inspeccionadas</Text>
            </View>
          </View>
          <View style={styles.compactStatsGrid}>
            <View style={styles.compactStatItem}>
              <MaterialIcons name="date-range" size={20} color="#06b6d4" />
              <Text style={styles.compactStatValue}>{pilotStats.dailyCompletionRatePercentage}%</Text>
              <Text style={styles.compactStatLabel}>Completadas</Text>
            </View>
            <View style={styles.compactStatItem}>
              <MaterialIcons name="flight" size={20} color="#f59e0b" />
              <Text style={styles.compactStatValue}>{Math.floor(pilotStats.totalFlightMinutes / 60)}h</Text>
              <Text style={styles.compactStatLabel}>Vuelo total</Text>
            </View>
            <View style={styles.compactStatItem}>
              <MaterialIcons name="warning" size={20} color="#ef4444" />
              <Text style={styles.compactStatValue}>{pilotStats.incidentCount}</Text>
              <Text style={styles.compactStatLabel}>Incidentes</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tiempo de Vuelo {selectedPeriod === 'week' ? 'Semanal' : selectedPeriod === 'month' ? 'Mensual' : 'Anual'}</Text>
        <View style={styles.chartContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#3b82f6" /></View>
          ) : (
            <LineChart data={flightData} width={screenWidth - 40} height={180} chartConfig={chartConfig} bezier style={styles.chart} />
          )}
        </View>

        <Text style={styles.sectionTitle}>Turbinas Completadas {selectedPeriod === 'week' ? 'por Día' : selectedPeriod === 'month' ? 'por Semana' : 'por Trimestre'}</Text>
        <View style={styles.chartContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#3b82f6" /></View>
          ) : (
            <BarChart data={turbineData} width={screenWidth - 30} height={180} yAxisLabel="" yAxisSuffix=" T" chartConfig={chartConfig} style={styles.chart} fromZero />
          )}
        </View>

        {/* Desglose de Incidentes section removed */}
      </ScrollView>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginTop: 20, marginBottom: 12 },
  statsContainer: { marginBottom: 16 },
  chartContainer: { backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 2, paddingVertical: 12, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  chart: { borderRadius: 16 },

  periodButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  periodButtonActive: { backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  periodButtonText: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  periodButtonTextActive: { color: '#1e293b', fontWeight: '600' },
  summaryContainer: { marginBottom: 24 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginLeft: 8 },
  summaryContent: {}, 
  summaryText: { fontSize: 15, lineHeight: 22, color: '#1e293b', marginBottom: 16 },
  highlight: { fontWeight: '700', color: '#3b82f6' },
  overallMetrics: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  metricItem: { alignItems: 'center', flex: 1 },
  metricValue: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginTop: 2 },
  metricLabel: { fontSize: 10, color: '#64748b', marginTop: 2 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 180 },
  progressContainer: { marginTop: 10, alignItems: 'center', paddingVertical: 12 },
  progressTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 8 },
  technicalMetrics: { flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', marginTop: 8, paddingHorizontal: 0 },
  techMetricItem: { alignItems: 'center' },
  techMetricValue: { fontSize: 12, fontWeight: '700', color: '#1e293b', marginTop: 4 },
  techMetricLabel: { fontSize: 10, color: '#64748b', marginTop: 2 },
  compactStatsGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  compactStatItem: { alignItems: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 8, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, flex: 1, marginHorizontal: 4 },
  compactStatValue: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginTop: 4 },
  compactStatLabel: { fontSize: 10, color: '#64748b', marginTop: 2, textAlign: 'center' },
  cardStyle: { backgroundColor: 'white', borderRadius: 16, padding: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  backButtonContainer: {
    padding: 5,
    borderRadius: 20,
  },
});