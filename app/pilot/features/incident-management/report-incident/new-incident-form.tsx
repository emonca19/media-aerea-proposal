// app/pilot/features/incident-management/report-incident/new-incident-form.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { IncidentTypeInfo, incidentTypes } from '../../../../../src/mocks/incident-types';
import { IncidentType } from '../../../../../src/types/common';

// Interfaz para los datos del formulario que se envían
export interface IncidentFormData {
  type: IncidentType;  // Use the centralized IncidentType enum
  description: string;
  activityId?: string;
  isBlocking?: boolean; // Whether the incident should block activity continuation
}

// Props del componente Modal
interface NewIncidentFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (incidentData: IncidentFormData) => void;
  incidentTypes?: IncidentTypeInfo[]; // Optional override of incident types
  currentActivity?: { id: string; name: string } | null; // Current running activity
}

const NewIncidentFormModal: React.FC<NewIncidentFormModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  incidentTypes: providedIncidentTypes,
  currentActivity = null,
}) => {
  // Usar los tipos de incidentes proporcionados o los importados por defecto
  const typesToUse = providedIncidentTypes || incidentTypes;
  
  // Estado inicial
  const [incidentTypeId, setIncidentTypeId] = useState<IncidentType | ''>('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Función para formatear el tiempo
  const formatTime = (date: Date | null) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Actualizar el tiempo cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Efecto para resetear el formulario cuando el modal se abre/cierra
  useEffect(() => {
    if (isVisible) {
      setIncidentTypeId('');
      setIncidentDescription('');
    }
  }, [isVisible]);  const handleSubmit = () => {
    // Validaciones silenciosas - no procesar si no hay datos válidos
    if (!incidentTypeId || incidentDescription.trim().length < 10) {
      return;
    }

    const incidentData: IncidentFormData = {
      type: incidentTypeId as IncidentType,
      description: incidentDescription.trim(),
      activityId: currentActivity?.id,
    };
    
    onSubmit(incidentData);
    onClose();
  };

  // Determinar si el formulario está completo y válido
  const isFormValid = incidentTypeId && incidentDescription.trim().length >= 10;

  // Determinar si el formulario debe estar deshabilitado
  const isFormDisabled = !currentActivity;  return (    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <View style={styles.modalContainer}>
        <ScrollView
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={36} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerTitle}>Reportar Incidente</Text>

          <Text style={styles.currentTimeDisplay}>
            {currentTime.toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            {" - "}
            {formatTime(currentTime)}
          </Text>
            
          <Text style={styles.subtitle}>Tipo de Incidente</Text>
          <View style={[styles.typeSelection, isFormDisabled && styles.disabledContainer]}>
            {typesToUse.map((incidentType) => (
              <TouchableOpacity
                key={incidentType.id}
                style={[
                  styles.typeCard,
                  incidentTypeId === incidentType.id && styles.typeCardSelected,
                  isFormDisabled && styles.disabledCard
                ]}                onPress={() => !isFormDisabled && setIncidentTypeId(incidentType.id)}
                disabled={isFormDisabled}
              >
                <Ionicons
                  name={incidentType.icon} 
                  size={24} 
                  color={incidentTypeId === incidentType.id ? '#ffffff' : '#f59e0b'} 
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
          
          <View style={styles.currentActivityDisplay}>
            <Text style={styles.subtitle}>Actividad en Curso</Text>
            {currentActivity ? (
              <View style={styles.currentActivityCard}>
                <Ionicons name="hourglass-outline" size={24} color="#aa74f0" />
                <Text style={styles.currentActivityName}>{currentActivity.name}</Text>
              </View>
            ) : (
              <View style={[styles.currentActivityCard, styles.disabledCard]}>
                <Ionicons name="pause-circle-outline" size={24} color="#94a3b8" />
                <Text style={[styles.currentActivityName, { color: '#94a3b8' }]}>
                  Ninguna actividad en curso
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.subtitle}>Descripción detallada</Text>
          <View style={styles.descriptionContainer}>
            <TextInput
              style={[
                styles.descriptionInput,
                isFormDisabled && styles.disabledInput
              ]}
              placeholder="Describe qué ocurrió, las condiciones observadas, el impacto, etc."
              value={incidentDescription}
              onChangeText={(text) => !isFormDisabled && setIncidentDescription(text)}
              multiline={true}
              numberOfLines={5}
              placeholderTextColor="#94a3b8"
              textAlignVertical="top"
              editable={!isFormDisabled}
            />
          </View>          <TouchableOpacity 
            style={[
              styles.submitButton,
              (isFormDisabled || !isFormValid) && styles.disabledButton
            ]} 
            onPress={handleSubmit}
            disabled={isFormDisabled || !isFormValid}
          >
            <Text style={styles.submitButtonText}>
              {isFormDisabled 
                ? 'Formulario Deshabilitado' 
                : !isFormValid
                ? 'Completa todos los campos'
                : 'Registrar Incidente'
              }
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

// Estilos locales para el formulario de incidentes
const styles = StyleSheet.create({  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  closeButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    paddingRight: 10,
    paddingTop: 10,
    marginBottom: 0,
  },
  closeButton: {
    padding: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ea580c", // Orange color for incidents
    marginBottom: 10,
    marginTop: 5,
    textAlign: "center",
  },
  currentTimeDisplay: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 15,
    marginTop: 0,
    textAlign: "center",
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
    backgroundColor: '#fef7ed',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },  typeCardSelected: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
  },typeLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 5,
    color: '#f59e0b',
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: 'white',
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
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
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
  currentActivityDisplay: {
    marginVertical: 15,
  },
  currentActivityCard: {
    backgroundColor: '#f3e8ff',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d8b4fe',
  },
  currentActivityName: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
    color: '#7c3aed',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  disabledCard: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    color: '#94a3b8',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
});

export default NewIncidentFormModal;
