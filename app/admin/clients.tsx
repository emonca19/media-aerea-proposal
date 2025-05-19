import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { mockClients } from '../../src/mocks/clients';
import { mockProjects } from '../../src/mocks/data';

interface NewClient {
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

export default function ClientsScreen() {
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssociateModalVisible, setIsAssociateModalVisible] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [newClient, setNewClient] = useState<NewClient>({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!newClient.name || !newClient.contactName || !newClient.contactEmail) {
      return false;
    }
    if (!validateEmail(newClient.contactEmail)) {
      return false;
    }
    return true;
  };

  const handleAddClient = () => {
    if (!validateForm()) {
      setShowErrors(true);
      return;
    }
    console.log('Nuevo cliente:', newClient);
    Alert.alert('Éxito', 'Cliente agregado correctamente');
    setIsModalVisible(false);
    setShowErrors(false);
    setNewClient({
      name: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
    });
  };

  const getClientProjects = (clientId: string) => {
    return mockProjects.filter(project => project.clientId === clientId);
  };

  const renderStatusBadge = (status: string) => {
    const getStatusColor = () => {
      switch (status) {
        case 'ACTIVE': return '#22c55e';
        case 'PAUSED': return '#f59e0b';
        case 'FINISHED': return '#3b82f6';
        default: return '#64748b';
      }
    };

    return (
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };

  const renderClientDetails = (client: any) => (
    <View style={styles.clientDetails}>
      <View style={styles.detailsHeader}>
        <View>
          <Text style={styles.detailsTitle}>Detalles del Cliente</Text>
          <Text style={styles.clientDetailName}>{client.name}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsAssociateModalVisible(true)}
          >
            <MaterialCommunityIcons name="file-link-outline" size={20} color="#3b82f6" />
            <Text style={styles.actionButtonText}>Asociar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
          >
            <MaterialCommunityIcons name="pencil-outline" size={20} color="#3b82f6" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detailsSection}>
          <Text style={styles.detailsSubtitle}>
            <Ionicons name="person-outline" size={16} color="#3b82f6" style={styles.detailsIcon} />
            Información de Contacto
          </Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Contacto:</Text>
            <Text style={styles.detailsValue}>{client.contactName}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Email:</Text>
            <Text style={styles.detailsValue}>{client.contactEmail}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Teléfono:</Text>
            <Text style={styles.detailsValue}>{client.contactPhone || 'N/A'}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Dirección:</Text>
            <Text style={styles.detailsValue}>{client.address || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.detailsSubtitle}>
          <Ionicons name="folder-outline" size={16} color="#3b82f6" style={styles.detailsIcon} />
          Proyectos Asociados
        </Text>
        {getClientProjects(client.id).length > 0 ? (
          getClientProjects(client.id).map(project => (            <TouchableOpacity
              key={project.id}
              style={styles.projectCard}              onPress={() => {
                router.push({
                  pathname: '/admin/(project-details)/[id]' as '/admin/(project-details)/[id]',
                  params: { id: project.id }
                });
              }}
            >
              <LinearGradient
                colors={['#f8fafc', '#f1f5f9']}
                style={styles.projectGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  {renderStatusBadge(project.status)}
                </View>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectDate}>
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noProjectsText}>No hay proyectos asociados</Text>
        )}
      </View>
    </View>
  );
  const renderError = (field: keyof NewClient, message: string) => {
    if (field === 'contactEmail') {
      if (!showErrors && !emailTouched) return null;
      if (!newClient.contactEmail) {
        return <Text style={styles.errorText}>{message}</Text>;
      }
      if (!validateEmail(newClient.contactEmail)) {
        return <Text style={styles.errorText}>Email inválido</Text>;
      }
    } else {
      if (!showErrors) return null;
      if (!newClient[field]) {
        return <Text style={styles.errorText}>{message}</Text>;
      }
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Clientes',
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
        }}
      />
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9']}
        style={styles.gradient}
      >
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Nuevo Cliente</Text>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView}>
          <View style={styles.clientsList}>
            {mockClients.map(client => (
              <TouchableOpacity
                key={client.id}
                style={[
                  styles.clientCard,
                  selectedClient === client.id && styles.selectedClient
                ]}
                onPress={() => setSelectedClient(
                  selectedClient === client.id ? null : client.id
                )}
              >
                <View style={styles.clientHeader}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <View style={styles.projectCount}>
                    <Ionicons name="folder-outline" size={16} color="#64748b" />
                    <Text style={styles.projectCountText}>
                      {getClientProjects(client.id).length} proyectos
                    </Text>
                  </View>
                </View>

                {selectedClient === client.id && renderClientDetails(client)}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Modal para nuevo cliente */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#f8fafc', '#f1f5f9']}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nuevo Cliente</Text>
                <TouchableOpacity                  onPress={() => {
                    setIsModalVisible(false);
                    setShowErrors(false);
                    setEmailTouched(false);
                    setNewClient({
                      name: '',
                      contactName: '',
                      contactEmail: '',
                      contactPhone: '',
                      address: '',
                    });
                  }}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre de la Empresa *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      showErrors && !newClient.name && styles.inputError
                    ]}
                    value={newClient.name}
                    onChangeText={(text) => setNewClient({ ...newClient, name: text })}
                    placeholder="Nombre de la empresa"
                  />
                  {renderError('name', 'El nombre de la empresa es requerido')}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre del Contacto *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      showErrors && !newClient.contactName && styles.inputError
                    ]}
                    value={newClient.contactName}
                    onChangeText={(text) => setNewClient({ ...newClient, contactName: text })}
                    placeholder="Nombre completo"
                  />
                  {renderError('contactName', 'El nombre del contacto es requerido')}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email del Contacto *</Text>                  <TextInput
                    style={[
                      styles.input,
                      ((showErrors || emailTouched) && (!newClient.contactEmail || !validateEmail(newClient.contactEmail))) && styles.inputError
                    ]}
                    value={newClient.contactEmail}
                    onChangeText={(text) => setNewClient({ ...newClient, contactEmail: text })}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="email@empresa.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {(showErrors || emailTouched) && renderError('contactEmail', 'El email es requerido')}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Teléfono</Text>
                  <TextInput
                    style={styles.input}
                    value={newClient.contactPhone}
                    onChangeText={(text) => setNewClient({ ...newClient, contactPhone: text })}
                    placeholder="Número de teléfono"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Dirección</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={newClient.address}
                    onChangeText={(text) => setNewClient({ ...newClient, address: text })}
                    placeholder="Dirección completa"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddClient}
                >
                  <Text style={styles.submitButtonText}>Guardar Cliente</Text>
                </TouchableOpacity>
              </ScrollView>
            </LinearGradient>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  gradient: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#3949ab',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 16,
    shadowColor: '#3949ab',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  clientsList: {
    padding: 8,
  },
  clientCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#3949ab',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedClient: {
    borderColor: '#3949ab',
    borderWidth: 2,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3949ab',
  },
  projectCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  projectCountText: {
    color: '#64748b',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  clientDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3949ab',
    marginBottom: 2,
  },
  clientDetailName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  detailsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#3949ab',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailsSection: {
    gap: 8,
  },
  detailsSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailsLabel: {
    width: 80,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailsValue: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  projectCard: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3949ab',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  projectGradient: {
    padding: 12,
    borderRadius: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3949ab',
  },
  projectDate: {
    color: '#64748b',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#3949ab',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noProjectsText: {
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
