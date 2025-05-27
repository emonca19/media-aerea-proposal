import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
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
import { mockClients, mockWindParks } from "../../../src/mocks";

export default function CreateProjectScreen() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [windParkId, setWindParkId] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);
  const [showWindParkModal, setShowWindParkModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleClientSelection = (selectedClientId: string) => {
    setClientId(selectedClientId);
    setShowClientModal(false);
  };
  const handleWindParkSelection = (selectedWindParkId: string) => {
    setWindParkId(selectedWindParkId);
    setShowWindParkModal(false);
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleSaveProject = () => {
    // Validation
    if (!projectName.trim()) {
      Alert.alert("Error", "El nombre del proyecto es requerido");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "La descripción del proyecto es requerida");
      return;
    }
    if (!clientId) {
      Alert.alert("Error", "Debe seleccionar un cliente");
      return;
    }
    if (!windParkId) {
      Alert.alert("Error", "Debe seleccionar un parque eólico");
      return;
    }
    if (!startDate) {
      Alert.alert("Error", "La fecha de inicio es requerida");
      return;
    }
    if (!endDate) {
      Alert.alert("Error", "La fecha de fin es requerida");
      return;
    }

    // Here you would typically save to your backend/database
    Alert.alert(
      "Proyecto Creado",
      `El proyecto "${projectName}" ha sido creado exitosamente.`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Crear Proyecto",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#9C46CE" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSaveProject}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Project Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Proyecto*</Text>
            <TextInput
              style={styles.input}
              value={projectName}
              onChangeText={setProjectName}
              placeholder="Ingresa el nombre del proyecto"
              placeholderTextColor="#9ca3af"
            />
          </View>
          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción*</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe el proyecto"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          {/* Client Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cliente*</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowClientModal(true)}
            >
              <View style={styles.selectorContent}>
                {clientId ? (
                  <Text style={styles.selectedText}>
                    {mockClients.find((c) => c.id === clientId)?.name}
                  </Text>
                ) : (
                  <Text style={styles.placeholderText}>
                    Selecciona un cliente
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          {/* Wind Park Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Parque Eólico*</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowWindParkModal(true)}
            >
              <View style={styles.selectorContent}>
                {windParkId ? (
                  <Text style={styles.selectedText}>
                    {mockWindParks.find((wp) => wp.id === windParkId)?.name}
                  </Text>
                ) : (
                  <Text style={styles.placeholderText}>
                    Selecciona un parque eólico
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          {/* Start Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de Inicio*</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {startDate
                  ? startDate.toLocaleDateString()
                  : "Seleccionar fecha de inicio"}
              </Text>
              <Ionicons name="calendar" size={20} color="#9C46CE" />
            </TouchableOpacity>
          </View>
          {/* End Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de Fin*</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {endDate
                  ? endDate.toLocaleDateString()
                  : "Seleccionar fecha de fin"}
              </Text>
              <Ionicons name="calendar" size={20} color="#9C46CE" />
            </TouchableOpacity>
          </View>
          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notas</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notas adicionales sobre el proyecto"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              <Text>Los campos marcados con * son obligatorios</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Client Selection Modal */}
      <Modal
        visible={showClientModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowClientModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
            <TouchableOpacity
              onPress={() => setShowClientModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {mockClients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={[
                  styles.optionCard,
                  clientId === client.id && styles.selectedCard,
                ]}
                onPress={() => handleClientSelection(client.id)}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{client.name}</Text>
                    <Text style={styles.cardDescription}>
                      {client.contactInfo.email}
                    </Text>
                  </View>
                  <View style={styles.selectionIndicator}>
                    {clientId === client.id && (
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

      {/* Wind Park Selection Modal */}
      <Modal
        visible={showWindParkModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWindParkModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Parque Eólico</Text>
            <TouchableOpacity
              onPress={() => setShowWindParkModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {mockWindParks.map((windPark) => (
              <TouchableOpacity
                key={windPark.id}
                style={[
                  styles.optionCard,
                  windParkId === windPark.id && styles.selectedCard,
                ]}
                onPress={() => handleWindParkSelection(windPark.id)}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{windPark.name}</Text>
                    <Text style={styles.cardDescription}>
                      {windPark.location.address}
                    </Text>
                  </View>
                  <View style={styles.selectionIndicator}>
                    {windParkId === windPark.id && (
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

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleStartDateChange}
          minimumDate={new Date()}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || startDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleEndDateChange}
          minimumDate={startDate || new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#9C46CE",
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  selector: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorContent: {
    flex: 1,
  },
  selectedText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  placeholderText: {
    fontSize: 16,
    color: "#9ca3af",
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  optionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  selectedCard: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  dateButton: {
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#374151",
  },
});
