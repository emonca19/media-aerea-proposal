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

// Define the Drone type
type DroneStatus =
  | "Operativo"
  | "En Mantenimiento"
  | "Fuera de Servicio"
  | "De Baja";

interface Drone {
  id: string; // Internal unique ID
  identifier: string; // User-defined or system-generated ID shown in UI
  model: string;
  brand: string;
  status: DroneStatus;
  serialNumber?: string;
  purchaseDate?: string; // Consider using Date type if date manipulation is needed
  registrationDate: string; // Date of registration in the system
  notes?: string;
}

// Initial mock data
const INITIAL_DRONES: Drone[] = [
  {
    id: "1",
    identifier: "DRN001",
    model: "Mavic 3 Pro",
    brand: "DJI",
    status: "Operativo",
    registrationDate: new Date(2023, 0, 15).toISOString(),
    serialNumber: "DJI12345ABC",
    purchaseDate: new Date(2023, 0, 1).toISOString(),
    notes: "Cámara principal con filtro ND",
  },
  {
    id: "2",
    identifier: "DRN002",
    model: "Autel Evo II",
    brand: "Autel Robotics",
    status: "En Mantenimiento",
    registrationDate: new Date(2023, 2, 10).toISOString(),
    serialNumber: "AUT67890XYZ",
    purchaseDate: new Date(2023, 1, 20).toISOString(),
    notes: "Revisión de hélices programada.",
  },
  {
    id: "3",
    identifier: "DRN003",
    model: "Inspire 2",
    brand: "DJI",
    status: "Fuera de Servicio",
    registrationDate: new Date(2022, 5, 5).toISOString(),
    serialNumber: "DJI54321QWE",
    purchaseDate: new Date(2022, 4, 1).toISOString(),
    notes: "Batería defectuosa, pendiente de reemplazo.",
  },
];

const DronesScreen = () => {
  const [drones, setDrones] = useState<Drone[]>(INITIAL_DRONES);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);
  const [isNewDrone, setIsNewDrone] = useState(false);

  // Form state for adding/editing a drone
  const [identifier, setIdentifier] = useState("");
  const [model, setModel] = useState("");
  const [brand, setBrand] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [currentStatus, setCurrentStatus] = useState<DroneStatus>("Operativo"); // Renamed from 'status' to avoid conflict
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setIdentifier("");
    setModel("");
    setBrand("");
    setSerialNumber("");
    setPurchaseDate("");
    setCurrentStatus("Operativo");
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
    setIdentifier(drone.identifier);
    setModel(drone.model);
    setBrand(drone.brand);
    setSerialNumber(drone.serialNumber || "");
    setPurchaseDate(drone.purchaseDate || "");
    setCurrentStatus(drone.status);
    setNotes(drone.notes || "");
    setModalVisible(true);
  };

  const handleSaveDrone = () => {
    if (!identifier.trim() || !model.trim() || !brand.trim()) {
      Alert.alert("Error", "Identificador, Modelo y Marca son obligatorios.");
      return;
    }

    if (isNewDrone || !editingDrone) {
      // Adding new drone
      const newDroneData: Drone = {
        id: String(Date.now() + Math.random()), // More robust unique ID
        identifier: identifier.trim(),
        model: model.trim(),
        brand: brand.trim(),
        serialNumber: serialNumber.trim(),
        purchaseDate: purchaseDate.trim(),
        status: currentStatus,
        notes: notes.trim(),
        registrationDate: new Date().toISOString(),
      };
      setDrones((prevDrones) => [...prevDrones, newDroneData]);
    } else {
      // Editing existing drone
      setDrones((prevDrones) =>
        prevDrones.map((d) =>
          d.id === editingDrone.id
            ? {
                ...d,
                identifier: identifier.trim(),
                model: model.trim(),
                brand: brand.trim(),
                serialNumber: serialNumber.trim(),
                purchaseDate: purchaseDate.trim(),
                status: currentStatus,
                notes: notes.trim(),
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
        d.id === droneId ? { ...d, status: newStatus } : d
      )
    );
  };

  const confirmDecommissionDrone = (droneId: string) => {
    Alert.alert(
      "Confirmar Baja",
      "¿Está seguro de que desea dar de baja este drone? Esta acción cambiará su estado a 'De Baja' y se moverá al listado histórico.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Dar de Baja",
          onPress: () => handleUpdateStatus(droneId, "De Baja"),
          style: "destructive",
        },
      ]
    );
  };

  const renderDroneItem = ({ item }: { item: Drone }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>
          {item.brand} {item.model}
        </Text>
        <Text>ID: {item.identifier}</Text>
        <Text>S/N: {item.serialNumber || "N/A"}</Text>
        <Text>Estado: {item.status}</Text>
        {item.status === "De Baja" && (
          <Text style={styles.deBajaText}>(Registro Histórico)</Text>
        )}
      </View>
      <View style={styles.itemActionsContainer}>
        <TouchableOpacity
          onPress={() => handleEditDrone(item)}
          style={[styles.actionButton, styles.editButton]}
        >
          <Text style={styles.actionButtonText}>Ver/Editar</Text>
        </TouchableOpacity>
        {item.status !== "De Baja" && (
          <>
            <TouchableOpacity
              onPress={() =>
                Alert.prompt(
                  "Actualizar Estado",
                  `Drone: ${item.identifier}\nEstado actual: ${item.status}.\nNuevo estado (Operativo, En Mantenimiento, Fuera de Servicio):`,
                  (newStatusInput) => {
                    const validStatuses: DroneStatus[] = [
                      "Operativo",
                      "En Mantenimiento",
                      "Fuera de Servicio",
                    ];
                    if (
                      newStatusInput &&
                      validStatuses.includes(newStatusInput as DroneStatus)
                    ) {
                      handleUpdateStatus(
                        item.id,
                        newStatusInput as DroneStatus
                      );
                    } else if (newStatusInput) {
                      Alert.alert(
                        "Estado Inválido",
                        `Por favor ingrese uno de: ${validStatuses.join(", ")}.`
                      );
                    }
                  },
                  "plain-text",
                  item.status
                )
              }
              style={[styles.actionButton, styles.statusButton]}
            >
              <Text style={styles.actionButtonText}>Estado</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => confirmDecommissionDrone(item.id)}
              style={[styles.actionButton, styles.decommissionButton]}
            >
              <Text style={styles.actionButtonText}>Dar Baja</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const activeDrones = drones.filter((d) => d.status !== "De Baja");
  const decommissionedDrones = drones.filter((d) => d.status === "De Baja");

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Drones" }} />
      <Button title="Registrar Nuevo Drone" onPress={handleAddDrone} />

      <Text style={styles.listHeader}>
        Drones Activos ({activeDrones.length})
      </Text>
      {activeDrones.length > 0 ? (
        <FlatList
          data={activeDrones}
          renderItem={renderDroneItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      ) : (
        <Text style={styles.emptyListText}>No hay drones activos.</Text>
      )}

      <Text style={styles.listHeader}>
        Drones Históricos ({decommissionedDrones.length})
      </Text>
      {decommissionedDrones.length > 0 ? (
        <FlatList
          data={decommissionedDrones}
          renderItem={renderDroneItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      ) : (
        <Text style={styles.emptyListText}>No hay drones históricos.</Text>
      )}

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
                {isNewDrone ? "Registrar Nuevo Drone" : "Detalles del Drone"}
              </Text>

              <Text style={styles.label}>Identificador*</Text>
              <TextInput
                placeholder="Ej. DRN00X"
                value={identifier}
                onChangeText={setIdentifier}
                style={styles.input}
                editable={isNewDrone || editingDrone?.status !== "De Baja"}
              />

              <Text style={styles.label}>Marca*</Text>
              <TextInput
                placeholder="Ej. DJI"
                value={brand}
                onChangeText={setBrand}
                style={styles.input}
                editable={editingDrone?.status !== "De Baja"}
              />

              <Text style={styles.label}>Modelo*</Text>
              <TextInput
                placeholder="Ej. Mavic 3 Pro"
                value={model}
                onChangeText={setModel}
                style={styles.input}
                editable={editingDrone?.status !== "De Baja"}
              />

              <Text style={styles.label}>Número de Serie</Text>
              <TextInput
                placeholder="Ej. DJI12345ABC"
                value={serialNumber}
                onChangeText={setSerialNumber}
                style={styles.input}
                editable={editingDrone?.status !== "De Baja"}
              />

              <Text style={styles.label}>Fecha de Compra</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={purchaseDate}
                onChangeText={setPurchaseDate}
                style={styles.input}
                editable={editingDrone?.status !== "De Baja"}
              />

              <Text style={styles.label}>Estado*</Text>
              <View style={styles.statusSelector}>
                {(
                  [
                    "Operativo",
                    "En Mantenimiento",
                    "Fuera de Servicio",
                  ] as DroneStatus[]
                ).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusOption,
                      currentStatus === s && styles.statusOptionSelected,
                      editingDrone?.status === "De Baja" &&
                        styles.statusOptionDisabled,
                    ]}
                    onPress={() => setCurrentStatus(s)}
                    disabled={editingDrone?.status === "De Baja"}
                  >
                    <Text
                      style={[
                        currentStatus === s
                          ? styles.statusOptionTextSelected
                          : styles.statusOptionText,
                        editingDrone?.status === "De Baja" &&
                          styles.statusOptionTextDisabled,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {editingDrone?.status === "De Baja" && (
                <Text style={styles.deBajaTextModal}>
                  Este drone está &apos;De Baja&apos;. Su información es de solo
                  lectura y su estado no puede ser modificado.
                </Text>
              )}

              <Text style={styles.label}>Notas</Text>
              <TextInput
                placeholder="Información adicional"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
                editable={editingDrone?.status !== "De Baja"}
              />

              {!isNewDrone && editingDrone && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    ID Interno: {editingDrone.id}
                  </Text>
                  <Text style={styles.infoText}>
                    Fecha de Registro:{" "}
                    {new Date(
                      editingDrone.registrationDate
                    ).toLocaleDateString()}
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
                {editingDrone?.status !== "De Baja" && (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSaveDrone}
                  >
                    <Text style={styles.modalButtonText}>
                      {isNewDrone ? "Registrar Drone" : "Guardar Cambios"}
                    </Text>
                  </TouchableOpacity>
                )}
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
  decommissionButton: {
    backgroundColor: "#e74c3c",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  deBajaText: {
    color: "#c0392b",
    fontStyle: "italic",
    fontSize: 12,
    marginTop: 3,
  },
  deBajaTextModal: {
    color: "#c0392b",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
    padding: 8,
    backgroundColor: "#fadedb",
    borderRadius: 5,
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
  statusOptionDisabled: {
    backgroundColor: "#ecf0f1",
    borderColor: "#bdc3c7",
  },
  statusOptionTextDisabled: {
    color: "#7f8c8d",
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
