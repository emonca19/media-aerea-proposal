// app/pilot/new-activity-screen.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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
  { id: 'ACT_TRASLADO_ASSET', label: 'Traslado a Equipo', icon: 'map-marker-path', requiresAsset: true },
  { id: 'ACT_TRABAJO_ASSET', label: 'Trabajo en Equipo', icon: 'tools', requiresAsset: true }, // Icono genérico para "tools" o "cog"
  { id: 'ACT_TRABAJO_TURBINA', label: 'Trabajo en Turbina', icon: 'wind-turbine', requiresAsset: true },
  { id: 'ACT_TIEMPO_COMIDA', label: 'Tiempo de Comida', icon: 'food-fork-drink' },
  { id: 'ACT_DESMOVILIZACION', label: 'Desmovilización (parque ↔ hotel)', icon: 'home-export-outline' },
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

  // --- Submit Handler ---
  const handleSubmit = () => {
    if (!activityTypeId) {
        Alert.alert("Entrada Requerida", "Selecciona un tipo de actividad."); return;
    }
    if (requiresAssetSelection && !selectedAssetId) {
      const assetTypeName = selectedActivityInfo?.label.includes("Turbina") ? "Turbina" : "Equipo/Sitio";
      Alert.alert("Entrada Requerida", `Selecciona un ${assetTypeName} para esta actividad.`); return;
    }

    let finalActivityName = selectedActivityInfo?.label || "Actividad";
    if (activityTypeId === 'ACT_OTRO') {
      finalActivityName = customActivityNameInput.trim();
      if (!finalActivityName) {
        Alert.alert("Entrada Requerida", "Ingresa un nombre para la actividad personalizada."); return;
      }
    }

    const pendingTimeString = isForNow ? new Date().toISOString() : dateForLater.toISOString();
    const activityData: ActivityFormData = {
      type: activityTypeId,
      customName: finalActivityName,
      notes: activityNotes.trim(),
      isForNow,
      pendingTime: pendingTimeString,
      assetId: requiresAssetSelection ? selectedAssetId : undefined,
    };

    console.log('Submitting Activity:', activityData);
    Alert.alert('Actividad Registrada', `Actividad "${finalActivityName}" guardada.`);
    // Aquí se llamaría a una API para guardar los datos
    // onSubmit(activityData); // Si se pasara como prop

    if (router.canGoBack()) {
      router.back();
    } else {
      // router.replace('/pilot/dashboard'); // O a donde sea apropiado
      console.log("No se puede regresar, actividad enviada desde contexto raíz o similar.");
    }
  };

  // --- Render ---
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

        {/* SECCIÓN DE SELECCIÓN DE TIPO DE ACTIVIDAD ("CUADRITOS") */}
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
        {/* FIN DE SELECCIÓN DE TIPO DE ACTIVIDAD */}


        {/* SECCIÓN DE SELECCIÓN DE ASSET (TURBINAS, EQUIPOS, SITIOS) - SI ES REQUERIDO */}
        {requiresAssetSelection && (
            <View style={styles.assetSelection}>
                <Text style={styles.subtitle}>
                  {selectedActivityInfo?.label.includes("Turbina") ? "Selecciona Turbina" : "Selecciona Equipo/Sitio"}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.assetScroll}>
                    {availableAssets.map(asset => {
                      // Determinar el icono basado en el tipo de asset
                      let assetIcon: keyof typeof Ionicons.glyphMap = "cog-outline";
                      if (asset.type === 'TURBINE') assetIcon = "nuclear-outline"; // O 'hardware-chip-outline' o 'cog'
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
        {/* FIN DE SELECCIÓN DE ASSET */}


        {/* NOMBRE PERSONALIZADO SI EL TIPO ES "OTRO" */}
        {activityTypeId === 'ACT_OTRO' && (
            <>
              <Text style={styles.subtitle}>Nombre Actividad Personalizada</Text>
              <TextInput
                  style={styles.notesInput} // Reutilizamos el estilo de notesInput
                  placeholder="Ej: Calibración de GPS, Reunión Cliente"
                  value={customActivityNameInput}
                  onChangeText={setCustomActivityNameInput}
                  placeholderTextColor="#94a3b8"
              />
            </>
        )}
        {/* FIN DE NOMBRE PERSONALIZADO */}


        {/* NOTAS ADICIONALES */}
        <Text style={styles.subtitle}>Notas Adicionales (Opcional)</Text>
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
                <Text style={styles.subtitle}>Programar para:</Text>
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
            </View>
        )}
        {/* FIN DE PROGRAMACIÓN DE TIEMPO */}


        {/* BOTÓN DE ACCIÓN */}
        <TouchableOpacity style={styles.actionButton} onPress={handleSubmit}>
            <Text style={styles.actionButtonText}>
                {isForNow
                    ? (requiresAssetSelection && selectedAssetId && availableAssets.find(t => t.id === selectedAssetId)
                        ? `Iniciar en ${availableAssets.find(t => t.id === selectedAssetId)?.name}`
                        : 'Iniciar Actividad Ahora')
                    : 'Programar Actividad'
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
    padding: 20,
    paddingBottom: 70, // Espacio para el botón de acción al final
  },
  currentTime: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 24, // Aumentado un poco el margen
    textAlign: 'center',
  },
  subtitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 12, // Espacio consistente arriba y abajo de subtítulos
  },
  subtitleSwitchLabel: { // Estilo específico para el label del Switch para alinearlo
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    // No necesita marginBottom si globalFormStyles.form_switchContainer ya lo maneja
  },
  typeSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Asegura que las tarjetas se distribuyan
    marginBottom: 16, // Reducido un poco el margen si el siguiente elemento es un subtítulo
  },
  typeCard: {
    width: '48%', // Dos tarjetas por fila
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16, // Consistente con ActivityLogScreen
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#b0b8c3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Sombra sutil
    shadowRadius: 4,
    elevation: 2,
    minHeight: 90,
    marginBottom: 12, // Espacio entre filas de tarjetas
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
    fontSize: 13,
  },
  typeLabelSelected: {
    color: '#ffffff',
  },
  assetSelection: {
    marginBottom: 16,
  },
  assetScroll: {
    paddingHorizontal: 2, // Para que se vea la sombra de las tarjetas en los bordes
    paddingVertical: 8,
    gap: 12, // Espacio entre tarjetas de assets
  },
  assetCard: {
    width: 120, // Más similar a turbineCard de ActivityLogScreen
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center', // Centrar contenido verticalmente
    gap: 8, // Similar a turbineCard
    shadowColor: '#b0b8c3',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 100, // Para mantener una altura consistente
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
    fontSize: 14, // Reducido un poco para caber mejor en 120px
    textAlign: 'center',
  },
  assetNameSelected: {
    color: '#ffffff',
  },
  assetStatus: {
    color: '#64748b',
    fontSize: 10,
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
    borderRadius: 10,
    padding: 16,
    textAlignVertical: 'top', // Para multiline
    color: '#1e3a8a',
    fontSize: 14,
    marginBottom: 16, // Reducido si el siguiente es un subtítulo
    minHeight: 80, // Altura mínima para el input de notas
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  dateDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10, // Espacio entre botones de fecha y hora
    marginBottom: Platform.OS === 'ios' ? 10 : 16, // Margen para el picker si es spinner
  },
  datePickerButton: {
    flex: 1, // Para que ocupen el espacio disponible
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff', // Fondo azul claro
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe', // Borde azul más claro
  },
  datePickerButtonText: {
    marginLeft: 8,
    color: '#1e40af', // Texto azul oscuro
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#2563eb', // Azul más oscuro para el botón principal
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 20, // Margen superior antes del botón
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
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