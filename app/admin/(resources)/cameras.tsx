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
import { mockCameras } from "../../../src/mocks/cameras";
import { Camera, CameraStatus } from "../../../src/types";

// Helper function to translate camera status to Spanish
const getStatusDisplayText = (status: CameraStatus): string => {
  switch (status) {
    case "AVAILABLE":
      return "Disponible";
    case "IN_USE":
      return "En Uso";
    case "MAINTENANCE":
      return "Mantenimiento";
    default:
      return status;
  }
};

const CamerasScreen = () => {
  const [cameras, setCameras] = useState<Camera[]>(mockCameras);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [isNewCamera, setIsNewCamera] = useState(false);

  // Form state for adding/editing a camera
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [currentStatus, setCurrentStatus] = useState<CameraStatus>("AVAILABLE");
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
    setEditingCamera(null);
    setIsNewCamera(false);
  };

  const handleAddCamera = () => {
    resetForm();
    setIsNewCamera(true);
    setModalVisible(true);
  };

  const handleEditCamera = (camera: Camera) => {
    resetForm();
    setIsNewCamera(false);
    setEditingCamera(camera);
    setName(camera.name);
    setModel(camera.model);
    setManufacturer(camera.manufacturer);
    setSerialNumber(camera.serialNumber);
    setAcquisitionDate(camera.acquisitionDate.toISOString().split("T")[0]);
    setCurrentStatus(camera.status);
    setAssignedTo(camera.assignedTo || "");
    setNotes(camera.notes || "");
    setModalVisible(true);
  };

  const handleSaveCamera = () => {
    if (!name.trim() || !model.trim() || !manufacturer.trim()) {
      Alert.alert("Error", "Nombre, Modelo y Fabricante son requeridos.");
      return;
    }

    if (isNewCamera || !editingCamera) {
      // Adding new camera
      const newCameraData: Camera = {
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
      setCameras((prevCameras) => [...prevCameras, newCameraData]);
    } else {
      // Editing existing camera
      setCameras((prevCameras) =>
        prevCameras.map((c) =>
          c.id === editingCamera.id
            ? {
                ...c,
                name: name.trim(),
                model: model.trim(),
                manufacturer: manufacturer.trim(),
                serialNumber: serialNumber.trim(),
                acquisitionDate: acquisitionDate
                  ? new Date(acquisitionDate)
                  : c.acquisitionDate,
                status: currentStatus,
                assignedTo: assignedTo.trim() || undefined,
                notes: notes.trim() || undefined,
                updatedAt: new Date(),
              }
            : c
        )
      );
    }
    setModalVisible(false);
    resetForm();
  };

  const handleUpdateStatus = (cameraId: string, newStatus: CameraStatus) => {
    setCameras((prevCameras) =>
      prevCameras.map((c) =>
        c.id === cameraId
          ? { ...c, status: newStatus, updatedAt: new Date() }
          : c
      )
    );
  };

  const renderCameraItem = ({ item }: { item: Camera }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>
          {item.manufacturer} {item.model}
        </Text>
        <Text>Nombre: {item.name}</Text>
        <Text>N/S: {item.serialNumber || "N/A"}</Text>
        <Text>Estado: {getStatusDisplayText(item.status)}</Text>
        {item.assignedTo && <Text>Asignado a: {item.assignedTo}</Text>}
      </View>
      <View style={styles.itemActionsContainer}>
        <TouchableOpacity
          onPress={() => handleEditCamera(item)}
          style={[styles.actionButton, styles.editButton]}
        >
          <Text style={styles.actionButtonText}>Ver/Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Alert.prompt(
              "Actualizar Estado",
              `Cámara: ${item.name}\nEstado actual: ${getStatusDisplayText(
                item.status
              )}.\nNuevo estado (AVAILABLE, IN_USE, MAINTENANCE):`,
              (newStatusInput) => {
                const validStatuses: CameraStatus[] = ["AVAILABLE", "IN_USE", "MAINTENANCE"];
                if (
                  newStatusInput &&
                  validStatuses.includes(newStatusInput as CameraStatus)
                ) {
                  handleUpdateStatus(item.id, newStatusInput as CameraStatus);
                } else if (newStatusInput) {
                  Alert.alert(
                    "Estado Inválido",
                    `Por favor ingresa uno de: ${validStatuses.join(", ")}.`
                  );
                }
              },
              "plain-text",
              getStatusDisplayText(item.status)
            )
          }
          style={[styles.actionButton, styles.statusButton]}
        >
          <Text style={styles.actionButtonText}>Estado</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  const availableCameras = cameras.filter((c) => c.status === "AVAILABLE");
  const inUseCameras = cameras.filter((c) => c.status === "IN_USE");

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Cámaras" }} />
      <Button title="Registrar Nueva Cámara" onPress={handleAddCamera} />
      
      <Text style={styles.listHeader}>
        Cámaras Disponibles ({availableCameras.length})
      </Text>
      {availableCameras.length > 0 ? (
        <FlatList
          data={availableCameras}
          renderItem={renderCameraItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      ) : (
        <Text style={styles.emptyListText}>No hay cámaras disponibles.</Text>
      )}

      <Text style={styles.listHeader}>
        Cámaras En Uso ({inUseCameras.length})
      </Text>
      {inUseCameras.length > 0 ? (
        <FlatList
          data={inUseCameras}
          renderItem={renderCameraItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />      ) : (
        <Text style={styles.emptyListText}>
          No hay cámaras actualmente en uso.
        </Text>
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
                {isNewCamera ? "Registrar Nueva Cámara" : "Detalles de la Cámara"}
              </Text>

              <Text style={styles.label}>Nombre*</Text>
              <TextInput
                placeholder="e.g. DJI Zenmuse H20T"
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
                placeholder="e.g. Zenmuse H20T"
                value={model}
                onChangeText={setModel}
                style={styles.input}
              />

              <Text style={styles.label}>Número de Serie</Text>
              <TextInput
                placeholder="e.g. ZH20T001234567"
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
                {(["AVAILABLE", "IN_USE", "MAINTENANCE"] as CameraStatus[]).map((s) => (
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

              {!isNewCamera && editingCamera && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    ID Interno: {editingCamera.id}
                  </Text>
                  <Text style={styles.infoText}>
                    Creado: {editingCamera.createdAt.toLocaleDateString()}
                  </Text>
                  <Text style={styles.infoText}>
                    Última Actualización:{" "}
                    {editingCamera.updatedAt.toLocaleDateString()}
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
                  onPress={handleSaveCamera}
                >
                  <Text style={styles.modalButtonText}>
                    {isNewCamera ? "Registrar Cámara" : "Guardar Cambios"}
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
    marginVertical: 3,
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

export default CamerasScreen;
