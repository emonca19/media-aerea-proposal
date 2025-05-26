"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { mockAdminUsers } from "../../../src/mocks/users";
import Constants from "expo-constants";

const admin = mockAdminUsers[0];

export default function AdminProfile() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: () => router.replace("/login"),
        },
      ]
    );
  };

  const handleEditProfile = () => {};
  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header del perfil */}
        <View style={styles.header}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: admin.profileImage }}
                style={styles.avatar}
              />
              <View style={styles.statusIndicator} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{admin.name}</Text>
              <View style={styles.permissionsBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#059669" />
                <Text style={styles.permissionsText}>Administrador</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
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
            <Text style={styles.infoValue}>{admin.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="business" size={20} color="#6b7280" />
              <Text style={styles.infoLabel}>Rol</Text>
            </View>
            <Text style={styles.infoValue}>Administrador del Sistema</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={20} color="#6b7280" />
              <Text style={styles.infoLabel}>Cuenta creada</Text>
            </View>
            <Text style={styles.infoValue}>Mayo 2023</Text>
          </View>
        </View>
        {/* Resumen Operativo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen Operativo</Text>
          <View style={styles.operationalCard}>
            <View style={styles.operationalHeader}>
              <Ionicons name="analytics" size={24} color="#ffffff" />
              <View style={styles.operationalInfo}>
                <Text style={styles.operationalTitle}>Estado del Sistema</Text>
                <Text style={styles.operationalSubtitle}>
                  Actualizado hace 5 min
                </Text>
              </View>
            </View>

            <View style={styles.operationalStats}>
              <View style={styles.operationalStat}>
                <Text style={styles.operationalValue}>8</Text>
                <Text style={styles.operationalLabel}>Proyectos Activos</Text>
              </View>
              <View style={styles.operationalStat}>
                <Text style={styles.operationalValue}>5</Text>
                <Text style={styles.operationalLabel}>Pilotos Activos</Text>
              </View>
              <View style={styles.operationalStat}>
                <Text style={styles.operationalValue}>89%</Text>
                <Text style={styles.operationalLabel}>Eficiencia Media</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.kpiAccessButton}
            onPress={() => router.push("/admin/kpisdashboard")}
          >
            <Ionicons name="stats-chart" size={20} color="#ffffff" />
            <Text style={styles.kpiAccessText}>Ver Indicadores Completos</Text>
          </TouchableOpacity>
        </View>
        {/* Configuración */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configuración</Text>

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
              <Text style={styles.settingLabel}>Seguridad</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="settings" size={20} color="#6b7280" />
              <Text style={styles.settingLabel}>Preferencias</Text>
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
    backgroundColor: "#f0f2f5",
  },
  container: {
    flex: 1,
  },
  scrollContent: {},
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: Constants.statusBarHeight, // Reduced paddingTop
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#ffffff",
    backgroundColor: "#f3f4f6",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#22c55e",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  permissionsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  permissionsText: {
    fontSize: 12,
    color: "#059669",
    marginLeft: 4,
    fontWeight: "500",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: "#1f2937",
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  logoutText: {
    fontSize: 16,
    color: "#dc2626",
    fontWeight: "500",
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  }, // Operational Summary Styles
  operationalCard: {
    backgroundColor: "#1e40af",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#1e40af",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    // Create a gradient-like effect with overlays
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  operationalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  operationalInfo: {
    marginLeft: 12,
    flex: 1,
  },
  operationalTitle: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  operationalSubtitle: {
    fontSize: 12,
    color: "#e0e7ff",
    marginTop: 2,
  },
  operationalStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  operationalStat: {
    alignItems: "center",
    flex: 1,
  },
  operationalValue: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
  },
  operationalLabel: {
    fontSize: 11,
    color: "#e0e7ff",
    textAlign: "center",
    marginTop: 4,
  },
  kpiAccessButton: {
    backgroundColor: "#1f2937",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  kpiAccessText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});
