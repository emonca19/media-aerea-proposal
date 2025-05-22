import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

const turbinesData = [
  { id: 'TURBINE_001', name: 'WTG-001', status: 'OPERATIONAL', lastInspection: '2023-12-05', nextInspection: '2024-03-05' },
  { id: 'TURBINE_002', name: 'WTG-002', status: 'STANDBY', lastInspection: '2023-11-28', nextInspection: '2024-02-28' },
  { id: 'TURBINE_003', name: 'WTG-003', status: 'OPERATIONAL', lastInspection: '2023-12-10', nextInspection: '2024-03-10' },
  { id: 'TURBINE_004', name: 'WTG-004', status: 'MAINTENANCE_PLANNED', lastInspection: '2023-10-15', nextInspection: '2024-01-15' },
  { id: 'TURBINE_005', name: 'WTG-005', status: 'OFFLINE', lastInspection: '2023-09-20', nextInspection: '2024-01-20' },
  { id: 'DRONE_M300_01', name: 'DJI M300 #1', status: 'READY', lastInspection: '2023-12-15', nextInspection: '2024-03-15' },
  { id: 'SITE_ALPHA', name: 'Sitio Alpha', status: 'ACCESSIBLE', lastInspection: '2023-11-30', nextInspection: '2024-02-28' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPERATIONAL': return '#10b981'; // emerald-500
    case 'STANDBY': return '#f59e0b'; // amber-500
    case 'MAINTENANCE_PLANNED': return '#6366f1'; // indigo-500
    case 'OFFLINE': return '#ef4444'; // red-500
    case 'READY': return '#10b981'; // emerald-500
    case 'ACCESSIBLE': return '#3b82f6'; // blue-500
    default: return '#9ca3af'; // gray-400
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'OPERATIONAL': return <MaterialCommunityIcons name="wind-turbine" size={24} color={getStatusColor(status)} />;
    case 'STANDBY': return <Ionicons name="pause-circle" size={24} color={getStatusColor(status)} />;
    case 'MAINTENANCE_PLANNED': return <Ionicons name="construct" size={24} color={getStatusColor(status)} />;
    case 'OFFLINE': return <Ionicons name="power" size={24} color={getStatusColor(status)} />;
    case 'READY': return <Ionicons name="checkmark-circle" size={24} color={getStatusColor(status)} />;
    case 'ACCESSIBLE': return <Ionicons name="location" size={24} color={getStatusColor(status)} />;
    default: return <Ionicons name="help-circle" size={24} color={getStatusColor(status)} />;
  }
};

export default function TurbinesScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Turbinas y Equipos</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Estado de Turbinas y Equipos</Text>
        
        {turbinesData.map((turbine) => (
          <TouchableOpacity 
            key={turbine.id} 
            style={styles.turbineCard}
            onPress={() => {
              // Navigate to specific turbine details
              // router.push(`/pilot/turbine/${turbine.id}`);
              // For now, just show an alert
              alert(`Detalles de ${turbine.name} serán implementados próximamente`);
            }}
          >
            <View style={styles.turbineHeader}>
              {getStatusIcon(turbine.status)}
              <Text style={styles.turbineName}>{turbine.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(turbine.status) }]}>
                <Text style={styles.statusText}>
                  {turbine.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            
            <View style={styles.turbineDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Última inspección:</Text>
                <Text style={styles.detailValue}>{new Date(turbine.lastInspection).toLocaleDateString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Próxima inspección:</Text>
                <Text style={styles.detailValue}>{new Date(turbine.nextInspection).toLocaleDateString()}</Text>
              </View>
            </View>
            
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => alert(`Inspección para ${turbine.name} será implementada próximamente`)}
              >
                <Ionicons name="camera-outline" size={18} color="#3b82f6" />
                <Text style={styles.actionText}>Inspeccionar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => alert(`Historial para ${turbine.name} será implementado próximamente`)}
              >
                <Ionicons name="time-outline" size={18} color="#3b82f6" />
                <Text style={styles.actionText}>Historial</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => alert(`Reportes para ${turbine.name} serán implementados próximamente`)}
              >
                <Ionicons name="document-text-outline" size={18} color="#3b82f6" />
                <Text style={styles.actionText}>Reportes</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
    marginLeft: 16,
  },
  scrollView: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  turbineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  turbineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  turbineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
    marginLeft: 12,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  turbineDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 4,
  },
});
