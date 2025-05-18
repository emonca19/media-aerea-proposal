import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Card, StatusBadge } from '../../src/components/common';
import { SearchBar } from '../../src/components/SearchBar';
import { StatCard } from '../../src/components/StatCard';
import { mockParks, mockTurbines } from '../../src/mocks/data';

export default function ParksScreen() {
  const router = useRouter();
  const [selectedPark, setSelectedPark] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const parkTurbines = selectedPark
    ? mockTurbines.filter(t => t.parkId === selectedPark)
    : [];

  const filteredParks = mockParks.filter(park => 
    park.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    park.location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calcular estadísticas generales
  const totalTurbines = mockTurbines.length;
  const inspectedTurbines = mockTurbines.filter(t => t.status === 'INSPECTED').length;
  const completedTurbines = mockTurbines.filter(t => t.status === 'APPROVED').length;
  const pendingTurbines = totalTurbines - inspectedTurbines - completedTurbines;

  const handleTurbinePress = (turbineId: string) => {
    Alert.alert(
      'Acciones de Turbina',
      '¿Qué acción desea realizar?',
      [
        {
          text: 'Ver Detalles',
          onPress: () => router.push(`/admin/turbine/${turbineId}`),
        },
        {
          text: 'Ver Fotos',
          onPress: () => router.push(`/admin/photos?turbineId=${turbineId}`),
        },
        {
          text: 'Iniciar Inspección',
          onPress: () => {
            router.push(`/pilot/preflight-checklist?turbineId=${turbineId}`);
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Parques y Turbinas',
          headerStyle: { backgroundColor: '#1a237e' },
          headerTintColor: '#fff',
        }}
      />
      <LinearGradient
        colors={['#1a237e', '#0d47a1', '#01579b']}
        style={styles.gradient}
      >
        <ScrollView style={styles.content}>
          {/* Barra de búsqueda */}
          <SearchBar
            placeholder="Buscar parques..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            style={styles.searchBar}
          />

          {/* Estadísticas generales */}
          <View style={styles.statsContainer}>
            <StatCard
              icon="engineering"
              title="Total Turbinas"
              value={totalTurbines}
              color="#64ffda"
            />
            <StatCard
              icon="checklist"
              title="Inspeccionadas"
              value={inspectedTurbines}
              color="#ff9800"
            />
            <StatCard
              icon="check-circle"
              title="Completadas"
              value={completedTurbines}
              color="#4caf50"
            />
          </View>

          {/* Lista de parques */}
          <View style={styles.parkList}>
            <Text style={styles.sectionTitle}>Parques Eólicos</Text>
            {filteredParks.map(park => (
              <TouchableOpacity
                key={park.id}
                onPress={() => setSelectedPark(park.id)}
                style={[
                  styles.parkCard,
                  selectedPark === park.id && styles.selectedParkCard,
                ]}
              >
                <Card title={park.name}>
                  <View style={styles.parkInfo}>
                    <View style={styles.locationInfo}>
                      <MaterialIcons name="location-on" size={16} color="#8892b0" />
                      <Text style={styles.locationText}>{park.location.address}</Text>
                    </View>
                    <View style={styles.coordinates}>
                      <Text style={styles.coordinateText}>
                        Lat: {park.location.latitude}
                      </Text>
                      <Text style={styles.coordinateText}>
                        Long: {park.location.longitude}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.parkStats}>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Turbinas Totales</Text>
                      <Text style={styles.statValue}>
                        {mockTurbines.filter(t => t.parkId === park.id).length}
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Completadas</Text>
                      <Text style={styles.statValue}>
                        {mockTurbines.filter(t => 
                          t.parkId === park.id && 
                          t.status === 'APPROVED'
                        ).length}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sección de turbinas */}
          {selectedPark && (
            <View style={styles.turbineSection}>
              <Text style={styles.sectionTitle}>Turbinas</Text>
              <View style={styles.turbineGrid}>
                {parkTurbines.map(turbine => (
                  <Card key={turbine.id} title={turbine.name}>
                    <View style={styles.turbineInfo}>
                      <View style={styles.turbineHeader}>
                        <StatusBadge
                          status={turbine.status}
                          color={
                            turbine.status === 'APPROVED'
                              ? '#4caf50'
                              : turbine.status === 'PHOTOS_UPLOADED'
                              ? '#2196f3'
                              : turbine.status === 'INSPECTED'
                              ? '#ff9800'
                              : '#9e9e9e'
                          }
                        />
                        {turbine.lastInspection && (
                          <Text style={styles.lastInspection}>
                            Última inspección:{' '}
                            {new Date(turbine.lastInspection).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                      
                      <View style={styles.turbineActions}>
                        <TouchableOpacity 
                          style={styles.turbineButton}
                          onPress={() => handleTurbinePress(turbine.id)}
                        >
                          <MaterialIcons name="menu" size={16} color="#64ffda" />
                          <Text style={styles.turbineButtonText}>Acciones</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a192f',
  },
  gradient: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  searchContainer: {
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#64ffda',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  parkList: {
    marginBottom: 24,
  },
  parkInfo: {
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  locationLabel: {
    color: '#8892b0',
    marginRight: 8,
  },
  locationText: {
    color: '#fff',
    flex: 1,
  },
  coordinates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateText: {
    color: '#8892b0',
    fontSize: 12,
  },
  parkStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#8892b0',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#64ffda',
    fontSize: 24,
    fontWeight: 'bold',
  },
  turbineSection: {
    marginTop: 16,
  },
  turbineGrid: {
    gap: 12,
  },
  turbineInfo: {
    gap: 12,
    alignItems: 'flex-start',
  },
  lastInspection: {
    color: '#8892b0',
    fontSize: 12,
  },
  turbineButton: {
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  turbineButtonText: {
    color: '#64ffda',
  },
  searchBar: {
    marginBottom: 24,
  },
  parkCard: {
    marginBottom: 16,
  },
  selectedParkCard: {
    borderWidth: 2,
    borderColor: '#64ffda',
  },
  turbineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  turbineActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
});
