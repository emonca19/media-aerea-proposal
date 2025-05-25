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
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => router.push("/admin/(kpis)/report")}
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
              <Text style={styles.headerSubtitle}>
                Estado actual del sistema
              </Text>
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
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Estado de Proyectos</Text>
            <View style={styles.progressStats}>
              <View style={styles.progressItem}>
                <View
                  style={[styles.progressDot, { backgroundColor: "#10b981" }]}
                />
                <Text style={styles.progressLabel}>Completados</Text>
                <Text style={styles.progressValue}>
                  {kpiData.projects.completed}
                </Text>
              </View>
              <View style={styles.progressItem}>
                <View
                  style={[styles.progressDot, { backgroundColor: "#3b82f6" }]}
                />
                <Text style={styles.progressLabel}>Activos</Text>
                <Text style={styles.progressValue}>
                  {kpiData.projects.active}
                </Text>
              </View>
              <View style={styles.progressItem}>
                <View
                  style={[styles.progressDot, { backgroundColor: "#ef4444" }]}
                />
                <Text style={styles.progressLabel}>Atrasados</Text>
                <Text style={styles.progressValue}>
                  {kpiData.projects.delayedProjects}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Turbine Statistics */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas de Turbinas</Text>
          <View style={styles.statsGrid}>
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

          <View style={styles.turbineProgress}>
            <Text style={styles.progressTitle}>Estado de Inspecciones</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (kpiData.turbines.inspected / kpiData.turbines.total) *
                      100
                    }%`,
                    backgroundColor: "#10b981",
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>
                Inspeccionadas: {kpiData.turbines.inspected}/
                {kpiData.turbines.total}
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(
                  (kpiData.turbines.inspected / kpiData.turbines.total) * 100
                )}
                %
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Individual Pilot Statistics */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>
            Estadísticas Individuales de Pilotos
          </Text>
          {mockPilotStats.map((pilot, index) => (
            <View key={index} style={styles.pilotCard}>
              <View style={styles.pilotHeader}>
                <View style={styles.pilotInfo}>
                  <Text style={styles.pilotName}>Piloto {index + 1}</Text>
                  <Text style={styles.pilotStats}>
                    {pilot.totalTurbinesInspected} turbinas •
                    {Math.round(pilot.totalFlightMinutes / 60)}h vuelo
                  </Text>
                </View>
                <View style={styles.pilotMetrics}>
                  <Text style={styles.pilotEfficiency}>
                    {pilot.dailyCompletionRatePercentage}%
                  </Text>
                  <Text style={styles.pilotEfficiencyLabel}>Eficiencia</Text>
                </View>
              </View>

              <View style={styles.pilotDetailsGrid}>
                <View style={styles.pilotDetail}>
                  <MaterialIcons name="schedule" size={16} color="#6b7280" />
                  <Text style={styles.pilotDetailText}>
                    {Math.round(pilot.averageTimePerTurbineSeconds / 3600)}h por
                    turbina
                  </Text>
                </View>
                <View style={styles.pilotDetail}>
                  <MaterialIcons
                    name="photo-camera"
                    size={16}
                    color="#6b7280"
                  />
                  <Text style={styles.pilotDetailText}>
                    {pilot.photoDeliveryTimeMinutes}min entrega
                  </Text>
                </View>
                <View style={styles.pilotDetail}>
                  <MaterialIcons name="warning" size={16} color="#6b7280" />
                  <Text style={styles.pilotDetailText}>
                    {pilot.incidentCount} incidentes
                  </Text>
                </View>
                <View style={styles.pilotDetail}>
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color="#6b7280"
                  />
                  <Text style={styles.pilotDetailText}>
                    {pilot.onTimePhotoDeliveryRatePercentage}% puntualidad
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Operational Bottlenecks */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
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
  pilotCard: {
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
  pilotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pilotInfo: {
    flex: 1,
  },
  pilotName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  pilotStats: {
    fontSize: 14,
    color: "#6b7280",
  },
  pilotMetrics: {
    alignItems: "flex-end",
  },
  pilotEfficiency: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3b82f6",
    marginBottom: 2,
  },
  pilotEfficiencyLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  pilotDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pilotDetail: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    width: (width - 64) / 2,
  },
  pilotDetailText: {
    fontSize: 12,
    color: "#4b5563",
    marginLeft: 6,
    flex: 1,
  },
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
});
