// app/pilot/new-activity-screen.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Asumiendo que este archivo existe y exporta 'styles' con 'form_switchContainer'
import { styles as globalFormStyles } from './pilot-dashboard-styles';

// Datos simulados para los assets (turbinas, drones, sitios)
// Más similar en estructura a mockTurbines de ActivityLogScreen para consistencia visual
const mockAssetsData = [
  { id: 'TURBINE_001', name: 'WTG-001', status: 'OPERATIONAL', type: 'TURBINE' },
  { id: 'TURBINE_002', name: 'WTG-002', status: 'STANDBY', type: 'TURBINE' },
  { id: 'TURBINE_003', name: 'WTG-003', status: 'MAINTENANCE_PLANNED', type: 'TURBINE' }, // Será filtrado
  { id: 'DRONE_M300_01', name: 'DJI M300 #1', status: 'READY', type: 'DRONE'},
  { id: 'SITE_ALPHA', name: 'Sitio Alpha', status: 'ACCESSIBLE', type: 'SITE'},
  { id: 'TURBINE_004', name: 'WTG-004', status: 'OFFLINE', type: 'TURBINE' }, // Será filtrado
];
// Filtramos los assets que no están disponibles
const availableAssets = mockAssetsData.filter(
  asset => asset.status !== 'MAINTENANCE_PLANNED' && asset.status !== 'OFFLINE'
);

export interface ActivityFormData {
  type: string;
  customName: string;
  notes: string;
  isForNow: boolean;
  pendingTime: string; // ISO date string
  assetId?: string; // Renombrado de turbineId a assetId para generalizar
}

// Interfaz para actividades programadas
interface ScheduledActivity {
  id: string;
  type: string;
  customName: string;
  notes: string;
  pendingTime: Date;
  assetId?: string;
}

// Ya no necesitamos NewActivityScreenProps si onSubmit se maneja internamente
// interface NewActivityScreenProps {
//   onSubmit: (activityData: ActivityFormData) => void;
// }

interface QuickActivityTypeWithIcon {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  requiresAsset?: boolean; // Indica si la actividad necesita seleccionar un asset
}

// Tipos de actividad con sus iconos y si requieren un asset
const quickActivityTypes: QuickActivityTypeWithIcon[] = [
  { id: 'ACT_MOVILIZACION', label: 'Movilización (hotel ↔ parque)', icon: 'truck-fast-outline' },
  { id: 'ACT_TRASLADO_ASSET', label: 'Traslado entre Turbinas', icon: 'map-marker-path', requiresAsset: true },
  { id: 'ACT_TRABAJO_ASSET', label: 'Trabajo en Equipo', icon: 'tools', requiresAsset: true }, // Icono genérico para "tools" o "cog"
  { id: 'ACT_TRABAJO_TURBINA', label: 'Trabajo en Turbina', icon: 'wind-turbine', requiresAsset: true },
  { id: 'ACT_TIEMPO_COMIDA', label: 'Tiempo de Comida', icon: 'food-fork-drink' },
  { id: 'ACT_TIEMPO_MUERTO', label: 'Tiempo Muerto', icon: 'weather-pouring' },
  { id: 'ACT_OTRO', label: 'Otro (Personalizado)', icon: 'dots-horizontal-circle-outline'},
];

export default function NewActivityScreen() { // Props removidas por ahora
  const router = useRouter();
  const initialActivityTypeId = quickActivityTypes[0]?.id || '';

  // --- State ---
  const [activityTypeId, setActivityTypeId] = useState<string>(initialActivityTypeId);
  const [customActivityNameInput, setCustomActivityNameInput] = useState('');
  const [activityNotes, setActivityNotes] = useState('');
  const [isForNow, setIsForNow] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [dateForLater, setDateForLater] = useState(new Date());
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [dateTimePickerMode, setDateTimePickerMode] = useState<'date' | 'time'>('date');
  const [currentTimeString, setCurrentTimeString] = useState('');
  // Lista de actividades programadas
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([]);

  const selectedActivityInfo = quickActivityTypes.find(act => act.id === activityTypeId);
  // Determina si la actividad seleccionada requiere la selección de un asset
  const requiresAssetSelection = selectedActivityInfo?.requiresAsset || false;

  // --- Effects ---
  useEffect(() => {
    const updateTime = () => {
        const now = new Date();
        const datePart = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        const timePart = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setCurrentTimeString(`${datePart} - ${timePart}`);
    };
    updateTime();
    const timerId = setInterval(updateTime, 60000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    setActivityTypeId(initialActivityTypeId); // Reset al tipo inicial
    const initialDate = new Date();
    initialDate.setHours(initialDate.getHours() + 1);
    initialDate.setMinutes(0);
    setDateForLater(initialDate);
  }, [initialActivityTypeId]);

  useEffect(() => {
    // Si la actividad no requiere un asset, deseleccionar el asset
    if (!requiresAssetSelection) {
        setSelectedAssetId('');
    }
    // Si el tipo de actividad no es "Otro", limpiar el nombre personalizado
    if (activityTypeId !== 'ACT_OTRO') {
        setCustomActivityNameInput('');
    }
  }, [activityTypeId, requiresAssetSelection]);

  // --- DateTimePicker Handlers ---
  const onChangeTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || dateForLater;
    if (Platform.OS === 'android') {
        setShowDateTimePicker(false);
    }
    if (event.type === 'set') {
      setDateForLater(currentDate);
      if (Platform.OS === 'android' && dateTimePickerMode === 'date') {
        setDateTimePickerMode('time');
        setShowDateTimePicker(true);
      }
    } else if (event.type === 'dismissed') {
      setShowDateTimePicker(false);
    }
  };

  const showMode = (currentMode: 'date' | 'time') => {
    setDateTimePickerMode(currentMode);
    setShowDateTimePicker(true);
  };

  // --- Handle Add Scheduled Activity ---
  const handleAddScheduledActivity = () => {
    if (!activityTypeId) {
      Alert.alert("Entrada Requerida", "Selecciona un tipo de actividad.");
      return;
    }
    
    if (requiresAssetSelection && !selectedAssetId) {
      const assetTypeName = selectedActivityInfo?.label.includes("Turbina") ? "Turbina" : "Equipo/Sitio";
      Alert.alert("Entrada Requerida", `Selecciona un ${assetTypeName} para esta actividad.`);
      return;
    }

    let finalActivityName = selectedActivityInfo?.label || "Actividad";
    if (activityTypeId === 'ACT_OTRO') {
      finalActivityName = customActivityNameInput.trim();
      if (!finalActivityName) {
        Alert.alert("Entrada Requerida", "Ingresa un nombre para la actividad personalizada.");
        return;
      }
    }

    // Validación especial para trabajo en turbina
    if (activityTypeId === 'ACT_TRABAJO_TURBINA' && selectedAssetId) {
      Alert.alert(
        "Checklist Prevuelo Requerido",
        "Para trabajar en una turbina, se requerirá un checklist de prevuelo antes de iniciar esta actividad."
      );
    }

    // Crear la nueva actividad programada
    const newScheduledActivity: ScheduledActivity = {
      id: Date.now().toString(), // ID único usando timestamp
      type: activityTypeId,
      customName: finalActivityName,
      notes: activityNotes.trim(),
      pendingTime: new Date(dateForLater),
      assetId: requiresAssetSelection ? selectedAssetId : undefined,
    };

    // Añadir a la lista de actividades programadas
    setScheduledActivities([...scheduledActivities, newScheduledActivity]);

    // Limpiar campos después de añadir
    if (activityTypeId === 'ACT_OTRO') {
      setCustomActivityNameInput('');
    }
    setActivityNotes('');
    
    // Feedback al usuario
    Alert.alert("Actividad Agregada", `"${finalActivityName}" añadida a tu lista de programación.`);
  };

  // --- Handle Remove Scheduled Activity ---
  const handleRemoveScheduledActivity = (id: string) => {
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que quieres eliminar esta actividad programada?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: () => {
            setScheduledActivities(scheduledActivities.filter(activity => activity.id !== id));
          }
        }
      ]
    );
  };

  // --- Submit Handler ---
  const handleSubmit = () => {
    // Si hay actividades programadas, guardarlas y regresar
    if (scheduledActivities.length > 0) {
      // Aquí iría el código para guardar todas las actividades programadas en la API
      console.log('Submitting Scheduled Activities:', scheduledActivities);
      Alert.alert('Actividades Programadas', `Se han registrado ${scheduledActivities.length} actividades.`);

      if (router.canGoBack()) {
        router.back();
      } else {
        console.log("No se puede regresar, actividades enviadas desde contexto raíz o similar.");
      }
      return;
    }

    // Si no hay actividades programadas y es "para ahora", crear y enviar una actividad inmediata
    if (isForNow) {
      if (!activityTypeId) {
        Alert.alert("Entrada Requerida", "Selecciona un tipo de actividad.");
        return;
      }
      
      if (requiresAssetSelection && !selectedAssetId) {
        const assetTypeName = selectedActivityInfo?.label.includes("Turbina") ? "Turbina" : "Equipo/Sitio";
        Alert.alert("Entrada Requerida", `Selecciona un ${assetTypeName} para esta actividad.`);
        return;
      }

      let finalActivityName = selectedActivityInfo?.label || "Actividad";
      if (activityTypeId === 'ACT_OTRO') {
        finalActivityName = customActivityNameInput.trim();
        if (!finalActivityName) {
          Alert.alert("Entrada Requerida", "Ingresa un nombre para la actividad personalizada.");
          return;
        }
      }

      // Validación especial para trabajo en turbina - requiere checklist prevuelo
      if (activityTypeId === 'ACT_TRABAJO_TURBINA' && selectedAssetId && isForNow) {
        Alert.alert(
          "Checklist Prevuelo Requerido",
          "Para trabajar en una turbina, primero debes completar el checklist de prevuelo. ¿Deseas ir al checklist ahora?",
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Ir al Checklist', 
              onPress: () => {
                if (router.canGoBack()) {
                  router.back();
                }
                router.push(`/pilot/preflight-checklist?turbineId=${selectedAssetId}`);
              }
            }
          ]
        );
        return;
      }

      const pendingTimeString = new Date().toISOString();
      const activityData: ActivityFormData = {
        type: activityTypeId,
        customName: finalActivityName,
        notes: activityNotes.trim(),
        isForNow: true,
        pendingTime: pendingTimeString,
        assetId: requiresAssetSelection ? selectedAssetId : undefined,
      };

      console.log('Submitting Immediate Activity:', activityData);
      Alert.alert('Actividad Registrada', `Actividad "${finalActivityName}" guardada.`);

      if (router.canGoBack()) {
        router.back();
      } else {
        console.log("No se puede regresar, actividad enviada desde contexto raíz o similar.");
      }
    } else {
      // Si es "para después" pero no hay actividades programadas, mostrar mensaje
      Alert.alert("Sin Actividades", "Añade al menos una actividad programada o cambia a 'Iniciar ahora'.");
    }
  };

  // --- Render Scheduled Activity Item ---
  const renderScheduledActivityItem = ({ item }: { item: ScheduledActivity }) => {
    const activityTypeInfo = quickActivityTypes.find(type => type.id === item.type);
    const associatedAsset = item.assetId ? availableAssets.find(asset => asset.id === item.assetId) : undefined;
      return (
      <View style={styles.scheduledActivityItem}>
        <View style={styles.scheduledActivityContent}>
          <View style={styles.scheduledActivityHeader}>
            <MaterialCommunityIcons 
              name={activityTypeInfo?.icon || 'calendar-clock'} 
              size={18} 
              color="#4f46e5"
            />
            <Text style={styles.scheduledActivityTitle}>{item.customName}</Text>
          </View>
          
          <Text style={styles.scheduledActivityTime}>
            {item.pendingTime.toLocaleDateString('es-ES')} - {item.pendingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          
          {associatedAsset && (
            <Text style={styles.scheduledActivityAsset}>
              En: {associatedAsset.name}
            </Text>
          )}
          
          {item.notes && (
            <Text style={styles.scheduledActivityNotes} numberOfLines={1} ellipsizeMode="tail">
              {item.notes}
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.removeActivityButton}
          onPress={() => handleRemoveScheduledActivity(item.id)}
          accessibilityLabel="Eliminar actividad programada"
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="delete-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={styles.screenContainer}>
      <Stack.Screen
        options={{
          title: 'Registrar Nueva Actividad',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#1e3a8a',
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.currentTime}>{currentTimeString}</Text>

        <Text style={styles.subtitle}>Tipo de Actividad</Text>
        <View style={styles.typeSelection}>
            {quickActivityTypes.map((type) => (
            <TouchableOpacity
                key={type.id}
                style={[styles.typeCard, activityTypeId === type.id && styles.typeCardSelected]}
                onPress={() => setActivityTypeId(type.id)}
            >
                <MaterialCommunityIcons name={type.icon} size={24} color={activityTypeId === type.id ? '#fff' : '#4f46e5'} />
                <Text style={[styles.typeLabel, activityTypeId === type.id && styles.typeLabelSelected]}>{type.label}</Text>
            </TouchableOpacity>
            ))}
        </View>


        {requiresAssetSelection && (
            <View style={styles.assetSelection}>
                <Text style={styles.subtitle}>
                  {selectedActivityInfo?.label.includes("Turbina") ? "Selecciona Turbina" : "Selecciona Equipo/Sitio"}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.assetScroll}>
                    {availableAssets.map(asset => {
                      let assetIcon: keyof typeof Ionicons.glyphMap = "cog-outline";
                      if (asset.type === 'TURBINE') assetIcon = "nuclear-outline";
                      else if (asset.type === 'DRONE') assetIcon = "airplane-outline";
                      else if (asset.type === 'SITE') assetIcon = "map-outline";

                      return (
                        <TouchableOpacity
                            key={asset.id}
                            style={[styles.assetCard, selectedAssetId === asset.id && styles.assetCardSelected]}
                            onPress={() => setSelectedAssetId(asset.id)}
                        >
                            <Ionicons name={assetIcon} size={24} color={selectedAssetId === asset.id ? '#fff' : '#8b5cf6'} />
                            <Text style={[styles.assetName, selectedAssetId === asset.id && styles.assetNameSelected]}>{asset.name}</Text>
                            <Text style={[styles.assetStatus, selectedAssetId === asset.id && styles.assetStatusSelected]}>
                              {asset.status.replace('_', ' ').toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>
            </View>        )}

        {activityTypeId === 'ACT_OTRO' && (
            <>
              <Text style={styles.subtitleCompact}>Nombre Actividad Personalizada</Text>
              <TextInput
                  style={styles.notesInput}
                  placeholder="Ej: Calibración de GPS, Reunión Cliente"
                  value={customActivityNameInput}
                  onChangeText={setCustomActivityNameInput}
                  placeholderTextColor="#94a3b8"
              />
            </>
        )}

        <Text style={styles.subtitleCompact}>Notas Adicionales (Opcional)</Text>
        <TextInput
            style={styles.notesInput}
            placeholder="Detalles relevantes sobre la actividad..."
            value={activityNotes}
            onChangeText={setActivityNotes}
            multiline={true}
            numberOfLines={3}
            placeholderTextColor="#94a3b8"
        />

        {/* PROGRAMACIÓN DE TIEMPO */}
        <View style={globalFormStyles.form_switchContainer}>
            <Text style={styles.subtitleSwitchLabel}>¿Iniciar ahora?</Text>
            <Switch
                trackColor={{ false: "#9ca3af", true: "#4f46e5" }}
                thumbColor={isForNow ? "#ffffff" : "#f9fafb"}
                ios_backgroundColor="#d1d5db"
                onValueChange={setIsForNow}
                value={isForNow}
            />
        </View>

        {!isForNow && (
            <View style={styles.datePickerContainer}>
                <Text style={styles.subtitleCompact}>Programar para:</Text>
                <View style={styles.dateDisplayRow}>
                    <TouchableOpacity onPress={() => showMode('date')} style={styles.datePickerButton}>
                        <Ionicons name="calendar-outline" size={20} color="#8b5cf6" />
                        <Text style={styles.datePickerButtonText}>Fecha: {dateForLater.toLocaleDateString('es-ES')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => showMode('time')} style={styles.datePickerButton}>
                        <Ionicons name="time-outline" size={20} color="#8b5cf6" />
                        <Text style={styles.datePickerButtonText}>Hora: {dateForLater.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </TouchableOpacity>
                </View>
                {showDateTimePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={dateForLater}
                        mode={dateTimePickerMode}
                        is24Hour={true}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onChangeTime}
                        minimumDate={new Date()} // No se puede programar para el pasado
                    />
                )}

                <TouchableOpacity 
                    style={styles.addToListButton} 
                    onPress={handleAddScheduledActivity}
                >
                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                    <Text style={styles.addToListButtonText}>Añadir a Lista</Text>
                </TouchableOpacity>
            </View>
        )}


        {/* LISTA DE ACTIVIDADES PROGRAMADAS */}
        {!isForNow && scheduledActivities.length > 0 && (
            <View style={styles.scheduledActivitiesContainer}>
                <Text style={styles.subtitleCompact}>Actividades Programadas ({scheduledActivities.length})</Text>
                <FlatList
                    data={scheduledActivities}
                    renderItem={renderScheduledActivityItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false} // No scroll dentro de otro scroll
                    contentContainerStyle={styles.scheduledActivitiesList}
                    ItemSeparatorComponent={() => <View style={styles.activitySeparator} />}
                />
            </View>
        )}
        {/* FIN DE LISTA DE ACTIVIDADES PROGRAMADAS */}


        {/* BOTÓN DE ACCIÓN */}
        {isForNow && (
          <TouchableOpacity style={styles.actionButton} onPress={handleSubmit}>
            <Text style={styles.actionButtonText}>
              {requiresAssetSelection && selectedAssetId && availableAssets.find(t => t.id === selectedAssetId)
                ? `Iniciar en ${availableAssets.find(t => t.id === selectedAssetId)?.name}`
                : 'Iniciar Actividad Ahora'}
            </Text>
          </TouchableOpacity>
        )}

        {!isForNow && scheduledActivities.length > 0 && (
          <TouchableOpacity style={styles.actionButton} onPress={handleSubmit}>
            <Text style={styles.actionButtonText}>
              {`Guardar ${scheduledActivities.length} Actividades`}
            </Text>
          </TouchableOpacity>
        )}
        {/* FIN DE BOTÓN DE ACCIÓN */}

      </ScrollView>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9', // Fondo más cálido y contrastante
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 60,
  },
  currentTime: {
    color: '#475569', // Color más oscuro para mejor visibilidad
    fontSize: 14, // Tamaño ligeramente mayor
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500', // Peso de fuente medio para mejor legibilidad
  },
  subtitle: {
    color: '#1e293b', // Color más oscuro y contrastante
    fontSize: 16, // Tamaño más grande para mejor jerarquía visual
    fontWeight: '700', // Peso más fuerte
    marginBottom: 8,
    marginTop: 12,
  },
  subtitleCompact: {
    color: '#1e293b', // Color más oscuro
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  subtitleSwitchLabel: {
    color: '#1e293b', // Color más oscuro para mejor contraste
    fontSize: 16,
    fontWeight: '700',
  },
  typeSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 2, // Borde más grueso para mejor definición
    borderColor: '#cbd5e1', // Color de borde más visible
    borderRadius: 12, // Esquinas más redondeadas
    padding: 14, // Padding ligeramente aumentado
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1e293b', // Sombra más oscura
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, // Sombra más visible
    shadowRadius: 6,
    elevation: 3,
    minHeight: 85,
    marginBottom: 10,
  },
  typeCardSelected: {
    backgroundColor: '#4f46e5', // Color más vibrante
    borderColor: '#3730a3', // Borde más oscuro para selección
    shadowColor: '#4f46e5',
    shadowOpacity: 0.4,
    elevation: 6,
    transform: [{ scale: 1.02 }], // Efecto de "crecimiento" al seleccionar
  },
  typeLabel: {
    color: '#374151', // Color más oscuro para mejor contraste
    fontWeight: '600', // Peso más fuerte
    textAlign: 'center',
    fontSize: 12,
  },
  typeLabelSelected: {
    color: '#ffffff',
    fontWeight: '700', // Peso más fuerte para selección
  },  assetSelection: {
    marginBottom: 12,
  },
  assetScroll: {
    paddingHorizontal: 4, // Aumentado para mejor visibilidad de sombras
    paddingVertical: 8,
    gap: 12,
  },
  assetCard: {
    width: 115, // Ligeramente más ancho
    backgroundColor: '#ffffff',
    borderWidth: 2, // Borde más grueso
    borderColor: '#d1d5db', // Color más visible
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#374151', // Sombra más oscura
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, // Sombra más visible
    shadowRadius: 4,
    elevation: 3,
    minHeight: 95,
  },
  assetCardSelected: {
    backgroundColor: '#4f46e5', // Color más vibrante
    borderColor: '#3730a3',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.4,
    elevation: 5,
    transform: [{ scale: 1.02 }], // Efecto de crecimiento
  },
  assetName: {
    color: '#374151', // Color más oscuro para mejor contraste
    fontWeight: '700', // Peso más fuerte
    fontSize: 13,
    textAlign: 'center',
  },
  assetNameSelected: {
    color: '#ffffff',
  },
  assetStatus: {
    color: '#6b7280', // Color más visible
    fontSize: 10, // Tamaño ligeramente mayor
    fontWeight: '600', // Peso más fuerte
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  assetStatusSelected: {
    color: '#ffffff',
    opacity: 0.9, // Menos transparencia
  },
  notesInput: {
    backgroundColor: '#ffffff', // Fondo blanco puro
    borderWidth: 2, // Borde más grueso
    borderColor: '#9ca3af', // Borde más visible
    borderRadius: 10,
    padding: 16,
    textAlignVertical: 'top',
    color: '#111827', // Texto más oscuro
    fontSize: 15, // Tamaño ligeramente mayor
    marginBottom: 14,
    minHeight: 75,
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },  datePickerContainer: {
    marginBottom: 12,
  },
  dateDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: Platform.OS === 'ios' ? 8 : 12,
  },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e7ff', // Fondo más contrastante
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#c7d2fe', // Borde más visible
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  datePickerButtonText: {
    marginLeft: 8,
    color: '#3730a3', // Color más oscuro y vibrante
    fontSize: 14,
    fontWeight: '600', // Peso más fuerte
  },
  // Botón de añadir a lista más compacto y atractivo
  addToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b', // Changed to yellow/orange
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: '#f59e0b', // Yellow shadow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#d97706', // Darker yellow border
    transform: [{ scale: 1 }],
  },
  addToListButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.5,
  },  // Estilos para la lista de actividades programadas
  scheduledActivitiesContainer: {
    marginBottom: 14,
    marginTop: 6,
  },
  scheduledActivitiesList: {
    backgroundColor: '#e2e8f0', // Fondo más contrastante
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  scheduledActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12, // Padding aumentado
    shadowColor: '#374151', // Sombra más oscura
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, // Sombra más visible
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6', // Borde sutil
  },
  scheduledActivityContent: {
    flex: 1,
  },
  scheduledActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  scheduledActivityTitle: {
    color: '#1e293b', // Color más oscuro y contrastante
    fontWeight: '700', // Peso más fuerte
    fontSize: 15, // Tamaño ligeramente mayor
    marginLeft: 10,
  },
  scheduledActivityTime: {
    color: '#475569', // Color más oscuro
    fontSize: 13, // Tamaño ligeramente mayor
    fontWeight: '500', // Peso medio
    marginLeft: 28,
  },
  scheduledActivityAsset: {
    color: '#dc2626', // Color rojo más vibrante
    fontSize: 13, // Tamaño ligeramente mayor
    fontWeight: '600', // Peso más fuerte
    marginLeft: 28,
    marginTop: 3,
  },
  scheduledActivityNotes: {
    color: '#6b7280', // Color más oscuro
    fontSize: 12, // Tamaño ligeramente mayor
    marginLeft: 28,
    marginTop: 3,
    fontStyle: 'italic',
  },
  deleteHint: {
    paddingLeft: 8,
    alignItems: 'center',
  },
  deleteHintText: {
    fontSize: 10,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  removeActivityButton: {
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activitySeparator: {
    height: 10, // Separación ligeramente mayor
  },
  actionButton: {
    backgroundColor: '#4f46e5', // Color más vibrante
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3730a3', // Sombra del mismo tono
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 18,
    borderWidth: 2,
    borderColor: '#3730a3', // Borde para mejor definición
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '700', // Peso más fuerte
    fontSize: 16,
  },
});

// No olvides crear o asegurar que './pilot-dashboard-styles.ts' existe y exporta 'styles'
// con la definición de 'form_switchContainer', por ejemplo:
/*
// app/pilot/pilot-dashboard-styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  form_switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16, // Ajusta según sea necesario
    marginTop: 8, // Para darle un poco de espacio si viene después de un input
    // paddingVertical: 10, // Opcional
  },
  // ... otros estilos globales que puedas necesitar
});
*/