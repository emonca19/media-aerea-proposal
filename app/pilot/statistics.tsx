import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// Pantalla de estadísticas personales del piloto
export default function PilotStatistics() {
  // Aquí puedes obtener datos reales del usuario logueado
  // Por ahora, se usan valores mock
  const stats = {
    avgTimePerTurbine: '00:42:15',
    avgPhotoUploadTime: '01:10:00',
    dailyCompletion: '92%',
    inspectedTurbines: 18,
    approvedTurbines: 15,
    pendingTurbines: 3,
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Mis Estadísticas', headerStyle: { backgroundColor: '#1a237e' }, headerTintColor: '#fff' }} />
      <Text style={styles.title}>Indicadores Personales</Text>
      <ScrollView>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tiempo promedio por turbina</Text>
          <Text style={styles.statValue}>{stats.avgTimePerTurbine}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tiempo promedio de entrega de fotos</Text>
          <Text style={styles.statValue}>{stats.avgPhotoUploadTime}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Porcentaje de cumplimiento diario</Text>
          <Text style={styles.statValue}>{stats.dailyCompletion}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Turbinas inspeccionadas</Text>
          <Text style={styles.statValue}>{stats.inspectedTurbines}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Turbinas aprobadas</Text>
          <Text style={styles.statValue}>{stats.approvedTurbines}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Turbinas pendientes</Text>
          <Text style={styles.statValue}>{stats.pendingTurbines}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a192f',
    padding: 16,
  },
  title: {
    color: '#64ffda',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#112240',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  statLabel: {
    color: '#8892b0',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#64ffda',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
