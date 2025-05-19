import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';
import { mockProjects } from '../../src/mocks/data';

export default function ProjectDetailsScreen() {
  const { id } = useSearchParams();
  const project = mockProjects.find((p) => p.id === id);

  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Proyecto no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{project.name}</Text>
      <Text style={styles.info}>Estado: {project.status}</Text>
      <Text style={styles.info}>Inicio: {project.startDate.toDateString()}</Text>
      <Text style={styles.info}>Fin: {project.endDate.toDateString()}</Text>
      <Text style={styles.description}>{project.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a192f',
    padding: 16,
  },
  title: {
    color: '#64ffda',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  info: {
    color: '#8892b0',
    fontSize: 16,
    marginBottom: 8,
  },
  description: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});
