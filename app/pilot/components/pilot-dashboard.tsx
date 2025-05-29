// app/pilot/dashboard/pilot-dashboard.tsx

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient
import {
  Href,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from "expo-router"; // Changed to useSearchParams
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useActivity } from "../../contexts/ActivityContext"; // Import ActivityContext
import useWeather from "./../../hooks/useWeather"; // Asegúrate que la ruta a hooks sea correcta desde aquí

// Importación nombrada para ActivitiesDisplayList
import { mockTurbines } from "../../../src/mocks/turbines";
import { requiresBladeInspection as validateBladeInspectionRequired } from "../../../src/utils/bladeInspectionValidation"; // Import centralized blade inspection validation
import { ActivitiesDisplayList } from "./activities-display-list"; // Ajusta la ruta si es necesario
import ActivityControl from "./activity-control"; // Importamos el nuevo componente para control de actividad
import ActivitySuggestionsCard from "./activity-suggestions-card"; // Importamos el nuevo componente de sugerencias
import ActivityTimeline, { TimelineActivity } from "./activity-timeline"; // Importamos el componente y el tipo
import AlertsDisplayCard from "./alerts-display-card"; // Ajusta la ruta si es necesaria
import IncidentFormModal from "./incident-form-modal"; // Importamos el nuevo componente modal para incidentes
import MyIndicatorsButton from "./my-indicators-button"; // Ajusta la ruta si es necesaria
import { IncidentFormData } from "./new-incident-formmodal"; // Importamos el tipo desde el nuevo componente
import QuickActionsMenuCard from "./quick-actions-menu-card"; // Ajusta la ruta si es necesaria
import QuickRegisterActivityForm, {
  activityTypes,
} from "./quick-register-activity-form";

import {
  ChecklistItemData,
  pilot,
  initialCurrentProject as projectDataFromImport,
} from "./pilot-dashboard-data";

import { incidentTypes as importedIncidentTypes } from "../../../src/mocks/incident-types";

// Claves para almacenar datos en AsyncStorage
// const STORAGE_KEYS = {
//   CURRENT_PROJECT: 'pilot_dashboard_current_project',
//   ALERTS: 'pilot_dashboard_alerts',
//   ACTIVITY_PAUSE_STATE: 'pilot_dashboard_activity_pause',
// };

import { setGlobalProjectData } from '../../../src/utils/globalState';
import { Storage } from '../../../src/utils/storage';

// Función auxiliar para asignar iconos a las actividades
const getActivityIcon = (
  activityType: any,
  activity: any,
  isPaused = false
) => {
  let iconName = "briefcase-outline"; // Default icon

  if (activityType?.icon) {
    // Convertir MaterialCommunityIcons a Ionicons equivalentes
    if (activityType.icon === "wind-turbine") {
      iconName = "nuclear-outline"; // Icono para turbinas
    } else if (activityType.icon === "bus") {
      iconName = "car-outline";
    } else if (activityType.icon === "coffee") {
      iconName = "cafe-outline";
    } else if (activityType.icon === "food") {
      iconName = "restaurant-outline";
    } else if (activityType.icon === "weather-cloudy") {
      iconName = "rainy-outline";
    } else if (activityType.icon === "dots-horizontal") {
      iconName = "ellipsis-horizontal-outline";
    } else {
      iconName = activityType.icon;
    }
  } else if (activity) {
    // Determinar icono basado en el tipo y nombre de actividad
    const activityTypeLower = (activity.type || "").toLowerCase();
    const activityNameLower = (activity.name || "").toLowerCase();

    if (
      activityTypeLower.includes("turbine") ||
      activityTypeLower.includes("trabajo_turbina") ||
      activityNameLower.includes("turbina") ||
      activityNameLower.includes("aerogenerador")
    ) {
      iconName = "nuclear-outline";
    } else if (
      activityTypeLower.includes("inspection") ||
      activityTypeLower.includes("inspección")
    ) {
      iconName = "search-outline";
    } else if (
      activityTypeLower.includes("vuelo") ||
      activityTypeLower.includes("flight")
    ) {
      iconName = "airplane-outline";
    } else if (
      activityTypeLower.includes("maintenance") ||
      activityTypeLower.includes("mantenimiento")
    ) {
      iconName = "construct-outline";
    } else if (
      activityTypeLower.includes("transporte") ||
      activityTypeLower.includes("movilizacion")
    ) {
      iconName = "car-outline";
    } else if (
      activityTypeLower.includes("photo") ||
      activityTypeLower.includes("fotografía")
    ) {
      iconName = "camera-outline";
    } else if (
      activityTypeLower.includes("thermal") ||
      activityTypeLower.includes("térmico")
    ) {
      iconName = "thermometer-outline";
    } else if (
      activityTypeLower.includes("comida") ||
      activityTypeLower.includes("almuerzo")
    ) {
      iconName = "restaurant-outline";
    }
  }

  return (
    <Ionicons
      name={iconName as any}
      size={28}
      color={isPaused ? "#dc2626" : "#3b82f6"}
    />
  );
}; // Importamos el nuevo componente con sus datos

// Enhanced ProjectSummaryCard component with more information and visual improvements
function ProjectSummaryCard({
  project,
  name,
  client,
  onPress,
}: {
  project: any;
  name?: string;
  client?: string;
  onPress?: () => void;
}) {
  // Use project data or fallback to individual props
  const projectName = project?.name || name || "Proyecto sin Nombre";
  const projectClient = project?.client || client || "Cliente No Especificado";

  // Get status color and text
  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_PROGRESO":
        return "#rgb(16, 185, 129, 1)"; // Green
      case "COMPLETADO":
        return "#10b981";
      case "PAUSADO":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "EN_PROGRESO":
        return "En Progreso";
      case "COMPLETADO":
        return "Completado";
      case "PAUSADO":
        return "Pausado";
      default:
        return "Estado desconocido";
    }
  };
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{ width: "100%" }}
    >
      <View style={projectSummaryStyles.cardWrapper}>
        <View style={projectSummaryStyles.cardCompact}>
          <View style={projectSummaryStyles.headerRowCompact}>
            <View style={projectSummaryStyles.iconCircleCompact}>
              <Ionicons name="business-outline" size={20} color="#8b5cf6"/>
            </View>
            <View style={projectSummaryStyles.headerInfo}>
              <Text style={projectSummaryStyles.titleCompact}>
                {projectName}
              </Text>
              <Text style={projectSummaryStyles.subtitleCompact}>
                {projectClient}
              </Text>
              {project?.status && (
                <View
                  style={[
                    projectSummaryStyles.statusBadgeCompact,
                    {
                      backgroundColor: getStatusColor(project.status) + "20",
                      borderColor: getStatusColor(project.status),
                    }
                  ]}
                >
                  <View
                    style={[
                      projectSummaryStyles.statusDotCompact,
                      { backgroundColor: getStatusColor(project.status) },
                    ]}
                  ></View>
                  <Text
                    style={[
                      projectSummaryStyles.statusTextCompact,
                      { color: getStatusColor(project.status) },
                    ]}
                  >
                    {getStatusText(project.status)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ); // Ensure this matches the corresponding opening parenthesis
}

// Subtle Welcome Header component inspired by profile
function WelcomeHeader({
  pilotName,
  currentDate,
  weather,
  weatherLoading,
}: {
  pilotName: string;
  currentDate: string;
  weather: any;
  weatherLoading: boolean;
}) {
  const router = useRouter();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [hasNotifications, setHasNotifications] = useState(
    typeof window !== "undefined" && !!window.__hasNotifications
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        setHasNotifications(!!window.__hasNotifications);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  // Removed formatTime function since we're not showing time anymore

  const getWeatherIcon = (condition: string) => {
    const conditionLower = (condition || "").toLowerCase() || "";
    if (
      conditionLower.includes("sol") ||
      conditionLower.includes("despejado")
    ) {
      return "sunny-outline";
    } else if (
      conditionLower.includes("nublado") ||
      conditionLower.includes("nube")
    ) {
      return "partly-sunny-outline";
    } else if (
      conditionLower.includes("lluvia") ||
      conditionLower.includes("lluvioso")
    ) {
      return "rainy-outline";
    } else if (conditionLower.includes("viento")) {
      return "leaf-outline";
    }
    return "cloud-outline";
  };

  return (
    <View style={welcomeStyles.container}>
      <View style={welcomeStyles.header}>
        <View style={welcomeStyles.userSection}>
          <View style={welcomeStyles.avatarContainer}>
            <Image source={pilot.avatar} style={welcomeStyles.avatar} />
            <View style={welcomeStyles.statusIndicator} />
          </View>
          <View style={welcomeStyles.userInfo}>
            <Text style={welcomeStyles.name}>{pilotName}</Text>
            <Text style={welcomeStyles.role}>Piloto de Drones</Text>
            <Text style={welcomeStyles.dateText}>
              {formatDate(currentDateTime)}
            </Text>
          </View>
        </View>
        <View style={welcomeStyles.rightSection}>
          <TouchableOpacity
            style={welcomeStyles.notificationButton}
            onPress={() => router.push("/pilot/notifications")}
          >
            <Ionicons name="notifications-outline" size={20} color="#6b7280" />
            {hasNotifications && (
              <View style={welcomeStyles.notificationBadge} />
            )}
          </TouchableOpacity>
          {!weatherLoading && weather && (
            <View style={welcomeStyles.weatherSection}>
              <Ionicons
                name={getWeatherIcon(weather.condition)}
                size={16}
                color="#6b7280"
              />
              <Text style={welcomeStyles.weatherText}>
                {weather.temperature}°
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const projectSummaryStyles = StyleSheet.create({
  cardWrapper: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    marginTop: 0,
    marginBottom: 10,
    position: "relative",
  },
  toggleTab: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 0,
    // Enhanced shadow for better visual impact
    shadowColor: "#1f2937",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3e8ff', // Changed to purple background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e9d5ff', // Changed to purple border
  },
  headerInfo: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  // Compact styles for smaller project card
  cardCompact: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 0,
    shadowColor: "#1f2937",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  headerRowCompact: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  iconCircleCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3e8ff', // Changed to purple background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff', // Changed to purple border
  },
  titleCompact: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
    lineHeight: 20,
  },
  subtitleCompact: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 6,
  },
  statusBadgeCompact: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  statusDotCompact: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  statusTextCompact: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
}); // Asegúrate que la ruta sea correcta desde aquí

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
  turbineId?: string; // <-- Added for turbine work activities
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
  activityId?: string; // Optional field to associate incident with activity
  isBlocking?: boolean; // Whether the incident is blocking activity continuation
  blockingTimestamp?: string; // When the incident became blocking
  blockingReason?: string; // Reason why it became blocking
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
      id: "mock-pending-1",
      type: "TURBINE_INSPECTION",
      name: "Inspección Turbina T-01",
      status: "PENDIENTE",
      time: "Hoy - 09:00",
      scheduledStart: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
      description: "Inspección visual y termográfica de la turbina T-01.",
      turbineId: "turbine-001",
      actualStart: null,
      actualEnd: null,
      scheduledEnd: null,
      notes: "Verificar estado de palas y góndola.",
    },
    {
      id: "mock-pending-2",
      type: "FLIGHT_PLANNING",
      name: "Planificación de Vuelo Matutino",
      status: "PENDIENTE",
      time: "Hoy - 11:00",
      scheduledStart: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
      description:
        "Definir rutas de vuelo y verificar condiciones meteorológicas para inspecciones T-02 y T-03.",
      actualStart: null,
      actualEnd: null,
      scheduledEnd: null,
      notes: "Revisar NOTAMs y restricciones de espacio aéreo.",
    },
    {
      id: "mock-pending-3",
      type: "DOCUMENT_REVIEW",
      name: "Revisión de Documentación Pre-Operativa",
      status: "PENDIENTE",
      time: "Hoy - 14:00",
      scheduledStart: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
      description:
        "Revisar permisos de vuelo, manuales de operación de drones y protocolos de seguridad.",
      actualStart: null,
      actualEnd: null,
      scheduledEnd: null,
      notes: "Asegurar que toda la documentación esté actualizada y firmada.",
    },
  ],
  incidents: [
    {
      id: "inc-001",
      type: "SAFETY",
      label: "Viento Fuerte",
      description: "Ráfagas de viento superiores a 40 km/h.",
      timestamp: "2024-05-23T10:15:00Z",
      icon: "alert-circle-outline",
    },
  ],
  alerts: [
    {
      id: "alert-001",
      type: "INFO",
      message: "Mantenimiento programado para el dron DR-002 mañana.",
      timestamp: new Date(
        new Date().setDate(new Date().getDate() - 1)
      ).toISOString(), // Ayer
      severity: "LOW",
    },
    {
      id: "alert-002",
      type: "WARNING",
      message: "Batería baja en la estación meteorológica remota.",
      timestamp: new Date().toISOString(), // Hoy
      severity: "MEDIUM",
    },
  ],
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
    | "WELCOME_HEADER"
    | "PROJECT_SUMMARY_CARD"
    | "REGISTER_ACTIVITY_BUTTON"
    | "ACTIVITY_TIMELINE"
    | "ALERTS_DISPLAY_CARD"
    | "QUICK_ACTIONS_MENU_CARD"
    | "ACTIVITIES_DISPLAY_LIST"
    | "MY_INDICATORS_BUTTON"
    | "ACTIVITY_SUGGESTIONS";
};


const PilotDashboard = () => {
  console.log("PilotDashboard RENDERED - V5"); // Incremented version for clarity
  const router = useRouter();
  // Combine route params and URL query string, memoized
  const routeParams = useLocalSearchParams<{
    activityToStartAfterPreflight?: string;
    preflightCompletedForTurbine?: string;
    turbineIdForActivityStart?: string;
  }>();
  const params = useMemo(() => {
    const combined: Record<string, string> = { ...routeParams };
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      sp.forEach((value, key) => {
        combined[key] = value;
      });
    }
    return combined;
  }, [routeParams]);
  const currentPathname = usePathname(); // Get current pathname

  // Estado para pausa de actividad - MOVED EARLIER
  const [activityPauseState, setActivityPauseState] = useState<{
    isPaused: boolean;
    reason?: string;
    start?: string;
    end?: string;  }>({ isPaused: false });  const [bladeInspectionStatus, setBladeInspectionStatus] = useState<Record<string, boolean>>({});
  const [bladeInspectionTimingData, setBladeInspectionTimingData] = useState<any[]>([]);

  // Add ActivityContext hook
  const { addActivity, endActivity } = useActivity();

  // Helper function to map dashboard activity to ActivityContext format
  const mapToActivityContext = (dashboardActivity: Activity, startTime: Date) => {
    return {
      type: dashboardActivity.type || 'OTHER',
      startTime: startTime,
      notes: dashboardActivity.notes || dashboardActivity.description || '',
      operator: pilot.name, // Use pilot name from dashboard data
      turbineId: dashboardActivity.turbineId,
    };
  };

  // Inicializamos con datos por defecto, pero intentaremos cargar desde almacenamiento local
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
  const [isProjectDetailsVisible, setIsProjectDetailsVisible] = useState(true); // Estado para el componente de sugerencias de actividades
  const [showActivitySuggestions, setShowActivitySuggestions] = useState(false);
  const [suggestedActivities, setSuggestedActivities] = useState<Activity[]>(
    []
  );
  const [activityTerminationType, setActivityTerminationType] = useState<
    "completed" | "incident"
  >("completed");
  // Estado para el incidente actual
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);

  const {
    weather,
    loading: weatherLoading,
    error: weatherError,
  } = useWeather();
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
  // Ocultar las sugerencias cuando cambia la actividad actual
  useEffect(() => {
    const activityId = currentOngoingActivityForDisplay?.id;
    // Si el ID de la actividad actual cambia y se están mostrando sugerencias,
    // ocultamos las sugerencias
    if (activityId && showActivitySuggestions) {
      setShowActivitySuggestions(false);
    }
  }, [currentOngoingActivityForDisplay?.id, showActivitySuggestions]);
  const handleNavigate = useCallback(
    (route: string) => router.push(route as Href),
    [router]
  );
  // Handler for navigating to preflight checklist
  const handleGoToPreflightChecklist = useCallback(
    (turbineId?: string, activityIdToStart?: string) => {
      if (activityIdToStart) {
        try {
          router.push(
            `/pilot/preflight-checklist?turbineId=${
              turbineId || "default"
            }&activityToStart=${activityIdToStart}` as Href
          );
        } catch (error) {
          console.error(
            "Error al guardar actividad para iniciar después:",
            error
          );
          router.push(
            `/pilot/preflight-checklist?turbineId=${
              turbineId || "default"
            }` as Href
          );
        }
      } else {
        router.push(
          `/pilot/preflight-checklist?turbineId=${
            turbineId || "default"
          }` as Href
        );
      }
    },
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
    // Nueva función interna solo para forzar el actualStart al volver del checklist
  const handleActivityAction = useCallback(
    (activityId: string, newStatusString: string, taskType?: string) => {
      const newStatus = (newStatusString?.toUpperCase().replace(" ", "_") ||
        "PENDIENTE") as Activity["status"];
      
      setCurrentProject((prev) => {
        const updatedActivities = (prev.activities || []).map((act) => {
          if (act.id === activityId) {
            const updatedActivity = {
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
                  ? "Hoy - En curso"
                  : newStatus === "COMPLETADA"
                  ? "Hoy - Completada"
                  : act.time,
            };

            // Add activity to ActivityContext when it starts (status becomes EN_PROGRESO)
            if (newStatus === "EN_PROGRESO" && !act.actualStart) {
              const startTime = new Date();
              const activityContextData = mapToActivityContext(updatedActivity, startTime);
              addActivity(activityContextData);
            }

            return updatedActivity;
          }
          return act;
        });
        return { ...prev, activities: updatedActivities };
      });
    },
    [addActivity, mapToActivityContext]
  );

  // Handler to finish the currently ongoing activity
  const handleFinishCurrentActivity = useCallback(() => {
    if (currentOngoingActivityForDisplay) {
      handleActivityAction(currentOngoingActivityForDisplay.id, "COMPLETADA");
    }
  }, [currentOngoingActivityForDisplay, handleActivityAction]);

  const handleStartPendingActivity = useCallback(
    (activityId: string) => {
      const activityToStart = activities.find((act) => act.id === activityId);

      if (
        activityToStart &&
        (activityToStart.type === "TURBINE_WORK" ||
          activityToStart.name?.toLowerCase().includes("turbina") ||
          activityToStart.type?.toLowerCase().includes("turbine")) &&
        activityToStart.turbineId
      ) {
        // Redirigir directo al checklist prevuelo para actividades de turbina, sin Alert
        handleGoToPreflightChecklist(activityToStart.turbineId, activityId);
        return;
      }

      if (currentOngoingActivityForDisplay) {
        if (currentOngoingActivityForDisplay.id !== activityId) {
          handleActivityAction(
            currentOngoingActivityForDisplay.id,
            "COMPLETADA"
          );
        }
      }
      handleActivityAction(activityId, "EN_PROGRESO");
      setShowActivitySuggestions(false);
    },
    [
      activities,
      currentOngoingActivityForDisplay,
      handleActivityAction,
      handleGoToPreflightChecklist,
      setShowActivitySuggestions,
    ]
  );

  const handleDismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => {
      const updatedAlerts = prev.filter((a) => a.id !== alertId);
      return updatedAlerts;
    });
  }, []);
  const toggleAlertsSection = useCallback(
    () => setIsAlertsSectionVisible((prev) => !prev),
    []
  );
  const handleOpenNewActivityModal = useCallback(
    () => setIsNewActivityModalVisible(true),
    []
  );

  const handleOpenNewIncidentModal = useCallback(
    // Defined handleOpenNewIncidentModal
    () => setIsNewIncidentModalVisible(true),
    []
  );

  const toggleProjectDetails = useCallback(
    // Defined toggleProjectDetails
    () => setIsProjectDetailsVisible((prev) => !prev),
    []
  );

  const handleCreateQuickActivity = useCallback(
    (activityData: any) => {
      const isForNow = activityData.isForNow;
      const now = new Date();
      const timeString = "Hoy";
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
      };      setCurrentProject((prev) => {
        let baseActivities = [...(prev.activities || [])];
        if (isForNow) {
          const currentOngoing = baseActivities.find(
            (act) => act.status === "EN_PROGRESO"
          );
          if (currentOngoing) {
            baseActivities = baseActivities.map((act) =>
              act.id === currentOngoing.id                ? {
                    ...act,
                    status: "COMPLETADA" as Activity["status"],
                    actualEnd: now.toISOString(),
                    time: `Hoy - Completada`,
                  }
                : act
            );
          }
        }
        const updatedProject = {
          ...prev,
          activities: [newActivity, ...baseActivities],
        };

        return updatedProject;
      });

      // Clear any current incident and pause state when starting a new activity
      if (isForNow) {
        setCurrentIncident(null);
        setActivityPauseState({ isPaused: false });
      }

      setIsNewActivityModalVisible(false);
      Alert.alert(
        "Éxito",
        `Actividad "${newActivity.name}" ${
          isForNow ? "iniciada" : "programada"
        }.`
      );
    },
    [] // Depends on setCurrentProject, setIsNewActivityModalVisible, mockTurbines, activityTypes
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
  const dashboardSections = useMemo(
    (): DashboardSectionItem[] => [
      { id: "welcome-header", type: "WELCOME_HEADER" },
      { id: "project-summary", type: "PROJECT_SUMMARY_CARD" },
      ...(showActivitySuggestions ? [{ id: "activity-suggestions", type: "ACTIVITY_SUGGESTIONS" as const }] : []),
      { id: "quickActions", type: "QUICK_ACTIONS_MENU_CARD" },
      { id: "timeline", type: "ACTIVITY_TIMELINE" },
    ],
    [showActivitySuggestions]
  );

  const handleDeleteActivity = useCallback((activityId: string) => {
    setCurrentProject((prev) => {
      const updatedProject = {
        ...prev,
        activities: (prev.activities || []).filter(
          (act) => act.id !== activityId
        ),
      };
      return updatedProject;
    });

    Alert.alert(
      "Actividad eliminada",
      "La actividad ha sido eliminada correctamente."
    );
  }, []);

  const activityPauseReason = ""; // For storing pause reason input - removed setActivityPauseReason as it's not used

  const handleStartJornada = useCallback(() => {
    setIsNewActivityModalVisible(true);
  }, [setIsNewActivityModalVisible]);

  const handlePauseActivity = useCallback(
    (reason: string) => {
      if (!currentOngoingActivityForDisplay) return;

      const newPauseState = {
        isPaused: true,
        reason,
        start: new Date().toISOString(),
      };
      setActivityPauseState(newPauseState);

      setCurrentProject((prev) => {
        const updatedProject = {
          ...prev,
          activities: (prev.activities || []).map((act) =>
            act.id === currentOngoingActivityForDisplay.id
              ? {
                  ...act,
                  pauseHistory: [
                    ...(act.pauseHistory || []),
                    { reason, start: new Date().toISOString() },
                  ],
                }
              : act
          ),
        };

        return updatedProject;
      });
    },
    [currentOngoingActivityForDisplay, setActivityPauseState]
  );

  const resumeActivityAfterIncidentResolution = useCallback(() => {
    if (!currentOngoingActivityForDisplay) return;

    const newPauseState = { isPaused: false };
    setActivityPauseState(newPauseState);
    // Clear current incident when resuming activity
    setCurrentIncident(null);

    setCurrentProject((prev) => {
      const updatedProject = {
        ...prev,
        activities: (prev.activities || []).map((act) =>
          act.id === currentOngoingActivityForDisplay.id &&
          act.pauseHistory?.length
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
      };

      return updatedProject;
    });
  }, [
    currentOngoingActivityForDisplay,
    setActivityPauseState,
    setCurrentIncident,
    setCurrentProject,
  ]);

  const handleResumeActivity = useCallback(() => {
    if (!currentOngoingActivityForDisplay) return;

    // Check if there's a blocking incident
    if (currentIncident && currentIncident.isBlocking) {
      Alert.alert(
        "⚠️ Incidente Bloqueante",
        `No se puede reanudar la actividad mientras hay un incidente bloqueante sin resolver: "${
          currentIncident.label
        }"\n\n${
          currentIncident.blockingReason ||
          "Este incidente requiere resolución inmediata."
        }`,
        [
          {
            text: "Marcar como Resuelto",
            onPress: () => {
              setCurrentIncident(null);
              // Continue with resume after resolving incident
              resumeActivityAfterIncidentResolution();
            },
          },
          { text: "Cancelar", style: "cancel" },
        ]
      );
      return;
    }

    resumeActivityAfterIncidentResolution();
  }, [
    currentOngoingActivityForDisplay,
    currentIncident,
    resumeActivityAfterIncidentResolution,
    setCurrentIncident,
  ]);

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
        activityId:
          incidentData.activityId || currentOngoingActivityForDisplay?.id, // Associate with current activity
        isBlocking: incidentData.isBlocking || false, // Set blocking status from form
        blockingTimestamp: incidentData.isBlocking
          ? new Date().toISOString()
          : undefined,
        blockingReason: incidentData.isBlocking
          ? "Marcado como bloqueante por el piloto"
          : undefined,
      };

      // Set current incident state only if it's associated with the current activity
      if (newIncident.activityId === currentOngoingActivityForDisplay?.id) {
        setCurrentIncident(newIncident);

        // Pause current activity
        const pauseReason = `Incidente: ${newIncident.label} - ${newIncident.description}`;
        handlePauseActivity(pauseReason);
      }

      setCurrentProject((prev) => {
        const updatedProject = {
          ...prev,
          incidents: [...(prev.incidents || []), newIncident],
        };        return updatedProject;
      });
      setIsNewIncidentModalVisible(false);
    },
    [currentOngoingActivityForDisplay, handlePauseActivity] // Updated dependencies
  );

  const handleFinishActivity = useCallback(() => {
    if (!currentOngoingActivityForDisplay) return;

    const activityId = currentOngoingActivityForDisplay.id;
    const requiresBladeInspection = isBladeInspectionRequired(currentOngoingActivityForDisplay);

    // Check if blade inspection is required and not completed
    if (requiresBladeInspection && !hasCompletedBladeInspection(activityId)) {
      Alert.alert(
        '⚠️ Inspección de Aspas Requerida',
        'Para finalizar esta actividad de turbina, debe completar la inspección de todas las aspas.',
        [
          {
            text: 'Ir a Inspección',
            onPress: () => {
              const turbineId = currentOngoingActivityForDisplay.turbineId || 
                              currentOngoingActivityForDisplay.id.replace('turbine-', '') ||
                              'default';
              router.push(`/pilot/blade-inspection-detail?turbineId=${turbineId}&activityId=${activityId}`);
            }
          },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
      return;
    }

    // Clear pause state immediately
    setActivityPauseState({ isPaused: false });

    // Clear current incident if any
    setCurrentIncident(null);

    // Mark activity as completed with proper timestamp
    const completionTime = new Date().toISOString();
    
    setCurrentProject((prev) => {
      const updatedActivities = (prev.activities || []).map((act) =>
        act.id === activityId ? {
          ...act,
          status: "COMPLETADA" as Activity["status"],
          actualEnd: completionTime,
          time: "Hoy - Completada",
          // Ensure we close any open pause periods
          pauseHistory: (act.pauseHistory || []).map((pause, idx, arr) =>
            idx === arr.length - 1 && !pause.end
              ? { ...pause, end: completionTime }
              : pause
          ),
        } : act
      );
        const updatedProject = { ...prev, activities: updatedActivities };
      
      // Save to storage immediately in a separate async operation
      const saveToStorage = async () => {
        try {
          await Storage.setItem('pilot_dashboard_current_project', JSON.stringify(updatedProject));
          console.log("Activity completed and saved to storage:", activityId);
        } catch (error) {
          console.error("Error saving completed activity to storage:", error);
        }
      };
      saveToStorage();
      
      return updatedProject;
    });    
    
    // Also add the completed activity to ActivityContext for the activity log
    endActivity(activityId, new Date());
    
    setActivityTerminationType("completed");

    // Prepare next activity suggestions
    const pendingForToday = pendingTodayActivities.filter(
      (act) => act.id !== activityId
    );
    const genericPendingToShow = genericPendingActivities.filter(
      (act) => act.id !== activityId
    );    // Show immediate smooth transition for activity suggestions
    if (pendingForToday.length > 0 || genericPendingToShow.length > 0) {
      // Prepare new suggestions immediately
      const newSuggestions = pendingForToday.length > 0 
        ? pendingForToday.slice(0, 3) 
        : genericPendingToShow.slice(0, 3);
      
      // Set both state values in the same call to prevent visual gaps
      setSuggestedActivities(newSuggestions);
      setShowActivitySuggestions(true);
    } else {
      // No suggestions to show, just hide any existing ones
      setShowActivitySuggestions(false);
    }
  }, [
    currentOngoingActivityForDisplay,
    pendingTodayActivities,
    genericPendingActivities,
    setActivityPauseState,
    setCurrentIncident,
    showActivitySuggestions,
    setShowActivitySuggestions,
    setActivityTerminationType,
    setSuggestedActivities,
    router,
    bladeInspectionStatus
  ]);
  // Handler para el cambio de estado de la actividad al volver del checklist
  // Save project state to storage whenever it changes
  useEffect(() => {
    const saveProjectToStorage = async () => {
      try {
        await Storage.setItem('pilot_dashboard_current_project', JSON.stringify(currentProject));
        console.log("Saved project to storage:", currentProject.name, "Activities:", currentProject.activities?.length);
        
        // Also set global data for React Native components
        setGlobalProjectData(currentProject);
      } catch (error) {
        console.error("Error saving project to storage:", error);
      }
    };
      saveProjectToStorage();
  }, [currentProject]);

  // Load project state from storage on mount ONLY
  useEffect(() => {
    const loadStoredProject = async () => {
      try {
        const stored = await Storage.getItem('pilot_dashboard_current_project');
        if (stored) {
          const project = JSON.parse(stored);
          setCurrentProject(project);
          console.log("Loaded project from storage:", project.name, "Activities:", project.activities?.length);
          // Set global data with loaded project
          setGlobalProjectData(project);
        } else {
          // Set initial global data with current project if no stored data
          setGlobalProjectData(typedProjectData);
        }
      } catch (error) {
        console.error("Error loading project from storage:", error);
        // Fallback to setting current project data
        setGlobalProjectData(typedProjectData);
      }
    };
    
    loadStoredProject();
  }, []); // Empty dependency array - only run once on mount

  // Efecto para iniciar la actividad de turbina después del checklist prevuelo
  useEffect(() => {
    const { 
      activityToStartAfterPreflight, 
      preflightCompletedForTurbine, 
      turbineIdForActivityStart,
      isNewTurbineActivity 
    } = params;
    
    console.log("Dashboard checking preflight params:", { 
      activityToStartAfterPreflight, 
      preflightCompletedForTurbine,
      turbineIdForActivityStart, 
      isNewTurbineActivity,
      allParams: params,
      currentActivitiesCount: activities.length
    });
    
    if (preflightCompletedForTurbine === "true" && turbineIdForActivityStart) {
      if (activityToStartAfterPreflight) {
        // Comprobar si es una actividad existente o una nueva
        const existingActivity = activities.find(act => act.id === activityToStartAfterPreflight);
        
        if (existingActivity) {
          console.log("Starting existing activity:", existingActivity.id);
          // Si es una actividad existente, la marcamos como EN_PROGRESO
          setCurrentProject((prev) => {
            const updatedActivities = (prev.activities || []).map((act) =>
              act.id === activityToStartAfterPreflight && act.status !== "EN_PROGRESO" ? {
                ...act,
                status: "EN_PROGRESO" as Activity["status"],
                actualStart: new Date().toISOString(),
                time: "Hoy - En curso",
              } : act
            );
            return { ...prev, activities: updatedActivities };
          });

          // Clear any pause state and show success message
          setActivityPauseState({ isPaused: false });
          
          setTimeout(() => {
            Alert.alert(
              "✅ Actividad Iniciada", 
              `Se ha iniciado la actividad: ${existingActivity.name}`
            );
          }, 500);
        } else if (isNewTurbineActivity === "true") {
          console.log("Creating new turbine activity:", activityToStartAfterPreflight);
          
          // Pause any currently ongoing activity first
          setCurrentProject(prev => {
            const currentOngoing = (prev.activities || []).find(act => act.status === "EN_PROGRESO");
            let updatedActivities = prev.activities || [];
            
            if (currentOngoing) {
              console.log("Pausing current ongoing activity:", currentOngoing.id);
              updatedActivities = updatedActivities.map(act =>
                act.id === currentOngoing.id ? {
                  ...act,
                  status: "COMPLETADA" as Activity["status"],
                  actualEnd: new Date().toISOString(),
                  time: "Hoy - Completada",
                } : act
              );
            }
            
            return { ...prev, activities: updatedActivities };
          });
          
          // Create new turbine activity
          const now = new Date();
          const turbineId = turbineIdForActivityStart;
          
          // Find turbine by ID with fallback for format differences
          let turbine = mockTurbines.find((t: { id: string; name: string }) => t.id === turbineId);
          if (!turbine) {
            // Try with underscore replacement
            turbine = mockTurbines.find((t: { id: string }) => t.id === turbineId.replace(/_/g, '-'));
          }
          if (!turbine) {
            // Try with dash replacement
            turbine = mockTurbines.find((t: { id: string }) => t.id === turbineId.replace(/-/g, '_'));
          }
          
          const turbineName = turbine?.name || `Turbina ${turbineIdForActivityStart.replace(/[_-]/g, '')}`;
          
          const newTurbineActivity: Activity = {
            id: activityToStartAfterPreflight,
            type: "TURBINE_WORK",
            name: `Trabajo en ${turbineName}`,
            notes: `Inspección y trabajo en ${turbineName}`,
            status: "EN_PROGRESO",
            time: "Hoy - En curso",
            description: `Trabajo en turbina ${turbineName}`,
            turbineId: turbineId,
            actualStart: now.toISOString(),
            scheduledStart: now.toISOString(),
            scheduledEnd: null,
            actualEnd: null,
          };
          
          console.log("New activity created:", newTurbineActivity);
          
          // Add the new activity and ensure it's at the top
          setCurrentProject(prev => {
            const prevActivities = Array.isArray(prev.activities) ? prev.activities : [];
              const updatedProject = {
              ...prev,
              activities: [newTurbineActivity, ...prevActivities]
            };
            
            // Save to storage immediately in a separate async operation
            const saveToStorage = async () => {
              try {
                await Storage.setItem('pilot_dashboard_current_project', JSON.stringify(updatedProject));
                console.log("Immediately saved new turbine activity to storage");
              } catch (error) {
                console.error("Error saving to storage:", error);
              }
            };
            saveToStorage();
            
            return updatedProject;
          });
          
          // Clear any pause state
          setActivityPauseState({ isPaused: false });
          
          // Show confirmation that activity started
          setTimeout(() => {
            Alert.alert(
              "✅ Actividad Iniciada", 
              `Se ha iniciado el trabajo en la turbina ${turbineName}`
            );
          }, 500);
        }
      }
      
      // Clear URL parameters to prevent infinite restarts
      const newParams = { ...params };
      delete newParams.activityToStartAfterPreflight;
      delete newParams.preflightCompletedForTurbine;
      delete newParams.turbineIdForActivityStart;
      delete newParams.timestamp;
      delete newParams.isNewTurbineActivity;
      
      if (Object.keys(newParams).length < Object.keys(params).length) {
        router.replace({
          pathname: currentPathname,
          params: newParams,
        } as any);      }
    }
  }, [params, router, currentPathname, activities, setActivityPauseState]);
  // Effect para manejar la finalización de la inspección de aspas
  useEffect(() => {
    const {
      bladeInspectionCompleted,
      turbineId: completedTurbineId,
      activityId: completedActivityId,
      keepActivityRunning,
      bladeTimingData: bladeTimingDataString
    } = params;

    if (bladeInspectionCompleted === 'true' && completedTurbineId && completedActivityId) {
      console.log(`[Dashboard Effect] Blade inspection completed for turbine ${completedTurbineId}`);
      
      // Extract and parse blade timing data
      if (bladeTimingDataString) {
        try {
          const parsedTimingData = JSON.parse(bladeTimingDataString);
          console.log('[Dashboard Effect] Parsed blade timing data:', parsedTimingData);
          setBladeInspectionTimingData(parsedTimingData);
        } catch (error) {
          console.error('[Dashboard Effect] Failed to parse blade timing data:', error);
        }
      }
      
      // Mark the blade inspection as completed
      setBladeInspectionStatus(prev => ({
        ...prev,
        [completedActivityId]: true
      }));

      // Only mark activity as completed if keepActivityRunning is not set
      if (keepActivityRunning !== 'true') {
        setCurrentProject((prev) => {
          const updatedActivities = (prev.activities || []).map((act) =>
            act.id === completedActivityId
              ? {
                  ...act,
                  status: "COMPLETADA" as Activity["status"],
                  actualEnd: new Date().toISOString(),
                  time: "Hoy - Completada",
                }
              : act
          );
          return { ...prev, activities: updatedActivities };
        });

        // Show activity suggestions for next activities
        const pendingForToday = pendingTodayActivities.filter(
          (act) => act.id !== completedActivityId
        );
        const genericPendingToShow = genericPendingActivities.filter(
          (act) => act.id !== completedActivityId
        );

        if (pendingForToday.length > 0) {
          setSuggestedActivities(pendingForToday.slice(0, 3));
          setShowActivitySuggestions(true);
        } else if (genericPendingToShow.length > 0) {
          setSuggestedActivities(genericPendingToShow.slice(0, 3));
          setShowActivitySuggestions(true);
        } else {
          setShowActivitySuggestions(false);
        }
      }

      // Clear pause state if activity was paused
      setActivityPauseState({ isPaused: false });

      // Show success message - different based on whether activity is kept running
      setTimeout(() => {
        Alert.alert(
          keepActivityRunning === 'true' ? "✅ Checklist Completado" : "✅ Actividad Completada", 
          keepActivityRunning === 'true' 
            ? "La inspección de aspas ha sido completada exitosamente. Ya puede finalizar la actividad."
            : "La inspección de aspas y la actividad han sido completadas exitosamente."
        );
      }, 500);      // Clear the params
      const newParams = { ...params };
      delete newParams.bladeInspectionCompleted;
      delete newParams.turbineId;
      delete newParams.activityId;
      delete newParams.timestamp;
      delete newParams.keepActivityRunning;
      delete newParams.showSuggestions;
      delete newParams.bladeTimingData;
      
      if (Object.keys(newParams).length < Object.keys(params).length) {
        router.replace({
          pathname: currentPathname,
          params: newParams,
        } as any);
      }
    }  }, [params, currentPathname, router, setCurrentProject, pendingTodayActivities, genericPendingActivities, setSuggestedActivities, setShowActivitySuggestions, setActivityPauseState]);

  // Use centralized blade inspection validation - returns true if inspection IS required
  const isBladeInspectionRequired = (activity: any) => {
    return validateBladeInspectionRequired(activity);
  };

  const hasCompletedBladeInspection = (activityId: string) => {
    return bladeInspectionStatus[activityId] === true;
  };

  // Add a stub for handleToggleIncidentBlocking to fix the error
  const handleToggleIncidentBlocking = useCallback(() => {
    // Implement logic to toggle incident blocking if needed
    Alert.alert("Funcionalidad no implementada", "El cambio de estado de bloqueo de incidente aún no está implementado.");
  }, []);
  // Stub para finalizar actividad por incidente bloqueante
  const handleFinishActivityByBlockingIncident = useCallback(() => {
    if (currentOngoingActivityForDisplay) {
      Alert.alert(
        "Finalizar por Incidente",
        `La actividad "${currentOngoingActivityForDisplay.name}" se finalizará debido al incidente actual. ¿Continuar?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sí, finalizar",
            onPress: () => {
              const activityId = currentOngoingActivityForDisplay.id;
              const completionTime = new Date().toISOString();
              
              // Mark activity as completed
              setCurrentProject((prev) => {
                const updatedActivities = (prev.activities || []).map((act) =>
                  act.id === activityId ? {
                    ...act,
                    status: "COMPLETADA" as Activity["status"],
                    actualEnd: completionTime,
                    time: "Hoy - Completada (Por Incidente)",
                    pauseHistory: (act.pauseHistory || []).map((pause, idx, arr) =>
                      idx === arr.length - 1 && !pause.end
                        ? { ...pause, end: completionTime }
                        : pause
                    ),
                  } : act
                );
                const updatedProject = { ...prev, activities: updatedActivities };
                
                // Save to storage immediately in a separate async operation
                const saveToStorage = async () => {
                  try {
                    await Storage.setItem('pilot_dashboard_current_project', JSON.stringify(updatedProject));
                    console.log("Activity completed by incident and saved to storage:", activityId);
                  } catch (error) {
                    console.error("Error saving activity completion to storage:", error);
                  }
                };
                saveToStorage();

                return updatedProject;              });

              // Also add the completed activity to ActivityContext for the activity log
              endActivity(activityId, new Date());

              // Clear states
              setCurrentIncident(null);
              setActivityPauseState({ isPaused: false });
              
              // Set termination type to incident for suggestions
              setActivityTerminationType("incident");
                // Show suggestions for next activities after incident termination
              const pendingForToday = pendingTodayActivities.filter(
                (act) => act.id !== activityId
              );
              const genericPendingToShow = genericPendingActivities.filter(
                (act) => act.id !== activityId
              );

              // Show activity suggestions immediately for smooth transition
              if (pendingForToday.length > 0) {
                setSuggestedActivities(pendingForToday.slice(0, 3));
                setShowActivitySuggestions(true);
              } else if (genericPendingToShow.length > 0) {
                setSuggestedActivities(genericPendingToShow.slice(0, 3));
                setShowActivitySuggestions(true);
              } else {
                setShowActivitySuggestions(false);
              }
            },
          },
        ]
      );
    } else {
      Alert.alert("Error", "No hay actividad en curso para finalizar por incidente.");
    }  }, [
    currentOngoingActivityForDisplay,
    setCurrentProject,
    setCurrentIncident,
    setActivityPauseState,
    setShowActivitySuggestions,
    genericPendingActivities,
    pendingTodayActivities,
  ]);

  const renderDashboardSection = useCallback(
    ({ item }: { item: DashboardSectionItem }) => {
      switch (item.type) {
        case "WELCOME_HEADER":
          return (
            <WelcomeHeader
              pilotName={pilot.name}
              currentDate={new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              weather={weather}
              weatherLoading={weatherLoading}
            />
          );
        case "PROJECT_SUMMARY_CARD":
          return (
            <ProjectSummaryCard
              project={currentProject}
              onPress={() =>
                router.push("/pilot/activity-log?initialTab=project")
              }
            />
          );
        case "ACTIVITY_TIMELINE": {
          // Create dynamic timeline based on actual activity data with improved spacing
          const timelineActivities: TimelineActivity[] = [];
          // Add current ongoing activity if any
          if (currentOngoingActivityForDisplay) {
            const activityType = activityTypes.find(
              (t) => t.type === currentOngoingActivityForDisplay.type
            );
            const isTurbineWork =
              currentOngoingActivityForDisplay.type === "TURBINE_WORK" ||
              currentOngoingActivityForDisplay.type
                ?.toLowerCase()
                .includes("turbine");
            timelineActivities.push({
              id: currentOngoingActivityForDisplay.id,
              icon: getActivityIcon(
                activityType,
                currentOngoingActivityForDisplay,
                activityPauseState.isPaused
              ),
              title: currentOngoingActivityForDisplay.name,
              time: currentOngoingActivityForDisplay.time || "En curso",
              duration: undefined,
              statusColor: activityPauseState.isPaused ? "#dc2626" : "#3b82f6",
              statusLabel: activityPauseState.isPaused ? "Pausada" : "En curso",
              statusBg: activityPauseState.isPaused ? "#fee2e2" : "#dbeafe",
              isPaused: activityPauseState.isPaused,
              isTurbineWork: isTurbineWork,
              turbineId:
                currentOngoingActivityForDisplay.turbineId ||
                currentOngoingActivityForDisplay.id,
            });
          }
          // Show all upcoming activities for today (removed slice limit)
          const upcomingTodayActivities = pendingTodayActivities;
          upcomingTodayActivities.forEach((activity, index) => {
            const activityType = activityTypes.find(
              (t) => t.type === activity.type
            );
            const isTurbineWork =
              activity.type === "TURBINE_WORK" ||
              activity.type?.toLowerCase().includes("turbine");
            // Enhanced icon assignment with more specific fallbacks
            let iconName: any = "briefcase-outline"; // Default fallback
            if (activityType?.icon) {
              // Convertir MaterialCommunityIcons a Ionicons equivalentes para consistencia
              if (activityType.icon === "wind-turbine") {
                iconName = "nuclear-outline"; // Usamos nuclear como icono para turbinas
              } else if (activityType.icon === "bus") {
                iconName = "car-outline";
              } else if (activityType.icon === "coffee") {
                iconName = "cafe-outline";
              } else if (activityType.icon === "food") {
                iconName = "restaurant-outline";
              } else if (activityType.icon === "weather-cloudy") {
                iconName = "rainy-outline";
              } else if (activityType.icon === "dots-horizontal") {
                iconName = "ellipsis-horizontal-outline";
              } else if (activityType.icon !== "briefcase") {
                iconName = activityType.icon;
              }
            } else {
              // Enhanced fallback icons based on activity type patterns
              const activityTypeLower = (activity.type || "").toLowerCase();
              const activityNameLower = (activity.name || "").toLowerCase();

              if (
                activityTypeLower.includes("turbine") ||
                activityTypeLower.includes("trabajo_turbina") ||
                activityNameLower.includes("turbina") ||
                activityNameLower.includes("aerogenerador")
              ) {

                                                            
                                                             iconName = "nuclear-outline"; // Icono para trabajo en turbinas
              } else if (
                activityTypeLower.includes("inspection") ||
                activityTypeLower.includes("inspección") ||
                activityNameLower.includes("inspección") ||
                activityNameLower.includes("revisar") ||
                activityNameLower.includes("inspeccionar")
              ) {
                iconName = "search-outline";
              } else if (
                activityTypeLower.includes("vuelo") ||
                activityTypeLower.includes("flight") ||
                activityNameLower.includes("vuelo") ||
                activityNameLower.includes("aéreo") ||
                activityNameLower.includes("dron") ||
                activityNameLower.includes("drone")
              ) {
                iconName = "airplane-outline";
              } else if (
                activityTypeLower.includes("maintenance") ||
                activityTypeLower.includes("mantenimiento") ||
                activityNameLower.includes("mantenimiento") ||
                activityNameLower.includes("reparación") ||
                activityNameLower.includes("arreglo") ||
                activityNameLower.includes("fix")
              ) {
                iconName = "construct-outline";
              } else if (
                activityTypeLower.includes("transporte") ||
                activityTypeLower.includes("movilizacion") ||
                activityTypeLower.includes("traslado") ||
                activityNameLower.includes("transporte") ||
                activityNameLower.includes("mover") ||
                activityNameLower.includes("traslado") ||
                activityNameLower.includes("viaje")
              ) {
                iconName = "car-outline";
              } else if (
                activityTypeLower.includes("photo") ||
                activityTypeLower.includes("fotografía") ||
                activityNameLower.includes("foto") ||
                activityNameLower.includes("imagen")
              ) {
                iconName = "camera-outline";
              } else if (
                activityTypeLower.includes("thermal") ||
                activityTypeLower.includes("térmico") ||
                activityNameLower.includes("térmico") ||
                activityNameLower.includes("termográfico") ||
                activityNameLower.includes("temperatura")
              ) {
                iconName = "thermometer-outline";
              } else if (
                activityTypeLower.includes("comida") ||
                activityTypeLower.includes("almuerzo") ||
                activityNameLower.includes("comida") ||
                activityNameLower.includes("almuerzo") ||
                activityNameLower.includes("cena") ||
                activityNameLower.includes("desayuno")
              ) {
                iconName = "restaurant-outline";
              } else if (
                activityTypeLower.includes("desmovilizacion") ||
                activityTypeLower.includes("hotel") ||
                activityNameLower.includes("hotel") ||
                activityNameLower.includes("desmovilización") ||
                activityNameLower.includes("hospedaje") ||
                activityNameLower.includes("alojamiento")
              ) {
                iconName = "home-outline";
              } else if (
                activityTypeLower.includes("tiempo_muerto") ||
                activityTypeLower.includes("espera") ||
                activityTypeLower.includes("break") ||
                activityTypeLower.includes("pausa") ||
                activityNameLower.includes("espera") ||
                activityNameLower.includes("tiempo muerto") ||
                activityNameLower.includes("descanso") ||
                activityNameLower.includes("pausa")
              ) {
                iconName = "hourglass-outline";
              } else {
                // Assign different icons based on index for variety
                const fallbackIcons = [
                  "clipboard-outline",
                  "document-text-outline",
                  "layers-outline",
                  "folder-outline",
                ];
                iconName = fallbackIcons[index % fallbackIcons.length];
              }
            }
            timelineActivities.push({
              id: activity.id,
              icon: <Ionicons name={iconName} size={28} color="#f59e0b" />,
              title: activity.name,
              time: activity.time || "Programada",
              duration: undefined,
              statusColor: "#f59e0b",
              statusLabel: "Próxima",
              statusBg: "#fef3c7",
              isTurbineWork: isTurbineWork,
              turbineId: activity.turbineId || activity.id,
            });
          });

          // Show all future activities (removed slice limit)
          const futureActivities = genericPendingActivities;
          futureActivities.forEach((activity, index) => {
            const activityType = activityTypes.find(
              (t) => t.type === activity.type
            );
            const isTurbineWork =
              activity.type === "TURBINE_WORK" ||
              activity.type?.toLowerCase().includes("turbine");

            // Parse scheduled start to show better time info
            let timeDisplay = "Programada";
            if (activity.scheduledStart) {
              const scheduledDate = new Date(activity.scheduledStart);
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);

              if (scheduledDate.toDateString() === tomorrow.toDateString()) {
                timeDisplay = `Mañana, ${scheduledDate.toLocaleTimeString(
                  "es-ES",
                  { hour: "2-digit", minute: "2-digit" }
                )}`;
              } else if (scheduledDate > tomorrow) {
                timeDisplay = scheduledDate.toLocaleDateString("es-ES", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
              }
            } // Enhanced future activity icon assignment
            let iconName: any = "calendar-outline"; // Default for future
            if (activityType?.icon) {
              // Convertir MaterialCommunityIcons a Ionicons equivalentes para consistencia
              if (activityType.icon === "wind-turbine") {
                iconName = "nuclear-outline";
              } else if (activityType.icon === "bus") {
                iconName = "car-outline";
              } else if (activityType.icon === "coffee") {
                iconName = "cafe-outline";
              } else if (activityType.icon === "food") {
                iconName = "restaurant-outline";
              } else if (activityType.icon === "weather-cloudy") {
                iconName = "rainy-outline";
              } else if (activityType.icon === "dots-horizontal") {
                iconName = "ellipsis-horizontal-outline";
              } else if (activityType.icon !== "briefcase") {
                iconName = activityType.icon;
              }
            } else {
              const activityTypeLower = (activity.type || "").toLowerCase();
              const activityNameLower = (activity.name || "").toLowerCase();
              // Add more specific fallbacks for future activities if needed
              if (
                activityTypeLower.includes("turbine") ||
                activityNameLower.includes("turbina")
              ) {
                iconName = "nuclear-outline";
              }
              // ... (otros fallbacks si son necesarios para actividades futuras)
            }

            timelineActivities.push({
              id: activity.id,
              icon: <Ionicons name={iconName} size={28} color="#6b7280" />, // Neutral color for future
              title: activity.name,
                           time: timeDisplay,
              duration: undefined,
              statusColor: "#6b7280",
              statusLabel: "Futura",
              statusBg: "#f3f4f6",
              isTurbineWork: isTurbineWork,
              turbineId: activity.turbineId || activity.id,
            });
          });
          const renderTimelineContent = () => {
            return (
              <ActivityTimeline
                activities={timelineActivities}
                onViewHistory={() => handleNavigate("/pilot/activity-log")}
                onItemPress={(item: TimelineActivity) => {
                  if (item.isTurbineWork && item.turbineId) {
                    router.push(`/pilot/turbines/${item.turbineId}` as Href);
                  } else {
                    console.log("Timeline item pressed:", item.id);
                  }
                }}
                onActionPress={(
                  action: string,
                  activityId: string,
                  turbineId?: string
                ) => {
                  const activity = activities.find(
                    (act) => act.id === activityId
                  );
                  const isTurbine =
                    activity &&
                    (activity.type === "TURBINE_WORK" ||
                      activity.type === "TURBINE_INSPECTION" ||
                      activity.name?.toLowerCase().includes("turbina") ||
                      activity.type?.toLowerCase().includes("turbine"));
                  if (action === "start_pending" && isTurbine && turbineId) {
                    // Redirigir directo al checklist prevuelo para actividades de turbina
                    handleGoToPreflightChecklist(turbineId, activityId);
                  } else if (action === "start_pending" && activityId) {
                    handleStartPendingActivity(activityId);
                  } else if (action === "start_preflight" && turbineId) {
                    handleGoToPreflightChecklist(turbineId, activityId);
                  } else if (action === "pause") {
                    Alert.prompt(
                      "Pausar Actividad",
                      "Ingresa el motivo de la pausa (opcional):",
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Pausar",
                          onPress: (reasonInput) =>
                            handlePauseActivity(reasonInput || "Pausa general"),
                        },
                      ],
                      "plain-text",
                      activityPauseReason
                    );
                  } else if (action === "resume") {
                    handleResumeActivity();
                  } else if (action === "finish") {
                    handleFinishActivity();
                  }
                }}
                currentOngoingActivityId={currentOngoingActivityForDisplay?.id}
                activityPauseState={activityPauseState}
              />
            );
          };          return (
            <View
              style={{ marginTop: timelineActivities.length === 0 ? 10 : 10 }}
            >
              {renderTimelineContent()}
            </View>
          );
        }
        case "REGISTER_ACTIVITY_BUTTON":
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenNewActivityModal}
            >
              <LinearGradient
                colors={["#8b5cf6", "#7c3aed"]} // Changed to purple gradient
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
        case "ACTIVITY_SUGGESTIONS":
          return (
            <ActivitySuggestionsCard
              activities={suggestedActivities}
              terminationType={activityTerminationType}
              onClose={() => {
                setShowActivitySuggestions(false);
                console.log("Sugerencias cerradas por el usuario");
              }}
              onActivitySelect={(activityId, isTurbineActivity) => {
                if (isTurbineActivity) {
                  const activity = suggestedActivities.find(
                    (act) => act.id === activityId
                  );
                  if (activity) {
                    const turbineId = activity.turbineId || activity.id;
                    handleGoToPreflightChecklist(turbineId, activityId);
                    setShowActivitySuggestions(false);
                  }
                } else {
                  handleStartPendingActivity(activityId);
                  setShowActivitySuggestions(false);
                }
              }}
              onGoToPreflightChecklist={(
                turbineId: string,
                activityId: string
              ) => {
                handleGoToPreflightChecklist(turbineId, activityId);
                setShowActivitySuggestions(false);
              }}
            />
          );

        case "QUICK_ACTIONS_MENU_CARD":
          return (
            <>
              {currentOngoingActivityForDisplay && (
                <ActivityControl
                  ongoingActivity={currentOngoingActivityForDisplay}
                  onStart={handleStartJornada}
                  onPause={(reason) => {
                    Alert.prompt(
                      "Pausar Actividad",
                      "Ingresa el motivo de la pausa (opcional):",
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Pausar",
                          onPress: (reasonInput) =>
                            handlePauseActivity(reasonInput || "Pausa general"),
                        },
                      ],
                      "plain-text",
                      activityPauseReason
                    );
                  }}
                  onResume={handleResumeActivity}                  onFinish={handleFinishActivity}                  isPaused={activityPauseState.isPaused}
                  currentPauseReason={activityPauseState.reason}
                  onIncidentCreate={handleOpenNewIncidentModal}
                  currentIncident={currentIncident}
                  onFinishActivityByBlockingIncident={handleFinishActivityByBlockingIncident}
                  // Pass turbine checklist props
                  requiresBladeInspection={isBladeInspectionRequired(currentOngoingActivityForDisplay)}
                  hasCompletedBladeInspection={hasCompletedBladeInspection(currentOngoingActivityForDisplay.id)}                  onGoToBladeInspection={() => {
                    const turbineId = currentOngoingActivityForDisplay.turbineId || 
                                    currentOngoingActivityForDisplay.id.replace('turbine-', '') ||
                                    'default';
                    router.push(`/pilot/blade-inspection-detail?turbineId=${turbineId}&activityId=${currentOngoingActivityForDisplay.id}`);
                  }}
                  bladeInspectionTimingData={bladeInspectionTimingData}
                />
              )}
              <QuickActionsMenuCard
                onNavigate={handleNavigate}
                onOpenNewActivity={handleOpenNewActivityModal}
                onOpenNewIncident={handleOpenNewIncidentModal}
                onSubmitActivity={handleCreateQuickActivity}
                onViewActivities={() => handleNavigate("/pilot/activities")}
                onViewTurbines={() => handleNavigate("/pilot/turbines")}
                onViewFlights={() => handleNavigate("/pilot/flights")}
                onLogout={handleLogout}
                currentProject={currentProject}
                onGoToPreflightChecklist={handleGoToPreflightChecklist}
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
              "PilotDashboard: memoizedActivityListsForDisplay.ongoing is undefined!"
            );
            return (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>
                  Error: No se pudieron cargar las actividades
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
      currentProject,
      currentDate,
      weather,
      weatherLoading,
      weatherError,
      router,
      pilot,
      activityPauseState,
      pendingTodayActivities,
      genericPendingActivities,
      activityTypes,
      handleLogout, // This is properly defined above
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
      handleGoToPreflightChecklist,
      handlePauseActivity,
      handleResumeActivity,
      handleStartJornada,
      showActivitySuggestions,
      suggestedActivities,
      setShowActivitySuggestions,
      handleToggleIncidentBlocking,
      handleFinishActivityByBlockingIncident,
      currentIncident,
      activities,
      bladeInspectionTimingData, // Add missing dependency
      isBladeInspectionRequired, // Add missing dependency
      hasCompletedBladeInspection, // Add missing dependency
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
      <StatusBar backgroundColor="#1E3A8A" barStyle="light-content" />
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
      
      {/* Quick Register Activity Modal */}
      <QuickRegisterActivityForm
        isVisible={isNewActivityModalVisible}        onClose={() => setIsNewActivityModalVisible(false)}
        onSubmit={handleCreateQuickActivity}
      />

      {/* Incident Form Modal */}
      <IncidentFormModal
        isVisible={isNewIncidentModalVisible}
        onClose={() => setIsNewIncidentModalVisible(false)}
        onSubmit={handleCreateNewIncident}
        currentActivity={currentOngoingActivityForDisplay ? {
          id: currentOngoingActivityForDisplay.id,
          name: currentOngoingActivityForDisplay.name,
          status: currentOngoingActivityForDisplay.status,
        } : null}
      />
    </View>
  );
};

// Welcome Header Styles - Subtle design inspired by profile
const welcomeStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 16,
    shadowColor: '#000', // Changed back to original black shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6', // Changed back to original gray border
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    minHeight: 70,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
    flexShrink: 0,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e5e7eb', // Changed back to original gray border
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "white",
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "800",
    marginBottom: 2,
    lineHeight: 22,
  },
  role: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
    lineHeight: 18,
  },  rightSection: {
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
    minWidth: 80,
  },
  dateText: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
    textTransform: "capitalize",
    marginTop: 4,
    lineHeight: 14,
  },
  weatherSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc', // Changed back to original gray background
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0', // Changed back to original gray border
    maxWidth: 80,
  },
  weatherText: {
    fontSize: 12,
    color: '#6b7280', // Changed back to original gray
    fontWeight: '600',
    marginLeft: 4,
  },
  notificationButton: {
    position: 'relative',
    backgroundColor: '#f8fafc', // Changed back to original gray background
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0', // Changed back to original gray border
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1,
    borderColor: "#fff",
    zIndex: 10,
  },
});

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#f0f2f5' }, // Changed back to original gray background
  scrollableContent_contentContainer_main: {
    paddingBottom: 0,
    paddingHorizontal: 16,
  },
  highlightedButton: {
    backgroundColor: "#8b5cf6", // Changed to purple
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#8b5cf6", // Changed to purple shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  highlightedButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },  errorCard: {
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
  },  activityCard: {
    backgroundColor: "#e0f7fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,    shadowRadius: 4,
    elevation: 3,
  },
});


export default PilotDashboard;