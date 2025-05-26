import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  PanResponder,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ... (Tipos y datos mock sin cambios)
declare global {
  interface Window {
    __hasNotifications?: boolean;
    __unreadNotificationsCount?: number;
  }
}

type NotificationType = 'warning' | 'critical' | 'info' | 'project_update' | 'incident_alert' | 'system_message';

interface BaseNotificationItemData {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  read?: boolean;
}

interface ProjectNotificationItemData extends BaseNotificationItemData {
  type: 'project_update';
  projectId: string;
  projectName: string;
  taskSummary?: string;
}

interface IncidentNotificationItemData extends BaseNotificationItemData {
  type: 'incident_alert';
  incidentId: string;
  severity: 'alta' | 'media' | 'baja';
  status: 'abierta' | 'en_investigacion' | 'resuelta';
}

type NotificationItemData = BaseNotificationItemData | ProjectNotificationItemData | IncidentNotificationItemData;

const mockNotificationsData: NotificationItemData[] = [
  {
    id: '8', type: 'incident_alert', title: 'Incidencia: Paro por Clima', message: 'Vientos fuertes superan límites operativos en Parque "Los Vientos". Operaciones detenidas.', time: 'Hace 15 mins', incidentId: 'INC-007', severity: 'media', status: 'abierta', read: false,
  },
  {
    id: '6', type: 'project_update', title: 'Nueva Tarea: Inspección Torre E-12', message: 'Parque Eólico "Los Vientos". Cliente: Energía Renovada SA.', time: 'Hace 25 mins', projectId: 'PROJ-001', projectName: 'Parque Eólico "Los Vientos"', taskSummary: 'Inspección visual y termográfica de la turbina E-12.', read: false,
  },
  { id: '3', title: 'Batería Baja Drone X', message: 'La batería B-003 (Drone X) está al 15%. Reemplazar pronto.', time: 'Hace 45 mins', type: 'critical', read: false },
  {
    id: '9', type: 'incident_alert', title: 'Falla de Sensor en Drone Y', message: 'Sensor de altitud en Drone Y (SN-M300-78451) reporta lecturas anómalas.', time: 'Hace 1 hora', incidentId: 'INC-008', severity: 'alta', status: 'en_investigacion', read: false,
  },
  { id: '5', title: 'Alerta Meteorológica General', message: 'Fuertes vientos pronosticados para mañana en Zona Norte.', time: 'Hace 1.5 horas', type: 'warning', read: false },
  {
    id: '7', type: 'project_update', title: 'Checklist Prevuelo Pendiente', message: 'Proyecto "Sierra Morena Solar". Recuerda completar el checklist.', time: 'Hace 4 horas', projectId: 'PROJ-002', projectName: 'Sierra Morena Solar', taskSummary: 'Completar checklist prevuelo y preparar EPP.', read: true,
  },
  { id: '1', title: 'Mantenimiento Requerido Drone Y', message: 'El drone SN-M300-78451 necesita revisión de hélices.', time: 'Hace 5 horas', type: 'warning', read: false },
  { id: '2', title: 'Nuevo Reporte Disponible', message: 'El reporte del vuelo T-001 (Proyecto Alfa) está listo para revisión.', time: 'Ayer', type: 'info', read: true },
  { id: '4', title: 'Actualización de Firmware', message: 'Nueva versión de firmware disponible para el control remoto principal.', time: 'Hace 3 días', type: 'info', read: false },
];

function parseTimeToMinutesAgo(time: string): number {
  const match = time.match(/\d+/);
  const value = match ? parseInt(match[0], 10) : 0;
  if (time.includes('min')) return value;
  if (time.includes('hora')) return value * 60;
  if (time.includes('Ayer')) return 24 * 60;
  if (time.includes('día')) return value * 24 * 60;
  return 99999;
}

const sortedNotificationsData = [...mockNotificationsData].sort((a, b) => {
  const readDiff = (a.read ? 1 : 0) - (b.read ? 1 : 0);
  if (readDiff !== 0) return readDiff;
  return parseTimeToMinutesAgo(a.time) - parseTimeToMinutesAgo(b.time);
});

const getNotificationTypeDetails = (type: NotificationType) => {
  switch (type) {
    case 'incident_alert': return { iconName: 'shield-half-outline' as const, iconColor: '#C2410C', backgroundColor: '#FFEDD5'};
    case 'warning': return { iconName: 'warning-outline' as const, iconColor: '#A16207', backgroundColor: '#FEF9C3'};
    case 'critical': return { iconName: 'alert-circle-outline' as const, iconColor: '#B91C1C', backgroundColor: '#FEE2E2'};
    case 'project_update': return { iconName: 'briefcase-outline' as const, iconColor: '#047857', backgroundColor: '#D1FAE5'};
    case 'system_message': return { iconName: 'megaphone-outline' as const, iconColor: '#5B21B6', backgroundColor: '#EDE9FE'};
    default: return { iconName: 'information-circle-outline' as const, iconColor: '#1E40AF', backgroundColor: '#DBEAFE'};
  }
};


const AnimatedNotificationItem = ({
  children,
  isRemoving,
  onAnimationEnd,
}: {
  children: React.ReactNode;
  isRemoving: boolean; // Indicates if the final removal animation should play
  onAnimationEnd: () => void; // Called after the final removal animation
}) => {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current; // Start with full opacity
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const [isLayoutDone, setIsLayoutDone] = useState(false);
  const [heightSet, setHeightSet] = useState(false);

  useEffect(() => {
    if (isLayoutDone && measuredHeight !== null && !heightSet) {
       // Set initial height for slide-in or normal display.
       // Ensure this runs only after measurement and if height is not already set.
      animatedHeight.setValue(measuredHeight);
      setHeightSet(true);
    }
  }, [isLayoutDone, measuredHeight, heightSet, animatedHeight]);

  useEffect(() => {
    if (isRemoving && measuredHeight !== null) {
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 280, // Sync with height or slightly faster
          useNativeDriver: false, // Keep false for parallel with height
        }),
      ]).start(() => {
        onAnimationEnd();
      });
    }
  }, [isRemoving, measuredHeight, animatedHeight, animatedOpacity, onAnimationEnd]);

  return (
    <Animated.View
      style={{
        height: !isLayoutDone ? undefined : animatedHeight,
        opacity: animatedOpacity, // This opacity is for the *final* removal animation
        overflow: 'hidden',
      }}
      onLayout={(event) => {
        if (!isLayoutDone) { // Measure only once
          const height = event.nativeEvent.layout.height;
          if (height > 0) {
            setMeasuredHeight(height);
            setIsLayoutDone(true); // Mark layout as done
          }
        }
      }}
    >
      {children}
    </Animated.View>
  );
};


const NotificationsScreen = ({ /* ...props... */ }) => {
  const [notifications, setNotifications] = useState<NotificationItemData[]>(sortedNotificationsData);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [deletedNotification, setDeletedNotification] = useState<NotificationItemData | null>(null);
  const [showUndoButton, setShowUndoButton] = useState(false);
  const flatListRef = useRef<FlatList<NotificationItemData>>(null);
  
  // Undo button animations
  const undoButtonOpacity = useRef(new Animated.Value(0)).current;
  const undoButtonTranslateY = useRef(new Animated.Value(50)).current;


  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (typeof window !== 'undefined') {
      window.__hasNotifications = notifications.length > 0;
      window.__unreadNotificationsCount = unreadCount;
    }
  }, [notifications]);
  // Handle immediate deletion with undo functionality
  const handleDelete = (id: string) => {
    const notificationToDelete = notifications.find(n => n.id === id);
    if (!notificationToDelete) return;
    
    // Store the deleted notification for potential undo
    setDeletedNotification(notificationToDelete);
    
    // Remove from current list immediately
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Show undo button with animation
    setShowUndoButton(true);
    Animated.parallel([
      Animated.timing(undoButtonOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(undoButtonTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto-hide undo button after 5 seconds
    setTimeout(() => {
      hideUndoButton();
    }, 5000);
  };

  const hideUndoButton = () => {
    Animated.parallel([
      Animated.timing(undoButtonOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(undoButtonTranslateY, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowUndoButton(false);
      setDeletedNotification(null);
    });
  };

  const handleUndo = () => {
    if (!deletedNotification) return;
    
    // Check if notification with same ID doesn't already exist (safety check)
    const exists = notifications.find(n => n.id === deletedNotification.id);
    if (exists) {
      hideUndoButton();
      return;
    }
    
    // Add back the deleted notification
    setNotifications(prev => {
      const newList = [...prev, deletedNotification];
      // Re-sort to maintain proper order
      return newList.sort((a, b) => {
        const readDiff = (a.read ? 1 : 0) - (b.read ? 1 : 0);
        if (readDiff !== 0) return readDiff;
        return parseTimeToMinutesAgo(a.time) - parseTimeToMinutesAgo(b.time);
      });
    });
    
    hideUndoButton();
  };
  
  const handleAnimationEnd = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setRemovingItemId(null);
  };

  const handleClearAll = () => { /* ... */ Alert.alert( "Limpiar Notificaciones", "¿Eliminar todas las notificaciones? Esta acción no se puede deshacer.", [ { text: "Cancelar", style: "cancel" }, { text: "Eliminar Todas", style: "destructive", onPress: () => setNotifications([]) } ] ); };
  const handleMarkAllRead = () => { /* ... */ Alert.alert( "Marcar como Leídas", "¿Marcar todas las notificaciones como leídas?", [ { text: "Cancelar", style: "cancel" }, { text: "Marcar Todas", style: "default", onPress: () => setNotifications(prev => prev.map(n => ({ ...n, read: true }))) } ] ); };
  const handleNotificationPress = (item: NotificationItemData) => { setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n)); if (item.type === 'project_update') { const projectItem = item as ProjectNotificationItemData; Alert.alert( "Detalles del Proyecto", `ID: ${projectItem.projectId}\nProyecto: ${projectItem.projectName}\nTarea: ${projectItem.taskSummary || 'No especificada'}\n\n(Navegar a pantalla de detalles del proyecto)`, [{ text: "Entendido" }] ); } else if (item.type === 'incident_alert') { const incidentItem = item as IncidentNotificationItemData; Alert.alert( "Alerta de Incidencia", `ID Incidencia: ${incidentItem.incidentId}\nSeveridad: ${incidentItem.severity.toUpperCase()}\nEstado: ${incidentItem.status.replace('_',' ')}\n\nDescripción: ${incidentItem.message}\n\n(Navegar a pantalla de gestión de incidencias)`, [{ text: "Ver Detalles" }] ); } else { Alert.alert(item.title, item.message, [{ text: "OK" }]); } };
  const renderNotificationItem = ({ item }: { item: NotificationItemData }) => {
    const typeDetails = getNotificationTypeDetails(item.type);
    return (
       <AnimatedNotificationItem
        isRemoving={removingItemId === item.id}
        onAnimationEnd={() => handleAnimationEnd(item.id)}
      >
        <SwipeableNotification
          onDeleteIntent={() => handleDelete(item.id)}
          setScrollEnabled={setScrollEnabled}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleNotificationPress(item)}
            style={styles.notificationItemOuter}
          >
            <View style={[styles.iconContainer, { backgroundColor: typeDetails.backgroundColor }]}>
              <Ionicons name={typeDetails.iconName} size={22} color={typeDetails.iconColor} />
            </View>
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, item.read && styles.notificationTitleRead]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.notificationMessage, item.read && styles.notificationMessageRead]} numberOfLines={2}>{item.message}</Text>
              <Text style={[styles.notificationTime, item.read && styles.notificationTimeRead]}>{item.time}</Text>
            </View>
            {!item.read && <View style={styles.unreadIndicator} />}
          </TouchableOpacity>
        </SwipeableNotification>
      </AnimatedNotificationItem>
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={styles.safeArea.backgroundColor} />
      <View style={styles.container}>        <View style={styles.header}>
             <Text style={styles.headerTitle}>{`Notificaciones${unreadCount > 0 ? ` (${unreadCount})` : ''}`}</Text>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
                 <TouchableOpacity onPress={handleMarkAllRead} style={styles.headerButton} accessibilityLabel="Marcar todas como leídas">
                    <Ionicons name="checkmark-done-outline" size={26} color="#1e3a8a" />
                 </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity onPress={handleClearAll} style={[styles.headerButton, { marginLeft: unreadCount > 0 ? 8 : 0 }]} accessibilityLabel="Eliminar todas las notificaciones">
                <Ionicons name="trash-outline" size={24} color="#b91c1c" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {notifications.length > 0 && (
          <View style={styles.swipeHintContainer}>
             <Ionicons name="arrow-back-outline" size={15} color="#3730a3" style={{ marginRight: 6 }} />
            <Text style={styles.swipeHintText}>Desliza a la izquierda para eliminar</Text>
          </View>
        )}        {notifications.length === 0 ? (
            <View style={styles.emptyStateContainer}>
                <Ionicons name="notifications-off-outline" size={64} color="#94a3b8" />
                <Text style={styles.emptyStateTitle}>Todo en calma</Text>
                <Text style={styles.emptyStateText}>No tienes notificaciones pendientes.</Text>
            </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            extraData={notifications.length}
            contentContainerStyle={styles.listContentContainer}
            scrollEnabled={scrollEnabled}
            showsVerticalScrollIndicator={false}
          />
        )}
        
        {/* Undo Button */}
        {showUndoButton && (
          <Animated.View 
            style={[
              styles.undoContainer,
              {
                opacity: undoButtonOpacity,
                transform: [{ translateY: undoButtonTranslateY }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.undoButton}
              onPress={handleUndo}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-undo-outline" size={20} color="white" />
              <Text style={styles.undoText}>Deshacer</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const SwipeableNotification = ({
  children,
  onDeleteIntent,
  setScrollEnabled,
}: {
  children: React.ReactNode;
  onDeleteIntent: () => void;
  setScrollEnabled: (enabled: boolean) => void;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(1)).current;
  const deleteScale = useRef(new Animated.Value(1)).current;
  const SWIPE_THRESHOLD = -Dimensions.get('window').width * 0.3; // 30% of screen width

  // Opacity linked to swipe gesture - more subtle
  const swipeOpacity = translateX.interpolate({
    inputRange: [SWIPE_THRESHOLD * 1.5, SWIPE_THRESHOLD, 0],
    outputRange: [0.7, 0.85, 1], // More subtle fade
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5 && Math.abs(gs.dx) > 10,
      onPanResponderGrant: () => {
        setScrollEnabled(false);
      },
      onPanResponderMove: (_, gs) => {
        if (gs.dx < 0) {
          translateX.setValue(gs.dx);
        } else {
          translateX.setValue(gs.dx / 3); // Resist right swipe
        }
      },
      onPanResponderRelease: (_, gs) => {
        setScrollEnabled(true);
        if (gs.dx < SWIPE_THRESHOLD) {
          // Trigger delete with smooth animation
          Animated.parallel([
            Animated.timing(deleteOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(deleteScale, {
              toValue: 0.8,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onDeleteIntent();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            bounciness: 5,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setScrollEnabled(true);
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;
  return (
    <View style={styles.swipeableContainerWrapper}>
      <View style={styles.deleteActionBackground}>
        <Ionicons name="trash-outline" size={22} color="#dc2626" />
        <Text style={styles.deleteActionText}>Eliminar</Text>
      </View>
      <Animated.View
        style={{
          transform: [{ translateX }, { scale: deleteScale }],
          opacity: Animated.multiply(swipeOpacity, deleteOpacity),
        }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f1f5f9' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1e293b' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { padding: 6 },
  listContentContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
    swipeableContainerWrapper: {
    borderRadius: 12,
    backgroundColor: 'transparent',
    shadowColor: '#334155',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 7,
  },
  deleteActionBackground: {
    position: 'absolute', top: 0, bottom: 0, right: 0, width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    paddingHorizontal: 24, borderRadius: 12, backgroundColor: 'transparent',
  },
  deleteActionText: { color: '#dc2626', fontSize: 15, fontWeight: '500', marginLeft: 10 },
  
  notificationItemOuter: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    position: 'relative',
  },
  notificationTitleRead: { color: '#475569' },
  notificationMessageRead: { color: '#64748b' },
  notificationTimeRead: { color: '#94a3b8' },
  
  iconContainer: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
    marginTop: 2,
  },
  notificationContent: { flex: 1, justifyContent: 'center' },
  notificationTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 3 },
  notificationMessage: { fontSize: 14, color: '#334155', lineHeight: 20, marginBottom: 5 },
  notificationTime: { fontSize: 12, color: '#64748b' },
  
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#256eb',
  },

  emptyStateContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, marginTop: -40,
  },
  emptyStateTitle: { fontSize: 20, fontWeight: '600', color: '#334155', marginTop: 20, marginBottom: 8 },
  emptyStateText: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22 },
    swipeHintContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, backgroundColor: '#e0e7ff',
    marginHorizontal: 16, borderRadius: 8, marginTop: 12, marginBottom: 10,
  },
  swipeHintText: { color: '#3730a3', fontSize: 13, fontWeight: '500' },
  
  // Undo button styles
  undoContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  undoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default NotificationsScreen;