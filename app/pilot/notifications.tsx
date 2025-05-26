import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Tipos y datos mock (sin cambios)
declare global {
  interface Window {
    __hasNotifications?: boolean;
    __unreadNotificationsCount?: number;
  }
}

type NotificationType =
  | "warning"
  | "critical"
  | "info"
  | "project_update"
  | "incident_alert"
  | "system_message";

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

type NotificationItemData =
  | BaseNotificationItemData
  | ProjectNotificationItemData
  | IncidentNotificationItemData;

const mockNotificationsData: NotificationItemData[] = [
  {
    id: "8",
    type: "incident_alert",
    title: "Incidencia: Paro por Clima",
    message:
      'Vientos fuertes superan límites operativos en Parque "Los Vientos". Operaciones detenidas.',
    time: "Hace 15 mins",
    incidentId: "INC-007",
    severity: "media",
    status: "abierta",
    read: false,
  },
  {
    id: "6",
    type: "project_update",
    title: "Nueva Tarea: Inspección Torre E-12",
    message: 'Parque Eólico "Los Vientos". Cliente: Energía Renovada SA.',
    time: "Hace 25 mins",
    projectId: "PROJ-001",
    projectName: 'Parque Eólico "Los Vientos"',
    taskSummary: "Inspección visual y termográfica de la turbina E-12.",
    read: false,
  },
  {
    id: "3",
    title: "Batería Baja Drone X",
    message: "La batería B-003 (Drone X) está al 15%. Reemplazar pronto.",
    time: "Hace 45 mins",
    type: "critical",
    read: false,
  },
  {
    id: "9",
    type: "incident_alert",
    title: "Falla de Sensor en Drone Y",
    message:
      "Sensor de altitud en Drone Y (SN-M300-78451) reporta lecturas anómalas.",
    time: "Hace 1 hora",
    incidentId: "INC-008",
    severity: "alta",
    status: "en_investigacion",
    read: false,
  },
  {
    id: "5",
    title: "Alerta Meteorológica General",
    message: "Fuertes vientos pronosticados para mañana en Zona Norte.",
    time: "Hace 1.5 horas",
    type: "warning",
    read: false,
  },
  {
    id: "7",
    type: "project_update",
    title: "Checklist Prevuelo Pendiente",
    message: 'Proyecto "Sierra Morena Solar". Recuerda completar el checklist.',
    time: "Hace 4 horas",
    projectId: "PROJ-002",
    projectName: "Sierra Morena Solar",
    taskSummary: "Completar checklist prevuelo y preparar EPP.",
    read: true,
  },
  {
    id: "1",
    title: "Mantenimiento Requerido Drone Y",
    message: "El drone SN-M300-78451 necesita revisión de hélices.",
    time: "Hace 5 horas",
    type: "warning",
    read: false,
  },
  {
    id: "2",
    title: "Nuevo Reporte Disponible",
    message:
      "El reporte del vuelo T-001 (Proyecto Alfa) está listo para revisión.",
    time: "Ayer",
    type: "info",
    read: true,
  },
  {
    id: "4",
    title: "Actualización de Firmware",
    message:
      "Nueva versión de firmware disponible para el control remoto principal.",
    time: "Hace 3 días",
    type: "info",
    read: false,
  },
];

function parseTimeToMinutesAgo(time: string): number {
  const match = time.match(/\d+/);
  const value = match ? parseInt(match[0], 10) : 0;
  if (time.includes("min")) return value;
  if (time.includes("hora")) return value * 60;
  if (time.includes("Ayer")) return 24 * 60;
  if (time.includes("día")) return value * 24 * 60;
  return 99999;
}

const sortedNotificationsData = [...mockNotificationsData].sort((a, b) => {
  const readDiff = (a.read ? 1 : 0) - (b.read ? 1 : 0);
  if (readDiff !== 0) return readDiff;
  return parseTimeToMinutesAgo(a.time) - parseTimeToMinutesAgo(b.time);
});

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

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<NotificationItemData[]>(
    sortedNotificationsData
  );

  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    if (typeof window !== "undefined") {
      window.__hasNotifications = notifications.length > 0;
      window.__unreadNotificationsCount = unreadCount;
    }
  }, [notifications]);

  const handleMarkAllRead = () => {
    Alert.alert(
      "Marcar como Leídas",
      "¿Marcar todas las notificaciones como leídas?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Marcar Todas",
          style: "default",
          onPress: () =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
        },
      ]
    );
  };

  const handleNotificationPress = (item: NotificationItemData) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );

    if (item.type === "project_update") {
      const projectItem = item as ProjectNotificationItemData;
      Alert.alert(
        "Detalles del Proyecto",
        `ID: ${projectItem.projectId}\nProyecto: ${
          projectItem.projectName
        }\nTarea: ${
          projectItem.taskSummary || "No especificada"
        }\n\n(Navegar a pantalla de detalles del proyecto)`,
        [{ text: "Entendido" }]
      );
    } else if (item.type === "incident_alert") {
      const incidentItem = item as IncidentNotificationItemData;
      Alert.alert(
        "Detalles de la Incidencia",
        `ID: ${incidentItem.incidentId}\nSeveridad: ${incidentItem.severity}\nEstado: ${incidentItem.status}\n\n(Navegar a pantalla de gestión de incidencias)`,
        [{ text: "Entendido" }]
      );
    } else {
      Alert.alert("Detalles de la Notificación", item.message, [
        { text: "Entendido" },
      ]);
    }
  };

  const renderNotificationItem = ({ item }: { item: NotificationItemData }) => {
    // Safety check for required fields
    if (!item || !item.id || !item.title || !item.message || !item.time) {
      return null;
    }

    const typeDetails = getNotificationTypeDetails(item.type);

    return (
      <TouchableOpacity
        style={styles.notificationItemOuter}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: typeDetails.backgroundColor },
          ]}
        >
          <Ionicons
            name={typeDetails.iconName}
            size={20}
            color={typeDetails.iconColor}
          />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.notificationTitle,
                item.read && styles.notificationTitleRead,
              ]}
            >
              {item.title || ""}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text
            style={[
              styles.notificationMessage,
              item.read && styles.notificationMessageRead,
            ]}
          >
            {item.message || ""}
          </Text>
          <Text
            style={[
              styles.notificationTime,
              item.read && styles.notificationTimeRead,
            ]}
          >
            {item.time || ""}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}
            </Text>
          </View>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllRead}
                style={styles.headerButton}
                accessibilityLabel="Marcar todas como leídas"
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={24}
                  color="#4A5568"
                />
              </TouchableOpacity>
            )}{" "}
          </View>
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color="#CBD5E0"
              />
            </View>
            <Text style={styles.emptyStateTitle}>No hay notificaciones</Text>
            <Text style={styles.emptyStateText}>
              Cuando tengas nuevas notificaciones, aparecerán aquí.
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item?.id || Math.random().toString()}
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f1f5f9" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#1e293b" },
  headerSubtitle: { fontSize: 14, color: "#718096", marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center" },
  headerButton: { padding: 6 },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },

  notificationItemOuter: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "flex-start",
    position: "relative",
    marginVertical: 7,
    shadowColor: "#334155",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationTitleRead: { color: "#475569" },
  notificationMessageRead: { color: "#64748b" },
  notificationTimeRead: { color: "#94a3b8" },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    marginTop: 2,
  },
  notificationContent: { flex: 1, justifyContent: "center" },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    marginBottom: 5,
  },
  notificationTime: { fontSize: 12, color: "#64748b" },

  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: -40,
  },
  emptyStateIcon: {
    backgroundColor: "#F7FAFC",
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#718096",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default NotificationsScreen;
