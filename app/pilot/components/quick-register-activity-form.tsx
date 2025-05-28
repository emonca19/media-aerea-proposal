import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming, // Removed withSpring
} from 'react-native-reanimated';

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

// Interfaz para las actividades programadas
interface ScheduledActivity {
  id: string;
  type: ActivityType;
  turbineId?: string;
  notes: string;
  scheduledTime: Date; // Mantenemos por compatibilidad, pero ya no se mostrará
}

interface QuickRegisterActivityFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (activityData: any) => void;
}

// Componente para elementos arrastrables
interface DraggableActivityItemProps {
  activity: ScheduledActivity;
  index: number;
  onRemove: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  totalItems: number;
}

const DraggableActivityItem: React.FC<DraggableActivityItemProps> = ({
  activity,
  index,
  onRemove,
  onMove,
  totalItems,
}) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      scale.value = withTiming(1.03, { duration: 150 }); // Softer scale
      opacity.value = withTiming(0.95, { duration: 150 }); // Softer opacity
    },
    onActive: (event) => {
      translateY.value = event.translationY;
    },
    onEnd: (event) => {
      const ITEM_HEIGHT = 80; // Estimación de la altura del item
      const currentPosition = index * ITEM_HEIGHT + event.translationY;
      let newIndex = Math.round(currentPosition / ITEM_HEIGHT);

      // Asegurar que el nuevo índice esté dentro de los límites
      newIndex = Math.max(0, Math.min(newIndex, totalItems - 1));
      
      if (index !== newIndex) {
        runOnJS(onMove)(index, newIndex);
      }
      
      translateY.value = withTiming(0, { duration: 150 }); // Changed to withTiming
      scale.value = withTiming(1, { duration: 150 }); // Changed to withTiming
      opacity.value = withTiming(1, { duration: 150 }); // Changed to withTiming
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const activityTypeInfo = activityTypes.find(act => act.type === activity.type);
  const turbineInfo = activity.turbineId ? mockTurbines.find(t => t.id === activity.turbineId) : undefined;

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.scheduledActivityItem, animatedStyle]}>
        {/* Indicador de orden numérico */}
        <View style={styles.orderIndicator}>
          <Text style={styles.orderNumber}>{index + 1}</Text>
        </View>
        
        {/* Icono de drag handle */}
        <View style={styles.dragHandle}>
          <MaterialCommunityIcons name="drag-vertical" size={20} color="#94a3b8" />
        </View>
        
        <View style={styles.scheduledActivityContent}>
          <View style={styles.scheduledActivityHeader}>
            <MaterialCommunityIcons 
              name={(activityTypeInfo?.icon as any) || 'calendar-clock'} 
              size={18} 
              color="#3b82f6"
            />
            <Text style={styles.scheduledActivityTitle}>
              {activityTypeInfo?.label || 'Actividad'}
              {turbineInfo && <Text style={styles.scheduledActivityAsset}> • {turbineInfo.name}</Text>}
            </Text>
          </View>
        </View>
        
        {/* Botón para eliminar */}
        <TouchableOpacity 
          style={styles.removeActivityButton}
          onPress={() => onRemove(activity.id)}
          accessibilityLabel="Eliminar actividad programada"
        >
          <Ionicons name="close-circle" size={22} color="#ef4444" />
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const QuickRegisterActivityForm: React.FC<QuickRegisterActivityFormProps> = ({ 
  isVisible, 
  onClose, 
  onSubmit 
}) => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [selectedTurbine, setSelectedTurbine] = useState<string>('');
  const [notes, setNotes] = useState('');  const [currentTime, setCurrentTime] = useState(new Date());
  const [isForNow, setIsForNow] = useState(true);
  // Estados para manejar actividades programadas
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([]);
  
  // Actualiza el tiempo actual cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);  // Resetea el formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isVisible) {
      setSelectedType(null);
      setSelectedTurbine('');
      setNotes('');
      setIsForNow(true);
      setScheduledActivities([]);
    }
  }, [isVisible]);

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
    // Función para añadir actividad a la lista programada
  const handleAddToScheduledList = () => {
    if (!selectedType) {
      Alert.alert('Error', 'Selecciona un tipo de actividad');
      return;
    }
    
    // Si el tipo es TURBINE_WORK y no se ha seleccionado turbina
    if (selectedType === 'TURBINE_WORK' && !selectedTurbine) {
      Alert.alert('Error', 'Selecciona una turbina para esta actividad');
      return;
    }

    const newActivity: ScheduledActivity = {
      id: Date.now().toString(),
      type: selectedType,
      notes: '',
      scheduledTime: new Date(),
      ...(selectedType === 'TURBINE_WORK' ? { turbineId: selectedTurbine } : {}),
    };

    setScheduledActivities([...scheduledActivities, newActivity]);
    
    // Reset form fields
    setSelectedType(null);
    setSelectedTurbine('');
  };  // Función para eliminar una actividad de la lista programada
  const handleRemoveScheduledActivity = (id: string) => {
    setScheduledActivities(scheduledActivities.filter(activity => activity.id !== id));
  };
  
  // Función para reordenar actividades con drag-and-drop
  const moveActivity = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newActivities = [...scheduledActivities];
    const [movedItem] = newActivities.splice(fromIndex, 1);
    newActivities.splice(toIndex, 0, movedItem);
    setScheduledActivities(newActivities);
  };
    // Esta validación se realiza directamente en handleSubmit
    // Ya no necesitamos esta función porque renderizamos directamente en el JSX
  const handleSubmit = () => {
    // Si hay actividades programadas, enviarlas todas
    if (!isForNow && scheduledActivities.length > 0) {
      // Crear una hora base para hoy
      const baseTime = new Date();
      baseTime.setHours(baseTime.getHours() + 1); // Empieza 1 hora después
      
      // Asignar una hora incremental a cada actividad en el orden actual (para mantener la secuencia)
      const activitiesData = scheduledActivities.map((act, index) => {
        const scheduledTime = new Date(baseTime);
        scheduledTime.setMinutes(scheduledTime.getMinutes() + (index * 30)); // Cada 30 minutos
        
        return {
          type: act.type,
          turbineId: act.turbineId,
          notes: act.notes,
          isForNow: false,
          scheduledTime: scheduledTime,
        };
      });
      
      onSubmit({
        isMultiple: true,
        activities: activitiesData
      });
      onClose();
      return;
    }
    
    // Para actividad inmediata o si no hay actividades programadas
    if (isForNow) {
      if (!selectedType) {
        Alert.alert("Error", "Selecciona un tipo de actividad");
        return;
      }
      if (selectedType === 'TURBINE_WORK' && !selectedTurbine) {
        Alert.alert("Error", "Selecciona una turbina");
        return;
      }
      
      // Validación especial para trabajo en turbina - requiere checklist prevuelo
      if (selectedType === 'TURBINE_WORK' && selectedTurbine && isForNow) {
        Alert.alert(
          "Checklist Prevuelo Requerido",
          "Para trabajar en una turbina, primero debes completar el checklist de prevuelo. ¿Deseas ir al checklist ahora?",
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Ir al Checklist',
              onPress: () => {
                onClose(); // Cerrar este modal primero
                // Navegación al checklist de prevuelo con el ID de la turbina
                router.push(`/pilot/preflight-checklist?turbineId=${selectedTurbine}`);
              }
            }
          ]
        );
        return;
      }
      
      const activityData = {
        type: selectedType,
        turbineId: selectedType === 'TURBINE_WORK' ? selectedTurbine : undefined,
        notes: notes,
        isForNow: true,
        startTime: new Date(),
      };
      onSubmit(activityData);
      onClose();
    } else {
      // Si es "para después" pero no hay actividades programadas
      Alert.alert("Sin Actividades", "Añade al menos una actividad a la lista o cambia a 'Para ahora'.");
    }
  };

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
                <Ionicons name="close" size={36} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.headerTitle}>Registrar Actividad</Text>
            
            <Text style={styles.currentTimeDisplay}>
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' - '}
              {formatTime(currentTime)}
            </Text>
            
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

            {selectedType === 'TURBINE_WORK' && (
              <View style={styles.turbineSelection}>
                <Text style={styles.subtitle}>Selecciona Turbina</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.turbineScroll}
                >                  {mockTurbines.map(turbine => (
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
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 12 }}>
              <TouchableOpacity
                style={[styles.timeOptionButton, isForNow && styles.timeOptionButtonSelected]}
                onPress={() => setIsForNow(true)}
              >
                <Ionicons name="flash" size={18} color={isForNow ? '#fff' : '#2563eb'} />
                <Text style={[styles.timeOptionText, isForNow && styles.timeOptionTextSelected]}>Para ahora</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timeOptionButton, !isForNow && styles.timeOptionButtonLater]}
                onPress={() => setIsForNow(false)}
              >
                <Ionicons name="time-outline" size={18} color={!isForNow ? '#fff' : '#f59e0b'} />
                <Text style={[styles.timeOptionText, !isForNow && styles.timeOptionTextSelected]}>Para más tarde</Text>
              </TouchableOpacity>
            </View>
            {isForNow && (
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
            )}
            {!isForNow && (
              <View style={styles.addButtonContainer}>
                <TouchableOpacity 
                  style={[
                    styles.addToListButton,
                    !selectedType && {opacity: 0.7}
                  ]}
                  onPress={handleAddToScheduledList}
                  disabled={!selectedType}
                >
                  <View style={styles.addButtonContent}>
                    <View style={styles.addButtonIconContainer}>
                      <Ionicons name="add" size={24} color="#fff" />
                    </View>
                    <Text style={styles.addToListButtonText}>
                      Añadir a Lista
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
            {!isForNow && scheduledActivities.length > 0 && (
              <View style={styles.scheduledListContainer}>
                <Text style={styles.subtitle}>Actividades Programadas ({scheduledActivities.length})</Text>
                <Text style={styles.dragInstructions}>Arrastra los elementos para reordenar</Text>
                <GestureHandlerRootView style={styles.scheduledList}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {scheduledActivities.map((activity, index) => {
                      if (!activity || !activity.type) return null;
                      
                      return (
                        <DraggableActivityItem
                          key={activity.id}
                          activity={activity}
                          index={index}
                          onRemove={handleRemoveScheduledActivity}
                          onMove={moveActivity}
                          totalItems={scheduledActivities.length}
                        />
                      );
                    })}
                  </ScrollView>
                </GestureHandlerRootView>
              </View>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSubmit}
            >
              <Text style={styles.actionButtonText}>
                {isForNow 
                  ? (selectedType === 'TURBINE_WORK' && selectedTurbine 
                      ? `Iniciar en ${mockTurbines.find(t => t.id === selectedTurbine)?.name}` 
                      : 'Iniciar Actividad')
                  : (scheduledActivities.length > 0 
                      ? `Guardar ${scheduledActivities.length} Actividades` 
                      : 'Programar Actividad')
                }
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
    marginBottom: 0,
  },
  closeButton: {
    padding: 12, // Increased padding for consistency
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
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 10, // Reducido de 20 a 10
    marginTop: 5,
    textAlign: 'center',
  },
  currentTimeDisplay: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 15, // Reducido de 25 a 15
    marginTop: 0, // Reducido de 5 a 0
    textAlign: 'center',
  },  
  subtitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8, // Reducido de 12 a 8
    marginTop: 8, // Reducido de 12 a 8
  },  typeSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15, // Reducido de 20 a 15
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12, // Reducido de 16 a 12
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6, // Reducido de 8 a 6
    minHeight: 80, // Reducido de 90 a 80
    marginBottom: 10, // Reducido de 12 a 10
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
  },    turbineSelection: {
    marginBottom: 15, // Reducido de 20 a 15
  },
  turbineScroll: {
    gap: 10, // Reducido de 12 a 10
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  turbineCard: {
    width: 110, // Reducido de 120 a 110
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 10, // Reducido de 12 a 10
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6, // Reducido de 8 a 6
    minHeight: 90, // Reducido de 100 a 90
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
  },    notesSection: {
    marginBottom: 15, // Reducido de 25 a 15
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12, // Reducido de 16 a 12
    minHeight: 80, // Reducido de 100 a 80
    textAlignVertical: 'top',
    color: '#1e3a8a',
    fontSize: 14,
  },
  // Sección de tiempo programado
  scheduledTimeSection: {
    marginVertical: 10,
  },
  timeButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeAdjustButton: {
    width: 36,
    height: 36,
    backgroundColor: '#dbeafe',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  timeSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  timeSelectorText: {
    marginLeft: 8,
    color: '#1e3a8a',
    fontSize: 15,
    fontWeight: '500',
  },  // Botón para añadir a lista - Rediseñado
  addButtonContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  addToListButton: {
    backgroundColor: '#10b981', // Changed from orange to green
    borderRadius: 12,          // Changed from 25 to 12
    paddingVertical: 12,       // Changed from 14
    paddingHorizontal: 24,     // Changed from 28
    marginTop: 0,              // Was 8
    marginBottom: 0,           // Was 12
    shadowColor: '#059669',    // Changed shadow to darker green
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    // width: '85%', // REMOVED
    // minHeight: 56, // REMOVED
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonIconContainer: {
    marginRight: 8, // Adjusted from 10
  },
  addToListButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    // letterSpacing: 0.2, // REMOVED
  },  scheduledListContainer: {
    marginTop: 2, // Reducido de 5 a 2
    marginBottom: 15, // Reducido de 25 a 15
  },
  dragInstructions: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  scheduledList: {
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    padding: 8, // Reducido de 10 a 8
  },  scheduledActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 70,
  },
  dragHandle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  scheduledActivityContent: {
    flex: 1,
    marginRight: 10,
  },scheduledActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2, // Reducido de 4 a 2
  },
  scheduledActivityTitle: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6, // Reducido de 8 a 6
  },
  scheduledActivityTime: {
    color: '#64748b',
    fontSize: 12,
    marginLeft: 24, // Reducido de 26 a 24
  },
  scheduledActivityAsset: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '500',
  },  scheduledActivityNotes: {
    color: '#64748b',
    fontSize: 11,
    fontStyle: 'italic',
  },
  removeActivityButton: {
    padding: 5,
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
    marginTop: 15,
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
  },  timeOptionButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  timeOptionButtonLater: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  timeOptionText: {
    marginLeft: 6,
    color: '#2563eb',
    fontWeight: '600',
  },
  timeOptionTextSelected: {
    color: '#fff',
  },
  // Indicador de orden numérico
  orderIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  orderNumber: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default QuickRegisterActivityForm;
