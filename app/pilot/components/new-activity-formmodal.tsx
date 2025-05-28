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
              color="#3b82f6"
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
        >
          <Ionicons name="close-circle" size={22} color="#ef4444" />
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
                <MaterialCommunityIcons name={type.icon} size={24} color={activityTypeId === type.id ? '#fff' : '#3b82f6'} />
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
                            <Ionicons name={assetIcon} size={24} color={selectedAssetId === asset.id ? '#fff' : '#f59e0b'} />
                            <Text style={[styles.assetName, selectedAssetId === asset.id && styles.assetNameSelected]}>{asset.name}</Text>
                            <Text style={[styles.assetStatus, selectedAssetId === asset.id && styles.assetStatusSelected]}>
                              {asset.status.replace('_', ' ').toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>
            </View>
        )}


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
            numberOfLines={3} // Sugerencia de altura inicial
            placeholderTextColor="#94a3b8"
        />
        {/* FIN DE NOTAS ADICIONALES */}


        {/* PROGRAMACIÓN DE TIEMPO */}
        <View style={globalFormStyles.form_switchContainer}>
            <Text style={styles.subtitleSwitchLabel}>¿Iniciar ahora?</Text>
            <Switch
                trackColor={{ false: "#d1d5db", true: "#818cf8" }}
                thumbColor={isForNow ? "#4f46e5" : "#f1f5f9"}
                ios_backgroundColor="#e5e7eb"
                onValueChange={setIsForNow}
                value={isForNow}
            />
        </View>

        {!isForNow && (
            <View style={styles.datePickerContainer}>
                <Text style={styles.subtitleCompact}>Programar para:</Text>
                <View style={styles.dateDisplayRow}>
                    <TouchableOpacity onPress={() => showMode('date')} style={styles.datePickerButton}>
                        <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
                        <Text style={styles.datePickerButtonText}>Fecha: {dateForLater.toLocaleDateString('es-ES')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => showMode('time')} style={styles.datePickerButton}>
                        <Ionicons name="time-outline" size={20} color="#3b82f6" />
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

                {/* BOTÓN PARA AÑADIR ACTIVIDAD A LA LISTA */}
                <TouchableOpacity 
                    style={styles.addToListButton} 
                    onPress={handleAddScheduledActivity}
                >
                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                    <Text style={styles.addToListButtonText}>Añadir a Lista</Text>
                </TouchableOpacity>
            </View>
        )}
        {/* FIN DE PROGRAMACIÓN DE TIEMPO */}


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
        <TouchableOpacity style={styles.actionButton} onPress={handleSubmit}>
            <Text style={styles.actionButtonText}>
                {isForNow
                    ? (requiresAssetSelection && selectedAssetId && availableAssets.find(t => t.id === selectedAssetId)
                        ? `Iniciar en ${availableAssets.find(t => t.id === selectedAssetId)?.name}`
                        : 'Iniciar Actividad Ahora')
                    : (scheduledActivities.length > 0 
                        ? `Guardar ${scheduledActivities.length} Actividades` 
                        : 'Programar Actividad')
                }
            </Text>
        </TouchableOpacity>
        {/* FIN DE BOTÓN DE ACCIÓN */}

      </ScrollView>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16, // Reducido de 20 a 16
    paddingBottom: 60, // Reducido de 70 a 60
  },
  currentTime: {
    color: '#64748b',
    fontSize: 13, // Reducido de 14 a 13
    marginBottom: 12, // Reducido de 16 a 12
    textAlign: 'center',
  },
  subtitle: {
    color: '#374151',
    fontSize: 15, // Reducido de 16 a 15
    fontWeight: '600',
    marginBottom: 6, // Reducido de 10 a 6
    marginTop: 8, // Reducido de 10 a 8
  },
  subtitleCompact: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4, // Más compacto entre título y contenido
    marginTop: 8,
  },
  subtitleSwitchLabel: { // Estilo específico para el label del Switch para alinearlo
    color: '#374151',
    fontSize: 15, // Reducido de 16 a 15
    fontWeight: '600',
    // No necesita marginBottom si globalFormStyles.form_switchContainer ya lo maneja
  },
  typeSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Asegura que las tarjetas se distribuyan
    marginBottom: 10, // Reducido de 12 a 10
  },
  typeCard: {
    width: '48%', // Dos tarjetas por fila
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10, // Reducido de 12 a 10
    padding: 12, // Reducido de 16 a 12
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6, // Reducido de 8 a 6
    shadowColor: '#b0b8c3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Sombra sutil
    shadowRadius: 4,
    elevation: 2,
    minHeight: 80, // Reducido de 90 a 80
    marginBottom: 8, // Reducido de 10 a 8
  },
  typeCardSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.25, // Sombra más pronunciada al seleccionar
    elevation: 4,
  },
  typeLabel: {
    color: '#1e3a8a',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 12, // Reducido de 13 a 12
  },
  typeLabelSelected: {
    color: '#ffffff',
  },
  assetSelection: {
    marginBottom: 10, // Reducido de 12 a 10
  },
  assetScroll: {
    paddingHorizontal: 2, // Para que se vea la sombra de las tarjetas en los bordes
    paddingVertical: 6, // Reducido de 8 a 6
    gap: 10, // Reducido de 12 a 10
  },
  assetCard: {
    width: 110, // Reducido de 120 a 110
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10, // Reducido de 12 a 10
    padding: 10, // Reducido de 12 a 10
    alignItems: 'center',
    justifyContent: 'center', // Centrar contenido verticalmente
    gap: 6, // Reducido de 8 a 6
    shadowColor: '#b0b8c3',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 90, // Reducido de 100 a 90
  },
  assetCardSelected: {
    backgroundColor: '#f59e0b', // Color de selección para assets
    borderColor: '#d97706',
    shadowColor: '#f59e0b',
    elevation: 4,
  },
  assetName: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 13, // Reducido de 14 a 13
    textAlign: 'center',
  },
  assetNameSelected: {
    color: '#ffffff',
  },
  assetStatus: {
    color: '#64748b',
    fontSize: 9, // Reducido de 10 a 9
    fontWeight: '500',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  assetStatusSelected: {
    color: '#ffffff',
    opacity: 0.85,
  },
  notesInput: {
    backgroundColor: '#f8fafc', // Un fondo ligeramente diferente para los inputs
    borderWidth: 1,
    borderColor: '#cbd5e1', // Un borde más suave
    borderRadius: 8, // Reducido de 10 a 8
    padding: 14, // Reducido de 16 a 14
    textAlignVertical: 'top', // Para multiline
    color: '#1e3a8a',
    fontSize: 14,
    marginBottom: 12, // Reducido de 16 a 12
    minHeight: 70, // Reducido de 80 a 70
  },
  datePickerContainer: {
    marginBottom: 10, // Reducido de 12 a 10
  },
  dateDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8, // Reducido de 10 a 8
    marginBottom: Platform.OS === 'ios' ? 6 : 10, // Reducido
  },
  datePickerButton: {
    flex: 1, // Para que ocupen el espacio disponible
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff', // Fondo azul claro
    paddingVertical: 10, // Reducido de 12 a 10
    paddingHorizontal: 8, // Reducido de 10 a 8
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe', // Borde azul más claro
  },
  datePickerButtonText: {
    marginLeft: 6, // Reducido de 8 a 6
    color: '#1e40af', // Texto azul oscuro
    fontSize: 13, // Reducido de 14 a 13
    fontWeight: '500',
  },
  // Nuevos estilos para el botón de añadir a lista
  addToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5', // Violeta/indigo oscuro
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addToListButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  // Estilos para la lista de actividades programadas
  scheduledActivitiesContainer: {
    marginBottom: 12,
    marginTop: 4,
  },
  scheduledActivitiesList: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  scheduledActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  scheduledActivityContent: {
    flex: 1,
    marginRight: 10,
  },
  scheduledActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduledActivityTitle: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  scheduledActivityTime: {
    color: '#64748b',
    fontSize: 12,
    marginLeft: 26, // Alinear con el título después del icono
  },
  scheduledActivityAsset: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 26,
    marginTop: 2,
  },
  scheduledActivityNotes: {
    color: '#64748b',
    fontSize: 11,
    marginLeft: 26,
    marginTop: 2,
    fontStyle: 'italic',
  },
  removeActivityButton: {
    padding: 5,
  },
  activitySeparator: {
    height: 8,
  },
  actionButton: {
    backgroundColor: '#2563eb', // Azul más oscuro para el botón principal
    borderRadius: 10, // Reducido de 12 a 10
    paddingVertical: 14, // Reducido de 16 a 14
    paddingHorizontal: 18, // Reducido de 20 a 18
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 16, // Reducido de 20 a 16
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15, // Reducido de 16 a 15
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