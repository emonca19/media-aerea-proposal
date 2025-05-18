import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Pantalla base para reportes personalizados
export default function ReportsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Reportes', headerStyle: { backgroundColor: '#6c3ad7' }, headerTintColor: '#fff' }} />
      <Text style={styles.title}>Generar Reportes</Text>
      <Text style={styles.subtitle}>Selecciona el tipo de reporte que deseas generar:</Text>
      <ScrollView style={styles.list}>
        <TouchableOpacity style={[styles.reportCard, styles.purpleCard]}>
          <Text style={styles.reportTitle}>Reporte por Contrato</Text>
          <Text style={styles.reportDesc}>Genera un reporte filtrado por contrato y periodo.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportCard}>
          <Text style={styles.reportTitle}>Reporte por Proyecto</Text>
          <Text style={styles.reportDesc}>Incluye avance, cumplimiento y métricas clave.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.reportCard, styles.purpleCard]}>
          <Text style={styles.reportTitle}>Reporte por Piloto</Text>
          <Text style={styles.reportDesc}>Muestra desempeño, tiempos y cumplimiento individual.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportCard}>
          <Text style={styles.reportTitle}>Reporte por Cliente</Text>
          <Text style={styles.reportDesc}>Resumen de proyectos, contratos y actividades por cliente.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.reportCard, styles.purpleCard]}>
          <Text style={styles.reportTitle}>Exportar a Excel/CSV</Text>
          <Text style={styles.reportDesc}>Descarga los datos en formato Excel o CSV.</Text>
        </TouchableOpacity>
      </ScrollView>
      <Text style={styles.note}>* Próximamente: filtros avanzados, exportación PDF y selección de columnas.</Text>
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
    color: '#6c3ad7', // morado principal
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  reportCard: {
    backgroundColor: '#112240',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#6c3ad7',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: 'rgba(108,58,215,0.08)',
  },
  purpleCard: {
    borderColor: '#6c3ad7',
    backgroundColor: 'rgba(108,58,215,0.10)',
  },
  reportTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reportDesc: {
    color: '#8892b0',
    fontSize: 14,
    marginTop: 4,
  },
  note: {
    color: '#8892b0',
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
});
