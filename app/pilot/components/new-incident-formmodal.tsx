// app/pilot/dashboard/components/NewIncidentFormModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { IncidentTypeInfo, incidentTypes } from '../../../src/mocks/incident-types';
import { IncidentType } from '../../../src/types/common';

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
}) => {// Usar los tipos de incidentes proporcionados o los importados por defecto
  const typesToUse = providedIncidentTypes || incidentTypes;  // Estado inicial
  const [incidentTypeId, setIncidentTypeId] = useState<IncidentType | ''>('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [currentTime] = useState(new Date());
  const [isUrgent, setIsUrgent] = useState(true);
  
  // Formatear la hora actual
  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };  // Efecto para resetear el formulario cuando el modal se abre/cierra
  useEffect(() => {
    if (isVisible) {
      setIncidentTypeId('');
      setIncidentDescription('');
      setIsUrgent(true);
    }
  }, [isVisible]);const handleSubmit = () => {
    // Verificar que hay una actividad en curso
    if (!currentActivity) {
      Alert.alert("Sin Actividad", "Debe haber una actividad en curso para reportar un incidente.");
      return;
    }
    
    if (!incidentTypeId) {
      Alert.alert("Campo Requerido", "Por favor, selecciona un tipo de incidente.");
      return;
    }
    
    onSubmit({
      type: incidentTypeId as IncidentType,
      description: incidentDescription.trim() || "Sin descripción detallada",
      activityId: currentActivity.id,
    });
  };

  // Si no hay actividad en curso, no permitir el formulario
  if (!currentActivity) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.scrollContentContainer}>
              <View style={styles.closeButtonContainer}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close-circle" size={36} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.headerTitle}>Sin Actividad en Curso</Text>
              
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Ionicons name="pause-circle-outline" size={64} color="#94a3b8" />
                <Text style={{...styles.subtitle, textAlign: 'center', marginTop: 15}}>
                  Debe haber una actividad en curso para reportar un incidente
                </Text>
                <Text style={{fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 10}}>
                  Inicie una actividad desde el dashboard y luego podrá reportar incidentes asociados a ella.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.closeButtonContainer}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close-circle" size={36} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.headerTitle}>Reportar Incidente</Text>
            
            <Text style={styles.currentTimeDisplay}>
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' - '}
              {formatTime(currentTime)}
            </Text>
            
            <Text style={styles.subtitle}>Tipo de Incidente</Text>
            <View style={styles.typeSelection}>
              {typesToUse.map((incidentType) => (
                <TouchableOpacity
                  key={incidentType.id}
                  style={[
                    styles.typeCard,
                    incidentTypeId === incidentType.id && styles.typeCardSelected
                  ]}
                  onPress={() => setIncidentTypeId(incidentType.id)}
                ><Ionicons 
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

            {/* Opción de urgencia */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 12 }}>
              <TouchableOpacity
                style={[styles.timeOptionButton, isUrgent && styles.urgentOptionButtonSelected]}
                onPress={() => setIsUrgent(true)}
              >
                <Ionicons name="warning" size={18} color={isUrgent ? '#fff' : '#f59e0b'} />
                <Text style={[styles.timeOptionText, isUrgent && styles.timeOptionTextSelected]}>Urgente</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timeOptionButton, !isUrgent && styles.timeOptionButtonSelected]}
                onPress={() => setIsUrgent(false)}
              >
                <Ionicons name="information-circle" size={18} color={!isUrgent ? '#fff' : '#3b82f6'} />
                <Text style={[styles.timeOptionText, !isUrgent && styles.timeOptionTextSelected]}>Informativo</Text>
              </TouchableOpacity></View>

            
            <View style={styles.currentActivityDisplay}>
              <Text style={styles.subtitle}>Actividad en Curso</Text><View style={styles.currentActivityCard}>
                <Ionicons name="hourglass-outline" size={24} color="#aa74f0" />
                <Text style={styles.currentActivityName}>{currentActivity.name}</Text>
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
            
            {/* Botón de registro */}
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Registrar Incidente</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Estilos locales para el formulario de incidentes
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollView: {
    width: '100%',
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  closeButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
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
  },  typeCard: {
    width: '31%', // 3 elementos por fila con espacio entre ellos
    backgroundColor: '#fef7ed',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  typeCardSelected: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 5,
    color: '#f59e0b',
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
  },  urgentOptionButtonSelected: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
  },
  timeOptionText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },  timeOptionTextSelected: {
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
  currentActivityDisplay: {
    marginVertical: 15,
  },  currentActivityCard: {
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
});

export default NewIncidentFormModal;