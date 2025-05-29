import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useWeather from './../hooks/useWeather';
import { pilot } from './components/pilot-dashboard-data';

export default function PilotProfile() {
  const router = useRouter();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [hasNotifications, setHasNotifications] = useState(
    typeof window !== 'undefined' && !!window.__hasNotifications
  );

  const {
    weather,
    loading: weatherLoading,
    error: weatherError,
  } = useWeather();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        setHasNotifications(!!window.__hasNotifications);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getWeatherIcon = (condition: string) => {
    const conditionLower = (condition || "").toLowerCase() || "";
    if (
      conditionLower.includes("sol") ||
      conditionLower.includes("despejado")
    ) {
      return "sunny-outline";
    } else if (
      conditionLower.includes("nublado") ||
      conditionLower.includes("nube")
    ) {
      return "partly-sunny-outline";
    } else if (
      conditionLower.includes("lluvia") ||
      conditionLower.includes("lluvioso")
    ) {
      return "rainy-outline";
    } else if (conditionLower.includes("viento")) {
      return "leaf-outline";
    }
    return "cloud-outline";
  };

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

  return (
    <View style={styles.screenContainer}>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Dashboard-style Header */}
        <View style={styles.welcomeContainer}>
          <View style={styles.header}>
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                <Image source={pilot.avatar} style={styles.avatar} />
                <View style={styles.statusIndicator} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.name}>{pilot.name}</Text>
                <Text style={styles.role}>{pilot.role}</Text>
                <Text style={styles.dateText}>
                  {formatDate(currentDateTime)}
                </Text>
              </View>
            </View>
            <View style={styles.rightSection}>
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Ionicons name="pencil" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
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

        {/* Configuración */}
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
  // Dashboard-style header styles
  welcomeContainer: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 382,
    alignSelf: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    minHeight: 97,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
    flexShrink: 0,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "white",
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "800",
    marginBottom: 2,
    lineHeight: 22,
  },
  role: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
    lineHeight: 18,
  },
  dateText: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
    textTransform: "capitalize",
    marginTop: 4,
    lineHeight: 14,
  },
  rightSection: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
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
  },  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
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
    // Removed shadow and elevation for flat design
  },
  logoutText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500',
    marginLeft: 8,
  },  bottomSpacing: {
    height: 20,
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
