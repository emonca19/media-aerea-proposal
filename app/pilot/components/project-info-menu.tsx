import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { 
  Alert, 
  Animated, 
  Image, 
  Platform, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ScrollView,
  Modal,
  FlatList
} from 'react-native';

// Enhanced interfaces for Drive functionality
interface DriveSubmission {
  id: string;
  driveLink: string;
  submitDateTime: Date;
  status: 'active' | 'completed';
  totalTurbines: number;
  completedTurbines: number;
  adminNotified: boolean;
}

interface Turbine {
  id: string;
  name: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';
  lastInspection: string;
  isCompleted: boolean;
}

interface ProjectData {
  id: string;
  name: string;
  client: string;
  description: string;
  location: string;
  totalTurbines: number;
  completedTurbines: number;
  progress: number;
  startDate: string;
  endDate: string;
  contractId: string;
  adminResponsible: string;
  adminEmail: string;
  driveSubmission?: DriveSubmission;
  turbines: Turbine[];
}

// Enhanced project data with turbines for completion tracking
const mockProject: ProjectData = {
  id: 'proj-001',
  name: 'Parque Eólico Sierra Norte',
  client: 'Energía Renovable SA',
  description: 'Inspección integral de aerogeneradores con tecnología de drones avanzada',
  location: 'Sierra Norte, Estado de México',
  totalTurbines: 7,
  completedTurbines: 2,
  progress: 29,
  startDate: '2023-05-10',
  endDate: '2023-06-20',
  contractId: 'CON-2023-045',
  adminResponsible: 'Ing. Carlos Mendez',
  adminEmail: 'carlos.mendez@energiarenovable.com',
  driveSubmission: {
    id: 'drive-001',
    driveLink: 'https://drive.google.com/drive/folders/1x2Y3z4A5b6C7d8E9f0G1h2I3j4K5l6M7',
    submitDateTime: new Date('2024-01-14'),
    status: 'active',
    totalTurbines: 7,
    completedTurbines: 2,
    adminNotified: true
  },
  turbines: [
    { id: '1', name: 'T-001', status: 'COMPLETED', lastInspection: '2023-05-15', isCompleted: true },
    { id: '2', name: 'T-002', status: 'COMPLETED', lastInspection: '2023-05-16', isCompleted: true },
    { id: '3', name: 'T-003', status: 'IN_PROGRESS', lastInspection: '2023-04-28', isCompleted: false },
    { id: '4', name: 'T-004', status: 'PENDING', lastInspection: '2023-04-20', isCompleted: false },
    { id: '5', name: 'T-005', status: 'PENDING', lastInspection: '2023-04-18', isCompleted: false },
    { id: '6', name: 'T-006', status: 'PENDING', lastInspection: '2023-04-15', isCompleted: false },
    { id: '7', name: 'T-007', status: 'PENDING', lastInspection: '2023-04-12', isCompleted: false },
  ]
};

const projectMembers = [
  {
    id: 1,
    name: 'Juan Pérez',
    role: 'Piloto Líder',
    avatar: require('../../../assets/images/pilot-avatar.jpg'),
  },
  {
    id: 2,
    name: 'Ana Torres',
    role: 'Técnica de Mantenimiento',
    avatar: require('../../../assets/images/wind-turbine-icon.png'),
  },
  {
    id: 3,
    name: 'Luis García',
    role: 'Supervisor de Campo',
    avatar: require('../../../assets/images/media-logo.png'),
  },
];

const ProjectInfoMenuEnhanced = () => {
  const router = useRouter();
  const [hasNewPhotos, setHasNewPhotos] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData>(mockProject);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showTurbinesModal, setShowTurbinesModal] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const requestCameraPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Se necesitan permisos de galería para subir fotos.'
        );
        return false;
      }
    }
    return true;
  };

  const handlePhotoUpload = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;
    router.push('/pilot/confirm-photo-upload');
  };

  const handleDriveInfo = () => {
    setShowDriveModal(true);
  };

  const handleTurbineToggle = (turbineId: string) => {
    setProjectData(prev => {
      const updatedTurbines = prev.turbines.map(turbine => {
        if (turbine.id === turbineId) {
          const newIsCompleted = !turbine.isCompleted;
          return {
            ...turbine,
            isCompleted: newIsCompleted,
            status: newIsCompleted ? 'COMPLETED' : 'PENDING'
          };
        }
        return turbine;
      });
      
      const completedCount = updatedTurbines.filter(t => t.isCompleted).length;
      const progress = Math.round((completedCount / prev.totalTurbines) * 100);
      
      return {
        ...prev,
        turbines: updatedTurbines,
        completedTurbines: completedCount,
        progress: progress,
        driveSubmission: prev.driveSubmission ? {
          ...prev.driveSubmission,
          completedTurbines: completedCount
        } : undefined
      };
    });
    
    Alert.alert(
      "Estado actualizado",
      "El progreso de las turbinas ha sido actualizado y se enviará al administrador."
    );
  };

  const submitTurbineProgress = () => {
    setShowTurbinesModal(false);
    Alert.alert(
      "¡Progreso enviado!",
      `Se ha notificado al administrador ${projectData.adminResponsible} sobre el progreso actualizado: ${projectData.completedTurbines}/${projectData.totalTurbines} turbinas completadas.`
    );
  };

  const renderDriveInfoModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showDriveModal}
      onRequestClose={() => setShowDriveModal(false)}
    >
      <View style={modalStyles.modalOverlay}>
        <TouchableOpacity 
          style={modalStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDriveModal(false)}
        >
          <TouchableOpacity 
            style={modalStyles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {/* Modal Header */}
              <View style={modalStyles.modalHeader}>
                <View style={modalStyles.modalIconContainer}>
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={modalStyles.modalIconGradient}
                  >
                    <Ionicons name="cloud-outline" size={24} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={modalStyles.modalTitle}>Información de Google Drive</Text>
                <Text style={modalStyles.modalSubtitle}>
                  Este es el enlace de Google Drive configurado para el proyecto. Las fotos se organizan automáticamente en esta carpeta.
                </Text>
              </View>

              {/* Drive Info Display */}
              <View style={modalStyles.driveInfoContainer}>
                <View style={modalStyles.driveInfoRow}>
                  <Ionicons name="link" size={16} color="#6b7280" />
                  <Text style={modalStyles.driveInfoLabel}>Enlace configurado:</Text>
                </View>
                <Text style={modalStyles.driveInfoLink} numberOfLines={2}>
                  {projectData.driveSubmission?.driveLink || 'No configurado'}
                </Text>
                
                <View style={modalStyles.driveInfoRow}>
                  <Ionicons name="calendar" size={16} color="#6b7280" />
                  <Text style={modalStyles.driveInfoLabel}>Configurado el:</Text>
                </View>
                <Text style={modalStyles.driveInfoValue}>
                  {projectData.driveSubmission?.submitDateTime.toLocaleDateString('es-ES') || 'N/A'}
                </Text>

                <View style={modalStyles.driveInfoRow}>
                  <Ionicons name="person" size={16} color="#6b7280" />
                  <Text style={modalStyles.driveInfoLabel}>Administrador:</Text>
                </View>
                <Text style={modalStyles.driveInfoValue}>
                  {projectData.adminResponsible}
                </Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity 
                style={modalStyles.closeButton}
                onPress={() => setShowDriveModal(false)}
              >
                <Text style={modalStyles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const renderTurbinesModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showTurbinesModal}
      onRequestClose={() => setShowTurbinesModal(false)}
    >
      <View style={modalStyles.modalOverlay}>
        <TouchableOpacity 
          style={modalStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTurbinesModal(false)}
        >
          <TouchableOpacity 
            style={[modalStyles.modalContent, { maxHeight: '80%' }]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={modalStyles.modalHeader}>
              <View style={modalStyles.modalIconContainer}>
                <LinearGradient
                  colors={['#3b82f6', '#1d4ed8']}
                  style={modalStyles.modalIconGradient}
                >
                  <Ionicons name="nuclear-outline" size={24} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={modalStyles.modalTitle}>Marcar Turbinas Completadas</Text>
              <Text style={modalStyles.modalSubtitle}>
                Selecciona las turbinas que has completado para actualizar el progreso del proyecto.
              </Text>
            </View>

            {/* Turbines List */}
            <FlatList
              data={projectData.turbines}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1, marginBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    modalStyles.turbineItem,
                    item.isCompleted && modalStyles.turbineItemCompleted
                  ]}
                  onPress={() => handleTurbineToggle(item.id)}
                >
                  <View style={modalStyles.turbineItemContent}>
                    <View style={modalStyles.turbineInfo}>
                      <Text style={[
                        modalStyles.turbineName,
                        item.isCompleted && modalStyles.turbineNameCompleted
                      ]}>
                        {item.name}
                      </Text>
                      <Text style={[
                        modalStyles.turbineDate,
                        item.isCompleted && modalStyles.turbineDateCompleted
                      ]}>
                        Última inspección: {formatDate(item.lastInspection)}
                      </Text>
                    </View>
                    <View style={[
                      modalStyles.turbineCheckbox,
                      item.isCompleted && modalStyles.turbineCheckboxCompleted
                    ]}>
                      {item.isCompleted && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />

            {/* Action Buttons */}
            <View style={modalStyles.actionButtons}>
              <TouchableOpacity 
                style={modalStyles.cancelButton}
                onPress={() => setShowTurbinesModal(false)}
              >
                <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={modalStyles.submitButton}
                onPress={submitTurbineProgress}
              >
                <LinearGradient
                  colors={['#3b82f6', '#1d4ed8']}
                  style={modalStyles.submitButtonGradient}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={modalStyles.submitButtonText}>Enviar Progreso</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasNewPhotos(true);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);
    return () => clearTimeout(timer);
  }, [scaleAnim]);

  return (
    <ScrollView 
      style={componentStyles.scrollContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={componentStyles.scrollContent}
    >
      <View style={componentStyles.projectInfoCard}>
        {/* Header with icon and project info */}
        <View style={componentStyles.headerContainer}>
          <LinearGradient
            colors={['#a78bfa', '#8b5cf6']}
            style={componentStyles.headerIconGradient}
          >
            <Ionicons name="briefcase-outline" size={28} color="#ffffff" />
          </LinearGradient>
          <View style={componentStyles.projectHeaderInfo}>
            <Text style={componentStyles.projectTitle}>{projectData.name}</Text>
            <Text style={componentStyles.projectClient}>{projectData.client}</Text>
            <Text style={componentStyles.projectDescription}>{projectData.description}</Text>
          </View>
        </View>

        {/* Quick Access Buttons */}
        <View style={componentStyles.quickAccessContainer}>
          <TouchableOpacity 
            style={componentStyles.quickAccessButton}
            onPress={() => setShowTurbinesModal(true)}
          >
            <View style={componentStyles.quickAccessIconContainer}>
              <Ionicons name="nuclear-outline" size={20} color="#3b82f6" />
            </View>
            <Text style={componentStyles.quickAccessButtonText}>Marcar Turbinas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={componentStyles.quickAccessButton}
            onPress={() => router.push('/pilot/site-map')}
          >
            <View style={componentStyles.quickAccessIconContainer}>
              <Ionicons name="map-outline" size={20} color="#10b981" />
            </View>
            <Text style={componentStyles.quickAccessButtonText}>Mapa del Sitio</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              componentStyles.quickAccessButton, 
              hasNewPhotos && componentStyles.highlightedQuickAccessButton
            ]}
            onPress={handlePhotoUpload}
          >
            <Animated.View style={[
              componentStyles.quickAccessIconContainer, 
              { transform: [{ scale: hasNewPhotos ? scaleAnim : 1 }] }
            ]}>
              <Ionicons name="cloud-upload-outline" size={20} color="#f59e0b" />
              {hasNewPhotos && <View style={componentStyles.quickAccessNotificationDot} />}
            </Animated.View>
            <Text style={componentStyles.quickAccessButtonText}>Subir Fotos</Text>
          </TouchableOpacity>
        </View>

        {/* Drive Management Section */}
        <View style={componentStyles.driveSection}>
          <View style={componentStyles.driveSectionHeader}>
            <View style={componentStyles.driveIconContainer}>
              <Ionicons name="cloud-outline" size={20} color="#3b82f6" />
            </View>
            <Text style={componentStyles.driveSectionTitle}>Google Drive</Text>
            <TouchableOpacity 
              style={componentStyles.driveActionButton}
              onPress={handleDriveInfo}
            >
              <Ionicons name="information-circle-outline" size={18} color="#3b82f6" />
            </TouchableOpacity>
          </View>
          
          {projectData.driveSubmission ? (
            <View style={componentStyles.driveStatus}>
              <View style={componentStyles.driveStatusInfo}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={componentStyles.driveStatusText}>
                  Drive configurado el {projectData.driveSubmission.submitDateTime.toLocaleDateString()}
                </Text>
              </View>
              <Text style={componentStyles.driveStatusDescription}>
                Las fotos se están organizando automáticamente en la carpeta de Google Drive. Toca el ícono de información para ver detalles.
              </Text>
            </View>
          ) : (
            <View style={componentStyles.driveNotConfigured}>
              <Ionicons name="warning-outline" size={16} color="#f59e0b" />
              <Text style={componentStyles.driveNotConfiguredText}>
                Drive no configurado. Contacta al administrador para configurar la carpeta de Google Drive.
              </Text>
            </View>
          )}
        </View>

        {/* Details Section */}
        <View style={componentStyles.detailsSection}>
          <View style={componentStyles.detailRow}>
            <Ionicons name="business-outline" size={16} color="#6b7280" style={componentStyles.detailIcon} />
            <Text style={componentStyles.detailLabel}>Cliente:</Text>
            <Text style={componentStyles.detailValue}>{projectData.client}</Text>
          </View>
          <View style={componentStyles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#6b7280" style={componentStyles.detailIcon} />
            <Text style={componentStyles.detailLabel}>Ubicación:</Text>
            <Text style={componentStyles.detailValue}>{projectData.location}</Text>
          </View>
          <View style={componentStyles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color="#6b7280" style={componentStyles.detailIcon} />
            <Text style={componentStyles.detailLabel}>Contrato:</Text>
            <Text style={componentStyles.detailValue}>{projectData.contractId}</Text>
          </View>
          <View style={componentStyles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" style={componentStyles.detailIcon} />
            <Text style={componentStyles.detailLabel}>Fechas:</Text>
            <Text style={componentStyles.detailValue}>
              {formatDate(projectData.startDate)} - {formatDate(projectData.endDate)}
            </Text>
          </View>
          <View style={componentStyles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#6b7280" style={componentStyles.detailIcon} />
            <Text style={componentStyles.detailLabel}>Estado:</Text>
            <View style={componentStyles.statusDetailContainer}>
              <View style={[componentStyles.statusDot, componentStyles.statusActiveDot]} />
              <Text style={[componentStyles.detailValue, componentStyles.statusActiveText]}>Activo</Text>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={componentStyles.progressSectionContainer}>
          <View style={componentStyles.progressHeader}>
            <Text style={componentStyles.progressLabel}>Progreso del Proyecto</Text>
            <View style={componentStyles.progressStats}>
              <Text style={componentStyles.progressNumber}>{projectData.completedTurbines}</Text>
              <Text style={componentStyles.progressDivider}>/</Text>
              <Text style={componentStyles.progressTotal}>{projectData.totalTurbines}</Text>
              <Text style={componentStyles.progressUnit}>turbinas</Text>
            </View>
          </View>
          <View style={componentStyles.progressBarBackground}>
            <LinearGradient
              colors={['#a78bfa', '#8b5cf6']}
              style={[componentStyles.progressBarFill, { width: `${projectData.progress}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <View style={componentStyles.progressInfo}>
            <Text style={componentStyles.progressPercentText}>{projectData.progress}% completado</Text>
            <View style={[componentStyles.statusBadge, componentStyles.statusBadgeActive]}>
              <Ionicons name="checkmark-circle" size={12} color="#ffffff" />
              <Text style={componentStyles.statusBadgeText}>En Progreso</Text>
            </View>
          </View>
        </View>
        
        {/* Members Section */}
        <View style={componentStyles.membersCard}>
          <View style={componentStyles.membersHeaderContainer}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={componentStyles.membersHeaderIconContainer}
            >
              <Ionicons name="people-outline" size={16} color="#ffffff" />
            </LinearGradient>
            <Text style={componentStyles.membersTitle}>Equipo del Proyecto</Text>
          </View>
          
          {projectMembers.map((member, index) => (
            <View key={member.id}>
              <View style={componentStyles.memberRow}>
                <View style={componentStyles.avatarContainer}>
                  <Image source={member.avatar} style={componentStyles.avatarImage} />
                </View>
                <View style={componentStyles.memberInfo}>
                  <Text style={componentStyles.memberName}>{member.name}</Text>
                  <Text style={componentStyles.memberRole}>{member.role}</Text>
                </View>
                <TouchableOpacity style={componentStyles.contactButton}>
                  <Ionicons name="chatbubble-outline" size={16} color="#3b82f6" />
                </TouchableOpacity>
              </View>
              {index < projectMembers.length - 1 && <View style={componentStyles.memberSeparator} />}
            </View>
          ))}
        </View>
      </View>
      
      {renderDriveInfoModal()}
      {renderTurbinesModal()}
    </ScrollView>
  );
};

const componentStyles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingVertical: 16,
  },
  projectInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  projectHeaderInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  projectClient: {
    fontSize: 15,
    color: '#8b5cf6',
    fontWeight: '600',
    marginBottom: 6,
  },
  projectDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12, 
  },
  quickAccessButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16, 
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  highlightedQuickAccessButton: {
    backgroundColor: '#fffbeb', 
    borderColor: '#fde68a', 
  },
  quickAccessIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20, 
    backgroundColor: '#f9fafb', 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  quickAccessNotificationDot: {
    position: 'absolute',
    top: 0, 
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#f9fafb',
  },
  quickAccessButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  driveSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  driveSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  driveIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driveSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  driveActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driveStatus: {
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  driveStatusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  driveStatusText: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '500',
    marginLeft: 8,
  },
  driveStatusDescription: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
  driveNotConfigured: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  driveNotConfiguredText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
  },
  detailsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 12,
    width: 18,
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
    width: 85,
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    fontWeight: '500',
  },
  statusDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusActiveText: {
    color: '#10b981',
    fontWeight: '500',
  },
  statusActiveDot: {
    backgroundColor: '#10b981',
  },
  progressSectionContainer: {
    marginTop: 24,
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  progressNumber: {
    fontSize: 18,
    color: '#8b5cf6', 
    fontWeight: '700',
  },
  progressDivider: {
    fontSize: 14,
    color: '#9ca3af',
    marginHorizontal: 3,
    paddingBottom: 1, 
  },
  progressTotal: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    paddingBottom: 1,
  },
  progressUnit: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
    paddingBottom: 1,
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  progressPercentText: {
    fontSize: 14,
    color: '#8b5cf6', 
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 5,
  },
  statusBadgeActive: {
    backgroundColor: '#10b981',
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  membersCard: {
    backgroundColor: '#f9fafb', 
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  membersHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  membersHeaderIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  memberSeparator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb', 
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 13,
    color: '#6b7280',
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff', 
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  driveInfoContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  driveInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  driveInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  driveInfoLink: {
    fontSize: 13,
    color: '#3b82f6',
    marginBottom: 16,
    lineHeight: 18,
    textDecorationLine: 'underline',
  },
  driveInfoValue: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 16,
  },
  turbineItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  turbineItemCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  turbineItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  turbineInfo: {
    flex: 1,
  },
  turbineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  turbineNameCompleted: {
    color: '#065f46',
  },
  turbineDate: {
    fontSize: 13,
    color: '#6b7280',
  },
  turbineDateCompleted: {
    color: '#047857',
  },
  turbineCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  turbineCheckboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProjectInfoMenuEnhanced;
