// app/pilot/dashboard/pilot-dashboard.tsx

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useWeather from "../../hooks/useWeather"; // Asegúrate que la ruta a hooks sea correcta desde aquí

// Importación nombrada para ActivitiesDisplayList
import { IncidentFormData } from "../new-incident"; // Importamos el tipo desde el nuevo componente
import { ActivitiesDisplayList } from "./activities-display-list"; // Ajusta la ruta si es necesario
import ActivityControl from "./activity-control"; // Importamos el nuevo componente para control de actividad
import ActivityTimeline, { TimelineActivity } from "./activity-timeline"; // Asegúrate que la ruta sea correcta
import AlertsDisplayCard from "./alerts-display-card"; // Ajusta la ruta si es necesaria
import IncidentFormModal from "./incident-form-modal"; // Importamos el nuevo componente modal para incidentes
import MyIndicatorsButton from "./my-indicators-button"; // Ajusta la ruta si es necesaria
import QuickActionsMenuCard from "./quick-actions-menu-card"; // Ajusta la ruta si es necesaria
import QuickRegisterActivityForm, {
  activityTypes,
  mockTurbines,
} from "./quick-register-activity-form"; // Importamos el nuevo componente con sus datos

// Nuevo componente para el resumen del proyecto actual tipo card visual
function ProjectSummaryCard({
  name,
  client,
  onPress,
}: {
  name: string;
  client: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{ width: "100%" }}
    >
      <View style={projectSummaryStyles.cardWrapper}>
        <View style={projectSummaryStyles.card}>
          <View style={projectSummaryStyles.iconCircle}>
            {/* Usa un icono de dron de MaterialCommunityIcons si está disponible */}
            {/* Si no, usa un icono de vuelo genérico */}
            <Ionicons name="map-outline" size={32} color="#a78bfa" />
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={projectSummaryStyles.title}>{name}</Text>
            <Text style={projectSummaryStyles.subtitle}>{client}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const projectSummaryStyles = StyleSheet.create({
  cardWrapper: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    marginTop: 18,
    marginBottom: 10,
    position: "relative",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginHorizontal: 0,
    // Sombra sutil para efecto flotante
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 15,
    color: "#9ca3af",
    fontWeight: "500",
  },
});

import {
  ChecklistItemData,
  incidentTypes as importedIncidentTypes,
  IncidentData,
  initialCurrentProject as projectDataFromImport
} from "./pilot-dashboard-data"; // Asegúrate que la ruta sea correcta desde aquí

interface Pause {
  reason: string;
  start: string;
  end?: string;
}

interface Activity {
  id: string;
  type: string;
  name: string;
  notes: string;
  status: "EN_PROGRESO" | "PENDIENTE" | "COMPLETADA" | "POR_ASIGNAR";
  time: string;
  description?: string;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  actualStart?: string | null;
  actualEnd?: string | null;
  pauseHistory?: Pause[]; // <-- Añadido para historial de pausas
}
interface AlertItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}
interface Incident {
  id: string;
  type: string;
  label: string;
  description: string;
  timestamp: string;
  icon?: keyof typeof Ionicons.glyphMap;
}
interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}
interface Project {
  id: string;
  name: string;
  client: string;
  location: string | { latitude: number; longitude: number };
  startDate: string;
  endDate: string;
  status: string;
  description: string;
  progress: number;
  drone: string;
  checklist: ChecklistItem[];
  activities: Activity[];
  alerts: AlertItem[];
  incidents: Incident[];
}

const typedProjectData: Project = {
  id: projectDataFromImport.id,
  name: projectDataFromImport.name || "Proyecto No Especificado", // Fallback crucial
  client: projectDataFromImport.client || "Cliente No Especificado",
  location: projectDataFromImport.location || "Ubicación No Especificada",
  startDate: projectDataFromImport.startDate,
  endDate: projectDataFromImport.endDate,
  status: projectDataFromImport.status || "ESTADO_DESCONOCIDO",
  description: projectDataFromImport.description || "Sin descripción.",
  progress: projectDataFromImport.progress || 0,
  drone: projectDataFromImport.drone || "Drone No Especificado",
  checklist: (projectDataFromImport.checklist || []).map(
    (item: ChecklistItemData) => ({ ...item })
  ),
  activities: [
    {
      id: "act-001",
      type: "INSPECTION",
      name: "Inspección Estructural Turbina A12",
      notes: "Inspección detallada de componentes críticos",
      status: "PENDIENTE",
      time: "Hoy, 10:30",
      description:
        "Inspección programada para verificar la integridad estructural",
      scheduledStart: new Date(new Date().setHours(10, 30)).toISOString(),
      scheduledEnd: new Date(new Date().setHours(11, 30)).toISOString(),
      actualStart: null,
      actualEnd: null,
    },
    {
      id: "act-002",
      type: "MAINTENANCE",
      name: "Mantenimiento Preventivo B07",
      notes: "Lubricación de engranajes y revisión de sensores",
      status: "PENDIENTE",
      time: "Hoy, 12:00",
      description: "Mantenimiento rutinario programado",
      scheduledStart: new Date(new Date().setHours(12, 0)).toISOString(),
      scheduledEnd: new Date(new Date().setHours(13, 30)).toISOString(),
      actualStart: null,
      actualEnd: null,
    },
    {
      id: "act-003",
      type: "PHOTO_CAPTURE",
      name: "Fotografías Palas Turbina C15",
      notes: "Captura de imágenes HD de las palas para análisis",
      status: "PENDIENTE",
      time: "Hoy, 15:00",
      description: "Documentación fotográfica para evaluación",
      scheduledStart: new Date(new Date().setHours(15, 0)).toISOString(),
      scheduledEnd: new Date(new Date().setHours(16, 0)).toISOString(),
      actualStart: null,
      actualEnd: null,
    },
    {
      id: "act-004",
      type: "THERMAL_SCAN",
      name: "Escaneo Térmico Sector Norte",
      notes: "Análisis termográfico de componentes críticos",
      status: "PENDIENTE",
      time: "Hoy, 16:30",
      description: "Detección de puntos calientes y anomalías térmicas",
      scheduledStart: new Date(new Date().setHours(16, 30)).toISOString(),
      scheduledEnd: new Date(new Date().setHours(17, 30)).toISOString(),
      actualStart: null,
      actualEnd: null,
    },
  ],
  alerts: (projectDataFromImport.alerts || []).map((alert) => ({
    ...alert,
    severity: alert.severity as AlertItem["severity"],
  })),
  incidents: (projectDataFromImport.incidents || []).map(
    (inc: IncidentData) => ({
      ...inc,
      label:
        importedIncidentTypes.find((it) => it.id === inc.type)?.label ||
        inc.type,
      icon:
        (importedIncidentTypes.find((it) => it.id === inc.type)
          ?.icon as keyof typeof Ionicons.glyphMap) || "alert-circle-outline",
    })
  ),
};
console.log(
  "PILOT DASHBOARD DATA INIT: typedProjectData.name =",
  typedProjectData.name
);
console.log(
  "PILOT DASHBOARD DATA INIT: typedProjectData.activities count =",
  typedProjectData.activities.length
);

// Define un nuevo tipo de sección para el botón de registrar actividad destacado
type DashboardSectionItem = {
  id: string;
  type:
    | "PROJECT_SUMMARY_CARD"
    | "REGISTER_ACTIVITY_BUTTON"
    | "ACTIVITY_TIMELINE"
    | "ALERTS_DISPLAY_CARD"
    | "QUICK_ACTIONS_MENU_CARD"
    | "ACTIVITIES_DISPLAY_LIST"
    | "MY_INDICATORS_BUTTON";
};

const PilotDashboard = () => {
  console.log("PilotDashboard RENDERED - V4"); // Incremented version for clarity
  const router = useRouter();

  const [currentProject, setCurrentProject] =
    useState<Project>(typedProjectData);
  console.log(
    "PilotDashboard State: Initial currentProject.name =",
    currentProject?.name
  );
  console.log(
    "PilotDashboard State: Initial currentProject.activities count =",
    currentProject?.activities?.length
  );

  const [isChecklistComplete, setIsChecklistComplete] = useState<boolean>(() =>
    (currentProject.checklist || []).every((item) => item.completed)
  );
  const [alerts, setAlerts] = useState<AlertItem[]>(
    () => currentProject.alerts || []
  );
  const [currentDate] = useState<string>(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return today.toLocaleDateString("es-ES", options);
  });

  const [isAlertsSectionVisible, setIsAlertsSectionVisible] = useState(true);
  const [isNewActivityModalVisible, setIsNewActivityModalVisible] =
    useState(false);
  const [isNewIncidentModalVisible, setIsNewIncidentModalVisible] =
    useState(false);
  const [isProjectDetailsVisible, setIsProjectDetailsVisible] = useState(true); // Nuevo estado para la visibilidad de Mi Jornada Hoy

  const projectLocationString =
    typeof currentProject.location === "string"
      ? currentProject.location
      : undefined;
  const {
    weather,
    loading: weatherLoading,
    error: weatherError,
  } = useWeather();

  useEffect(() => {
    setIsChecklistComplete(
      (currentProject.checklist || []).every((item) => item.completed)
    );
  }, [currentProject.checklist]);

  useEffect(() => {
    setAlerts(currentProject.alerts || []);
  }, [currentProject.alerts]);

  // Clave: Asegurar que 'activities' sea siempre un array.
  const activities = useMemo(() => {
    const acts = currentProject.activities;
    if (!acts || !Array.isArray(acts)) {
      console.warn(
        "PilotDashboard: currentProject.activities NO es un array! Usando array vacío."
      );
      return [];
    }
    console.log(
      `PilotDashboard: Recalculating 'activities' memo. Count: ${acts.length}`
    );
    return acts;
  }, [currentProject.activities]);

  const ongoingActivities = useMemo(() => {
    console.log(
      `PilotDashboard: Recalculating ongoingActivities from ${activities.length} activities.`
    );
    return activities.filter((act) => act.status === "EN_PROGRESO");
  }, [activities]);

  const pendingTodayActivities = useMemo(
    () =>
      activities.filter(
        (act) =>
          act.status === "PENDIENTE" &&
          act.time?.toLowerCase().startsWith("hoy")
      ),
    [activities]
  );
  const pastActivities = useMemo(
    () =>
      activities
        .filter((act) => act.status === "COMPLETADA")
        .sort(
          (a, b) =>
            new Date(b.actualEnd || b.scheduledEnd || 0).getTime() -
            new Date(a.actualEnd || a.scheduledEnd || 0).getTime()
        ),
    [activities]
  );
  const genericPendingActivities = useMemo(
    () =>
      activities.filter(
        (act) =>
          act.status === "PENDIENTE" &&
          !act.time?.toLowerCase().startsWith("hoy")
      ),
    [activities]
  );
  const unassignedTimeActivities = useMemo(
    () => activities.filter((act) => act.status === "POR_ASIGNAR"),
    [activities]
  );

  const currentOngoingActivityForDisplay = useMemo(
    () => (ongoingActivities.length > 0 ? ongoingActivities[0] : null),
    [ongoingActivities]
  );

  const handleNavigate = useCallback(
    (route: string) => router.push(route as Href),
    [router]
  );
  const handleLogout = useCallback(
    () =>
      Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
        { text: "Cancelar" },
        { text: "Sí", onPress: () => router.replace("/" as const) },
      ]),
    [router]
  );

  const handleActivityAction = useCallback(
    (activityId: string, newStatusString: string) => {
      const newStatus = (newStatusString?.toUpperCase().replace(" ", "_") ||
        "PENDIENTE") as Activity["status"];
      setCurrentProject((prev) => ({
        ...prev,
        activities: (prev.activities || []).map(
          (
            act // Asegurar que prev.activities es un array
          ) =>
            act.id === activityId
              ? {
                  ...act,
                  status: newStatus,
                  actualStart:
                    newStatus === "EN_PROGRESO" && !act.actualStart
                      ? new Date().toISOString()
                      : act.actualStart,
                  actualEnd:
                    newStatus === "COMPLETADA"
                      ? new Date().toISOString()
                      : act.actualEnd,
                  time:
                    newStatus === "EN_PROGRESO"
                      ? `Hoy, ${new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} - En curso`
                      : newStatus === "COMPLETADA"
                      ? `${
                          (act.time || "").split(" - En curso")[0]
                        } - ${new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : act.time,
                }
              : act
        ),
      }));
    },
    []
  );

  // Handler to finish the currently ongoing activity
  const handleFinishCurrentActivity = useCallback(() => {
    if (currentOngoingActivityForDisplay) {
      handleActivityAction(currentOngoingActivityForDisplay.id, "COMPLETADA");
    }
  }, [currentOngoingActivityForDisplay, handleActivityAction]);

  // Handler to start a pending activity, completing any current one first
  const handleStartPendingActivity = useCallback(
    (activityId: string) => {
      if (currentOngoingActivityForDisplay) {
        handleActivityAction(currentOngoingActivityForDisplay.id, "COMPLETADA");
      }
      handleActivityAction(activityId, "EN_PROGRESO");
    },
    [currentOngoingActivityForDisplay, handleActivityAction]
  );

  const handleDismissAlert = useCallback(
    (alertId: string) =>
      setAlerts((prev) => prev.filter((a) => a.id !== alertId)),
    []
  );
  const toggleAlertsSection = useCallback(
    () => setIsAlertsSectionVisible((prev) => !prev),
    []
  );
  const handleOpenNewActivityModal = useCallback(
    () => setIsNewActivityModalVisible(true),
    []
  );
  const handleOpenNewIncidentModal = useCallback(
    () => setIsNewIncidentModalVisible(true),
    []
  );
  const toggleProjectDetails = useCallback(
    () => setIsProjectDetailsVisible((prev) => !prev),
    []
  ); // Nueva función para alternar visibilidad

  const handleCreateQuickActivity = useCallback(
    (activityData: any) => {
      const isForNow = activityData.isForNow;
      const now = new Date();
      const timeString = `Hoy, ${now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        type: activityData.type,
        name:
          activityData.type === "OTHER"
            ? activityData.notes.substring(0, 30)
            : activityData.type === "TURBINE_WORK"
            ? `Trabajo en ${
                mockTurbines.find((t) => t.id === activityData.turbineId)
                  ?.name || "Turbina"
              }`
            : activityTypes.find((t) => t.type === activityData.type)?.label ||
              "Actividad",
        notes: activityData.notes,
        status: isForNow ? "EN_PROGRESO" : "PENDIENTE",
        time: isForNow ? `${timeString} - En curso` : timeString,
        actualStart: isForNow ? now.toISOString() : null,
        scheduledStart: !isForNow ? now.toISOString() : null,
        description: activityData.notes,
        scheduledEnd: null,
        actualEnd: null,
      };
      let baseActivities = [...(currentProject.activities || [])];
      // Si es para ahora, completamos cualquier actividad en progreso antes de iniciar la nueva
      if (isForNow) {
        const currentOngoing = baseActivities.find(
          (act) => act.status === "EN_PROGRESO"
        );
        if (currentOngoing) {
          baseActivities = baseActivities.map((act) =>
            act.id === currentOngoing.id
              ? {
                  ...act,
                  status: "COMPLETADA",
                  actualEnd: now.toISOString(),
                  time: `${
                    (act.time || "").split(" - En curso")[0]
                  } - ${now.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`,
                }
              : act
          );
        }
      }
      setCurrentProject((prev) => ({
        ...prev,
        activities: [newActivity, ...baseActivities],
      }));
      setIsNewActivityModalVisible(false);
      Alert.alert(
        "Éxito",
        `Actividad "${newActivity.name}" ${
          isForNow ? "iniciada" : "programada"
        }.`
      );
    },
    [currentProject.activities]
  );

  const handleCreateNewIncident = useCallback(
    (incidentData: IncidentFormData) => {
      const incidentTypeInfo = importedIncidentTypes.find(
        (it) => it.id === incidentData.type
      );
      const newIncident: Incident = {
        id: `inc-${Date.now()}`,
        type: incidentData.type,
        label: incidentTypeInfo?.label || "Desconocido",
        description: incidentData.description,
        timestamp: new Date().toISOString(),
        icon:
          (incidentTypeInfo?.icon as keyof typeof Ionicons.glyphMap) ||
          "alert-circle-outline",
      };
      setCurrentProject((prev) => ({
        ...prev,
        incidents: [...(prev.incidents || []), newIncident],
      }));
      setIsNewIncidentModalVisible(false);
      Alert.alert(
        "Incidencia Registrada",
        `"${newIncident.label}" registrada.`
      );
    },
    []
  );

  const getStatusStyling = useCallback((status: string) => {
    const normalizedStatus = (status?.toUpperCase().replace(" ", "_") ||
      "POR_ASIGNAR") as Activity["status"];
    switch (normalizedStatus) {
      case "EN_PROGRESO":
        return { icon: "hourglass-outline" as const, color: "#3b82f6" };
      case "PENDIENTE":
        return { icon: "time-outline" as const, color: "#f59e0b" };
      case "COMPLETADA":
        return { icon: "checkmark-circle-outline" as const, color: "#10b981" };
      case "POR_ASIGNAR":
        return { icon: "help-circle-outline" as const, color: "#60a5fa" };
      default:
        return { icon: "alert-circle-outline" as const, color: "#ef4444" };
    }
  }, []);

  const memoizedActivityListsForDisplay = useMemo(() => {
    console.log(
      "PilotDashboard: Recalculating memoizedActivityListsForDisplay. ongoing count:",
      ongoingActivities.length
    );
    return {
      ongoing: ongoingActivities,
      pendingToday: pendingTodayActivities,
      genericPending: genericPendingActivities,
      unassignedTime: unassignedTimeActivities,
      past: pastActivities,
    };
  }, [
    ongoingActivities,
    pendingTodayActivities,
    genericPendingActivities,
    unassignedTimeActivities,
    pastActivities,
  ]);
  // Reordenar las secciones según la solicitud del usuario
  const dashboardSections = useMemo(
    (): DashboardSectionItem[] => [
      { id: "project-summary", type: "PROJECT_SUMMARY_CARD" },
      { id: "quickActions", type: "QUICK_ACTIONS_MENU_CARD" },
      { id: "timeline", type: "ACTIVITY_TIMELINE" }, // Reemplaza journey
    ],
    []
  );

  // Add the missing handler for deleting an activity
  const handleDeleteActivity = useCallback((activityId: string) => {
    setCurrentProject((prev) => ({
      ...prev,
      activities: (prev.activities || []).filter(
        (act) => act.id !== activityId
      ),
    }));
    Alert.alert(
      "Actividad eliminada",
      "La actividad ha sido eliminada correctamente."
    );
  }, []);

  // Estado para pausa de actividad
const [activityPauseState, setActivityPauseState] = useState<{ isPaused: boolean; reason?: string; start?: string; end?: string }>({ isPaused: false });

// Iniciar jornada (inicia una nueva actividad de "Jornada" o la actividad principal del día)
const handleStartJornada = useCallback(() => {
  // Abre el modal de registro rápido de actividad
  setIsNewActivityModalVisible(true);
}, []);

// Pausar actividad actual con motivo
const handlePauseActivity = useCallback((reason: string) => {
  if (!currentOngoingActivityForDisplay) return;
  setActivityPauseState({ isPaused: true, reason, start: new Date().toISOString() });
  // Opcional: podrías guardar el motivo y hora de pausa en el objeto de actividad aquí
  setCurrentProject(prev => ({
    ...prev,
    activities: prev.activities.map(act =>
      act.id === currentOngoingActivityForDisplay.id
        ? {
            ...act,
            pauseHistory: [
              ...(act.pauseHistory || []),
              { reason, start: new Date().toISOString() }
            ],
            status: act.status // No cambia el status, solo marca pausa
          }
        : act
    ),
  }));
}, [currentOngoingActivityForDisplay]);

// Reanudar actividad pausada
const handleResumeActivity = useCallback(() => {
  if (!currentOngoingActivityForDisplay) return;
  setActivityPauseState({ isPaused: false });
  // Opcional: marca el fin de la pausa en el historial
  setCurrentProject(prev => ({
    ...prev,
    activities: prev.activities.map(act =>
      act.id === currentOngoingActivityForDisplay.id && act.pauseHistory?.length
        ? {
            ...act,
            pauseHistory: act.pauseHistory.map((pause, idx, arr) =>
              idx === arr.length - 1 && !pause.end
                ? { ...pause, end: new Date().toISOString() }
                : pause
            ),
          }
        : act
    ),
  }));
}, [currentOngoingActivityForDisplay]);

// Finalizar actividad actual
const handleFinishActivity = useCallback(() => {
  if (!currentOngoingActivityForDisplay) return;
  setActivityPauseState({ isPaused: false });
  handleActivityAction(currentOngoingActivityForDisplay.id, "COMPLETADA");
}, [currentOngoingActivityForDisplay, handleActivityAction]);

  const renderDashboardSection = useCallback(
    ({ item }: { item: DashboardSectionItem }) => {
      switch (item.type) {
        case "PROJECT_SUMMARY_CARD":
          return (
            <ProjectSummaryCard
              name={currentProject.name || "Proyecto sin Nombre"}
              client={currentProject.client || "Cliente No Especificado"}
              onPress={() => router.push("/pilot/project-details")}
            />
          );
        case "ACTIVITY_TIMELINE": {
          // Hardcoded timeline data to match the provided image, now with the closest available Ionicons
          const timelineActivities: TimelineActivity[] = [
            {
              id: "1",
              icon: (
                <Ionicons name="airplane-outline" size={24} color="#6366f1" />
              ),
              title: "Vuelo de Inspección",
              time: "10:27",
              duration: undefined,
              statusColor: "#6366f1",
              statusLabel: "En curso",
              statusBg: "#ede9fe",
            },
            {
              id: "2",
              icon: (
                <Ionicons name="walk-outline" size={24} color="#a3b63a" />
              ),
              title: "Desplazamiento en campo",
              time: "10:20 - 10:26",
              duration: "6 min",
              statusColor: "#a3b63a",
              statusLabel: "6 min",
              statusBg: "#f7fbe7",
            },
            {
              id: "3",
              icon: (
                <Ionicons name="time-outline" size={24} color="#49594a" />
              ),
              title: "Esperando permiso",
              time: "09:50 - 10:20",
              duration: "30 min",
              statusColor: "#49594a",
              statusLabel: "30 min",
              statusBg: "#e6e9e6",
            },
            {
              id: "4",
              icon: (
                <Ionicons name="location-outline" size={24} color="#c97c6a" />
              ),
              title: "Llegada al sitio",
              time: "09:50",
              duration: "0 min",
              statusColor: "#c97c6a",
              statusLabel: "0 min",
              statusBg: "#f7eae7",
            },
          ];
          return (
            <ActivityTimeline activities={timelineActivities} />
          );
        }
        case "REGISTER_ACTIVITY_BUTTON":
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenNewActivityModal}
            >
              <LinearGradient
                colors={["#2563eb", "#3b82f6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.highlightedButton}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={28}
                  color="white"
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.highlightedButtonText}>
                  Registrar Nueva Actividad
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        case "ALERTS_DISPLAY_CARD":
          return (
            <AlertsDisplayCard
              alerts={alerts}
              isVisible={isAlertsSectionVisible}
              onToggle={toggleAlertsSection}
              onDismissAlert={handleDismissAlert}
              showDismissAllButton={true}
            />
          );
        case "QUICK_ACTIONS_MENU_CARD":
          return (
            <>
              <ActivityControl
                ongoingActivity={currentOngoingActivityForDisplay}
                onStart={handleStartJornada}
                onPause={handlePauseActivity}
                onResume={handleResumeActivity}
                onFinish={handleFinishActivity}
                isPaused={activityPauseState.isPaused}
                currentPauseReason={activityPauseState.reason}
              />
              <QuickActionsMenuCard
                onNavigate={handleNavigate}
                onOpenNewActivity={handleOpenNewActivityModal}
                onOpenNewIncident={handleOpenNewIncidentModal}
                onSubmitActivity={handleCreateQuickActivity}
              />
            </>
          );
        case "ACTIVITIES_DISPLAY_LIST":
          console.log(
            "PilotDashboard: Passing to ActivitiesDisplayList. lists.ongoing count:",
            memoizedActivityListsForDisplay.ongoing?.length
          );
          if (typeof memoizedActivityListsForDisplay.ongoing === "undefined") {
            console.error(
              "CRITICAL IN RENDER: memoizedActivityListsForDisplay.ongoing es undefined"
            );
            return (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>
                  Error: Datos de actividades (ongoing) no disponibles.
                </Text>
              </View>
            );
          }
          return (
            <ActivitiesDisplayList
              lists={memoizedActivityListsForDisplay}
              onActivityAction={handleActivityAction}
              getStatusStyling={getStatusStyling}
            />
          );
        case "MY_INDICATORS_BUTTON":
          return (
            <MyIndicatorsButton
              onPress={() => handleNavigate("/pilot/indicators")}
            />
          );
        default:
          return null;
      }
    },
    [
      currentProject, // Cambiado de props individuales a todo el objeto para simplificar,
      // pero puede causar más re-renders de renderDashboardSection.
      // Si el rendimiento es un problema, vuelve a desglosar.
      currentDate,
      weather,
      weatherLoading,
      weatherError,
      handleLogout,
      handleNavigate,
      currentOngoingActivityForDisplay,
      alerts,
      isAlertsSectionVisible,
      toggleAlertsSection,
      handleDismissAlert,
      handleOpenNewActivityModal,
      handleOpenNewIncidentModal,
      memoizedActivityListsForDisplay,
      getStatusStyling,
      handleActivityAction,
      handleCreateQuickActivity,
      isProjectDetailsVisible,
      toggleProjectDetails,
      handleDeleteActivity,
      handleFinishCurrentActivity,
      handleStartPendingActivity,
      ongoingActivities,
      pendingTodayActivities,
    ]
  );

  console.log(
    "PilotDashboard: Final render pass. currentProject.name:",
    currentProject?.name
  );
  console.log(
    "PilotDashboard: Final render pass. memoizedActivityListsForDisplay.ongoing count:",
    memoizedActivityListsForDisplay?.ongoing?.length
  );

  return (
    <View style={styles.screenContainer}>
      {" "}
      <StatusBar backgroundColor="#1E3A8A" barStyle="light-content" />{" "}
      <FlatList
        data={dashboardSections}
        renderItem={renderDashboardSection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollableContent_contentContainer_main}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View>
            <Text>No hay secciones para mostrar.</Text>
          </View>
        }
      />
      {/* Usando el nuevo QuickRegisterActivityForm en lugar del ActivityFormModal anterior */}{" "}
      <QuickRegisterActivityForm
        isVisible={isNewActivityModalVisible}
        onClose={() => setIsNewActivityModalVisible(false)}
        onSubmit={handleCreateQuickActivity}
      />
      <IncidentFormModal
        isVisible={isNewIncidentModalVisible}
        onClose={() => setIsNewIncidentModalVisible(false)}
        onSubmit={handleCreateNewIncident}
        activities={[...ongoingActivities, ...pendingTodayActivities].map(
          (act) => ({
            id: act.id,
            name: act.name,
            status: act.status,
          })
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "#f0f2f5" },
  scrollableContent_contentContainer_main: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  highlightedButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  highlightedButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorCard: {
    backgroundColor: "#fee2e2",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  errorText: { color: "#b91c1c", fontSize: 16, fontWeight: "500" },
  projectSummaryContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111827",
  },
  activityCard: {
    backgroundColor: "#e0f7fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4db6e4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  activityDuration: {
    fontSize: 14,
    color: "#6b7280",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  activityDetail: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  activityDetailText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
  },
  historyButton: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  historyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PilotDashboard; // Esta exportación default es para la PANTALLA.
