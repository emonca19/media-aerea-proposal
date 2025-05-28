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
import { SafeAreaView } from "react-native-safe-area-context";
import {
  mockCameraAvailability,
  mockDroneAvailability,
  mockDrones,
  mockPilotAvailability,
  mockPilotUsers,
  mockProjects,
  mockTurbines,
  mockWindParks,
} from "../../../../src/mocks"; // Adjust path as necessary
import { ProjectAssignment } from "../../../../src/types/assignments"; // Adjust path
import { Project } from "../../../../src/types/projects"; // Adjust path

// Helper function to compare only date parts (ignoring time)
const compareDates = (date1: Date, date2: Date) => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};


const getPilotProfileImage = (pilotId: string) => {
  const pilotUser = mockPilotUsers.find((user) => user.id === pilotId);
  return pilotUser?.profileImage || null;
};

const PilotImagePlaceholder = () => (
  <View style={styles.pilotImagePlaceholder}>
    <Ionicons name="person" size={24} color="#9ca3af" />
  </View>
);

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
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [estimatedStartDate, setEstimatedStartDate] = useState<Date | null>(
    null
  );
  const [estimatedEndDate, setEstimatedEndDate] = useState<Date | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showPilotsModal, setShowPilotsModal] = useState(false);
  const [showDronesModal, setShowDronesModal] = useState(false);
  const [showCamerasModal, setShowCamerasModal] = useState(false);
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
  const availableCameras = mockCameraAvailability.filter(
    (camera) => camera.available && camera.status === "AVAILABLE"
  );

  const selectedDroneData = selectedDrone
    ? mockDrones.find((d) => d.id === selectedDrone)
    : null;
  const droneHasBuiltInCamera = selectedDroneData?.hasCamera || false;

  const handlePilotSelection = (pilotId: string) => {
    setSelectedPilots((prev) => {
      if (prev.includes(pilotId)) {
        return prev.filter((id) => id !== pilotId);
      } else {
        return [...prev, pilotId];
      }
    });
  };
  const handleDroneSelection = (droneId: string) => {
    setSelectedDrone(droneId);
    setShowDronesModal(false);
    setSelectedCamera("");
  };

  const handleCameraSelection = (cameraId: string) => {
    setSelectedCamera(cameraId);
    setShowCamerasModal(false);
  };

  const calculateDuration = (start: Date | null, end: Date | null) => {
    if (start && end) {
      // Ensure we are comparing dates at the same time of day (e.g., midnight) to avoid off-by-one issues
      const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      setEstimatedDuration(diffDays);
    } else {
      setEstimatedDuration(0);
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    const isWeb = Platform.OS === 'web';

    if (!isWeb) {
        // For mobile, hide picker unless it's an iOS inline picker or user dismissed
        if (event?.type === 'dismissed') { // Android cancel
            setShowStartDatePicker(false);
            return;
        }
        // For iOS spinner/compact or Android default, always hide after an action
        const displayMode = Platform.OS === 'ios' ? 'spinner' : 'default'; // Assuming these are your defaults
        // if (displayMode !== 'inline') { // Add your actual display prop value if different
        //      setShowStartDatePicker(false);
        // }
    }

    if (selectedDate) {
      if (estimatedEndDate && compareDates(selectedDate, estimatedEndDate) > 0) {
        setDateValidationMessage(
          "La fecha de inicio no puede ser posterior a la fecha de fin"
        );
        // On web, do not close picker if validation fails, allow user to correct
        if (!isWeb) setShowStartDatePicker(false);
        return;
      }
      
      setDateValidationMessage("");
      setEstimatedStartDate(selectedDate);
      calculateDuration(selectedDate, estimatedEndDate);

      if (isWeb) {
        setShowStartDatePicker(false); // Close web picker on successful selection
      }
    } else if (!isWeb) {
        // If selectedDate is null/undefined on mobile (e.g. dismissed), ensure picker is closed
        setShowStartDatePicker(false);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    const isWeb = Platform.OS === 'web';

    if (!isWeb) {
        if (event?.type === 'dismissed') {
            setShowEndDatePicker(false);
            return;
        }
        const displayMode = Platform.OS === 'ios' ? 'spinner' : 'default';
        // if (displayMode !== 'inline') {
        //     setShowEndDatePicker(false);
        // }
    }
    
    if (selectedDate) {
      let newStartDate = estimatedStartDate;
      let message = "";

      if (estimatedStartDate && compareDates(selectedDate, estimatedStartDate) < 0) {
        // End date is before start date, adjust start date to match new end date
        newStartDate = selectedDate;
        setEstimatedStartDate(selectedDate);
        message = "La fecha de inicio se ajustó automáticamente para coincidir con la fecha de fin";
      }
      
      setDateValidationMessage(message);
      setEstimatedEndDate(selectedDate);
      calculateDuration(newStartDate, selectedDate);

      if (isWeb) {
        setShowEndDatePicker(false);
      }
    } else if (!isWeb) {
        setShowEndDatePicker(false);
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
    if (!droneHasBuiltInCamera && !selectedCamera) {
      Alert.alert("Error", "Debe seleccionar una cámara para este drone");
      return;
    }
    if (dateValidationMessage && dateValidationMessage.includes("no puede ser posterior")) {
        Alert.alert("Error de Fechas", dateValidationMessage);
        return;
    }

    const newAssignment: ProjectAssignment = {
      id: `assign_${Date.now()}`,
      projectId: selectedProject.id,
      pilotIds: selectedPilots,
      droneIds: [selectedDrone],
      cameraIds: droneHasBuiltInCamera
        ? []
        : selectedCamera
        ? [selectedCamera]
        : [],
      turbineIds: [], // Assuming this is handled elsewhere or not part of this form
      estimatedStartDate: estimatedStartDate,
      estimatedEndDate: estimatedEndDate,
      estimatedDuration: estimatedDuration,
      assignedBy: "admin_001", // Placeholder
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("New assignment created:", newAssignment);

    Alert.alert(
      "Asignación Creada",
      "La asignación se ha creado exitosamente",
      [
        {
          text: "OK",
          onPress: () => {
            setSelectedProject(null);
            setSelectedPilots([]);
            setSelectedDrone("");
            setSelectedCamera("");
            setEstimatedStartDate(null);
            setEstimatedEndDate(null);
            setEstimatedDuration(0);
            setNotes("");
            setDateValidationMessage("");
          },
        },
      ]
    );
  };

  const renderProjectSelector = () => (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
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
          {/* Pilot Selection */}
          <View style={styles.subsection}>
            <View style={styles.subsectionTitleContainer}>
              <MaterialCommunityIcons name="account" size={18} color="#10b981" />
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
                        {availablePilots.find(p => p.pilotId === selectedPilots[0])?.pilotName}
                      </Text>
                    ) : (
                      <Text style={styles.resourceSelectedMultiple}>
                        {selectedPilots.length} pilotos seleccionados
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Seleccionar pilotos...</Text>
                )}
              </View>
              <View style={styles.resourceSelectorIndicator}>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Drone Selection */}
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
                    {availableDrones.find(d => d.droneId === selectedDrone)?.droneName}
                  </Text>
                ) : (
                  <Text style={styles.placeholderText}>Seleccionar drone...</Text>
                )}
              </View>
              <View style={styles.resourceSelectorIndicator}>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Camera Section */}
          {selectedDrone && !droneHasBuiltInCamera && (
            <View style={styles.subsection}>
              <View style={styles.subsectionTitleContainer}>
                <MaterialCommunityIcons name="camera" size={18} color="#10b981" />
                <Text style={styles.subsectionTitle}>
                  Cámaras Disponibles ({availableCameras.length})
                </Text>
              </View>
              <Text style={styles.cameraRequirementText}>Este drone requiere una cámara externa</Text>
              <TouchableOpacity
                style={styles.resourceSelector}
                onPress={() => setShowCamerasModal(true)}
              >
                <View style={styles.resourceSelectorContent}>
                  {selectedCamera ? (
                    <Text style={styles.resourceSelectedSingle}>
                      {availableCameras.find(c => c.cameraId === selectedCamera)?.cameraName}
                    </Text>
                  ) : (
                    <Text style={styles.placeholderText}>Seleccionar cámara...</Text>
                  )}
                </View>
                <View style={styles.resourceSelectorIndicator}>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {selectedDrone && droneHasBuiltInCamera && (
            <View style={styles.subsection}>
              <View style={styles.subsectionTitleContainer}>
                <MaterialCommunityIcons name="camera" size={18} color="#9ca3af" />
                <Text style={[styles.subsectionTitle, { color: "#9ca3af" }]}>Cámara</Text>
              </View>
              <Text style={styles.cameraInfoText}>Este drone tiene cámara integrada</Text>
            </View>
          )}
        </>
      )}
    </View>
  );

  const renderDurationAndDates = () => {
    const hasResourcesSelected = selectedPilots.length > 0 && selectedDrone;

    // Helper to parse "YYYY-MM-DD" string to local Date object
    const parseDateString = (dateString: string): Date | null => {
      if (!dateString) return null;
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return new Date(year, month, day);
        }
      }
      return null;
    };


    return (
      <View style={styles.datesSection}>
        <View style={styles.sectionTitleContainer}>
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
                    // Clear validation only if not related to picker interaction itself
                    // setDateValidationMessage("");
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
                    // setDateValidationMessage("");
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
                  Duración:{" "}
                  <Text
                    style={[
                      styles.durationText,
                      { color: estimatedDuration > 0 ? "#1f2937" : "#9ca3af" },
                    ]}
                  >
                    {estimatedDuration > 0
                      ? `${estimatedDuration} día${estimatedDuration > 1 ? 's' : ''}`
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
        {/* Start Date Picker */}
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
                    <input
                      type="date"
                      value={
                        estimatedStartDate?.toISOString().split("T")[0] || ""
                      }
                      style={styles.webDatePickerInput} // Added style
                      onChange={(e) => {
                        const selectedDate = parseDateString(e.target.value);
                        if (selectedDate) {
                            handleStartDateChange(null, selectedDate);
                        } else if (e.target.value === "") { // Handle cleared input
                            setEstimatedStartDate(null);
                            calculateDuration(null, estimatedEndDate);
                            setDateValidationMessage(""); // Clear validation if input is cleared
                        }
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
        {/* End Date Picker */}
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
                      value={
                        estimatedEndDate?.toISOString().split("T")[0] || ""
                      }
                      style={styles.webDatePickerInput} // Added style
                      onChange={(e) => {
                        const selectedDate = parseDateString(e.target.value);
                        if (selectedDate) {
                            handleEndDateChange(null, selectedDate);
                        } else if (e.target.value === "") { // Handle cleared input
                            setEstimatedEndDate(null);
                            calculateDuration(estimatedStartDate, null);
                            setDateValidationMessage(""); // Clear validation if input is cleared
                        }
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
      presentationStyle="pageSheet" // Consider 'fullScreen' for web if 'pageSheet' has issues
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
            .filter((project) => project.status === "ACTIVE") // Ensure mockProjects is populated
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
                <TouchableOpacity onPress={() => setShowPilotsModal(false)} style={styles.modalCloseButton}>
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
                            <View style={styles.cardHeaderNoMarginBottom}>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardTitle}>{pilot.pilotName}</Text>
                                    <View style={styles.statusBadge}>
                                        <View style={[styles.statusDot, { backgroundColor: "#16a34a" }]} />
                                        <Text style={styles.statusText}>Disponible</Text>
                                    </View>
                                </View>
                                {selectedPilots.includes(pilot.pilotId) && (
                                    <View style={styles.selectionIndicator}>
                                        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <View style={styles.modalFooter}>
                <TouchableOpacity
                    style={[
                        styles.confirmSelectionButton,
                        selectedPilots.length === 0 && styles.confirmSelectionButtonDisabled,
                    ]}
                    onPress={() => setShowPilotsModal(false)}
                    disabled={selectedPilots.length === 0}
                >
                    <Ionicons name="checkmark" size={20} color={selectedPilots.length > 0 ? "#ffffff" : "#9ca3af"} />
                    <Text style={[
                        styles.confirmSelectionButtonText,
                        selectedPilots.length === 0 && styles.confirmSelectionButtonTextDisabled,
                    ]}>
                        {selectedPilots.length === 0
                            ? "Seleccionar pilotos"
                            : `Confirmar ${selectedPilots.length} piloto${selectedPilots.length > 1 ? "s" : ""}`}
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
                <Text style={styles.modalTitle}>Seleccionar Drone</Text>
                <TouchableOpacity onPress={() => setShowDronesModal(false)} style={styles.modalCloseButton}>
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
                                <Text style={styles.cardSubtitle}>S/N: {drone.serialNumber}</Text>
                                <View style={styles.statusBadge}>
                                    <View style={[styles.statusDot, { backgroundColor: "#16a34a" }]} />
                                    <Text style={styles.statusText}>Operacional</Text>
                                </View>
                            </View>
                            {selectedDrone === drone.droneId && (
                                <View style={styles.selectionIndicator}>
                                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
             {/* No footer needed for single selection, closes on press */}
        </View>
    </Modal>
  );

  const renderCamerasModal = () => (
    <Modal
        visible={showCamerasModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCamerasModal(false)}
    >
        <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Cámara</Text>
                <TouchableOpacity onPress={() => setShowCamerasModal(false)} style={styles.modalCloseButton}>
                    <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
                {availableCameras.map((camera) => (
                    <TouchableOpacity
                        key={camera.cameraId}
                        style={[
                            styles.availabilityCard,
                            selectedCamera === camera.cameraId && styles.selectedCard,
                        ]}
                        onPress={() => handleCameraSelection(camera.cameraId)}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardTitle}>{camera.cameraName}</Text>
                                <Text style={styles.cardSubtitle}>Modelo: {camera.model}</Text>
                                <View style={styles.statusBadge}>
                                    <View style={[styles.statusDot, { backgroundColor: "#16a34a" }]} />
                                    <Text style={styles.statusText}>Disponible</Text>
                                </View>
                            </View>
                            {selectedCamera === camera.cameraId && (
                                <View style={styles.selectionIndicator}>
                                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {/* No footer needed for single selection, closes on press */}
        </View>
    </Modal>
  );


  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) { // Added toUpperCase for safety
      case "ACTIVE": return "#10b981";
      case "PAUSED": return "#f59e0b";
      case "FINISHED": return "#9C46CE";
      case "COMPLETED": return "#8b5cf6"; // Ensure this status is used in mocks
      default: return "#6b7280";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false, // Assuming this is intended for this screen
            // title: "Asignar Proyecto", // Title is not visible if headerShown is false
          }}
        />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderProjectSelector()}
          {renderTurbinesSection()}
          {renderAvailabilitySection()}
          {renderDurationAndDates()}
          <View style={styles.finalSection}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!selectedProject ||
                  selectedPilots.length === 0 ||
                  !selectedDrone ||
                  !estimatedStartDate ||
                  !estimatedEndDate ||
                  (dateValidationMessage && dateValidationMessage.includes("no puede ser posterior"))
                  ) &&
                  styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirmAssignment}
            //   disabled={
            //     !selectedProject ||
            //     selectedPilots.length === 0 ||
            //     !selectedDrone ||
            //     !estimatedStartDate ||
            //     !estimatedEndDate ||
            //     (dateValidationMessage && dateValidationMessage.includes("no puede ser posterior"))
            //   }
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
        {renderCamerasModal()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    paddingTop: 0, // Adjusted from 16 if it follows another section tightly
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
    backgroundColor: "#ffffff", // Added for consistency
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
    padding: 12, // Reduced padding for dense lists
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff", // Ensure background
  },
  selectedCard: {
    borderColor: "#3b82f6", // Use a consistent selection color
    backgroundColor: "#eff6ff", // Lighter blue for selected item
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Changed to flex-start for better alignment with subtitles
    marginBottom: 8, // Keep or remove based on design
  },
  cardHeaderNoMarginBottom: { // New style for pilot card
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Center items vertically
    flex: 1, // Allow it to take remaining space
  },
  cardInfo: {
    flex: 1, // Allow text to wrap
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
    backgroundColor: "#f0fdf4", // Light green
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start", // Important for badge to size to content
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
    color: "#16a34a", // Darker green text
  },
  selectionIndicator: {
    marginLeft: 12,
    alignSelf: 'center', // Center checkmark if card items are aligned differently
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
    paddingHorizontal: 12, // Consistent padding
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff", // Ensure background
  },
  durationContainer: {
    marginBottom: 16,
  },
  durationDisplay: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8, // A bit more spacing
  },
  durationLabel: {
    fontSize: 14, // Slightly smaller
    color: "#6b7280",
    marginLeft: 6,
    fontWeight: "500",
  },
  durationText: {
    fontSize: 16, // Keep or make consistent with other text
    // color: "#1f2937", // Color is now conditional inline
    fontWeight: "600",
    marginLeft: 4, // Add space if part of the same Text component
  },
  dateButton: {
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff", // Ensure background
  },
  dateButtonText: {
    fontSize: 16,
    color: "#374151", // Darker text for better readability
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesInput: {
    minHeight: 80, // Use minHeight for multiline
    textAlignVertical: "top",
  },
  confirmButton: {
    backgroundColor: "#9C46CE",
    borderRadius: 12,
    paddingVertical: 16, // Adjusted padding
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // marginBottom: 32, // Moved to finalSection if needed
    shadowColor: "#9C46CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: "#d1d5db", // More distinct disabled color
    shadowColor: "#000",
    shadowOpacity: 0.1,
    elevation: 0, // No elevation for disabled
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f9fafb", // Light gray for modal background
    ...(Platform.OS === "web" && {
        maxWidth: 700, // Max width for web modals
        alignSelf: "center",
        width: "100%",
        marginVertical: 32, // Add some vertical margin on web
        borderRadius: 12, // Rounded corners for web modal itself
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)", // Web shadow
    }),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, // Increased padding
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff", // White header
    borderTopLeftRadius: Platform.OS === "web" ? 12 : 16, // Match container for web
    borderTopRightRadius: Platform.OS === "web" ? 12 : 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  modalCloseButton: {
    padding: 8, // Make close button easier to tap
  },
  modalContent: {
    flex: 1,
    padding: 16, // Consistent padding
  },
  projectCard: {
    borderRadius: 12,
    padding: 16, // More padding
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  selectedProjectCard: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
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
    borderRadius: 20, // Fully rounded
  },
  projectStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  datePickerModal: { // Styles for the modal backdrop on web
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  datePickerContainer: { // Styles for the modal content area on web
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    margin: 20, // Ensure it's not too wide on small screens
    minWidth: Platform.OS === "web" ? 300 : 280, // Adjusted minWidth
    maxWidth: Platform.OS === "web" ? 400 : "90%", // Adjusted maxWidth
    width: Platform.OS === "web" ? "auto" : "90%", // Allow auto width on web
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  webDatePickerInput: { // Specific style for web <input type="date">
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    marginBottom: 20, // Increased margin
    width: "100%", // Make it full width of its container
    boxSizing: "border-box", // Include padding and border in the element's total width and height
    backgroundColor: "#f9fafb", // Light background
    color: "#1f2937", // Text color
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 20, // Increased margin
    textAlign: "center",
  },
  datePickerCloseButton: {
    backgroundColor: "#9C46CE", // Or your primary action color
    borderRadius: 8,
    paddingVertical: 12, // Standard padding
    paddingHorizontal: 16,
    alignItems: "center",
  },
  datePickerCloseText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  finalSection: {
    paddingHorizontal: 16, // Consistent with other sections
    paddingVertical: 24, // More space at the bottom
    // marginBottom: 16, // if needed before end of scroll
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
    gap: 8, // If supported, otherwise use marginLeft on icon
  },
  resourceSelectedSingle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  resourceSelectedMultiple: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937", // Ensure color is set
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff", // White footer
    borderBottomLeftRadius: Platform.OS === "web" ? 12 : 0, // Match container for web
    borderBottomRightRadius: Platform.OS === "web" ? 12 : 0,
  },
  confirmSelectionButton: {
    backgroundColor: "#10b981", // Green for confirm
    borderRadius: 12,
    paddingVertical: 14, // Adjusted padding
    paddingHorizontal: 16,
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
    shadowColor: "transparent", // No shadow when disabled
    elevation: 0,
  },
  confirmSelectionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  confirmSelectionButtonTextDisabled: {
    color: "#9ca3af", // Gray text for disabled
  },
  turbinesInfoText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 8, // Add some padding
  },
  turbinesCountText: {
    fontSize: 15,
    color: "#475569", // Darker for better readability
    marginBottom: 12, // Increased margin
    fontWeight: "500",
  },
  turbinesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  turbineInfoItem: {
    backgroundColor: "#f8fafc", // Light background for item
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    // minWidth: 90, // Can be removed if gap and content define width
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1, },
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
    borderRadius: 24, // Perfect circle
    marginRight: 12,
  },
  pilotImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6", // Lighter gray
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pilotCardWithImage: {
    flexDirection: "row",
    alignItems: "center", // Vertically align image and text block
  },
  validationMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb", // Lighter yellow
    borderRadius: 8,
    padding: 12,
    marginBottom: 16, // Consistent margin
    borderLeftWidth: 4, // Accent border
    borderLeftColor: "#f59e0b", // Warning color
  },
  validationMessageText: {
    fontSize: 14,
    color: "#b45309", // Darker warning text
    marginLeft: 10, // Increased margin
    flex: 1, // Allow text to wrap
  },
  cameraRequirementText: {
    fontSize: 14,
    color: "#78350f", // Darker amber/orange
    fontStyle: "italic",
    marginBottom: 12,
    paddingLeft: 4,
    backgroundColor: "#fffbeb", // Light warning background
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  cameraInfoText: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
    paddingLeft: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
});