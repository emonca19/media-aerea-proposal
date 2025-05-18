import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Card, StatusBadge } from '../../src/components/common';
import { mockParks, mockTurbines } from '../../src/mocks/data';

export default function ParksScreen() {
  const [selectedPark, setSelectedPark] = useState<string | null>(null);

  const parkTurbines = selectedPark
    ? mockTurbines.filter(t => t.parkId === selectedPark)
    : [];

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
          <View style={styles.parkList}>
            <Text style={styles.sectionTitle}>Parques Eólicos</Text>
            {mockParks.map(park => (
              <TouchableOpacity
                key={park.id}
                onPress={() => setSelectedPark(park.id)}
              >
                <Card title={park.name}>
                  <View style={styles.parkInfo}>
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationLabel}>Ubicación:</Text>
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

          {selectedPark && (
            <View style={styles.turbineSection}>
              <Text style={styles.sectionTitle}>Turbinas</Text>
              <View style={styles.turbineGrid}>
                {parkTurbines.map(turbine => (
                  <Card key={turbine.id} title={turbine.name}>
                    <View style={styles.turbineInfo}>
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
                      <TouchableOpacity style={styles.turbineButton}>
                        <Text style={styles.turbineButtonText}>Ver Detalles</Text>
                      </TouchableOpacity>
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
});
