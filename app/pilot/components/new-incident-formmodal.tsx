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
import { incidentTypes } from './pilot-dashboard-data';

// Interfaz para los datos del formulario que se envían
export interface IncidentFormData {
  type: string;        // ID del tipo de incidente (ej. 'INC_WEATHER')
  description: string;
  activityId?: string;
  isBlocking?: boolean; // Whether the incident should block activity continuation
}

// Props del componente Modal
interface NewIncidentFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (incidentData: IncidentFormData) => void;
  incidentTypes: typeof incidentTypes;
  activities?: { id: string; name: string; status: string }[];
}

const NewIncidentFormModal: React.FC<NewIncidentFormModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  incidentTypes: providedIncidentTypes,
  activities = [],
}) => {
  // Usar los tipos de incidentes proporcionados o los importados por defecto
  const typesToUse = providedIncidentTypes || incidentTypes;  // Estado inicial
  const [incidentTypeId, setIncidentTypeId] = useState<string>('');
  const [incidentDescription, setIncidentDescription] = useState('');  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
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
      setSelectedActivityId('');
      setIsUrgent(true);
    }
  }, [isVisible]);const handleSubmit = () => {
    if (!incidentTypeId) {
      Alert.alert("Campo Requerido", "Por favor, selecciona un tipo de incidente.");
      return;
    }
    
    onSubmit({
      type: incidentTypeId,
      description: incidentDescription.trim() || "Sin descripción detallada",
      activityId: selectedActivityId || undefined,
    });
  };

  // Filtrar actividades que no están completadas
  const relevantActivities = activities.filter(act => 
    act.status === 'EN_PROGRESO' || act.status === 'PENDIENTE'
  );

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
            
            {/* Selección de tipo de incidente */}
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

            {/* Opción de urgencia */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 12 }}>
              <TouchableOpacity
                style={[styles.timeOptionButton, isUrgent && styles.urgentOptionButtonSelected]}
                onPress={() => setIsUrgent(true)}
              >
                <Ionicons name="warning" size={18} color={isUrgent ? '#fff' : '#ef4444'} />
                <Text style={[styles.timeOptionText, isUrgent && styles.timeOptionTextSelected]}>Urgente</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timeOptionButton, !isUrgent && styles.timeOptionButtonSelected]}
                onPress={() => setIsUrgent(false)}
              >
                <Ionicons name="information-circle" size={18} color={!isUrgent ? '#fff' : '#3b82f6'} />
                <Text style={[styles.timeOptionText, !isUrgent && styles.timeOptionTextSelected]}>Informativo</Text>
              </TouchableOpacity>
            </View>

            {/* Selector de actividad asociada */}
            {relevantActivities.length > 0 && (
              <View style={styles.activitySelection}>
                <Text style={styles.subtitle}>Asociar a actividad (opcional)</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.activityScroll}
                >
                  {/* Opción "Sin asociar" */}
                  <TouchableOpacity
                    style={[
                      styles.activityCard,
                      selectedActivityId === '' && styles.activityCardSelected
                    ]}
                    onPress={() => setSelectedActivityId('')}
                  >
                    <Ionicons 
                      name="remove-circle-outline" 
                      size={24} 
                      color={selectedActivityId === '' ? '#ffffff' : '#6b7280'} 
                    />
                    <Text style={[
                      styles.activityName,
                      selectedActivityId === '' && styles.activityNameSelected
                    ]}>
                      No asociar
                    </Text>
                    <Text style={[
                      styles.activityStatus,
                      selectedActivityId === '' && styles.activityStatusSelected
                    ]}>
                      Incidente general
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Opciones de actividades */}
                  {relevantActivities.map((activity) => (
                    <TouchableOpacity
                      key={activity.id}
                      style={[
                        styles.activityCard,
                        selectedActivityId === activity.id && styles.activityCardSelected
                      ]}
                      onPress={() => setSelectedActivityId(activity.id)}
                    >
                      <Ionicons 
                        name={activity.status === 'EN_PROGRESO' ? 'hourglass-outline' : 'time-outline'} 
                        size={24} 
                        color={selectedActivityId === activity.id ? '#ffffff' : (activity.status === 'EN_PROGRESO' ? '#3b82f6' : '#f59e0b')} 
                      />
                      <Text style={[
                        styles.activityName,
                        selectedActivityId === activity.id && styles.activityNameSelected
                      ]}>
                        {activity.name}
                      </Text>
                      <Text style={[
                        styles.activityStatus,
                        selectedActivityId === activity.id && styles.activityStatusSelected
                      ]}>
                        {activity.status === 'EN_PROGRESO' ? 'En curso' : 'Pendiente'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

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
  },
  typeCard: {
    width: '31%', // 3 elementos por fila con espacio entre ellos
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
  },
  submitButton: {
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
  },  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NewIncidentFormModal;