import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function PilotStatistics() {
  const stats = {
    avgTimePerTurbine: '00:42:15',
    avgPhotoUploadTime: '01:10:00',
    dailyCompletion: '92%',
    inspectedTurbines: 18,
    approvedTurbines: 15,
    pendingTurbines: 3,
    performanceTrend: '↑ 12%', // nuevo dato
    efficiencyRating: '4.8/5' // nuevo dato
  };

  // Datos para los diferentes periodos
  const efficiencyData = {
    '7d': [
      { label: 'Jue', value: 82 },
      { label: 'Vie', value: 88 },
      { label: 'Sáb', value: 91 },
      { label: 'Dom', value: 94 },
      { label: 'Lun', value: 92 },
      { label: 'Mar', value: 90 },
      { label: 'Mié', value: 93 },
    ],
    '30d': [
      { label: '1', value: 80 }, { label: '5', value: 85 }, { label: '10', value: 90 }, { label: '15', value: 92 }, { label: '20', value: 95 }, { label: '25', value: 93 }, { label: '30', value: 94 },
    ],
    '12m': [
      { label: 'Ene', value: 75 }, { label: 'Feb', value: 80 }, { label: 'Mar', value: 82 }, { label: 'Abr', value: 85 }, { label: 'May', value: 90 }, { label: 'Jun', value: 92 }, { label: 'Jul', value: 91 }, { label: 'Ago', value: 93 }, { label: 'Sep', value: 94 }, { label: 'Oct', value: 96 }, { label: 'Nov', value: 97 }, { label: 'Dic', value: 98 },
    ],
  };
  const [period, setPeriod] = useState<'7d' | '30d'>('30d');
  const data = efficiencyData[period];
  const maxValue = Math.max(...data.map(d => d.value));

  // Nuevo grid de métricas con iconos reales y variaciones
  const statCards = [
    {
      label: 'Tiempo promedio por turbina',
      value: stats.avgTimePerTurbine,
      icon: <MaterialCommunityIcons name="timer-outline" size={28} color="#2563eb" />, 
      trend: '+5%',
      trendColor: '#22c55e',
    },
    {
      label: 'Tiempo de entrega de fotos',
      value: stats.avgPhotoUploadTime,
      icon: <Ionicons name="cloud-upload-outline" size={28} color="#2563eb" />, 
      trend: '-2%',
      trendColor: '#ef4444',
    },
    {
      label: 'Turbinas inspeccionadas',
      value: stats.inspectedTurbines,
      icon: <Ionicons name="eye-outline" size={28} color="#2563eb" />, 
      trend: '+10%',
      trendColor: '#22c55e',
    },
    {
      label: 'Turbinas aprobadas',
      value: `${stats.approvedTurbines} (${Math.round((stats.approvedTurbines/stats.inspectedTurbines)*100)}%)`,
      icon: <Ionicons name="checkmark-done-outline" size={28} color="#2563eb" />, 
      trend: '+8%',
      trendColor: '#22c55e',
    },
    {
      label: 'Turbinas pendientes',
      value: stats.pendingTurbines,
      icon: <Ionicons name="time-outline" size={28} color="#2563eb" />, 
      trend: '-1%',
      trendColor: '#ef4444',
    },
    {
      label: 'Eficiencia semanal',
      value: stats.efficiencyRating,
      icon: <MaterialCommunityIcons name="star-outline" size={28} color="#2563eb" />, 
      trend: '+3%',
      trendColor: '#22c55e',
    },
  ];

  const [showMetrics, setShowMetrics] = useState(false);

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ 
        title: 'Perfil',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1E40AF',
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false
      }} />
      
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de cumplimiento principal */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(100)}
          style={{ marginBottom: 20 }}
        >
          <LinearGradient
            colors={["#6366F1", "#60A5FA", "#38BDF8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.completionCard}
          >
            <View style={styles.completionContent}>
              <Text style={styles.completionLabel}>Cumplimiento diario</Text>
              <Animated.Text 
                style={styles.completionValue}
                entering={FadeInDown.duration(800).delay(200)}
              >
                {stats.dailyCompletion}
              </Animated.Text>
              <Animated.Text 
                style={styles.completionTrend}
                entering={FadeInDown.duration(800).delay(300)}
              >
                {stats.performanceTrend}
              </Animated.Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Tendencia de eficiencia tipo glassmorphism */}
        <View style={styles.glassCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>Eficiencia</Text>
            <View style={styles.periodSelector}>
              {['30d', '7d'].map(p => (
                <Text
                  key={p}
                  style={[
                    styles.periodButton,
                    period === p && styles.periodButtonActive
                  ]}
                  onPress={() => setPeriod(p as '7d' | '30d')}
                >
                  {p}
                </Text>
              ))}
            </View>
          </View>
          <View style={styles.chartArea}>
            {/* Eje Y */}
            <View style={styles.yAxisLabels}>
              {[maxValue, Math.round(maxValue*0.75), Math.round(maxValue*0.5), 0].map((v, i) => (
                <Text key={i} style={styles.yAxisText}>{v}%</Text>
              ))}
            </View>
            {/* Gráfico de barras */}
            <View style={styles.barChartModern}>
              {data.map((item, idx) => (
                <View key={item.label} style={styles.barItemModern}>
                  <View
                    style={[
                      styles.barModern,
                      {
                        height: (item.value / maxValue) * 120,
                        backgroundColor: 'rgba(99,102,241,0.85)',
                        shadowColor: '#6366F1',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.18,
                        shadowRadius: 6,
                        borderRadius: 8,
                      },
                    ]}
                  />
                  <Text style={styles.barLabelModern}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
          {/* Footer con valor total y tendencia */}
          <View style={styles.trendFooter}>
            <Text style={styles.trendFooterValue}>Eficiencia promedio: <Text style={styles.trendFooterValueNum}>{Math.round(data.reduce((a, b) => a + b.value, 0) / data.length)}%</Text></Text>
            <View style={styles.trendFooterBadge}><Text style={styles.trendFooterBadgeText}>↑ {Math.round(((data[data.length-1].value - data[0].value) / data[0].value) * 100)}%</Text></View>
          </View>
        </View>

        {/* Barra de expandir/colapsar métricas */}
        <Pressable
          style={styles.expandBar}
          onPress={() => setShowMetrics((prev) => !prev)}
        >
          <Text style={styles.expandBarText}>{showMetrics ? 'Ocultar métricas' : 'Ver métricas detalladas'}</Text>
          <Ionicons
            name={showMetrics ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={20}
            color="#2563eb"
            style={{ marginLeft: 6 }}
          />
        </Pressable>
        {/* Grid de métricas animado */}
        {showMetrics && (
          <Animated.View
            entering={FadeInUp.duration(400)}
            exiting={FadeOutUp.duration(300)}
            layout={Layout.springify()}
            style={styles.gridContainer}
          >
            {statCards.map((item, index) => (
              <View key={item.label} style={styles.statCardModern}>
                <View style={styles.statIcon}>{item.icon}</View>
                <View style={styles.statTextBlock}>
                  <Text style={styles.statLabelModern}>{item.label}</Text>
                  <Text style={styles.statValueModern}>{item.value}</Text>
                </View>
                <View style={[styles.statTrendBadge, { backgroundColor: item.trendColor === '#22c55e' ? '#bbf7d0' : '#fee2e2' }]}> 
                  <Text style={[styles.statTrend, { color: item.trendColor }]}>{item.trend}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // backgroundColor: '#F9FAFB', // Eliminado el fondo
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  mainCard: {
    // Eliminado: backgroundColor, borderRadius, padding, etc. (ahora lo maneja completionCard)
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    // Sombra opcional si quieres más profundidad
  },
  completionCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    width: '100%', // Ocupar todo el ancho disponible del contenedor padre
    maxWidth: undefined, // Eliminar límite de ancho
    alignSelf: 'stretch', // Forzar a ocupar todo el ancho
  },
  completionContent: {
    alignItems: 'center',
  },
  completionLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.08)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  completionValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    marginBottom: 4,
    letterSpacing: 1.2,
  },
  completionTrend: {
    color: '#bbf7d0',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.10)',
    // backdropFilter: 'blur(12px)', // solo web
    width: '100%', // Ocupar todo el ancho disponible del contenedor padre
    maxWidth: undefined, // Eliminar límite de ancho
    alignSelf: 'stretch', // Forzar a ocupar todo el ancho
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trendTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderRadius: 16,
    padding: 2,
  },
  periodButton: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 2,
    opacity: 0.7,
  },
  periodButtonActive: {
    backgroundColor: '#6366F1',
    color: '#fff',
    opacity: 1,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 8,
    minHeight: 140,
  },
  yAxisLabels: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginRight: 8,
  },
  yAxisText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
  },
  barChartModern: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    height: 120,
    justifyContent: 'space-between',
  },
  barItemModern: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  barModern: {
    width: 18,
    marginBottom: 6,
  },
  barLabelModern: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  trendFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  trendFooterValue: {
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '600',
  },
  trendFooterValueNum: {
    color: '#6366F1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  trendFooterBadge: {
    backgroundColor: '#bbf7d0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  trendFooterBadgeText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 13,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 0,
  },
  statCardModern: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 18,
    padding: 8, // mínimo padding
    marginBottom: 10,
    width: '47%', // usar porcentaje para asegurar 2 columnas
    alignItems: 'flex-start',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: 70,
    marginHorizontal: 0,
  },
  statIcon: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  statTextBlock: {
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  statLabelModern: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'left',
  },
  statValueModern: {
    fontSize: 22,
    color: '#1e293b',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 2,
  },
  statTrendBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  statTrend: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  expandBar: {
    width: 332,
    maxWidth: 332,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 0,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    shadowColor: 'transparent',
    elevation: 0,
  },
  expandBarText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 16,
  },
});
