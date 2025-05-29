import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
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
  mockClients,
  mockProjectProgress,
  mockProjects,
  mockWindParks,
} from "../../../../src/mocks";
import { Project } from "../../../../src/types/projects";

// Memoized Search Bar Component
const SearchBar = React.memo(
  ({
    searchQuery,
    onSearchChange,
    onFilterPress,
    activeFiltersCount,
  }: {
    searchQuery: string;
    onSearchChange: (text: string) => void;
    onFilterPress: () => void;
    activeFiltersCount: number;
  }) => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar proyectos..."
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
        <Ionicons name="filter" size={20} color="#9C46CE" />
        {activeFiltersCount > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
);

SearchBar.displayName = "SearchBar";

// Memoized Project Card Component
const ProjectCard = React.memo(
  ({
    project,
    onPress,
    getClientName,
    getWindParkName,
    getProjectProgress,
    getStatusColor,
    getStatusText,
  }: {
    project: Project;
    onPress: () => void;
    getClientName: (clientId: string) => string;
    getWindParkName: (windParkId: string) => string;
    getProjectProgress: (projectId: string) => any;
    getStatusColor: (status: string) => string;
    getStatusText: (status: string) => string;
  }) => {
    const progress = getProjectProgress(project.id);
    const clientName = getClientName(project.clientId);
    const windParkName = getWindParkName(project.windParkId);

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.projectInfo}>
            <Text style={styles.projectName} numberOfLines={1}>
              {project.name}
            </Text>
            <Text style={styles.clientName} numberOfLines={1}>
              {clientName}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(project.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(project.status)}
            </Text>
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
              {new Date(project.startDate).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
              <Text> - </Text>
              {new Date(project.endDate).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Text>
          </View>

          {progress && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  <Text>Progreso</Text>
                </Text>
                <Text style={styles.progressPercentage}>
                  <Text>{progress.completionPercentage}%</Text>
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
                  <Text>
                    {progress.totalTurbines} turbinas •{" "}
                    {progress.turbinesInspected} inspeccionadas
                  </Text>
                </Text>
              </View>
            </View>
          )}
        </View>

        {project.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesText} numberOfLines={2}>
              <Text>{project.notes}</Text>
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

ProjectCard.displayName = "ProjectCard";

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
      presentationStyle="pageSheet"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              <Text>Filtros</Text>
            </Text>
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
              <Text style={styles.filterSectionTitle}>
                <Text>Estado del Proyecto</Text>
              </Text>
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
                      <Text>
                        {status === "All" ? "Todos" : getStatusText(status)}
                      </Text>
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
              <Text style={styles.filterSectionTitle}>
                <Text>Cliente</Text>
              </Text>
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
                    <Text>Todos los clientes</Text>
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
                      <Text>{client.name}</Text>
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
              <Text style={styles.clearButtonText}>
                <Text>Limpiar filtros</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>
                <Text>Aplicar</Text>
              </Text>
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
    router.push("/admin/projects/project/create");
  };
  const handleProjectPress = (project: Project) => {
    router.push(`/admin/projects/project/${project.id}`);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="folder-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>
        <Text>No se encontraron proyectos</Text>
      </Text>
      <Text style={styles.emptyDescription}>
        {searchQuery || activeFiltersCount() > 0 ? (
          <Text>
            No se encontraron proyectos que coincidan con los criterios de
            búsqueda
          </Text>
        ) : (
          <Text>
            Comienza creando tu primer proyecto para gestionar las inspecciones
          </Text>
        )}
      </Text>
    </View>
  );

  const renderProjectItem = ({ item }: { item: Project }) => (
    <ProjectCard
      project={item}
      onPress={() => handleProjectPress(item)}
      getClientName={getClientName}
      getWindParkName={getWindParkName}
      getProjectProgress={getProjectProgress}
      getStatusColor={getStatusColor}
      getStatusText={getStatusText}
    />
  );

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
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setIsFilterModalVisible(true)}
        activeFiltersCount={activeFiltersCount()}
      />
      {/* Active Filters Indicator */}
      {activeFiltersCount() > 0 && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>
            <Text>
              {activeFiltersCount()} filtro
              {activeFiltersCount() > 1 ? "s" : ""} activo
              {activeFiltersCount() > 1 ? "s" : ""}
            </Text>
          </Text>
          <TouchableOpacity onPress={clearAllFilters}>
            <Text style={styles.clearFiltersText}>
              <Text>Limpiar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Results Counter */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          <Text>
            {filteredProjects.length} proyecto
            {filteredProjects.length !== 1 ? "s" : ""} encontrado
            {filteredProjects.length !== 1 ? "s" : ""}
          </Text>
        </Text>
      </View>
      <FlatList
        data={filteredProjects}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredProjects.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
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
  },
  searchBar: {
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
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    ...(Platform.OS === "web" && { outlineWidth: 0 }),
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
    marginLeft: 12,
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
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
  },
  projectCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
    marginBottom: 12,
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
    paddingHorizontal: 32,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: Platform.OS === "web" ? "center" : "flex-end",
    alignItems: Platform.OS === "web" ? "center" : "stretch",
    paddingHorizontal: Platform.OS === "web" ? 20 : 0,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: Platform.OS === "web" ? 20 : 20,
    borderTopRightRadius: Platform.OS === "web" ? 20 : 20,
    borderBottomLeftRadius: Platform.OS === "web" ? 20 : 0,
    borderBottomRightRadius: Platform.OS === "web" ? 20 : 0,
    maxWidth: Platform.OS === "web" ? 600 : "100%",
    width: Platform.OS === "web" ? "100%" : "100%",
    maxHeight: Platform.OS === "web" ? "80%" : "100%",
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
  },
});
