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
  mockProjects,
  mockTurbines,
  mockWindParks,
} from "../../../src/mocks";
import { ProjectAssignment } from "../../../src/types/assignments";
import { Project } from "../../../src/types/projects";
import { typography } from "@/src/styles";

export default function AssignmentsScreen() {
  const params = useLocalSearchParams();
  const preselectedProjectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPilot, setSelectedPilot] = useState<string>("");
  const [selectedDrone, setSelectedDrone] = useState<string>("");
  const [selectedTurbines, setSelectedTurbines] = useState<string[]>([]);
  const [estimatedStartDate, setEstimatedStartDate] = useState<Date | null>(
    null
  );
  const [estimatedEndDate, setEstimatedEndDate] = useState<Date | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showPilotsModal, setShowPilotsModal] = useState(false);
  const [showDronesModal, setShowDronesModal] = useState(false);
  const [showTurbinesModal, setShowTurbinesModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  useEffect(() => {
    if (preselectedProjectId) {
      const project = mockProjects.find((p) => p.id === preselectedProjectId);
      if (project) {
        setSelectedProject(project);
        setSelectedTurbines([]); // Clear turbines when project is preselected
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
    setSelectedPilot(pilotId);
    setShowPilotsModal(false);
  };

  const handleDroneSelection = (droneId: string) => {
    setSelectedDrone(droneId);
    setShowDronesModal(false);
  };

  const handleTurbineSelection = (turbineId: string) => {
    setSelectedTurbines((prev) =>
      prev.includes(turbineId)
        ? prev.filter((id) => id !== turbineId)
        : [...prev, turbineId]
    );
  };
  const calculateDuration = (start: Date | null, end: Date | null) => {
    if (start && end) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setEstimatedDuration(diffDays);
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setEstimatedStartDate(selectedDate);
      calculateDuration(selectedDate, estimatedEndDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEstimatedEndDate(selectedDate);
      calculateDuration(estimatedStartDate, selectedDate);
    }
  };
  const handleConfirmAssignment = () => {
    if (!selectedProject) {
      Alert.alert("Error", "Debe seleccionar un proyecto");
      return;
    }
    if (!selectedPilot) {
      Alert.alert("Error", "Debe seleccionar un piloto");
      return;
    }
    if (!selectedDrone) {
      Alert.alert("Error", "Debe seleccionar un drone");
      return;
    }
    if (selectedTurbines.length === 0) {
      Alert.alert("Error", "Debe seleccionar al menos una turbina");
      return;
    }
    if (!estimatedStartDate || !estimatedEndDate) {
      Alert.alert("Error", "Debe especificar las fechas de inicio y fin");
      return;
    }
    const newAssignment: ProjectAssignment = {
      id: `assign_${Date.now()}`,
      projectId: selectedProject.id,
      pilotIds: [selectedPilot],
      droneIds: [selectedDrone],
      turbineIds: selectedTurbines,
      estimatedStartDate: estimatedStartDate,
      estimatedEndDate: estimatedEndDate,
      estimatedDuration: estimatedDuration,
      assignedBy: "admin_001", // Current admin user
      confirmed: false,
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
            setSelectedPilot("");
            setSelectedDrone("");
            setSelectedTurbines([]);
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
        <Ionicons name="document-text" size={24} color="#9C46CE" />
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
  const renderTurbinesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        
        <MaterialCommunityIcons
          name="wind-turbine"
          size={24}
          color={selectedProject ? "#9C46CE" : "#9ca3af"}
        />
        <Text
          style={[
            styles.sectionTitle,
            { color: selectedProject ? "#1f2937" : "#9ca3af" },
          ]}
        >
          Turbinas del Proyecto
        </Text>
      </View>

      {!selectedProject && (
        <Text style={styles.disabledSectionText}>
          Selecciona un proyecto primero para ver las turbinas disponibles
        </Text>
      )}

      {selectedProject && (
        <View style={styles.subsection}>
          <TouchableOpacity
            style={styles.resourceSelector}
            onPress={() => setShowTurbinesModal(true)}
          >
            <View style={styles.resourceSelectorContent}>
              {selectedTurbines.length > 0 ? (
                <View>
                  <Text style={styles.resourceSelectedCount}>
                    {selectedTurbines.length} turbina
                    {selectedTurbines.length > 1 ? "s" : ""} seleccionada
                    {selectedTurbines.length > 1 ? "s" : ""}
                  </Text>
                  <Text style={styles.resourceSelectedNames}>
                    {selectedTurbines
                      .map((turbineId) => {
                        const turbine = mockTurbines.find(
                          (t) => t.id === turbineId
                        );
                        return turbine?.name;
                      })
                      .join(", ")}
                  </Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>
                  Seleccionar turbinas...
                </Text>
              )}
            </View>
            <View style={styles.resourceSelectorIndicator}>
              <Text style={styles.resourceBadge}>
                {selectedTurbines.length}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderAvailabilitySection = () => (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <MaterialCommunityIcons
          name="tools"
          size={24}
          color={
            selectedProject && selectedTurbines.length > 0
              ? "#10b981"
              : "#9ca3af"
          }
        />
        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                selectedProject && selectedTurbines.length > 0
                  ? "#1f2937"
                  : "#9ca3af",
            },
          ]}
        >
          Disponibilidad de Recursos
        </Text>
      </View>

      {(!selectedProject || selectedTurbines.length === 0) && (
        <Text style={styles.disabledSectionText}>
          Selecciona un proyecto y turbinas primero para ver la disponibilidad
        </Text>
      )}

      {selectedProject && selectedTurbines.length > 0 && (
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
                {selectedPilot ? (
                  <Text style={styles.resourceSelectedSingle}>
                    {
                      availablePilots.find((p) => p.pilotId === selectedPilot)
                        ?.pilotName
                    }
                  </Text>
                ) : (
                  <Text style={styles.placeholderText}>
                    Seleccionar piloto...
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
    const hasResourcesSelected =
      selectedPilot && selectedDrone && selectedTurbines.length > 0;
    return (
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <MaterialIcons
            name="schedule"
            size={24}
            color={hasResourcesSelected ? "#f59e0b" : "#9ca3af"}
          />
          <Text
            style={[
              styles.sectionTitle,
              { color: hasResourcesSelected ? "#1f2937" : "#9ca3af" },
            ]}
          >
            Estimación de Duración y Fechas
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
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {estimatedStartDate
                      ? estimatedStartDate.toLocaleDateString()
                      : "Seleccionar fecha"}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#9C46CE" />
                </TouchableOpacity>
              </View>

              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>Fecha de Fin</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {estimatedEndDate
                      ? estimatedEndDate.toLocaleDateString()
                      : "Seleccionar fecha"}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#9C46CE" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.durationContainer}>
              <Text style={styles.inputLabel}>Duración Estimada</Text>
              <View style={styles.durationDisplay}>
                <MaterialIcons name="access-time" size={20} color="#6b7280" />
                <Text style={styles.durationText}>
                  {estimatedDuration > 0
                    ? `${estimatedDuration} días`
                    : "Seleccione fechas para calcular"}
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
                    <input
                      type="date"
                      style={{
                        padding: 12,
                        ...typography.body,
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
                        ...typography.body,
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
                  setSelectedTurbines([]); // Clear previously selected turbines when project changes
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
                selectedPilot === pilot.pilotId && styles.selectedCard,
              ]}
              onPress={() => handlePilotSelection(pilot.pilotId)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{pilot.pilotName}</Text>
                  <View style={styles.statusBadge}>
                    <View
                      style={[styles.statusDot, { backgroundColor: "#16a34a" }]}
                    />
                    <Text style={styles.statusText}>Disponible</Text>
                  </View>
                </View>
                <View style={styles.selectionIndicator}>
                  {selectedPilot === pilot.pilotId && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#10b981"
                    />
                  )}
                </View>
              </View>
              <Text style={styles.availabilityText}>
                Próximas ventanas de disponibilidad:
              </Text>
              {pilot.availability.map((window, index) => (
                <Text key={index} style={styles.availabilityWindow}>
                  {window.startDate.toLocaleDateString()} - <Text></Text>
                  {window.endDate.toLocaleDateString()}
                </Text>
              ))}
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  const renderTurbinesModal = () => {
    // Get turbines for the selected project
    const projectWindPark = selectedProject
      ? mockWindParks.find((p) => p.projectId === selectedProject.id)
      : null;
    // Only show turbines that haven't been started yet for assignment
    const availableTurbines = projectWindPark
      ? mockTurbines.filter(
          (t) =>
            t.windParkId === projectWindPark.id && t.status === "NOT_STARTED"
        )
      : [];

    return (
      <Modal
        visible={showTurbinesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTurbinesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Turbinas</Text>
            <TouchableOpacity
              onPress={() => setShowTurbinesModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            
            {availableTurbines.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No hay turbinas disponibles sin iniciar para este proyecto
                </Text>
              </View>
            ) : (
              availableTurbines.map((turbine) => (
                <TouchableOpacity
                  key={turbine.id}
                  style={[
                    styles.availabilityCard,
                    selectedTurbines.includes(turbine.id) &&
                      styles.selectedCard,
                  ]}
                  onPress={() => handleTurbineSelection(turbine.id)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{turbine.name}</Text>
                      <View style={styles.statusBadge}>
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor:
                                turbine.status === "APPROVED"
                                  ? "#16a34a"
                                  : "#f59e0b",
                            },
                          ]}
                        />
                        <Text style={styles.statusText}>
                          {turbine.status === "APPROVED"
                            ? "Aprobada"
                            : turbine.status === "INSPECTED"
                            ? "Inspeccionada"
                            : turbine.status === "PHOTOS_UPLOADED"
                            ? "Fotos Subidas"
                            : turbine.status === "NOT_STARTED"
                            ? "No Iniciada"
                            : turbine.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.selectionIndicator}>
                      {selectedTurbines.includes(turbine.id) && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#10b981"
                        />
                      )}
                    </View>
                  </View>
                  {turbine.notes && (
                    <Text style={styles.availabilityText}>{turbine.notes}</Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.confirmSelectionButton,
                selectedTurbines.length === 0 &&
                  styles.confirmSelectionButtonDisabled,
              ]}
              onPress={() => setShowTurbinesModal(false)}
              disabled={selectedTurbines.length === 0}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={selectedTurbines.length === 0 ? "#9ca3af" : "#ffffff"}
              />
              <Text
                style={[
                  styles.confirmSelectionButtonText,
                  selectedTurbines.length === 0 &&
                    styles.confirmSelectionButtonTextDisabled,
                ]}
              >
                Confirmar Selección ({selectedTurbines.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
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
        {renderDurationAndDates()}
        <View style={styles.finalSection}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedProject ||
                !selectedPilot ||
                !selectedDrone ||
                selectedTurbines.length === 0 ||
                !estimatedStartDate ||
                !estimatedEndDate) &&
                styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmAssignment}
            disabled={
              !selectedProject ||
              !selectedPilot ||
              !selectedDrone ||
              selectedTurbines.length === 0 ||
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
      {renderTurbinesModal()}
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
    paddingHorizontal: 15,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitle: {
    ...typography.heading3,
    color: "#1f2937",
    marginLeft: 8,
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
    ...typography.bodyMedium,
    marginLeft: 8,
  },
  subsectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  disabledSectionText: {
    ...typography.body,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 20,
  },
  projectSelector: {
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  projectSelectorContent: {
    flex: 1,
  },
  projectName: {
    ...typography.bodyMedium,
    color: "#1f2937",
    marginBottom: 4,
  },
  projectDescription: {
    ...typography.caption,
    color: "#6b7280",
  },
  placeholderText: {
    ...typography.body,
    color: "#9ca3af",
  },
  availabilityCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectedCard: {
    borderColor: "#9C46CE",
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
    ...typography.bodyMedium,
    color: "#1f2937",
    marginBottom: 6,
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
    ...typography.caption,
    color: "#16a34a",
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  availabilityText: {
    ...typography.caption,
    marginBottom: 8,
  },
  availabilityWindow: {
    ...typography.caption,
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
    ...typography.bodyMedium,
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    ...typography.body,
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
  durationText: {
    ...typography.bodyMedium,
    marginLeft: 8,
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
  dateButtonText: {
    ...typography.bodyMedium,
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
    ...typography.button,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  modalTitle: {
    ...typography.heading3,
    color: "#1f2937",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  projectCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectedProjectCard: {
    borderColor: "#9C46CE",
    backgroundColor: "#f8fafc",
  },
  projectCardName: {
    ...typography.bodyMedium,
    color: "#1f2937",
    marginBottom: 6,
  },
  projectCardDescription: {
    ...typography.caption,
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
    ...typography.caption,
    color: "#374151",
  },
  projectStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  projectStatusText: {
    ...typography.caption,
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
    ...typography.heading3,
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
    ...typography.bodyMedium,
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
    padding: 16,
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
    ...typography.bodyMedium,
    color: "#1f2937",
    marginBottom: 4,
  },
  resourceSelectedNames: {
    ...typography.caption,
  },
  resourceSelectedSingle: {
    ...typography.bodyMedium,
    color: "#1f2937",
  },
  resourceBadge: {
    backgroundColor: "#9C46CE",
    color: "white",
    ...typography.caption,
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
    ...typography.bodyMedium,
    color: "#9ca3af",
    textAlign: "center",
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
    ...typography.bodyMedium,
    marginLeft: 8,
  },
  confirmSelectionButtonTextDisabled: {
    color: "#9ca3af",
  },
});
