import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const mockProjectHistory = [
    { id: 'proj1', name: 'Inspección Puente Colgante', client: 'Infraestructura Vial S.A.', completionDate: '10/04/2023', status: 'Completado', category: 'Infraestructura' },
    { id: 'proj2', name: 'Seguimiento Cultivos Maíz', client: 'AgroTech Solutions', completionDate: '15/03/2023', status: 'Completado', category: 'Agricultura' },
    { id: 'proj3', name: 'Levantamiento Topográfico Urbano', client: 'Desarrollos Urbanos Ltda.', completionDate: '01/02/2023', status: 'Completado', category: 'Topografía' },
    { id: 'proj4', name: 'Monitoreo Ambiental Costa', client: 'Fundación Oceánica', completionDate: '20/01/2023', status: 'Completado', category: 'Ambiental' },
    { id: 'proj5', name: 'Inspección Líneas Eléctricas Alta Tensión', client: 'Red Eléctrica Nacional', completionDate: '05/12/2022', status: 'Completado', category: 'Energía' },
    { id: 'proj6', name: 'Inspección Parque Eólico', client: 'Vientos del Sur', completionDate: '28/11/2022', status: 'Completado', category: 'Energía' },
    { id: 'proj7', name: 'Mapeo Construcción Residencial', client: 'Constructora Norte', completionDate: '10/10/2022', status: 'Completado', category: 'Construcción' },
  ];

const ProjectHistoryScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredProjects = useMemo(() => {
    return mockProjectHistory.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.client.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);  const renderProjectHistoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.projectHistoryItem}>
      <View style={styles.projectIconContainer}>
        <Ionicons name="document-text-outline" size={20} color="#ffffff" />
      </View>
      <View style={styles.projectHistoryContent}>
        <Text style={styles.projectHistoryName}>{item.name}</Text>
        <Text style={styles.projectHistoryClient}>{item.client}</Text>
        <Text style={styles.projectHistoryDate}>Finalizado: {item.completionDate}</Text>
      </View>
      <View style={styles.statusBadge}>
         <Ionicons name="checkmark-circle" size={14} color="#8b5cf6" />
      </View>
    </TouchableOpacity>
  );  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/pilot/profile')}
          >
            <Ionicons name="arrow-back" size={24} color="#8b5cf6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial de Proyectos</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={18} color="#8b5cf6" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar proyectos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#a78bfa"
            />
          </View>
        </View>
        
        {filteredProjects.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="folder-open-outline" size={60} color="#c4b5fd" />
            <Text style={styles.emptyStateTitle}>No se encontraron proyectos</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery 
                ? 'Intenta ajustar tu búsqueda' 
                : 'No hay proyectos en el historial.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProjects}
            renderItem={renderProjectHistoryItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f0ff',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
    flex: 1,
  },  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf8ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },  listContentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  projectHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#a855f7',
  },
  projectIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  projectHistoryContent: {
    flex: 1,
  },
  projectHistoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 3,
    lineHeight: 20,
  },
  projectHistoryClient: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
    fontWeight: '400',
  },
  projectHistoryDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f0ff',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProjectHistoryScreen;
