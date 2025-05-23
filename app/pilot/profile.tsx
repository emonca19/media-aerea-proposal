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
      {/* Card de perfil mejorado */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <Image source={pilot.avatar} style={styles.avatar} />
          <View style={styles.profileInfoBlock}>
            <Text style={styles.name}>{pilot.name}</Text>
            <Text style={styles.role}>{pilot.role}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={18} color="#64748b" style={{ marginRight: 6 }} />
              <Text style={styles.infoText}>Licencia: {pilot.licenseNumber}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sección de estadísticas personales y cumplimiento diario más juntos */}
      <View style={styles.sectionTight}>
       {/*  <Text style={styles.sectionTitle}>Estadísticas personales</Text> */}
        <PilotStatistics />
      </View>

      {/* Botones de configuración */}
      <View style={styles.settingsSection}>
        {/* Botón de historial de proyectos (ahora primero y con formato igual a los otros) */}
        <TouchableOpacity 
          style={[styles.settingButton, { backgroundColor: '#6366f1' }]} 
          onPress={() => router.push('/pilot/project-history')}
        >
          <Ionicons name="briefcase-outline" size={22} color="#fff" style={styles.settingIcon} />
          <Text style={styles.settingText}>Mi historial de proyectos</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#fff" style={styles.settingArrow} />
        </TouchableOpacity>

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

      {/* Acceso directo a historial de proyectos */}
      {/* <TouchableOpacity style={styles.projectHistoryShortcut} onPress={() => router.push('/pilot/project-history')}>
        <Ionicons name="briefcase-outline" size={20} color="#2563eb" style={{ marginRight: 10 }} />
        <Text style={styles.projectHistoryShortcutText}>Historial de proyectos</Text>
        <Ionicons name="chevron-forward-outline" size={18} color="#64748b" style={{ marginLeft: 'auto' }} />
      </TouchableOpacity> */}

      {/* Espacio entre historial y acciones rápidas */}
      <View style={{ height: 10 }} />

      {/* Botones de acciones rápidas: Calendario y Soporte (estilo tarjeta, ícono circular, alineados horizontalmente) */}
      {/* <View style={styles.quickActionsRowWrapper}>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/pilot/support-chat')}>
            <View style={[styles.quickActionIconCircle, { backgroundColor: '#ef4444' }]}> 
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
            </View>
            <Text style={styles.quickActionCardText}>Soporte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/pilot/calendar')}>
            <View style={[styles.quickActionIconCircle, { backgroundColor: '#8b5cf6' }]}> 
              <Ionicons name="calendar-outline" size={16} color="#fff" />
            </View>
            <Text style={styles.quickActionCardText}>Calendario</Text>
          </TouchableOpacity>
        </View>
      </View> */}

      {/* Espacio entre acciones rápidas y logout */}
      <View style={{ height: 16 }} />


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
    alignItems: 'flex-start',
    backgroundColor: '#f3f4f6', // Fondo claro como antes
    borderRadius: 24,
    padding: 24, // Más margen interno
    marginTop: 32, // Más margen superior
    marginBottom: 18, // Más margen inferior
    width: '92%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 18,
    borderWidth: 2,
    borderColor: '#a78bfa',
  },
  profileInfoBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: '#1e293b',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  role: {
    color: '#6366f1',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
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
  sectionTight: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 0,
    marginBottom: 18,
    width: '100%', // Cambiado de 100% a '100%' para asegurar full width
    maxWidth: '100%', // Eliminar límite de ancho
    alignItems: 'stretch', // Forzar hijos a ocupar todo el ancho
    shadowColor: 'transparent', // Quitar sombra
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    marginTop: 0,
  },
  sectionTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6, // Mucho menos espacio arriba
    marginBottom: 2, // Mucho menos espacio abajo
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
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
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

  /* projectHistoryShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 2,
    marginBottom: 0,
    width: 332,
    maxWidth: 332,
    alignSelf: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 1,
  } */
  projectHistoryShortcutText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  quickActionsRowWrapper: {
    width: 332,
    alignSelf: 'center',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 16,
    paddingHorizontal: 22,
    minWidth: 148,
    flex: 1,
    marginHorizontal: 0,
    shadowColor: 'transparent',
    elevation: 0,
  },
  quickActionIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  quickActionCardText: {
    color: '#1e293b',
    fontWeight: '700',
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#E85F5C',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 0,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    maxWidth: 400,
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
  // Ajuste: botón de ver métricas detalladas (en PilotStatistics) debe tener el mismo ancho y alineación
  detailedMetricsButton: {
    width: 332,
    maxWidth: 332,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 0,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    // Sombra opcional para coherencia visual
    shadowColor: 'transparent',
    elevation: 0,
  },
});
