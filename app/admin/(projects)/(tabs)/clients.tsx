import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { mockClients } from "../../../../src/mocks/clients";
import { Client } from "../../../../src/types/clients";

// Memoized Search Bar Component
const SearchBar = React.memo(
  ({
    searchQuery,
    onSearchChange,
    onFilterPress,
    hasActiveFilters,
  }: {
    searchQuery: string;
    onSearchChange: (text: string) => void;
    onFilterPress: () => void;
    hasActiveFilters: boolean;
  }) => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar clientes..."
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
      <TouchableOpacity
        style={[
          styles.filterButton,
          hasActiveFilters && styles.filterButtonActive,
        ]}
        onPress={onFilterPress}
      >
        <Ionicons
          name="filter"
          size={20}
          color={hasActiveFilters ? "#ffffff" : "#6b7280"}
        />
        {hasActiveFilters && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>!</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
);

SearchBar.displayName = "SearchBar";

// Memoized Client Card Component
const ClientCard = React.memo(
  ({
    client,
    onPress,
    onEdit,
    onDelete,
  }: {
    client: Client;
    onPress: () => void;
    onEdit: () => void;
    onDelete: () => void;
  }) => {
    const totalProjects = client.projects.length;

    return (
      <TouchableOpacity
        style={styles.clientCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName} numberOfLines={1}>
              {client.name}
            </Text>
            <Text style={styles.contactName} numberOfLines={1}>
              {client.contactInfo.name}
            </Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Ionicons name="create" size={18} color="#9C46CE" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Ionicons name="trash" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.clientDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText} numberOfLines={1}>
              {client.contactInfo.email}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{client.contactInfo.phone}</Text>
          </View>
        </View>
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Ionicons name="briefcase-outline" size={16} color="#10b981" />
            <Text style={styles.statText}>
              {totalProjects} proyecto{totalProjects !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

ClientCard.displayName = "ClientCard";

// Memoized Filter Modal Component
const FilterModal = React.memo(
  ({
    isVisible,
    onClose,
    statusFilter,
    onStatusFilterChange,
    onClearAllFilters,
  }: {
    isVisible: boolean;
    onClose: () => void;
    statusFilter: string;
    onStatusFilterChange: (status: string) => void;
    onClearAllFilters: () => void;
  }) => (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              <Text>Filtrar Clientes</Text>
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>
                <Text>Estado de Clientes</Text>
              </Text>
              <View style={styles.filterOptionsGrid}>
                {["all"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      statusFilter === status && styles.filterOptionActive,
                    ]}
                    onPress={() => onStatusFilterChange(status)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        statusFilter === status &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      {status === "all" && <Text>Todos los clientes</Text>}
                    </Text>
                    {statusFilter === status && (
                      <Ionicons name="checkmark" size={20} color="#ffffff" />
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
            >
              <Text style={styles.clearButtonText}>
                <Text>Limpiar</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
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

// Client Form Modal Component
const ClientFormModal = React.memo(
  ({
    isVisible,
    onClose,
    client,
    onSave,
  }: {
    isVisible: boolean;
    onClose: () => void;
    client?: Client;
    onSave: (clientData: Partial<Client>) => void;
  }) => {
    const [formData, setFormData] = useState({
      name: client?.name || "",
      contactName: client?.contactInfo.name || "",
      contactEmail: client?.contactInfo.email || "",
      contactPhone: client?.contactInfo.phone || "",
    });

    const handleSave = () => {
      if (!formData.name || !formData.contactName || !formData.contactEmail) {
        Alert.alert(
          "Error",
          "Por favor completa todos los campos obligatorios"
        );
        return;
      }

      onSave({
        name: formData.name,
        contactInfo: {
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone,
        },
      });
      onClose();
    };

    return (
      <Modal visible={isVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {client ? (
                  <Text>Editar Cliente</Text>
                ) : (
                  <Text>Nuevo Cliente</Text>
                )}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>
                  <Text>Nombre de la Empresa *</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  placeholder="Ingresa el nombre de la empresa"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>
                  <Text>Nombre del Contacto *</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.contactName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, contactName: text })
                  }
                  placeholder="Nombre de la persona de contacto"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>
                  <Text>Email *</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.contactEmail}
                  onChangeText={(text) =>
                    setFormData({ ...formData, contactEmail: text })
                  }
                  placeholder="correo@empresa.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>
                  <Text>Teléfono</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.contactPhone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, contactPhone: text })
                  }
                  placeholder="+34-xxx-xxx-xxx"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={onClose}>
                <Text style={styles.clearButtonText}>
                  <Text>Cancelar</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleSave}>
                <Text style={styles.applyButtonText}>
                  <Text>Guardar</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
);

ClientFormModal.displayName = "ClientFormModal";

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  // Filter and search logic
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.contactInfo.name.toLowerCase().includes(query) ||
          client.contactInfo.email.toLowerCase().includes(query)
      );
    }

    // Status filter is simplified since we removed contracts
    // Keep this section simple for future extension
    if (statusFilter !== "all") {
      // For now, just return all clients since we don't have contract filtering
      // This can be extended in the future for other status types
    }

    return filtered;
  }, [clients, searchQuery, statusFilter]);

  const hasActiveFilters = statusFilter !== "all";

  const handleCreateClient = () => {
    setEditingClient(undefined);
    setShowClientModal(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowClientModal(true);
  };

  const handleDeleteClient = (client: Client) => {
    Alert.alert(
      "Eliminar Cliente",
      `¿Estás seguro de que deseas eliminar a ${client.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setClients(clients.filter((c) => c.id !== client.id));
          },
        },
      ]
    );
  };

  const handleSaveClient = (clientData: Partial<Client>) => {
    if (editingClient) {
      // Update existing client
      setClients(
        clients.map((c) =>
          c.id === editingClient.id
            ? { ...c, ...clientData, updatedAt: new Date() }
            : c
        )
      );
    } else {
      // Create new client
      const newClient: Client = {
        id: `client_${Date.now()}`,
        ...(clientData as Omit<
          Client,
          "id" | "createdAt" | "updatedAt" | "projects"
        >),
        projects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setClients([...clients, newClient]);
    }
  };

  const handleClientPress = (client: Client) => {
    // Navigate to client detail screen (not implemented yet)
    Alert.alert("Detalle del Cliente", `Mostrar detalles de ${client.name}`);
  };
  const handleClearAllFilters = () => {
    setStatusFilter("all");
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="business-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>
        <Text>No hay clientes</Text>
      </Text>
      <Text style={styles.emptyDescription}>
        {searchQuery || hasActiveFilters ? (
          <Text>
            No se encontraron clientes que coincidan con los criterios de
            búsqueda
          </Text>
        ) : (
          <Text>
            Comienza agregando tu primer cliente para gestionar sus proyectos
          </Text>
        )}
      </Text>
    </View>
  );
  const renderClient = ({ item }: { item: Client }) => (
    <ClientCard
      client={item}
      onPress={() => handleClientPress(item)}
      onEdit={() => handleEditClient(item)}
      onDelete={() => handleDeleteClient(item)}
    />
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Clientes",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleCreateClient}
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
        onFilterPress={() => setShowFilterModal(true)}
        hasActiveFilters={hasActiveFilters}
      />

      {hasActiveFilters && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>
            <Text>Filtros activos</Text>
          </Text>
          <TouchableOpacity onPress={handleClearAllFilters}>
            <Text style={styles.clearFiltersText}>
              <Text>Limpiar todo</Text>
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredClients}
        renderItem={renderClient}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredClients.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      <FilterModal
        isVisible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClearAllFilters={handleClearAllFilters}
      />

      <ClientFormModal
        isVisible={showClientModal}
        onClose={() => setShowClientModal(false)}
        client={editingClient}
        onSave={handleSaveClient}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateClient}
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
    backgroundColor: "#f9fafb",
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
  filterButtonActive: {
    backgroundColor: "#9C46CE",
    borderColor: "#9C46CE",
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
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
  },
  clientCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
    marginRight: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  contactName: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  clientDetails: {
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
  statsSection: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
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
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
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
    maxHeight: 400,
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
  // Form Styles
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    color: "#111827",
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
