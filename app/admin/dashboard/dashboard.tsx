import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../../src/constants/theme";
import {
  mockActivities,
  mockClients,
  mockDrones,
  mockIncidents,
  mockProjectProgress,
  mockProjects,
} from "../../../src/mocks";

// Use light theme for web/mobile consistency
const currentTheme = theme.light;

// Notification types and interfaces
type NotificationType =
  | "warning"
  | "critical"
  | "info"
  | "project_update"
  | "incident_alert"
  | "system_message"
  | "user_activity";

interface BaseNotificationItemData {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  read?: boolean;
}

interface ProjectNotificationItemData extends BaseNotificationItemData {
  type: "project_update";
  projectId: string;
  projectName: string;
  taskSummary?: string;
}

interface IncidentNotificationItemData extends BaseNotificationItemData {
  type: "incident_alert";
  incidentId: string;
  severity: "alta" | "media" | "baja";
  status: "abierta" | "en_investigacion" | "resuelta";
}

interface UserActivityNotificationItemData extends BaseNotificationItemData {
  type: "user_activity";
  userId: string;
  userName: string;
  activityType: "login" | "task_completed" | "incident_reported" | "offline";
}

type NotificationItemData =
  | BaseNotificationItemData
  | ProjectNotificationItemData
  | IncidentNotificationItemData
  | UserActivityNotificationItemData;

// Mock notifications data
const mockAdminNotificationsData: NotificationItemData[] = [
  {
    id: "1",
    type: "incident_alert",
    title: "Incidencia Crítica: Falla de Equipo",
    message:
      "Drone SN-M300-78451 reporta falla en sensor de altitud. Operaciones suspendidas.",
    time: "Hace 5 mins",
    incidentId: "INC-012",
    severity: "alta",
    status: "abierta",
    read: false,
  },
  {
    id: "2",
    type: "user_activity",
    title: "Piloto Desconectado",
    message:
      "Juan Carlos Méndez se desconectó durante operación activa en Parque Los Vientos.",
    time: "Hace 12 mins",
    userId: "user_001",
    userName: "Juan Carlos Méndez",
    activityType: "offline",
    read: false,
  },
  {
    id: "3",
    type: "project_update",
    title: "Proyecto Completado",
    message:
      "Inspección completa del Parque Eólico Sierra Verde finalizada exitosamente.",
    time: "Hace 25 mins",
    projectId: "PROJ-003",
    projectName: "Parque Eólico Sierra Verde",
    taskSummary: "Inspección visual y termográfica completada - 45 turbinas",
    read: false,
  },
  {
    id: "4",
    type: "system_message",
    title: "Actualización del Sistema",
    message:
      "Nueva versión del firmware de drones disponible. Se recomienda actualizar.",
    time: "Hace 45 mins",
    read: false,
  },
  {
    id: "5",
    type: "warning",
    title: "Alerta Meteorológica",
    message:
      "Vientos fuertes pronosticados para mañana. Revisar programación de vuelos.",
    time: "Hace 1 hora",
    read: false,
  },
];

const getNotificationTypeDetails = (type: NotificationType) => {
  switch (type) {
    case "incident_alert":
      return {
        iconName: "shield-outline" as const,
        iconColor: "#C2410C",
        backgroundColor: "#FFEDD5",
      };
    case "warning":
      return {
        iconName: "warning-outline" as const,
        iconColor: "#A16207",
        backgroundColor: "#FEF9C3",
      };
    case "critical":
      return {
        iconName: "alert-circle-outline" as const,
        iconColor: "#B91C1C",
        backgroundColor: "#FEE2E2",
      };
    case "project_update":
      return {
        iconName: "briefcase-outline" as const,
        iconColor: "#047857",
        backgroundColor: "#D1FAE5",
      };
    case "user_activity":
      return {
        iconName: "people-outline" as const,
        iconColor: "#7C3AED",
        backgroundColor: "#EDE9FE",
      };
    case "system_message":
      return {
        iconName: "settings-outline" as const,
        iconColor: "#5B21B6",
        backgroundColor: "#EDE9FE",
      };
    default:
      return {
        iconName: "information-circle-outline" as const,
        iconColor: "#1E40AF",
        backgroundColor: "#DBEAFE",
      };
  }
};

// Overview Card Components
interface OverviewCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  gradientColors: [string, string] | [string, string, string];
  onPress?: () => void;
  isLarge?: boolean;
  details?: {
    completionRate?: string;
    onTimeRate?: string;
    efficiency?: string;
    progressPercentage?: number;
  };
  style?: StyleProp<ViewStyle>; // Added style prop
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  gradientColors,
  onPress,
  isLarge = false,
  details,
  style, // Destructure style prop
}) => (
  <TouchableOpacity
    style={[
      styles.overviewCard,
      isLarge && styles.overviewCardLarge,
      // Add overflow hidden to the card itself
      { overflow: "hidden" },
      style, // Apply the style prop here
    ]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.overviewGradient,
        isLarge && styles.overviewGradientLarge,
        // Ensure gradient also has a border radius, matching the card
        // This will be overridden by the specific styles if they also define borderRadius
        { borderRadius: currentTheme.dimensions.borderRadius.medium },
      ]}
    >
      {/* Enhanced glow effect overlay */}
      <View style={styles.cardGlowOverlay} />

      <View style={styles.overviewContent}>
        <View style={styles.overviewHeader}>
          <View style={styles.overviewIconContainer}>
            <MaterialIcons name={icon} size={isLarge ? 24 : 20} color="white" />
          </View>
          <View style={styles.chevronContainer}>
            <MaterialIcons
              name="chevron-right"
              size={18}
              color="rgba(255,255,255,0.8)"
            />
          </View>
        </View>
        <View style={styles.overviewMainContent}>
          <View style={styles.overviewInfo}>
            <Text
              style={[
                styles.overviewValue,
                isLarge && styles.overviewValueLarge,
              ]}
            >
              {value}
            </Text>
            <Text
              style={[
                styles.overviewTitle,
                isLarge && styles.overviewTitleLarge,
              ]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.overviewSubtitle}>{subtitle}</Text>
            )}
          </View>
          {isLarge && details && title !== "Proyectos Activos" && (
            <View style={styles.overviewDetails}>
              <View style={styles.detailItem}>
                <MaterialIcons
                  name="check-circle"
                  size={14}
                  color="rgba(255,255,255,0.9)"
                />
                <Text style={styles.detailText}>
                  Completados: {details.completionRate}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons
                  name="schedule"
                  size={14}
                  color="rgba(255,255,255,0.9)"
                />
                <Text style={styles.detailText}>
                  A tiempo: {details.onTimeRate}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons
                  name="trending-up"
                  size={14}
                  color="rgba(255,255,255,0.9)"
                />
                <Text style={styles.detailText}>
                  Eficiencia: {details.efficiency}
                </Text>
              </View>
            </View>
          )}
        </View>
        {/* Enhanced Progress Bar for Proyectos Activos */}
        {title === "Proyectos Activos" &&
          details?.progressPercentage !== undefined && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Progreso General</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${details.progressPercentage}%` },
                    ]}
                  />
                  <View style={styles.progressGlow} />
                </View>
                <Text style={styles.progressText}>
                  {details.progressPercentage}%
                </Text>
              </View>
            </View>
          )}
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

interface KPICardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.kpiCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.kpiHeader}>
      <MaterialIcons name={icon} size={24} color={currentTheme.primary} />
      <Text style={styles.kpiChange}>
        <MaterialIcons
          name={isPositive ? "trending-up" : "trending-down"}
          size={14}
          color={isPositive ? currentTheme.success : currentTheme.error}
        />
        {change}
      </Text>
    </View>
    <Text style={styles.kpiValue}>{value}</Text>
    <Text style={styles.kpiTitle}>{title}</Text>
  </TouchableOpacity>
);

interface AlertItem {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: Date;
  actionRequired?: boolean;
}

const AlertCard: React.FC<{ alert: AlertItem }> = ({ alert }) => {
  const getAlertColor = () => {
    switch (alert.type) {
      case "critical":
        return currentTheme.error;
      case "warning":
        return currentTheme.warning;
      default:
        return currentTheme.primary;
    }
  };

  const getAlertIcon = () => {
    switch (alert.type) {
      case "critical":
        return "error" as keyof typeof MaterialIcons.glyphMap;
      case "warning":
        return "warning" as keyof typeof MaterialIcons.glyphMap;
      default:
        return "info" as keyof typeof MaterialIcons.glyphMap;
    }
  };

  return (
    <TouchableOpacity style={styles.alertCard} activeOpacity={0.8}>
      <View style={styles.alertHeader}>
        <MaterialIcons
          name={getAlertIcon()}
          size={20}
          color={getAlertColor()}
        />
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>{alert.title}</Text>
          <Text style={styles.alertDescription}>{alert.description}</Text>
          <Text style={styles.alertTime}>
            {alert.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        {alert.actionRequired && (
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={currentTheme.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

// Notification item component
const NotificationCard: React.FC<{ notification: NotificationItemData }> = ({
  notification,
}) => {
  const { iconName, iconColor, backgroundColor } = getNotificationTypeDetails(
    notification.type
  );

  const handleNotificationPress = () => {
    // Handle notification press - mark as read, navigate, etc.
    console.log("Notification pressed:", notification.id);
  };

  const handleMarkAsRead = () => {
    // Mark single notification as read
    console.log("Mark as read:", notification.id);
  };

  const handleDeleteNotification = () => {
    Alert.alert(
      "Eliminar Notificación",
      "¿Estás seguro de que quieres eliminar esta notificación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            console.log("Delete notification:", notification.id);
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.notificationCard}
      onPress={handleNotificationPress}
      activeOpacity={0.8}
    >
      <View style={[styles.notificationIcon, { backgroundColor }]}>
        <Ionicons name={iconName} size={20} color={iconColor} />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {notification.message}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleDeleteNotification}
        style={styles.notificationAction}
      >
        <Ionicons
          name="close-outline"
          size={20}
          color={currentTheme.textSecondary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function AdminDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "today" | "week" | "month"
  >("today"); // Set StatusBar when this screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle("dark-content", true);
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("#ffffff", true);
        StatusBar.setTranslucent(false);
      }
    }, [])
  );
  // Calculate KPIs from mock data
  const activeProjects = mockProjects.filter(
    (p) => p.status === "ACTIVE"
  ).length;
  const totalProjects = mockProjects.length;
  const completedProjects = mockProjects.filter(
    (p) => p.status === "COMPLETED"
  ).length;

  // Calculate urgent projects (within 7 days deadline)
  const urgentProjects = mockProjects.filter((p) => {
    const daysUntilDeadline = Math.ceil(
      (p.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDeadline <= 7 && p.status === "ACTIVE";
  }).length;

  // Calculate completion rate
  const completionRate = Math.round((completedProjects / totalProjects) * 100);

  // Find next deadline
  const nextProject = mockProjects
    .filter((p) => p.status === "ACTIVE")
    .sort((a, b) => a.endDate.getTime() - b.endDate.getTime())[0];
  const nextDeadline = nextProject
    ? new Date(nextProject.endDate).toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
      })
    : "N/A"; // Calculate today's activities from mock data
  const today = new Date();
  const todayActivities = mockActivities.filter((activity) => {
    if (!activity.startTime) return false;
    const activityDate = new Date(activity.startTime);
    return (
      activityDate.toDateString() === today.toDateString() &&
      activity.status === "COMPLETED"
    );
  }).length;

  // Calculate operational drones
  const operationalDrones = mockDrones.filter(
    (drone) => drone.status === "AVAILABLE" || drone.status === "IN_USE"
  ).length;

  // Calculate critical incidents (equipment and accident types)
  const criticalIncidents = mockIncidents.filter(
    (incident) => incident.type === "EQUIPMENT" || incident.type === "ACCIDENT"
  ).length;
  // Calculate today's inspected turbines based on completed turbine work activities
  const inspectedTurbines = mockActivities.filter((activity) => {
    if (!activity.startTime) return false;
    const activityDate = new Date(activity.startTime);
    return (
      activityDate.toDateString() === today.toDateString() &&
      activity.type === "TURBINE_WORK" &&
      activity.status === "COMPLETED"
    );
  }).length;

  // Calculate average completion percentage for active projects
  const activeProjectIds = mockProjects
    .filter((p) => p.status === "ACTIVE")
    .map((p) => p.id);

  const activeProjectsProgress = mockProjectProgress.filter((progress) =>
    activeProjectIds.includes(progress.projectId)
  );

  const averageCompletionPercentage =
    activeProjectsProgress.length > 0
      ? Math.round(
          activeProjectsProgress.reduce(
            (sum, progress) => sum + progress.completionPercentage,
            0
          ) / activeProjectsProgress.length
        )
      : 0;

  // Generate alerts based on data analysis
  const generateAlerts = (): AlertItem[] => {
    const alerts: AlertItem[] = []; // Check for equipment issues
    const equipmentIncidents = mockIncidents.filter(
      (i) => i.type === "EQUIPMENT"
    );
    if (equipmentIncidents.length > 0) {
      alerts.push({
        id: "eq-1",
        type: "critical",
        title: "Mal Funcionamiento del Equipo",
        description: `${equipmentIncidents.length} drone(s) requieren mantenimiento`,
        timestamp: new Date(),
        actionRequired: true,
      });
    }

    // Check for weather conditions
    const weatherIncidents = mockIncidents.filter((i) => i.type === "WEATHER");
    if (weatherIncidents.length > 0) {
      alerts.push({
        id: "wx-1",
        type: "warning",
        title: "Aviso Meteorológico",
        description:
          "Vientos fuertes afectando operaciones en múltiples sitios",
        timestamp: new Date(),
        actionRequired: false,
      });
    }

    // Check project deadlines
    const urgentProjects = mockProjects.filter((p) => {
      const daysUntilDeadline = Math.ceil(
        (p.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilDeadline <= 7 && p.status === "ACTIVE";
    });

    if (urgentProjects.length > 0) {
      alerts.push({
        id: "proj-1",
        type: "warning",
        title: "Fechas Límite de Proyectos",
        description: `${urgentProjects.length} proyecto(s) vencen en 7 días`,
        timestamp: new Date(),
        actionRequired: true,
      });
    }

    return alerts;
  };
  const alerts = generateAlerts();

  // Calculate client data
  const totalClients = mockClients.length;

  const navigationCards = [
    {
      title: "Clientes",
      subtitle: `${totalClients} registrados`,
      icon: "business" as keyof typeof MaterialIcons.glyphMap,
      route: "/admin/projects/tabs/clients",
      color: currentTheme.primary,
    },
    {
      title: "Reportes",
      subtitle: "Generar reportes de datos",
      icon: "analytics" as keyof typeof MaterialIcons.glyphMap,
      route: "/admin/reports",
      color: currentTheme.accent,
    },
    {
      title: "Recursos",
      subtitle: `${operationalDrones} drones disponibles`,
      icon: "people" as keyof typeof MaterialIcons.glyphMap,
      route: "/admin/resources/drones",
      color: currentTheme.primary,
    },
    {
      title: "Tareas",
      subtitle: `${todayActivities} hoy`,
      icon: "schedule" as keyof typeof MaterialIcons.glyphMap,
      route: "/admin/tasks/tabs/assignments",
      color: currentTheme.success,
    },
  ];
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>Panel de Administración</Text>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => router.push("/admin/dashboard/notifications")}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={currentTheme.text}
                />
                {alerts.length > 0 && <View style={styles.notificationBadge} />}
              </TouchableOpacity>
            </View>
            <Text style={styles.headerSubtitle}>
              ¡Bienvenido de vuelta! Aquí tienes tu resumen de operaciones
            </Text>
          </View>
        </View>
        {/* Enhanced Overview Section */}
        <View
          style={[
            styles.overviewSection,
            Platform.OS === "web" && styles.overviewSectionWeb,
          ]}
        >
          <OverviewCard
            title="Proyectos Activos"
            value={activeProjects}
            subtitle={`Ver mas`}
            icon="assignment"
            gradientColors={["#3b82f6", "#2563eb", "#1d4ed8"]}
            isLarge={true}
            onPress={() => router.push("/admin/projects/tabs/projects")}
            details={{
              progressPercentage: averageCompletionPercentage,
            }}
            style={Platform.OS === "web" ? styles.overviewCardWeb : undefined}
          />
          {Platform.OS === "web" ? (
            <>
              <OverviewCard
                title="Fotos por Aprobar"
                value="2"
                subtitle="Pendientes"
                icon="photo-camera"
                gradientColors={["#8b5cf6", "#7c3aed", "#6d28d9"]}
                onPress={() => router.push("/admin/tasks/tabs/pictures")}
                style={styles.overviewCardWeb}
                // isLarge defaults to false, keeping their original internal styling
              />
              <OverviewCard
                title="Rendimiento Operativo"
                value="88%"
                subtitle="Esta semana"
                icon="trending-up"
                gradientColors={["#10b981", "#059669", "#047857"]}
                onPress={() => router.push("/admin/profile/kpisdashboard")}
                style={styles.overviewCardWeb}
                // isLarge defaults to false
              />
            </>
          ) : (
            <View style={styles.overviewBottomRow}>
              <OverviewCard
                title="Fotos por Aprobar"
                value="2"
                subtitle="Pendientes"
                icon="photo-camera"
                gradientColors={["#8b5cf6", "#7c3aed", "#6d28d9"]}
                onPress={() => router.push("/admin/tasks/tabs/pictures")}
              />
              <OverviewCard
                title="Rendimiento Operativo"
                value="88%"
                subtitle="Esta semana"
                icon="trending-up"
                gradientColors={["#10b981", "#059669", "#047857"]}
                onPress={() => router.push("/admin/profile/kpisdashboard")}
              />
            </View>
          )}
        </View>
        {/* Time Filter */}
        {/* <View style={styles.timeFilter}>
        {(["today", "week", "month"] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.timeFilterButton,
              selectedTimeframe === period && styles.timeFilterButtonActive,
            ]}
            onPress={() => setSelectedTimeframe(period)}
          >
            <Text
              style={[
                styles.timeFilterText,
                selectedTimeframe === period && styles.timeFilterTextActive,
              ]}
            >
              {period === "today"
                ? "Hoy"
                : period === "week"
                ? "Semana"
                : "Mes"}
            </Text>
          </TouchableOpacity>
        ))}
      </View> */}
        {/* KPI Cards */}
        {/* <View style={styles.kpiSection}>
        <Text style={styles.sectionTitle}>
          Indicadores Clave de Rendimiento
        </Text>
        <View style={styles.kpiGrid}>
          <KPICard
            title="Proyectos Activos"
            value={activeProjects}
            change="+12%"
            isPositive={true}
            icon="assignment"
            onPress={() => router.push("/admin/project-details")}
          />
          <KPICard
            title="Tasa de Finalización"
            value={`${Math.round((completedProjects / totalProjects) * 100)}%`}
            change="+5%"
            isPositive={true}
            icon="check-circle"
            onPress={() => router.push("/admin/reports?from=dashboard")}
          />
          <KPICard
            title="Inspecciones Diarias"
            value={inspectedTurbines}
            change="+8%"
            isPositive={true}
            icon="visibility"
            onPress={() => router.push("/admin/dashboard")}
          />
          <KPICard
            title="Utilización de Flota"
            value="87%"
            change="+3%"
            isPositive={true}
            icon="flight"
            onPress={() => router.push("/admin/dashboard")}
          />
        </View>
      </View> */}
        {/* Quick Navigation */}
        <View style={styles.navigationSection}>
          <Text style={styles.sectionTitle}>Navegación Rápida</Text>
          <View style={styles.navigationGrid}>
            {navigationCards.map((card, index) => (
              <TouchableOpacity
                key={index}
                style={styles.navigationCard}
                onPress={() => router.push(card.route as any)}
                activeOpacity={0.7}
              >
                <View style={styles.navigationCardContent}>
                  <View style={styles.navigationIconContainer}>
                    <MaterialIcons
                      name={card.icon}
                      size={22}
                      color={currentTheme.textSecondary}
                    />
                  </View>
                  <View style={styles.navigationTextContent}>
                    <Text style={styles.navigationTitle}>{card.title}</Text>
                    <Text style={styles.navigationSubtitle}>
                      {card.subtitle}
                    </Text>
                  </View>
                  <View style={styles.navigationArrow}>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={16}
                      color={currentTheme.textSecondary}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Alerts & Notifications */}
        {/* {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          <View style={styles.alertsHeader}>
            <Text style={styles.sectionTitle}>Alertas y Notificaciones</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Ver Todo</Text>
            </TouchableOpacity>
          </View>
          {alerts.slice(0, 3).map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </View>
      )}
       */}
        {/* Notifications Section */}
        {/* <View style={styles.notificationsSection}>
        <View style={styles.notificationsHeader}>
          <Text style={styles.sectionTitle}>Notificaciones Recientes</Text>
          <TouchableOpacity onPress={() => router.push("/admin/notifications")}>
            <Text style={styles.viewAllText}>Ver Todas</Text>
          </TouchableOpacity>
        </View>
        {mockAdminNotificationsData.length > 0 ? (
          <FlatList
            data={mockAdminNotificationsData.slice(0, 4)}
            renderItem={({ item }) => <NotificationCard notification={item} />}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyNotifications}>
            <Ionicons
              name="notifications-off-outline"
              size={32}
              color={currentTheme.textSecondary}
            />
            <Text style={styles.emptyNotificationsText}>
              No hay notificaciones
            </Text>
          </View>
        )}
      </View> */}
        {/* Recent Activity Summary */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Resumen de Hoy</Text>
          <View style={styles.modernSummaryGrid}>
            <View style={styles.modernSummaryCard}>
              <View style={styles.modernCardContent}>
                <View style={styles.modernIconWrapper}>
                  <MaterialIcons
                    name="flight-takeoff"
                    size={20}
                    color="#3b82f6"
                  />
                </View>
                <View style={styles.modernTextContent}>
                  <Text style={styles.modernValue}>{todayActivities}</Text>
                  <Text style={styles.modernLabel}>Vuelos</Text>
                </View>
              </View>
              <View style={styles.modernProgressBar}>
                <View
                  style={[
                    styles.modernProgressFill,
                    { width: "100%", backgroundColor: "#3b82f6" },
                  ]}
                />
              </View>
            </View>

            <View style={styles.modernSummaryCard}>
              <View style={styles.modernCardContent}>
                <View style={styles.modernIconWrapper}>
                  <MaterialIcons name="settings" size={20} color="#10b981" />
                </View>
                <View style={styles.modernTextContent}>
                  <Text style={styles.modernValue}>{operationalDrones}</Text>
                  <Text style={styles.modernLabel}>Drones</Text>
                </View>
              </View>
              <View style={styles.modernProgressBar}>
                <View
                  style={[
                    styles.modernProgressFill,
                    { width: "100%", backgroundColor: "#10b981" },
                  ]}
                />
              </View>
            </View>

            <View style={styles.modernSummaryCard}>
              <View style={styles.modernCardContent}>
                <View style={styles.modernIconWrapper}>
                  <MaterialIcons
                    name="warning-amber"
                    size={20}
                    color="#f59e0b"
                  />
                </View>
                <View style={styles.modernTextContent}>
                  <Text style={styles.modernValue}>{criticalIncidents}</Text>
                  <Text style={styles.modernLabel}>Incidentes</Text>
                </View>
              </View>
              <View style={styles.modernProgressBar}>
                <View
                  style={[
                    styles.modernProgressFill,
                    { width: "100%", backgroundColor: "#f59e0b" },
                  ]}
                />
              </View>
            </View>

            <View style={styles.modernSummaryCard}>
              <View style={styles.modernCardContent}>
                <View style={styles.modernIconWrapper}>
                  <MaterialIcons name="wind-power" size={20} color="#8b5cf6" />
                </View>
                <View style={styles.modernTextContent}>
                  <Text style={styles.modernValue}>{inspectedTurbines}</Text>
                  <Text style={styles.modernLabel}>Turbinas</Text>
                </View>
              </View>
              <View style={styles.modernProgressBar}>
                <View
                  style={[
                    styles.modernProgressFill,
                    { width: "100%", backgroundColor: "#8b5cf6" },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
        {/* Footer spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");
const isTablet = width > 768;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: currentTheme.background,
    paddingTop: 10,
  },
  header: {
    paddingHorizontal: currentTheme.dimensions.spacing.md,
    paddingBottom: currentTheme.dimensions.spacing.md,
    marginHorizontal: currentTheme.dimensions.spacing.md,
    backgroundColor: currentTheme.card,
    borderRadius: currentTheme.dimensions.borderRadius.medium,
    marginBottom: currentTheme.dimensions.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: currentTheme.dimensions.fontSize.xl,
    fontWeight: "bold",
    color: currentTheme.text,
    flex: 1,
  },
  headerSubtitle: {
    fontSize: currentTheme.dimensions.fontSize.sm,
    color: currentTheme.textSecondary,
  },
  notificationButton: {
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: currentTheme.error,
  },
  sectionTitle: {
    fontSize: currentTheme.dimensions.fontSize.lg,
    fontWeight: "bold",
    color: currentTheme.text,
    marginHorizontal: currentTheme.dimensions.spacing.md,
    marginBottom: currentTheme.dimensions.spacing.md,
  },
  kpiCard: {
    backgroundColor: currentTheme.card,
    borderRadius: currentTheme.dimensions.borderRadius.medium,
    padding: currentTheme.dimensions.spacing.md,
    width: isTablet ? "23%" : "48%",
    borderWidth: 1,
    borderColor: currentTheme.border,
  },
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: currentTheme.dimensions.spacing.sm,
  },
  kpiChange: {
    fontSize: currentTheme.dimensions.fontSize.xs,
    fontWeight: "600",
  },
  kpiValue: {
    fontSize: currentTheme.dimensions.fontSize.xl,
    fontWeight: "bold",
    color: currentTheme.text,
    marginBottom: 4,
  },
  kpiTitle: {
    fontSize: currentTheme.dimensions.fontSize.sm,
    color: currentTheme.textSecondary,
  },
  navigationSection: {
    marginBottom: currentTheme.dimensions.spacing.lg,
  },
  navigationGrid: {
    flexDirection: isTablet ? "row" : "column",
    flexWrap: isTablet ? "wrap" : "nowrap",
    paddingHorizontal: currentTheme.dimensions.spacing.md,
    gap: currentTheme.dimensions.spacing.sm,
    justifyContent: isTablet ? "space-between" : "flex-start",
  },
  navigationCard: {
    backgroundColor: currentTheme.card,
    borderRadius: currentTheme.dimensions.borderRadius.large,
    padding: 0,
    width: isTablet ? "48%" : "100%",
    minWidth: isTablet ? 280 : "auto",
    borderWidth: 1,
    borderColor: currentTheme.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: isTablet ? currentTheme.dimensions.spacing.sm : 0,
  },
  navigationCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: currentTheme.dimensions.spacing.md,
    paddingVertical: isTablet
      ? currentTheme.dimensions.spacing.md
      : currentTheme.dimensions.spacing.lg,
    minHeight: isTablet ? 70 : 80,
  },
  navigationIconContainer: {
    width: isTablet ? 48 : 44,
    height: isTablet ? 48 : 44,
    borderRadius: 12,
    backgroundColor: currentTheme.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: currentTheme.dimensions.spacing.md,
    borderWidth: 1,
    borderColor: currentTheme.border,
  },
  navigationTextContent: {
    flex: 1,
  },
  navigationArrow: {
    opacity: 0.4,
  },
  navigationTitle: {
    fontSize: currentTheme.dimensions.fontSize.md,
    fontWeight: "600",
    color: currentTheme.text,
    marginBottom: 4,
  },
  navigationSubtitle: {
    fontSize: currentTheme.dimensions.fontSize.xs,
    color: currentTheme.textSecondary,
    fontWeight: "500",
  },
  alertCard: {
    backgroundColor: currentTheme.card,
    borderRadius: currentTheme.dimensions.borderRadius.medium,
    padding: currentTheme.dimensions.spacing.md,
    marginBottom: currentTheme.dimensions.spacing.sm,
    borderWidth: 1,
    borderColor: currentTheme.border,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertContent: {
    flex: 1,
    marginLeft: currentTheme.dimensions.spacing.sm,
  },
  alertTitle: {
    fontSize: currentTheme.dimensions.fontSize.md,
    fontWeight: "600",
    color: currentTheme.text,
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: currentTheme.dimensions.fontSize.sm,
    color: currentTheme.textSecondary,
    marginBottom: 4,
  },
  alertTime: {
    fontSize: currentTheme.dimensions.fontSize.xs,
    color: currentTheme.textSecondary,
  },
  activitySection: {
    marginBottom: currentTheme.dimensions.spacing.lg,
    paddingHorizontal: currentTheme.dimensions.spacing.md,
  },
  modernSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: currentTheme.dimensions.spacing.sm,
  },
  modernSummaryCard: {
    backgroundColor: currentTheme.card,
    borderRadius: currentTheme.dimensions.borderRadius.large,
    padding: currentTheme.dimensions.spacing.md,
    borderWidth: 1,
    borderColor: currentTheme.border,
    width: isTablet ? "23%" : "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  modernCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: currentTheme.dimensions.spacing.sm,
  },
  modernIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: currentTheme.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: currentTheme.border,
  },
  modernTextContent: {
    alignItems: "flex-end",
  },
  modernValue: {
    fontSize: 20,
    fontWeight: "700",
    color: currentTheme.text,
    lineHeight: 24,
  },
  modernLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: currentTheme.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modernProgressBar: {
    height: 4,
    backgroundColor: currentTheme.background,
    borderRadius: 2,
    overflow: "hidden",
  },
  modernProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  footer: {
    height: 80,
  },
  notificationCard: {
    backgroundColor: currentTheme.card,
    borderRadius: currentTheme.dimensions.borderRadius.medium,
    padding: currentTheme.dimensions.spacing.md,
    marginBottom: currentTheme.dimensions.spacing.sm,
    borderWidth: 1,
    borderColor: currentTheme.border,
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: currentTheme.dimensions.spacing.sm,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: currentTheme.dimensions.fontSize.sm,
    fontWeight: "600",
    color: currentTheme.text,
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: currentTheme.dimensions.fontSize.xs,
    color: currentTheme.textSecondary,
    marginBottom: 4,
  },
  notificationAction: {
    padding: 8,
  },
  overviewSection: {
    marginBottom: currentTheme.dimensions.spacing.lg,
    paddingHorizontal: currentTheme.dimensions.spacing.md,
  },
  overviewSectionWeb: {
    flexDirection: "row",
    alignItems: "stretch", // To make cards of equal height if their content differs
    gap: currentTheme.dimensions.spacing.sm,
  },
  overviewCard: {
    marginBottom: currentTheme.dimensions.spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    flex: 1, // Add flex to the card container
    borderRadius: currentTheme.dimensions.borderRadius.medium, // Ensure card has borderRadius
  },
  overviewCardWeb: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0, // Distribute space equally among cards in the row
    marginBottom: 0, // Override default marginBottom, parent gap handles spacing
  },
  overviewCardLarge: {
    marginBottom: currentTheme.dimensions.spacing.md,
    // Ensure large card also has borderRadius if not already set by overviewCard
    borderRadius: currentTheme.dimensions.borderRadius.medium,
  },
  overviewBottomRow: {
    flexDirection: "row",
    gap: currentTheme.dimensions.spacing.sm,
    width: "100%",
  },
  overviewGradient: {
    borderRadius: currentTheme.dimensions.borderRadius.medium,
    padding: currentTheme.dimensions.spacing.md,
    minHeight: 100,
    flex: 1,
  },
  overviewGradientLarge: {
    // Ensure large gradient also has borderRadius
    borderRadius: currentTheme.dimensions.borderRadius.medium,
    padding: currentTheme.dimensions.spacing.md,
    minHeight: 90, // Reduced height for smaller cards
  },
  overviewContent: {
    flex: 1,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: currentTheme.dimensions.spacing.sm,
  },
  overviewInfo: {
    flex: 1,
  },
  overviewIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewValue: {
    fontSize: currentTheme.dimensions.fontSize.lg,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  overviewValueLarge: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  overviewTitle: {
    fontSize: currentTheme.dimensions.fontSize.xs,
    color: "white",
  },
  overviewTitleLarge: {
    fontSize: currentTheme.dimensions.fontSize.sm,
    fontWeight: "600",
    color: "white",
  },
  overviewSubtitle: {
    fontSize: currentTheme.dimensions.fontSize.xs,
    color: "rgba(255,255,255,0.8)",
  },
  overviewMainContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  overviewDetails: {
    marginLeft: currentTheme.dimensions.spacing.md,
    gap: currentTheme.dimensions.spacing.xs,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: currentTheme.dimensions.fontSize.xs,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  progressContainer: {
    position: "absolute",
    bottom: 12,
    right: 12,
    alignItems: "flex-start",
  },
  progressLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    width: 80,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    minWidth: 30,
    textAlign: "right",
  }, // Enhanced card styles
  cardGlowOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: currentTheme.dimensions.borderRadius.medium,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  progressGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
