import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
    avatar: require('./../../assets/images/pilot-avatar.jpg'),
  },
  {
    id: 2,
    name: 'Ana Torres',
    role: 'Técnica de Mantenimiento',
    avatar: require('./../../assets/images/wind-turbine-icon.png'),
  },
  {
    id: 3,
    name: 'Luis García',
    role: 'Supervisor de Campo',
    avatar: require('./../../assets/images/media-logo.png'),
  },
];

const ProjectInfoMenuEnhanced = () => {
  const router = useRouter();
  const [projectData, setProjectData] = useState<ProjectData>(mockProject);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showTurbinesModal, setShowTurbinesModal] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
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
            status: newIsCompleted ? 'COMPLETED' as const : 'PENDING' as const
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
  };

  const submitTurbineProgress = () => {
    setShowTurbinesModal(false);
    // Potentially add API call here to submit progress
    console.log("Progreso de turbinas enviado:", projectData.turbines.filter(t => t.isCompleted));
  };

  const renderDriveInfoModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showDriveModal}
      onRequestClose={() => setShowDriveModal(false)}
      statusBarTranslucent={false}
    >
      <View style={modalStyles.fullScreenContainer}>
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContent}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={modalStyles.scrollContentContainer}
              style={modalStyles.scrollView}
              bounces={false} // Changed to false for a cleaner look if content is short
            >
              {/* Modal Header */}
              <View style={modalStyles.modalHeader}>
                {/* Close button */}
                <TouchableOpacity
                  style={modalStyles.closeButton}
                  onPress={() => setShowDriveModal(false)}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>

                <View style={modalStyles.modalIconContainer}>
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={modalStyles.modalIconGradient}
                  >
                    <Ionicons name="cloud-outline" size={28} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={modalStyles.modalTitle}>Google Drive del Proyecto</Text>
                <Text style={modalStyles.modalSubtitle}>
                  Carpeta de almacenamiento.
                </Text>
              </View>

              {/* Drive Info Display */}
              <View style={modalStyles.driveInfoContainer}>
                <View style={modalStyles.driveInfoSection}>
                  <View style={modalStyles.driveInfoRow}>
                    <View style={modalStyles.driveInfoIconContainer}>
                      <Ionicons name="link" size={18} color="#10b981" />
                    </View>
                    <View style={modalStyles.driveInfoTextContainer}>
                      <Text style={modalStyles.driveInfoLabel}>Enlace configurado</Text>
                      <Text style={modalStyles.driveInfoLink} numberOfLines={3}>
                        {projectData.driveSubmission?.driveLink || 'No configurado'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={modalStyles.driveInfoDivider} />

                <View style={modalStyles.driveInfoSection}>
                  <View style={modalStyles.driveInfoRow}>
                    <View style={modalStyles.driveInfoIconContainer}>
                      <Ionicons name="calendar" size={18} color="#10b981" />
                    </View>
                    <View style={modalStyles.driveInfoTextContainer}>
                      <Text style={modalStyles.driveInfoLabel}>Fecha de configuración</Text>
                      <Text style={modalStyles.driveInfoValue}>
                        {projectData.driveSubmission?.submitDateTime.toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={modalStyles.driveInfoDivider} />

                <View style={modalStyles.driveInfoSection}>
                  <View style={modalStyles.driveInfoRow}>
                    <View style={modalStyles.driveInfoIconContainer}>
                      <Ionicons name="person" size={18} color="#10b981" />
                    </View>
                    <View style={modalStyles.driveInfoTextContainer}>
                      <Text style={modalStyles.driveInfoLabel}>Administrador responsable</Text>
                      <Text style={modalStyles.driveInfoValue}>
                        {projectData.adminResponsible}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Turbines Status Section */}
              <View style={modalStyles.turbinesStatusContainer}>
                <View style={modalStyles.turbinesStatusHeader}>
                  <View style={modalStyles.turbinesStatusIconContainer}>
                    <Ionicons name="nuclear-outline" size={20} color="#3b82f6" />
                  </View>
                  <Text style={modalStyles.turbinesStatusTitle}>Estado de las Turbinas</Text>
                </View>

                <View style={modalStyles.turbinesProgressCard}>
                  <View style={modalStyles.turbinesProgressHeader}>
                    <Text style={modalStyles.turbinesProgressText}>
                      {projectData.completedTurbines} de {projectData.totalTurbines} completadas
                    </Text>
                    <View style={modalStyles.turbinesProgressBadge}>
                      <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={modalStyles.turbinesProgressBadgeGradient}
                      >
                        <Text style={modalStyles.turbinesProgressBadgeText}>
                          {Math.round((projectData.completedTurbines / projectData.totalTurbines) * 100)}%
                        </Text>
                      </LinearGradient>
                    </View>
                  </View>

                  <View style={modalStyles.turbinesProgressBarContainer}>
                    <View style={modalStyles.turbinesProgressBar}>
                      <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={[
                          modalStyles.turbinesProgressBarFill,
                          { width: `${(projectData.completedTurbines / projectData.totalTurbines) * 100}%` }
                        ]}
                      />
                    </View>
                  </View>
                </View>

                <View style={modalStyles.turbinesListContainer}>
                  <View style={modalStyles.turbinesListHeader}>
                    <View style={modalStyles.turbinesStatusItem}>
                      <View style={[modalStyles.turbinesStatusDot, { backgroundColor: '#10b981' }]} />
                      <Text style={modalStyles.turbinesStatusLabel}>
                        Completadas ({projectData.turbines.filter(t => t.isCompleted).length})
                      </Text>
                    </View>
                    <View style={modalStyles.turbinesStatusItem}>
                      <View style={[modalStyles.turbinesStatusDot, { backgroundColor: '#f59e0b' }]} />
                      <Text style={modalStyles.turbinesStatusLabel}>
                        Pendientes ({projectData.turbines.filter(t => !t.isCompleted).length})
                      </Text>
                    </View>
                  </View>

                  <View style={modalStyles.turbinesGrid}>
                    {projectData.turbines.map((turbine) => (
                      <TouchableOpacity
                        key={turbine.id}
                        style={[
                          modalStyles.turbineGridItem,
                          turbine.isCompleted && modalStyles.turbineGridItemCompleted
                        ]}
                        onPress={() => {
                          setShowDriveModal(false);
                          router.push({
                            pathname: '/pilot/turbines-status',
                            params: {
                              selectedTurbineId: turbine.id,
                              fromModal: 'true'
                            }
                          });
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={modalStyles.turbineGridIconContainer}>
                          {turbine.isCompleted ? (
                            <LinearGradient
                              colors={['#10b981', '#059669']}
                              style={modalStyles.turbineIconGradientCompleted}
                            >
                              <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color="#ffffff"
                              />
                            </LinearGradient>
                          ) : (
                            <Ionicons
                              name="ellipse-outline"
                              size={14}
                              color="#d1d5db"
                            />
                          )}
                        </View>
                        <Text style={[
                          modalStyles.turbineGridName,
                          turbine.isCompleted && modalStyles.turbineGridNameCompleted
                        ]}>
                          {turbine.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
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
          style={modalStyles.modalOverlayTouchable} // Renamed for clarity
          activeOpacity={1}
          onPress={() => setShowTurbinesModal(false)}
        >
          <View
            style={[modalStyles.modalContent, { maxHeight: '80%' }]}
            onStartShouldSetResponder={() => true} // Prevents touch from passing through to overlay
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
              style={{ flex: 1, marginBottom: 16 }} // Adjusted marginBottom
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 10 }}
              bounces={true}
              alwaysBounceVertical={true}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    modalStyles.turbineItem,
                    item.isCompleted && modalStyles.turbineItemCompleted
                  ]}
                  onPress={() => handleTurbineToggle(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={modalStyles.turbineItemContent}>
                    <View style={modalStyles.turbineIconSection}>
                      {item.isCompleted ? (
                        <LinearGradient
                          colors={['#10b981', '#059669']}
                          style={modalStyles.turbineCompletedIcon}
                        >
                          <Ionicons name="nuclear-outline" size={18} color="#ffffff" />
                        </LinearGradient>
                      ) : (
                        <View style={modalStyles.turbinePendingIcon}>
                          <Ionicons name="nuclear-outline" size={18} color="#9ca3af" />
                        </View>
                      )}
                    </View>

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

                      {/* Status indicator */}
                      <View style={modalStyles.turbineStatusRow}>
                        <View style={[
                          modalStyles.turbineStatusDot,
                          { backgroundColor: item.isCompleted ? '#10b981' : '#f59e0b' }
                        ]} />
                        <Text style={[
                          modalStyles.turbineStatusText,
                          { color: item.isCompleted ? '#059669' : '#d97706' }
                        ]}>
                          {item.isCompleted ? 'Completada' : 'Pendiente'}
                        </Text>
                      </View>
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
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );

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
            onPress={() => router.push('/pilot/turbines-status')}
          >
            <View style={componentStyles.quickAccessIconContainer}>
              <Ionicons name="nuclear-outline" size={20} color="#3b82f6" />
            </View>
            <Text style={componentStyles.quickAccessButtonText}>Ver Turbinas</Text>
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
            style={componentStyles.quickAccessButton}
            onPress={handleDriveInfo}
          >
            <View style={componentStyles.quickAccessIconContainer}>
              <Ionicons name="cloud-outline" size={20} color="#f59e0b" />
              {projectData.driveSubmission && <View style={componentStyles.quickAccessNotificationDot} />}
            </View>
            <Text style={componentStyles.quickAccessButtonText}>Drive</Text>
          </TouchableOpacity>
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
            <View style={componentStyles.detailValueBadgeContainer}>
              <View style={[componentStyles.statusBadgeSmall, componentStyles.statusBadgeSmallActive]}>
                <Ionicons name="play-circle-outline" size={12} color="#ffffff" />
                <Text style={componentStyles.statusBadgeTextSmall}>Activo</Text>
              </View>
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
    paddingVertical: 20, // Increased padding
    paddingHorizontal: 16,
  },
  projectInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16, // Slightly more rounded
    padding: 20,
    // marginHorizontal: 16, // Removed as scrollContent now has horizontal padding
    marginBottom: 24, // Increased bottom margin
    shadowColor: '#9ca3af', // Softer shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align to top for potentially longer descriptions
    marginBottom: 24,
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
    fontSize: 22, // Slightly larger
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  projectClient: {
    fontSize: 15,
    color: '#8b5cf6',
    fontWeight: '600',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#4b5563', // Slightly lighter for description
    lineHeight: 20,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Changed from space-between
    marginBottom: 28, // Increased margin
    gap: 10, // Retain some gap
  },
  quickAccessButton: {
    // flex: 1, // Removed to allow natural width
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, // Reduced vertical padding for compactness
    paddingHorizontal: 10,
    borderRadius: 10, // Slightly more rounded
    backgroundColor: '#f9fafb', // Lighter background
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 90, // Ensure a minimum width
  },
  quickAccessIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff', // White background for icon
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  quickAccessNotificationDot: {
    position: 'absolute',
    top: -2, // Adjusted position
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  quickAccessButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  // Removed driveSection styles as they are specific to a layout not currently used on main screen
  detailsSection: {
    paddingTop: 20, // Increased padding
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 14, // Increased gap
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 12,
    width: 20, // Slightly wider for icon
    textAlign: 'center',
    color: '#8b5cf6', // Use accent color for icons
  },
  detailLabel: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
    width: 90, // Adjusted width
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    fontWeight: '500',
  },
  detailValueBadgeContainer: { // New container for the status badge in details
    flex: 1,
    alignItems: 'flex-start', // Align badge to the start
  },
  statusBadgeSmall: { // For the "Activo" badge in details
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 5,
  },
  statusBadgeSmallActive: {
    backgroundColor: '#10b981', // Green for active
  },
  statusBadgeTextSmall: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  progressSectionContainer: {
    marginTop: 28, // Increased margin
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16, // Slightly larger
    color: '#374151',
    fontWeight: '600',
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  progressNumber: {
    fontSize: 20, // Larger for emphasis
    color: '#8b5cf6',
    fontWeight: '700',
  },
  progressDivider: {
    fontSize: 16,
    color: '#9ca3af',
    marginHorizontal: 3,
    paddingBottom: 2,
  },
  progressTotal: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    paddingBottom: 2,
  },
  progressUnit: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 5,
    paddingBottom: 2,
  },
  progressBarBackground: {
    width: '100%',
    height: 14, // Thicker bar
    backgroundColor: '#e5e7eb',
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 7,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 6,
  },
  progressPercentText: {
    fontSize: 15, // Slightly larger
    color: '#8b5cf6',
    fontWeight: '700',
  },
  statusBadge: { // General status badge (e.g., "En Progreso")
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, // More padding
    paddingVertical: 6,
    borderRadius: 18,
    gap: 6,
  },
  statusBadgeActive: {
    backgroundColor: '#10b981',
  },
  statusBadgeText: {
    fontSize: 13, // Slightly larger
    color: '#ffffff',
    fontWeight: '600',
  },
  membersCard: {
    backgroundColor: '#ffffff', // Changed to white for consistency with main card
    borderRadius: 12,
    padding: 16,
    marginTop: 28, // Increased margin
    borderWidth: 1,
    borderColor: '#e5e7eb', // Softer border
  },
  membersHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  membersHeaderIconContainer: {
    width: 32, // Larger icon container
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  membersTitle: {
    fontSize: 17, // Slightly larger
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  memberSeparator: {
    height: 1,
    backgroundColor: '#f3f4f6', // Lighter separator
  },
  avatarContainer: {
    width: 44, // Larger avatar
    height: 44,
    borderRadius: 22,
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
    marginLeft: 16, // Increased margin
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 3,
  },
  memberRole: {
    fontSize: 13,
    color: '#6b7280',
  },
  contactButton: {
    width: 40, // Larger button
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const modalStyles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
  },
  modalOverlay: { // This is the main container for the modal, pushing it to bottom
    flex: 1,
    justifyContent: 'flex-end',
    // paddingTop: 50, // Removed, let modalContent handle its height
  },
  modalOverlayTouchable: { // This is the touchable overlay for closing the modal
    flex:1,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24, // More rounded
    borderTopRightRadius: 24,
    // flex: 1, // Removed, maxHeight will control size
    maxHeight: '90%', // Ensure it doesn't take full screen
    overflow: 'hidden',
    paddingTop: 8, // Small padding at the top of content, before header
  },
  scrollView: {
    flexGrow: 0, // So it doesn't try to take all space if content is small
  },
  scrollContentContainer: {
    paddingBottom: 30, // More space at the bottom for scroll
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 16, // Adjusted padding
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#f8fafc', // Consistent with main screen cards
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    position: 'relative', // For close button positioning
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36, // Larger touch area
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    zIndex: 10, // Ensure it's above other header content
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIconGradient: {
    width: 60, // Larger icon
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Subtle shadow for icon
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  modalTitle: {
    fontSize: 22, // Larger title
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15, // Slightly larger subtitle
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10, // Ensure it doesn't stretch too wide
  },
  driveInfoContainer: {
    marginHorizontal: 20, // Consistent margin
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  driveInfoSection: {
    padding: 16,
  },
  driveInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  driveInfoIconContainer: {
    width: 36, // Slightly larger
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driveInfoTextContainer: {
    flex: 1,
  },
  driveInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  driveInfoLink: {
    fontSize: 13, // Slightly larger
    color: '#3b82f6',
    lineHeight: 18,
  },
  driveInfoValue: {
    fontSize: 14, // Slightly larger
    color: '#1f2937',
    fontWeight: '500',
  },
  driveInfoDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
  },
  turbinesStatusContainer: {
    marginHorizontal: 20, // Consistent margin
    marginTop: 16, // Added top margin
    marginBottom: 20,
  },
  turbinesStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Increased margin
  },
  turbinesStatusIconContainer: {
    width: 32, // Larger
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  turbinesStatusTitle: {
    fontSize: 17, // Larger
    fontWeight: '600',
    color: '#1f2937',
  },
  turbinesProgressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  turbinesProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  turbinesProgressText: {
    fontSize: 15, // Larger
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  turbinesProgressBadge: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  turbinesProgressBadgeGradient: {
    paddingHorizontal: 10, // More padding
    paddingVertical: 5,
  },
  turbinesProgressBadgeText: {
    fontSize: 13, // Larger
    fontWeight: 'bold',
    color: '#ffffff',
  },
  turbinesProgressBarContainer: {
    marginTop: 8,
  },
  turbinesProgressBar: {
    height: 8, // Thicker bar
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  turbinesProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  turbinesListContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  turbinesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16, // Increased margin
  },
  turbinesStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  turbinesStatusDot: {
    width: 8, // Larger dot
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  turbinesStatusLabel: {
    fontSize: 12, // Larger label
    fontWeight: '500',
    color: '#6b7280',
  },
  turbinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Increased gap
  },
  turbineGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 75, // Slightly wider
  },
  turbineGridItemCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  turbineGridIconContainer: {
    marginRight: 6,
  },
  turbineIconGradientCompleted: {
    width: 18, // Larger icon
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turbineGridName: {
    fontSize: 12, // Larger name
    fontWeight: '500',
    color: '#6b7280',
  },
  turbineGridNameCompleted: {
    color: '#065f46',
    fontWeight: '600',
  },
  // Styles for Turbines Selection Modal (renderTurbinesModal)
  turbineItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12, // Reduced padding slightly for compactness
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#9ca3af',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  turbineItemCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  turbineItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  turbineIconSection: {
    marginRight: 12,
  },
  turbineCompletedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turbinePendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  turbineInfo: {
    flex: 1,
  },
  turbineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 3,
  },
  turbineNameCompleted: {
    color: '#059669',
  },
  turbineDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
  },
  turbineDateCompleted: {
    color: '#065f46',
  },
  turbineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Re-using turbinesStatusDot from above
  turbineStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  turbineCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  turbineCheckboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16, // Added vertical padding
    paddingBottom: 24, // More bottom padding for safe area
    gap: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14, // Increased padding
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 15, // Slightly larger
    fontWeight: '600',
  },
  submitButton: {
    flex: 1.5, // Give submit button more width
    borderRadius: 12,
    overflow: 'hidden', // For gradient
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14, // Match cancel button
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15, // Match cancel button
    fontWeight: '600',
  },
});

export default ProjectInfoMenuEnhanced;