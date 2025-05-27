import { MaterialIcons } from "@expo/vector-icons";
// import { LinearGradient } from 'expo-linear-gradient'; // Removed
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, StatusBadge } from "../../../../src/components/common";
import { SearchBar } from "../../../../src/components/SearchBar";
import { StatCard } from "../../../../src/components/StatCard";
import { mockTurbines, mockWindParks } from "../../../../src/mocks/index";

export default function ParksScreen() {
  const router = useRouter();
  const [selectedPark, setSelectedPark] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const parkTurbines = selectedPark
    ? mockTurbines.filter((t) => t.windParkId === selectedPark)
    : [];

  const filteredParks = mockWindParks.filter(
    (park) =>
      park.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      park.location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calcular estadísticas generales
  const totalTurbines = mockTurbines.length;
  const inspectedTurbines = mockTurbines.filter(
    (t) => t.status === "INSPECTED"
  ).length;
  const completedTurbines = mockTurbines.filter(
    (t) => t.status === "APPROVED"
  ).length;
  // const pendingTurbines = totalTurbines - inspectedTurbines - completedTurbines; // This variable is not used

  const handleTurbinePress = (turbineId: string) => {
    Alert.alert("Acciones de Turbina", "¿Qué acción desea realizar?", [
      {
        text: "Ver Detalles",
        onPress: () =>
          router.push({
            pathname: "/admin/turbine/[turbineId]" as const,
            params: { turbineId },
          }),
      },
      {
        text: "Ver Fotos",
      },
      {
        text: "Iniciar Inspección",
        onPress: () => {
          router.push(`/pilot/preflight-checklist?turbineId=${turbineId}`);
        },
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Parques",
          headerStyle: { backgroundColor: "#f0f0f0" }, // Light header
          headerTintColor: "#333333", // Dark text for header
        }}
      />
      {/* <LinearGradient
        colors={['#1a237e', '#0d47a1', '#01579b']}
        style={styles.gradient}
      > */}
      <ScrollView style={styles.content}>
        {/* Barra de búsqueda */}
        <SearchBar
          placeholder="Buscar parques..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          style={styles.searchBar}
        />

        {/* Estadísticas generales */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="engineering"
            title="Total Turbinas"
            value={totalTurbines}
            color="#0d47a1" // Adjusted color for light theme
          />
          <StatCard
            icon="checklist"
            title="Inspeccionadas"
            value={inspectedTurbines}
            color="#ff9800" // Keep as is, usually status colors are consistent
          />
          <StatCard
            icon="check-circle"
            title="Completadas"
            value={completedTurbines}
            color="#4caf50" // Keep as is
          />
        </View>

        {/* Lista de parques */}
        <View style={styles.parkList}>
          <Text style={styles.sectionTitle}>Parques Eólicos</Text>
          {filteredParks.map((park) => (
            <TouchableOpacity
              key={park.id}
              onPress={() => setSelectedPark(park.id)}
              style={[
                styles.parkCard,
                selectedPark === park.id && styles.selectedParkCard,
              ]}
            >
              <Card title={park.name}>
                <View style={styles.parkInfo}>
                  <View style={styles.locationInfo}>
                    <MaterialIcons
                      name="location-on"
                      size={16}
                      color="#555555"
                    />
                    <Text style={styles.locationText}>
                      {park.location.address}
                    </Text>
                  </View>
                  <View style={styles.coordinates}>
                    <Text style={styles.coordinateText}>
                      Lat: {park.location.latitude}
                    </Text>
                    <Text style={styles.coordinateText}>
                      Long: {park.location.longitude}
                    </Text>
                  </View>
                </View>
                <View style={styles.parkStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Turbinas Totales</Text>
                    <Text style={styles.statValue}>
                      {
                        mockTurbines.filter((t) => t.windParkId === park.id)
                          .length
                      }
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Completadas</Text>
                    <Text style={styles.statValue}>
                      {
                        mockTurbines.filter(
                          (t) =>
                            t.windParkId === park.id && t.status === "APPROVED"
                        ).length
                      }
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sección de turbinas */}
        {selectedPark && (
          <View style={styles.turbineSection}>
            <Text style={styles.sectionTitle}>Turbinas</Text>
            <View style={styles.turbineGrid}>
              {parkTurbines.map((turbine) => (
                <Card key={turbine.id} title={turbine.name}>
                  <View style={styles.turbineInfo}>
                    <View style={styles.turbineHeader}>
                      <StatusBadge
                        status={turbine.status}
                        color={
                          turbine.status === "APPROVED"
                            ? "#4caf50"
                            : turbine.status === "PHOTOS_UPLOADED"
                            ? "#2196f3"
                            : turbine.status === "INSPECTED"
                            ? "#ff9800"
                            : "#9e9e9e"
                        }
                      />
                      {turbine.lastInspection && (
                        <Text style={styles.lastInspection}>
                          Última inspección:{" "}
                          {new Date(
                            turbine.lastInspection
                          ).toLocaleDateString()}
                        </Text>
                      )}
                    </View>

                    <View style={styles.turbineActions}>
                      <TouchableOpacity
                        style={styles.turbineButton}
                        onPress={() => handleTurbinePress(turbine.id)}
                      >
                        <MaterialIcons name="menu" size={16} color="#01579b" />
                        <Text style={styles.turbineButtonText}>Acciones</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      {/* </LinearGradient> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // Default light background
  },
  // gradient: { // Removed as LinearGradient is removed
  //   flex: 1,
  // },
  content: {
    padding: 16,
  },
  searchContainer: {
    // This style was defined but not used, can be removed if not planned for use
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#1a237e", // Dark blue for section titles
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  parkList: {
    marginBottom: 24,
  },
  parkInfo: {
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center", // Align icon and text
    marginBottom: 8,
  },
  // locationLabel: { // This style was defined but not used
  //   color: '#8892b0',
  //   marginRight: 8,
  // },
  locationText: {
    color: "#333333", // Dark grey for text
    flex: 1,
    marginLeft: 4, // Add some space next to the icon
  },
  coordinates: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coordinateText: {
    color: "#555555", // Medium grey for coordinates
    fontSize: 12,
  },
  parkStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)", // Light grey border
  },
  stat: {
    alignItems: "center",
  },
  statLabel: {
    color: "#555555", // Medium grey for labels
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: "#0d47a1", // Medium blue for stat values
    fontSize: 24,
    fontWeight: "bold",
  },
  turbineSection: {
    marginTop: 16,
  },
  turbineGrid: {
    gap: 12,
  },
  turbineInfo: {
    gap: 12,
    alignItems: "flex-start",
  },
  lastInspection: {
    color: "#555555", // Medium grey for less important text
    fontSize: 12,
  },
  turbineButton: {
    backgroundColor: "rgba(13, 71, 161, 0.05)", // Very light blue tint for button background
    paddingHorizontal: 12,
    paddingVertical: 8, // Increased padding slightly
    borderRadius: 6,
    flexDirection: "row", // Align icon and text
    alignItems: "center", // Align icon and text
  },
  turbineButtonText: {
    color: "#01579b", // Darker blue for button text
    marginLeft: 6, // Space between icon and text
    fontWeight: "500",
  },
  searchBar: {
    marginBottom: 24,
  },
  parkCard: {
    marginBottom: 16,
    // Add a light border to park cards for better separation on white background
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8, // Optional: add some rounding
  },
  selectedParkCard: {
    borderWidth: 2,
    borderColor: "#0d47a1", // Medium blue for selected park border
  },
  turbineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%", // Ensure it takes full width for proper alignment
  },
  turbineActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
  },
});
