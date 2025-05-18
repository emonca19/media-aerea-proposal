import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Card } from '../../src/components/common';
import { mockActivities, mockTurbines } from '../../src/mocks/data';

type ActivityType = 'MOBILIZATION' | 'TURBINE_WORK' | 'BREAK' | 'WEATHER_DELAY' | 'OTHER';

const activityTypes: { type: ActivityType; label: string }[] = [
  { type: 'MOBILIZATION', label: 'Movilización' },
  { type: 'TURBINE_WORK', label: 'Trabajo en Turbina' },
  { type: 'BREAK', label: 'Descanso' },
  { type: 'WEATHER_DELAY', label: 'Retraso por Clima' },
  { type: 'OTHER', label: 'Otro' },
];

export default function ActivityLogScreen() {
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [selectedTurbine, setSelectedTurbine] = useState('');
  const [notes, setNotes] = useState('');

  const handleStartActivity = () => {
    if (!selectedType) {
      Alert.alert('Error', 'Selecciona un tipo de actividad');
      return;
    }

    if (selectedType === 'TURBINE_WORK' && !selectedTurbine) {
      Alert.alert('Error', 'Selecciona una turbina');
      return;
    }

    // Aquí iría la lógica para registrar la actividad
    Alert.alert('Éxito', 'Actividad iniciada');
  };

  const getTodayActivities = () => {
    const today = new Date().toDateString();
    return mockActivities.filter(
      activity => new Date(activity.startTime).toDateString() === today
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Registro de Actividades',
          headerStyle: { backgroundColor: '#1a237e' },
          headerTintColor: '#fff',
        }}
      />
      <LinearGradient
        colors={['#1a237e', '#0d47a1', '#01579b']}
        style={styles.gradient}
      >
        <ScrollView style={styles.content}>
          <Card title="Nueva Actividad">
            <View style={styles.typeSelection}>
              {activityTypes.map(({ type, label }) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    selectedType === type && styles.typeButtonSelected,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === type && styles.typeButtonTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedType === 'TURBINE_WORK' && (
              <View style={styles.turbineSelection}>
                <Text style={styles.label}>Seleccionar Turbina:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.turbineList}>
                    {mockTurbines.map(turbine => (
                      <TouchableOpacity
                        key={turbine.id}
                        style={[
                          styles.turbineButton,
                          selectedTurbine === turbine.id && styles.turbineButtonSelected,
                        ]}
                        onPress={() => setSelectedTurbine(turbine.id)}
                      >
                        <Text
                          style={[
                            styles.turbineButtonText,
                            selectedTurbine === turbine.id && styles.turbineButtonTextSelected,
                          ]}
                        >
                          {turbine.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <View style={styles.notesSection}>
              <Text style={styles.label}>Notas:</Text>
              <TextInput
                style={styles.notesInput}
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                placeholder="Agregar notas o comentarios..."
                placeholderTextColor="#8892b0"
              />
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartActivity}
            >
              <Text style={styles.startButtonText}>Iniciar Actividad</Text>
            </TouchableOpacity>
          </Card>

          <View style={styles.todaySection}>
            <Text style={styles.sectionTitle}>Actividades de Hoy</Text>
            {getTodayActivities().map(activity => (
              <Card key={activity.id} title={activityTypes.find(t => t.type === activity.type)?.label || activity.type}>
                <View style={styles.activityInfo}>
                  <View style={styles.timeInfo}>
                    <Text style={styles.timeLabel}>Inicio:</Text>
                    <Text style={styles.timeText}>
                      {new Date(activity.startTime).toLocaleTimeString()}
                    </Text>
                  </View>
                  {activity.endTime && (
                    <View style={styles.timeInfo}>
                      <Text style={styles.timeLabel}>Fin:</Text>
                      <Text style={styles.timeText}>
                        {new Date(activity.endTime).toLocaleTimeString()}
                      </Text>
                    </View>
                  )}
                  {activity.notes && (
                    <Text style={styles.activityNotes}>{activity.notes}</Text>
                  )}
                </View>
              </Card>
            ))}
          </View>
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
  typeSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeButtonSelected: {
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    borderColor: '#64ffda',
  },
  typeButtonText: {
    color: '#8892b0',
  },
  typeButtonTextSelected: {
    color: '#64ffda',
  },
  turbineSelection: {
    marginBottom: 16,
  },
  label: {
    color: '#8892b0',
    marginBottom: 8,
  },
  turbineList: {
    flexDirection: 'row',
    gap: 8,
  },
  turbineButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  turbineButtonSelected: {
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    borderColor: '#64ffda',
  },
  turbineButtonText: {
    color: '#8892b0',
  },
  turbineButtonTextSelected: {
    color: '#64ffda',
  },
  notesSection: {
    marginBottom: 16,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    height: 100,
    textAlignVertical: 'top',
  },
  startButton: {
    backgroundColor: '#64ffda',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#0a192f',
    fontSize: 16,
    fontWeight: '600',
  },
  todaySection: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#64ffda',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activityInfo: {
    gap: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  timeLabel: {
    color: '#8892b0',
    width: 50,
  },
  timeText: {
    color: '#fff',
  },
  activityNotes: {
    color: '#8892b0',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
