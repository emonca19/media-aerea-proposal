import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

// Mock data imports
import { StatCard } from "../../../src/components/StatCard";
import { mockPilotStats } from "../../../src/mocks/pilots";
import { mockProjectReports } from "../../../src/mocks/reports";

const { width } = Dimensions.get("window");

interface KPIData {
  projects: {
    total: number;
    active: number;
    completed: number;
    averageProgress: number;
    delayedProjects: number;
  };
  clients: {
    total: number;
    active: number;
    satisfactionRate: number;
  };
  turbines: {
    total: number;
    inspected: number;
    pending: number;
    approvalRate: number;
  };
  pilots: {
    total: number;
    active: number;
    averageEfficiency: number;
    totalFlightHours: number;
  };
  operationalBottlenecks: {
    category: string;
    description: string;
    impact: "high" | "medium" | "low";
    count: number;
  }[];
}

export default function AdminKPIDashboard() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadKPIData();
  }, []);
  const loadKPIData = async () => {
    try {
      // Simulate API call - in real app, this would fetch from your backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Calculate KPIs from mock data
      const projectData = mockProjectReports;
      const pilotData = mockPilotStats;

      const totalTurbines = projectData.reduce(
        (sum, p) => sum + p.progress.totalTurbines,
        0
      );
      const completedTurbines = projectData.reduce(
        (sum, p) => sum + p.progress.completed,
        0
      );
      const totalFlightHours =
        pilotData.reduce((sum, p) => sum + p.totalFlightMinutes, 0) / 60;
      const averagePilotEfficiency =
        pilotData.reduce((sum, p) => sum + p.dailyCompletionRatePercentage, 0) /
        pilotData.length;

      setKpiData({
        projects: {
          total: 12,
          active: 8,
          completed: 4,
          averageProgress:
            projectData.reduce(
              (sum, p) => sum + p.progress.completionPercentage,
              0
            ) / projectData.length,
          delayedProjects: 2,
        },
        clients: {
          total: 5,
          active: 4,
          satisfactionRate: 92,
        },
        turbines: {
          total: totalTurbines,
          inspected: completedTurbines,
          pending: totalTurbines - completedTurbines,
          approvalRate:
            projectData.reduce(
              (sum, p) => sum + p.qualityMetrics.approvalRate,
              0
            ) / projectData.length,
        },
        pilots: {
          total: pilotData.length,
          active: pilotData.length,
          averageEfficiency: averagePilotEfficiency,
          totalFlightHours: totalFlightHours,
        },
        operationalBottlenecks: [
          {
            category: "Entrega de Fotos",
            description: "Demoras en entrega de fotos por parte de pilotos",
            impact: "high",
            count: 3,
          },
          {
            category: "Condiciones Climáticas",
            description: "Retrasos por condiciones meteorológicas adversas",
            impact: "medium",
            count: 5,
          },
          {
            category: "Mantenimiento de Drones",
            description: "Drones en mantenimiento afectando programación",
            impact: "low",
            count: 2,
          },
        ],
      });
    } catch (error) {
      console.error("Error loading KPI data:", error);
    }
  };

  const getImpactColor = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
    }
  };

  const getImpactIcon = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "check-circle";
    }
  };

  if (!kpiData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando indicadores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Indicadores Generales",
          headerStyle: { backgroundColor: "#1E3A8A" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "600" },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/admin/profile/profile")}
              style={[
                styles.headerButton,
                { flexDirection: "row", alignItems: "center" },
              ]}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              {" "}
              <TouchableOpacity
                onPress={() => router.push("/admin/reports?from=kpis")}
                style={styles.headerButton}
              >
                <Ionicons name="document-text" size={24} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={loadKPIData}
                style={styles.headerButton}
              >
                <Ionicons name="refresh" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Summary Card */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.headerCard}>
          <LinearGradient
            colors={["#1E3A8A", "#3B82F6"]}
            style={styles.gradientCard}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Resumen Operativo</Text>
              <View style={styles.headerStats}>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>
                    {kpiData.projects.active}
                  </Text>
                  <Text style={styles.headerStatLabel}>Proyectos Activos</Text>
                </View>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>
                    {kpiData.pilots.active}
                  </Text>
                  <Text style={styles.headerStatLabel}>Pilotos Activos</Text>
                </View>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>
                    {Math.round(kpiData.pilots.averageEfficiency)}%
                  </Text>
                  <Text style={styles.headerStatLabel}>Eficiencia Media</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
        {/* Project Progress Section */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>Avance de Proyectos</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="assessment"
              title="Total Proyectos"
              value={kpiData.projects.total}
              color="#3b82f6"
            />
            <StatCard
              icon="trending-up"
              title="Progreso Promedio"
              value={`${Math.round(kpiData.projects.averageProgress)}%`}
              color="#10b981"
            />
            <StatCard
              icon="wind-power"
              title="Total Turbinas"
              value={kpiData.turbines.total}
              color="#8b5cf6"
            />
            <StatCard
              icon="done"
              title="Tasa Aprobación"
              value={`${Math.round(kpiData.turbines.approvalRate)}%`}
              color="#06b6d4"
            />
          </View>
        </Animated.View>
        {/* Individual Pilot Statistics */}
        <Animated.View
          entering={FadeInDown.delay(400)}
          style={[styles.navigationSection, styles.blackCardWrapper]}
        >
          {" "}
          <TouchableOpacity
            onPress={() => router.push("/admin/profile/pilot-details")}
            activeOpacity={0.8}
            style={[styles.navigationCardWrapper, styles.blackCardWrapper]}
          >
            <LinearGradient
              colors={["#111111", "#222222"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.navigationCard,
                styles.blackCard,
                styles.centeredCard,
              ]}
            >
              <View style={styles.centeredCardContent}>
                <View style={styles.centeredIconContainer}>
                  <MaterialIcons name="people" size={40} color="white" />
                </View>
                <Text style={styles.navigationTitleWhite}>
                  Estadísticas de Pilotos
                </Text>
                <Text style={styles.navigationSubtitleWhite}>
                  Ver análisis detallado del rendimiento
                </Text>
              </View>
              <View style={[styles.navigationArrow, styles.blackArrow]}>
                <MaterialIcons
                  name="arrow-forward"
                  size={24}
                  color="rgba(255, 255, 255, 0.8)"
                />
              </View>
              <View style={styles.navigationOverlay} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Projects Statistics Section */}
        <Animated.View
          entering={FadeInDown.delay(500)}
          style={[styles.navigationSection, styles.blackCardWrapper]}
        >
          {" "}
          <TouchableOpacity
            onPress={() => router.push("/admin/profile/project-details")}
            activeOpacity={0.8}
            style={[styles.navigationCardWrapper, styles.blackCardWrapper]}
          >
            <LinearGradient
              colors={["#111111", "#222222"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.navigationCard,
                styles.blackCard,
                styles.centeredCard,
              ]}
            >
              <View style={styles.centeredCardContent}>
                <View style={styles.centeredIconContainer}>
                  <MaterialIcons name="analytics" size={40} color="white" />
                </View>
                <Text style={styles.navigationTitleWhite}>
                  Estadísticas de Proyectos
                </Text>
                <Text style={styles.navigationSubtitleWhite}>
                  Ver métricas y progreso de proyectos
                </Text>
              </View>
              <View style={[styles.navigationArrow, styles.blackArrow]}>
                <MaterialIcons
                  name="arrow-forward"
                  size={24}
                  color="rgba(255, 255, 255, 0.8)"
                />
              </View>
              <View style={styles.navigationOverlay} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Add spacing between cards and Cuellos de Botella */}
        <View style={{ height: 18 }} />

        {/* Operational Bottlenecks */}
        <Animated.View entering={FadeInDown.delay(900)} style={styles.section}>
          <Text style={styles.sectionTitle}>Cuellos de Botella Operativos</Text>
          {kpiData.operationalBottlenecks.map((bottleneck, index) => (
            <View key={index} style={styles.bottleneckCard}>
              <View style={styles.bottleneckHeader}>
                <View style={styles.bottleneckInfo}>
                  <View style={styles.bottleneckTitleRow}>
                    <MaterialIcons
                      name={getImpactIcon(bottleneck.impact)}
                      size={20}
                      color={getImpactColor(bottleneck.impact)}
                    />
                    <Text style={styles.bottleneckCategory}>
                      {bottleneck.category}
                    </Text>
                  </View>
                  <Text style={styles.bottleneckDescription}>
                    {bottleneck.description}
                  </Text>
                </View>
                <View style={styles.bottleneckMetrics}>
                  <Text
                    style={[
                      styles.bottleneckCount,
                      { color: getImpactColor(bottleneck.impact) },
                    ]}
                  >
                    {bottleneck.count}
                  </Text>
                  <Text style={styles.bottleneckCountLabel}>casos</Text>
                </View>
              </View>
              <View
                style={[
                  styles.impactBadge,
                  { backgroundColor: getImpactColor(bottleneck.impact) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.impactText,
                    { color: getImpactColor(bottleneck.impact) },
                  ]}
                >
                  Impacto
                  {bottleneck.impact === "high"
                    ? "Alto"
                    : bottleneck.impact === "medium"
                    ? "Medio"
                    : "Bajo"}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  refreshButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientCard: {
    padding: 24,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 24,
  },
  headerStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
  },
  headerStat: {
    alignItems: "center",
  },
  headerStatValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerStatLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  navigationSection: {
    marginHorizontal: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
    justifyContent: "space-between",
  },
  progressCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  progressItem: {
    alignItems: "center",
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  turbineProgress: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  pilotsGrid: {
    gap: 16,
  },
  pilotCardImproved: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  pilotCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  pilotAvatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  pilotAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pilotAvatarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  pilotStatusDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  pilotInfoImproved: {
    flex: 1,
    marginRight: 12,
  },
  pilotNameImproved: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  pilotStatsImproved: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 2,
    fontWeight: "500",
  },
  pilotFlightTime: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  pilotEfficiencyBadgeImproved: {
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3b82f6",
    alignItems: "center",
    minWidth: 60,
  },
  pilotEfficiencyNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
    marginBottom: 2,
  },
  pilotEfficiencyLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#3b82f6",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pilotMetricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 4,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
  },
  pilotProgressSection: {
    marginTop: 4,
  },
  progressSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  pilotProgressBarImproved: {
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
    marginBottom: 6,
    overflow: "hidden",
  },
  pilotProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  pilotProgressText: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
  },

  // Projects Statistics Styles
  projectOverviewGrid: {
    gap: 16,
  },
  projectCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  projectCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  projectTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
    lineHeight: 20,
  },
  projectClient: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  projectStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  projectStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  projectStatusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  projectMetricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  projectMetricCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  projectMetricValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 4,
    marginBottom: 2,
  },
  projectMetricLabel: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
  },
  projectProgressSection: {
    marginTop: 4,
  },
  projectProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  projectProgressLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  projectProgressPercentage: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1f2937",
  },
  projectProgressBarContainer: {
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
    marginBottom: 6,
    overflow: "hidden",
  },
  projectProgressBar: {
    height: "100%",
    borderRadius: 3,
  },
  projectProgressDetails: {
    alignItems: "center",
  },
  projectProgressDetailText: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
  },
  projectSummaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  projectSummaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  projectSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 20,
  },
  projectSummaryMetric: {
    width: "48%",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minHeight: 85,
  },
  projectSummaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  projectSummaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 2,
  },
  projectSummaryLabel: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 14,
  },
  projectTimelineSection: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 20,
  },
  projectTimelineTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  projectTimelineContainer: {
    gap: 12,
  },
  projectTimelineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  projectTimelineInfo: {
    flex: 1,
    marginRight: 12,
  },
  projectTimelineName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  projectTimelineStatus: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  projectTimelineProgress: {
    alignItems: "flex-end",
  },
  projectTimelinePercentage: {
    fontSize: 16,
    fontWeight: "700",
  },

  // Existing styles continue...
  bottleneckCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bottleneckHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bottleneckInfo: {
    flex: 1,
    marginRight: 16,
  },
  bottleneckTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bottleneckCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 8,
  },
  bottleneckDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  bottleneckMetrics: {
    alignItems: "flex-end",
  },
  bottleneckCount: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 2,
  },
  bottleneckCountLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  impactBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  impactText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 32,
  },

  // Navigation overview card styles
  sectionHeaderWithButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  viewDetailsButtonText: {
    fontSize: 12,
    color: "#9C46CE",
    fontWeight: "600",
    marginRight: 4,
  },
  pilotOverviewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  projectOverviewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  overviewStat: {
    alignItems: "center",
    flex: 1,
  },
  overviewStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 8,
    marginBottom: 4,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    textAlign: "center",
  },
  fullDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9C46CE",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  fullDetailsButtonText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
    marginRight: 8,
  },
  // Navigation card styles
  navigationCardWrapper: {
    marginBottom: 8,
  },
  navigationCard: {
    borderRadius: 16,
    padding: 16,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    height: 110,
    overflow: "hidden",
  },
  blackCardWrapper: {
    // Remove extra margin if needed
    marginBottom: 4,
  },
  blackCard: {
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0,
    height: 110,
  },
  centeredCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 110,
    padding: 0,
  },
  centeredCardContent: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  centeredIconContainer: {
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  navigationIconContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  navigationIconMain: {
    position: "absolute",
    bottom: 16,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  blackIconMain: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.15)",
  },
  navigationContent: {
    position: "absolute",
    bottom: 16,
    left: 88,
    right: 60,
  },
  navigationContentCentered: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  navigationValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "white",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  navigationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 16,
    marginBottom: 2,
  },
  navigationTitleWhite: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  navigationSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 14,
  },
  navigationSubtitleWhite: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  navigationArrow: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  blackArrow: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.18)",
  },
  navigationOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  horizontalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 110,
    padding: 0,
  },
  horizontalCardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    zIndex: 2,
    height: "100%",
    paddingLeft: 12,
  },
  horizontalIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
    marginLeft: 4,
  },
  horizontalTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
