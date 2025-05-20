import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useMemo } from 'react';
import {Picker} from '@react-native-picker/picker';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

// --- DATOS INICIALES (MOCK) ---
const initialCurrentProject = {
  name: 'Inspección Parque Eólico Norte',
  client: 'Energía Renovable S.A.',
  contract: 'CON-2023-045',
  location: 'Carretera Nacional KM 124, Sinaloa',
  drone: 'DJI Matrice 300 RTK (SN-M300-78451)',
  startDate: '15/05/2023',
  endDate: '20/06/2023',
  progress: 65,
  activities: [
    { id: 'act-1', name: 'T-001: Calibración de sensores', type: 'CALIBRATION', status: 'Completada', time: 'Ayer, 09:30 - 11:45', notes: 'Sensores OK.' },
    { id: 'act-4', name: 'T-004: Revisión de equipos', type: 'MAINTENANCE', status: 'Completada', time: 'Hace 2 días, 14:00 - 15:00', notes: 'Todo en orden.' },
    { id: 'act-2', name: 'T-002: Vuelo de inspección Zona A', type: 'FLIGHT_INSPECTION', status: 'En progreso', time: 'Hoy, 13:30 - En curso', notes: 'Inspeccionando cuadrante norte.' },
    { id: 'act-3', name: 'T-003: Procesamiento de datos Zona A', type: 'DATA_PROCESSING', status: 'Pendiente', time: 'Hoy, 15:15 - 17:00 (Estimado)', notes: '' },
    { id: 'act-5', name: 'T-005: Vuelo de inspección Zona B', type: 'FLIGHT_INSPECTION', status: 'Pendiente', time: 'Mañana, 10:00 - 12:00 (Estimado)', notes: '' }
  ],
  alerts: [
    { id: 'al-1', type: 'warning', message: 'Revisión de batería de drone requerida pronto.' },
    { id: 'al-2', type: 'info', message: 'Actualización de firmware disponible para Matrice 300.' }
  ],
  incidents: []
};

const pilot = {
  name: "Piloto de Pruebas",
  avatar: require('../../assets/images/pilot-avatar.jpg') // Asegúrate que esta ruta es correcta
};

const quickActivityTypes = [
  { type: 'FLIGHT_INSPECTION', label: 'Vuelo/Inspección', icon: 'airplane-outline' },
  { type: 'CALIBRATION', label: 'Calibración', icon: 'settings-outline' },
  { type: 'MAINTENANCE', label: 'Revisión Equipo', icon: 'build-outline' },
  { type: 'DATA_PROCESSING', label: 'Procesamiento Datos', icon: 'analytics-outline' },
  { type: 'BREAK', label: 'Descanso', icon: 'cafe-outline' },
  { type: 'MEAL', label: 'Comida', icon: 'restaurant-outline' },
  { type: 'OTHER', label: 'Otra Actividad', icon: 'ellipsis-horizontal-circle-outline' },
];

const incidentTypes = [
  { label: 'Seleccione Razón...', value: '' },
  { label: 'Clima Adverso', value: 'Clima' },
  { label: 'Problema Técnico (Drone)', value: 'Tecnico_Drone' },
  { label: 'Problema Técnico (Equipo)', value: 'Tecnico_Equipo' },
  { label: 'Solicitud del Cliente', value: 'Cliente' },
  { label: 'Enfermedad/Accidente Personal', value: 'Personal_Salud' },
  { label: 'Falta/Reasignación de Personal', value: 'Personal_Falta' },
  { label: 'Otro', value: 'Otro' },
];

// --- COMPONENTES AUXILIARES DE UI ---
const InfoRow = ({ iconName, label, value }) => (
  <View style={styles.infoRow_projectDetail}>
    <Ionicons name={iconName} size={16} color={styles.infoRow_icon.color} style={styles.infoRow_icon} />
    <Text style={styles.infoRow_label}>{label}</Text>
    <Text style={styles.infoRow_value} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
  </View>
);

const QuickActionButton = ({ iconName, text, onPress, color, iconFamily = "Ionicons" }) => {
  const IconComponent = iconFamily === "MaterialCommunityIcons" ? MaterialCommunityIcons : Ionicons;
  return (
    <TouchableOpacity style={styles.quickActionButton_item} onPress={onPress}>
      <IconComponent name={iconName} size={28} color={color || styles.quickActionButton_icon.color} />
      <Text style={[styles.quickActionButton_text, { color: color || styles.quickActionButton_icon.color }]}>{text}</Text>
    </TouchableOpacity>
  );
};

const CardSectionTitle = ({ title }) => (
  <Text style={styles.card_sectionTitle}>{title}</Text>
);

// --- COMPONENTE PRINCIPAL DEL DASHBOARD ---
const PilotDashboard = () => {
  const router = useRouter();
  const [currentProject, setCurrentProject] = useState(initialCurrentProject);
  const [isChecklistComplete, setIsChecklistComplete] = useState(false);
  const [alerts, setAlerts] = useState(initialCurrentProject.alerts || []);
  const [isAlertsSectionVisible, setIsAlertsSectionVisible] = useState(true);

  // Estados para el modal de Nueva Actividad Rápida
  const [isNewActivityModalVisible, setIsNewActivityModalVisible] = useState(false);
  const [selectedQuickActivityType, setSelectedQuickActivityType] = useState(quickActivityTypes[0].type);
  const [quickActivityCustomName, setQuickActivityCustomName] = useState('');
  const [quickActivityNotes, setQuickActivityNotes] = useState('');
  const [isQuickActivityForNow, setIsQuickActivityForNow] = useState(true);
  const [quickActivityPendingTime, setQuickActivityPendingTime] = useState('');

  // Estados para el modal de Registrar Incidencia
  const [isNewIncidentModalVisible, setIsNewIncidentModalVisible] = useState(false);
  const [newIncidentType, setNewIncidentType] = useState('');
  const [newIncidentDescription, setNewIncidentDescription] = useState('');

  useEffect(() => { setAlerts(currentProject.alerts || []); }, [currentProject.alerts]);

  // Derivar actividades
  const ongoingActivities = useMemo(() => currentProject.activities.filter(act => act.status === 'En progreso'), [currentProject.activities]);
  const pendingTodayActivities = useMemo(() => currentProject.activities.filter(act => act.status === 'Pendiente' && act.time.toLowerCase().startsWith('hoy')), [currentProject.activities]);
  const pastActivities = useMemo(() => currentProject.activities.filter(act => act.status === 'Completada').sort((a, b) => b.id.localeCompare(a.id)), [currentProject.activities]);
  const genericPendingActivities = useMemo(() => currentProject.activities.filter(act => act.status === 'Pendiente' && !act.time.toLowerCase().startsWith('hoy')), [currentProject.activities]);
  const currentOngoingActivityForDisplay = ongoingActivities.length > 0 ? ongoingActivities[0] : null;

  // --- MANEJADORES ---
  const handleNavigate = (route) => router.push(route);
  
  const getStatusIconAndColor = (status) => {
    if (status === 'Completada') return { icon: "checkmark-circle", color: "#10b981" };
    if (status === 'En progreso') return { icon: "sync-circle", color: "#3b82f6" };
    if (status === 'Pendiente') return { icon: "time-outline", color: "#f59e0b" };
    return { icon: "help-circle-outline", color: "#6b7280" };
  };
  
  const handleActivityAction = (activityId, newStatus) => {
    setCurrentProject(prev => ({
      ...prev,
      activities: prev.activities.map(act => {
        if (act.id === activityId) {
          const updatedActivity = { ...act, status: newStatus };
          if (newStatus === 'En progreso' && act.status === 'Pendiente') {
            updatedActivity.time = `Hoy, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - En curso`;
          } else if (newStatus === 'Completada' && act.status === 'En progreso') {
            const timeParts = act.time.split(' - ');
            const startTime = timeParts.length > 1 && timeParts[0].includes("Hoy, ") ? timeParts[0] : `Hoy, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            updatedActivity.time = `${startTime} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          }
          return updatedActivity;
        }
        return act;
      })
    }));
  };

  const handleDismissAlert = (alertId) => setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  const toggleAlertsSection = () => setIsAlertsSectionVisible(prev => !prev);

  const handleOpenNewActivityModal = () => {
    setSelectedQuickActivityType(quickActivityTypes[0].type);
    setQuickActivityCustomName('');
    setQuickActivityNotes('');
    setIsQuickActivityForNow(true);
    setQuickActivityPendingTime('');
    setIsNewActivityModalVisible(true);
  };

  const handleCreateQuickActivity = () => {
    const selectedTypeInfo = quickActivityTypes.find(qt => qt.type === selectedQuickActivityType);
    let activityName = selectedTypeInfo.type === 'OTHER' ? quickActivityCustomName.trim() : selectedTypeInfo.label;

    if (!activityName) {
      Alert.alert("Error", "El nombre de la actividad no puede estar vacío.");
      return;
    }

    const newActivityBase = {
      id: `act-${Date.now().toString()}`,
      type: selectedQuickActivityType,
      name: activityName,
      notes: quickActivityNotes.trim(),
    };

    let finalNewActivity;
    let updatedActivitiesList = [...currentProject.activities]; // Copia para modificar

    if (isQuickActivityForNow) {
      const currentOngoing = updatedActivitiesList.find(act => act.status === 'En progreso');
      if (currentOngoing) {
        updatedActivitiesList = updatedActivitiesList.map(act =>
          act.id === currentOngoing.id
            ? { 
                ...act, 
                status: 'Completada', 
                time: `${act.time.split(' - En curso')[0]} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
              }
            : act
        );
      }

      finalNewActivity = {
        ...newActivityBase,
        status: 'En progreso',
        time: `Hoy, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - En curso`,
      };
      // Poner la nueva actividad al inicio y luego las demás, excluyendo la que se acaba de completar si existía
      setCurrentProject(prev => ({ 
          ...prev, 
          activities: [finalNewActivity, ...updatedActivitiesList.filter(act => act.id !== currentOngoing?.id)] 
      }));
      Alert.alert("Éxito", `Actividad "${activityName}" iniciada.`);

    } else { // Programar Pendiente
      if (!quickActivityPendingTime.trim()) {
        Alert.alert("Error", "Para programar una actividad pendiente, especifica un tiempo (ej: 'Hoy 15:00', 'Mañana AM').");
        return;
      }
      finalNewActivity = {
        ...newActivityBase,
        status: 'Pendiente',
        time: quickActivityPendingTime.trim(),
      };
      setCurrentProject(prev => ({ ...prev, activities: [finalNewActivity, ...prev.activities] }));
      Alert.alert("Éxito", `Actividad "${activityName}" programada como pendiente.`);
    }
    setIsNewActivityModalVisible(false);
  };

  const handleOpenNewIncidentModal = () => {
    setNewIncidentType('');
    setNewIncidentDescription('');
    setIsNewIncidentModalVisible(true);
  };
  const handleCreateNewIncident = () => {
    if (!newIncidentType) {
      Alert.alert("Entrada Requerida", "Por favor, selecciona una razón para la incidencia.");
      return;
    }
    if (!newIncidentDescription.trim()) {
      Alert.alert("Entrada Requerida", "Por favor, describe la incidencia.");
      return;
    }
    const newIncident = {
      id: `inc-${Date.now().toString()}`,
      type: newIncidentType,
      description: newIncidentDescription.trim(),
      timestamp: new Date().toISOString(),
    };
    console.log("Nueva Incidencia Registrada:", newIncident);
    setCurrentProject(prev => ({ ...prev, incidents: [...(prev.incidents || []), newIncident] }));
    setIsNewIncidentModalVisible(false);
    Alert.alert("Incidencia Registrada", `Razón: ${newIncidentType}. Se ha guardado la información.`);
  };

  // --- RENDERIZADO DE ELEMENTOS DE LISTA ---
  const renderActivityItem = (activity) => { 
    const { icon, color } = getStatusIconAndColor(activity.status);
    return (
      <View key={activity.id} style={styles.activityItem_container}>
        <View style={styles.activityItem_infoContainer}>
          <Ionicons name={icon} size={22} color={color} style={styles.activityItem_icon} />
          <View style={styles.activityItem_textContainer}>
            <Text style={styles.activityItem_name} numberOfLines={1}>{activity.name}</Text>
            {activity.notes && activity.notes.length > 0 && <Text style={styles.activityItem_notes} numberOfLines={1}>{activity.notes}</Text>}
            <Text style={styles.activityItem_time}>{activity.time}</Text>
          </View>
        </View>
        <View style={styles.activityItem_actionsContainer}>
          {activity.status === 'En progreso' && (
            <TouchableOpacity
              style={[styles.activityItem_button, styles.activityItem_buttonComplete]}
              onPress={() => handleActivityAction(activity.id, 'Completada')}
            >
              <Ionicons name="checkmark-done-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
          {activity.status === 'Pendiente' && (
            <TouchableOpacity
              style={[styles.activityItem_button, styles.activityItem_buttonStart]}
              onPress={() => handleActivityAction(activity.id, 'En progreso')}
            >
              <Ionicons name="play-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
          {activity.status === 'Completada' && (
            <View style={[styles.activityItem_statusBadge, styles.activityItem_statusBadgeCompleted]}>
              <Text style={styles.activityItem_statusBadgeText}>OK</Text>
            </View>
          )}
        </View>
      </View>
    );
  };
  const renderAlertItem = (alert) => (
    <View key={alert.id} style={styles.alertItem_container}>
      <Ionicons
        name={alert.type === 'warning' ? "warning-outline" : "information-circle-outline"}
        size={20}
        color={alert.type === 'warning' ? styles.alertItem_iconWarning.color : styles.alertItem_iconInfo.color}
        style={styles.alertItem_icon}
      />
      <Text style={styles.alertItem_message}>{alert.message}</Text>
      <TouchableOpacity onPress={() => handleDismissAlert(alert.id)} style={styles.alertItem_dismissButton}>
        <Ionicons name="close-circle-outline" size={22} color={styles.alertItem_dismissIcon.color} />
      </TouchableOpacity>
    </View>
  );

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <View style={styles.screenContainer}>
      <StatusBar backgroundColor={styles.header_gradient.colors[0]} barStyle="light-content" />
      <LinearGradient colors={styles.header_gradient.colors} style={styles.header_container}>
        <View style={styles.header_content}>
          <View>
            <Text style={styles.header_title}>Dashboard Operativo</Text>
            <Text style={styles.header_subtitle}>Bienvenido, {pilot.name.split(' ')[0]}</Text>
          </View>
          <Image source={pilot.avatar} style={styles.header_avatar} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollableContent_container} showsVerticalScrollIndicator={false}>
        {/* Tarjeta: Mi Jornada Hoy */}
        <View style={styles.card_container}>
          <Text style={styles.card_title_large}>Mi Jornada Hoy</Text>
          <View style={styles.projectBrief_container}>
            <Text style={styles.projectBrief_name}>{currentProject.name}</Text>
            <InfoRow iconName="business-outline" label="Cliente:" value={currentProject.client} />
            <InfoRow iconName="map-outline" label="Parque:" value={currentProject.location.split(',')[0]} />
            <InfoRow iconName="calendar-outline" label="Fechas:" value={`${currentProject.startDate} - ${currentProject.endDate}`} />
            <InfoRow iconName="airplane-outline" label="Drone:" value={currentProject.drone.split(' (')[0]} />
          </View>

          {!isChecklistComplete ? (
            <TouchableOpacity style={styles.primaryButton_generic} onPress={() => handleNavigate('/pilot/preflight-checklist')}>
              <Ionicons name="shield-checkmark-outline" size={20} color="white" style={styles.primaryButton_icon}/>
              <Text style={styles.primaryButton_text}>Iniciar Checklist Prevuelo</Text>
            </TouchableOpacity>
          ) : currentOngoingActivityForDisplay ? (
            <View style={styles.statusDisplay_container}>
              <Ionicons name="sync-circle" size={22} color={styles.statusDisplay_iconInProgress.color} />
              <Text style={styles.statusDisplay_text}>En Curso: {currentOngoingActivityForDisplay.name}</Text>
            </View>
          ) : (
            <View style={styles.statusDisplay_container}>
              <Ionicons name="checkmark-circle" size={22} color={styles.statusDisplay_iconCompleted.color} />
              <Text style={styles.statusDisplay_text}>Checklist Completo. Listo para actividad.</Text>
            </View>
          )}
        </View>

        {/* Tarjeta: Alertas Importantes */}
        {alerts && alerts.length > 0 && (
          <View style={[styles.card_container, styles.alertsCard_container]}>
            <View style={styles.card_header}>
              <Text style={styles.card_title}>Alertas Importantes</Text>
              <TouchableOpacity onPress={toggleAlertsSection} style={styles.alertsCard_toggleButton}>
                <Ionicons
                  name={isAlertsSectionVisible ? "chevron-up-outline" : "chevron-down-outline"}
                  size={26}
                  color={styles.alertItem_iconWarning.color}
                />
              </TouchableOpacity>
            </View>
            {isAlertsSectionVisible && <View>{alerts.map(renderAlertItem)}</View>}
            {!isAlertsSectionVisible && alerts.length > 0 && (
              <Text style={styles.alertsCard_collapsedMessage}>
                {alerts.length} alerta{alerts.length > 1 ? 's' : ''} activa{alerts.length > 1 ? 's' : ''}. Presiona para expandir.
              </Text>
            )}
          </View>
        )}
        
        {/* Tarjeta: Acciones Rápidas */}
        <View style={styles.card_container}>
          <Text style={styles.card_title}>Acciones Rápidas</Text>
          <View style={styles.quickActions_gridContainer}>
            <QuickActionButton
              iconName="document-text-outline"
              text="Bitácora Detallada"
              onPress={() => handleNavigate('/pilot/activity-log')}
              color="#3b82f6"
            />
            <QuickActionButton
              iconName="add-circle-outline"
              text="Actividad Rápida"
              onPress={handleOpenNewActivityModal}
              color="#10b981"
            />
            <QuickActionButton
              iconName="warning-outline"
              text="Incidencia Rápida"
              onPress={handleOpenNewIncidentModal}
              color="#ef4444"
            />
            <QuickActionButton
              iconName="cloud-upload-outline"
              text="Subida de Fotos"
              onPress={() => handleNavigate('/pilot/confirm-photo-upload')}
              color="#eab308"
            />
          </View>
        </View>

        {/* Tarjeta: Mis Actividades */}
        <View style={styles.card_container}>
            <Text style={styles.card_title}>Mis Actividades</Text>
            {ongoingActivities.length > 0 && (
                <>
                    <CardSectionTitle title="En Progreso" />
                    {ongoingActivities.map(renderActivityItem)}
                </>
            )}
            {pendingTodayActivities.length > 0 && (
                <>
                    <CardSectionTitle title="Pendientes para Hoy" />
                    {pendingTodayActivities.map(renderActivityItem)}
                </>
            )}
            {genericPendingActivities.length > 0 && (
                <>
                    <CardSectionTitle title="Otras Pendientes" />
                    {genericPendingActivities.map(renderActivityItem)}
                </>
            )}
            {pastActivities.length > 0 && (
                 <>
                    <CardSectionTitle title="Actividades Realizadas" />
                    {pastActivities.slice(0, 5).map(renderActivityItem)}
                    {pastActivities.length > 5 && (
                        <TouchableOpacity style={styles.secondaryButton_generic} onPress={() => {/* Implementar navegación a historial completo */}}>
                            <Text style={styles.secondaryButton_text}>Ver Todas las Realizadas</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}
            { (ongoingActivities.length + pendingTodayActivities.length + genericPendingActivities.length + pastActivities.length) === 0 && (
                <Text style={styles.noActivities_text}>No hay actividades registradas.</Text>
            )}
        </View>
        
        {/* Tarjeta: Consultar Indicadores */}
        <View style={[styles.card_container, { marginBottom: 30 }]}>
             <TouchableOpacity style={styles.secondaryButton_generic} onPress={() => handleNavigate('/pilot/my-indicators')}>
                <Ionicons name="stats-chart-outline" size={20} color={styles.secondaryButton_icon.color} style={styles.secondaryButton_icon} />
                <Text style={styles.secondaryButton_text}>Consultar Mis Indicadores</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- MODALES --- */}
      {/* Modal para Nueva Actividad Rápida */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isNewActivityModalVisible}
        onRequestClose={() => setIsNewActivityModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modal_overlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }} keyboardShouldPersistTaps="handled">
            <View style={styles.modal_view}>
              <Text style={styles.modal_title}>Registrar Actividad Rápida</Text>

              <Text style={styles.modal_label}>Tipo de Actividad:</Text>
              <View style={styles.modal_quickActivityTypeContainer}>
                {quickActivityTypes.map((qType) => (
                  <TouchableOpacity
                    key={qType.type}
                    style={[
                      styles.modal_quickActivityTypeButton,
                      selectedQuickActivityType === qType.type && styles.modal_quickActivityTypeButtonSelected,
                    ]}
                    onPress={() => {
                      setSelectedQuickActivityType(qType.type);
                      if (qType.type !== 'OTHER') setQuickActivityCustomName('');
                    }}
                  >
                    <Ionicons
                      name={qType.icon}
                      size={22}
                      color={selectedQuickActivityType === qType.type ? '#fff' : '#3b82f6'}
                    />
                    <Text
                      style={[
                        styles.modal_quickActivityTypeLabel,
                        selectedQuickActivityType === qType.type && styles.modal_quickActivityTypeLabelSelected,
                      ]}
                    >
                      {qType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedQuickActivityType === 'OTHER' && (
                <TextInput
                  style={styles.modal_input}
                  placeholder="Nombre de actividad personalizada"
                  value={quickActivityCustomName}
                  onChangeText={setQuickActivityCustomName}
                  placeholderTextColor="#9ca3af"
                />
              )}

              <Text style={styles.modal_label}>Notas (Opcional):</Text>
              <TextInput
                style={[styles.modal_input, styles.modal_textArea]}
                placeholder="Detalles adicionales..."
                value={quickActivityNotes}
                onChangeText={setQuickActivityNotes}
                multiline
                placeholderTextColor="#9ca3af"
              />

              <View style={styles.modal_toggleActionContainer}>
                <TouchableOpacity 
                    style={[styles.modal_toggleActionButton, isQuickActivityForNow && styles.modal_toggleActionButtonSelected]}
                    onPress={() => setIsQuickActivityForNow(true)}
                >
                    <Ionicons name="play-circle-outline" size={20} color={isQuickActivityForNow ? "white" : "#2563eb"}/>
                    <Text style={[styles.modal_toggleActionButtonText, isQuickActivityForNow && {color: "white"}]}>Iniciar Ahora</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.modal_toggleActionButton, !isQuickActivityForNow && styles.modal_toggleActionButtonSelected]}
                    onPress={() => setIsQuickActivityForNow(false)}
                >
                    <Ionicons name="calendar-outline" size={20} color={!isQuickActivityForNow ? "white" : "#f59e0b"}/>
                    <Text style={[styles.modal_toggleActionButtonText, !isQuickActivityForNow && {color: "white"}, {color: !isQuickActivityForNow ? "white" : "#f59e0b"}]}>Programar</Text>
                </TouchableOpacity>
              </View>

              {!isQuickActivityForNow && (
                <TextInput
                  style={styles.modal_input}
                  placeholder="Tiempo para actividad pendiente (ej: Hoy 16:00)"
                  value={quickActivityPendingTime}
                  onChangeText={setQuickActivityPendingTime}
                  placeholderTextColor="#9ca3af"
                />
              )}
              
              <View style={styles.modal_buttonContainer}>
                <TouchableOpacity style={[styles.modal_button, styles.modal_buttonClose]} onPress={() => setIsNewActivityModalVisible(false)}>
                  <Text style={styles.modal_buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modal_button, styles.modal_buttonSave]} onPress={handleCreateQuickActivity}>
                  <Text style={styles.modal_buttonText}>{isQuickActivityForNow ? 'Iniciar' : 'Programar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal para Registrar Incidencia */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isNewIncidentModalVisible}
        onRequestClose={() => setIsNewIncidentModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modal_overlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }} keyboardShouldPersistTaps="handled">
            <View style={styles.modal_view}>
              <Text style={styles.modal_title}>Registrar Incidencia</Text>
              <Text style={styles.modal_label}>Razón de la Incidencia:</Text>
              <View style={styles.modal_pickerContainer}>
                <Picker
                  selectedValue={newIncidentType}
                  style={styles.modal_picker}
                  onValueChange={(itemValue) => setNewIncidentType(itemValue)}
                  prompt="Seleccione Razón de Incidencia"
                >
                  {incidentTypes.map((type) => (
                    <Picker.Item key={type.value} label={type.label} value={type.value} />
                  ))}
                </Picker>
              </View>
              <Text style={styles.modal_label}>Descripción:</Text>
              <TextInput
                style={[styles.modal_input, styles.modal_textArea]}
                placeholder="Descripción detallada de la incidencia..."
                placeholderTextColor="#9ca3af"
                value={newIncidentDescription}
                onChangeText={setNewIncidentDescription}
                multiline={true}
                numberOfLines={4}
              />
              <View style={styles.modal_buttonContainer}>
                <TouchableOpacity style={[styles.modal_button, styles.modal_buttonClose]} onPress={() => setIsNewIncidentModalVisible(false)}>
                  <Text style={styles.modal_buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modal_button, styles.modal_buttonSave]} onPress={handleCreateNewIncident}>
                  <Text style={styles.modal_buttonText}>Registrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#f3f4f6', },
  header_gradient: { colors: ['#1d4ed8', '#3b82f6'], },
  header_container: { paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 15 : 60, paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, },
  header_content: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
  header_title: { fontSize: 24, fontWeight: 'bold', color: 'white', },
  header_subtitle: { fontSize: 16, color: '#e0e7ff', marginTop: 2, },
  header_avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'white', },
  scrollableContent_container: { flex: 1, paddingHorizontal: 15, paddingTop: 20, },
  card_container: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 20, shadowColor: '#9ca3af', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, },
  card_header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, },
  card_title: { fontSize: 18, fontWeight: '600', color: '#1e3a8a', },
  card_title_large: { fontSize: 20, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 16, },
  card_sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 12, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 6, },
  infoRow_projectDetail: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, },
  infoRow_icon: { marginRight: 8, color: '#6b7280', },
  infoRow_label: { fontSize: 14, color: '#4b5563', fontWeight: '500', width: 75, },
  infoRow_value: { fontSize: 14, color: '#1e3a8a', flex: 1, },
  projectBrief_container: { marginBottom: 16, },
  projectBrief_name: { fontSize: 17, fontWeight: '600', color: '#111827', marginBottom: 8, },
  primaryButton_generic: { backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10, marginTop: 10, },
  primaryButton_text: { color: 'white', fontSize: 16, fontWeight: 'bold', },
  primaryButton_icon: { marginRight: 8, },
  secondaryButton_generic: { borderColor: '#3b82f6', borderWidth: 1.5, backgroundColor: '#eff6ff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, marginTop: 10, },
  secondaryButton_text: { color: '#3b82f6', fontSize: 15, fontWeight: '600', },
  secondaryButton_icon: { marginRight: 8, color: '#3b82f6', },
  statusDisplay_container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#eef2ff', borderRadius: 8, justifyContent: 'center', marginTop: 10, },
  statusDisplay_text: { marginLeft: 10, fontSize: 15, color: '#374151', fontWeight: '500', flexShrink: 1, },
  statusDisplay_iconInProgress: { color: "#3b82f6" },
  statusDisplay_iconCompleted: { color: "#10b981" },
  alertsCard_container: { borderColor: '#facc15', borderWidth: 1, backgroundColor: '#fffbeb', },
  alertsCard_toggleButton: { padding: 5, },
  alertsCard_collapsedMessage: { fontSize: 13, fontStyle: 'italic', color: '#78350f', textAlign: 'center', paddingVertical: 8, },
  alertItem_container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#fef3c7', },
  alertItem_icon: { marginRight: 10, },
  alertItem_iconWarning: { color: '#f59e0b' },
  alertItem_iconInfo: { color: '#3b82f6' },
  alertItem_message: { fontSize: 14, color: '#78350f', flex: 1, marginRight: 8, },
  alertItem_dismissButton: { padding: 5, },
  alertItem_dismissIcon: { color: '#9ca3af', },
  quickActions_gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8, },
  quickActionButton_item: { alignItems: 'center', justifyContent: 'center', width: '48%', paddingVertical: 16, backgroundColor: '#f9fafb', borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', minHeight: 95, },
  quickActionButton_icon: { color: "#3b82f6" },
  quickActionButton_text: { marginTop: 6, fontSize: 13, fontWeight: '500', textAlign: 'center', },
  activityItem_container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', },
  activityItem_infoContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8, },
  activityItem_icon: { marginRight: 10, },
  activityItem_textContainer: { flex: 1, },
  activityItem_name: { fontSize: 15, fontWeight: '500', color: '#1f2937', },
  activityItem_notes: { fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginTop: 1,},
  activityItem_time: { fontSize: 13, color: '#6b7280', marginTop: 2, },
  activityItem_actionsContainer: { flexDirection: 'row', alignItems: 'center', },
  activityItem_button: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 20, marginLeft: 8, },
  activityItem_buttonComplete: { backgroundColor: '#10b981' },
  activityItem_buttonStart: { backgroundColor: '#3b82f6' },
  // activityItem_buttonText: { display: 'none' }, // Ocultar si solo son iconos
  activityItem_statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, alignItems: 'center', },
  activityItem_statusBadgeCompleted: { backgroundColor: '#dcfce7', borderColor: '#6ee7b7', borderWidth: 1, },
  activityItem_statusBadgeText: { fontSize: 12, fontWeight: '600', color: '#065f46', },
  noActivities_text: { textAlign: 'center', color: '#6b7280', fontSize: 14, paddingVertical: 15, fontStyle: 'italic', },
  modal_overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)', },
  modal_view: { margin: 20, backgroundColor: 'white', borderRadius: 15, padding: 25, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%', maxHeight: '90%' },
  modal_title: { marginBottom: 20, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#1e40af', },
  modal_label: { fontSize: 15, fontWeight: '500', color: '#374151', marginBottom: 8, alignSelf: 'flex-start', marginTop: 10},
  modal_input: { backgroundColor: '#f3f4f6', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16, color: '#1f2937', borderWidth: 1, borderColor: '#e5e7eb', },
  modal_textArea: { minHeight: 80, textAlignVertical: 'top', },
  modal_pickerContainer: { backgroundColor: '#f3f4f6', borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#e5e7eb', ...(Platform.OS === 'ios' && { paddingVertical: 10, paddingHorizontal: 5}), },
  modal_picker: { width: '100%', height: Platform.OS === 'ios' ? undefined : 50, color: '#1f2937', },
  modal_quickActivityTypeContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15, },
  modal_quickActivityTypeButton: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#c7d2fe', borderRadius: 10, paddingVertical: 10, width: '31%', marginBottom: 8, minHeight: 70, },
  modal_quickActivityTypeButtonSelected: { backgroundColor: '#3b82f6', borderColor: '#2563eb', },
  modal_quickActivityTypeLabel: { color: '#3b82f6', fontSize: 11, fontWeight: '500', textAlign: 'center', marginTop: 4, },
  modal_quickActivityTypeLabelSelected: { color: '#ffffff', },
  modal_toggleActionContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 15, },
  modal_toggleActionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1.5, borderColor: '#d1d5db', },
  modal_toggleActionButtonSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb', },
  modal_toggleActionButtonText: { marginLeft: 8, fontSize: 14, fontWeight: '600', },
  modal_buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, },
  modal_button: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, elevation: 2, flex: 1, marginHorizontal: 5, alignItems: 'center', },
  modal_buttonClose: { backgroundColor: '#6b7280', },
  modal_buttonSave: { backgroundColor: '#2563eb', },
  modal_buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 16, },
});

export default PilotDashboard;