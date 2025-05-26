import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
  {
    id: "6",
    type: "user_activity",
    title: "Tarea Completada",
    message:
      "Ana Patricia Morales completó inspección de turbina E-15 en Parque Los Vientos.",
    time: "Hace 2 horas",
    userId: "user_002",
    userName: "Ana Patricia Morales",
    activityType: "task_completed",
    read: true,
  },
  {
    id: "7",
    type: "critical",
    title: "Mantenimiento Urgente",
    message:
      "Batería crítica en Drone X. Requiere reemplazo inmediato antes del próximo vuelo.",
    time: "Hace 3 horas",
    read: false,
  },
  {
    id: "8",
    type: "info",
    title: "Reporte Mensual Disponible",
    message:
      "El reporte de eficiencia operativa de Mayo está listo para revisión.",
    time: "Ayer",
    read: true,
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

const sortedNotificationsData = [...mockAdminNotificationsData].sort((a, b) => {
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

export default function AdminNotificationsScreen() {
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
    } else if (item.type === "user_activity") {
      const userItem = item as UserActivityNotificationItemData;
      Alert.alert(
        "Actividad del Usuario",
        `Usuario: ${userItem.userName}\nID: ${userItem.userId}\nTipo: ${userItem.activityType}\n\n(Navegar a perfil del usuario)`,
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
      <StatusBar
        barStyle="dark-content"
        backgroundColor={styles.safeArea.backgroundColor}
      />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.headerTitle}>
              {`Notificaciones${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleMarkAllRead}
            >
              <Ionicons name="checkmark-done" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>{" "}
        </View>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color="#94a3b8"
            />
            <Text style={styles.emptyStateTitle}>Sin Notificaciones</Text>
            <Text style={styles.emptyStateText}>
              No tienes notificaciones en este momento.{"\n"}
              Te mantendremos informado sobre actividades importantes del
              sistema.
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item?.id || Math.random().toString()}
            renderItem={renderNotificationItem}
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

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
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#334155",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
  },
});
