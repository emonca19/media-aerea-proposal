import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar } from 'react-native';

const mockProjectHistory = [
    { id: 'proj1', name: 'Inspección Puente Colgante', client: 'Infraestructura Vial S.A.', completionDate: '10/04/2023', status: 'Completado' },
    { id: 'proj2', name: 'Seguimiento Cultivos Maíz', client: 'AgroTech Solutions', completionDate: '15/03/2023', status: 'Completado' },
    { id: 'proj3', name: 'Levantamiento Topográfico Urbano', client: 'Desarrollos Urbanos Ltda.', completionDate: '01/02/2023', status: 'Completado' },
    { id: 'proj4', name: 'Monitoreo Ambiental Costa', client: 'Fundación Oceánica', completionDate: '20/01/2023', status: 'Completado' },
    { id: 'proj5', name: 'Inspección Líneas Eléctricas Alta Tensión', client: 'Red Eléctrica Nacional', completionDate: '05/12/2022', status: 'Completado' },
  ];

const ProjectHistoryScreen = () => {
  const renderProjectHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.projectHistoryItem}>
      <Ionicons name="briefcase-outline" size={28} color="#64748b" style={styles.projectHistoryIcon} />
      <View style={styles.projectHistoryContent}>
        <Text style={styles.projectHistoryName}>{item.name}</Text>
        <Text style={styles.projectHistoryClient}>{item.client}</Text>
        <Text style={styles.projectHistoryDate}>Finalizado: {item.completionDate}</Text>
      </View>
      <View style={[styles.statusBadge, styles.completedBadge]}>
         <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Historial de Proyectos</Text>
        </View>
        {mockProjectHistory.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="archive-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyStateText}>No hay proyectos en el historial.</Text>
          </View>
        ) : (
          <FlatList
            data={mockProjectHistory}
            renderItem={renderProjectHistoryItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContentContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  projectHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#9ca3af',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHistoryIcon: {
    marginRight: 16,
  },
  projectHistoryContent: {
    flex: 1,
  },
  projectHistoryName: {
    fontSize: 16, // Slightly larger name
    fontWeight: '600', // Bolder name
    color: '#1e3a8a',
    marginBottom: 4,
  },
  projectHistoryClient: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 2,
  },
  projectHistoryDate: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 90, 
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: '#dcfce7', 
    borderColor: '#6ee7b7', 
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065f46', // Darker green for better contrast
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 17,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default ProjectHistoryScreen;
