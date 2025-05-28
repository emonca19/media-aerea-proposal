import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
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
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    background: "#f8fafc",
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

  const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
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
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: spacing.md,
          marginBottom: spacing.sm,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => {
          // Navigate to assignment details
          Alert.alert("Info", `Ver detalles de: ${project?.name}`);
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: spacing.sm,
          }}
        >
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text.primary,
                marginBottom: 4,
              }}
            >
              {project?.name || "Proyecto no encontrado"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  backgroundColor: assignmentStatus.color,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.surface,
                    fontWeight: "500",
                  }}
                >
                  {assignmentStatus.status}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={{ padding: 4 }}
            onPress={() => Alert.alert("Info", "Opciones de asignación")}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Dates */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: spacing.sm,
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={colors.text.secondary}
          />
          <Text
            style={{
              marginLeft: 6,
              fontSize: 14,
              color: colors.text.secondary,
            }}
          >
            {formatDate(assignment.estimatedStartDate)} -{" "}
            {formatDate(assignment.estimatedEndDate)}
          </Text>
          <Text
            style={{
              marginLeft: spacing.sm,
              fontSize: 14,
              color: colors.text.secondary,
            }}
          >
            ({assignment.estimatedDuration} días)
          </Text>
        </View>

        {/* Resources */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: spacing.sm,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="person-outline"
              size={16}
              color={colors.text.secondary}
            />
            <Text
              style={{
                marginLeft: 6,
                fontSize: 14,
                color: colors.text.secondary,
              }}
            >
              {pilots.length} piloto{pilots.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="airplane-outline"
              size={16}
              color={colors.text.secondary}
            />
            <Text
              style={{
                marginLeft: 6,
                fontSize: 14,
                color: colors.text.secondary,
              }}
            >
              {drones.length} drone{drones.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="business-outline"
              size={16}
              color={colors.text.secondary}
            />
            <Text
              style={{
                marginLeft: 6,
                fontSize: 14,
                color: colors.text.secondary,
              }}
            >
              {assignment.turbineIds.length} turbina
              {assignment.turbineIds.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Pilots */}
        {pilots.length > 0 && (
          <View style={{ marginBottom: spacing.xs }}>
            <Text
              style={{
                fontSize: 12,
                color: colors.text.secondary,
                marginBottom: 4,
              }}
            >
              Pilotos asignados:
            </Text>
            <Text style={{ fontSize: 14, color: colors.text.primary }}>
              {pilots.map((pilot) => pilot?.name).join(", ")}
            </Text>
          </View>
        )}

        {/* Notes */}
        {assignment.notes && (
          <View
            style={{
              marginTop: spacing.xs,
              paddingTop: spacing.xs,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.text.secondary,
                fontStyle: "italic",
              }}
            >
              {assignment.notes}
            </Text>
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
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text.primary,
            }}
          >
            Filtros y Ordenación
          </Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ padding: spacing.md }}>
          {/* Filter Type */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text.primary,
                marginBottom: spacing.sm,
              }}
            >
              Tipo de Asignación
            </Text>
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
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: spacing.sm,
                    }}
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
                      style={{
                        marginLeft: spacing.sm,
                        fontSize: 16,
                        color:
                          filters.filterType === type
                            ? colors.primary
                            : colors.text.primary,
                      }}
                    >
                      {labels[type]}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          {/* Sort By */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text.primary,
                marginBottom: spacing.sm,
              }}
            >
              Ordenar por
            </Text>
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
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: spacing.sm,
                  }}
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
                    style={{
                      marginLeft: spacing.sm,
                      fontSize: 16,
                      color:
                        filters.sortBy === sort
                          ? colors.primary
                          : colors.text.primary,
                    }}
                  >
                    {labels[sort]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sort Direction */}
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text.primary,
                marginBottom: spacing.sm,
              }}
            >
              Dirección
            </Text>
            {(["asc", "desc"] as const).map((direction) => {
              const labels = {
                asc: "Ascendente",
                desc: "Descendente",
              };

              return (
                <TouchableOpacity
                  key={direction}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: spacing.sm,
                  }}
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
                    style={{
                      marginLeft: spacing.sm,
                      fontSize: 16,
                      color:
                        filters.sortDirection === direction
                          ? colors.primary
                          : colors.text.primary,
                    }}
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "Asignaciones",
          headerBackTitle: "Atrás",
        }}
      />
      {/* Search and Filter Header */}
      <View
        style={{
          padding: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: spacing.sm,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.background,
              borderRadius: 8,
              paddingHorizontal: spacing.sm,
              marginRight: spacing.sm,
            }}
          >
            <Ionicons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={{
                flex: 1,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.sm,
                fontSize: 16,
                color: colors.text.primary,
              }}
              placeholder="Buscar asignaciones..."
              placeholderTextColor={colors.text.secondary}
              value={filters.search}
              onChangeText={(text) =>
                setFilters((prev) => ({ ...prev, search: text }))
              }
            />
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              padding: spacing.sm,
              borderRadius: 8,
            }}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 14, color: colors.text.secondary }}>
            {filteredAssignments.length} asignacion
            {filteredAssignments.length !== 1 ? "es" : ""}
          </Text>
          {filters.filterType !== "all" && (
            <TouchableOpacity
              onPress={() =>
                setFilters((prev) => ({ ...prev, filterType: "all" }))
              }
            >
              <Text style={{ fontSize: 14, color: colors.primary }}>
                Limpiar filtros
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Assignment List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {filteredAssignments.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: spacing.xl * 2,
            }}
          >
            <Ionicons
              name="document-outline"
              size={64}
              color={colors.text.secondary}
            />
            <Text
              style={{
                fontSize: 18,
                color: colors.text.secondary,
                marginTop: spacing.md,
                textAlign: "center",
              }}
            >
              {filters.search || filters.filterType !== "all"
                ? "No se encontraron asignaciones con los filtros aplicados"
                : "No hay asignaciones disponibles"}
            </Text>
          </View>
        ) : (
          filteredAssignments.map(renderAssignmentCard)
        )}
      </ScrollView>{" "}
      {/* Floating Action Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: spacing.lg,
          right: spacing.lg,
          backgroundColor: colors.primary,
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => router.push("/admin/tasks/assignment/create")}
      >
        <Ionicons name="add" size={28} color={colors.surface} />
      </TouchableOpacity>
      {renderFilters()}
    </View>
  );
}
