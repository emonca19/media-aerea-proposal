import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { pilot } from './components/pilot-dashboard-data';

import PilotStatistics from './statistics';

export default function PilotProfile() {
  const router = useRouter();

  const handleLogout = async () => {
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Card de perfil */}
      <View style={styles.profileCard}>
        <Image source={pilot.avatar} style={styles.avatar} />
        <Text style={styles.name}>{pilot.name}</Text>
        <Text style={styles.role}>{pilot.role}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={18} color="#64748b" style={{ marginRight: 6 }} />
          <Text style={styles.infoText}>Licencia: {pilot.licenseNumber}</Text>
        </View>
      </View>


      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas personales</Text>
        <PilotStatistics />
      </View>

      {/* Botones de configuración */}
      <View style={styles.settingsSection}>
        <TouchableOpacity 
          style={styles.settingButton} 
          onPress={() => router.push('/pilot/calendar')}
        >
          <Ionicons name="calendar-outline" size={24} color="#fff" style={styles.settingIcon} />
          <Text style={styles.settingText}>Calendario</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#fff" style={styles.settingArrow} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingButton} 
          onPress={() => router.push('/pilot/support-chat')}
        >
          <Ionicons name="headset-outline" size={24} color="#fff" style={styles.settingIcon} />
          <Text style={styles.settingText}>Soporte</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#fff" style={styles.settingArrow} />
        </TouchableOpacity>
      </View>

      {/* logout button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 0,
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    padding: 28,
    marginTop: 24,
    marginBottom: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#a78bfa',
  },
  name: {
    color: '#1e293b',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  role: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  infoText: {
    color: '#64748b',
    fontSize: 15,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 0,
    marginBottom: 24,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 24,
  },
  settingsSection: {
    width: '90%',
    maxWidth: 400,
    marginBottom: 24,
    gap: 12,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingArrow: {
    opacity: 0.8,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#E85F5C',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    maxWidth: 350,
    alignSelf: 'center',
    shadowColor: '#E33D3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
