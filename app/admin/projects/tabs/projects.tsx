import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  mockClients,
  mockProjectProgress,
  mockProjects,
  mockWindParks,
} from "../../../../src/mocks";
import { Project } from "../../../../src/types/projects";

// Memoized Filter Modal Component to prevent unnecessary re-renders
const FilterModal = React.memo(
  ({
    isVisible,
    onClose,
    statusFilter,
    clientFilter,
    statusFilters,
    uniqueClients,
    onStatusFilterChange,
    onClientFilterChange,
    onClearAllFilters,
    getStatusText,
  }: {
    isVisible: boolean;
    onClose: () => void;
    statusFilter: string;
    clientFilter: string;
    statusFilters: string[];
    uniqueClients: any[];
    onStatusFilterChange: (status: string) => void;
    onClientFilterChange: (clientId: string) => void;
    onClearAllFilters: () => void;
    getStatusText: (status: string) => string;
  }) => (
    <Modal
      visible={isVisible}
      animationType="slide"
      //   transparent={true}
      presentationStyle="pageSheet"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Estado del Proyecto</Text>
              <View style={styles.filterOptionsGrid}>
                {statusFilters.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      statusFilter === status && styles.filterOptionActive,
                    ]}
                    onPress={() => onStatusFilterChange(status)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        statusFilter === status &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      {status === "All" ? "Todos" : getStatusText(status)}
                    </Text>
                    {statusFilter === status && (
                      <Ionicons name="checkmark" size={18} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Client Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Cliente</Text>
              <View style={styles.filterOptionsGrid}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    clientFilter === "All" && styles.filterOptionActive,
                  ]}
                  onPress={() => onClientFilterChange("All")}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      clientFilter === "All" && styles.filterOptionTextActive,
                    ]}
                  >
                    Todos los clientes
                  </Text>
                  {clientFilter === "All" && (
                    <Ionicons name="checkmark" size={18} color="#ffffff" />
                  )}
                </TouchableOpacity>
                {uniqueClients.map((client) => (
                  <TouchableOpacity
                    key={client.id}
                    style={[
                      styles.filterOption,
                      clientFilter === client.id && styles.filterOptionActive,
                    ]}
                    onPress={() => onClientFilterChange(client.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        clientFilter === client.id &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      {client.name}
                    </Text>
                    {clientFilter === client.id && (
                      <Ionicons name="checkmark" size={18} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={onClearAllFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Limpiar filtros</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
);

FilterModal.displayName = "FilterModal";

export default function ProjectsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [clientFilter, setClientFilter] = useState<string>("All");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Memoized calculations to prevent unnecessary re-calculations
  const uniqueClients = useMemo(
    () =>
      Array.from(new Set(mockProjects.map((project) => project.clientId))).map(
        (clientId) => mockClients.find((client) => client.id === clientId)!
      ),
    []
  );
  const statusFilters = useMemo(
    () => ["All", "ACTIVE", "PAUSED", "COMPLETED"],
    []
  );

  // Optimized callback functions to prevent modal re-renders
  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  const handleClientFilterChange = useCallback((clientId: string) => {
    setClientFilter(clientId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsFilterModalVisible(false);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setStatusFilter("All");
    setClientFilter("All");
  }, []);

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || project.status === statusFilter;
    const matchesClient =
      clientFilter === "All" || project.clientId === clientFilter;

    return matchesSearch && matchesStatus && matchesClient;
  });

  const activeFiltersCount = () => {
    let count = 0;
    if (statusFilter !== "All") count++;
    if (clientFilter !== "All") count++;
    return count;
  };
  const clearAllFilters = () => {
    setStatusFilter("All");
    setClientFilter("All");
  };

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
      case "ACTIVE":
        return "#22c55e"; // Green for active projects
      case "PAUSED":
        return "#f59e0b"; // Amber/orange for paused projects
      case "COMPLETED":
        return "#3b82f6"; // Blue for completed projects
      default:
        return "#6b7280";
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Activo";
      case "PAUSED":
        return "Pausado";
      case "COMPLETED":
        return "Completado";
      default:
        return status;
    }
  };
  const handleCreateProject = () => {
    router.push("/admin/projects/create");
  };
  const handleProjectPress = (project: Project) => {
    router.push({
      pathname: "/admin/projects/[projectId]",
      params: { id: project.id },
    });
  };

  const renderProjectItem = ({ item }: { item: Project }) => {
    const progress = getProjectProgress(item.id);
    const clientName = getClientName(item.clientId);
    const windParkName = getWindParkName(item.windParkId);

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => handleProjectPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.projectInfo}>
            <Text style={styles.projectName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.clientName} numberOfLines={1}>
              {clientName}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.projectDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="wind-turbine"
              size={16}
              color="#6b7280"
            />
            <Text style={styles.detailText}>{windParkName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {new Date(item.startDate).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
              <Text> - </Text>
              {new Date(item.endDate).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Text>
          </View>

          {progress && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progreso</Text>
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
                          ? "#22c55e"
                          : "#9C46CE",
                    },
                  ]}
                />
              </View>
              <View style={styles.turbineStats}>
                <Text style={styles.turbineStat}>
                  {progress.totalTurbines} turbinas •
                  {progress.turbinesInspected} inspeccionadas
                </Text>
              </View>
            </View>
          )}
        </View>

        {item.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesText} numberOfLines={2}>
              {item.notes}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Proyectos",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleCreateProject}
              style={styles.addButton}
            >
              <Ionicons name="add" size={24} color="#9C46CE" />
            </TouchableOpacity>
          ),
        }}
      />
      {/* Elegant Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar proyectos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#9C46CE" />
          {activeFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      {/* Active Filters Indicator */}
      {activeFiltersCount() > 0 && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>
            {activeFiltersCount()} filtro
            {activeFiltersCount() > 1 ? "s" : ""}
            <Text> </Text>
            activo{activeFiltersCount() > 1 ? "s" : ""}
          </Text>
          <TouchableOpacity onPress={clearAllFilters}>
            <Text style={styles.clearFiltersText}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Results Counter */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredProjects.length} proyecto
          {filteredProjects.length !== 1 ? "s" : ""} encontrado
          {filteredProjects.length !== 1 ? "s" : ""}
        </Text>
      </View>
      {/* Projects List */}
      <FlatList
        data={filteredProjects}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="folder-outline"
              size={64}
              color="#d1d5db"
            />
            <Text style={styles.emptyTitle}>No se encontraron proyectos</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery || activeFiltersCount() > 0
                ? "Intenta ajustar los filtros de búsqueda"
                : "Aún no hay proyectos creados"}
            </Text>
          </View>
        }
      />
      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={handleCloseModal}
        statusFilter={statusFilter}
        clientFilter={clientFilter}
        statusFilters={statusFilters}
        uniqueClients={uniqueClients}
        onStatusFilterChange={handleStatusFilterChange}
        onClientFilterChange={handleClientFilterChange}
        onClearAllFilters={handleClearAllFilters}
        getStatusText={getStatusText}
      />
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateProject}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 2,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: "#f9fafb",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fef3c7",
    borderBottomWidth: 1,
    borderBottomColor: "#fbbf24",
  },
  activeFiltersText: {
    fontSize: 14,
    color: "#92400e",
    fontWeight: "500",
  },
  clearFiltersText: {
    fontSize: 14,
    color: "#9C46CE",
    fontWeight: "600",
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
  resultsText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  projectCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
    marginRight: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  projectDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
  },
  progressSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9C46CE",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  turbineStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  turbineStat: {
    fontSize: 12,
    color: "#6b7280",
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  notesText: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  }, // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  filterOptionsGrid: {
    gap: 8,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  filterOptionActive: {
    backgroundColor: "#9C46CE",
    borderColor: "#9C46CE",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  filterOptionTextActive: {
    color: "#ffffff",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#9C46CE",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#9C46CE",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
