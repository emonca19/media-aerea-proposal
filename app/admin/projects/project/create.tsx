import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { mockClients, mockWindParks } from "../../../../src/mocks";

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
  // Form validation helpers
  const isBasicInfoComplete = projectName.trim() && description.trim();
  const isParticipantsComplete = clientId && windParkId;
  const isDatesComplete = startDate && endDate;

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

  // Helper functions for rendering sections
  const renderBasicInfoSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <MaterialCommunityIcons
          name="file-document-edit"
          size={20}
          color="#9C46CE"
        />
        <Text style={styles.sectionTitle}>Información Básica</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre del Proyecto*</Text>
        <TextInput
          style={styles.input}
          value={projectName}
          onChangeText={setProjectName}
          placeholder="Ingresa el nombre del proyecto"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Descripción*</Text>
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
    </View>
  );

  const renderParticipantsSection = () => {
    const hasBasicInfo = isBasicInfoComplete;

    return (
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <MaterialCommunityIcons
            name="account-group"
            size={20}
            color="#9C46CE"
          />
          <Text
            style={[
              styles.sectionTitle,
              { color: hasBasicInfo ? "#1f2937" : "#9ca3af" },
            ]}
          >
            Participantes
          </Text>
        </View>

        {!hasBasicInfo && (
          <Text style={styles.disabledSectionText}>
            Completa la información básica primero para seleccionar
            participantes
          </Text>
        )}

        {hasBasicInfo && (
          <>
            <View style={styles.subsection}>
              <View style={styles.subsectionTitleContainer}>
                <MaterialCommunityIcons
                  name="domain"
                  size={18}
                  color="#10b981"
                />
                <Text style={styles.subsectionTitle}>Cliente*</Text>
              </View>
              <TouchableOpacity
                style={styles.resourceSelector}
                onPress={() => setShowClientModal(true)}
              >
                <View style={styles.resourceSelectorContent}>
                  {clientId ? (
                    <Text style={styles.resourceSelectedSingle}>
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

            <View style={styles.subsection}>
              <View style={styles.subsectionTitleContainer}>
                <MaterialCommunityIcons
                  name="wind-turbine"
                  size={18}
                  color="#10b981"
                />
                <Text style={styles.subsectionTitle}>Parque Eólico*</Text>
              </View>
              <TouchableOpacity
                style={styles.resourceSelector}
                onPress={() => setShowWindParkModal(true)}
              >
                <View style={styles.resourceSelectorContent}>
                  {windParkId ? (
                    <Text style={styles.resourceSelectedSingle}>
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
          </>
        )}
      </View>
    );
  };

  const renderDatesSection = () => {
    const hasParticipants = isParticipantsComplete;

    return (
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <MaterialCommunityIcons
            name="calendar-range"
            size={20}
            color="#9C46CE"
          />
          <Text
            style={[
              styles.sectionTitle,
              { color: hasParticipants ? "#1f2937" : "#9ca3af" },
            ]}
          >
            Cronograma
          </Text>
        </View>

        {!hasParticipants && (
          <Text style={styles.disabledSectionText}>
            Completa la información de participantes primero para configurar
            fechas
          </Text>
        )}

        {hasParticipants && (
          <>
            <View style={styles.dateRow}>
              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>Fecha de Inicio*</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {startDate
                      ? startDate.toLocaleDateString()
                      : "Seleccionar fecha"}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#9C46CE" />
                </TouchableOpacity>
              </View>

              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>Fecha de Fin*</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {endDate
                      ? endDate.toLocaleDateString()
                      : "Seleccionar fecha"}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#9C46CE" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notas</Text>
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
          </>
        )}
      </View>
    );
  };
  // Bottom save button component
  const renderBottomSaveButton = () => (
    <TouchableOpacity
      style={[
        styles.bottomSaveButton,
        Platform.OS === "web" && styles.bottomSaveButtonWeb, // Added conditional web style
        !isDatesComplete && styles.bottomSaveButtonDisabled,
      ]}
      onPress={handleSaveProject}
      disabled={!isDatesComplete}
    >
      <Text
        style={[
          styles.bottomSaveButtonText,
          !isDatesComplete && styles.bottomSaveButtonTextDisabled,
        ]}
      >
        Guardar Proyecto
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        {/* Custom Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#9C46CE" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Proyecto</Text>
          <View style={styles.backButton} />
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderBasicInfoSection()}
          {renderParticipantsSection()}
          {renderDatesSection()}
          {renderBottomSaveButton()}
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
                          color="#3b82f6"
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
                          color="#3b82f6"
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
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  bottomSaveButton: {
    backgroundColor: "#9C46CE",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: "#9C46CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    alignSelf: "flex-end", // Align button to the right
    marginHorizontal: 16, // Horizontal margin for the button
    marginTop: 24, // Top margin for the button
    marginBottom: 32, // Bottom margin for the button
  },
  bottomSaveButtonWeb: {
    // Style for web platform
    minWidth: 200,
    maxWidth: 300,
  },
  bottomSaveButtonDisabled: {
    backgroundColor: "#d1d5db",
    shadowOpacity: 0.1,
    elevation: 2,
  },
  bottomSaveButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  bottomSaveButtonTextDisabled: {
    color: "#9ca3af",
  },
  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginLeft: 8,
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 6,
  },
  disabledSectionText: {
    fontSize: 14,
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  resourceSelector: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resourceSelectorContent: {
    flex: 1,
  },
  resourceSelectedSingle: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  placeholderText: {
    fontSize: 16,
    color: "#9ca3af",
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
    ...(Platform.OS === "web" && {
      maxWidth: 600,
      alignSelf: "center",
      width: "100%",
      marginVertical: 32,
      borderRadius: 12,
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
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
  optionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  selectedCard: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
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
});
