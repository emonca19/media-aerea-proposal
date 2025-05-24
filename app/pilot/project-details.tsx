import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Simulación de datos de proyecto (puedes reemplazar por props o contexto)
const mockProject = {
  name: 'Proyecto Eólico Norte',
  client: 'Energía Verde S.A.',
  description: 'Inspección y mantenimiento de parque eólico con 12 turbinas.',
  completedTurbines: 9,
  totalTurbines: 12,
  progress: 75, // porcentaje
  location: 'Parque Eólico Norte, Sonora',
  startDate: '2024-05-01',
  endDate: '2024-06-15',
};

// Simulación de datos de integrantes del proyecto
const projectMembers = [
  {
    id: 1,
    name: 'Carlos Méndez',
    role: 'Piloto Líder',
    avatar: require('../../assets/images/pilot-avatar.jpg'),
  },
  {
    id: 2,
    name: 'Ana Torres',
    role: 'Técnica de Mantenimiento',
    avatar: require('../../assets/images/wind-turbine-icon.png'),
  },
  {
    id: 3,
    name: 'Luis García',
    role: 'Supervisor',
    avatar: require('../../assets/images/media-logo.png'),
  },
];

export default function PilotProjectDetails() {
  const router = useRouter();
  const progress = Math.round((mockProject.completedTurbines / mockProject.totalTurbines) * 100);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Proyecto Actual</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/pilot/dashboard')}>
          <Ionicons name="arrow-back" size={26} color="#374151" />
        </TouchableOpacity>
        <View style={styles.card}>
          <Ionicons name="aperture-outline" size={40} color="#a78bfa" style={{ marginBottom: 10 }} />
          <Text style={styles.title}>{mockProject.name}</Text>
          <Text style={styles.client}>{mockProject.client}</Text>
          <Text style={styles.description}>{mockProject.description}</Text>
          {/* Datos adicionales combinados de la card de información */}
          <View style={{ marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6', width: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="business-outline" size={16} color="#6b7280" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 14, color: '#4b5563', fontWeight: '500', width: 75 }}>Cliente:</Text>
              <Text style={{ fontSize: 14, color: '#1e3a8a', flex: 1 }}>{mockProject.client}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="map-outline" size={16} color="#6b7280" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 14, color: '#4b5563', fontWeight: '500', width: 75 }}>Parque:</Text>
              <Text style={{ fontSize: 14, color: '#1e3a8a', flex: 1 }}>{mockProject.location.split(',')[0]}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="location-outline" size={16} color="#6b7280" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 14, color: '#4b5563', fontWeight: '500', width: 75 }}>Ubicación:</Text>
              <Text style={{ fontSize: 14, color: '#1e3a8a', flex: 1 }}>{mockProject.location}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 14, color: '#4b5563', fontWeight: '500', width: 75 }}>Fechas:</Text>
              <Text style={{ fontSize: 14, color: '#1e3a8a', flex: 1 }}>{mockProject.startDate} - {mockProject.endDate}</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Turbinas completadas: {mockProject.completedTurbines} / {mockProject.totalTurbines}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
        </View>

        {/* Solo los botones de acción debajo de la tarjeta principal */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '92%', paddingHorizontal: 0, marginTop: 16, marginBottom: 8, gap: 12 }}>
          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }} onPress={() => router.push('/pilot/site-map')}>
            <Ionicons name="map-outline" size={24} color="#10b981" />
            <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '600', color: '#1f2937' }}>Mapa de Sitio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }} onPress={() => router.push('/pilot/turbines')}>
            <Ionicons name="flash-outline" size={24} color="#0ea5e9" />
            <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '600', color: '#1f2937' }}>Turbinas</Text>
          </TouchableOpacity>
        </View>

        {/* Card de integrantes del proyecto */}
        <View style={styles.membersCard}>
          <Text style={styles.membersTitle}>Integrantes del Proyecto</Text>
          {projectMembers.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarBorder}>
                  <Image
                    source={member.avatar}
                    style={{ width: 38, height: 38, borderRadius: 19, resizeMode: 'cover' }}
                  />
                </View>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 32,
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingTop: 20,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  backButton: {
    position: 'absolute',
    top: 18, // antes 48, ahora más arriba
    left: 12, // más pegado al borde
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
  },
  card: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },
  client: {
    fontSize: 16,
    color: '#a78bfa',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 18,
    width: '100%',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  progressBarBg: {
    width: '100%',
    height: 14,
    backgroundColor: '#ede9fe',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: 14,
    backgroundColor: '#a78bfa',
    borderRadius: 8,
  },
  progressPercent: {
    fontSize: 13,
    color: '#a78bfa',
    fontWeight: 'bold',
    marginTop: 2,
  },
  membersCard: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginTop: 22,
    alignItems: 'flex-start',
  },
  membersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'left',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginRight: 0,
  },
  avatarBorder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#2563eb', // azul tipo Instagram stories
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  avatarImageWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  memberRole: {
    fontSize: 14,
    color: '#6b7280',
  },
});
