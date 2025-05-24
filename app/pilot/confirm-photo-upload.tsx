import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';


// Interfaces
interface Turbine {
  id: string;
  name: string;
  status: 'pending' | 'completed' | 'in-progress';
}

interface PhotoUpload {
  id: string;
  turbines: string[];
  uploadDateTime: Date;
  evidenceType: 'screenshot' | 'driveLink';
  evidenceData: string;
  status: 'sent' | 'pending';
  createdAt: Date;
  adminId: string;
}

interface Project {
  name: string;
  client: string;
  location: string;
  adminResponsible: string;
  adminEmail: string;
  turbines: Turbine[];
}

// Componente principal para confirmación de subida de fotos
const ConfirmPhotoUpload = () => {  const [currentProject] = useState<Project>(sampleProject);
  const [selectedTurbines, setSelectedTurbines] = useState<string[]>([]);
  const [screenshotEvidence, setScreenshotEvidence] = useState<string | null>(null);
  const [driveLink, setDriveLink] = useState<string>('');
  const [evidenceType, setEvidenceType] = useState<'screenshot' | 'driveLink'>('screenshot');
  const [photoUploads, setPhotoUploads] = useState<PhotoUpload[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;  // Solicitar permisos de cámara al cargar
  useEffect(() => {
    requestCameraPermissions();
    
    // Inicializar animaciones
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const requestCameraPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Se necesitan permisos de galería para subir capturas de pantalla.'
        );
      }
    }
  };
  const pickScreenshot = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setScreenshotEvidence(result.assets[0].uri);
        setDriveLink(''); // Limpiar link si selecciona imagen
      }    } catch (err) {
      console.log('Error picking image:', err);
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  const toggleTurbine = (turbineId: string) => {
    setSelectedTurbines(prev => 
      prev.includes(turbineId) 
        ? prev.filter(id => id !== turbineId)
        : [...prev, turbineId]
    );
  };

  const selectAllTurbines = () => {
    const allTurbineIds = currentProject.turbines.map(t => t.id);
    setSelectedTurbines(allTurbineIds);
  };

  const clearAllTurbines = () => {
    setSelectedTurbines([]);
  };

  const handleDriveLinkChange = (text: string) => {
    setDriveLink(text);
    if (text.trim()) {
      setScreenshotEvidence(null); // Limpiar imagen si escribe link
      setEvidenceType('driveLink');
    }
  };

  const sendToAdmin = async (uploadData: PhotoUpload) => {
    // Simulación de envío al admin responsable
    try {
      // Aquí iría la lógica real de envío (API call, email, etc.)
      console.log('Enviando a admin:', {
        adminEmail: currentProject.adminEmail,
        adminName: currentProject.adminResponsible,
        uploadData
      });
      
      return true;
    } catch (error) {
      console.error('Error enviando al admin:', error);
      return false;
    }
  };

  const handleConfirmUpload = async () => {
    // Validaciones
    if (selectedTurbines.length === 0) {
      Alert.alert(
        'Error de validación',
        'Debe seleccionar al menos una turbina.'
      );
      return;
    }

    const hasEvidence = screenshotEvidence || driveLink.trim();
    if (!hasEvidence) {
      Alert.alert(
        'Error de validación',
        'Debe proporcionar una captura de pantalla o un enlace de Drive como evidencia.'
      );
      return;
    }

    // Determinar tipo de evidencia y datos
    const finalEvidenceType = screenshotEvidence ? 'screenshot' : 'driveLink';
    const finalEvidenceData = screenshotEvidence || driveLink.trim();

    // Crear nuevo registro de subida
    const newUpload: PhotoUpload = {
      id: Date.now().toString(),
      turbines: selectedTurbines,
      uploadDateTime: new Date(),
      evidenceType: finalEvidenceType,
      evidenceData: finalEvidenceData,
      status: 'pending',
      createdAt: new Date(),
      adminId: currentProject.adminEmail
    };

    // Enviar al admin
    const sentSuccessfully = await sendToAdmin(newUpload);
    
    if (sentSuccessfully) {
      newUpload.status = 'sent';
      setPhotoUploads(prev => [newUpload, ...prev]);

      // Limpiar formulario
      setSelectedTurbines([]);
      setScreenshotEvidence(null);
      setDriveLink('');
      setEvidenceType('screenshot');

      Alert.alert(
        'Envío Exitoso',
        `Se ha enviado la confirmación de subida de fotos para ${selectedTurbines.length} turbina(s) al administrador ${currentProject.adminResponsible}.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Error de Envío',
        'No se pudo enviar la información al administrador. Intente nuevamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getTurbineName = (turbineId: string) => {
    return currentProject.turbines.find(t => t.id === turbineId)?.name || turbineId;
  };

  const isFormValid = selectedTurbines.length > 0 && (screenshotEvidence || driveLink.trim());
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Título principal */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Confirmar Subida de Fotos</Text>
          <Text style={styles.subtitle}>
            Envía la confirmación al administrador responsable
          </Text>
        </View>

        {/* Card del proyecto */}
        <View style={styles.projectCard}>
          <View style={styles.projectHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="business" size={24} color="#6366f1" />
            </View>
            <View style={styles.projectInfo}>
              <Text style={styles.projectName}>{currentProject.name}</Text>
              <Text style={styles.projectClient}>{currentProject.client}</Text>
              <Text style={styles.projectLocation}>{currentProject.location}</Text>
            </View>
          </View>
          
          <View style={styles.adminInfo}>
            <Ionicons name="person-circle" size={16} color="#6b7280" />
            <Text style={styles.adminText}>
              Admin: {currentProject.adminResponsible}
            </Text>
          </View>
        </View>

        {/* Formulario de confirmación */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Nueva Confirmación</Text>
          
          {/* Selección de turbinas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Turbinas correspondientes</Text>
              <View style={styles.turbineActions}>
                <TouchableOpacity style={styles.actionButton} onPress={selectAllTurbines}>
                  <Text style={styles.actionButtonText}>Todas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={clearAllTurbines}>
                  <Text style={styles.actionButtonText}>Limpiar</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.turbineGrid}>
              {currentProject.turbines.map((turbine) => (
                <TouchableOpacity
                  key={turbine.id}
                  style={[
                    styles.turbineChip,
                    selectedTurbines.includes(turbine.id) && styles.selectedTurbineChip
                  ]}
                  onPress={() => toggleTurbine(turbine.id)}
                >
                  <Ionicons 
                    name={selectedTurbines.includes(turbine.id) ? "checkmark-circle" : "ellipse-outline"} 
                    size={18} 
                    color={selectedTurbines.includes(turbine.id) ? "#10b981" : "#9ca3af"} 
                  />
                  <Text style={[
                    styles.turbineChipText,
                    selectedTurbines.includes(turbine.id) && styles.selectedTurbineChipText
                  ]}>
                    {turbine.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {selectedTurbines.length > 0 && (
              <View style={styles.selectionSummary}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.selectionSummaryText}>
                  {selectedTurbines.length} turbina(s) seleccionada(s)
                </Text>
              </View>
            )}
          </View>

          {/* Fecha y hora */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fecha y hora</Text>
            <View style={styles.dateTimeCard}>
              <Ionicons name="time" size={20} color="#6366f1" />
              <Text style={styles.dateTimeText}>
                {new Date().toLocaleString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>          {/* Evidencia */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Evidencia <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>
              Seleccione una imagen de la galería o proporcione un enlace de Drive
            </Text>
            
            {/* Opciones de evidencia - Diseño mejorado */}
            <View style={styles.evidenceOptions}>
              <TouchableOpacity
                style={[
                  styles.evidenceOption,
                  evidenceType === 'screenshot' && styles.activeEvidenceOption
                ]}
                onPress={() => setEvidenceType('screenshot')}
              >
                <Ionicons 
                  name="images" 
                  size={22} 
                  color={evidenceType === 'screenshot' ? "#6366f1" : "#9ca3af"} 
                />
                <Text style={[
                  styles.evidenceOptionText,
                  evidenceType === 'screenshot' && styles.activeEvidenceOptionText
                ]}>
                  Imagen de Galería
                </Text>
                {evidenceType === 'screenshot' && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.evidenceOption,
                  evidenceType === 'driveLink' && styles.activeEvidenceOption
                ]}
                onPress={() => setEvidenceType('driveLink')}
              >
                <Ionicons 
                  name="link" 
                  size={22} 
                  color={evidenceType === 'driveLink' ? "#6366f1" : "#9ca3af"} 
                />
                <Text style={[
                  styles.evidenceOptionText,
                  evidenceType === 'driveLink' && styles.activeEvidenceOptionText
                ]}>
                  Enlace de Drive
                </Text>
                {evidenceType === 'driveLink' && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
            </View>

            {/* Contenido de evidencia */}
            {evidenceType === 'screenshot' ? (
              <View style={styles.evidenceContainer}>
                {screenshotEvidence ? (
                  <View style={styles.evidencePreview}>
                    <Image source={{ uri: screenshotEvidence }} style={styles.evidenceImage} />
                    <View style={styles.evidenceActions}>
                      <TouchableOpacity style={styles.changeButton} onPress={pickScreenshot}>
                        <Ionicons name="images" size={16} color="#6366f1" />
                        <Text style={styles.changeButtonText}>Cambiar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.removeButton} 
                        onPress={() => setScreenshotEvidence(null)}
                      >
                        <Ionicons name="trash" size={16} color="#ef4444" />
                        <Text style={styles.removeButtonText}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadButton} onPress={pickScreenshot}>
                    <View style={styles.uploadButtonContent}>
                      <Ionicons name="images" size={32} color="#6366f1" />
                      <Text style={styles.uploadButtonText}>Seleccionar de Galería</Text>
                      <Text style={styles.uploadButtonSubtext}>Toca para elegir una imagen</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.evidenceContainer}>
                <View style={styles.linkInputContainer}>
                  <Ionicons name="link" size={20} color="#6b7280" style={styles.linkIcon} />
                  <TextInput
                    style={styles.linkInput}
                    placeholder="https://drive.google.com/file/d/..."
                    value={driveLink}
                    onChangeText={handleDriveLinkChange}
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {driveLink.trim() && (
                    <TouchableOpacity 
                      style={styles.clearLinkButton}
                      onPress={() => setDriveLink('')}
                    >
                      <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
                {driveLink.trim() && (
                  <View style={styles.linkPreview}>
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text style={styles.linkPreviewText}>Enlace válido</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Botón de envío */}
          <TouchableOpacity 
            style={[
              styles.submitButton,
              !isFormValid && styles.disabledButton
            ]} 
            onPress={handleConfirmUpload}
            disabled={!isFormValid}
          >
            <Ionicons name="send" size={20} color="white" />
            <Text style={styles.submitButtonText}>Enviar al Administrador</Text>
          </TouchableOpacity>
        </View>

        {/* Historial de envíos */}
        {photoUploads.length > 0 && (
          <View style={styles.historyCard}>
            <Text style={styles.cardTitle}>Envíos Recientes</Text>
            
            {photoUploads.map((upload) => (
              <View key={upload.id} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyStatus}>
                    <Ionicons 
                      name={upload.status === 'sent' ? "checkmark-circle" : "time"} 
                      size={18} 
                      color={upload.status === 'sent' ? "#10b981" : "#f59e0b"} 
                    />
                    <Text style={[
                      styles.historyStatusText,
                      { color: upload.status === 'sent' ? "#10b981" : "#f59e0b" }
                    ]}>
                      {upload.status === 'sent' ? 'Enviado' : 'Pendiente'}
                    </Text>
                  </View>
                  <Text style={styles.historyTime}>
                    {upload.uploadDateTime.toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                
                <Text style={styles.historyTurbines}>
                  {upload.turbines.map(id => getTurbineName(id)).join(', ')}
                </Text>
                
                <View style={styles.historyEvidence}>
                  <Ionicons 
                    name={upload.evidenceType === 'screenshot' ? "image" : "link"} 
                    size={16} 
                    color="#6b7280" 
                  />
                  <Text style={styles.historyEvidenceText}>
                    {upload.evidenceType === 'screenshot' ? 'Captura de pantalla' : 'Enlace de Drive'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Datos de ejemplo
const sampleProject: Project = {
  name: 'Parque Eólico Sierra Madre',
  client: 'Energía Renovable SA',
  location: 'Sierra Norte, Estado de Oaxaca',
  adminResponsible: 'Ing. Carlos Mendoza',
  adminEmail: 'carlos.mendoza@energiarenovable.com',
  turbines: [
    { id: 'T001', name: 'Turbina A-01', status: 'pending' },
    { id: 'T002', name: 'Turbina A-02', status: 'completed' },
    { id: 'T003', name: 'Turbina B-12', status: 'in-progress' },
    { id: 'T004', name: 'Turbina C-07', status: 'pending' },
    { id: 'T005', name: 'Turbina D-15', status: 'pending' },
    { id: 'T006', name: 'Turbina E-03', status: 'pending' },
    { id: 'T007', name: 'Turbina F-08', status: 'completed' },
    { id: 'T008', name: 'Turbina G-11', status: 'pending' }
  ]
};

// Estilos con diseño similar al dashboard
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20
  },
  titleSection: {
    marginBottom: 24
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '400'
  },
  projectCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  projectInfo: {
    flex: 1
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2
  },
  projectClient: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 1
  },
  projectLocation: {
    fontSize: 14,
    color: '#9ca3af'
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  adminText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16
  },
  required: {
    color: '#ef4444'
  },
  turbineActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  actionButtonText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600'
  },
  turbineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  turbineChip: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  selectedTurbineChip: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981'
  },
  turbineChipText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500'
  },
  selectedTurbineChipText: {
    color: '#059669'
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8
  },
  selectionSummaryText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500'
  },
  dateTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  dateTimeText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500'
  },  evidenceOptions: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12
  },
  evidenceOption: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeEvidenceOption: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  evidenceOptionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center'
  },
  activeEvidenceOptionText: {
    color: '#6366f1'
  },
  evidencePreview: {
    alignItems: 'center'
  },
  evidenceImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12
  },
  evidenceActions: {
    flexDirection: 'row',
    gap: 12
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#6366f1'
  },
  changeButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500'
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ef4444'
  },
  removeButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500'
  },
  uploadActions: {
    flexDirection: 'row',
    gap: 12
  },  uploadButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  uploadButtonContent: {
    alignItems: 'center',
    padding: 20
  },
  uploadButtonText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
    textAlign: 'center'
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center'
  },
  linkInputContainer: {
    position: 'relative'
  },  linkInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    paddingLeft: 50,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingRight: 50
  },
  clearLinkButton: {
    position: 'absolute',
    right: 16,
    top: 18
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.6
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  historyItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981'
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  historyStatus: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  historyStatusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600'
  },
  historyTime: {
    fontSize: 12,
    color: '#6b7280'
  },
  historyTurbines: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 8
  },  historyEvidence: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  historyEvidenceText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6b7280'
  },
  // Missing styles
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#6366f1',
    borderRadius: 2
  },
  evidenceContainer: {
    marginTop: 16
  },
  uploadButtonContent: {
    alignItems: 'center',
    padding: 20
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center'
  },
  linkIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1
  },
  linkPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0'
  },
  linkPreviewText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#166534',
    fontWeight: '500'
  }
});

export default ConfirmPhotoUpload;
