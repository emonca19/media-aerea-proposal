import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

// --- DATOS DE PROYECTO (tomados de activity-log) ---
const mockTurbines = [
  { id: '1', name: 'T-001', status: 'IN_PROGRESS', lastInspection: '2023-05-15' },
  { id: '2', name: 'T-002', status: 'COMPLETED', lastInspection: '2023-05-16' },
  { id: '3', name: 'T-003', status: 'PENDING', lastInspection: '2023-04-28' },
  { id: '4', name: 'T-004', status: 'IN_PROGRESS', lastInspection: '2023-05-17' },
  { id: '5', name: 'T-005', status: 'PENDING', lastInspection: '2023-04-30' },
];
const mockProject = {
  name: 'Inspección Parque Eólico Norte',
  client: 'Energía Renovable S.A.',
  description: 'Inspección trimestral de las turbinas del parque norte con drone DJI M300',
  completedTurbines: mockTurbines.filter(t => t.status === 'COMPLETED').length,
  totalTurbines: mockTurbines.length,
  progress: Math.round((mockTurbines.filter(t => t.status === 'COMPLETED').length / mockTurbines.length) * 100),
  location: 'Carretera Nacional KM 124, Sinaloa',
  parkName: 'Parque Eólico Norte',
  startDate: '2023-05-10',
  endDate: '2023-06-20',
  contractId: 'CON-2023-045',
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
// --- FIN DATOS DE PROYECTO ---

const ProjectInfoMenu = () => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <View style={styles.card}>
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Ionicons name="briefcase-outline" size={32} color="#a78bfa" style={{ marginBottom: 6 }} />
        <Text style={styles.title}>{mockProject.name}</Text>
        <Text style={styles.client}>{mockProject.client}</Text>
        <Text style={styles.description}>{mockProject.description}</Text>
      </View>
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color="#6b7280" style={styles.detailIcon} />
          <Text style={styles.detailLabel}>Cliente:</Text>
          <Text style={styles.detailValue}>{mockProject.client}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="map-outline" size={16} color="#6b7280" style={styles.detailIcon} />
          <Text style={styles.detailLabel}>Parque:</Text>
          <Text style={styles.detailValue}>{mockProject.parkName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#6b7280" style={styles.detailIcon} />
          <Text style={styles.detailLabel}>Ubicación:</Text>
          <Text style={styles.detailValue}>{mockProject.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="document-text-outline" size={16} color="#6b7280" style={styles.detailIcon} />
          <Text style={styles.detailLabel}>Contrato:</Text>
          <Text style={styles.detailValue}>{mockProject.contractId}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" style={styles.detailIcon} />
          <Text style={styles.detailLabel}>Fechas:</Text>
          <Text style={styles.detailValue}>{formatDate(mockProject.startDate)} - {formatDate(mockProject.endDate)}</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Turbinas completadas: {mockProject.completedTurbines} / {mockProject.totalTurbines}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: `${mockProject.progress}%` }]} />
        </View>
        <Text style={styles.progressPercent}>{mockProject.progress}%</Text>
      </View>
      <View style={styles.membersCard}>
        <Text style={styles.membersTitle}>Integrantes del Proyecto</Text>
        {projectMembers.map((member) => (
          <View key={member.id} style={styles.memberRow}>
            <View style={styles.avatarBorder}>
              <Image source={member.avatar} style={styles.avatarImage} />
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },
  client: {
    fontSize: 15,
    color: '#a78bfa',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  detailsSection: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    width: '100%',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  detailIcon: {
    marginRight: 10,
    width: 20,
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
    width: 75,
  },
  detailValue: {
    fontSize: 14,
    color: '#1e3a8a',
    flex: 1,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 18,
    width: '100%',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '500',
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: '#ede9fe',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#a78bfa',
    borderRadius: 6,
  },
  progressPercent: {
    fontSize: 13,
    color: '#a78bfa',
    fontWeight: '600',
  },
  membersCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  membersTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'left',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatarBorder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#a78bfa',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 10,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  memberRole: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default ProjectInfoMenu;
