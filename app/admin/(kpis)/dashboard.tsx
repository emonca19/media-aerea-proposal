import { StatCard } from "@/src/components/StatCard";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

// Mock data for KPIs - replace with actual data fetching logic
const kpiData = [
  {
    id: "1",
    title: "Proyectos Activos",
    value: 15,
    icon: "work" as keyof typeof MaterialIcons.glyphMap,
    color: "#64ffda",
  },
  {
    id: "2",
    title: "Recursos Disponibles",
    value: 120,
    icon: "people" as keyof typeof MaterialIcons.glyphMap,
    color: "#ffca28",
  },
  {
    id: "3",
    title: "Eficiencia Operativa",
    value: "85%",
    icon: "trending-up" as keyof typeof MaterialIcons.glyphMap,
    color: "#4caf50",
  },
  {
    id: "4",
    title: "Cumplimiento de Objetivos",
    value: "92%",
    icon: "check-circle" as keyof typeof MaterialIcons.glyphMap,
    color: "#2196f3",
  },
  {
    id: "5",
    title: "Incidentes Reportados",
    value: 3,
    icon: "report-problem" as keyof typeof MaterialIcons.glyphMap,
    color: "#f44336",
  },
  {
    id: "6",
    title: "Satisfacción del Cliente",
    value: "4.5/5",
    icon: "star" as keyof typeof MaterialIcons.glyphMap,
    color: "#ff9800",
  },
];

const AdminKpiDashboard = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Panel de KPIs</Text>
      <View style={styles.grid}>
        {kpiData.map((kpi) => (
          <View key={kpi.id} style={styles.cardContainer}>
            <StatCard
              icon={kpi.icon}
              title={kpi.title}
              value={kpi.value}
              color={kpi.color}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#e0e0e0", // Light text color for dark theme
    marginBottom: 24,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  cardContainer: {
    width: "45%", // Adjust for desired spacing and number of columns
    marginBottom: 16,
  },
});

export default AdminKpiDashboard;
