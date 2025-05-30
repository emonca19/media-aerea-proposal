import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { showAlert } from "../../../src/components/CrossPlatformAlert";

// Enhanced interfaces for Drive functionality
interface DriveSubmission {
  id: string;
  driveLink: string;
  submitDateTime: Date;
  status: "active" | "completed";
  totalTurbines: number;
  completedTurbines: number;
  adminNotified: boolean;
}

interface Turbine {
  id: string;
  name: string;
  status: "IN_PROGRESS" | "COMPLETED" | "PENDING";
  lastInspection: string;
  isCompleted: boolean;
}

interface ProjectData {
  id: string;
  name: string;
  client: string;
  description: string;
  location: string;
  totalTurbines: number;
  completedTurbines: number;
  progress: number;
  startDate: string;
  endDate: string;
  contractId: string;
  adminResponsible: string;
  adminEmail: string;
  driveSubmission?: DriveSubmission;
  turbines: Turbine[];
}

// Enhanced project data with turbines for completion tracking
const mockProject: ProjectData = {
  id: "proj-001",
  name: "Parque Eólico Sierra Norte",
  client: "Energía Renovable SA",
  description:
    "Inspección integral de aerogeneradores con tecnología de drones avanzada",
  location: "Sierra Norte, Estado de México",
  totalTurbines: 7,
  completedTurbines: 2,
  progress: 29,
  startDate: "2023-05-10",
  endDate: "2023-06-20",
  contractId: "CON-2023-045",
  adminResponsible: "Ing. Carlos Mendez",
  adminEmail: "carlos.mendez@energiarenovable.com",
  driveSubmission: {
    id: "drive-001",
    driveLink:
      "https://drive.google.com/drive/folders/1AuDoYFND_4BEQV8VSOXaKWeUThT7IvWG?usp=sharing",
    submitDateTime: new Date("2024-01-14"),
    status: "active",
    totalTurbines: 7,
    completedTurbines: 2,
    adminNotified: true,
  },
  turbines: [
    {
      id: "1",
      name: "T-001",
      status: "COMPLETED",
      lastInspection: "2023-05-15",
      isCompleted: true,
    },
    {
      id: "2",
      name: "T-002",
      status: "COMPLETED",
      lastInspection: "2023-05-16",
      isCompleted: true,
    },
    {
      id: "3",
      name: "T-003",
      status: "IN_PROGRESS",
      lastInspection: "2023-04-28",
      isCompleted: false,
    },
    {
      id: "4",
      name: "T-004",
      status: "PENDING",
      lastInspection: "2023-04-20",
      isCompleted: false,
    },
    {
      id: "5",
      name: "T-005",
      status: "PENDING",
      lastInspection: "2023-04-18",
      isCompleted: false,
    },
    {
      id: "6",
      name: "T-006",
      status: "PENDING",
      lastInspection: "2023-04-15",
      isCompleted: false,
    },
    {
      id: "7",
      name: "T-007",
      status: "PENDING",
      lastInspection: "2023-04-12",
      isCompleted: false,
    },
  ],
};

const projectMembers = [
  {
    id: 1,
    name: "Juan Rodríguez",
    role: "Piloto Líder",
    avatar: require("../../../assets/images/pilot-avatar.jpg"),
  },
  {
    id: 2,
    name: "Ana Torres",
    role: "Técnica de Mantenimiento",
    avatar: require("../../../assets/images/girl.jpg"),
  },
  {
    id: 3,
    name: "Luis García",
    role: "Supervisor de Campo",
    avatar: require("../../../assets/images/boy.jpg"),
  },
];

const ProjectInfoMenuEnhanced = () => {
  const router = useRouter();
  const [projectData, setProjectData] = useState<ProjectData>(mockProject);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showTurbinesModal, setShowTurbinesModal] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  // Se eliminaron las funciones relacionadas con la subida de fotos

  const handleDriveInfo = () => {
    setShowDriveModal(true);
  };
  const handleTurbineToggle = (turbineId: string) => {
    setProjectData((prev) => {
      const updatedTurbines = prev.turbines.map((turbine) => {
        if (turbine.id === turbineId) {
          const newIsCompleted = !turbine.isCompleted;
          return {
            ...turbine,
            isCompleted: newIsCompleted,
            status: newIsCompleted
              ? ("COMPLETED" as const)
              : ("PENDING" as const),
          };
        }
        return turbine;
      });

      const completedCount = updatedTurbines.filter(
        (t) => t.isCompleted
      ).length;
      const progress = Math.round((completedCount / prev.totalTurbines) * 100);

      return {
        ...prev,
        turbines: updatedTurbines,
        completedTurbines: completedCount,
        progress: progress,
        driveSubmission: prev.driveSubmission
          ? {
              ...prev.driveSubmission,
              completedTurbines: completedCount,
            }
          : undefined,
      };
    });

    // Removed Alert.alert confirmation
  };
  const submitTurbineProgress = () => {
    setShowTurbinesModal(false);
    // Removed Alert.alert confirmation
  };

  const handleConfirmPhotoUpload = () => {
    showAlert(
      "Confirmar Subida de Fotos",
      "¿Estás seguro de que quieres confirmar la subida de fotos del proyecto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => console.log("Confirmación cancelada"),
        },
        {
          text: "Confirmar",
          style: "default",
          onPress: () => {
            console.log("Subida de fotos confirmada");
            setShowDriveModal(false);
          },
        },
      ]
    );
  };

  const renderDriveInfoModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showDriveModal}
      onRequestClose={() => setShowDriveModal(false)}
      statusBarTranslucent={false}
    >
      <View style={modalStyles.fullScreenContainer}>
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContent}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={modalStyles.scrollContentContainer}
              style={modalStyles.scrollView}
              bounces={true}
            >
              {/* Modal Header */}
              <View style={modalStyles.modalHeader}>
                {/* Close button */}
                <TouchableOpacity
                  style={modalStyles.closeButton}
                  onPress={() => setShowDriveModal(false)}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>

                <View style={modalStyles.modalIconContainer}>
                  <LinearGradient
                    colors={["#10b981", "#059669"]}
                    style={modalStyles.modalIconGradient}
                  >
                    <Ionicons name="cloud-outline" size={28} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={modalStyles.modalTitle}>
                  Subida de Fotos del Proyecto
                </Text>
                <Text style={modalStyles.modalSubtitle}>
                  Carpeta de almacenamiento.
                </Text>
              </View>

              {/* Drive Info Display */}
              <View style={modalStyles.driveInfoContainer}>
                <View style={modalStyles.driveInfoSection}>
                  <View style={modalStyles.driveInfoRow}>
                    <View style={modalStyles.driveInfoIconContainer}>
                      <Ionicons name="link" size={18} color="#10b981" />
                    </View>
                    <View style={modalStyles.driveInfoTextContainer}>
                      <Text style={modalStyles.driveInfoLabel}>
                        Enlace configurado
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const link = projectData.driveSubmission?.driveLink;
                          if (link) {
                            Linking.openURL(link);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            modalStyles.driveInfoLink,
                            {
                              textDecorationLine: "underline",
                              color: "#3b82f6",
                            },
                          ]}
                          numberOfLines={3}
                        >
                          {projectData.driveSubmission?.driveLink ||
                            "No configurado"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={modalStyles.driveInfoDivider} />

                <View style={modalStyles.driveInfoSection}>
                  <View style={modalStyles.driveInfoRow}>
                    <View style={modalStyles.driveInfoIconContainer}>
                      <Ionicons name="calendar" size={18} color="#10b981" />
                    </View>
                    <View style={modalStyles.driveInfoTextContainer}>
                      <Text style={modalStyles.driveInfoLabel}>
                        Fecha de configuración
                      </Text>
                      <Text style={modalStyles.driveInfoValue}>
                        {projectData.driveSubmission?.submitDateTime.toLocaleDateString(
                          "es-ES",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        ) || "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={modalStyles.driveInfoDivider} />

                <View style={modalStyles.driveInfoSection}>
                  <View style={modalStyles.driveInfoRow}>
                    <View style={modalStyles.driveInfoIconContainer}>
                      <Ionicons name="person" size={18} color="#10b981" />
                    </View>
                    <View style={modalStyles.driveInfoTextContainer}>
                      <Text style={modalStyles.driveInfoLabel}>
                        Administrador responsable
                      </Text>
                      <Text style={modalStyles.driveInfoValue}>
                        {projectData.adminResponsible}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Turbines Status Section */}
              <View style={modalStyles.turbinesStatusContainer}>
                <View style={modalStyles.turbinesStatusHeader}>
                  <View style={modalStyles.turbinesStatusIconContainer}>
                    <Ionicons
                      name="nuclear-outline"
                      size={20}
                      color="#3b82f6"
                    />
                  </View>
                  <Text style={modalStyles.turbinesStatusTitle}>
                    Estado de las Turbinas
                  </Text>
                </View>

                <View style={modalStyles.turbinesProgressCard}>
                  <View style={modalStyles.turbinesProgressHeader}>
                    <Text style={modalStyles.turbinesProgressText}>
                      {projectData.completedTurbines} de{" "}
                      {projectData.totalTurbines} completadas
                    </Text>
                    <View style={modalStyles.turbinesProgressBadge}>
                      <LinearGradient
                        colors={["#10b981", "#059669"]}
                        style={modalStyles.turbinesProgressBadgeGradient}
                      >
                        <Text style={modalStyles.turbinesProgressBadgeText}>
                          {Math.round(
                            (projectData.completedTurbines /
                              projectData.totalTurbines) *
                              100
                          )}
                          %
                        </Text>
                      </LinearGradient>
                    </View>
                  </View>

                  <View style={modalStyles.turbinesProgressBarContainer}>
                    <View style={modalStyles.turbinesProgressBar}>
                      <LinearGradient
                        colors={["#10b981", "#059669"]}
                        style={[
                          modalStyles.turbinesProgressBarFill,
                          {
                            width: `${
                              (projectData.completedTurbines /
                                projectData.totalTurbines) *
                              100
                            }%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                <View style={modalStyles.turbinesListContainer}>
                  <View style={modalStyles.turbinesListHeader}>
                    <View style={modalStyles.turbinesStatusItem}>
                      <View
                        style={[
                          modalStyles.turbinesStatusDot,
                          { backgroundColor: "#10b981" },
                        ]}
                      />
                      <Text style={modalStyles.turbinesStatusLabel}>
                        Completadas (
                        {
                          projectData.turbines.filter((t) => t.isCompleted)
                            .length
                        }
                        )
                      </Text>
                    </View>
                    <View style={modalStyles.turbinesStatusItem}>
                      <View
                        style={[
                          modalStyles.turbinesStatusDot,
                          { backgroundColor: "#f59e0b" },
                        ]}
                      />
                      <Text style={modalStyles.turbinesStatusLabel}>
                        Pendientes (
                        {
                          projectData.turbines.filter((t) => !t.isCompleted)
                            .length
                        }
                        )
                      </Text>
                    </View>
                  </View>

                  <View style={modalStyles.turbinesGrid}>
                    {projectData.turbines.map((turbine) => (
                      <TouchableOpacity
                        key={turbine.id}
                        style={[
                          modalStyles.turbineGridItem,
                          turbine.isCompleted &&
                            modalStyles.turbineGridItemCompleted,
                        ]}
                        onPress={() => {
                          setShowDriveModal(false);
                          router.push({
                            pathname: "/pilot/turbines-status",
                            params: {
                              selectedTurbineId: turbine.id,
                              fromModal: "true",
                            },
                          });
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={modalStyles.turbineGridIconContainer}>
                          {turbine.isCompleted ? (
                            <LinearGradient
                              colors={["#10b981", "#059669"]}
                              style={modalStyles.turbineIconGradientCompleted}
                            >
                              <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color="#ffffff"
                              />
                            </LinearGradient>
                          ) : (
                            <Ionicons
                              name="ellipse-outline"
                              size={14}
                              color="#d1d5db"
                            />
                          )}
                        </View>
                        <Text
                          style={[
                            modalStyles.turbineGridName,
                            turbine.isCompleted &&
                              modalStyles.turbineGridNameCompleted,
                          ]}
                        >
                          {turbine.name}{" "}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Confirmation Button */}
              <View style={modalStyles.actionButtons}>
                <TouchableOpacity
                  style={[modalStyles.submitButton, { marginHorizontal: 16 }]}
                  onPress={handleConfirmPhotoUpload}
                >
                  <LinearGradient
                    colors={["#10b981", "#059669"]}
                    style={[
                      modalStyles.submitButtonGradient,
                      {
                        flexDirection: "row",
                        gap: 8,
                        paddingVertical: 16,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                    <Text
                      style={[modalStyles.submitButtonText, { fontSize: 16 }]}
                    >
                      Confirmar Subida de Fotos
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderTurbinesModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showTurbinesModal}
      onRequestClose={() => setShowTurbinesModal(false)}
    >
      <View style={modalStyles.modalOverlay}>
        <TouchableOpacity
          style={modalStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTurbinesModal(false)}
        >
          <View style={[modalStyles.modalContent, { maxHeight: "80%" }]}>
            {/* Modal Header */}
            <View style={modalStyles.modalHeader}>
              <View style={modalStyles.modalIconContainer}>
                <LinearGradient
                  colors={["#3b82f6", "#1d4ed8"]}
                  style={modalStyles.modalIconGradient}
                >
                  <Ionicons name="nuclear-outline" size={24} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={modalStyles.modalTitle}>
                Marcar Turbinas Completadas
              </Text>
              <Text style={modalStyles.modalSubtitle}>
                Selecciona las turbinas que has completado para actualizar el
                progreso del proyecto.
              </Text>
            </View>
            <FlatList
              data={projectData.turbines}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1, marginBottom: 20 }}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: 10,
              }}
              bounces={true}
              alwaysBounceVertical={true}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    modalStyles.turbineItem,
                    item.isCompleted && modalStyles.turbineItemCompleted,
                  ]}
                  onPress={() => handleTurbineToggle(item.id)}
                  activeOpacity={0.8}
                >
                  {item.isCompleted && (
                    <View style={modalStyles.turbineItemShimmer} />
                  )}

                  <View style={modalStyles.turbineItemContent}>
                    <View style={modalStyles.turbineIconSection}>
                      {item.isCompleted ? (
                        <LinearGradient
                          colors={["#10b981", "#059669"]}
                          style={modalStyles.turbineCompletedIcon}
                        >
                          <Ionicons
                            name="nuclear-outline"
                            size={18}
                            color="#ffffff"
                          />
                        </LinearGradient>
                      ) : (
                        <View style={modalStyles.turbinePendingIcon}>
                          <Ionicons
                            name="nuclear-outline"
                            size={18}
                            color="#9ca3af"
                          />
                        </View>
                      )}
                    </View>

                    <View style={modalStyles.turbineInfo}>
                      <Text
                        style={[
                          modalStyles.turbineName,
                          item.isCompleted && modalStyles.turbineNameCompleted,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          modalStyles.turbineDate,
                          item.isCompleted && modalStyles.turbineDateCompleted,
                        ]}
                      >
                        Última inspección: {formatDate(item.lastInspection)}
                      </Text>

                      {/* Status indicator */}
                      <View style={modalStyles.turbineStatusRow}>
                        <View
                          style={[
                            modalStyles.turbineStatusDot,
                            {
                              backgroundColor: item.isCompleted
                                ? "#10b981"
                                : "#f59e0b",
                            },
                          ]}
                        />
                        <Text
                          style={[
                            modalStyles.turbineStatusText,
                            { color: item.isCompleted ? "#059669" : "#d97706" },
                          ]}
                        >
                          {item.isCompleted ? "Completada" : "Pendiente"}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        modalStyles.turbineCheckbox,
                        item.isCompleted &&
                          modalStyles.turbineCheckboxCompleted,
                      ]}
                    >
                      {item.isCompleted && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
            <View style={modalStyles.actionButtons}>
              <TouchableOpacity
                style={modalStyles.cancelButton}
                onPress={() => setShowTurbinesModal(false)}
              >
                <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={modalStyles.submitButton}
                onPress={submitTurbineProgress}
              >
                <LinearGradient
                  colors={["#3b82f6", "#1d4ed8"]}
                  style={modalStyles.submitButtonGradient}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={modalStyles.submitButtonText}>
                    Enviar Progreso
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
  // Ya no necesitamos el efecto para animaciones

  return (
    <ScrollView
      style={componentStyles.scrollContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={componentStyles.scrollContent}
    >
      <View style={componentStyles.projectInfoCard}>
        <View style={componentStyles.headerContainer}>
          <LinearGradient
            colors={["#a78bfa", "#8b5cf6"]}
            style={componentStyles.headerIconGradient}
          >
            <Ionicons name="briefcase-outline" size={28} color="#ffffff" />
          </LinearGradient>
          <View style={componentStyles.projectHeaderInfo}>
            <Text style={componentStyles.projectTitle}>{projectData.name}</Text>
            <Text style={componentStyles.projectClient}>
              {projectData.client}
            </Text>
            <Text style={componentStyles.projectDescription}>
              {projectData.description}
            </Text>
          </View>
        </View>
        <View style={componentStyles.quickAccessContainer}>
          <TouchableOpacity
            style={componentStyles.quickAccessButton}
            onPress={() => router.push("/pilot/turbines-status")}
          >
            <View style={componentStyles.quickAccessIconContainer}>
              <Ionicons name="nuclear-outline" size={20} color="#3b82f6" />
            </View>
            <Text style={componentStyles.quickAccessButtonText}>
              Ver Turbinas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={componentStyles.quickAccessButton}
            onPress={() => router.push("/pilot/site-map")}
          >
            <View style={componentStyles.quickAccessIconContainer}>
              <Ionicons name="map-outline" size={20} color="#10b981" />
            </View>
            <Text style={componentStyles.quickAccessButtonText}>
              Mapa del Sitio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={componentStyles.quickAccessButton}
            onPress={handleDriveInfo}
          >
            <View style={componentStyles.quickAccessIconContainer}>
              <Ionicons name="cloud-outline" size={20} color="#f59e0b" />
              {projectData.driveSubmission && (
                <View style={componentStyles.quickAccessNotificationDot} />
              )}
            </View>
            <Text style={componentStyles.quickAccessButtonText}>
              Subir Fotos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Details Section */}
        <View style={componentStyles.detailsSection}>
          <View style={componentStyles.detailRow}>
            <Ionicons
              name="business-outline"
              size={16}
              color="#6b7280"
              style={componentStyles.detailIcon}
            />
            <Text style={componentStyles.detailLabel}>Cliente:</Text>
            <Text style={componentStyles.detailValue}>
              {projectData.client}
            </Text>
          </View>
          <View style={componentStyles.detailRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color="#6b7280"
              style={componentStyles.detailIcon}
            />
            <Text style={componentStyles.detailLabel}>Ubicación:</Text>
            <Text style={componentStyles.detailValue}>
              {projectData.location}
            </Text>
          </View>
          <View style={componentStyles.detailRow}>
            <Ionicons
              name="document-text-outline"
              size={16}
              color="#6b7280"
              style={componentStyles.detailIcon}
            />
            <Text style={componentStyles.detailLabel}>Contrato:</Text>
            <Text style={componentStyles.detailValue}>
              {projectData.contractId}
            </Text>
          </View>
          <View style={componentStyles.detailRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#6b7280"
              style={componentStyles.detailIcon}
            />
            <Text style={componentStyles.detailLabel}>Fechas:</Text>
            <Text style={componentStyles.detailValue}>
              {formatDate(projectData.startDate)} -{" "}
              {formatDate(projectData.endDate)}
            </Text>
          </View>
          <View style={componentStyles.detailRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color="#6b7280"
              style={componentStyles.detailIcon}
            />
            <Text style={componentStyles.detailLabel}>Estado:</Text>
            <View style={componentStyles.statusDetailContainer}>
              <View
                style={[
                  componentStyles.statusDot,
                  componentStyles.statusActiveDot,
                ]}
              />
              <Text
                style={[
                  componentStyles.detailValue,
                  componentStyles.statusActiveText,
                ]}
              >
                Activo
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={componentStyles.progressSectionContainer}>
          <View style={componentStyles.progressHeader}>
            <Text style={componentStyles.progressLabel}>
              Progreso del Proyecto
            </Text>
            <View style={componentStyles.progressStats}>
              <Text style={componentStyles.progressNumber}>
                {projectData.completedTurbines}
              </Text>
              <Text style={componentStyles.progressDivider}>/</Text>
              <Text style={componentStyles.progressTotal}>
                {projectData.totalTurbines}
              </Text>
              <Text style={componentStyles.progressUnit}>turbinas</Text>
            </View>
          </View>
          <View style={componentStyles.progressBarBackground}>
            <LinearGradient
              colors={["#a78bfa", "#8b5cf6"]}
              style={[
                componentStyles.progressBarFill,
                { width: `${projectData.progress}%` },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <View style={componentStyles.progressInfo}>
            <Text style={componentStyles.progressPercentText}>
              {projectData.progress}% completado
            </Text>
            <View
              style={[
                componentStyles.statusBadge,
                componentStyles.statusBadgeActive,
              ]}
            >
              <Ionicons name="checkmark-circle" size={12} color="#ffffff" />
              <Text style={componentStyles.statusBadgeText}>En Progreso</Text>
            </View>
          </View>
        </View>

        {/* Members Section */}
        <View style={componentStyles.membersCard}>
          <View style={componentStyles.membersHeaderContainer}>
            <LinearGradient
              colors={["#f59e0b", "#d97706"]}
              style={componentStyles.membersHeaderIconContainer}
            >
              <Ionicons name="people-outline" size={16} color="#ffffff" />
            </LinearGradient>
            <Text style={componentStyles.membersTitle}>
              Equipo del Proyecto
            </Text>
          </View>

          {projectMembers.map((member, index) => (
            <View key={member.id}>
              <View style={componentStyles.memberRow}>
                <View style={componentStyles.avatarContainer}>
                  <Image
                    source={member.avatar}
                    style={componentStyles.avatarImage}
                  />
                </View>
                <View style={componentStyles.memberInfo}>
                  <Text style={componentStyles.memberName}>{member.name}</Text>
                  <Text style={componentStyles.memberRole}>{member.role}</Text>
                </View>
                <TouchableOpacity style={componentStyles.contactButton}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={16}
                    color="#3b82f6"
                  />
                </TouchableOpacity>
              </View>
              {index < projectMembers.length - 1 && (
                <View style={componentStyles.memberSeparator} />
              )}
            </View>
          ))}
        </View>
      </View>

      {renderDriveInfoModal()}
      {renderTurbinesModal()}
    </ScrollView>
  );
};

const componentStyles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingVertical: 16,
  },
  projectInfoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  projectHeaderInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  projectClient: {
    fontSize: 15,
    color: "#8b5cf6",
    fontWeight: "600",
    marginBottom: 6,
  },
  projectDescription: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  quickAccessContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  quickAccessButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quickAccessIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    position: "relative",
  },
  quickAccessNotificationDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "#f9fafb",
  },
  quickAccessButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  detailsSection: {
    marginTop: -8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    marginRight: 12,
    width: 18,
    textAlign: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
    width: 85,
  },
  detailValue: {
    fontSize: 14,
    color: "#1f2937",
    flex: 1,
    fontWeight: "500",
  },
  statusDetailContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusActiveText: {
    color: "#10b981",
    fontWeight: "500",
  },
  statusActiveDot: {
    backgroundColor: "#10b981",
  },
  progressSectionContainer: {
    marginTop: 24,
    width: "100%",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
  },
  progressStats: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  progressNumber: {
    fontSize: 18,
    color: "#8b5cf6",
    fontWeight: "700",
  },
  progressDivider: {
    fontSize: 14,
    color: "#9ca3af",
    marginHorizontal: 3,
    paddingBottom: 1,
  },
  progressTotal: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    paddingBottom: 1,
  },
  progressUnit: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 4,
    paddingBottom: 1,
  },
  progressBarBackground: {
    width: "100%",
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 4,
  },
  progressPercentText: {
    fontSize: 14,
    color: "#8b5cf6",
    fontWeight: "700",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 5,
  },
  statusBadgeActive: {
    backgroundColor: "#10b981",
  },
  statusBadgeText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  membersCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  membersHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  membersHeaderIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 10,
  },
  memberSeparator: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 13,
    color: "#6b7280",
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
});

const modalStyles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: 50,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    maxHeight: "90%",
    overflow: "hidden",
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  modalHeader: {
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#f8fafc",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  modalIconContainer: {
    marginBottom: 12,
  },
  modalIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  driveInfoContainer: {
    margin: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  driveInfoSection: {
    padding: 16,
  },
  driveInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  driveInfoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  driveInfoTextContainer: {
    flex: 1,
  },
  driveInfoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  driveInfoLink: {
    fontSize: 12,
    color: "#3b82f6",
    lineHeight: 16,
  },
  driveInfoValue: {
    fontSize: 13,
    color: "#1f2937",
    fontWeight: "500",
  },
  driveInfoDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 16,
  },
  turbinesStatusContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  turbinesStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  turbinesStatusIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  turbinesStatusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  turbinesProgressCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  turbinesProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  turbinesProgressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  turbinesProgressBadge: {
    borderRadius: 16,
    overflow: "hidden",
  },
  turbinesProgressBadgeGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  turbinesProgressBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  turbinesProgressBarContainer: {
    marginTop: 6,
  },
  turbinesProgressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  turbinesProgressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  turbinesListContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  turbinesListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  turbinesStatusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  turbinesStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  turbinesStatusLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6b7280",
  },
  turbinesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  turbineGridItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 4,
    minWidth: 70,
  },
  turbineGridItemCompleted: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  turbineGridIconContainer: {
    marginRight: 4,
  },
  turbineIconGradientCompleted: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  turbineGridName: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6b7280",
  },
  turbineGridNameCompleted: {
    color: "#065f46",
    fontWeight: "600",
  },
  // Missing turbine modal styles
  turbineItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  turbineItemCompleted: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  turbineItemShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
  },
  turbineItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  turbineIconSection: {
    marginRight: 12,
  },
  turbineCompletedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  turbinePendingIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  turbineInfo: {
    flex: 1,
  },
  turbineName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  turbineNameCompleted: {
    color: "#065f46",
  },
  turbineDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  turbineDateCompleted: {
    color: "#047857",
  },
  turbineStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  turbineStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  turbineStatusText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6b7280",
  },
  turbineCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  turbineCheckboxCompleted: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  submitButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});

export default ProjectInfoMenuEnhanced;
