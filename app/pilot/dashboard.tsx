import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Card, StatusBadge } from '../../src/components/common';
import { mockActivities, mockProjects, mockTurbines } from '../../src/mocks/data';

export default function PilotDashboard() {
  const todayActivities = mockActivities.filter(
    activity => new Date(activity.startTime).toDateString() === new Date().toDateString()
  );

  const currentProject = mockProjects[0];
  const pendingTurbines = mockTurbines.filter(t => t.status === 'NOT_STARTED');

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Dashboard del Piloto',
          headerStyle: { backgroundColor: '#1a237e' },
          headerTintColor: '#fff',
        }}
      />
      <LinearGradient
        colors={['#1a237e', '#0d47a1', '#01579b']}
        style={styles.gradient}
      >
        <ScrollView style={styles.content}>
          <Card title="Proyecto Actual">
            <Text style={styles.projectName}>{currentProject.name}</Text>
            <StatusBadge 
              status={currentProject.status} 
              color={currentProject.status === 'ACTIVE' ? '#4caf50' : '#ff9800'}
            />
            <Text style={styles.date}>
              Fecha fin: {new Date(currentProject.endDate).toLocaleDateString()}
            </Text>
          </Card>

          <Card title="Turbinas Pendientes">
            <Text style={styles.count}>{pendingTurbines.length} turbinas</Text>
            {pendingTurbines.map(turbine => (
              <View key={turbine.id} style={styles.turbineItem}>
                <Text style={styles.turbineName}>{turbine.name}</Text>
                <StatusBadge status={turbine.status} color="#ff9800" />
              </View>
            ))}
          </Card>

          <Card title="Actividades de Hoy">
            {todayActivities.map(activity => (
              <View key={activity.id} style={styles.activityItem}>
                <Text style={styles.activityType}>{activity.type}</Text>
                <Text style={styles.activityTime}>
                  {new Date(activity.startTime).toLocaleTimeString()} - 
                  {activity.endTime ? new Date(activity.endTime).toLocaleTimeString() : 'En curso'}
                </Text>
                {activity.notes && (
                  <Text style={styles.notes}>{activity.notes}</Text>
                )}
              </View>
            ))}
          </Card>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Iniciar Checklist Prevuelo</Text>
          </TouchableOpacity>
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
  projectName: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
  },
  date: {
    color: '#8892b0',
    marginTop: 8,
  },
  count: {
    color: '#64ffda',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  turbineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  turbineName: {
    color: '#fff',
    fontSize: 16,
  },
  activityItem: {
    marginBottom: 16,
  },
  activityType: {
    color: '#64ffda',
    fontSize: 16,
    fontWeight: '600',
  },
  activityTime: {
    color: '#8892b0',
    marginTop: 4,
  },
  notes: {
    color: '#8892b0',
    marginTop: 4,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#64ffda',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonText: {
    color: '#0a192f',
    fontSize: 16,
    fontWeight: '600',
  },
});
