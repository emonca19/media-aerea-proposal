import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  // Datos para los diferentes periodos con valores mejorados para una visualización más atractiva
  const efficiencyData = {
    '7d': [
      { label: 'Jue', value: 82 },
      { label: 'Vie', value: 86 },
      { label: 'Sáb', value: 91 },
      { label: 'Dom', value: 94 },
      { label: 'Lun', value: 92 },
      { label: 'Mar', value: 96 },
      { label: 'Mié', value: 98 },
    ],
    '30d': [
      { label: '1', value: 78 }, 
      { label: '5', value: 85 }, 
      { label: '10', value: 82 }, 
      { label: '15', value: 90 }, 
      { label: '20', value: 95 }, 
      { label: '25', value: 93 }, 
      { label: '30', value: 97 },
    ],
    '12m': [
      { label: 'Ene', value: 75 }, 
      { label: 'Feb', value: 80 }, 
      { label: 'Mar', value: 82 }, 
      { label: 'Abr', value: 85 }, 
      { label: 'May', value: 90 }, 
      { label: 'Jun', value: 92 }, 
      { label: 'Jul', value: 91 }, 
      { label: 'Ago', value: 93 }, 
      { label: 'Sep', value: 94 }, 
      { label: 'Oct', value: 96 }, 
      { label: 'Nov', value: 97 }, 
      { label: 'Dic', value: 98 },
    ],
  };
  const [period, setPeriod] = useState<'7d' | '30d'>('30d');
  const data = efficiencyData[period];
  const maxValue = Math.max(...data.map(d => d.value));  // Grid de métricas mejorado con iconos y mejor presentación visual
  const statCards = [
    {
      label: 'Tiempo promedio por turbina',
      value: stats.avgTimePerTurbine,
      icon: <MaterialCommunityIcons name="timer-outline" size={24} color="#4338ca" />, 
      trend: '+5%',
      trendColor: '#22c55e',
    },
    {
      label: 'Tiempo de entrega de fotos',
      value: stats.avgPhotoUploadTime,
      icon: <Ionicons name="cloud-upload-outline" size={24} color="#4338ca" />, 
      trend: '-2%',
      trendColor: '#ef4444',
    },
    {
      label: 'Turbinas inspeccionadas',
      value: stats.inspectedTurbines,
      icon: <Ionicons name="eye-outline" size={24} color="#4338ca" />, 
      trend: '+10%',
      trendColor: '#22c55e',
    },
    {
      label: 'Turbinas aprobadas',
      value: `${stats.approvedTurbines} (${Math.round((stats.approvedTurbines/stats.inspectedTurbines)*100)}%)`,
      icon: <Ionicons name="checkmark-done-outline" size={24} color="#4338ca" />, 
      trend: '+8%',
      trendColor: '#22c55e',
    },
    {
      label: 'Turbinas pendientes',
      value: stats.pendingTurbines,
      icon: <Ionicons name="time-outline" size={24} color="#4338ca" />, 
      trend: '-1%',
      trendColor: '#ef4444',
    },
    {
      label: 'Eficiencia semanal',
      value: stats.efficiencyRating,
      icon: <MaterialCommunityIcons name="star-outline" size={24} color="#4338ca" />, 
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
        {/* Tarjeta de cumplimiento principal mejorada */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(100)}
          style={{ marginBottom: 20 }}
        >
          <LinearGradient
            colors={["#2563eb", "#1e40af"]}
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
              </Animated.Text>              <Animated.View 
                entering={FadeInDown.duration(800).delay(300)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                }}
              >
                <Ionicons name="trending-up" size={16} color="#bbf7d0" style={{marginRight: 6}} />
                <Text style={styles.completionTrend}>
                  {stats.performanceTrend}
                </Text>
              </Animated.View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Tendencia de eficiencia tipo glassmorphism */}
        <View style={styles.glassCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>Eficiencia</Text>          <View style={styles.periodSelector}>
              {['30d', '7d'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.periodButtonContainer,
                    period === p && styles.periodButtonContainerActive
                  ]}
                  onPress={() => setPeriod(p as '7d' | '30d')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.periodButton,
                      period === p && styles.periodButtonActive
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
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
                <View key={item.label} style={styles.barItemModern}>                  <LinearGradient
                    colors={['#4f46e5', '#1e40af']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[
                      styles.barModern,
                      {
                        height: (item.value / maxValue) * 120,
                        shadowColor: '#1E40AF',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 6,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                      },
                    ]}
                  />
                  <Text style={styles.barLabelModern}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>          {/* Footer con valor total y tendencia mejorados */}
          <View style={styles.trendFooter}>
            <View style={styles.trendFooterValueContainer}>
              <Text style={styles.trendFooterValueLabel}>Eficiencia promedio:</Text>
              <Text style={styles.trendFooterValueNum}>{Math.round(data.reduce((a, b) => a + b.value, 0) / data.length)}%</Text>
            </View>
            <View style={styles.trendFooterBadge}>
              <Ionicons name="trending-up" size={14} color="#059669" style={{marginRight: 3}} />
              <Text style={styles.trendFooterBadgeText}>{Math.round(((data[data.length-1].value - data[0].value) / data[0].value) * 100)}%</Text>
            </View>
          </View>
        </View>        {/* Barra de expandir/colapsar métricas con mejor estilo */}
        <TouchableOpacity
          style={styles.detailedMetricsButton}
          onPress={() => setShowMetrics((prev) => !prev)}
        >
          <Text style={styles.expandBarText}>{showMetrics ? 'Ocultar métricas' : 'Ver métricas detalladas'}</Text>          <Ionicons
            name={showMetrics ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={20}
            color="#4338ca"
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
        {/* Grid de métricas animado */}
        {showMetrics && (
          <Animated.View
            entering={FadeInUp.duration(400)}
            exiting={FadeOutUp.duration(300)}
            layout={Layout.springify()}
            style={styles.gridContainer}
          >          {statCards.map((item, index) => (
              <Animated.View 
                key={item.label} 
                style={styles.statCardModern}
                entering={FadeInUp.duration(400).delay(100 + index * 50)}
              >
                <View style={styles.statIconContainer}>
                  {item.icon}
                </View>
                <View style={styles.statTextBlock}>
                  <Text style={styles.statLabelModern}>{item.label}</Text>
                  <Text style={styles.statValueModern}>{item.value}</Text>
                </View>
                <View style={[styles.statTrendBadge, { backgroundColor: item.trendColor === '#22c55e' ? '#bbf7d0' : '#fee2e2' }]}> 
                  <Text style={[styles.statTrend, { color: item.trendColor }]}>{item.trend}</Text>
                </View>
              </Animated.View>
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
  },  completionCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
    width: '96%', // Ocupar más ancho para mayor presencia
    maxWidth: 450,
    alignSelf: 'center', // Centrar el componente
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  },  completionValue: {
    color: '#fff',
    fontSize: 54,  // Incrementando tamaño para mejor legibilidad
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    marginBottom: 6,
    letterSpacing: 1.5,
  },
  completionTrend: {
    color: '#bbf7d0',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },  glassCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    // backdropFilter: 'blur(12px)', // solo web
    width: '96%', // Ocupar el 96% del ancho disponible igual que la tarjeta de completitud
    maxWidth: 450,
    alignSelf: 'center', // Centrar el componente
  },  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  trendTitle: {
    color: '#1e293b',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(37,99,235,0.08)',
    borderRadius: 16,
    padding: 2,
  },
  periodButtonContainer: {
    borderRadius: 12,
    marginHorizontal: 2,
  },
  periodButtonContainerActive: {
    backgroundColor: '#2563eb',
  },
  periodButton: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    opacity: 0.7,
  },
  periodButtonActive: {
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
  },  barModern: {
    width: 28,
    marginBottom: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  barLabelModern: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },  trendFooter: {
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
  trendFooterValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendFooterValueLabel: {
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 4,
  },
  trendFooterValueNum: {
    color: '#1e40af',
    fontWeight: 'bold',
    fontSize: 18,
  },  trendFooterBadge: {
    backgroundColor: '#bbf7d0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  trendFooterBadgeText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 14,
  },gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 0,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },  statCardModern: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    width: '48%',
    alignItems: 'flex-start',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: 130,
    marginHorizontal: 0,
    position: 'relative',
    overflow: 'hidden',
  },statIcon: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(79,70,229,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statTextBlock: {
    alignItems: 'flex-start',
    marginBottom: 2,
  },  statLabelModern: {
    fontSize: 14,
    color: '#4338ca',
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'left',
    letterSpacing: 0.3,
  },
  statValueModern: {
    fontSize: 26,
    color: '#1e293b',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 6,
    letterSpacing: 0.2,
  },  statTrendBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
    alignSelf: 'flex-start',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
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
  },  expandBarText: {
    color: '#4338ca',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },detailedMetricsButton: {
    width: '96%',
    maxWidth: 450,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
});
