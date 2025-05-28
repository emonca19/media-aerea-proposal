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
import { mockDrones } from "../../../src/mocks/drones";
import { Drone } from "../../../src/types";
import { DroneStatus } from "../../../src/types/common";

// Helper function to translate drone status to Spanish
const getStatusDisplayText = (status: DroneStatus): string => {
  switch (status) {
    case "AVAILABLE":
      return "Disponible";
    case "IN_USE":
      return "En Uso";
    default:
      return status;
  }
};

const DronesScreen = () => {
  const [drones, setDrones] = useState<Drone[]>(mockDrones);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);
  const [isNewDrone, setIsNewDrone] = useState(false);

  // Form state for adding/editing a drone
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [currentStatus, setCurrentStatus] = useState<DroneStatus>("AVAILABLE");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");

  // Status update modal state
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedDroneForStatusUpdate, setSelectedDroneForStatusUpdate] =
    useState<Drone | null>(null);

  // Section expand/collapse state
  const [expandedSections, setExpandedSections] = useState({
    available: true,
    inUse: true,
  });

  const toggleSection = (section: "available" | "inUse") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const resetForm = () => {
    setName("");
    setModel("");
    setManufacturer("");
    setSerialNumber("");
    setAcquisitionDate("");
    setCurrentStatus("AVAILABLE");
    setAssignedTo("");
    setNotes("");
    setEditingDrone(null);
    setIsNewDrone(false);
  };

  const handleAddDrone = () => {
    resetForm();
    setIsNewDrone(true);
    setModalVisible(true);
  };

  const handleEditDrone = (drone: Drone) => {
    resetForm();
    setIsNewDrone(false);
    setEditingDrone(drone);
    setName(drone.name);
    setModel(drone.model);
    setManufacturer(drone.manufacturer);
    setSerialNumber(drone.serialNumber);
    setAcquisitionDate(drone.acquisitionDate.toISOString().split("T")[0]);
    setCurrentStatus(drone.status);
    setAssignedTo(drone.assignedTo || "");
    setNotes(drone.notes || "");
    setModalVisible(true);
  };

  const handleSaveDrone = () => {
    if (!name.trim() || !model.trim() || !manufacturer.trim()) {
      Alert.alert("Error", "Nombre, Modelo y Fabricante son requeridos.");
      return;
    }

    if (isNewDrone || !editingDrone) {
      // Adding new drone
      const newDroneData: Drone = {
        id: String(Date.now() + Math.random()),
        name: name.trim(),
        model: model.trim(),
        manufacturer: manufacturer.trim(),
        serialNumber: serialNumber.trim(),
        acquisitionDate: acquisitionDate
          ? new Date(acquisitionDate)
          : new Date(),
        status: currentStatus,
        assignedTo: assignedTo.trim() || undefined,
        notes: notes.trim() || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setDrones((prevDrones) => [...prevDrones, newDroneData]);
    } else {
      // Editing existing drone
      setDrones((prevDrones) =>
        prevDrones.map((d) =>
          d.id === editingDrone.id
            ? {
                ...d,
                name: name.trim(),
                model: model.trim(),
                manufacturer: manufacturer.trim(),
                serialNumber: serialNumber.trim(),
                acquisitionDate: acquisitionDate
                  ? new Date(acquisitionDate)
                  : d.acquisitionDate,
                status: currentStatus,
                assignedTo: assignedTo.trim() || undefined,
                notes: notes.trim() || undefined,
                updatedAt: new Date(),
              }
            : d
        )
      );
    }
    setModalVisible(false);
    resetForm();
  };

  const handleUpdateStatus = (droneId: string, newStatus: DroneStatus) => {
    setDrones((prevDrones) =>
      prevDrones.map((d) =>
        d.id === droneId
          ? { ...d, status: newStatus, updatedAt: new Date() }
          : d
      )
    );
    setStatusModalVisible(false);
    setSelectedDroneForStatusUpdate(null);
  };

  const handleOpenStatusModal = (drone: Drone) => {
    setSelectedDroneForStatusUpdate(drone);
    setStatusModalVisible(true);
  };

  const renderDroneItem = ({ item }: { item: Drone }) => (
    <View style={styles.droneCard}>
      <View style={styles.droneHeader}>
        <View style={styles.droneInfo}>
          <Text style={styles.droneTitle}>
            {item.manufacturer} {item.model}
          </Text>
          <Text style={styles.droneSubtitle}>{item.name}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === "AVAILABLE"
              ? styles.availableBadge
              : styles.inUseBadge,
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              item.status === "AVAILABLE"
                ? styles.availableText
                : styles.inUseText,
            ]}
          >
            {getStatusDisplayText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.droneDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="barcode-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            N/S: {item.serialNumber || "N/A"}
          </Text>
        </View>
        {item.assignedTo && (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.detailText}>Asignado a: {item.assignedTo}</Text>
          </View>
        )}
      </View>

      <View style={styles.droneActions}>
        <TouchableOpacity
          onPress={() => handleEditDrone(item)}
          style={[styles.actionBtn, styles.editBtn]}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.actionBtnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleOpenStatusModal(item)}
          style={[styles.actionBtn, styles.statusBtn]}
        >
          <Ionicons name="swap-horizontal-outline" size={16} color="#fff" />
          <Text style={styles.actionBtnText}>Estado</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const availableDrones = drones.filter((d) => d.status === "AVAILABLE");
  const inUseDrones = drones.filter((d) => d.status === "IN_USE");
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Drones" }} />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Available Drones Section */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("available")}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.sectionTitle}>Disponibles</Text>
            </View>
            <View style={styles.sectionHeaderRight}>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{availableDrones.length}</Text>
              </View>
              <Ionicons
                name={
                  expandedSections.available ? "chevron-up" : "chevron-down"
                }
                size={20}
                color="#64748B"
                style={styles.chevronIcon}
              />
            </View>
          </TouchableOpacity>

          {expandedSections.available && (
            <>
              {availableDrones.length > 0 ? (
                <View style={styles.cardsContainer}>
                  {availableDrones.map((drone) =>
                    renderDroneItem({ item: drone })
                  )}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="airplane-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyText}>
                    No hay drones disponibles
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* In Use Drones Section */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("inUse")}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="play-circle" size={24} color="#F59E0B" />
              <Text style={styles.sectionTitle}>En Uso</Text>
            </View>
            <View style={styles.sectionHeaderRight}>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{inUseDrones.length}</Text>
              </View>
              <Ionicons
                name={expandedSections.inUse ? "chevron-up" : "chevron-down"}
                size={20}
                color="#64748B"
                style={styles.chevronIcon}
              />
            </View>
          </TouchableOpacity>
          {expandedSections.inUse && (
            <>
              {inUseDrones.length > 0 ? (
                <View style={styles.cardsContainer}>
                  {inUseDrones.map((drone) => renderDroneItem({ item: drone }))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="airplane-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No hay drones en uso</Text>
                </View>
              )}
            </>
          )}{" "}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddDrone}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          resetForm();
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView style={{ width: "100%" }}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isNewDrone ? "Registrar Nuevo Dron" : "Detalles del Dron"}
                </Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Nombre*</Text>
              <TextInput
                placeholder="e.g. DJI Mavic 3 - Unit 001"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />

              <Text style={styles.label}>Fabricante*</Text>
              <TextInput
                placeholder="e.g. DJI"
                value={manufacturer}
                onChangeText={setManufacturer}
                style={styles.input}
              />

              <Text style={styles.label}>Modelo*</Text>
              <TextInput
                placeholder="e.g. Mavic 3 Pro"
                value={model}
                onChangeText={setModel}
                style={styles.input}
              />

              <Text style={styles.label}>Número de Serie</Text>
              <TextInput
                placeholder="e.g. DJI12345ABC"
                value={serialNumber}
                onChangeText={setSerialNumber}
                style={styles.input}
              />

              <Text style={styles.label}>Fecha de Adquisición</Text>
              <TextInput
                placeholder="AAAA-MM-DD"
                value={acquisitionDate}
                onChangeText={setAcquisitionDate}
                style={styles.input}
              />

              <Text style={styles.label}>Asignado A</Text>
              <TextInput
                placeholder="ID del Piloto (opcional)"
                value={assignedTo}
                onChangeText={setAssignedTo}
                style={styles.input}
              />

              <Text style={styles.label}>Estado*</Text>
              <View style={styles.statusSelector}>
                {(["AVAILABLE", "IN_USE"] as DroneStatus[]).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusOption,
                      currentStatus === s && styles.statusOptionSelected,
                    ]}
                    onPress={() => setCurrentStatus(s)}
                  >
                    <Text
                      style={
                        currentStatus === s
                          ? styles.statusOptionTextSelected
                          : styles.statusOptionText
                      }
                    >
                      {getStatusDisplayText(s)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Notas</Text>
              <TextInput
                placeholder="Información adicional"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
              />

              {!isNewDrone && editingDrone && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    ID Interno: {editingDrone.id}
                  </Text>
                  <Text style={styles.infoText}>
                    Creado: {editingDrone.createdAt.toLocaleDateString()}
                  </Text>
                  <Text style={styles.infoText}>
                    Última Actualización:
                    {editingDrone.updatedAt.toLocaleDateString()}
                  </Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveDrone}
                >
                  <Text style={styles.modalButtonText}>
                    {isNewDrone ? "Registrar Dron" : "Guardar Cambios"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={statusModalVisible}
        onRequestClose={() => {
          setStatusModalVisible(false);
          setSelectedDroneForStatusUpdate(null);
        }}
      >
        <View style={styles.statusModalCenteredView}>
          <View style={styles.statusModalView}>
            {selectedDroneForStatusUpdate && (
              <>
                <Text style={styles.statusModalTitle}>Actualizar Estado</Text>
                <Text style={styles.statusModalSubtitle}>
                  {selectedDroneForStatusUpdate.manufacturer}
                  {selectedDroneForStatusUpdate.model}
                </Text>
                <Text style={styles.statusModalDroneName}>
                  {selectedDroneForStatusUpdate.name}
                </Text>

                <Text style={styles.statusModalCurrentLabel}>
                  Estado actual:
                </Text>
                <View
                  style={[
                    styles.currentStatusBadge,
                    selectedDroneForStatusUpdate.status === "AVAILABLE"
                      ? styles.availableBadge
                      : styles.inUseBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.currentStatusText,
                      selectedDroneForStatusUpdate.status === "AVAILABLE"
                        ? styles.availableText
                        : styles.inUseText,
                    ]}
                  >
                    {getStatusDisplayText(selectedDroneForStatusUpdate.status)}
                  </Text>
                </View>

                <Text style={styles.statusModalSelectLabel}>
                  Seleccionar nuevo estado:
                </Text>
                <View style={styles.statusOptionsContainer}>
                  {(["AVAILABLE", "IN_USE"] as DroneStatus[]).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOptionButton,
                        status === "AVAILABLE"
                          ? styles.availableOptionButton
                          : styles.inUseOptionButton,
                        selectedDroneForStatusUpdate.status === status &&
                          styles.disabledStatusOption,
                      ]}
                      onPress={() =>
                        handleUpdateStatus(
                          selectedDroneForStatusUpdate.id,
                          status
                        )
                      }
                      disabled={selectedDroneForStatusUpdate.status === status}
                    >
                      <Ionicons
                        name={
                          status === "AVAILABLE"
                            ? "checkmark-circle"
                            : "play-circle"
                        }
                        size={20}
                        color={
                          selectedDroneForStatusUpdate.status === status
                            ? "#9CA3AF"
                            : "#fff"
                        }
                      />
                      <Text
                        style={[
                          styles.statusOptionButtonText,
                          selectedDroneForStatusUpdate.status === status &&
                            styles.disabledStatusOptionText,
                        ]}
                      >
                        {getStatusDisplayText(status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.statusModalCancelButton}
                  onPress={() => {
                    setStatusModalVisible(false);
                    setSelectedDroneForStatusUpdate(null);
                  }}
                >
                  <Text style={styles.statusModalCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
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
    borderRadius: 8,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevronIcon: {
    marginLeft: 8,
    opacity: 0.7,
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
  droneCard: {
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
  droneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  droneInfo: {
    flex: 1,
    marginRight: 12,
  },
  droneTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  droneSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  availableBadge: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  inUseBadge: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  availableText: {
    color: "#059669",
  },
  inUseText: {
    color: "#D97706",
  },
  droneDetails: {
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
  droneActions: {
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
  statusBtn: {
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
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
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
  infoBox: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#eaf2f8",
    borderRadius: 5,
    borderColor: "#d4e6f1",
    borderWidth: 1,
  },
  infoText: {
    fontSize: 13,
    color: "#2874a6",
  },
  // Status Update Modal Styles
  statusModalCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  statusModalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    width: "85%",
    maxWidth: 400,
  },
  statusModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  statusModalSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
    textAlign: "center",
  },
  statusModalDroneName: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 20,
    textAlign: "center",
  },
  statusModalCurrentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  currentStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    alignSelf: "center",
  },
  currentStatusText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  statusModalSelectLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  statusOptionsContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  statusOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  availableOptionButton: {
    backgroundColor: "#10B981",
  },
  inUseOptionButton: {
    backgroundColor: "#F59E0B",
  },
  disabledStatusOption: {
    backgroundColor: "#E5E7EB",
    shadowOpacity: 0,
    elevation: 0,
  },
  statusOptionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledStatusOptionText: {
    color: "#9CA3AF",
  },
  statusModalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  statusModalCancelText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DronesScreen;
