import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Card } from '../../src/components/common';

interface Client {
  id: string;
  name: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Energía Renovable SA',
    contactInfo: {
      email: 'contacto@energiarenovable.com',
      phone: '+52 81 1234 5678',
      address: 'Av. Industrial 123, Monterrey, NL',
    },
  },
  {
    id: '2',
    name: 'Wind Power México',
    contactInfo: {
      email: 'info@windpower.mx',
      phone: '+52 55 8765 4321',
      address: 'Paseo de la Reforma 456, CDMX',
    },
  },
];

export default function ClientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Gestión de Clientes',
          headerStyle: { backgroundColor: '#1a237e' },
          headerTintColor: '#fff',
        }}
      />
      <LinearGradient
        colors={['#1a237e', '#0d47a1', '#01579b']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar clientes..."
            placeholderTextColor="#8892b0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Text style={styles.addButtonText}>
              {showAddForm ? '- Cancelar' : '+ Nuevo Cliente'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {showAddForm && (
            <Card title="Nuevo Cliente">
              <View style={styles.form}>
                <View style={styles.formField}>
                  <Text style={styles.label}>Nombre de la empresa</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ingrese nombre..."
                    placeholderTextColor="#8892b0"
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="correo@empresa.com"
                    placeholderTextColor="#8892b0"
                    keyboardType="email-address"
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.label}>Teléfono</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+52..."
                    placeholderTextColor="#8892b0"
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.label}>Dirección</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Dirección completa..."
                    placeholderTextColor="#8892b0"
                    multiline
                  />
                </View>
                <TouchableOpacity style={styles.submitButton}>
                  <Text style={styles.submitButtonText}>Guardar Cliente</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {filteredClients.map(client => (
            <Card key={client.id} title={client.name}>
              <View style={styles.clientInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoText}>{client.contactInfo.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Teléfono:</Text>
                  <Text style={styles.infoText}>{client.contactInfo.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Dirección:</Text>
                  <Text style={styles.infoText}>{client.contactInfo.address}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Ver Proyectos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a192f',
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  addButton: {
    backgroundColor: '#64ffda',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#0a192f',
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  formField: {
    gap: 8,
  },
  label: {
    color: '#8892b0',
    fontSize: 14,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#64ffda',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#0a192f',
    fontSize: 16,
    fontWeight: '600',
  },
  clientInfo: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoLabel: {
    color: '#8892b0',
    width: 80,
  },
  infoText: {
    color: '#fff',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#64ffda',
  },
});
