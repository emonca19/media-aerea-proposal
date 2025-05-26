import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  mockClients,
  mockProjectProgress,
  mockProjects,
  mockWindParks,
  mockTurbines,
  mockPilotUsers,
  mockDrones,
  mockProjectAssignments,
} from "../../../src/mocks";

type TabType = "general" | "parks" | "assignments" | "history";

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("general");

  const project = mockProjects.find((p) => p.id === id);

  if (!project) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Proyecto no encontrado" }} />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Proyecto no encontrado</Text>
          <Text style={styles.errorDescription}>
            El proyecto solicitado no existe o ha sido eliminado.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getClientName = (clientId: string) => {
    const client = mockClients.find((c) => c.id === clientId);
    return client?.name || clientId;
  };

  const getWindParkName = (windParkId: string) => {
    const windPark = mockWindParks.find((wp) => wp.id === windParkId);
    return windPark?.name || windParkId;
  };

  const getProjectProgress = (projectId: string) => {
    return mockProjectProgress.find((p) => p.projectId === projectId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "#10b981";
      case "Paused":
        return "#f59e0b";
      case "Completed":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Active":
        return "Activo";
      case "Paused":
        return "Pausado";
      case "Completed":
        return "Completado";
      default:
        return status;
    }
  };

  const getTurbinesForProject = () => {
    // Get turbines from the wind park associated with this project
    return mockTurbines.filter(turbine => turbine.windParkId === project.windParkId);
  };
  const getAssignmentsForProject = () => {
    return mockProjectAssignments.filter(assignment => assignment.projectId === project.id);
  };

  const getPilotName = (pilotId: string) => {
    const pilot = mockPilotUsers.find(p => p.id === pilotId);
    return pilot ? pilot.name : pilotId;
  };

  const getDroneName = (droneId: string) => {
    const drone = mockDrones.find(d => d.id === droneId);
    return drone?.model || droneId;
  };

  const tabs = [
    { key: "general", label: "General", icon: "information-circle" },
    { key: "parks", label: "Parques", icon: "business" },
    { key: "assignments", label: "Asignaciones", icon: "people" },
    { key: "history", label: "Historial", icon: "time" },
  ];

  const renderTabContent = () => {
    const progress = getProjectProgress(project.id);
    const clientName = getClientName(project.clientId);
    const windParkName = getWindParkName(project.windParkId);
    const turbines = getTurbinesForProject();
    const assignments = getAssignmentsForProject();

    switch (activeTab) {
      case "general":
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* Project Status */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Estado del Proyecto</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(project.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{getStatusText(project.status)}</Text>
                </View>
              </View>
            </View>

            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Básica</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Cliente</Text>
                  <Text style={styles.infoValue}>{clientName}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Parque Eólico</Text>
                  <Text style={styles.infoValue}>{windParkName}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Fecha de Inicio</Text>
                  <Text style={styles.infoValue}>
                    {new Date(project.startDate).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Fecha de Finalización</Text>
                  <Text style={styles.infoValue}>
                    {new Date(project.endDate).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.descriptionText}>{project.description}</Text>
            </View>

            {/* Progress */}
            {progress && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Progreso del Proyecto</Text>
                <View style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progreso General</Text>
                    <Text style={styles.progressPercentage}>
                      {progress.completionPercentage}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progress.completionPercentage}%`,
                          backgroundColor:
                            progress.completionPercentage === 100
                              ? "#10b981"
                              : "#9C46CE",
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.progressStats}>
                    <Text style={styles.progressStat}>
                      {progress.turbinesInspected} de {progress.totalTurbines} turbinas inspeccionadas
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Notes */}
            {project.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notas</Text>
                <Text style={styles.notesText}>{project.notes}</Text>
              </View>
            )}
          </ScrollView>
        );

      case "parks":
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* Wind Park Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Parque Eólico Asociado</Text>
              <View style={styles.parkCard}>
                <View style={styles.parkHeader}>
                  <MaterialCommunityIcons
                    name="wind-turbine"
                    size={24}
                    color="#9C46CE"
                  />
                  <Text style={styles.parkName}>{windParkName}</Text>
                </View>
                <Text style={styles.parkDescription}>
                  Parque eólico principal asociado a este proyecto
                </Text>
              </View>
            </View>

            {/* Turbines List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Turbinas ({turbines.length})
              </Text>
              {turbines.length > 0 ? (
                <View style={styles.turbinesList}>                  {turbines.map((turbine) => (
                    <View key={turbine.id} style={styles.turbineCard}>
                      <View style={styles.turbineHeader}>
                        <Text style={styles.turbineId}>{turbine.name}</Text>
                        <View
                          style={[
                            styles.turbineStatusBadge,
                            {
                              backgroundColor:
                                turbine.status === "APPROVED"
                                  ? "#10b981"
                                  : turbine.status === "PHOTOS_UPLOADED"
                                  ? "#f59e0b"
                                  : turbine.status === "INSPECTED"
                                  ? "#3b82f6"
                                  : "#6b7280",
                            },
                          ]}
                        >
                          <Text style={styles.turbineStatusText}>
                            {turbine.status === "APPROVED"
                              ? "Aprobada"
                              : turbine.status === "PHOTOS_UPLOADED"
                              ? "Fotos Subidas"
                              : turbine.status === "INSPECTED"
                              ? "Inspeccionada"
                              : turbine.status === "NOT_STARTED"
                              ? "No Iniciada"
                              : "Rechazada"}
                          </Text>
                        </View>
                      </View>
                      {turbine.position && (
                        <Text style={styles.turbineLocation}>
                          Posición: X: {turbine.position.x}, Y: {turbine.position.y}
                        </Text>
                      )}
                      {turbine.lastInspection && (
                        <Text style={styles.turbineDate}>
                          Última inspección: {turbine.lastInspection.toLocaleDateString()}
                        </Text>
                      )}
                      {turbine.notes && (
                        <Text style={styles.turbineNotes}>{turbine.notes}</Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="wind-turbine-alert"
                    size={48}
                    color="#d1d5db"
                  />
                  <Text style={styles.emptyStateText}>
                    No hay turbinas asociadas a este proyecto
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        );

      case "assignments":
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Asignaciones Activas ({assignments.length})
              </Text>
              {assignments.length > 0 ? (
                <View style={styles.assignmentsList}>                  {assignments.map((assignment) => (
                    <View key={assignment.id} style={styles.assignmentCard}>
                      <View style={styles.assignmentHeader}>
                        <Text style={styles.assignmentTitle}>
                          Asignación #{assignment.id.slice(-4)}
                        </Text>
                        <View
                          style={[
                            styles.assignmentStatusBadge,
                            {
                              backgroundColor: assignment.confirmed
                                ? "#10b981"
                                : "#f59e0b",
                            },
                          ]}
                        >
                          <Text style={styles.assignmentStatusText}>
                            {assignment.confirmed ? "Confirmada" : "Pendiente"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.assignmentDetails}>
                        <View style={styles.assignmentDetailRow}>
                          <Ionicons name="people" size={16} color="#6b7280" />
                          <Text style={styles.assignmentDetailText}>
                            Pilotos: {assignment.pilotIds.map(id => getPilotName(id)).join(", ")}
                          </Text>
                        </View>
                        <View style={styles.assignmentDetailRow}>
                          <MaterialCommunityIcons
                            name="quadcopter"
                            size={16}
                            color="#6b7280"
                          />
                          <Text style={styles.assignmentDetailText}>
                            Drones: {assignment.droneIds.map(id => getDroneName(id)).join(", ")}
                          </Text>
                        </View>
                        <View style={styles.assignmentDetailRow}>
                          <Ionicons name="calendar" size={16} color="#6b7280" />
                          <Text style={styles.assignmentDetailText}>
                            Inicio: {assignment.estimatedStartDate.toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </Text>
                        </View>
                        <View style={styles.assignmentDetailRow}>
                          <Ionicons name="time" size={16} color="#6b7280" />
                          <Text style={styles.assignmentDetailText}>
                            Duración: {assignment.estimatedDuration} días
                          </Text>
                        </View>
                        {assignment.notes && (
                          <View style={styles.assignmentDetailRow}>
                            <Ionicons name="document-text" size={16} color="#6b7280" />
                            <Text style={styles.assignmentDetailText}>
                              {assignment.notes}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>
                    No hay asignaciones para este proyecto
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  Alert.alert(
                    "Gestionar Asignaciones",
                    "Esta funcionalidad se implementará próximamente."
                  )
                }
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Nueva Asignación</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "history":
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Historial de Cambios</Text>
              <View style={styles.historyList}>
                {/* Mock history entries */}
                <View style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="create" size={16} color="#9C46CE" />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyTitle}>Proyecto creado</Text>
                    <Text style={styles.historyDescription}>
                      El proyecto fue creado por Admin
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(project.startDate).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="person-add" size={16} color="#10b981" />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyTitle}>Asignación de recursos</Text>
                    <Text style={styles.historyDescription}>
                      Se asignaron pilotos y drones al proyecto
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(project.startDate).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>

                {progress && progress.completionPercentage > 0 && (
                  <View style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyTitle}>Progreso actualizado</Text>
                      <Text style={styles.historyDescription}>
                        Progreso del proyecto: {progress.completionPercentage}%
                      </Text>
                      <Text style={styles.historyDate}>Hace 2 días</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: project.name,
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Editar Proyecto",
                  "La funcionalidad de edición se implementará próximamente."
                )
              }
              style={styles.editButton}
            >
              <Ionicons name="create" size={24} color="#9C46CE" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.key as TabType)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.key ? "#9C46CE" : "#6b7280"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#9C46CE",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    padding: 8,
  },
  tabsContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tabsScrollContainer: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#f3f4f6",
  },
  tabText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#9C46CE",
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  descriptionText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  progressCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "700",
    color: "#9C46CE",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressStats: {
    alignItems: "center",
  },
  progressStat: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  notesText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    fontStyle: "italic",
  },
  parkCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
  },
  parkHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  parkName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  parkDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  turbinesList: {
    gap: 12,
  },
  turbineCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
  },
  turbineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  turbineId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  turbineStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  turbineStatusText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },  turbineLocation: {
    fontSize: 14,
    color: "#6b7280",
  },
  turbineDate: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  turbineNotes: {
    fontSize: 14,
    color: "#374151",
    fontStyle: "italic",
    marginTop: 4,
  },
  assignmentsList: {
    gap: 12,
    marginBottom: 16,
  },
  assignmentCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
  },
  assignmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  assignmentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  assignmentStatusText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  assignmentDetails: {
    gap: 8,
  },
  assignmentDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  assignmentDetailText: {
    fontSize: 14,
    color: "#6b7280",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9C46CE",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  historyList: {
    gap: 16,
  },
  historyItem: {
    flexDirection: "row",
    gap: 12,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  historyDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 12,
    textAlign: "center",
  },
});
