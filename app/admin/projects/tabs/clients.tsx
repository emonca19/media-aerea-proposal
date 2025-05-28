import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
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
  }: {
    searchQuery: string;
    onSearchChange: (text: string) => void;
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
    </View>
  )
);

SearchBar.displayName = "SearchBar";

// Memoized Client Card Component
const ClientCard = React.memo(
  ({ client, onPress }: { client: Client; onPress: () => void }) => {
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

export default function ClientsScreen() {
  const [clients] = useState<Client[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState("");

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

    return filtered;
  }, [clients, searchQuery]);

  const handleCreateClient = () => {
    // Navigate to create new client (can be implemented later)
    Alert.alert("Crear Cliente", "Funcionalidad en desarrollo");
  };
  const handleClientPress = (client: Client) => {
    // Navigate to client detail screen
    router.push(`/admin/projects/client/${client.id}`);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="business-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>
        <Text>No hay clientes</Text>
      </Text>
      <Text style={styles.emptyDescription}>
        {searchQuery ? (
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
    <ClientCard client={item} onPress={() => handleClientPress(item)} />
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
      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
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
