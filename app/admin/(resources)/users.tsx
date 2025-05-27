import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  // Button, // We'll replace the default Button for modals
  FlatList,
  Modal,
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
  const renderRoleSelector = (
    currentRole: UserRole | undefined, // Allow undefined for initial filter state
    onSelectRole: (role: UserRole) => void
  ) => {
    const roles: UserRole[] = ["PILOT", "ADMIN", "SUPER_ADMIN"];
    return (
      <View style={styles.roleContainer}>
        <Text style={styles.modalLabel}>Rol:</Text>
        {roles.map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.roleButton,
              currentRole === role && styles.roleButtonSelected,
            ]}
            onPress={() => onSelectRole(role)}
          >
            <Text
              style={[
                styles.roleButtonText,
                currentRole === role && styles.roleButtonTextSelected,
              ]}
            >
              {getRoleDisplayText(role)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.name} ({getRoleDisplayText(item.role)})
        </Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        {item.lastLogin && (
          <Text style={styles.userLastLogin}>
            Último acceso: {item.lastLogin.toLocaleDateString("es-ES")}
          </Text>
        )}
        <Text
          style={
            item.active ? styles.userStatusActive : styles.userStatusInactive
          }
        >
          {item.active ? "Activo" : "Inactivo"}
        </Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          onPress={() => handleEditUser(item)}
          style={styles.actionButton}
        >
          <Ionicons name="pencil" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeactivateUser(item.id)}
          style={styles.actionButton}
        >
          <Ionicons
            name={item.active ? "eye-off" : "eye"}
            size={24}
            color={item.active ? "#FF3B30" : "#34C759"}
          />
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
      <View style={styles.searchFilterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              No se encontraron usuarios.
            </Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={handleAddUser}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Editar Usuario" : "Crear Usuario"}
            </Text>
            <TextInput
              placeholder="Nombre completo"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {renderRoleSelector(selectedRole, setSelectedRole)}
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.modalButtonText, styles.modalButtonTextCancel]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSaveUser}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    styles.modalButtonTextPrimary,
                  ]}
                >
                  {isEditing ? "Guardar Cambios" : "Crear"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowFilterModal(false)}
        >
          <View
            style={styles.filterModalContainer}
            onStartShouldSetResponder={() => true} // Prevents modal closing when pressing inside
          >
            <Text style={styles.modalTitle}>Filtrar Usuarios</Text>
            <Text style={styles.modalLabel}>Estado:</Text>
            <View style={styles.filterOptionContainer}>
              {[
                { label: "Activo", value: true },
                { label: "Inactivo", value: false },
                { label: "Todos", value: undefined }, // Option to clear status filter
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.filterOptionButton,
                    activeFilter.active === item.value &&
                      styles.filterOptionButtonSelected,
                  ]}
                  onPress={() =>
                    setActiveFilter((prev) => ({
                      ...prev,
                      active: item.value,
                    }))
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      activeFilter.active === item.value &&
                        styles.filterOptionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {renderRoleSelector(activeFilter.role as UserRole, (role) =>
              setActiveFilter((prev) => ({ ...prev, role: role }))
            )}
            {/* Button to clear role filter */}
            <TouchableOpacity
              style={[styles.roleButton, styles.clearRoleButton]}
              onPress={() =>
                setActiveFilter((prev) => ({ ...prev, role: undefined }))
              }
              activeOpacity={0.7}
            >
              <Text style={styles.clearRoleButtonText}>Limpiar Rol</Text>
            </TouchableOpacity>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonClear]}
                onPress={clearFilters}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.modalButtonText, styles.modalButtonTextClear]}
                >
                  Limpiar Todo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={applyFiltersAndClose}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    styles.modalButtonTextPrimary,
                  ]}
                >
                  Aplicar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F2F2F2",
  },
  searchFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 48, // Increased height
    borderColor: "#ced4da", // Softer border color
    borderWidth: 1,
    borderRadius: 24, // More rounded
    paddingHorizontal: 20,
    marginRight: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#495057",
  },
  filterButton: {
    padding: 12,
    borderRadius: 24, // Match search input
    backgroundColor: "#9C46CE", // Light gray background
  },
  userItem: {
    backgroundColor: "#ffffff",
    padding: 16, // Increased padding
    marginVertical: 8,
    marginHorizontal: 2,
    borderRadius: 12, // Softer corners
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17, // Slightly larger
    fontWeight: "600",
    color: "#343a40", // Darker gray
  },
  userEmail: {
    fontSize: 14,
    color: "#6c757d", // Medium gray
    marginTop: 3,
  },
  userLastLogin: {
    fontSize: 12,
    color: "#6c757d", // Medium gray
    marginTop: 2,
    fontStyle: "italic",
  },
  userStatusActive: {
    fontSize: 13,
    color: "#28a745", // Bootstrap green
    marginTop: 5,
    fontWeight: "500",
  },
  userStatusInactive: {
    fontSize: 13,
    color: "#dc3545", // Bootstrap red
    marginTop: 5,
    fontWeight: "500",
  },
  userActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 12, // Increased spacing
  },
  fab: {
    position: "absolute",
    right: 25,
    bottom: 25,
    backgroundColor: "#9C46CE",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyListText: {
    fontSize: 17,
    color: "#6c757d",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)", // Darker overlay for more focus
    justifyContent: "center",
    alignItems: "center",
    padding: 20, // Ensure modal isn't touching screen edges
  },
  modalContainer: {
    // Shared by Edit and base for Filter
    width: "100%", // Take full width of overlay padding
    maxWidth: 400, // Max width for larger screens
    backgroundColor: "white",
    borderRadius: 16, // Larger radius
    padding: 24, // More padding
    // alignItems: "center", // Content will align itself
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, // Softer shadow
    shadowRadius: 8,
    elevation: 10,
  },
  filterModalContainer: {
    // Inherits from modalContainer, can add specifics if needed
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24, // More space below title
    color: "#343a40",
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#f8f9fa", // Light background for input
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 18, // More space between inputs
    fontSize: 16,
    color: "#495057",
  },
  roleContainer: {
    width: "100%",
    marginBottom: 12, // Reduced margin as clear button for role is added
  },
  modalLabel: {
    fontSize: 16,
    color: "#495057", // Subtler label color
    marginBottom: 10,
    fontWeight: "500",
  },
  roleButton: {
    backgroundColor: "#e9ecef", // Lighter gray
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ced4da", // Match input border
  },
  roleButtonSelected: {
    backgroundColor: "#9C46CE",
    borderColor: "#9C46CE",
  },
  roleButtonText: {
    textAlign: "center",
    color: "#495057",
    fontWeight: "500",
    fontSize: 15,
  },
  roleButtonTextSelected: {
    color: "white",
    fontWeight: "bold",
  },
  filterOptionContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Spreads items evenly
    width: "100%",
    marginBottom: 15,
  },
  filterOptionButton: {
    backgroundColor: "#e9ecef",
    paddingVertical: 10,
    paddingHorizontal: 12, // Adjusted padding
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ced4da",
    flex: 1, // Distribute space
    marginHorizontal: 4, // Small gap
    alignItems: "center", // Center text
  },
  filterOptionButtonSelected: {
    backgroundColor: "#9C46CE",
    borderColor: "#9C46CE",
  },
  filterOptionText: {
    textAlign: "center",
    color: "#495057",
    fontWeight: "500",
    fontSize: 14,
  },
  filterOptionTextSelected: {
    color: "white",
    fontWeight: "bold",
  },
  clearRoleButton: {
    backgroundColor: "transparent",
    borderColor: "#adb5bd",
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20, // Space before action buttons
    marginTop: 5,
  },
  clearRoleButtonText: {
    color: "#495057",
    fontSize: 14,
    fontWeight: "500",
  },

  // --- New Modal Button Styles ---
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end", // Aligns buttons to the right
    width: "100%",
    marginTop: 24, // Increased top margin for separation
  },
  modalButton: {
    // Base style for all modal buttons
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20, // Generous padding
    marginHorizontal: 6, // Space between buttons
    minWidth: 100, // Ensure decent tap target size
    alignItems: "center",
    justifyContent: "center",
    elevation: 1, // Subtle elevation for buttons
  },
  modalButtonText: {
    // Base text style for all modal buttons
    fontSize: 15, // Slightly smaller for better fit
    fontWeight: "600",
    textAlign: "center",
  },

  // Primary button (Save, Create, Apply)
  modalButtonPrimary: {
    backgroundColor: "#9C46CE", // Main app color
  },
  modalButtonTextPrimary: {
    color: "white",
  },

  // Cancel button (Edit/Create modal)
  modalButtonCancel: {
    backgroundColor: "#e9ecef", // Match Clear button's background
    borderColor: "#ced4da", // Match Clear button's border color
    borderWidth: 1, // Match Clear button's border width
  },
  modalButtonTextCancel: {
    color: "#495057", // Darker gray text
  },

  // Clear Filters button (Filter modal)
  modalButtonClear: {
    backgroundColor: "#e9ecef", // Light gray, distinct from cancel
    borderColor: "#ced4da",
    borderWidth: 1,
  },
  modalButtonTextClear: {
    color: "#495057", // Darker gray text
  },
});

export default UsersScreen;
