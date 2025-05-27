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
import { mockPilotStats, mockPilotUsers } from "../../../src/mocks/pilots";
import { mockProjectProgress, mockProjects } from "../../../src/mocks/projects";
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
              onPress={() => router.push("/admin/profile")}
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
        </Animated.View>        {/* Individual Pilot Statistics */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>
            Estadísticas Individuales de Pilotos
          </Text>
          <View style={styles.pilotsGrid}>
            {mockPilotUsers.map((pilot, index) => {
              const avatarColor = index % 4 === 0 ? '#3b82f6' : 
                                index % 4 === 1 ? '#10b981' : 
                                index % 4 === 2 ? '#f59e0b' : '#8b5cf6';
              return (
                <Animated.View 
                  key={pilot.id} 
                  style={styles.pilotCardImproved}
                  entering={FadeInDown.delay(450 + index * 100)}
                >
                  <View style={styles.pilotCardHeader}>
                    <View style={styles.pilotAvatarContainer}>
                      <LinearGradient
                        colors={[avatarColor, `${avatarColor}CC`]}
                        style={styles.pilotAvatar}
                      >
                        <Text style={styles.pilotAvatarText}>
                          {pilot.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </Text>
                      </LinearGradient>
                      <View style={[styles.pilotStatusDot, { 
                        backgroundColor: pilot.isAvailable ? '#10b981' : '#f59e0b' 
                      }]} />
                    </View>
                    <View style={styles.pilotInfoImproved}>
                      <Text style={styles.pilotNameImproved} numberOfLines={1}>
                        {pilot.name}
                      </Text>
                      <Text style={styles.pilotStatsImproved}>
                        {pilot.stats.totalTurbinesInspected} turbinas inspeccionadas
                      </Text>
                      <Text style={styles.pilotFlightTime}>
                        {Math.round(pilot.stats.totalFlightMinutes / 60)}h de vuelo total
                      </Text>
                    </View>
                    <View style={styles.pilotEfficiencyBadgeImproved}>
                      <Text style={styles.pilotEfficiencyNumber}>
                        {pilot.stats.dailyCompletionRatePercentage}%
                      </Text>
                      <Text style={styles.pilotEfficiencyLabel}>Eficiencia</Text>
                    </View>
                  </View>

                  <View style={styles.pilotMetricsGrid}>
                    <View style={styles.metricCard}>
                      <MaterialIcons name="schedule" size={16} color="#6b7280" />
                      <Text style={styles.metricValue}>
                        {(pilot.stats.averageTimePerTurbineSeconds / 3600).toFixed(1)}h
                      </Text>
                      <Text style={styles.metricLabel}>Por turbina</Text>
                    </View>
                    <View style={styles.metricCard}>
                      <MaterialIcons name="photo-camera" size={16} color="#6b7280" />
                      <Text style={styles.metricValue}>
                        {pilot.stats.photoDeliveryTimeMinutes}min
                      </Text>
                      <Text style={styles.metricLabel}>Entrega fotos</Text>
                    </View>
                    <View style={styles.metricCard}>
                      <MaterialIcons name="warning" size={16} color="#6b7280" />
                      <Text style={styles.metricValue}>
                        {pilot.stats.incidentCount}
                      </Text>
                      <Text style={styles.metricLabel}>Incidentes</Text>
                    </View>
                  </View>

                  <View style={styles.pilotProgressSection}>
                    <Text style={styles.progressSectionTitle}>Puntualidad en entregas</Text>
                    <View style={styles.pilotProgressBarImproved}>
                      <View style={[styles.pilotProgressFill, { 
                        width: `${pilot.stats.onTimePhotoDeliveryRatePercentage}%`,
                        backgroundColor: pilot.stats.onTimePhotoDeliveryRatePercentage >= 90 ? '#10b981' : 
                                       pilot.stats.onTimePhotoDeliveryRatePercentage >= 75 ? '#f59e0b' : '#ef4444'
                      }]} />
                    </View>
                    <Text style={styles.pilotProgressText}>
                      {pilot.stats.onTimePhotoDeliveryRatePercentage}% entregas puntuales
                    </Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>        </Animated.View>

        {/* Projects Statistics Section */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas de Proyectos</Text>
          
          {/* Project Status Overview Cards */}
          <View style={styles.projectOverviewGrid}>
            {mockProjects.map((project, index) => {
              const progress = mockProjectProgress.find(p => p.projectId === project.id);
              const statusColor = 
                project.status === 'ACTIVE' ? '#10b981' :
                project.status === 'COMPLETED' ? '#3b82f6' :
                project.status === 'PAUSED' ? '#f59e0b' : '#6b7280';
              
              const statusText = 
                project.status === 'ACTIVE' ? 'Activo' :
                project.status === 'COMPLETED' ? 'Completado' :
                project.status === 'PAUSED' ? 'Pausado' : 'Pendiente';

              return (
                <Animated.View
                  key={project.id}
                  style={styles.projectCard}
                  entering={FadeInDown.delay(550 + index * 100)}
                >
                  <View style={styles.projectCardHeader}>
                    <View style={styles.projectTitleSection}>
                      <Text style={styles.projectName} numberOfLines={2}>
                        {project.name}
                      </Text>
                      <Text style={styles.projectClient}>
                        Cliente: {project.clientId.replace('client_', 'Cliente ')}
                      </Text>
                    </View>
                    <View style={[styles.projectStatusBadge, { backgroundColor: `${statusColor}20`, borderColor: statusColor }]}>
                      <View style={[styles.projectStatusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.projectStatusText, { color: statusColor }]}>
                        {statusText}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.projectMetricsGrid}>
                    <View style={styles.projectMetricCard}>
                      <MaterialIcons name="wind-power" size={18} color="#6b7280" />
                      <Text style={styles.projectMetricValue}>
                        {progress?.totalTurbines || 0}
                      </Text>
                      <Text style={styles.projectMetricLabel}>Turbinas</Text>
                    </View>
                    <View style={styles.projectMetricCard}>
                      <MaterialIcons name="check-circle" size={18} color="#6b7280" />
                      <Text style={styles.projectMetricValue}>
                        {progress?.turbinesInspected || 0}
                      </Text>
                      <Text style={styles.projectMetricLabel}>Inspeccionadas</Text>
                    </View>
                    <View style={styles.projectMetricCard}>
                      <MaterialIcons name="schedule" size={18} color="#6b7280" />
                      <Text style={styles.projectMetricValue}>
                        {project.estimatedDuration}d
                      </Text>
                      <Text style={styles.projectMetricLabel}>Duración</Text>
                    </View>
                  </View>

                  {progress && (
                    <View style={styles.projectProgressSection}>
                      <View style={styles.projectProgressHeader}>
                        <Text style={styles.projectProgressLabel}>Progreso del proyecto</Text>
                        <Text style={styles.projectProgressPercentage}>
                          {progress.completionPercentage}%
                        </Text>
                      </View>
                      <View style={styles.projectProgressBarContainer}>
                        <View style={[styles.projectProgressBar, { 
                          width: `${progress.completionPercentage}%`,
                          backgroundColor: statusColor
                        }]} />
                      </View>
                      <View style={styles.projectProgressDetails}>
                        <Text style={styles.projectProgressDetailText}>
                          {progress.turbinesPhotosApproved} fotos aprobadas • {progress.turbinesPhotosRejected} rechazadas
                        </Text>
                      </View>
                    </View>
                  )}
                </Animated.View>
              );
            })}
          </View>          {/* Project Performance Summary */}
          {/* <Animated.View entering={FadeInDown.delay(800)} style={styles.projectSummaryCard}>
            <Text style={styles.projectSummaryTitle}>Resumen de Rendimiento</Text>
            
            <View style={styles.projectSummaryGrid}>              <View style={styles.projectSummaryMetric}>
                <View style={styles.projectSummaryIconContainer}>
                  <MaterialIcons name="assessment" size={20} color="#3b82f6" />
                </View>
                <Text style={styles.projectSummaryValue}>
                  {Math.round(mockProjectProgress.reduce((sum, p) => sum + p.completionPercentage, 0) / mockProjectProgress.length)}%
                </Text>
                <Text style={styles.projectSummaryLabel}>Progreso Promedio</Text>
              </View>
              
              <View style={styles.projectSummaryMetric}>
                <View style={styles.projectSummaryIconContainer}>
                  <MaterialIcons name="photo-camera" size={20} color="#10b981" />
                </View>
                <Text style={styles.projectSummaryValue}>
                  {Math.round((mockProjectProgress.reduce((sum, p) => sum + p.turbinesPhotosApproved, 0) / 
                    mockProjectProgress.reduce((sum, p) => sum + p.turbinesPhotosUploaded, 0)) * 100) || 0}%
                </Text>
                <Text style={styles.projectSummaryLabel}>Tasa de Aprobación</Text>
              </View>

              <View style={styles.projectSummaryMetric}>
                <View style={styles.projectSummaryIconContainer}>
                  <MaterialIcons name="schedule" size={20} color="#f59e0b" />
                </View>
                <Text style={styles.projectSummaryValue}>
                  {mockProjects.filter(p => p.status === 'ACTIVE').length}
                </Text>
                <Text style={styles.projectSummaryLabel}>Proyectos Activos</Text>
              </View>

              <View style={styles.projectSummaryMetric}>
                <View style={styles.projectSummaryIconContainer}>
                  <MaterialIcons name="done-all" size={20} color="#8b5cf6" />
                </View>
                <Text style={styles.projectSummaryValue}>
                  {mockProjects.filter(p => p.status === 'COMPLETED').length}
                </Text>
                <Text style={styles.projectSummaryLabel}>Completados</Text>
              </View>
            </View>

            {/* Timeline Performance Chart */}
            {/* <View style={styles.projectTimelineSection}>
              <Text style={styles.projectTimelineTitle}>Línea de Tiempo de Proyectos</Text>
              <View style={styles.projectTimelineContainer}>
                {mockProjects.map((project, index) => {
                  const daysSinceStart = Math.ceil((new Date().getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24));
                  const progressPercentage = mockProjectProgress.find(p => p.projectId === project.id)?.completionPercentage || 0;
                  const isOnTrack = progressPercentage >= (daysSinceStart / project.estimatedDuration) * 100;
                  
                  return (
                    <View key={project.id} style={styles.projectTimelineItem}>
                      <View style={styles.projectTimelineInfo}>
                        <Text style={styles.projectTimelineName} numberOfLines={1}>
                          {project.name}
                        </Text>
                        <Text style={styles.projectTimelineStatus}>
                          {project.status === 'COMPLETED' ? 'Finalizado' : 
                           project.status === 'ACTIVE' ? (isOnTrack ? 'En tiempo' : 'Atrasado') : 
                           'Pausado'}
                        </Text>
                      </View>
                      <View style={styles.projectTimelineProgress}>
                        <Text style={[styles.projectTimelinePercentage, {
                          color: project.status === 'COMPLETED' ? '#10b981' : 
                                isOnTrack ? '#3b82f6' : '#ef4444'
                        }]}>
                          {progressPercentage}%
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View> */}
        </Animated.View>

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
  },  pilotsGrid: {
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
  },  projectSummaryCard: {
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
  },projectSummaryGrid: {
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
});
