import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

// Components and data imports
import { StatCard } from "../../src/components/StatCard";
import { mockPilotStats } from "../../src/mocks/pilots";
import { mockProjects } from "../../src/mocks/projects";
import { mockWindParks } from "../../src/mocks/windParks";

const { width } = Dimensions.get("window");

interface DashboardOverview {
  projects: {
    total: number;
    active: number;
    completed: number;
    paused: number;
  };
  operations: {
    totalTurbines: number;
    inspectedToday: number;
    totalPilots: number;
    activePilots: number;
  };
  performance: {
    avgCompletionRate: number;
    avgPhotoDeliveryTime: number;
    totalFlightHours: number;
    incidentRate: number;
  };
}

interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  route: string;
  description: string;
}

interface RecentActivity {
  id: string;
  type: "project" | "pilot" | "incident" | "report";
  title: string;
  description: string;
  timestamp: Date;
  priority: "high" | "medium" | "low";
}

export default function AdminDashboard() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );

  const quickActions: QuickAction[] = [
    {
      id: "new-project",
      title: "Nuevo Proyecto",
      icon: "add-box",
      color: "#3b82f6",
      route: "/admin/projects/create",
      description: "Crear proyecto",
    },
    {
      id: "assign-pilot",
      title: "Asignar Piloto",
      icon: "person-add",
      color: "#8b5cf6",
      route: "/admin/resources",
      description: "Gestionar asignaciones",
    },
    {
      id: "view-reports",
      title: "Reportes",
      icon: "assessment",
      color: "#06b6d4",
      route: "/admin/kpis/report",
      description: "Ver análisis",
    },
    {
      id: "kpi-dashboard",
      title: "KPIs",
      icon: "dashboard",
      color: "#22c55e",
      route: "/admin/kpis/dashboard",
      description: "Métricas detalladas",
    },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = () => {
    // Calculate overview statistics
    const totalProjects = mockProjects.length;
    const activeProjects = mockProjects.filter(
      (p) => p.status === "ACTIVE"
    ).length;
    const completedProjects = mockProjects.filter(
      (p) => p.status === "COMPLETED"
    ).length;
    const pausedProjects = mockProjects.filter(
      (p) => p.status === "PAUSED"
    ).length;

    const totalTurbines = mockWindParks.reduce(
      (sum, park) => sum + park.turbineIds.length,
      0
    );
    const totalPilots = mockPilotStats.length;
    const activePilots = Math.floor(totalPilots * 0.8); // Assume 80% are active

    const avgCompletionRate =
      mockPilotStats.reduce(
        (sum, pilot) => sum + pilot.dailyCompletionRatePercentage,
        0
      ) / mockPilotStats.length;
    const avgPhotoDeliveryTime =
      mockPilotStats.reduce(
        (sum, pilot) => sum + pilot.photoDeliveryTimeMinutes,
        0
      ) / mockPilotStats.length;
    const totalFlightHours =
      mockPilotStats.reduce((sum, pilot) => sum + pilot.totalFlightMinutes, 0) /
      60;
    const totalIncidents = mockPilotStats.reduce(
      (sum, pilot) => sum + pilot.incidentCount,
      0
    );
    const incidentRate = (totalIncidents / totalProjects) * 100;

    setOverview({
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        paused: pausedProjects,
      },
      operations: {
        totalTurbines,
        inspectedToday: Math.floor(totalTurbines * 0.15), // Simulate daily inspections
        totalPilots,
        activePilots,
      },
      performance: {
        avgCompletionRate: Math.round(avgCompletionRate),
        avgPhotoDeliveryTime: Math.round(avgPhotoDeliveryTime),
        totalFlightHours: Math.round(totalFlightHours),
        incidentRate: Math.round(incidentRate * 10) / 10,
      },
    });

    // Generate recent activities
    const activities: RecentActivity[] = [
      {
        id: "1",
        type: "project",
        title: "Proyecto WindFarm Alpha iniciado",
        description: "Inspección Q2 2025 asignada a 2 pilotos",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        priority: "high",
      },
      {
        id: "2",
        type: "pilot",
        title: "Piloto Carlos Méndez completó misión",
        description: "15 turbinas inspeccionadas en record time",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        priority: "medium",
      },
      {
        id: "3",
        type: "report",
        title: "Reporte mensual generado",
        description: "Métricas de abril disponibles",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        priority: "low",
      },
      {
        id: "4",
        type: "incident",
        title: "Mantenimiento preventivo requerido",
        description: "Dron DJI-003 necesita revisión",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        priority: "high",
      },
    ];

    setRecentActivities(activities);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    loadDashboardData();
    setRefreshing(false);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
    } else if (diffHours > 0) {
      return `hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    } else {
      return "hace unos minutos";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#22c55e";
      default:
        return "#64748b";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "project":
        return "work";
      case "pilot":
        return "person";
      case "incident":
        return "warning";
      case "report":
        return "assessment";
      default:
        return "info";
    }
  };

  if (!overview) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Dashboard Administrativo",
          headerStyle: { backgroundColor: "#ffffff" },
          headerTintColor: "#111827",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Welcome Section */}
          <Animated.View
            entering={FadeInUp.delay(100)}
            style={styles.welcomeSection}
          >
            <Text style={styles.welcomeTitle}>Bienvenido, Administrador</Text>
            <Text style={styles.welcomeSubtitle}>
              Resumen de operaciones • {new Date().toLocaleDateString("es-ES")}
            </Text>
          </Animated.View>
          {/* Overview Stats */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen General</Text>
            <View style={styles.statsGrid}>
              <StatCard
                icon="work"
                title="Proyectos Activos"
                value={overview.projects.active}
                color="#3b82f6"
              />
              <StatCard
                icon="precision-manufacturing"
                title="Turbinas Totales"
                value={overview.operations.totalTurbines}
                color="#8b5cf6"
              />
              <StatCard
                icon="person"
                title="Pilotos Activos"
                value={overview.operations.activePilots}
                color="#06b6d4"
              />
              <StatCard
                icon="schedule"
                title="Tasa Completación"
                value={`${overview.performance.avgCompletionRate}%`}
                color="#22c55e"
              />
            </View>
          </Animated.View>
          {/* Quick Actions */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.quickActionCard,
                    { borderColor: action.color },
                  ]}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={action.icon}
                    size={32}
                    color={action.color}
                  />
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionDescription}>
                    {action.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
          {/* Performance Metrics */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Métricas de Rendimiento</Text>
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <MaterialIcons name="flight" size={24} color="#3b82f6" />
                <View style={styles.metricInfo}>
                  <Text style={styles.metricValue}>
                    {overview.performance.totalFlightHours}h
                  </Text>
                  <Text style={styles.metricLabel}>Horas de Vuelo Total</Text>
                </View>
              </View>

              <View style={styles.metricCard}>
                <MaterialIcons name="camera-alt" size={24} color="#8b5cf6" />
                <View style={styles.metricInfo}>
                  <Text style={styles.metricValue}>
                    {overview.performance.avgPhotoDeliveryTime}min
                  </Text>
                  <Text style={styles.metricLabel}>
                    Tiempo Promedio Entrega
                  </Text>
                </View>
              </View>

              <View style={styles.metricCard}>
                <MaterialIcons name="security" size={24} color="#22c55e" />
                <View style={styles.metricInfo}>
                  <Text style={styles.metricValue}>
                    {overview.performance.incidentRate}%
                  </Text>
                  <Text style={styles.metricLabel}>Tasa de Incidentes</Text>
                </View>
              </View>
            </View>
          </Animated.View>
          {/* Recent Activities */}
          <Animated.View
            entering={FadeInDown.delay(500)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Actividad Reciente</Text>
              <TouchableOpacity
                onPress={() => router.push("/(admin)/(kpis)/report" as any)}
              >
                <Text style={styles.seeAllText}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activitiesContainer}>
              {recentActivities.map((activity, index) => (
                <Animated.View
                  key={activity.id}
                  entering={FadeInDown.delay(600 + index * 100)}
                  style={styles.activityCard}
                >
                  <View style={styles.activityHeader}>
                    <MaterialIcons
                      name={getActivityIcon(activity.type)}
                      size={20}
                      color={getPriorityColor(activity.priority)}
                    />
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityDescription}>
                        {activity.description}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.priorityDot,
                        {
                          backgroundColor: getPriorityColor(activity.priority),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.activityTime}>
                    {formatTimeAgo(activity.timestamp)}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
          {/* Project Status Summary */}
          <Animated.View entering={FadeInUp.delay(700)} style={styles.section}>
            <Text style={styles.sectionTitle}>Estado de Proyectos</Text>
            <View style={styles.projectStatusContainer}>
              <View style={styles.projectStatusCard}>
                <View style={styles.projectStatusHeader}>
                  <MaterialIcons
                    name="play-circle-filled"
                    size={24}
                    color="#3b82f6"
                  />
                  <Text style={styles.projectStatusTitle}>En Progreso</Text>
                </View>
                <Text style={styles.projectStatusValue}>
                  {overview.projects.active}
                </Text>
                <Text style={styles.projectStatusSubtext}>
                  proyectos activos
                </Text>
              </View>

              <View style={styles.projectStatusCard}>
                <View style={styles.projectStatusHeader}>
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#22c55e"
                  />
                  <Text style={styles.projectStatusTitle}>Completados</Text>
                </View>
                <Text style={styles.projectStatusValue}>
                  {overview.projects.completed}
                </Text>
                <Text style={styles.projectStatusSubtext}>este mes</Text>
              </View>
              <View style={styles.projectStatusCard}>
                <View style={styles.projectStatusHeader}>
                  <MaterialIcons name="schedule" size={24} color="#f59e0b" />
                  <Text style={styles.projectStatusTitle}>Pausados</Text>
                </View>
                <Text style={styles.projectStatusValue}>
                  {overview.projects.paused}
                </Text>
                <Text style={styles.projectStatusSubtext}>temporalmente</Text>
              </View>
            </View>
          </Animated.View>
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    color: "#374151",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  seeAllText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  quickActionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    width: (width - 52) / 2, // 2 columns with gaps
    minHeight: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  quickActionDescription: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  metricsContainer: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricInfo: {
    marginLeft: 16,
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  metricLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  activitiesContainer: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  activityTime: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 32,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  projectStatusContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  projectStatusCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  projectStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  projectStatusTitle: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
    fontWeight: "500",
  },
  projectStatusValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  projectStatusSubtext: {
    fontSize: 12,
    color: "#9ca3af",
  },
  bottomSpacing: {
    height: 40,
  },
});
