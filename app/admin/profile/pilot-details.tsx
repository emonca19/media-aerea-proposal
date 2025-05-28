import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { mockPilotUsers } from "../../../src/mocks/pilots";

// Utility to get date range for selected period
type Period = "week" | "month" | "year";
function getPeriodRange(period: Period) {
  const now = new Date();
  let start: Date;
  if (period === "week") {
    start = new Date(now);
    start.setDate(now.getDate() - 7);
  } else if (period === "month") {
    start = new Date(now);
    start.setMonth(now.getMonth() - 1);
  } else {
    start = new Date(now);
    start.setFullYear(now.getFullYear() - 1);
  }
  return { start, end: now };
}

// Mock data for each period
const periodData = {
  week: {
    totalPilots: 8,
    activePilots: 6,
    totalFlightHours: 22,
    averageEfficiency: 91,
    topPilots: [
      { id: 1, name: "Carlos Mendoza", active: true, stats: { totalFlightMinutes: 320, dailyCompletionRatePercentage: 97 } },
      { id: 2, name: "Ana García", active: true, stats: { totalFlightMinutes: 280, dailyCompletionRatePercentage: 94 } },
      { id: 3, name: "Luis Rodríguez", active: false, stats: { totalFlightMinutes: 150, dailyCompletionRatePercentage: 89 } },
    ],
    recentActivities: [
      { pilot: "Carlos Mendoza", activity: "Vuelo completado", time: "2 horas", efficiency: 97 },
      { pilot: "Ana García", activity: "Inspección turbina", time: "1.5 horas", efficiency: 94 },
      { pilot: "Luis Rodríguez", activity: "Mantenimiento preventivo", time: "1 hora", efficiency: 89 },
    ],
  },
  month: {
    totalPilots: 10,
    activePilots: 8,
    totalFlightHours: 95,
    averageEfficiency: 89,
    topPilots: [
      { id: 1, name: "Carlos Mendoza", active: true, stats: { totalFlightMinutes: 1200, dailyCompletionRatePercentage: 95 } },
      { id: 2, name: "Ana García", active: true, stats: { totalFlightMinutes: 1100, dailyCompletionRatePercentage: 92 } },
      { id: 3, name: "María López", active: true, stats: { totalFlightMinutes: 900, dailyCompletionRatePercentage: 90 } },
      { id: 4, name: "Jorge Silva", active: false, stats: { totalFlightMinutes: 700, dailyCompletionRatePercentage: 87 } },
    ],
    recentActivities: [
      { pilot: "Carlos Mendoza", activity: "Vuelo completado", time: "2 horas", efficiency: 95 },
      { pilot: "Ana García", activity: "Inspección turbina", time: "1.5 horas", efficiency: 92 },
      { pilot: "Luis Rodríguez", activity: "Mantenimiento preventivo", time: "3 horas", efficiency: 88 },
      { pilot: "María López", activity: "Vuelo de práctica", time: "1 hora", efficiency: 90 },
      { pilot: "Jorge Silva", activity: "Misión de rescate", time: "4 horas", efficiency: 87 },
    ],
  },
  year: {
    totalPilots: 15,
    activePilots: 12,
    totalFlightHours: 1200,
    averageEfficiency: 87,
    topPilots: [
      { id: 1, name: "Carlos Mendoza", active: true, stats: { totalFlightMinutes: 8000, dailyCompletionRatePercentage: 92 } },
      { id: 2, name: "Ana García", active: true, stats: { totalFlightMinutes: 7800, dailyCompletionRatePercentage: 90 } },
      { id: 3, name: "Luis Rodríguez", active: true, stats: { totalFlightMinutes: 7000, dailyCompletionRatePercentage: 88 } },
      { id: 4, name: "María López", active: true, stats: { totalFlightMinutes: 6500, dailyCompletionRatePercentage: 87 } },
      { id: 5, name: "Jorge Silva", active: false, stats: { totalFlightMinutes: 6000, dailyCompletionRatePercentage: 85 } },
    ],
    recentActivities: [
      { pilot: "Carlos Mendoza", activity: "Vuelo internacional", time: "5 horas", efficiency: 92 },
      { pilot: "Ana García", activity: "Inspección anual", time: "3 horas", efficiency: 90 },
      { pilot: "Luis Rodríguez", activity: "Mantenimiento mayor", time: "6 horas", efficiency: 88 },
      { pilot: "María López", activity: "Vuelo de práctica", time: "2 horas", efficiency: 87 },
      { pilot: "Jorge Silva", activity: "Misión de rescate", time: "8 horas", efficiency: 85 },
    ],
  },
};

const PilotDetailsScreen = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  // Use periodData for the selected period
  const pilotStats = periodData[selectedPeriod];

  // Get date range for selected period
  const { start: periodStart, end: periodEnd } = getPeriodRange(selectedPeriod);

  // Helper to check if a date is in range
  function inPeriod(dateStr: string | undefined) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d >= periodStart && d <= periodEnd;
  }

  // Filter pilots by activity in the period (using a mock 'lastActivityDate' field if available)
  const filteredPilots = mockPilotUsers.filter((p: any) => {
    // If pilot has a lastActivityDate, use it; else include all (for demo)
    if (p.lastActivityDate) {
      return inPeriod(p.lastActivityDate);
    }
    return true;
  });

  // Filter recent activities by period (assuming a mock 'date' field, else include all)
  const filteredActivities = [
    { pilot: "Carlos Mendoza", activity: "Vuelo completado", time: "2 horas", efficiency: 95, date: "2025-05-26" },
    { pilot: "Ana García", activity: "Inspección turbina", time: "1.5 horas", efficiency: 92, date: "2025-05-25" },
    { pilot: "Luis Rodríguez", activity: "Mantenimiento preventivo", time: "3 horas", efficiency: 88, date: "2025-05-20" },
    { pilot: "María López", activity: "Vuelo de práctica", time: "1 hora", efficiency: 90, date: "2025-04-30" },
    { pilot: "Jorge Silva", activity: "Misión de rescate", time: "4 horas", efficiency: 97, date: "2024-12-15" },
  ].filter((a) => inPeriod(a.date));

  const StatCard = ({ title, value, icon, color, trend }: any) => (
    <Animated.View entering={FadeInDown.delay(100)} style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statCardHeader}>
        <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? "#10B98120" : "#EF444420" }]}>
            <Ionicons 
              name={trend > 0 ? "trending-up" : "trending-down"} 
              size={16} 
              color={trend > 0 ? "#10B981" : "#EF4444"} 
            />
            <Text style={[styles.trendText, { color: trend > 0 ? "#10B981" : "#EF4444" }]}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </Animated.View>
  );

  const PilotCard = ({ pilot, rank }: { pilot: any, rank: number }) => (
    <Animated.View entering={FadeInDown.delay(200 + rank * 50)} style={styles.pilotCard}>
      <View style={styles.pilotRank}>
        <Text style={styles.rankNumber}>#{rank}</Text>
      </View>
      <View style={styles.pilotInfo}>        <Text style={styles.pilotName}>{pilot.name}</Text>
        <Text style={styles.pilotDetails}>
          {Math.round((pilot.stats?.totalFlightMinutes || 0) / 60)}h vuelo • {pilot.stats?.dailyCompletionRatePercentage || 0}% eficiencia
        </Text>
        <View style={styles.pilotStatus}>
          <View style={[styles.statusDot, { backgroundColor: pilot.active ? "#10B981" : "#EF4444" }]} />
          <Text style={styles.statusText}>{pilot.active ? "Activo" : "Inactivo"}</Text>
        </View>
      </View>
      <View style={styles.efficiencyScore}>
        <Text style={styles.efficiencyValue}>{pilot.stats?.dailyCompletionRatePercentage || 0}%</Text>
      </View>
    </Animated.View>
  );  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Estadísticas de Pilotos",
          headerLeft: () => (            <TouchableOpacity 
              onPress={() => router.push('/admin/profile/kpisdashboard')}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#9C46CE" />
              <Text style={styles.backButtonText}>Atrás</Text>
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Period Selection */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.periodSelector}>
          {(["week", "month", "year"] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period === "week" ? "Semana" : period === "month" ? "Mes" : "Año"}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Pilotos"
            value={pilotStats.totalPilots}
            icon="people"
            color="#3B82F6"
            trend={5}
          />
          <StatCard
            title="Pilotos Activos"
            value={pilotStats.activePilots}
            icon="checkmark-circle"
            color="#10B981"
            trend={2}
          />
          <StatCard
            title="Horas Totales"
            value={`${Math.round(pilotStats.totalFlightHours)}h`}
            icon="time"
            color="#F59E0B"
            trend={8}
          />
          <StatCard
            title="Eficiencia Media"
            value={`${Math.round(pilotStats.averageEfficiency)}%`}
            icon="trending-up"
            color="#8B5CF6"
            trend={-1}
          />
        </View>

        {/* Top Performing Pilots */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Top Pilotos</Text>
          <Text style={styles.sectionSubtitle}>Clasificados por eficiencia</Text>
            <View style={styles.pilotsContainer}>
            {pilotStats.topPilots.map((pilot: any, index: number) => (
              <PilotCard key={pilot.id} pilot={pilot} rank={index + 1} />
            ))}
          </View>
        </Animated.View>

        {/* Recent Activities */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Actividades Recientes</Text>
          <Text style={styles.sectionSubtitle}>Últimas actividades de pilotos</Text>
          
          <View style={styles.activitiesContainer}>
            {pilotStats.recentActivities.map((activity, index) => (
              <Animated.View 
                key={index} 
                entering={FadeInDown.delay(450 + index * 50)} 
                style={styles.activityCard}
              >
                <View style={styles.activityIcon}>
                  <Ionicons name="airplane" size={16} color="#9C46CE" />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityPilot}>{activity.pilot}</Text>
                  <Text style={styles.activityDescription}>{activity.activity}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                <View style={styles.activityEfficiency}>
                  <Text style={styles.activityEfficiencyValue}>{activity.efficiency}%</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>      </ScrollView>
      {/* Floating Dashboard Button */}
      {/* Removed as per user request */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    fontSize: 14,
    color: "#9C46CE",
    fontWeight: "600",
    marginLeft: 4,
  },
  dashboardButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginRight: -8,
  },
  dashboardButtonText: {
    fontSize: 14,
    color: "#9C46CE",
    fontWeight: "600",
    marginLeft: 4,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: "#9C46CE",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  pilotsContainer: {
    gap: 12,
  },
  pilotCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pilotRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#9C46CE20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#9C46CE",
  },
  pilotInfo: {
    flex: 1,
  },
  pilotName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  pilotDetails: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 6,
  },
  pilotStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  efficiencyScore: {
    alignItems: "center",
  },
  efficiencyValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
  },
  activitiesContainer: {
    gap: 12,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#9C46CE20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityPilot: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  activityEfficiency: {
    alignItems: "center",
  },
  activityEfficiencyValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
});

export default PilotDetailsScreen;
