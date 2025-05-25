import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
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
import { mockDrones, mockProjects, mockUsers } from "../../../src/mocks/index"; // Mock data for mockProjects, drones, and pilots

interface Assignment {
  id: string;
  projectId: string;
  pilotId: string;
  droneId: string;
  startDate: Date;
  endDate: Date;
  estimatedDuration: number; // in hours
  status: "pending" | "confirmed" | "in-progress" | "completed";
}

interface DroneAvailability {
  droneId: string;
  status: "available" | "in-use" | "maintenance" | "unavailable";
  nextAvailable?: Date;
}

interface PilotAvailability {
  pilotId: string;
  status: "available" | "busy" | "on-leave";
  busyUntil?: Date;
}

const AssignmentPlanning: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedPilot, setSelectedPilot] = useState<string>("");
  const [selectedDrone, setSelectedDrone] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [estimatedDuration, setEstimatedDuration] = useState<string>("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Mock availability data
  const [droneAvailability] = useState<DroneAvailability[]>([
    { droneId: "1", status: "available" },
    {
      droneId: "2",
      status: "in-use",
      nextAvailable: new Date(Date.now() + 86400000),
    },
    { droneId: "3", status: "available" },
    {
      droneId: "4",
      status: "maintenance",
      nextAvailable: new Date(Date.now() + 172800000),
    },
  ]);

  const [pilotAvailability] = useState<PilotAvailability[]>([
    { pilotId: "1", status: "available" },
    {
      pilotId: "2",
      status: "busy",
      busyUntil: new Date(Date.now() + 86400000),
    },
    { pilotId: "3", status: "available" },
    { pilotId: "4", status: "on-leave" },
  ]);

  useEffect(() => {
    // Auto-adjust end date when start date or duration changes
    if (estimatedDuration && !isNaN(Number(estimatedDuration))) {
      const duration = Number(estimatedDuration);
      const newEndDate = new Date(
        startDate.getTime() + duration * 60 * 60 * 1000
      );
      setEndDate(newEndDate);
    }
  }, [startDate, estimatedDuration]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "#4CAF50";
      case "in-use":
      case "busy":
        return "#FF9800";
      case "maintenance":
      case "on-leave":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "in-use":
        return "En Uso";
      case "busy":
        return "Ocupado";
      case "maintenance":
        return "Mantenimiento";
      case "on-leave":
        return "En Licencia";
      default:
        return "No Disponible";
    }
  };

  const getDroneAvailability = (droneId: string) => {
    return (
      droneAvailability.find((da) => da.droneId === droneId) || {
        droneId,
        status: "unavailable",
      }
    );
  };

  const getPilotAvailability = (pilotId: string) => {
    return (
      pilotAvailability.find((pa) => pa.pilotId === pilotId) || {
        pilotId,
        status: "available",
      }
    );
  };

  const validateAssignment = (): boolean => {
    if (!selectedProject) {
      Alert.alert("Error", "Por favor selecciona un proyecto");
      return false;
    }
    if (!selectedPilot) {
      Alert.alert("Error", "Por favor selecciona un piloto");
      return false;
    }
    if (!selectedDrone) {
      Alert.alert("Error", "Por favor selecciona un dron");
      return false;
    }
    if (!estimatedDuration || isNaN(Number(estimatedDuration))) {
      Alert.alert("Error", "Por favor ingresa una duración válida");
      return false;
    }

    const pilotAvail = getPilotAvailability(selectedPilot);
    const droneAvail = getDroneAvailability(selectedDrone);

    if (pilotAvail.status !== "available") {
      Alert.alert("Error", "El piloto seleccionado no está disponible");
      return false;
    }
    if (droneAvail.status !== "available") {
      Alert.alert("Error", "El dron seleccionado no está disponible");
      return false;
    }

    return true;
  };

  const handleConfirmAssignment = () => {
    if (!validateAssignment()) return;

    const assignment: Assignment = {
      id: Date.now().toString(),
      projectId: selectedProject,
      pilotId: selectedPilot,
      droneId: selectedDrone,
      startDate,
      endDate,
      estimatedDuration: Number(estimatedDuration),
      status: "pending",
    };

    // TODO: Save assignment to backend/state management
    console.log("Assignment created:", assignment);

    Alert.alert(
      "Asignación Confirmada",
      "La asignación ha sido creada exitosamente",
      [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setSelectedProject("");
            setSelectedPilot("");
            setSelectedDrone("");
            setEstimatedDuration("");
            setStartDate(new Date());
            setEndDate(new Date());
          },
        },
      ]
    );
  };

  const renderProjectSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Selección de Proyecto</Text>
      <TouchableOpacity
        style={styles.projectSelector}
        onPress={() => setShowProjectModal(true)}
      >
        <Text style={styles.projectSelectorText}>
          {selectedProject
            ? mockProjects.find((p) => p.id === selectedProject)?.name ||
              "Seleccionar Proyecto"
            : "Seleccionar Proyecto"}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderPilotAvailability = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Disponibilidad de Pilotos</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "list" && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode("list")}
          >
            <Ionicons
              name="list"
              size={16}
              color={viewMode === "list" ? "#fff" : "#666"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "calendar" && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode("calendar")}
          >
            <Ionicons
              name="calendar"
              size={16}
              color={viewMode === "calendar" ? "#fff" : "#666"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {mockUsers.map((pilot) => {
          const availability = getPilotAvailability(pilot.id);
          return (
            <TouchableOpacity
              key={pilot.id}
              style={[
                styles.availabilityCard,
                selectedPilot === pilot.id && styles.selectedCard,
              ]}
              onPress={() =>
                availability.status === "available" &&
                setSelectedPilot(pilot.id)
              }
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{pilot.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(availability.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(availability.status)}
                  </Text>
                </View>
              </View>
              {availability.busyUntil && (
                <Text style={styles.busyUntil}>
                  Disponible: {availability.busyUntil.toLocaleDateString()}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderDroneAvailability = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Disponibilidad de Drones</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {mockDrones.map((drone) => {
          const availability = getDroneAvailability(drone.id);
          return (
            <TouchableOpacity
              key={drone.id}
              style={[
                styles.availabilityCard,
                selectedDrone === drone.id && styles.selectedCard,
              ]}
              onPress={() =>
                availability.status === "available" &&
                setSelectedDrone(drone.id)
              }
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{drone.model}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(availability.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(availability.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardSubtitle}>
                Serie: {drone.serialNumber}
              </Text>
              {availability.nextAvailable && (
                <Text style={styles.busyUntil}>
                  Disponible: {availability.nextAvailable.toLocaleDateString()}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderDateTimeSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Planificación de Fechas</Text>

      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={styles.fieldLabel}>Fecha de Inicio</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {startDate.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.dateField}>
          <Text style={styles.fieldLabel}>Duración Estimada (horas)</Text>
          <TextInput
            style={styles.durationInput}
            value={estimatedDuration}
            onChangeText={setEstimatedDuration}
            placeholder="8"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.dateField}>
        <Text style={styles.fieldLabel}>Fecha de Finalización</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {endDate.toLocaleDateString()}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
        <Text style={styles.header}>
          Asigna recursos para proyectos
        </Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProjectSelector()}
        {renderPilotAvailability()}
        {renderDroneAvailability()}
        {renderDateTimeSection()}

        <LinearGradient
          colors={["#4CAF50", "#45a049"]}
          style={styles.confirmButton}
        >
          <TouchableOpacity
            style={styles.confirmButtonInner}
            onPress={handleConfirmAssignment}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.confirmButtonText}>Confirmar Asignación</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>

      {/* Project Selection Modal */}
      <Modal
        visible={showProjectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Proyecto</Text>
              <TouchableOpacity onPress={() => setShowProjectModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {mockProjects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectOption}
                  onPress={() => {
                    setSelectedProject(project.id);
                    setShowProjectModal(false);
                  }}
                >
                  <Text style={styles.projectOptionTitle}>{project.name}</Text>
                  <Text style={styles.projectOptionSubtitle}>
                    {project.description}
                  </Text>
                  <Text style={styles.projectOptionDetails}></Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  header: {
    fontSize: 16,
    color: "#000000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  toggleButtonActive: {
    backgroundColor: "#2a5298",
  },
  projectSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#f9f9f9",
  },
  projectSelectorText: {
    fontSize: 16,
    color: "#333",
  },
  horizontalScroll: {
    marginTop: 10,
  },
  availabilityCard: {
    width: 200,
    marginRight: 15,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: "#2a5298",
    backgroundColor: "#e3f2fd",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  busyUntil: {
    fontSize: 12,
    color: "#FF9800",
    fontStyle: "italic",
    marginTop: 5,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateField: {
    flex: 1,
    marginRight: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#fff",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  durationInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  confirmButton: {
    borderRadius: 12,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  confirmButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    padding: 20,
  },
  projectOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  projectOptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  projectOptionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  projectOptionDetails: {
    fontSize: 12,
    color: "#999",
  },
});

export default AssignmentPlanning;
