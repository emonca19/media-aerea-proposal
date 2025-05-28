import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
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
  mockPilotAvailability,
  mockPilotUsers,
  mockProjects,
  mockTurbines,
  mockWindParks,
} from "../../../../src/mocks";
import { ProjectAssignment } from "../../../../src/types/assignments";
import { Project } from "../../../../src/types/projects";

// Helper function to get pilot profile image
const getPilotProfileImage = (pilotId: string) => {
  const pilotUser = mockPilotUsers.find((user) => user.id === pilotId);
  return pilotUser?.profileImage || null;
};

// Placeholder component for pilot images
const PilotImagePlaceholder = () => (
  <View style={styles.pilotImagePlaceholder}>
    <Ionicons name="person" size={24} color="#9ca3af" />
  </View>
);

// Pilot image component with error handling
const PilotImage = ({ pilotId }: { pilotId: string }) => {
  const [imageError, setImageError] = useState(false);
  const imageUri = getPilotProfileImage(pilotId);

  if (!imageUri || imageError) {
    return <PilotImagePlaceholder />;
  }

  return (
    <Image
      source={{ uri: imageUri }}
      style={styles.pilotImage}
      onError={() => setImageError(true)}
    />
  );
};

export default function AssignmentsScreen() {
  const params = useLocalSearchParams();
  const preselectedProjectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPilots, setSelectedPilots] = useState<string[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<string>("");
  const [estimatedStartDate, setEstimatedStartDate] = useState<Date | null>(
    null
  );
  const [estimatedEndDate, setEstimatedEndDate] = useState<Date | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showPilotsModal, setShowPilotsModal] = useState(false);
  const [showDronesModal, setShowDronesModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [dateValidationMessage, setDateValidationMessage] =
    useState<string>("");
  useEffect(() => {
    if (preselectedProjectId) {
      const project = mockProjects.find((p) => p.id === preselectedProjectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [preselectedProjectId]);
  const availablePilots = mockPilotAvailability.filter(
    (pilot) => pilot.available
  );
  const availableDrones = mockDroneAvailability.filter(
    (drone) => drone.available && drone.status === "OPERATIONAL"
  );

  const handlePilotSelection = (pilotId: string) => {
    setSelectedPilots((prev) => {
      if (prev.includes(pilotId)) {
        // Remove pilot if already selected
        return prev.filter((id) => id !== pilotId);
      } else {
        // Add pilot if not selected
        return [...prev, pilotId];
      }
    });
  };
  const handleDroneSelection = (droneId: string) => {
    setSelectedDrone(droneId);
    setShowDronesModal(false);
  };
  const calculateDuration = (start: Date | null, end: Date | null) => {
    if (start && end) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setEstimatedDuration(diffDays);
    }
  };
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      // Clear any previous validation message
      setDateValidationMessage("");

      // Validate that start date is not after end date
      if (estimatedEndDate && selectedDate > estimatedEndDate) {
        setDateValidationMessage(
          "La fecha de inicio no puede ser posterior a la fecha de fin"
        );
        return;
      }
      setEstimatedStartDate(selectedDate);
      calculateDuration(selectedDate, estimatedEndDate);
    }
  };
  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      // Clear any previous validation message
      setDateValidationMessage("");

      let newStartDate = estimatedStartDate;

      // Validate that end date is not before start date
      if (estimatedStartDate && selectedDate < estimatedStartDate) {
        // Automatically adjust start date to be the same as end date
        newStartDate = selectedDate;
        setEstimatedStartDate(selectedDate);
        setDateValidationMessage(
          "La fecha de inicio se ajustó automáticamente para coincidir con la fecha de fin"
        );
      }

      setEstimatedEndDate(selectedDate);
      calculateDuration(newStartDate, selectedDate);
    }
  };
  const handleConfirmAssignment = () => {
    if (!selectedProject) {
      Alert.alert("Error", "Debe seleccionar un proyecto");
      return;
    }
    if (selectedPilots.length === 0) {
      Alert.alert("Error", "Debe seleccionar al menos un piloto");
      return;
    }
    if (!selectedDrone) {
      Alert.alert("Error", "Debe seleccionar un drone");
      return;
    }
    if (!estimatedStartDate || !estimatedEndDate) {
      Alert.alert("Error", "Debe especificar las fechas de inicio y fin");
      return;
    }
    const newAssignment: ProjectAssignment = {
      id: `assign_${Date.now()}`,
      projectId: selectedProject.id,
      pilotIds: selectedPilots,
      droneIds: [selectedDrone],
      turbineIds: [], // No specific turbines selected since they're now informational
      estimatedStartDate: estimatedStartDate,
      estimatedEndDate: estimatedEndDate,
      estimatedDuration: estimatedDuration,
      assignedBy: "admin_001", // Current admin user
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real app, this would be sent to the server
    console.log("New assignment created:", newAssignment);

    Alert.alert(
      "Asignación Creada",
      "La asignación se ha creado exitosamente",
      [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setSelectedProject(null);
            setSelectedPilots([]);
            setSelectedDrone("");
            setEstimatedStartDate(null);
            setEstimatedEndDate(null);
            setEstimatedDuration(0);
            setNotes("");
          },
        },
      ]
    );
  };
  const renderProjectSelector = () => (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        {/* <Ionicons name="document-text" size={24} color="#9C46CE" /> */}
        <Text style={styles.sectionTitle}>Proyecto</Text>
      </View>
      <TouchableOpacity
        style={styles.projectSelector}
        onPress={() => setShowProjectModal(true)}
      >
        <View style={styles.projectSelectorContent}>
          {selectedProject ? (
            <View>
              <Text style={styles.projectName}>{selectedProject.name}</Text>
              <Text style={styles.projectDescription}>
                {selectedProject.description}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>Seleccionar proyecto...</Text>
          )}
        </View>
        <Ionicons name="chevron-down" size={24} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );
  const renderTurbinesSection = () => {
    // Get all turbines for the selected project
    const projectWindPark = selectedProject
      ? mockWindParks.find((p) => p.projectId === selectedProject.id)
      : null;
    const projectTurbines = projectWindPark
      ? mockTurbines.filter((t) => t.windParkId === projectWindPark.id)
      : [];

    if (!selectedProject) {
      return null;
    }
    return (
      <View style={styles.turbinesSection}>
        {projectTurbines.length === 0 ? (
          <Text style={styles.turbinesInfoText}>
            No hay turbinas asociadas a este proyecto
          </Text>
        ) : (
          <View>
            <Text style={styles.turbinesCountText}>
              {projectTurbines.length} turbina
              {projectTurbines.length > 1 ? "s" : ""} encontrada
              {projectTurbines.length > 1 ? "s" : ""}
            </Text>
            <View style={styles.turbinesGrid}>
              {projectTurbines.map((turbine) => (
                <View key={turbine.id} style={styles.turbineInfoItem}>
                  <MaterialCommunityIcons
                    name="wind-turbine"
                    size={16}
                    color="#9C46CE"
                  />
                  <Text style={styles.turbineInfoName}>{turbine.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };
  const renderAvailabilitySection = () => (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        {/* <MaterialCommunityIcons
          name="tools"
          size={24}
          color={selectedProject ? "#10b981" : "#9ca3af"}
        /> */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: selectedProject ? "#1f2937" : "#9ca3af",
            },
          ]}
        >
          Recursos
        </Text>
      </View>

      {!selectedProject && (
        <Text style={styles.disabledSectionText}>
          Selecciona un proyecto primero para ver la disponibilidad
        </Text>
      )}

      {selectedProject && (
        <>
          {/* Pilots Selector */}
          <View style={styles.subsection}>
            <View style={styles.subsectionTitleContainer}>
              <MaterialCommunityIcons
                name="account"
                size={18}
                color="#10b981"
              />
              <Text style={styles.subsectionTitle}>
                Pilotos Disponibles ({availablePilots.length})
              </Text>
            </View>
            <TouchableOpacity
              style={styles.resourceSelector}
              onPress={() => setShowPilotsModal(true)}
            >
              <View style={styles.resourceSelectorContent}>
                {selectedPilots.length > 0 ? (
                  <View>
                    {selectedPilots.length === 1 ? (
                      <Text style={styles.resourceSelectedSingle}>
                        {
                          availablePilots.find(
                            (p) => p.pilotId === selectedPilots[0]
                          )?.pilotName
                        }
                      </Text>
                    ) : (
                      <Text style={styles.resourceSelectedMultiple}>
                        {selectedPilots.length} pilotos seleccionados
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>
                    Seleccionar pilotos...
                  </Text>
                )}
              </View>
              <View style={styles.resourceSelectorIndicator}>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Drones Selector */}
          <View style={styles.subsection}>
            <View style={styles.subsectionTitleContainer}>
              <MaterialCommunityIcons name="drone" size={18} color="#10b981" />
              <Text style={styles.subsectionTitle}>
                Drones Disponibles ({availableDrones.length})
              </Text>
            </View>
            <TouchableOpacity
              style={styles.resourceSelector}
              onPress={() => setShowDronesModal(true)}
            >
              <View style={styles.resourceSelectorContent}>
                {selectedDrone ? (
                  <Text style={styles.resourceSelectedSingle}>
                    {
                      availableDrones.find((d) => d.droneId === selectedDrone)
                        ?.droneName
                    }
                  </Text>
                ) : (
                  <Text style={styles.placeholderText}>
                    Seleccionar drone...
                  </Text>
                )}
              </View>
              <View style={styles.resourceSelectorIndicator}>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
  const renderDurationAndDates = () => {
    const hasResourcesSelected = selectedPilots.length > 0 && selectedDrone;
    return (
      <View style={styles.datesSection}>
        <View style={styles.sectionTitleContainer}>
          {/* <MaterialIcons
            name="schedule"
            size={24}
            color={hasResourcesSelected ? "#f59e0b" : "#9ca3af"}
          /> */}
          <Text
            style={[
              styles.sectionTitle,
              { color: hasResourcesSelected ? "#1f2937" : "#9ca3af" },
            ]}
          >
            Fechas
          </Text>
        </View>

        {!hasResourcesSelected && (
          <Text style={styles.disabledSectionText}>
            Selecciona personal y equipos primero para configurar fechas
          </Text>
        )}

        {hasResourcesSelected && (
          <>
            <View style={styles.dateRow}>
              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>Fecha de Inicio</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => {
                    setDateValidationMessage(""); // Clear validation message
                    setShowStartDatePicker(true);
                  }}
                >
                  <Text style={styles.dateButtonText}>
                    {estimatedStartDate
                      ? estimatedStartDate.toLocaleDateString()
                      : "Inicio"}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#9C46CE" />
                </TouchableOpacity>
              </View>

              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>Fecha de Fin</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => {
                    setDateValidationMessage(""); // Clear validation message
                    setShowEndDatePicker(true);
                  }}
                >
                  <Text style={styles.dateButtonText}>
                    {estimatedEndDate
                      ? estimatedEndDate.toLocaleDateString()
                      : "Fin"}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#9C46CE" />
                </TouchableOpacity>
              </View>
            </View>
            {/* Date validation message */}
            {dateValidationMessage && (
              <View style={styles.validationMessageContainer}>
                <Ionicons name="information-circle" size={16} color="#f59e0b" />
                <Text style={styles.validationMessageText}>
                  {dateValidationMessage}
                </Text>
              </View>
            )}
            <View style={styles.durationContainer}>
              <View style={styles.durationDisplay}>
                <MaterialIcons name="access-time" size={20} color="#6b7280" />
                <Text style={styles.durationLabel}>
                  <Text>Duración: </Text>
                  <Text
                    style={[
                      styles.durationText,
                      { color: estimatedDuration > 0 ? "#1f2937" : "#9ca3af" },
                    ]}
                  >
                    {estimatedDuration > 0
                      ? `${estimatedDuration} días`
                      : "Seleccione fechas para calcular"}
                  </Text>
                </Text>
              </View>
            </View>
            <View style={styles.notesContainer}>
              <Text style={styles.inputLabel}>Notas Adicionales</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Agregar notas sobre la asignación..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>
          </>
        )}

        {/* Date Pickers */}
        {showStartDatePicker && (
          <>
            {Platform.OS === "web" ? (
              <Modal
                visible={showStartDatePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowStartDatePicker(false)}
              >
                <View style={styles.datePickerModal}>
                  <View style={styles.datePickerContainer}>
                    <Text style={styles.datePickerTitle}>
                      Seleccionar Fecha de Inicio
                    </Text>
                    <Text> </Text>
                    <input
                      type="date"
                      style={{
                        padding: 12,
                        fontSize: 16,
                        border: `1px solid #d1d5db`,
                        borderRadius: 8,
                        marginBottom: 16,
                        width: "100%",
                        backgroundColor: "#f9fafb",
                      }}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        handleStartDateChange(null, date);
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      max={
                        estimatedEndDate?.toISOString().split("T")[0] ||
                        undefined
                      }
                    />
                    <TouchableOpacity
                      style={styles.datePickerCloseButton}
                      onPress={() => setShowStartDatePicker(false)}
                    >
                      <Text style={styles.datePickerCloseText}>Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={estimatedStartDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleStartDateChange}
                minimumDate={new Date()}
                maximumDate={estimatedEndDate || undefined}
              />
            )}
          </>
        )}
        {showEndDatePicker && (
          <>
            {Platform.OS === "web" ? (
              <Modal
                visible={showEndDatePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowEndDatePicker(false)}
              >
                <View style={styles.datePickerModal}>
                  <View style={styles.datePickerContainer}>
                    <Text style={styles.datePickerTitle}>
                      Seleccionar Fecha de Fin
                    </Text>
                    <input
                      type="date"
                      style={{
                        padding: 12,
                        fontSize: 16,
                        border: `1px solid #d1d5db`,
                        borderRadius: 8,
                        marginBottom: 16,
                        width: "100%",
                        backgroundColor: "#f9fafb",
                      }}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        handleEndDateChange(null, date);
                      }}
                      min={
                        estimatedStartDate?.toISOString().split("T")[0] ||
                        new Date().toISOString().split("T")[0]
                      }
                    />
                    <TouchableOpacity
                      style={styles.datePickerCloseButton}
                      onPress={() => setShowEndDatePicker(false)}
                    >
                      <Text style={styles.datePickerCloseText}>Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={estimatedEndDate || estimatedStartDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleEndDateChange}
                minimumDate={estimatedStartDate || new Date()}
              />
            )}
          </>
        )}
      </View>
    );
  };
  const renderProjectModal = () => (
    <Modal
      visible={showProjectModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowProjectModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Seleccionar Proyecto</Text>
          <TouchableOpacity
            onPress={() => setShowProjectModal(false)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          {mockProjects
            .filter((project) => project.status === "ACTIVE")
            .map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[
                  styles.projectCard,
                  selectedProject?.id === project.id &&
                    styles.selectedProjectCard,
                ]}
                onPress={() => {
                  setSelectedProject(project);
                  setShowProjectModal(false);
                }}
              >
                <Text style={styles.projectCardName}>{project.name}</Text>
                <Text style={styles.projectCardDescription}>
                  {project.description}
                </Text>
                <View style={styles.projectCardDetails}>
                  <Text style={styles.projectCardDetail}>
                    Duración: {project.estimatedDuration} días
                  </Text>
                  <View
                    style={[
                      styles.projectStatusBadge,
                      { backgroundColor: getStatusColor(project.status) },
                    ]}
                  >
                    <Text style={styles.projectStatusText}>
                      {project.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderPilotsModal = () => (
    <Modal
      visible={showPilotsModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowPilotsModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Seleccionar Pilotos</Text>
          <TouchableOpacity
            onPress={() => setShowPilotsModal(false)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          {availablePilots.map((pilot) => (
            <TouchableOpacity
              key={pilot.pilotId}
              style={[
                styles.availabilityCard,
                selectedPilots.includes(pilot.pilotId) && styles.selectedCard,
              ]}
              onPress={() => handlePilotSelection(pilot.pilotId)}
            >
              <View style={styles.pilotCardWithImage}>
                <PilotImage pilotId={pilot.pilotId} />
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{pilot.pilotName}</Text>
                    <View style={styles.statusBadge}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: "#16a34a" },
                        ]}
                      />
                      <Text style={styles.statusText}>Disponible</Text>
                    </View>
                  </View>
                  <View style={styles.selectionIndicator}>
                    {selectedPilots.includes(pilot.pilotId) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#10b981"
                      />
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[
              styles.confirmSelectionButton,
              selectedPilots.length === 0 &&
                styles.confirmSelectionButtonDisabled,
            ]}
            onPress={() => setShowPilotsModal(false)}
          >
            <Ionicons
              name="checkmark"
              size={20}
              color={selectedPilots.length > 0 ? "#ffffff" : "#9ca3af"}
            />
            <Text
              style={[
                styles.confirmSelectionButtonText,
                selectedPilots.length === 0 &&
                  styles.confirmSelectionButtonTextDisabled,
              ]}
            >
              {selectedPilots.length === 0
                ? "Seleccionar pilotos"
                : `Confirmar ${selectedPilots.length} piloto${
                    selectedPilots.length > 1 ? "s" : ""
                  }`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderDronesModal = () => (
    <Modal
      visible={showDronesModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowDronesModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Seleccionar Drones</Text>
          <TouchableOpacity
            onPress={() => setShowDronesModal(false)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          {availableDrones.map((drone) => (
            <TouchableOpacity
              key={drone.droneId}
              style={[
                styles.availabilityCard,
                selectedDrone === drone.droneId && styles.selectedCard,
              ]}
              onPress={() => handleDroneSelection(drone.droneId)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{drone.droneName}</Text>
                  <Text style={styles.cardSubtitle}>
                    S/N: {drone.serialNumber}
                  </Text>
                  <View style={styles.statusBadge}>
                    <View
                      style={[styles.statusDot, { backgroundColor: "#16a34a" }]}
                    />
                    <Text style={styles.statusText}>Operacional</Text>
                  </View>
                </View>
                <View style={styles.selectionIndicator}>
                  {selectedDrone === drone.droneId && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#10b981"
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "#10b981";
      case "PAUSED":
        return "#f59e0b";
      case "FINISHED":
        return "#9C46CE";
      case "COMPLETED":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          title: "Asignar Proyecto",
        }}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProjectSelector()}
        {renderTurbinesSection()}
        {renderAvailabilitySection()}
        {renderDurationAndDates()}{" "}
        <View style={styles.finalSection}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedProject ||
                selectedPilots.length === 0 ||
                !selectedDrone ||
                !estimatedStartDate ||
                !estimatedEndDate) &&
                styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmAssignment}
            disabled={
              !selectedProject ||
              selectedPilots.length === 0 ||
              !selectedDrone ||
              !estimatedStartDate ||
              !estimatedEndDate
            }
          >
            <MaterialIcons
              name="assignment-turned-in"
              size={24}
              color="white"
            />
            <Text style={styles.confirmButtonText}>Confirmar Asignación</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {renderProjectModal()}
      {renderPilotsModal()}
      {renderDronesModal()}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  section: {
    paddingHorizontal: 6,
    paddingVertical: 16,
  },
  datesSection: {
    paddingHorizontal: 6,
    paddingTop: 0,
    paddingBottom: 16,
  },
  turbinesSection: {
    paddingHorizontal: 6,
    paddingTop: 4,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  subsection: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 8,
  },
  subsectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  disabledSectionText: {
    fontSize: 14,
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  projectSelector: {
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  projectSelectorContent: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  placeholderText: {
    fontSize: 16,
    color: "#9ca3af",
  },
  availabilityCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectedCard: {
    borderColor: "#3b82f6",
    backgroundColor: "#f8fafc",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6b7280",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#16a34a",
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  availabilityText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  availabilityWindow: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "400",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  durationContainer: {
    marginBottom: 16,
  },
  durationDisplay: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  durationLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 6,
    fontWeight: "500",
  },
  durationText: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "600",
  },
  dateButton: {
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  dateButtonRestricted: {
    borderColor: "#0ea5e9",
    backgroundColor: "#f0f9ff",
  },
  restrictedLabel: {
    fontSize: 12,
    color: "#0369a1",
    fontStyle: "italic",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#374151",
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  confirmButton: {
    backgroundColor: "#9C46CE",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#9C46CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowColor: "#000",
    shadowOpacity: 0.1,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  projectCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectedProjectCard: {
    borderColor: "#3b82f6",
    backgroundColor: "#f8fafc",
  },
  projectCardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
  },
  projectCardDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  projectCardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectCardDetail: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  projectStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  projectStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  datePickerModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  datePickerContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  datePickerCloseButton: {
    backgroundColor: "#9C46CE",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  datePickerCloseText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  finalSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  availabilityScrollView: {
    maxHeight: 300,
    marginVertical: 8,
  },
  resourceSelector: {
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
  },
  resourceSelectorContent: {
    flex: 1,
  },
  resourceSelectorIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resourceSelectedCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  resourceSelectedNames: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 18,
  },
  resourceSelectedSingle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  resourceSelectedMultiple: {
    fontSize: 16,
    fontWeight: "600",
  },
  resourceBadge: {
    backgroundColor: "#9C46CE",
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    fontStyle: "italic",
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  confirmSelectionButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmSelectionButtonDisabled: {
    backgroundColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.1,
  },
  confirmSelectionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  confirmSelectionButtonTextDisabled: {
    color: "#9ca3af",
  },
  // New styles for turbines information display
  turbinesInfoText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    fontStyle: "italic",
  },
  turbinesCountText: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "500",
  },
  turbinesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  turbineInfoItem: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minWidth: 90,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  turbineInfoName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },
  pilotImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  pilotImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pilotCardWithImage: {
    flexDirection: "row",
    alignItems: "center",
  },
  validationMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  validationMessageText: {
    fontSize: 14,
    color: "#92400e",
    marginLeft: 8,
    flex: 1,
  },
  dateHelpText: {
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },
  helpText: {
    fontSize: 13,
    color: "#0369a1",
    textAlign: "center",
  },
});
