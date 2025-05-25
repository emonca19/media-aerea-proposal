import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { mockDrones } from "../../../src/mocks/drones";
import { Drone, DroneStatus } from "../../../src/types";

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
      Alert.alert("Error", "Name, Model and Manufacturer are required.");
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
  };
  const renderDroneItem = ({ item }: { item: Drone }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>
          {item.manufacturer} {item.model}
        </Text>
        <Text>Name: {item.name}</Text>
        <Text>S/N: {item.serialNumber || "N/A"}</Text>
        <Text>Status: {item.status}</Text>
        {item.assignedTo && <Text>Assigned to: {item.assignedTo}</Text>}
      </View>
      <View style={styles.itemActionsContainer}>
        <TouchableOpacity
          onPress={() => handleEditDrone(item)}
          style={[styles.actionButton, styles.editButton]}
        >
          <Text style={styles.actionButtonText}>View/Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Alert.prompt(
              "Update Status",
              `Drone: ${item.name}\nCurrent status: ${item.status}.\nNew status (AVAILABLE, IN_USE):`,
              (newStatusInput) => {
                const validStatuses: DroneStatus[] = ["AVAILABLE", "IN_USE"];
                if (
                  newStatusInput &&
                  validStatuses.includes(newStatusInput as DroneStatus)
                ) {
                  handleUpdateStatus(item.id, newStatusInput as DroneStatus);
                } else if (newStatusInput) {
                  Alert.alert(
                    "Invalid Status",
                    `Please enter one of: ${validStatuses.join(", ")}.`
                  );
                }
              },
              "plain-text",
              item.status
            )
          }
          style={[styles.actionButton, styles.statusButton]}
        >
          <Text style={styles.actionButtonText}>Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  const activeDrones = drones.filter((d) => d.status === "AVAILABLE");
  const inUseDrones = drones.filter((d) => d.status === "IN_USE");

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Drones" }} />
      <Button title="Register New Drone" onPress={handleAddDrone} />
      <Text style={styles.listHeader}>
        Available Drones ({activeDrones.length})
      </Text>
      {activeDrones.length > 0 ? (
        <FlatList
          data={activeDrones}
          renderItem={renderDroneItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      ) : (
        <Text style={styles.emptyListText}>No available drones.</Text>
      )}
      <Text style={styles.listHeader}>
        Drones In Use ({inUseDrones.length})
      </Text>
      {inUseDrones.length > 0 ? (
        <FlatList
          data={inUseDrones}
          renderItem={renderDroneItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      ) : (
        <Text style={styles.emptyListText}>No drones currently in use.</Text>
      )}
      <Text> </Text>
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
              <Text style={styles.modalTitle}>
                {isNewDrone ? "Register New Drone" : "Drone Details"}
              </Text>

              <Text style={styles.label}>Name*</Text>
              <TextInput
                placeholder="e.g. DJI Mavic 3 - Unit 001"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />

              <Text style={styles.label}>Manufacturer*</Text>
              <TextInput
                placeholder="e.g. DJI"
                value={manufacturer}
                onChangeText={setManufacturer}
                style={styles.input}
              />

              <Text style={styles.label}>Model*</Text>
              <TextInput
                placeholder="e.g. Mavic 3 Pro"
                value={model}
                onChangeText={setModel}
                style={styles.input}
              />

              <Text style={styles.label}>Serial Number</Text>
              <TextInput
                placeholder="e.g. DJI12345ABC"
                value={serialNumber}
                onChangeText={setSerialNumber}
                style={styles.input}
              />

              <Text style={styles.label}>Acquisition Date</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={acquisitionDate}
                onChangeText={setAcquisitionDate}
                style={styles.input}
              />

              <Text style={styles.label}>Assigned To</Text>
              <TextInput
                placeholder="Pilot ID (optional)"
                value={assignedTo}
                onChangeText={setAssignedTo}
                style={styles.input}
              />

              <Text style={styles.label}>Status*</Text>
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
                      style={[
                        currentStatus === s
                          ? styles.statusOptionTextSelected
                          : styles.statusOptionText,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Notes</Text>
              <TextInput
                placeholder="Additional information"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
              />

              {!isNewDrone && editingDrone && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    Internal ID: {editingDrone.id}
                  </Text>
                  <Text style={styles.infoText}>
                    Created: {editingDrone.createdAt.toLocaleDateString()}
                  </Text>
                  <Text style={styles.infoText}>
                    Last Updated: {editingDrone.updatedAt.toLocaleDateString()}
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
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveDrone}
                >
                  <Text style={styles.modalButtonText}>
                    {isNewDrone ? "Register Drone" : "Save Changes"}
                  </Text>
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
    padding: 16,
    backgroundColor: "#ffffff",
  },
  listHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
    color: "#333",
  },
  list: {
    // maxHeight: '40%', // Limit height if needed
  },
  emptyListText: {
    textAlign: "center",
    color: "#777",
    marginVertical: 10,
    fontStyle: "italic",
  },
  itemContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 2,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2c3e50",
  },
  itemActionsContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  actionButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginVertical: 3, // Adjusted margin
    minWidth: 80,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#3498db",
  },
  statusButton: {
    backgroundColor: "#f39c12",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
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
    borderRadius: 15,
    padding: 20,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    maxHeight: "85%",
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  label: {
    fontSize: 15,
    marginBottom: 5,
    color: "#555",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    fontSize: 15,
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
    paddingHorizontal: 10, // Adjusted for smaller screens
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#3498db",
    flex: 1, // Make options take equal width
    marginHorizontal: 3, // Add some space between options
    alignItems: "center", // Center text
  },
  statusOptionSelected: {
    backgroundColor: "#3498db",
  },
  statusOptionText: {
    color: "#3498db",
    fontSize: 12, // Adjusted font size
    fontWeight: "500",
  },
  statusOptionTextSelected: {
    color: "#fff",
    fontSize: 12, // Adjusted font size
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
  },
  saveButton: {
    backgroundColor: "#2ecc71",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
});

export default DronesScreen;
