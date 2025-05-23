import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, StatusBadge } from "../../../src/components/common";
import { mockParks, mockProjects } from "../../../src/mocks/data";

export default function ProjectsScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = mockProjects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProjectParks = (projectId: string) =>
    mockParks.filter((park) => park.projectId === projectId);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Proyectos",
        }}
      />
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar proyectos..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Nuevo Proyecto</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {filteredProjects.map((project) => (
          <Card key={project.id} title={project.name}>
            <View style={styles.projectHeader}>
              <StatusBadge
                status={project.status}
                color={
                  project.status === "ACTIVE"
                    ? "#4caf50"
                    : project.status === "PAUSED"
                    ? "#ff9800"
                    : "#9e9e9e"
                }
              />
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.description}>{project.description}</Text>

            <View style={styles.dates}>
              <Text style={styles.dateText}>
                Inicio: {new Date(project.startDate).toLocaleDateString()}
              </Text>
              <Text style={styles.dateText}>
                Fin: {new Date(project.endDate).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.parksSection}>
              <Text style={styles.parksTitle}>Parques Asignados:</Text>
              {getProjectParks(project.id).map((park) => (
                <View key={park.id} style={styles.parkItem}>
                  <Text style={styles.parkName}>{park.name}</Text>
                  <Text style={styles.parkLocation}>
                    {park.location.address}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#000",
  },
  addButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  description: {
    color: "#333",
    marginBottom: 12,
  },
  dates: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateText: {
    color: "#555",
  },
  editButton: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: "#007bff",
  },
  parksSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 12,
  },
  parksTitle: {
    color: "#555",
    marginBottom: 8,
  },
  parkItem: {
    marginBottom: 8,
  },
  parkName: {
    color: "#000",
    fontSize: 16,
  },
  parkLocation: {
    color: "#555",
    fontSize: 14,
  },
});
