import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { mockClients } from "../../../../src/mocks/clients";
import { mockProjects } from "../../../../src/mocks/projects";
import { Client } from "../../../../src/types/clients";
import { Project } from "../../../../src/types/projects";

type TabType = "general" | "projects" | "history";

// Project Card Component for the client details
const ProjectCard = React.memo(
  ({ project, onPress }: { project: Project; onPress: () => void }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "ACTIVE":
          return "#10b981";
        case "PAUSED":
          return "#f59e0b";
        case "COMPLETED":
          return "#6b7280";
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

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.projectHeader}>
          <View style={styles.projectInfo}>
            <Text style={styles.projectName} numberOfLines={2}>
              {project.name}
            </Text>
            <Text style={styles.projectDescription} numberOfLines={2}>
              {project.description}
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
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {new Date(project.startDate).toLocaleDateString("es-ES")} -{" "}
              {new Date(project.endDate).toLocaleDateString("es-ES")}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              <Text>{project.estimatedDuration} días estimados</Text>
            </Text>
          </View>
          {project.googleDriveFolderLink && (
            <TouchableOpacity
              style={styles.detailRow}
              onPress={() => {
                if (project.googleDriveFolderLink) {
                  Linking.openURL(project.googleDriveFolderLink).catch(() => {
                    Alert.alert(
                      "Error",
                      "No se pudo abrir el enlace de Google Drive"
                    );
                  });
                }
              }}
            >
              <Ionicons name="cloud-outline" size={16} color="#3b82f6" />
              <Text style={[styles.detailText, { color: "#3b82f6" }]}>
                Ver fotos en Google Drive
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

ProjectCard.displayName = "ProjectCard";

// Client Edit Modal Component
const ClientEditModal = React.memo(
  ({
    isVisible,
    onClose,
    client,
    onSave,
  }: {
    isVisible: boolean;
    onClose: () => void;
    client: Client;
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
                <Text>Editar Cliente</Text>
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

ClientEditModal.displayName = "ClientEditModal";

export default function ClientDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [showEditModal, setShowEditModal] = useState(false);
  const [client, setClient] = useState<Client | undefined>(() => {
    const clientId = Array.isArray(id) ? id[0] : id;
    return mockClients.find((c) => c.id === clientId);
  });

  const clientProjects = useMemo(() => {
    if (!client) return [];
    return mockProjects.filter((project) => project.clientId === client.id);
  }, [client]);

  if (!client) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Cliente no encontrado" }} />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={64}
            color="#ef4444"
          />
          <Text style={styles.errorTitle}>
            <Text>Cliente no encontrado</Text>
          </Text>
          <Text style={styles.errorDescription}>
            <Text>El cliente solicitado no existe o ha sido eliminado.</Text>
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>
              <Text>Volver</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleSaveClient = (clientData: Partial<Client>) => {
    setClient((prev) =>
      prev ? { ...prev, ...clientData, updatedAt: new Date() } : prev
    );
  };
  const handleProjectPress = (project: Project) => {
    router.push(`/admin/projects/project/${project.id}`);
  };

  const tabs = [
    { key: "general", label: "General", icon: "information-circle" },
    { key: "projects", label: "Proyectos", icon: "briefcase" },
    { key: "history", label: "Historial", icon: "time" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <ScrollView
            style={styles.tabContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Client Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="business" size={20} color="#9C46CE" />
                <Text style={styles.sectionTitle}>
                  <Text>Información del Cliente</Text>
                </Text>
              </View>
              <View style={styles.sectionContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    <Text>Nombre de la Empresa:</Text>
                  </Text>
                  <Text style={styles.infoValue}>{client.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    <Text>Contacto Principal:</Text>
                  </Text>
                  <Text style={styles.infoValue}>
                    {client.contactInfo.name}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    <Text>Email:</Text>
                  </Text>
                  <Text style={styles.infoValue}>
                    {client.contactInfo.email}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    <Text>Teléfono:</Text>
                  </Text>
                  <Text style={styles.infoValue}>
                    {client.contactInfo.phone}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    <Text>Cliente desde:</Text>
                  </Text>
                  <Text style={styles.infoValue}>
                    {new Date(client.createdAt).toLocaleDateString("es-ES")}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    <Text>Última actualización:</Text>
                  </Text>
                  <Text style={styles.infoValue}>
                    {new Date(client.updatedAt).toLocaleDateString("es-ES")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Statistics */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="analytics" size={20} color="#9C46CE" />
                <Text style={styles.sectionTitle}>
                  <Text>Estadísticas</Text>
                </Text>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="briefcase" size={24} color="#10b981" />
                  <Text style={styles.statNumber}>{clientProjects.length}</Text>
                  <Text style={styles.statLabel}>
                    <Text>Proyectos Totales</Text>
                  </Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="play" size={24} color="#3b82f6" />
                  <Text style={styles.statNumber}>
                    {clientProjects.filter((p) => p.status === "ACTIVE").length}
                  </Text>
                  <Text style={styles.statLabel}>
                    <Text>Proyectos Activos</Text>
                  </Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
                  <Text style={styles.statNumber}>
                    {
                      clientProjects.filter((p) => p.status === "COMPLETED")
                        .length
                    }
                  </Text>
                  <Text style={styles.statLabel}>
                    <Text>Proyectos Completados</Text>
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        );

      case "projects":
        return (
          <View style={styles.tabContent}>
            {clientProjects.length > 0 ? (
              <FlatList
                data={clientProjects}
                renderItem={({ item }) => (
                  <ProjectCard
                    project={item}
                    onPress={() => handleProjectPress(item)}
                  />
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.projectsList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyTitle}>
                  <Text>No hay proyectos</Text>
                </Text>
                <Text style={styles.emptyDescription}>
                  <Text>Este cliente aún no tiene proyectos asignados.</Text>
                </Text>
              </View>
            )}
          </View>
        );

      case "history":
        return (
          <ScrollView
            style={styles.tabContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time" size={20} color="#9C46CE" />
                <Text style={styles.sectionTitle}>
                  <Text>Historial de Actividad</Text>
                </Text>
              </View>
              <View style={styles.historyList}>
                <View style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="person-add" size={16} color="#10b981" />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyTitle}>
                      <Text>Cliente creado</Text>
                    </Text>
                    <Text style={styles.historyDescription}>
                      <Text>El cliente fue registrado en el sistema</Text>
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(client.createdAt).toLocaleDateString("es-ES")}
                    </Text>
                  </View>
                </View>

                {client.updatedAt.getTime() !== client.createdAt.getTime() && (
                  <View style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <Ionicons name="create" size={16} color="#3b82f6" />
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyTitle}>
                        <Text>Información actualizada</Text>
                      </Text>
                      <Text style={styles.historyDescription}>
                        <Text>Se actualizó la información del cliente</Text>
                      </Text>
                      <Text style={styles.historyDate}>
                        {new Date(client.updatedAt).toLocaleDateString("es-ES")}
                      </Text>
                    </View>
                  </View>
                )}

                {clientProjects.map((project) => (
                  <View key={project.id} style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <Ionicons name="briefcase" size={16} color="#8b5cf6" />
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyTitle}>
                        <Text>Proyecto asignado</Text>
                      </Text>
                      <Text style={styles.historyDescription}>
                        <Text>{project.name} fue asignado al cliente</Text>
                      </Text>
                      <Text style={styles.historyDate}>
                        {new Date(project.createdAt).toLocaleDateString(
                          "es-ES"
                        )}
                      </Text>
                    </View>
                  </View>
                ))}
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
          title: client.name,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowEditModal(true)}
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
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
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
                <Text>{tab.label}</Text>
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Edit Modal */}
      <ClientEditModal
        isVisible={showEditModal}
        onClose={() => setShowEditModal(false)}
        client={client}
        onSave={handleSaveClient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  editButton: {
    padding: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
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
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#f3f4f6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  sectionContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    flex: 2,
    textAlign: "right",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  projectsList: {
    gap: 12,
  },
  projectCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
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
  projectDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
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
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
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
});
