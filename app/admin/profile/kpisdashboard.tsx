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
import { BarChart, PieChart } from "react-native-chart-kit";
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
          <View style={styles.statsGrid}>
            <StatCard
              icon="speed"
              title="Eficiencia Operativa"
              value={`87%`}
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
              title="Tiempo Promedio por Turbina"
              value={`1.4h`}
              color="#8b5cf6"
            />
            <StatCard
              icon="done"
              title="Tasa Aprobación"
              value={`${Math.round(kpiData.turbines.approvalRate)}%`}
              color="#06b6d4"
            />
          </View>
        </Animated.View>{" "}
        {/* Visual KPIs Dashboard - Chart Based */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          {" "}
          {/* Time Analytics - Effective vs Pause Time */}
          <View style={styles.visualKpiContainer}>
            <Text style={styles.kpiTitle}>
              Distribución de Tiempo Operativo
            </Text>
            <View style={styles.timeAnalyticsContainer}>
              {" "}
              <BarChart
                data={{
                  labels: ["Efectivo", "En Pausa"],
                  datasets: [
                    {
                      data: [6, 2], // 6 hours effective, 2 hours pause
                    },
                  ],
                }}
                width={Dimensions.get("window").width - 70}
                height={140}
                yAxisLabel=""
                chartConfig={{
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  strokeWidth: 2,
                  barPercentage: 0.6,
                  useShadowColorFromDataset: false,
                  decimalPlaces: 0,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForBackgroundLines: {
                    strokeDasharray: "", // Solid lines
                    stroke: "#e5e7eb",
                    strokeWidth: 1,
                  },
                }}
                style={{ borderRadius: 16 }}
                yAxisSuffix="h"
                fromZero
              />
              <View style={styles.timeMetricsRow}>
                <View style={styles.timeMetricItem}>
                  <View
                    style={[
                      styles.timeMetricDot,
                      { backgroundColor: "#3b82f6" },
                    ]}
                  />
                  <Text style={styles.timeMetricLabel}>Tiempo Efectivo</Text>
                  <Text style={styles.timeMetricValue}>6h (75%)</Text>
                </View>
                <View style={styles.timeMetricItem}>
                  <View
                    style={[
                      styles.timeMetricDot,
                      { backgroundColor: "#ef4444" },
                    ]}
                  />
                  <Text style={styles.timeMetricLabel}>Tiempo en Pausa</Text>
                  <Text style={styles.timeMetricValue}>2h (25%)</Text>
                </View>
              </View>
            </View>
          </View>
          {/* Pause Reasons Pie Chart */}
          <View style={styles.visualKpiContainer}>
            <Text style={styles.kpiTitle}>Motivos de Pausas Principales</Text>
            <View style={styles.pauseReasonsContainer}>
              {" "}
              <PieChart
                data={[
                  {
                    name: "Clima",
                    population: 45,
                    color: "#ef4444",
                    legendFontColor: "#374151",
                    legendFontSize: 12,
                  },
                  {
                    name: "Cliente",
                    population: 25,
                    color: "#f59e0b",
                    legendFontColor: "#374151",
                    legendFontSize: 12,
                  },
                  {
                    name: "Descanso",
                    population: 20,
                    color: "#10b981",
                    legendFontColor: "#374151",
                    legendFontSize: 12,
                  },
                  {
                    name: "Otros",
                    population: 10,
                    color: "#8b5cf6",
                    legendFontColor: "#374151",
                    legendFontSize: 12,
                  },
                ]}
                width={Dimensions.get("window").width - 70}
                height={160}
                chartConfig={{
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                  style: { borderRadius: 16 },
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />{" "}
              <View style={styles.pauseInsight}>
                <MaterialIcons name="info-outline" size={16} color="#3b82f6" />
                <Text style={styles.pauseInsightText}>
                  45% de pausas relacionadas con el clima
                </Text>
              </View>
            </View>
          </View>
          {/* Photo Quality Stats Only */}
          <View style={styles.visualKpiContainer}>
            <Text style={styles.kpiTitle}>Calidad de Evidencias</Text>
            <View style={styles.photoQualityStats}>
              <View style={styles.qualityStatCard}>
                <MaterialIcons name="check-circle" size={24} color="#10b981" />
                <Text style={styles.qualityStatNumber}>85%</Text>
                <Text style={styles.qualityStatLabel}>Aprobadas</Text>
              </View>
              <View style={styles.qualityStatCard}>
                <MaterialIcons name="error" size={24} color="#ef4444" />
                <Text style={styles.qualityStatNumber}>15%</Text>
                <Text style={styles.qualityStatLabel}>Rechazadas</Text>
              </View>
            </View>
          </View>
        </Animated.View>
        {/* End Project KPIs Graphical Section */}{" "}
        {/* Enhanced Navigation Cards */}
        <Animated.View
          entering={FadeInDown.delay(400)}
          style={styles.enhancedCardsContainer}
        >
          {/* Pilot Statistics Card */}
          <TouchableOpacity
            onPress={() => router.push("/admin/profile/pilot-details")}
            activeOpacity={0.85}
            style={styles.enhancedCardWrapper}
          >
            <LinearGradient
              colors={["#3B82F6", "#1E40AF", "#1E3A8A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.enhancedCard}
            >
              <View style={styles.enhancedCardContent}>
                <View style={styles.enhancedIconWrapper}>
                  <View style={styles.enhancedIconBackground}>
                    <MaterialIcons name="people" size={28} color="#3B82F6" />
                  </View>
                </View>
                <View style={styles.enhancedTextContent}>
                  <Text style={styles.enhancedCardTitle}>
                    Estadísticas de Pilotos
                  </Text>
                  <Text style={styles.enhancedCardSubtitle}>
                    Análisis detallado del rendimiento
                  </Text>
                  <View style={styles.enhancedCardMeta}>
                    <Text style={styles.enhancedMetaText}>
                      {kpiData.pilots.active} activos
                    </Text>
                    <Text style={styles.enhancedMetaDot}>•</Text>
                    <Text style={styles.enhancedMetaText}>
                      {Math.round(kpiData.pilots.averageEfficiency)}% eficiencia
                    </Text>
                  </View>
                </View>
                <View style={styles.enhancedArrowContainer}>
                  <MaterialIcons
                    name="arrow-forward"
                    size={20}
                    color="rgba(255, 255, 255, 0.9)"
                  />
                </View>
              </View>
              <View style={styles.enhancedCardGlow} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Projects Statistics Card */}
          <TouchableOpacity
            onPress={() => router.push("/admin/profile/project-details")}
            activeOpacity={0.85}
            style={styles.enhancedCardWrapper}
          >
            <LinearGradient
              colors={["#10B981", "#059669", "#047857"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.enhancedCard}
            >
              <View style={styles.enhancedCardContent}>
                <View style={styles.enhancedIconWrapper}>
                  <View style={styles.enhancedIconBackground}>
                    <MaterialIcons name="analytics" size={28} color="#10B981" />
                  </View>
                </View>
                <View style={styles.enhancedTextContent}>
                  <Text style={styles.enhancedCardTitle}>
                    Estadísticas de Proyectos
                  </Text>
                  <Text style={styles.enhancedCardSubtitle}>
                    Métricas y progreso de proyectos
                  </Text>
                  <View style={styles.enhancedCardMeta}>
                    <Text style={styles.enhancedMetaText}>
                      {kpiData.projects.active} activos
                    </Text>
                    <Text style={styles.enhancedMetaDot}>•</Text>
                    <Text style={styles.enhancedMetaText}>
                      {Math.round(kpiData.projects.averageProgress)}% progreso
                    </Text>
                  </View>
                </View>
                <View style={styles.enhancedArrowContainer}>
                  <MaterialIcons
                    name="arrow-forward"
                    size={20}
                    color="rgba(255, 255, 255, 0.9)"
                  />
                </View>
              </View>
              <View style={styles.enhancedCardGlow} />
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
  // Visual KPI Styles
  visualKpiContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  // Pie Chart Styles
  pieChartContainer: {
    alignItems: "center",
  },
  pieChart: {
    width: 100,
    height: 100,
    position: "relative",
    marginBottom: 16,
  },
  pieSegment: {
    borderRadius: 50,
  },
  pieCenter: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    top: 20,
    left: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pieCenterText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  pieCenterLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  pieLegend: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#6b7280",
  },
  // Photo Quality Bar Chart Styles
  photoQualityContainer: {
    alignItems: "center",
  },
  photoQualityBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 20,
    gap: 30,
    height: 140,
  },
  photoBarGroup: {
    alignItems: "center",
    minWidth: 80,
  },
  photoBar: {
    width: 40,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoBarValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  photoBarLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 16,
  },
  photoQualityStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    gap: 16,
  },
  qualityStatCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  qualityStatNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 8,
    marginBottom: 4,
  },
  qualityStatLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  }, // Time Analytics Styles
  timeAnalyticsContainer: {
    alignItems: "center",
    width: "100%",
  },
  timeMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
    paddingHorizontal: 20,
  },
  timeMetricItem: {
    alignItems: "center",
    flex: 1,
  },
  timeMetricDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  timeMetricLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 4,
  },
  timeMetricValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
  },
  // Pause Reasons Styles
  pauseReasonsContainer: {
    alignItems: "center",
    width: "100%",
  },
  pauseInsight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  pauseInsightText: {
    fontSize: 13,
    color: "#1e40af",
    marginLeft: 8,
    fontWeight: "500",
  },
  // Gauge Styles
  gaugeContainer: {
    alignItems: "center",
  },
  gauge: {
    width: 120,
    height: 60,
    position: "relative",
    marginBottom: 8,
  },
  gaugeBackground: {
    width: 120,
    height: 60,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  gaugeFill: {
    position: "absolute",
    width: 120,
    height: 60,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    backgroundColor: "#3b82f6",
    transformOrigin: "bottom center",
  },
  gaugeCenter: {
    position: "absolute",
    bottom: -10,
    left: "50%",
    transform: [{ translateX: -25 }],
    alignItems: "center",
  },
  gaugeValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  gaugeLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  gaugeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 120,
    marginBottom: 8,
  },
  gaugeStartLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  gaugeEndLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  efficiencyBadge: {
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  efficiencyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },
  // Bar Chart Styles
  barChartContainer: {
    alignItems: "center",
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    width: "100%",
    height: 100,
    marginBottom: 16,
  },
  barGroup: {
    alignItems: "center",
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  // Turbine Grid Styles
  turbineGridContainer: {
    alignItems: "center",
  },
  turbineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    maxWidth: 200,
  },
  turbineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  progressInfo: {
    alignItems: "center",
    width: "100%",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  progressTimeline: {
    flexDirection: "row",
    width: "80%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  timelineCompleted: {
    flex: 5,
    backgroundColor: "#10b981",
  },
  timelineRemaining: {
    flex: 5,
    backgroundColor: "#e5e7eb",
  },
  // Line Chart Styles
  lineChartContainer: {
    alignItems: "center",
  },
  lineChart: {
    width: 200,
    height: 100,
    position: "relative",
    marginBottom: 16,
  },
  chartGrid: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  gridLine: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginBottom: 19,
  },
  lineChartData: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  dataPoint: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  linePath: {
    position: "absolute",
    backgroundColor: "#ef4444",
  },
  chartInfo: {
    alignItems: "center",
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
  },

  // Enhanced Navigation Cards Styles
  enhancedCardsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 14,
  },
  enhancedCardWrapper: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  enhancedCard: {
    borderRadius: 20,
    padding: 20,
    height: 120,
    position: "relative",
    overflow: "hidden",
  },
  enhancedCardContent: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    zIndex: 2,
  },
  enhancedIconWrapper: {
    marginRight: 16,
  },
  enhancedIconBackground: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  enhancedTextContent: {
    flex: 1,
    paddingRight: 16,
  },
  enhancedCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  enhancedCardSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 8,
    lineHeight: 18,
  },
  enhancedCardMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  enhancedMetaText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
  enhancedMetaDot: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginHorizontal: 8,
  },
  enhancedArrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  enhancedCardGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
});
