import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Button } from 'react-native';
import { mockClients } from '../../src/mocks/clients';
import { mockProjects } from '../../src/mocks/data';

export default function ClientsScreen() {
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', contactName: '', contactEmail: '' });

  const handleAddClient = () => {
    // Aquí puedes agregar lógica para guardar el cliente en la base de datos o backend
    console.log('Nuevo cliente:', newClient);
    setIsModalVisible(false);
    setNewClient({ name: '', contactName: '', contactEmail: '' });
  };

  const getClientProjects = (clientId: string) => {
    return mockProjects.filter(project => project.clientId === clientId);
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/admin/project-details?id=${projectId}`);
  };

  const filteredClients = mockClients; // Mostrar todos los clientes ya que no hay búsqueda

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Clientes', headerStyle: { backgroundColor: '#1a237e' }, headerTintColor: '#fff' }} />
      <Text style={styles.title}>Gestión de Clientes</Text>
      <Button title="Agregar Cliente" onPress={() => setIsModalVisible(true)} />
      <ScrollView style={styles.list}>
        {filteredClients.map(client => (
          <TouchableOpacity
            key={client.id}
            style={[styles.clientCard, selectedClient === client.id && styles.selectedClient]}
            onPress={() => setSelectedClient(client.id)}
          >
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientInfo}>Contacto: {client.contactName} ({client.contactEmail})</Text>
            <Text style={styles.clientInfo}>Proyectos: {client.projects?.length || 0}</Text>
            {selectedClient === client.id && (
              <View style={styles.projectList}>
                {getClientProjects(client.id).map(project => (
                  <TouchableOpacity key={project.id} style={styles.projectCard} onPress={() => handleProjectClick(project.id)}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <Text style={styles.projectInfo}>Estado: {project.status}</Text>
                    <Text style={styles.projectInfo}>Inicio: {project.startDate.toDateString()}</Text>
                    <Text style={styles.projectInfo}>Fin: {project.endDate.toDateString()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Nuevo Cliente</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del cliente"
            value={newClient.name}
            onChangeText={(text) => setNewClient({ ...newClient, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre del contacto"
            value={newClient.contactName}
            onChangeText={(text) => setNewClient({ ...newClient, contactName: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo del contacto"
            value={newClient.contactEmail}
            onChangeText={(text) => setNewClient({ ...newClient, contactEmail: text })}
          />
          <Button title="Guardar" onPress={handleAddClient} />
          <Button title="Cancelar" onPress={() => setIsModalVisible(false)} />
        </View>
      </Modal>
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  clientCard: {
    backgroundColor: '#112240',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedClient: {
    borderWidth: 2,
    borderColor: '#64ffda',
  },
  clientName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clientInfo: {
    color: '#8892b0',
    fontSize: 14,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
  },
  modalTitle: {
    color: '#64ffda',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#112240',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: '100%',
  },
  projectList: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#0a192f',
    borderRadius: 8,
  },
  projectCard: {
    backgroundColor: '#112240',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  projectName: {
    color: '#64ffda',
    fontSize: 16,
    fontWeight: 'bold',
  },
  projectInfo: {
    color: '#8892b0',
    fontSize: 14,
    marginTop: 4,
  },
});
