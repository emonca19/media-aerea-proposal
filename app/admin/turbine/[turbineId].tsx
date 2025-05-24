import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { mockParks, mockTurbines } from "../../../src/mocks/data";

export default function TurbineDetailsScreen() {
  const router = useRouter();
  const { turbineId } = useLocalSearchParams();
  const id = Array.isArray(turbineId) ? turbineId[0] : turbineId;
  const turbine = mockTurbines.find((t) => t.id === id);

  // Get the park information
  const park = turbine
    ? mockParks.find((p) => p.id === turbine.windParkId)
    : null;

  if (!turbine) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["rgba(12,4,67,1)", "rgba(151,68,195,0.8)"]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Text style={styles.headerButtonText}>← Volver</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text style={styles.errorText}>Turbina no encontrada</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "#4caf50";
      case "PHOTOS_UPLOADED":
        return "#2196f3";
      case "INSPECTED":
        return "#ff9800";
      default:
        return "#757575";
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={["rgba(12,4,67,1)", "rgba(151,68,195,0.8)"]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Text style={styles.headerButtonText}>← Volver</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.title}>{turbine.name}</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(turbine.status) },
              ]}
            />
            <Text style={styles.statusText}>{turbine.status}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Última Inspección</Text>
            <Text style={styles.info}>
              {turbine.lastInspection
                ? new Date(turbine.lastInspection).toLocaleDateString()
                : "No hay inspecciones registradas"}
            </Text>
          </View>{" "}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Ubicación</Text>
            <Text style={styles.info}>
              Parque: {park?.name || "No especificado"}
            </Text>
            <Text style={styles.info}>
              Coordenadas: {park?.location?.latitude || "N/A"},{" "}
              {park?.location?.longitude || "N/A"}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Especificaciones</Text>
            <Text style={styles.info}>
              Modelo: {turbine.specifications?.model || "No especificado"}
            </Text>
            <Text style={styles.info}>
              Altura: {turbine.specifications?.height || "No especificado"} m
            </Text>
            <Text style={styles.info}>
              Longitud de pala:{" "}
              {turbine.specifications?.bladeLength || "No especificado"} m
            </Text>
            <Text style={styles.info}>
              Capacidad: {turbine.specifications?.capacity || "No especificado"}{" "}
              MW
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a192f",
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 48,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    color: "#64ffda",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    color: "#64ffda",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  info: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  description: {
    color: "#8892b0",
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
});
