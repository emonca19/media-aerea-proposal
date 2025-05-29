import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  mockDroneAvailability,
  mockProjectAssignments,
} from "@/src/mocks/assignments";
import { mockPilotUsers } from "@/src/mocks/pilots";
import { mockProjects } from "@/src/mocks/projects";
import { ProjectAssignment } from "@/src/types/assignments";

// Filter types
type FilterType = "all" | "active" | "upcoming" | "urgent";
type SortType = "startDate" | "duration" | "pilotCount" | "turbineCount";

interface AssignmentListFilters {
  search: string;
  filterType: FilterType;
  sortBy: SortType;
  sortDirection: "asc" | "desc";
}

export default function AssignmentListScreen() {
  const router = useRouter();

  // Define colors based on theme
  const colors = {
    primary: "#9744C3",
    secondary: "#8b5cf6",
    background: "#ffffff",
    surface: "#ffffff",
    border: "#e2e8f0",
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    shadow: "#000000",
  };

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AssignmentListFilters>({
    search: "",
    filterType: "all",
    sortBy: "startDate",
    sortDirection: "asc",
  });

  // Get additional data for display
  const getProjectById = (id: string) => mockProjects.find((p) => p.id === id);
  const getPilotById = (id: string) => mockPilotUsers.find((p) => p.id === id);
  const getDroneById = (id: string) =>
    mockDroneAvailability.find((d) => d.droneId === id);

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    let filtered = [...mockProjectAssignments];
    const today = new Date();

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((assignment) => {
        const project = getProjectById(assignment.projectId);
        const pilots = assignment.pilotIds
          .map((id) => getPilotById(id)?.name || "")
          .join(" ");
        return (
          project?.name.toLowerCase().includes(searchLower) ||
          pilots.toLowerCase().includes(searchLower) ||
          assignment.notes?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply type filter
    if (filters.filterType !== "all") {
      filtered = filtered.filter((assignment) => {
        const startDate = new Date(assignment.estimatedStartDate);
        const endDate = new Date(assignment.estimatedEndDate);
        const daysUntilStart = Math.ceil(
          (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filters.filterType) {
          case "active":
            return startDate <= today && endDate >= today;
          case "upcoming":
            return startDate > today;
          case "urgent":
            return daysUntilStart <= 3 && daysUntilStart >= 0;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "startDate":
          comparison =
            new Date(a.estimatedStartDate).getTime() -
            new Date(b.estimatedStartDate).getTime();
          break;
        case "duration":
          comparison = a.estimatedDuration - b.estimatedDuration;
          break;
        case "pilotCount":
          comparison = a.pilotIds.length - b.pilotIds.length;
          break;
        case "turbineCount":
          comparison = a.turbineIds.length - b.turbineIds.length;
          break;
      }

      return filters.sortDirection === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [filters]);

  const getAssignmentStatus = (assignment: ProjectAssignment) => {
    const today = new Date();
    const startDate = new Date(assignment.estimatedStartDate);
    const endDate = new Date(assignment.estimatedEndDate);
    const daysUntilStart = Math.ceil(
      (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (startDate <= today && endDate >= today) {
      return { status: "Activo", color: colors.success };
    } else if (startDate > today) {
      if (daysUntilStart <= 3) {
        return { status: "Urgente", color: colors.error };
      }
      return { status: "Próximo", color: colors.warning };
    } else {
      return { status: "Completado", color: colors.text.secondary };
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderAssignmentCard = (assignment: ProjectAssignment) => {
    const project = getProjectById(assignment.projectId);
    const assignmentStatus = getAssignmentStatus(assignment);
    const pilots = assignment.pilotIds
      .map((id) => getPilotById(id))
      .filter(Boolean);
    const drones = assignment.droneIds
      .map((id) => getDroneById(id))
      .filter(Boolean);

    return (
      <TouchableOpacity
        key={assignment.id}
        style={styles.cardContainer}
        onPress={() => {
          router.push(`/admin/tasks/assignment/${assignment.id}`);
        }}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>
              {project?.name || "Proyecto no encontrado"}
            </Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: assignmentStatus.color },
                ]}
              >
                <Text style={styles.statusText}>{assignmentStatus.status}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() =>
              Alert.alert(
                "Opciones de Asignación",
                `Opciones para: ${project?.name || "Asignación"}`,
                [
                  {
                    text: "Ver Detalles",
                    onPress: () =>
                      router.push(`/admin/tasks/assignment/${assignment.id}`),
                  },
                  {
                    text: "Editar",
                    onPress: () =>
                      Alert.alert(
                        "Editar Asignación",
                        "La funcionalidad de edición estará disponible próximamente."
                      ),
                  },
                  {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () =>
                      Alert.alert(
                        "Eliminar Asignación",
                        "¿Está seguro que desea eliminar esta asignación?",
                        [
                          { text: "Cancelar", style: "cancel" },
                          { text: "Eliminar", style: "destructive" },
                        ]
                      ),
                  },
                  { text: "Cancelar", style: "cancel" },
                ]
              )
            }
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Dates */}
        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={colors.text.secondary}
          />
          <Text style={styles.dateText}>
            {formatDate(assignment.estimatedStartDate)} -
            {formatDate(assignment.estimatedEndDate)}
          </Text>
          <Text style={styles.durationText}>
            ({assignment.estimatedDuration} días)
          </Text>
        </View>

        <View style={styles.resourcesRow}>
          <View style={styles.resourceItem}>
            <Ionicons
              name="person-outline"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={styles.resourceText}>
              {pilots.length} piloto{pilots.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={styles.resourceItem}>
            <Ionicons
              name="airplane-outline"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={styles.resourceText}>
              {drones.length} drone{drones.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={styles.resourceItem}>
            <Ionicons
              name="business-outline"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={styles.resourceText}>
              {assignment.turbineIds.length} turbina
              {assignment.turbineIds.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Pilots */}
        {pilots.length > 0 && (
          <View style={styles.pilotsContainer}>
            <Text style={styles.pilotsLabel}>Pilotos asignados:</Text>
            <Text style={styles.pilotsText}>
              {pilots.map((pilot) => pilot?.name).join(", ")}
            </Text>
          </View>
        )}

        {/* Notes */}
        {assignment.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>{assignment.notes}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFilters = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filtros y Ordenación</Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Tipo de Asignación</Text>
            {(["all", "active", "upcoming", "urgent"] as FilterType[]).map(
              (type) => {
                const labels = {
                  all: "Todas",
                  active: "Activas",
                  upcoming: "Próximas",
                  urgent: "Urgentes",
                };

                return (
                  <TouchableOpacity
                    key={type}
                    style={styles.filterOption}
                    onPress={() =>
                      setFilters((prev) => ({ ...prev, filterType: type }))
                    }
                  >
                    <Ionicons
                      name={
                        filters.filterType === type
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={20}
                      color={
                        filters.filterType === type
                          ? colors.primary
                          : colors.text.secondary
                      }
                    />
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.filterType === type &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      {labels[type]}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          {/* Sort By */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Ordenar por</Text>
            {(
              [
                "startDate",
                "duration",
                "pilotCount",
                "turbineCount",
              ] as SortType[]
            ).map((sort) => {
              const labels = {
                startDate: "Fecha de inicio",
                duration: "Duración",
                pilotCount: "Cantidad de pilotos",
                turbineCount: "Cantidad de turbinas",
              };

              return (
                <TouchableOpacity
                  key={sort}
                  style={styles.filterOption}
                  onPress={() =>
                    setFilters((prev) => ({ ...prev, sortBy: sort }))
                  }
                >
                  <Ionicons
                    name={
                      filters.sortBy === sort
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={20}
                    color={
                      filters.sortBy === sort
                        ? colors.primary
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters.sortBy === sort && styles.filterOptionTextActive,
                    ]}
                  >
                    {labels[sort]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sort Direction */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Dirección</Text>
            {(["asc", "desc"] as const).map((direction) => {
              const labels = {
                asc: "Ascendente",
                desc: "Descendente",
              };

              return (
                <TouchableOpacity
                  key={direction}
                  style={styles.filterOption}
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      sortDirection: direction,
                    }))
                  }
                >
                  <Ionicons
                    name={
                      filters.sortDirection === direction
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={20}
                    color={
                      filters.sortDirection === direction
                        ? colors.primary
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters.sortDirection === direction &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {labels[direction]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Asignaciones",
          headerBackTitle: "Atrás",
        }}
      />
      {/* Search and Filter Header */}
      <View style={styles.headerContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar asignaciones..."
              placeholderTextColor={colors.text.secondary}
              value={filters.search}
              onChangeText={(text) =>
                setFilters((prev) => ({ ...prev, search: text }))
              }
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            {filteredAssignments.length} asignacion
            {filteredAssignments.length !== 1 ? "es" : ""}
          </Text>
          {filters.filterType !== "all" && (
            <TouchableOpacity
              onPress={() =>
                setFilters((prev) => ({ ...prev, filterType: "all" }))
              }
            >
              <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Assignment List */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredAssignments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-outline"
              size={64}
              color={colors.text.secondary}
            />
            <Text style={styles.emptyText}>
              {filters.search || filters.filterType !== "all"
                ? "No se encontraron asignaciones con los filtros aplicados"
                : "No hay asignaciones disponibles"}
            </Text>
          </View>
        ) : (
          filteredAssignments.map(renderAssignmentCard)
        )}
      </ScrollView>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/admin/tasks/assignment/create")}
      >
        <Ionicons name="add" size={28} color={colors.surface} />
      </TouchableOpacity>
      {renderFilters()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "web" ? 10 : 4,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    backgroundColor: "#9744C3",
    padding: 8,
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statsText: {
    fontSize: 14,
    color: "#64748b",
  },
  clearFiltersText: {
    fontSize: 14,
    color: "#9744C3",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: "#64748b",
    marginTop: 16,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#9744C3",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
  },
  optionsButton: {
    padding: 4,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#64748b",
  },
  durationText: {
    marginLeft: 16,
    fontSize: 14,
    color: "#64748b",
  },
  resourcesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  resourceText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#64748b",
  },
  pilotsContainer: {
    marginBottom: 4,
  },
  pilotsLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  pilotsText: {
    fontSize: 14,
    color: "#1e293b",
  },
  notesContainer: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  notesText: {
    fontSize: 14,
    color: "#64748b",
    fontStyle: "italic",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    // Responsive width constraints for web/tablet
    maxWidth: Platform.OS === "web" ? 600 : "100%",
    alignSelf: Platform.OS === "web" ? "center" : "stretch",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  modalContent: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  filterOptionText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#1e293b",
  },
  filterOptionTextActive: {
    marginLeft: 8,
    fontSize: 16,
    color: "#9744C3",
  },
});
