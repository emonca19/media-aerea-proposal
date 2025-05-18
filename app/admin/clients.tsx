import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { mockClients } from '../../src/mocks/clients';

export default function ClientsScreen() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const filteredClients = mockClients; // Mostrar todos los clientes ya que no hay búsqueda

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Clientes', headerStyle: { backgroundColor: '#1a237e' }, headerTintColor: '#fff' }} />
      <Text style={styles.title}>Gestión de Clientes</Text>
      {/* Aquí irá un SearchBar y botón de alta de cliente */}
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
            {/* Aquí puedes mostrar contratos vigentes, historial, etc. */}
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Aquí puedes mostrar el detalle del cliente seleccionado, historial, contratos, etc. */}
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
});
