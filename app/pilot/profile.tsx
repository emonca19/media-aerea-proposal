// app/pilot/profile.tsx (or your actual path)
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, StatusBar } from 'react-native';
import { pilot } from './components/pilot-dashboard-data'; 

import PilotStatistics from './statistics'; 

export default function PilotProfile() {
  const router = useRouter();

  const handleLogout = async () => {
    router.replace('/login'); 
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar 
        barStyle="light-content" // Keep light for dark header
        backgroundColor={styles.profileHeaderWrapper.backgroundColor} 
      />
      {/* --- Profile Header --- */}
      <View style={styles.profileHeaderWrapper}>
        <LinearGradient
          colors={['#7c3aed', '#6366f1']} // Slightly simplified gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <Image source={pilot.avatar} style={styles.avatar} />
              <View style={styles.statusBadgeOuter}>
                <View style={styles.statusBadgeInner} />
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>{pilot.name}</Text>
              <Text style={styles.role}>{pilot.role}</Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>46</Text>
                  <Text style={styles.statLabel}>Vuelos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>12</Text>
                  <Text style={styles.statLabel}>Proyectos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>892</Text>
                  <Text style={styles.statLabel}>Fotos</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.infoCardsHeaderRow}>
            <TouchableOpacity style={styles.infoCardHeader} onPress={() => router.push('/pilot/calendar')} activeOpacity={0.75}>
              <Ionicons name="calendar-outline" size={20} color="#5e35b1" style={styles.infoCardIcon} />
              <Text style={styles.infoCardText}>Mayo 23, 2025</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoCardHeader} onPress={() => router.push('/pilot/support-chat')} activeOpacity={0.75}>
              <Ionicons name="headset-outline" size={20} color="#5e35b1" style={styles.infoCardIcon} />
              <Text style={styles.infoCardText}>Soporte Directo</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* --- Pilot Statistics --- */}
      <View style={styles.contentCard}>
        <Text style={styles.cardTitle}>Métricas de Rendimiento</Text>
        <PilotStatistics />
      </View>

      {/* --- Project History Button --- */}
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity
          style={styles.primaryActionButtonOuter}
          onPress={() => router.push('/pilot/project-history')}
          activeOpacity={0.85} // Slightly higher for better feedback
        >
          <LinearGradient
            colors={['#6d28d9', '#5b21b6', '#4c1d95']} // Deeper, richer purple
            start={{ x: 0, y: 0.2 }}
            end={{ x: 1, y: 0.8 }}
            style={styles.primaryActionGradient}
          >
            <Ionicons name="briefcase-outline" size={24} color="#f3e8ff" style={styles.actionIcon} />
            <Text style={styles.primaryActionText}>Mi Historial de Proyectos</Text>
            <Ionicons name="chevron-forward-outline" size={22} color="#e9d5ff" style={styles.actionArrow} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      {/* --- Quick Actions Section --- */}
      <View style={styles.contentCard}>
        <Text style={styles.cardTitle}>Acciones Rápidas</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/pilot/support-chat')} activeOpacity={0.75}>
            <View style={[styles.quickActionIconCircle, { backgroundColor: '#fce4ec' }]}> {/* Lighter pink */}
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#ad1457" /> {/* Stronger pink icon */}
            </View>
            <Text style={styles.quickActionCardText}>Centro de Soporte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/pilot/calendar')} activeOpacity={0.75}>
            <View style={[styles.quickActionIconCircle, { backgroundColor: '#e8eaf6' }]}> {/* Lighter indigo */}
              <Ionicons name="calendar-outline" size={22} color="#303f9f" /> {/* Stronger indigo icon */}
            </View>
            <Text style={styles.quickActionCardText}>Mi Calendario</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Logout Button --- */}
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={22} color="#c62828" style={styles.actionIcon} />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f6f8', // Slightly different light gray
    flexGrow: 1,
    paddingBottom: 50, 
    paddingHorizontal: 16, 
  },
  // --- Profile Header ---
  profileHeaderWrapper: { 
    backgroundColor: '#7c3aed', // Fallback for gradient
    borderRadius: 24, // Softer, larger rounding for header
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 60, 
    marginBottom: 28, 
    shadowColor: '#5e35b1', // Purple shadow
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 12,
    elevation: 8, 
  },
  headerGradient: {
    width: '100%',
    paddingVertical: 28, // Increased vertical padding
    borderRadius: 24, // Match wrapper
  },
  headerContent: {
    flexDirection: 'row',
    paddingHorizontal: 22, // Slightly more padding
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 18,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10, 
  },
  avatar: {
    width: 88, 
    height: 88,
    borderRadius: 44, 
    borderWidth: 3, 
    borderColor: '#ffffff', // Pure white border for pop
  },
  // Enhanced Status Badge
  statusBadgeOuter: {
    position: 'absolute',
    bottom: 2, 
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff', // White background for the badge
    padding: 2.5, // Creates the border effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  statusBadgeInner: {
    width: '100%',
    height: '100%',
    borderRadius: 9, // Inner circle
    backgroundColor: '#2dd4bf', // Teal color
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    color: '#ffffff',
    fontSize: 26, 
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  role: {
    color: 'rgba(255, 255, 255, 0.92)', 
    fontSize: 16, 
    fontWeight: '500', 
    marginBottom: 18,
    letterSpacing: 0.25,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Slightly more opaque white
    borderRadius: 16, 
    paddingVertical: 12, 
    paddingHorizontal: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 19, 
    fontWeight: '700', 
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.88)', 
    fontSize: 11.5, 
    fontWeight: '500',
    marginTop: 4, 
  },
  statDivider: {
    height: 30, 
    width: 1.5, // Slightly thicker
    backgroundColor: 'rgba(255, 255, 255, 0.3)', 
    borderRadius: 1,
  },
  infoCardsHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 20, 
    justifyContent: 'space-between',
    gap: 14, 
    marginTop: 4, // Add a bit of space above these cards
  },
  infoCardHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // More opaque white cards
    borderRadius: 14, // Softer rounding for these sub-cards
    paddingVertical: 14, 
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    shadowColor: 'rgba(0,0,0,0.15)', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCardIcon: {
    marginRight: 10,
  },
  infoCardText: {
    color: '#4527a0', // Darker purple text
    fontSize: 13.5, 
    fontWeight: '600', 
    flexShrink: 1, 
  },
  
  // --- General Content Card (for Statistics, Quick Actions) ---
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20, // Increased from 8px for a softer profile look
    padding: 20, // More padding inside cards
    marginBottom: 20, 
    shadowColor: '#90a4ae', // Softer shadow color
    shadowOffset: { width: 0, height: 4 }, // Adjusted shadow
    shadowOpacity: 0.12, // More subtle
    shadowRadius: 8, // More diffused
    elevation: 4, // Standard elevation
    borderWidth: 1,
    borderColor: '#e0e0e0', // Subtle border
  },
  cardTitle: { 
    fontSize: 19, 
    fontWeight: 'bold',
    color: '#263238', // Darker, more formal title
    marginBottom: 16, 
  },
  
  actionButtonContainer: {
    marginBottom: 20, 
  },
  primaryActionButtonOuter: {
    borderRadius: 18, // Softer rounding for primary button
    shadowColor: '#4a148c', // Deep purple shadow
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25, 
    shadowRadius: 10,
    elevation: 7, 
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18, // Generous padding
    paddingHorizontal: 22,
    borderRadius: 18, 
  },
  actionIcon: { 
    marginRight: 12,
  },
  primaryActionText: {
    flex: 1,
    color: '#f3e8ff', 
    fontSize: 16.5, // Slightly larger text
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  actionArrow: {
    opacity: 0.85,
  },

  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14, // Good gap
  },
  quickActionCard: { 
    flex: 1,
    flexDirection: 'column', 
    alignItems: 'center',    
    backgroundColor: '#ffffff', // White cards to pop
    borderRadius: 16, // Softer rounding
    paddingVertical: 20, 
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eceff1', // Very light border
    shadowColor: '#b0bec5', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, // Subtle shadow for these inner cards
    shadowRadius: 5,
    elevation: 2,
    minHeight: 120, 
    justifyContent: 'center', 
  },
  quickActionIconCircle: {
    width: 44, 
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12, 
  },
  quickActionCardText: {
    color: '#37474f', // Dark slate blue
    fontWeight: '600',
    fontSize: 13.5, 
    textAlign: 'center', 
  },

  logoutButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff3f3', // Very light red, less stark
    borderRadius: 18, // Match primary button rounding
    paddingVertical: 16, 
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#ffcdd2', // Soft red border
    shadowColor: '#d32f2f', // Red shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#c62828', // Strong red text for contrast
    fontSize: 16, 
    fontWeight: '600',
    marginLeft: 10, 
  },
});