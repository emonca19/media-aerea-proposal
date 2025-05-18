import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card, StatusBadge } from '../../../src/components/common';
import { mockActivities, mockTurbines } from '../../../src/mocks/data';

export default function TurbineDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const turbine = mockTurbines.find(t => t.id === id);

  if (!turbine) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Turbina no encontrada</Text>
      </View>
    );
  }

  // Filtrar actividades relacionadas con esta turbina
  const turbineActivities = mockActivities.filter(a => a.turbineId === turbine.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#4caf50';
      case 'PHOTOS_UPLOADED':
        return '#2196f3';
      case 'INSPECTED':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const handleInspectionStart = () => {
    Alert.alert(
      'Iniciar Inspección',
      '¿Desea comenzar una nueva inspección de esta turbina?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {          text: 'Comenzar',
          onPress: () => router.push(`/pilot/preflight-checklist?turbineId=${turbine.id}`),
        },
      ]
    );
  };
  const handlePhotoSection = () => {
    router.push(`/admin/photos?turbineId=${turbine.id}`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Turbina ${turbine.name}`,
          headerStyle: { backgroundColor: '#1a237e' },
          headerTintColor: '#fff',
        }}
      />
      <LinearGradient
        colors={['#1a237e', '#0d47a1', '#01579b']}
        style={styles.gradient}
      >
        <ScrollView style={styles.content}>
          <Card title="Estado Actual">
            <View style={styles.statusContainer}>
              <StatusBadge
                status={turbine.status}
                color={getStatusColor(turbine.status)}
              />
              {turbine.lastInspection && (
                <Text style={styles.lastInspection}>
                  Última inspección: {new Date(turbine.lastInspection).toLocaleDateString()}
                </Text>
              )}
            </View>
          </Card>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleInspectionStart}
            >
              <MaterialIcons name="add-task" size={24} color="#64ffda" />
              <Text style={styles.actionButtonText}>Nueva Inspección</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePhotoSection}
            >
              <MaterialIcons name="photo-library" size={24} color="#64ffda" />
              <Text style={styles.actionButtonText}>Ver Fotos</Text>
            </TouchableOpacity>
          </View>

          <Card title="Historial de Actividades">
            {turbineActivities.length > 0 ? (
              turbineActivities.map(activity => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityType}>{activity.type}</Text>
                    <Text style={styles.activityDate}>
                      {new Date(activity.startTime).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.activityTime}>
                    {new Date(activity.startTime).toLocaleTimeString()} - 
                    {activity.endTime
                      ? new Date(activity.endTime).toLocaleTimeString()
                      : 'En curso'}
                  </Text>
                  {activity.notes && (
                    <Text style={styles.activityNotes}>{activity.notes}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noActivities}>
                No hay actividades registradas
              </Text>
            )}
          </Card>
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
  errorText: {
    color: '#ff5252',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastInspection: {
    color: '#8892b0',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#64ffda',
  },
  actionButtonText: {
    color: '#64ffda',
    marginTop: 8,
    fontSize: 14,
  },
  activityItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  activityType: {
    color: '#64ffda',
    fontWeight: 'bold',
  },
  activityDate: {
    color: '#8892b0',
    fontSize: 12,
  },
  activityTime: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  activityNotes: {
    color: '#8892b0',
    fontSize: 14,
    fontStyle: 'italic',
  },
  noActivities: {
    color: '#8892b0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
