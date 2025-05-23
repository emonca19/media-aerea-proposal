import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { pilot } from './components/pilot-dashboard-data';

export default function PilotProfile() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: () => router.replace('/login') }
      ]
    );
  };
  const handleEditProfile = () => {
    // Implementar edición de perfil
    console.log('Editar perfil');
  };

  const handleSupportChat = () => {
    router.push('/pilot/support-chat');
  };

  const handleCalendar = () => {
    router.push('/pilot/calendar');
  };

  const handleStatistics = () => {
    router.push('/pilot/statistics');
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar backgroundColor="#1E3A8A" barStyle="light-content" />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header del perfil */}
        <View style={styles.header}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image source={pilot.avatar} style={styles.avatar} />
              <View style={styles.statusIndicator} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{pilot.name}</Text>
              <Text style={styles.role}>{pilot.role}</Text>
              <View style={styles.experienceBadge}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.experienceText}>{pilot.experience}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="pencil" size={18} color="#1E3A8A" />
          </TouchableOpacity>
        </View>

        {/* Información personal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información Personal</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="mail" size={20} color="#6b7280" />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <Text style={styles.infoValue}>carlos.rivera@mediaaerea.com</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="call" size={20} color="#6b7280" />
              <Text style={styles.infoLabel}>Teléfono</Text>
            </View>
            <Text style={styles.infoValue}>+34 612 345 678</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location" size={20} color="#6b7280" />
              <Text style={styles.infoLabel}>Ubicación</Text>
            </View>
            <Text style={styles.infoValue}>Madrid, España</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={20} color="#6b7280" />
              <Text style={styles.infoLabel}>Fecha de ingreso</Text>
            </View>
            <Text style={styles.infoValue}>15 de Marzo, 2022</Text>
          </View>
        </View>        {/* Estadísticas profesionales con gráficos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estadísticas Profesionales</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="airplane" size={24} color="#1E3A8A" />
              </View>
              <Text style={styles.statValue}>248</Text>
              <Text style={styles.statLabel}>Vuelos totales</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '92%', backgroundColor: '#1E3A8A' }]} />
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="time" size={24} color="#059669" />
              </View>
              <Text style={styles.statValue}>156h</Text>
              <Text style={styles.statLabel}>Horas de vuelo</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '78%', backgroundColor: '#059669' }]} />
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="construct" size={24} color="#dc2626" />
              </View>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Turbinas inspeccionadas</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '60%', backgroundColor: '#dc2626' }]} />
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="camera" size={24} color="#7c3aed" />
              </View>
              <Text style={styles.statValue}>1,234</Text>
              <Text style={styles.statLabel}>Fotos capturadas</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '85%', backgroundColor: '#7c3aed' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Gráfico de rendimiento semanal */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>Rendimiento Semanal</Text>
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>Ver más</Text>
              <Ionicons name="chevron-forward" size={16} color="#1E3A8A" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.weeklyChart}>
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => {
              const values = [85, 92, 78, 96, 88, 65, 45];
              const height = (values[index] / 100) * 80;
              const isToday = index === 4; // Viernes
              
              return (
                <View key={day} style={styles.chartDay}>
                  <View style={styles.chartBarContainer}>
                    <View style={[
                      styles.chartBar, 
                      { height },
                      isToday && styles.chartBarToday
                    ]} />
                  </View>
                  <Text style={[styles.chartDayLabel, isToday && styles.chartDayLabelToday]}>
                    {day}
                  </Text>
                  <Text style={[styles.chartDayValue, isToday && styles.chartDayValueToday]}>
                    {values[index]}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Accesos rápidos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Accesos Rápidos</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/pilot/calendar')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#e0f2fe' }]}>
                <Ionicons name="calendar" size={24} color="#0369a1" />
              </View>
              <Text style={styles.quickActionLabel}>Calendario</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/pilot/support-chat')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="chatbubble-ellipses" size={24} color="#059669" />
              </View>
              <Text style={styles.quickActionLabel}>Chat de Ayuda</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/pilot/statistics')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="stats-chart" size={24} color="#d97706" />
              </View>
              <Text style={styles.quickActionLabel}>Estadísticas</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/pilot/project-history')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#f3e8ff' }]}>
                <Ionicons name="library" size={24} color="#7c3aed" />
              </View>
              <Text style={styles.quickActionLabel}>Historial</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Certificaciones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Certificaciones</Text>
          
          <View style={styles.certificationItem}>
            <View style={styles.certificationIcon}>
              <Ionicons name="ribbon" size={20} color="#059669" />
            </View>
            <View style={styles.certificationInfo}>
              <Text style={styles.certificationName}>Licencia de Piloto UAS A2</Text>
              <Text style={styles.certificationDate}>Válida hasta: Diciembre 2025</Text>
            </View>
            <View style={styles.certificationStatus}>
              <Text style={styles.statusActive}>Activa</Text>
            </View>
          </View>

          <View style={styles.certificationItem}>
            <View style={styles.certificationIcon}>
              <Ionicons name="ribbon" size={20} color="#059669" />
            </View>
            <View style={styles.certificationInfo}>
              <Text style={styles.certificationName}>Certificación de Inspección Industrial</Text>
              <Text style={styles.certificationDate}>Válida hasta: Junio 2026</Text>
            </View>
            <View style={styles.certificationStatus}>
              <Text style={styles.statusActive}>Activa</Text>
            </View>
          </View>

          <View style={styles.certificationItem}>
            <View style={styles.certificationIcon}>
              <Ionicons name="ribbon" size={20} color="#f59e0b" />
            </View>
            <View style={styles.certificationInfo}>
              <Text style={styles.certificationName}>Curso de Seguridad en Altura</Text>
              <Text style={styles.certificationDate}>Válida hasta: Marzo 2025</Text>
            </View>
            <View style={styles.certificationStatus}>
              <Text style={styles.statusExpiring}>Por vencer</Text>
            </View>
          </View>
        </View>        {/* Configuración */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configuración</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/pilot/calendar')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="calendar" size={20} color="#1E3A8A" />
              <Text style={styles.settingLabel}>Mi Calendario</Text>
            </View>
            <View style={styles.settingBadge}>
              <Text style={styles.settingBadgeText}>3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/pilot/support-chat')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#059669" />
              <Text style={styles.settingLabel}>Chat de Soporte</Text>
            </View>
            <View style={styles.settingIndicator}>
              <View style={styles.onlineIndicator} />
              <Text style={styles.onlineText}>En línea</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={20} color="#6b7280" />
              <Text style={styles.settingLabel}>Notificaciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark" size={20} color="#6b7280" />
              <Text style={styles.settingLabel}>Privacidad y Seguridad</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle" size={20} color="#6b7280" />
              <Text style={styles.settingLabel}>Ayuda y Soporte</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle" size={20} color="#6b7280" />
              <Text style={styles.settingLabel}>Acerca de</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Botón de cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  experienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  experienceText: {
    fontSize: 12,
    color: '#92400e',
    marginLeft: 4,
    fontWeight: '500',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  certificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  certificationInfo: {
    flex: 1,
  },
  certificationName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  certificationDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  certificationStatus: {
    marginLeft: 8,
  },
  statusActive: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusExpiring: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '500',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500',
    marginLeft: 8,
  },  bottomSpacing: {
    height: 20,
  },
  // Nuevos estilos para gráficos y accesos rápidos
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#1E3A8A',
    marginRight: 4,
    fontWeight: '500',
  },
  weeklyChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingHorizontal: 8,
  },
  chartDay: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarContainer: {
    height: 80,
    width: 24,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  chartBar: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    minHeight: 4,
  },
  chartBarToday: {
    backgroundColor: '#1E3A8A',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  chartDayLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  chartDayLabelToday: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  chartDayValue: {
    fontSize: 10,
    color: '#9ca3af',
  },
  chartDayValueToday: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },  quickActionLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  settingBadge: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  settingBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  settingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
});
