import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, FlatList, PanResponder, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

const mockNotifications = [
  { id: '1', title: 'Mantenimiento Requerido', message: 'El drone SN-M300-78451 necesita revisión de hélices.', time: 'Hace 2 horas', type: 'warning' },
  { id: '2', title: 'Nuevo Reporte Disponible', message: 'El reporte del vuelo T-001 está listo.', time: 'Ayer', type: 'info' },
  { id: '3', title: 'Batería Baja', message: 'La batería B-003 está al 15%.', time: 'Hace 30 mins', type: 'critical' },
  { id: '4', title: 'Actualización de Software', message: 'Nueva versión de firmware disponible para el control remoto.', time: 'Hace 3 días', type: 'info'},
  { id: '5', title: 'Alerta Meteorológica', message: 'Fuertes vientos pronosticados para mañana en Zona Norte.', time: 'Hace 1 hora', type: 'critical'},
];

// Helper to sort notifications by time (most recent first)
function parseTimeToMinutesAgo(time: string): number {
  if (time.includes('min')) return parseInt(time.match(/\d+/)?.[0] || '0', 10);
  if (time.includes('hora')) return parseInt(time.match(/\d+/)?.[0] || '0', 10) * 60;
  if (time.includes('Ayer')) return 24 * 60;
  if (time.includes('día')) return parseInt(time.match(/\d+/)?.[0] || '0', 10) * 24 * 60;
  return 99999; // fallback for unknown
}

const sortedNotifications = [...mockNotifications].sort((a, b) => parseTimeToMinutesAgo(a.time) - parseTimeToMinutesAgo(b.time));

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState(sortedNotifications);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const renderNotificationItem = ({ item }: { item: any }) => (
    <SwipeableNotification onDelete={() => handleDelete(item.id)} setScrollEnabled={setScrollEnabled}>
      <View style={styles.notificationItem}>
        <Ionicons
          name={item.type === 'warning' ? "warning-outline" : item.type === 'critical' ? "alert-circle" : "information-circle-outline"}
          size={28}
          color={item.type === 'warning' ? '#f59e0b' : item.type === 'critical' ? '#ef4444' : '#3b82f6'}
          style={styles.notificationIcon}
        />
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
      </View>
    </SwipeableNotification>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
        </View>
        {/* Desplace para eliminar text, quitar si es muy intrusivo */}
        {notifications.length > 0 && (
          <View style={styles.swipeHintContainer}>
            <Ionicons name="arrow-back-outline" size={16} color="#64748b" style={{ marginRight: 4 }} />
            <Text style={styles.swipeHintText}>Desplace para eliminar</Text>
          </View>
        )}
        {notifications.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="notifications-off-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyStateText}>No hay notificaciones nuevas.</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContentContainer}
            scrollEnabled={scrollEnabled}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// SwipeableNotification: swipe-to-delete con bloqueo de scroll y feedback visual
const SwipeableNotification = ({ children, onDelete, setScrollEnabled }: { children: React.ReactNode, onDelete: () => void, setScrollEnabled: (enabled: boolean) => void }) => {
  const translateX = React.useRef(new Animated.Value(0)).current;
  const [deleting, setDeleting] = React.useState(false);

  // Interpolación para la opacidad
  const opacity = translateX.interpolate({
    inputRange: [-120, 0],
    outputRange: [0.2, 1],
    extrapolate: 'clamp',
  });

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onPanResponderGrant: () => setScrollEnabled(false),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setScrollEnabled(true);
        if (gestureState.dx < -80) {
          setDeleting(true);
          Animated.timing(translateX, {
            toValue: -400,
            duration: 200,
            useNativeDriver: true,
          }).start(onDelete);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setScrollEnabled(true);
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={{ transform: [{ translateX }], opacity, zIndex: 2 }}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
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
  swipeHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 8,
    marginBottom: -4,
    opacity: 0.7,
  },
  swipeHintText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default NotificationsScreen;
