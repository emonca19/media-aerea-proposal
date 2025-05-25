import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../src/constants/theme";
import {
  mockActivities,
  mockDrones,
  mockIncidents,
  mockProjects,
  mockTurbines,
} from "../../src/mocks";

// Use light theme for web/mobile consistency
const currentTheme = theme.light;

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

export default function AdminDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "today" | "week" | "month"
  >("today");

  // Calculate KPIs from mock data
  const activeProjects = mockProjects.filter(
    (p) => p.status === "ACTIVE"
  ).length;
  const totalProjects = mockProjects.length;
  const completedProjects = mockProjects.filter(
    (p) => p.status === "COMPLETED"
  ).length;

  const todayActivities = mockActivities.filter(
    (a) => a.startTime.toDateString() === new Date().toDateString()
  ).length;

  const criticalIncidents = mockIncidents.filter(
    (i) => i.type === "EQUIPMENT"
  ).length;

  const operationalDrones = mockDrones.filter(
    (d) => d.status === "AVAILABLE"
  ).length;

  const inspectedTurbines = mockTurbines.filter(
    (t) =>
      t.lastInspection &&
      new Date(t.lastInspection).toDateString() === new Date().toDateString()
  ).length;

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
  const navigationCards = [
    {
      title: "Proyectos",
      subtitle: `${activeProjects} activos`,
      icon: "assignment" as keyof typeof MaterialIcons.glyphMap,
      route: "/admin/project-details",
      color: currentTheme.primary,
    },
    {
      title: "KPIs y Reportes",
      subtitle: "Métricas de rendimiento",
      icon: "analytics" as keyof typeof MaterialIcons.glyphMap,
      route: "/admin/reports",
      color: currentTheme.accent,
    },
    {
      title: "Recursos",
      subtitle: `${operationalDrones} drones disponibles`,
      icon: "people" as keyof typeof MaterialIcons.glyphMap,
      route: "/admin/dashboard",
      color: currentTheme.primary,
    },
    {
      title: "Tareas y Horarios",
      subtitle: `${todayActivities} hoy`,
      icon: "schedule" as keyof typeof MaterialIcons.glyphMap,
      route: "/admin/dashboard",
      color: currentTheme.success,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {" "}
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Panel de Administración</Text>
          <Text style={styles.headerSubtitle}>
            ¡Bienvenido de vuelta! Aquí tienes tu resumen de operaciones
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={currentTheme.text}
          />
          {alerts.length > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>
      {/* Time Filter */}
      <View style={styles.timeFilter}>
        {(["today", "week", "month"] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.timeFilterButton,
              selectedTimeframe === period && styles.timeFilterButtonActive,
            ]}
            onPress={() => setSelectedTimeframe(period)}
          >
            {" "}
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
      </View>{" "}
      {/* KPI Cards */}
      <View style={styles.kpiSection}>
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
            onPress={() => router.push("/admin/reports")}
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
      </View>{" "}
      {/* Quick Navigation */}
      <View style={styles.navigationSection}>
        <Text style={styles.sectionTitle}>Navegación Rápida</Text>
        <View style={styles.navigationGrid}>
          {navigationCards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navigationCard}
              onPress={() => router.push(card.route as any)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.navigationIcon,
                  { backgroundColor: card.color + "20" },
                ]}
              >
                <MaterialIcons name={card.icon} size={24} color={card.color} />
              </View>
              <Text style={styles.navigationTitle}>{card.title}</Text>
              <Text style={styles.navigationSubtitle}>{card.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Alerts & Notifications */}
      {alerts.length > 0 && (
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
      )}{" "}
      {/* Recent Activity Summary */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Resumen de Hoy</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <MaterialIcons
              name="flight-takeoff"
              size={20}
              color={currentTheme.primary}
            />
            <Text style={styles.summaryText}>
              {todayActivities} vuelos completados hoy
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialIcons
              name="report-problem"
              size={20}
              color={currentTheme.warning}
            />
            <Text style={styles.summaryText}>
              {criticalIncidents} incidentes requieren atención
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialIcons
              name="schedule"
              size={20}
              color={currentTheme.success}
            />
            <Text style={styles.summaryText}>
              Todas las inspecciones programadas en curso
            </Text>
          </View>
        </View>
      </View>
      {/* Footer spacing */}
      <View style={styles.footer} />
    </ScrollView>
  );
}

const { width } = Dimensions.get("window");
const isTablet = width > 768;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: currentTheme.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: currentTheme.dimensions.spacing.md,
    paddingTop: Platform.OS === "ios" ? 60 : currentTheme.dimensions.spacing.lg,
    paddingBottom: currentTheme.dimensions.spacing.md,
  },
  headerTitle: {
    fontSize: currentTheme.dimensions.fontSize.xl,
    fontWeight: "bold",
    color: currentTheme.text,
    marginBottom: 4,
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
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: currentTheme.error,
  },
  timeFilter: {
    flexDirection: "row",
    marginHorizontal: currentTheme.dimensions.spacing.md,
    marginBottom: currentTheme.dimensions.spacing.lg,
    backgroundColor: currentTheme.card,
    borderRadius: currentTheme.dimensions.borderRadius.medium,
    padding: 4,
  },
  timeFilterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: currentTheme.dimensions.borderRadius.small,
    alignItems: "center",
  },
  timeFilterButtonActive: {
    backgroundColor: currentTheme.primary,
  },
  timeFilterText: {
    fontSize: currentTheme.dimensions.fontSize.sm,
    color: currentTheme.textSecondary,
    fontWeight: "500",
  },
  timeFilterTextActive: {
    color: "white",
  },
  kpiSection: {
    marginBottom: currentTheme.dimensions.spacing.lg,
  },
  sectionTitle: {
    fontSize: currentTheme.dimensions.fontSize.lg,
    fontWeight: "bold",
    color: currentTheme.text,
    marginHorizontal: currentTheme.dimensions.spacing.md,
    marginBottom: currentTheme.dimensions.spacing.md,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: currentTheme.dimensions.spacing.md,
    gap: currentTheme.dimensions.spacing.sm,
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
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: currentTheme.dimensions.spacing.md,
    gap: currentTheme.dimensions.spacing.sm,
  },
  navigationCard: {
    backgroundColor: currentTheme.card,
    borderRadius: currentTheme.dimensions.borderRadius.medium,
    padding: currentTheme.dimensions.spacing.md,
    width: isTablet ? "23%" : "48%",
    borderWidth: 1,
    borderColor: currentTheme.border,
    alignItems: "center",
  },
  navigationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: currentTheme.dimensions.spacing.sm,
  },
  navigationTitle: {
    fontSize: currentTheme.dimensions.fontSize.md,
    fontWeight: "600",
    color: currentTheme.text,
    textAlign: "center",
    marginBottom: 4,
  },
  navigationSubtitle: {
    fontSize: currentTheme.dimensions.fontSize.xs,
    color: currentTheme.textSecondary,
    textAlign: "center",
  },
  alertsSection: {
    marginBottom: currentTheme.dimensions.spacing.lg,
    paddingHorizontal: currentTheme.dimensions.spacing.md,
  },
  alertsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: currentTheme.dimensions.spacing.md,
  },
  viewAllText: {
    fontSize: currentTheme.dimensions.fontSize.sm,
    color: currentTheme.primary,
    fontWeight: "600",
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
  summaryCard: {
    backgroundColor: currentTheme.card,
    borderRadius: currentTheme.dimensions.borderRadius.medium,
    padding: currentTheme.dimensions.spacing.md,
    borderWidth: 1,
    borderColor: currentTheme.border,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: currentTheme.dimensions.spacing.sm,
  },
  summaryText: {
    fontSize: currentTheme.dimensions.fontSize.sm,
    color: currentTheme.text,
    marginLeft: currentTheme.dimensions.spacing.sm,
    flex: 1,
  },
  footer: {
    height: 80,
  },
});
