import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar } from 'react-native';

const mockNotifications = [
  { id: '1', title: 'Mantenimiento Requerido', message: 'El drone SN-M300-78451 necesita revisión de hélices.', time: 'Hace 2 horas', type: 'warning' },
  { id: '2', title: 'Nuevo Reporte Disponible', message: 'El reporte del vuelo T-001 está listo.', time: 'Ayer', type: 'info' },
  { id: '3', title: 'Batería Baja', message: 'La batería B-003 está al 15%.', time: 'Hace 30 mins', type: 'critical' },
  { id: '4', title: 'Actualización de Software', message: 'Nueva versión de firmware disponible para el control remoto.', time: 'Hace 3 días', type: 'info'},
  { id: '5', title: 'Alerta Meteorológica', message: 'Fuertes vientos pronosticados para mañana en Zona Norte.', time: 'Hace 1 hora', type: 'critical'},
];

const NotificationsScreen = () => {
  const renderNotificationItem = ({ item }: { item: any }) => (
    <View style={styles.notificationItem}>
      <Ionicons
        name={item.type === 'warning' ? "warning-outline" : item.type === 'critical' ? "alert-circle" : "information-circle-outline"}
        size={28} // Slightly larger icon
        color={item.type === 'warning' ? '#f59e0b' : item.type === 'critical' ? '#ef4444' : '#3b82f6'}
        style={styles.notificationIcon}
      />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
        </View>
        {mockNotifications.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="notifications-off-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyStateText}>No hay notificaciones nuevas.</Text>
          </View>
        ) : (
          <FlatList
            data={mockNotifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContentContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#9ca3af',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'flex-start', // Align icon with the start of the text content
  },
  notificationIcon: {
    marginRight: 16,
    marginTop: 2, // Adjust to align better with title
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 17, // Slightly larger title
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20, // Improved readability
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'right',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 17,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default NotificationsScreen;
