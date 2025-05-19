import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PilotStatistics() {
  const stats = {
    avgTimePerTurbine: '00:42:15',
    avgPhotoUploadTime: '01:10:00',
    dailyCompletion: '92%',
    inspectedTurbine: 18,
    approvedTurbine: 15,
    pendingTurbine: 3,
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Mis Estadísticas', 
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#333333',
        headerShadowVisible: false
      }} />
      
      <Text style={styles.title}>Indicadores Clave</Text>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tiempo promedio por turbina</Text>
          <Text style={styles.statValue}>{stats.avgTimePerTurbine}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tiempo de entrega de fotos</Text>
          <Text style={styles.statValue}>{stats.avgPhotoUploadTime}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Cumplimiento diario</Text>
          <Text style={styles.statValue}>{stats.dailyCompletion}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Turbinas inspeccionadas</Text>
          <Text style={styles.statValue}>{stats.inspectedTurbine}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Turbinas aprobadas</Text>
          <Text style={styles.statValue}>{stats.approvedTurbine}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Turbinas pendientes</Text>
          <Text style={styles.statValue}>{stats.pendingTurbine}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  title: {
    color: '#1E90FF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    color: '#6C757D',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  statValue: {
    color: '#212529',
    fontSize: 22,
    fontWeight: '600',
  },
});
