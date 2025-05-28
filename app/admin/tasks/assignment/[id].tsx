import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  mockCameras,
  mockDrones,
  mockPilotUsers,
  mockProjectAssignments,
  mockProjects,
  mockTurbines,
  mockWindParks,
} from "../../../../src/mocks";

export default function AssignmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Find the assignment
  const assignment = mockProjectAssignments.find((a) => a.id === id);

  if (!assignment) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Asignación no encontrada</Text>
          <Text style={styles.errorDescription}>
            La asignación que busca no existe o ha sido eliminada.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Get related data
  const project = mockProjects.find((p) => p.id === assignment.projectId);
  const windPark = project
    ? mockWindParks.find((w) => w.id === project.windParkId)
    : null;
  const assignedPilots = assignment.pilotIds
    .map((pilotId) => mockPilotUsers.find((p) => p.id === pilotId))
    .filter((pilot): pilot is NonNullable<typeof pilot> => pilot !== undefined);
  const assignedDrones = assignment.droneIds
    .map((droneId) => mockDrones.find((d) => d.id === droneId))
    .filter((drone): drone is NonNullable<typeof drone> => drone !== undefined);
  const assignedCameras = assignment.cameraIds
    .map((cameraId) => mockCameras.find((c) => c.id === cameraId))
    .filter(
      (camera): camera is NonNullable<typeof camera> => camera !== undefined
    );
  const assignedTurbines = assignment.turbineIds
    .map((turbineId) => mockTurbines.find((t) => t.id === turbineId))
    .filter(
      (turbine): turbine is NonNullable<typeof turbine> => turbine !== undefined
    );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDurationText = (duration: number) => {
    if (duration === 1) return "1 día";
    return `${duration} días`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "#10b981";
      case "PAUSED":
        return "#f59e0b";
      case "COMPLETED":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  const handleEditAssignment = () => {
    Alert.alert(
      "Editar Asignación",
      "La funcionalidad de edición estará disponible próximamente.",
      [{ text: "OK" }]
    );
  };

  const handleDeleteAssignment = () => {
    Alert.alert(
      "Eliminar Asignación",
      "¿Está seguro que desea eliminar esta asignación? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Asignación eliminada",
              "La asignación ha sido eliminada exitosamente."
            );
            router.back();
          },
        },
      ]
    );
  };

  const PilotImage = ({ pilotId }: { pilotId: string }) => {
    const pilot = mockPilotUsers.find((p) => p.id === pilotId);
    const imageUri = pilot?.profileImage;

    if (!imageUri) {
      return (
        <View style={styles.pilotImagePlaceholder}>
          <Ionicons name="person" size={20} color="#9ca3af" />
        </View>
      );
    }

    return (
      <Image
        source={{ uri: imageUri }}
        style={styles.pilotImage}
        onError={() => null}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "Detalle de Asignación",
          headerShown: true,
          headerBackTitle: "Asignaciones",
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerActionButton}
                onPress={handleEditAssignment}
              >
                <MaterialIcons name="edit" size={20} color="#9C46CE" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerActionButton}
                onPress={handleDeleteAssignment}
              >
                <MaterialIcons name="delete" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status and Basic Info */}
        <View style={styles.section}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.assignmentId}>ID: {assignment.id}</Text>
              <Text style={styles.assignmentTitle}>
                {project?.name || "Proyecto no encontrado"}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusColor(project?.status || "UNKNOWN"),
                },
              ]}
            >
              <Text style={styles.statusText}>
                {project?.status || "DESCONOCIDO"}
              </Text>
            </View>
          </View>
        </View>

        {/* Project Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="folder-outline"
              size={20}
              color="#9C46CE"
            />
            <Text style={styles.sectionTitle}>Información del Proyecto</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Proyecto:</Text>
              <Text style={styles.infoValue}>{project?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Descripción:</Text>
              <Text style={styles.infoValue}>{project?.description}</Text>
            </View>
            {windPark && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Parque Eólico:</Text>
                  <Text style={styles.infoValue}>{windPark.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ubicación:</Text>
                  <Text style={styles.infoValue}>
                    {windPark.location.address}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="schedule" size={20} color="#9C46CE" />
            <Text style={styles.sectionTitle}>Cronograma</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.timelineRow}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <MaterialIcons name="play-arrow" size={16} color="#10b981" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Fecha de Inicio</Text>
                  <Text style={styles.timelineValue}>
                    {formatDate(assignment.estimatedStartDate)}
                  </Text>
                </View>
              </View>
              <View style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <MaterialIcons name="stop" size={16} color="#ef4444" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Fecha de Fin</Text>
                  <Text style={styles.timelineValue}>
                    {formatDate(assignment.estimatedEndDate)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.durationInfo}>
              <MaterialIcons name="access-time" size={18} color="#6b7280" />
              <Text style={styles.durationText}>
                Duración estimada:{" "}
                {getDurationText(assignment.estimatedDuration)}
              </Text>
            </View>
          </View>
        </View>

        {/* Assigned Pilots */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="account-group"
              size={20}
              color="#9C46CE"
            />
            <Text style={styles.sectionTitle}>
              Pilotos Asignados ({assignedPilots.length})
            </Text>
          </View>
          <View style={styles.card}>
            {assignedPilots.map((pilot) => (
              <View key={pilot.id} style={styles.pilotItem}>
                <PilotImage pilotId={pilot.id} />
                <View style={styles.pilotInfo}>
                  <Text style={styles.pilotName}>{pilot.name}</Text>
                  <Text style={styles.pilotEmail}>{pilot.email}</Text>
                  {pilot.droneOperatorLicense && (
                    <View style={styles.licenseInfo}>
                      <MaterialIcons
                        name="card-membership"
                        size={14}
                        color="#9C46CE"
                      />
                      <Text style={styles.licenseText}>
                        Licencia: {pilot.droneOperatorLicense}
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.availabilityBadge,
                    {
                      backgroundColor: pilot.isAvailable
                        ? "#dcfce7"
                        : "#fef2f2",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.availabilityDot,
                      {
                        backgroundColor: pilot.isAvailable
                          ? "#16a34a"
                          : "#dc2626",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.availabilityText,
                      { color: pilot.isAvailable ? "#16a34a" : "#dc2626" },
                    ]}
                  >
                    {pilot.isAvailable ? "Disponible" : "Ocupado"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Assigned Drones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="drone" size={20} color="#9C46CE" />
            <Text style={styles.sectionTitle}>
              Drones Asignados ({assignedDrones.length})
            </Text>
          </View>
          <View style={styles.card}>
            {assignedDrones.map((drone) => (
              <View key={drone.id} style={styles.equipmentItem}>
                <View style={styles.equipmentIcon}>
                  <MaterialCommunityIcons
                    name="drone"
                    size={24}
                    color="#9C46CE"
                  />
                </View>
                <View style={styles.equipmentInfo}>
                  <Text style={styles.equipmentName}>{drone.name}</Text>
                  <Text style={styles.equipmentDetail}>
                    Modelo: {drone.model} | S/N: {drone.serialNumber}
                  </Text>
                  <Text style={styles.equipmentDetail}>
                    Fabricante: {drone.manufacturer}
                  </Text>
                  {drone.hasCamera && (
                    <View style={styles.featureTag}>
                      <MaterialCommunityIcons
                        name="camera"
                        size={12}
                        color="#10b981"
                      />
                      <Text style={styles.featureText}>Cámara integrada</Text>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(drone.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{drone.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Assigned Cameras */}
        {assignedCameras.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="camera" size={20} color="#9C46CE" />
              <Text style={styles.sectionTitle}>
                Cámaras Asignadas ({assignedCameras.length})
              </Text>
            </View>
            <View style={styles.card}>
              {assignedCameras.map((camera) => (
                <View key={camera.id} style={styles.equipmentItem}>
                  <View style={styles.equipmentIcon}>
                    <MaterialCommunityIcons
                      name="camera"
                      size={24}
                      color="#9C46CE"
                    />
                  </View>
                  <View style={styles.equipmentInfo}>
                    <Text style={styles.equipmentName}>{camera.name}</Text>
                    <Text style={styles.equipmentDetail}>
                      Modelo: {camera.model} | S/N: {camera.serialNumber}
                    </Text>
                    <Text style={styles.equipmentDetail}>
                      Fabricante: {camera.manufacturer}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(camera.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{camera.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Assigned Turbines */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="wind-turbine"
              size={20}
              color="#9C46CE"
            />
            <Text style={styles.sectionTitle}>
              Turbinas Asignadas ({assignedTurbines.length})
            </Text>
          </View>
          <View style={styles.card}>
            {assignedTurbines.length === 0 ? (
              <Text style={styles.emptyText}>
                No hay turbinas asignadas específicamente
              </Text>
            ) : (
              <View style={styles.turbinesGrid}>
                {assignedTurbines.map((turbine) => (
                  <View key={turbine.id} style={styles.turbineCard}>
                    <MaterialCommunityIcons
                      name="wind-turbine"
                      size={20}
                      color="#9C46CE"
                    />
                    <Text style={styles.turbineName}>{turbine.name}</Text>
                    <View
                      style={[
                        styles.turbineStatusBadge,
                        { backgroundColor: getStatusColor(turbine.status) },
                      ]}
                    >
                      <Text style={styles.turbineStatusText}>
                        {turbine.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {assignment.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="note" size={20} color="#9C46CE" />
              <Text style={styles.sectionTitle}>Notas</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.notesText}>{assignment.notes}</Text>
            </View>
          </View>
        )}

        {/* System Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="info-outline" size={20} color="#9C46CE" />
            <Text style={styles.sectionTitle}>Información del Sistema</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Asignado por:</Text>
              <Text style={styles.infoValue}>{assignment.assignedBy}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de creación:</Text>
              <Text style={styles.infoValue}>
                {formatDateTime(assignment.createdAt)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Última actualización:</Text>
              <Text style={styles.infoValue}>
                {formatDateTime(assignment.updatedAt)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: "#9C46CE",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  assignmentId: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  assignmentTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#1f2937",
    lineHeight: 22,
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timelineItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 2,
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  durationInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  durationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 8,
  },
  pilotItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pilotImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  pilotImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pilotInfo: {
    flex: 1,
  },
  pilotName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  pilotEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  licenseInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  licenseText: {
    fontSize: 12,
    color: "#9C46CE",
    marginLeft: 4,
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  equipmentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  equipmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  equipmentDetail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  featureText: {
    fontSize: 11,
    color: "#16a34a",
    fontWeight: "500",
    marginLeft: 4,
  },
  turbinesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  turbineCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    minWidth: 100,
  },
  turbineName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 4,
    marginBottom: 6,
  },
  turbineStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  turbineStatusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 16,
  },
  notesText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
});
