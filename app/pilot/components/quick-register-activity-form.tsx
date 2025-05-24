import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Reutilizamos los datos de mockTurbines de ActivityLogScreen para consistencia
export const mockTurbines = [
  { id: '1', name: 'T-001', status: 'IN_PROGRESS', lastInspection: '2023-05-15' },
  { id: '2', name: 'T-002', status: 'COMPLETED', lastInspection: '2023-05-16' },
  { id: '3', name: 'T-003', status: 'PENDING', lastInspection: '2023-04-28' },
  { id: '4', name: 'T-004', status: 'IN_PROGRESS', lastInspection: '2023-05-17' },
  { id: '5', name: 'T-005', status: 'PENDING', lastInspection: '2023-04-30' },
];

// Tipos de actividad
export type ActivityType = 'MOBILIZATION' | 'TURBINE_WORK' | 'BREAK' | 'WEATHER_DELAY' | 'OTHER' | 'MEAL';

export const activityTypes = [
  { type: 'MOBILIZATION' as ActivityType, label: 'Movilización', icon: 'bus' },
  { type: 'TURBINE_WORK' as ActivityType, label: 'Trabajo en Turbina', icon: 'wind-turbine' },
  { type: 'BREAK' as ActivityType, label: 'Descanso', icon: 'coffee' },
  { type: 'MEAL' as ActivityType, label: 'Tiempo de Comida', icon: 'food' },
  { type: 'WEATHER_DELAY' as ActivityType, label: 'Retraso por Clima', icon: 'weather-cloudy' },
  { type: 'OTHER' as ActivityType, label: 'Otro', icon: 'dots-horizontal' }
];

interface QuickRegisterActivityFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (activityData: any) => void;
}

const QuickRegisterActivityForm: React.FC<QuickRegisterActivityFormProps> = ({ 
  isVisible, 
  onClose, 
  onSubmit 
}) => {
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [selectedTurbine, setSelectedTurbine] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isForNow, setIsForNow] = useState(true);
  
  // Filtra las turbinas que no están completadas para la selección
  const filteredTurbines = mockTurbines.filter(t => t.status !== 'COMPLETED');
  
  // Actualizar la hora actual cada minuto
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);
  
  // Resetea el formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isVisible) {
      setSelectedType(null);
      setSelectedTurbine('');
      setNotes('');
      setIsForNow(true);
    }
  }, [isVisible]);

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const handleSubmit = () => {
    if (!selectedType) {
      Alert.alert("Error", "Selecciona un tipo de actividad");
      return;
    }
    if (selectedType === 'TURBINE_WORK' && !selectedTurbine) {
      Alert.alert("Error", "Selecciona una turbina");
      return;
    }
    const activityData = {
      type: selectedType,
      turbineId: selectedType === 'TURBINE_WORK' ? selectedTurbine : undefined,
      notes: notes,
      isForNow,
      startTime: new Date(),
    };
    onSubmit(activityData);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}    >      <View style={styles.modalContainer}>
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
            
            <Text style={styles.headerTitle}>Registrar Actividad</Text>
            
            <Text style={styles.currentTimeDisplay}>
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' - '}
              {formatTime(currentTime)}
            </Text>
            
            {/* SELECCIÓN DE TIPO DE ACTIVIDAD ("CUADRITOS") */}
            <Text style={styles.subtitle}>Tipo de Actividad</Text>
            <View style={styles.typeSelection}>
              {activityTypes.map(({ type, label, icon }) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeCard,
                    selectedType === type && styles.typeCardSelected
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <MaterialCommunityIcons 
                    name={icon as any} 
                    size={24} 
                    color={selectedType === type ? '#ffffff' : '#3b82f6'} 
                  />
                  <Text style={[
                    styles.typeLabel,
                    selectedType === type && styles.typeLabelSelected
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* SELECCIÓN DE TURBINA (SI EL TIPO ES 'TURBINE_WORK') */}
            {selectedType === 'TURBINE_WORK' && (
              <View style={styles.turbineSelection}>
                <Text style={styles.subtitle}>Selecciona Turbina</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.turbineScroll}
                >
                  {filteredTurbines.map(turbine => (
                    <TouchableOpacity
                      key={turbine.id}
                      style={[
                        styles.turbineCard,
                        selectedTurbine === turbine.id && styles.turbineCardSelected
                      ]}
                      onPress={() => setSelectedTurbine(turbine.id)}
                    >
                      <Ionicons 
                        name="cog" 
                        size={24} 
                        color={selectedTurbine === turbine.id ? '#ffffff' : '#f59e0b'} 
                      />
                      <Text style={[
                        styles.turbineName,
                        selectedTurbine === turbine.id && styles.turbineNameSelected
                      ]}>
                        {turbine.name}
                      </Text>
                      <Text style={[
                        styles.turbineStatus,
                        selectedTurbine === turbine.id && styles.turbineStatusSelected
                      ]}>
                        {turbine.status === 'COMPLETED' ? 'Completada' : 
                         turbine.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* OPCIÓN PARA AHORA O MÁS TARDE */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 12 }}>
              <TouchableOpacity
                style={[styles.timeOptionButton, isForNow && styles.timeOptionButtonSelected]}
                onPress={() => setIsForNow(true)}
              >
                <Ionicons name="flash" size={18} color={isForNow ? '#fff' : '#2563eb'} />
                <Text style={[styles.timeOptionText, isForNow && styles.timeOptionTextSelected]}>Para ahora</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timeOptionButton, !isForNow && styles.timeOptionButtonSelected]}
                onPress={() => setIsForNow(false)}
              >
                <Ionicons name="time-outline" size={18} color={!isForNow ? '#fff' : '#2563eb'} />
                <Text style={[styles.timeOptionText, !isForNow && styles.timeOptionTextSelected]}>Para más tarde</Text>
              </TouchableOpacity>
            </View>

            {/* CAMPO DE NOTAS */}
            <View style={styles.notesSection}>
              <Text style={styles.subtitle}>Notas (Opcional)</Text>
              <TextInput
                style={styles.notesInput}
                multiline
                placeholder="Describe los detalles de la actividad..."
                placeholderTextColor="#94a3b8"
                value={notes}
                onChangeText={setNotes}
              />
            </View>            
            
            {/* BOTÓN PARA INICIAR ACTIVIDAD */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSubmit}
            >
              <Text style={styles.actionButtonText}>
                {selectedType === 'TURBINE_WORK' && selectedTurbine 
                  ? `Iniciar en ${mockTurbines.find(t => t.id === selectedTurbine)?.name}`
                  : 'Iniciar Actividad'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    paddingRight: 10,
    paddingTop: 10,
    marginBottom: 5,
  },
  closeButton: {
    padding: 10,
  },
  scrollView: {
    flex: 1,
  },  scrollContentContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 20,
    marginTop: 5,
    textAlign: 'center',
  },
  currentTimeDisplay: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 25,
    marginTop: 5,
    textAlign: 'center',
  },  subtitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 15,
  },  typeSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 90,
    marginBottom: 12,
  },
  typeCardSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  typeLabel: {
    color: '#1e3a8a',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 13,
  },
  typeLabelSelected: {
    color: '#ffffff',
  },  turbineSelection: {
    marginBottom: 25,
  },
  turbineScroll: {
    gap: 12,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  turbineCard: {
    width: 120,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 100,
  },
  turbineCardSelected: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
  },
  turbineName: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  turbineNameSelected: {
    color: '#ffffff',
  },
  turbineStatus: {
    color: '#64748b',
    fontSize: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  turbineStatusSelected: {
    color: '#ffffff',
    opacity: 0.85,
  },  notesSection: {
    marginBottom: 30,
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#1e3a8a',
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 10,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  timeOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    backgroundColor: '#fff',
  },
  timeOptionButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  timeOptionText: {
    marginLeft: 6,
    color: '#2563eb',
    fontWeight: '600',
  },
  timeOptionTextSelected: {
    color: '#fff',
  },
});

export default QuickRegisterActivityForm;
