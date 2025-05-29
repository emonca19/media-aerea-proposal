import { showAlert } from "@/src/components/CrossPlatformAlert";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  Platform, // Added Platform
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockClients } from "../../../../src/mocks/clients";

export default function CreateClientScreen() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Form validation helpers
  const isBasicInfoComplete =
    companyName.trim() && contactName.trim() && contactEmail.trim();

  const handleSave = () => {
    if (!isBasicInfoComplete) {
      showAlert(
        "Información incompleta",
        "Por favor completa todos los campos obligatorios."
      );
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail.trim())) {
      showAlert(
        "Email inválido",
        "Por favor ingresa una dirección de email válida."
      );
      return;
    }

    // Check if client already exists
    const existingClient = mockClients.find(
      (client) =>
        client.name.toLowerCase() === companyName.trim().toLowerCase() ||
        client.contactInfo.email.toLowerCase() ===
          contactEmail.trim().toLowerCase()
    );

    if (existingClient) {
      showAlert(
        "Cliente ya existe",
        "Ya existe un cliente con este nombre de empresa o email de contacto."
      );
      return;
    }

    // Here you would normally save to your backend
    showAlert("Cliente creado", "El cliente ha sido creado exitosamente.", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };
  const renderHeader = () => (
    <View style={styles.customHeader}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#374151" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Nuevo Cliente</Text>
      <View style={styles.backButton} />
    </View>
  );
  const renderBottomSaveButton = () => (
    <TouchableOpacity
      style={[
        styles.bottomSaveButton,
        Platform.OS === "web" && styles.bottomSaveButtonWeb, // Added conditional web style
        !isBasicInfoComplete && styles.bottomSaveButtonDisabled,
      ]}
      onPress={handleSave}
      disabled={!isBasicInfoComplete}
    >
      <Text
        style={[
          styles.bottomSaveButtonText,
          !isBasicInfoComplete && styles.bottomSaveButtonTextDisabled,
        ]}
      >
        Guardar Cliente
      </Text>
    </TouchableOpacity>
  );

  const renderBasicInfoSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <MaterialCommunityIcons name="domain" size={20} color="#9C46CE" />
        <Text style={styles.sectionTitle}>Información Básica</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre de la Empresa*</Text>
        <TextInput
          style={styles.input}
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="Ingresa el nombre de la empresa"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre del Contacto*</Text>
        <TextInput
          style={styles.input}
          value={contactName}
          onChangeText={setContactName}
          placeholder="Nombre de la persona de contacto"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email de Contacto*</Text>
        <TextInput
          style={styles.input}
          value={contactEmail}
          onChangeText={setContactEmail}
          placeholder="correo@empresa.com"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Teléfono de Contacto</Text>
        <TextInput
          style={styles.input}
          value={contactPhone}
          onChangeText={setContactPhone}
          placeholder="+34-xxx-xxx-xxx"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Notas Adicionales</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Información adicional sobre el cliente..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {renderHeader()}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderBasicInfoSection()}
          {renderBottomSaveButton()}
        </ScrollView>
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
});
