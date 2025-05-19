import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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

  const efficiencyData = [
    { day: 'Lun', value: 82 },
    { day: 'Mar', value: 88 },
    { day: 'Mié', value: 91 },
    { day: 'Jue', value: 94 },
    { day: 'Vie', value: 92 }
  ];

  const statCards = [
    { 
      label: 'Tiempo promedio por turbina', 
      value: stats.avgTimePerTurbine,
      icon: '⏱️',
      color: '#6366F1'
    },
    { 
      label: 'Tiempo de entrega de fotos', 
      value: stats.avgPhotoUploadTime,
      icon: '📸',
      color: '#8B5CF6'
    },
    { 
      label: 'Turbinas inspeccionadas', 
      value: stats.inspectedTurbines,
      icon: '🔄',
      color: '#EC4899'
    },
    { 
      label: 'Turbinas aprobadas', 
      value: `${stats.approvedTurbines} (${Math.round((stats.approvedTurbines/stats.inspectedTurbines)*100)}%)`,
      icon: '✅',
      color: '#10B981'
    },
    { 
      label: 'Turbinas pendientes', 
      value: stats.pendingTurbines,
      icon: '⏳',
      color: '#F59E0B'
    },
    { 
      label: 'Eficiencia semanal', 
      value: stats.efficiencyRating,
      icon: '🌟',
      color: '#3B82F6'
    }
  ];

  return (
    <LinearGradient 
      colors={['#F9FAFB', '#EFF6FF']} 
      style={styles.container}
    >
      <Stack.Screen options={{ 
        title: 'Dashboard de Rendimiento',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1E40AF',
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false
      }} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text 
          entering={FadeInDown.duration(800)}
          style={styles.headerTitle}
        >
          Resumen de Actividad
        </Animated.Text>

        {/* Tarjeta de cumplimiento principal */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(100)}
          style={styles.mainCard}
        >
          <Text style={styles.mainCardLabel}>Cumplimiento diario</Text>
          <Text style={styles.mainCardValue}>{stats.dailyCompletion}</Text>
          <Text style={styles.trendText}>{stats.performanceTrend}</Text>
        </Animated.View>

        {/* Mini gráfico de tendencia (simulado) */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.trendContainer}
        >
          <Text style={styles.sectionTitle}>Tendencia de eficiencia</Text>
          <View style={styles.barChart}>
            {efficiencyData.map((item, index) => (
              <View key={item.day} style={styles.barContainer}>
                <View style={[styles.bar, { 
                  height: item.value * 1.2, 
                  backgroundColor: item.value > 90 ? '#10B981' : '#3B82F6'
                }]} />
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Grid de métricas */}
        <Animated.View 
          entering={FadeInUp.duration(600).delay(300)}
          style={styles.gridContainer}
        >
          {statCards.map((item, index) => (
            <View 
              key={item.label} 
              style={[
                styles.statCard, 
                { 
                  backgroundColor: item.color + '20',
                  borderColor: item.color + '40' 
                }
              ]}
            >
              <Text style={[styles.statLabel, { color: item.color }]}>
                {item.icon} {item.label}
              </Text>
              <Text style={[styles.statValue, { color: item.color }]}>
                {item.value}
              </Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  headerTitle: {
    color: '#1E40AF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  mainCardLabel: {
    color: '#6B7280',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  mainCardValue: {
    color: '#1E40AF',
    fontSize: 42,
    fontWeight: '700',
  },
  trendText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  trendContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    height: 150,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  barContainer: {
    alignItems: 'center',
    width: (width - 80) / 5,
  },
  bar: {
    width: 30,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 8,
  },
  barLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 50) / 2,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
});
