import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { mockUsers } from "../../../src/mocks/users";
import { UserRole } from "../../../src/types/common";
import { User } from "../../../src/types/users";

// Helper function to convert UserRole to display text
const getRoleDisplayText = (role: UserRole): string => {
  switch (role) {
    case "PILOT":
      return "Piloto";
    case "ADMIN":
      return "Administrador";
    case "SUPER_ADMIN":
      return "Superadministrador";
    default:
      return role;
  }
};

const UsersScreen = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("PILOT");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Partial<User>>({});
  const [activeUsersExpanded, setActiveUsersExpanded] = useState(true);
  const [inactiveUsersExpanded, setInactiveUsersExpanded] = useState(true);

  const filteredUsers = users.filter((user) => {
    const matchesSearchQuery =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getRoleDisplayText(user.role)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesFilter = Object.entries(activeFilter).every(([key, value]) => {
      if (key === "active") {
        return user.active === value;
      }
      if (key === "role") {
        return user.role === value;
      }
      return true;
    });

    return matchesSearchQuery && matchesFilter;
  });

  const handleAddUser = () => {
    setIsEditing(false);
    setCurrentUser({});
    setName("");
    setEmail("");
    setSelectedRole("PILOT");
    setModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setIsEditing(true);
    setCurrentUser(user);
    setName(user.name);
    setEmail(user.email);
    setSelectedRole(user.role);
    setModalVisible(true);
  };

  const handleDeactivateUser = (userId: string) => {
    Alert.alert(
      "Confirmar Desactivación",
      "¿Está seguro de que desea desactivar este usuario?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desactivar",
          onPress: () =>
            setUsers(
              users.map((user) =>
                user.id === userId ? { ...user, active: !user.active } : user
              )
            ),
          style: "destructive",
        },
      ]
    );
  };
  const handleSaveUser = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "Nombre y correo electrónico son obligatorios.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      // Corrected email validation regex
      Alert.alert("Error", "Correo electrónico inválido.");
      return;
    }

    if (isEditing && currentUser?.id) {
      setUsers(
        users.map((user) =>
          user.id === currentUser.id
            ? {
                ...user,
                name,
                email,
                role: selectedRole,
                updatedAt: new Date(),
              }
            : user
        )
      );
    } else {
      const newUser: User = {
        id: `user_${Date.now()}`, // Better ID generation
        name,
        email,
        role: selectedRole,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setUsers([...users, newUser]);
    }
    setModalVisible(false);
    setName("");
    setEmail("");
    setSelectedRole("PILOT");
  };

  const renderUserCard = (user: User) => (
    <View key={user.id} style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userTitle}>{user.name}</Text>
          <Text style={styles.userSubtitle}>{user.email}</Text>
        </View>
        <View
          style={[
            styles.roleBadge,
            user.role === "SUPER_ADMIN"
              ? styles.superAdminBadge
              : user.role === "ADMIN"
              ? styles.adminBadge
              : styles.pilotBadge,
          ]}
        >
          <Text
            style={[
              styles.roleBadgeText,
              user.role === "SUPER_ADMIN"
                ? styles.superAdminText
                : user.role === "ADMIN"
                ? styles.adminText
                : styles.pilotText,
            ]}
          >
            {getRoleDisplayText(user.role)}
          </Text>
        </View>
      </View>

      <View style={styles.userDetails}>
        {user.lastLogin && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Último acceso: {user.lastLogin.toLocaleDateString("es-ES")}
            </Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Ionicons
            name={
              user.active ? "checkmark-circle-outline" : "close-circle-outline"
            }
            size={16}
            color={user.active ? "#10B981" : "#EF4444"}
          />
          <Text
            style={[
              styles.detailText,
              { color: user.active ? "#10B981" : "#EF4444" },
            ]}
          >
            {user.active ? "Activo" : "Inactivo"}
          </Text>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          onPress={() => handleEditUser(user)}
          style={[styles.actionBtn, styles.editBtn]}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.actionBtnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeactivateUser(user.id)}
          style={[
            styles.actionBtn,
            user.active ? styles.deactivateBtn : styles.activateBtn,
          ]}
        >
          <Ionicons
            name={user.active ? "eye-off-outline" : "eye-outline"}
            size={16}
            color="#fff"
          />
          <Text style={styles.actionBtnText}>
            {user.active ? "Desactivar" : "Activar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const clearFilters = () => {
    setActiveFilter({});
    // setShowFilterModal(false); // Keep modal open to see cleared state, or close if preferred
  };

  const applyFiltersAndClose = () => {
    setShowFilterModal(false);
  };
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Usuarios" }} />
      {/* Search and Filter Section */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#6B7280"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Users Section */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setActiveUsersExpanded(!activeUsersExpanded)}
          >
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="people" size={24} color="#10B981" />
              <Text style={styles.sectionTitle}>Usuarios Activos</Text>
            </View>
            <View style={styles.sectionHeaderRight}>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {filteredUsers.filter((u) => u.active).length}
                </Text>
              </View>
              <Ionicons
                name={activeUsersExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#64748B"
                style={styles.chevronIcon}
              />
            </View>
          </TouchableOpacity>

          {activeUsersExpanded && (
            <View style={styles.cardsContainer}>
              {filteredUsers.filter((u) => u.active).length > 0 ? (
                filteredUsers
                  .filter((u) => u.active)
                  .map((user) => renderUserCard(user))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No hay usuarios activos</Text>
                </View>
              )}
            </View>
          )}
        </View>
        {/* Inactive Users Section */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setInactiveUsersExpanded(!inactiveUsersExpanded)}
          >
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="person-remove" size={24} color="#EF4444" />
              <Text style={styles.sectionTitle}>Usuarios Inactivos</Text>
            </View>
            <View style={styles.sectionHeaderRight}>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {filteredUsers.filter((u) => !u.active).length}
                </Text>
              </View>
              <Ionicons
                name={inactiveUsersExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#64748B"
                style={styles.chevronIcon}
              />
            </View>
          </TouchableOpacity>
          {inactiveUsersExpanded && (
            <View style={styles.cardsContainer}>
              {filteredUsers.filter((u) => !u.active).length > 0 ? (
                filteredUsers
                  .filter((u) => !u.active)
                  .map((user) => renderUserCard(user))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyText}>
                    No hay usuarios inactivos
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddUser}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView style={{ width: "100%" }}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isEditing ? "Editar Usuario" : "Crear Usuario"}
                </Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Nombre Completo*</Text>
              <TextInput
                placeholder="e.g. Juan Pérez"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />

              <Text style={styles.label}>Correo Electrónico*</Text>
              <TextInput
                placeholder="e.g. juan.perez@empresa.com"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Rol*</Text>
              <View style={styles.statusSelector}>
                {(["PILOT", "ADMIN", "SUPER_ADMIN"] as UserRole[]).map(
                  (role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.statusOption,
                        selectedRole === role && styles.statusOptionSelected,
                      ]}
                      onPress={() => setSelectedRole(role)}
                    >
                      <Text
                        style={
                          selectedRole === role
                            ? styles.statusOptionTextSelected
                            : styles.statusOptionText
                        }
                      >
                        {getRoleDisplayText(role)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveUser}
                >
                  <Text style={styles.modalButtonText}>
                    {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Filter Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView style={{ width: "100%" }}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtrar Usuarios</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowFilterModal(false)}
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Estado:</Text>
              <View style={styles.statusSelector}>
                {[
                  { label: "Activo", value: true },
                  { label: "Inactivo", value: false },
                  { label: "Todos", value: undefined },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.statusOption,
                      activeFilter.active === item.value &&
                        styles.statusOptionSelected,
                    ]}
                    onPress={() =>
                      setActiveFilter((prev) => ({
                        ...prev,
                        active: item.value,
                      }))
                    }
                  >
                    <Text
                      style={
                        activeFilter.active === item.value
                          ? styles.statusOptionTextSelected
                          : styles.statusOptionText
                      }
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Rol:</Text>
              <View style={styles.statusSelector}>
                {(["PILOT", "ADMIN", "SUPER_ADMIN"] as UserRole[]).map(
                  (role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.statusOption,
                        activeFilter.role === role &&
                          styles.statusOptionSelected,
                      ]}
                      onPress={() =>
                        setActiveFilter((prev) => ({ ...prev, role: role }))
                      }
                    >
                      <Text
                        style={
                          activeFilter.role === role
                            ? styles.statusOptionTextSelected
                            : styles.statusOptionText
                        }
                      >
                        {getRoleDisplayText(role)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <TouchableOpacity
                style={styles.clearRoleButton}
                onPress={() =>
                  setActiveFilter((prev) => ({ ...prev, role: undefined }))
                }
              >
                <Text style={styles.clearRoleButtonText}>Limpiar Rol</Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={clearFilters}
                >
                  <Text style={styles.modalButtonText}>Limpiar Todo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={applyFiltersAndClose}
                >
                  <Text style={styles.modalButtonText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  searchFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    padding: 0,
  },
  filterButton: {
    backgroundColor: "#9C46CE",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#9C46CE",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#9C46CE",
    right: 20,
    bottom: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9C46CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chevronIcon: {
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginLeft: 12,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  countText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748B",
  },
  cardsContainer: {
    gap: 12,
  },
  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  userSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  superAdminBadge: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  adminBadge: {
    backgroundColor: "#DBEAFE",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  pilotBadge: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  superAdminText: {
    color: "#DC2626",
  },
  adminText: {
    color: "#2563EB",
  },
  pilotText: {
    color: "#059669",
  },
  userDetails: {
    marginBottom: 14,
    paddingVertical: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    paddingVertical: 1,
  },
  detailText: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 8,
    fontWeight: "500",
  },
  userActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  editBtn: {
    backgroundColor: "#3B82F6",
  },
  deactivateBtn: {
    backgroundColor: "#EF4444",
  },
  activateBtn: {
    backgroundColor: "#10B981",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    marginVertical: 4,
  },
  emptyText: {
    fontSize: 17,
    color: "#9CA3AF",
    marginTop: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  // Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    width: "90%",
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#374151",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  statusSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    marginTop: 5,
  },
  statusOption: {
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#3498db",
    flex: 1,
    marginHorizontal: 2,
    alignItems: "center",
  },
  statusOptionSelected: {
    backgroundColor: "#3498db",
  },
  statusOptionText: {
    color: "#3498db",
    fontSize: 11,
    fontWeight: "500",
  },
  statusOptionTextSelected: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
  },
  clearRoleButton: {
    backgroundColor: "transparent",
    borderColor: "#adb5bd",
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 5,
  },
  clearRoleButtonText: {
    color: "#495057",
    fontSize: 14,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 25,
    borderTopColor: "#eee",
    borderTopWidth: 1,
    paddingTop: 15,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  cancelButton: {
    backgroundColor: "#6B7280",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
  },
  modalButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});

export default UsersScreen;
