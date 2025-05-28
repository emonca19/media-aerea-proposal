// app/pilot/new-incident.tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { incidentTypes } from '../../src/mocks/incident-types';
import { IncidentType } from '../../src/types/common';

// Interfaz para los datos del formulario que se envían
export interface IncidentFormData {
  type: IncidentType;  // Use the centralized IncidentType enum
  description: string;
  activityId?: string;
  isBlocking?: boolean; // Whether the incident should block activity continuation
}

// Props opcionales para que se pueda usar como pantalla o como componente dentro de un modal
interface NewIncidentScreenProps {
  onSubmit?: (incidentData: IncidentFormData) => void;
  currentActivity?: { id: string; name: string; status: string } | null;
}

export default function NewIncidentScreen({ onSubmit, currentActivity = null }: NewIncidentScreenProps) {
  const router = useRouter();

  // Estados
  const [incidentTypeId, setIncidentTypeId] = useState<IncidentType | ''>('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [currentTime] = useState(new Date());
  
  // Formatear la hora actual
  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = () => {
    // Verificar que hay una actividad en curso
    if (!currentActivity) {
      Alert.alert("Sin Actividad", "Debe haber una actividad en curso para reportar un incidente.");
      return;
    }

    if (!incidentTypeId) {
      Alert.alert("Campo Requerido", "Por favor, selecciona un tipo de incidente.");
      return;
    }
      const incidentData: IncidentFormData = {
      type: incidentTypeId as IncidentType,
      description: incidentDescription.trim() || "Sin descripción detallada",
      activityId: currentActivity.id,
    };
    
    // Si hay una función onSubmit (modo componente), la llamamos
    if (onSubmit) {
      onSubmit(incidentData);
    } else {
      // Modo pantalla independiente - navegar de vuelta sin mostrar alerta
      if (router.canGoBack()) {
        router.back();
      } else {
        console.log("No se puede regresar, incidente enviado desde contexto raíz o similar.");
      }
    }
  };
  
  // El formulario siempre está habilitado visualmente, pero la validación impide el envío sin actividad
  const canSubmit = !!currentActivity && !!incidentTypeId;

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen
        options={{
          title: 'Reportar Incidente',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#ef4444',
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Reportar Incidente</Text>
        
        <Text style={styles.currentTimeDisplay}>
          {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          {' | '}
          {formatTime(currentTime)}
        </Text>
        
        {/* Selección de tipo de incidente */}
        <Text style={styles.subtitle}>Tipo de Incidente</Text>
        <View style={styles.typeSelection}>
          {incidentTypes.map((incidentType) => (
            <TouchableOpacity
              key={incidentType.id}
              style={[
                styles.typeCard,
                incidentTypeId === incidentType.id && styles.typeCardSelected
              ]}
              onPress={() => setIncidentTypeId(incidentType.id)}
            >
              <Ionicons 
                name={incidentType.icon} 
                size={24} 
                color={incidentTypeId === incidentType.id ? '#ffffff' : '#ef4444'} 
              />
              <Text style={[
                styles.typeLabel,
                incidentTypeId === incidentType.id && styles.typeLabelSelected
              ]}>
                {incidentType.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mostrar actividad actual o No asociada */}
        <View style={styles.activitySelection}>
          <Text style={styles.subtitle}>Actividad Asociada</Text>
          <View style={[
            styles.currentActivityCard,
            !currentActivity && styles.noActivityCard
          ]}>
            <Ionicons 
              name={currentActivity ? "hourglass-outline" : "alert-circle-outline"} 
              size={24} 
              color={currentActivity ? "#3b82f6" : "#94a3b8"} 
            />
            <Text style={[
              styles.currentActivityName,
              !currentActivity && styles.noActivityName
            ]}>
              {currentActivity ? currentActivity.name : "No asociada"}
            </Text>
            <Text style={[
              styles.currentActivityStatus,
              !currentActivity && styles.noActivityStatus
            ]}>
              {currentActivity ? "En curso" : "Requiere actividad"}
            </Text>
          </View>
        </View>

        {/* Descripción del incidente */}
        <Text style={styles.subtitle}>Descripción detallada</Text>
        <View style={styles.descriptionContainer}>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe qué ocurrió, las condiciones observadas, el impacto, etc."
            value={incidentDescription}
            onChangeText={setIncidentDescription}
            multiline={true}
            numberOfLines={5}
            placeholderTextColor="#94a3b8"
            textAlignVertical="top"
          />
        </View>
        
        {/* Mostrar mensaje cuando no hay actividad */}
        {!currentActivity && (
          <View style={styles.noActivityWarning}>
            <Ionicons name="pause-circle-outline" size={20} color="#f59e0b" />
            <Text style={styles.noActivityText}>
              Sin actividad en curso. Para reportar un incidente, debe iniciar una actividad primero.
            </Text>
          </View>
        )}
        
        {/* Botón de registro */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled
          ]} 
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={styles.submitButtonText}>
            {!currentActivity ? 'Sin Actividad en Curso' : !incidentTypeId ? 'Selecciona Tipo de Incidente' : 'Registrar Incidente'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 70,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  currentTimeDisplay: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginTop: 10,
    marginBottom: 12,
  },
  typeSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  typeCard: {
    width: '31%',
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  typeCardSelected: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 5,
    color: '#ef4444',
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: 'white',
  },
  timeOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'white',
  },
  timeOptionButtonSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  urgentOptionButtonSelected: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  timeOptionText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  timeOptionTextSelected: {
    color: 'white',
  },
  activitySelection: {
    marginVertical: 15,
  },
  activityScroll: {
    paddingRight: 20,
  },
  activityCard: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    minWidth: 140,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activityCardSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  activityName: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5,
    color: '#475569',
    textAlign: 'center',
  },
  activityNameSelected: {
    color: 'white',
  },
  activityStatus: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  activityStatusSelected: {
    color: '#e0f2fe',
  },
  descriptionContainer: {
    marginTop: 5,
    marginBottom: 20,
  },
  descriptionInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    height: 120,
    fontSize: 15,
    color: '#334155',
  },  submitButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentActivityCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bae6fd',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentActivityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    flex: 1,
    marginLeft: 10,
  },  currentActivityStatus: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.6,
  },
  noActivityCard: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  noActivityName: {
    color: '#64748b',
    fontStyle: 'italic'
  },
  noActivityStatus: {
    color: '#94a3b8',
  },
  noActivityWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffedd5',
    marginBottom: 15,
  },
  noActivityText: {
    color: '#9a3412',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
});
