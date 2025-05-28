import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { mockProjects } from "../../../src/mocks/projects";

// Utility to get date range for selected period
type Period = "week" | "month" | "year";
function getPeriodRange(period: Period) {
  const now = new Date();
  let start: Date;
  if (period === "week") {
    start = new Date(now);
    start.setDate(now.getDate() - 7);
  } else if (period === "month") {
    start = new Date(now);
    start.setMonth(now.getMonth() - 1);
  } else {
    start = new Date(now);
    start.setFullYear(now.getFullYear() - 1);
  }
  return { start, end: now };
}

const ProjectDetailsScreen = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("month");

  // Get date range for selected period
  const { start: periodStart, end: periodEnd } = getPeriodRange(selectedPeriod);

  // Helper to check if a date is in range
  function inPeriod(dateStr: string | undefined) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d >= periodStart && d <= periodEnd;
  }

  // Filter projects by startDate in the period
  const filteredProjects = mockProjects.filter((p: any) =>
    inPeriod(p.startDate)
  );

  // Calculate stats based on filtered projects
  const projectStats = {
    totalProjects: filteredProjects.length,
    activeProjects: filteredProjects.filter((p: any) => p.status === "ACTIVE")
      .length,
    completedProjects: filteredProjects.filter(
      (p: any) => p.status === "COMPLETED"
    ).length,
    delayedProjects: filteredProjects.filter((p: any) => {
      const today = new Date();
      return p.endDate < today && p.status !== "COMPLETED";
    }).length,
    averageProgress:
      filteredProjects.length > 0
        ? filteredProjects.reduce((sum: number, p: any) => {
            const total =
              new Date(p.endDate).getTime() - new Date(p.startDate).getTime();
            const elapsed = Date.now() - new Date(p.startDate).getTime();
            return sum + Math.min((elapsed / total) * 100, 100);
          }, 0) / filteredProjects.length
        : 0,
    recentProjects: filteredProjects
      .sort(
        (a: any, b: any) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
      .slice(0, 5),
    upcomingMilestones: [
      {
        project: "Parque Eólico Valle Verde",
        milestone: "Fase 2 Inspección",
        dueDate: "En 3 días",
        priority: "high",
        date: "2025-05-30",
      },
      {
        project: "Renovación Turbinas Norte",
        milestone: "Revisión Técnica",
        dueDate: "En 5 días",
        priority: "medium",
        date: "2025-06-01",
      },
      {
        project: "Mantenimiento Costa Este",
        milestone: "Informe Final",
        dueDate: "En 1 semana",
        priority: "low",
        date: "2025-06-03",
      },
      {
        project: "Instalación Nuevas Turbinas",
        milestone: "Pruebas de Funcionamiento",
        dueDate: "En 10 días",
        priority: "high",
        date: "2025-06-08",
      },
    ].filter((m) => inPeriod(m.date)),
  };

  const StatCard = ({ title, value, icon, color, trend, subtitle }: any) => (
    <Animated.View
      entering={FadeInDown.delay(100)}
      style={[styles.statCard, { borderLeftColor: color }]}
    >
      <View style={styles.statCardHeader}>
        <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        {trend && (
          <View
            style={[
              styles.trendBadge,
              { backgroundColor: trend > 0 ? "#10B98120" : "#EF444420" },
            ]}
          >
            <Ionicons
              name={trend > 0 ? "trending-up" : "trending-down"}
              size={16}
              color={trend > 0 ? "#10B981" : "#EF4444"}
            />
            <Text
              style={[
                styles.trendText,
                { color: trend > 0 ? "#10B981" : "#EF4444" },
              ]}
            >
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </Animated.View>
  );
  const ProjectCard = ({ project, index }: { project: any; index: number }) => {
    const progress = Math.min(
      ((Date.now() - new Date(project.startDate).getTime()) /
        (new Date(project.endDate).getTime() -
          new Date(project.startDate).getTime())) *
        100,
      100
    );

    const statusColors: { [key: string]: string } = {
      ACTIVE: "#10B981",
      COMPLETED: "#3B82F6",
      PENDING: "#F59E0B",
      CANCELLED: "#EF4444",
    };

    return (
      <Animated.View
        entering={FadeInDown.delay(200 + index * 50)}
        style={styles.projectCard}
      >
        <View style={styles.projectHeader}>
          <Text style={styles.projectName} numberOfLines={1}>
            {project.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColors[project.status]}20` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusColors[project.status] },
              ]}
            >
              {project.status}
            </Text>
          </View>
        </View>

        <Text style={styles.projectDescription} numberOfLines={2}>
          {project.description}
        </Text>

        <View style={styles.projectDetails}>
          <View style={styles.projectInfo}>
            <Ionicons name="calendar" size={14} color="#64748B" />
            <Text style={styles.projectInfoText}>
              {new Date(project.startDate).toLocaleDateString("es-ES")} -{" "}
              {new Date(project.endDate).toLocaleDateString("es-ES")}
            </Text>
          </View>
          <View style={styles.projectInfo}>
            <Ionicons name="location" size={14} color="#64748B" />
            <Text style={styles.projectInfoText}>{project.windParkId}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>
            Progreso: {Math.round(progress)}%
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: statusColors[project.status],
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>
    );
  };
  const MilestoneCard = ({
    milestone,
    index,
  }: {
    milestone: any;
    index: number;
  }) => {
    const priorityColors: { [key: string]: string } = {
      high: "#EF4444",
      medium: "#F59E0B",
      low: "#10B981",
    };

    return (
      <Animated.View
        entering={FadeInDown.delay(300 + index * 50)}
        style={styles.milestoneCard}
      >
        <View
          style={[
            styles.priorityIndicator,
            { backgroundColor: priorityColors[milestone.priority] },
          ]}
        />
        <View style={styles.milestoneContent}>
          <Text style={styles.milestoneProject}>{milestone.project}</Text>
          <Text style={styles.milestoneName}>{milestone.milestone}</Text>
          <Text style={styles.milestoneDue}>{milestone.dueDate}</Text>
        </View>
        <TouchableOpacity style={styles.milestoneAction}>
          <Ionicons name="chevron-forward" size={20} color="#9C46CE" />
        </TouchableOpacity>
      </Animated.View>
    );
  };
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Estadísticas de Proyectos",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#9C46CE" />
              <Text style={styles.backButtonText}>Atrás</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selection */}
        <Animated.View
          entering={FadeInDown.delay(50)}
          style={styles.periodSelector}
        >
          {(["week", "month", "year"] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === "week"
                  ? "Semana"
                  : period === "month"
                  ? "Mes"
                  : "Año"}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Proyectos"
            value={projectStats.totalProjects}
            icon="folder"
            color="#8B5CF6"
            trend={3}
          />
          <StatCard
            title="Proyectos Activos"
            value={projectStats.activeProjects}
            icon="play-circle"
            color="#10B981"
            trend={1}
          />
          <StatCard
            title="Completados"
            value={projectStats.completedProjects}
            icon="checkmark-circle"
            color="#3B82F6"
            trend={5}
          />
          <StatCard
            title="Progreso Promedio"
            value={`${Math.round(projectStats.averageProgress)}%`}
            icon="analytics"
            color="#F59E0B"
            subtitle="Avance general"
          />
        </View>

        {/* Progress Overview */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.progressOverview}
        >
          <Text style={styles.sectionTitle}>Resumen de Progreso</Text>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {Math.round(projectStats.averageProgress)}%
              </Text>
              <Text style={styles.progressStatLabel}>Progreso Promedio</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {projectStats.delayedProjects}
              </Text>
              <Text style={styles.progressStatLabel}>Proyectos Atrasados</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {Math.round(
                  (projectStats.completedProjects /
                    projectStats.totalProjects) *
                    100
                )}
                %
              </Text>
              <Text style={styles.progressStatLabel}>Tasa de Finalización</Text>
            </View>
          </View>
        </Animated.View>

        {/* Recent Projects */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
          <Text style={styles.sectionTitle}>Proyectos Recientes</Text>
          <Text style={styles.sectionSubtitle}>
            Últimos proyectos iniciados
          </Text>

          <View style={styles.projectsContainer}>
            {projectStats.recentProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </View>
        </Animated.View>

        {/* Upcoming Milestones */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos Hitos</Text>
          <Text style={styles.sectionSubtitle}>Fechas límite importantes</Text>
          <View style={styles.milestonesContainer}>
            {projectStats.upcomingMilestones.map((milestone, index) => (
              <MilestoneCard key={index} milestone={milestone} index={index} />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    fontSize: 14,
    color: "#9C46CE",
    fontWeight: "600",
    marginLeft: 4,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: "#9C46CE",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  statSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  progressOverview: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  progressStat: {
    alignItems: "center",
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#9C46CE",
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  projectsContainer: {
    gap: 16,
  },
  projectCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  projectName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  projectDescription: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
    lineHeight: 18,
  },
  projectDetails: {
    marginBottom: 16,
  },
  projectInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  projectInfoText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 6,
  },
  progressSection: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  milestonesContainer: {
    gap: 12,
  },
  milestoneCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneProject: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  milestoneName: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 2,
  },
  milestoneDue: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  milestoneAction: {
    padding: 8,
  },
});

export default ProjectDetailsScreen;
