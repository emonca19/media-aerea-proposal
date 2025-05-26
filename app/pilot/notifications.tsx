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

// Tipos y datos mock (sin cambios)
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
    case 'incident_alert': 
      return { 
        iconName: 'alert-circle-outline' as const, 
        iconColor: '#FF6B6B', 
        backgroundColor: '#FFF5F5',
        accentColor: '#FF5252'
      };
    case 'warning': 
      return { 
        iconName: 'warning-outline' as const, 
        iconColor: '#FFA502', 
        backgroundColor: '#FFF9E6',
        accentColor: '#FFC107'
      };
    case 'critical': 
      return { 
        iconName: 'close-circle-outline' as const, 
        iconColor: '#FF4757', 
        backgroundColor: '#FFF0F0',
        accentColor: '#FF3D3D'
      };
    case 'project_update': 
      return { 
        iconName: 'briefcase-outline' as const, 
        iconColor: '#4CAF50', 
        backgroundColor: '#F0FFF4',
        accentColor: '#66BB6A'
      };
    case 'system_message': 
      return { 
        iconName: 'megaphone-outline' as const, 
        iconColor: '#9C27B0', 
        backgroundColor: '#F9F0FF',
        accentColor: '#AB47BC'
      };
    default: 
      return { 
        iconName: 'information-circle-outline' as const, 
        iconColor: '#2196F3', 
        backgroundColor: '#F0F9FF',
        accentColor: '#42A5F5'
      };
  }
};

const AnimatedNotificationItem = ({
  children,
  isRemoving,
  onAnimationEnd,
}: {
  children: React.ReactNode;
  isRemoving: boolean;
  onAnimationEnd: () => void;
}) => {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const [isLayoutDone, setIsLayoutDone] = useState(false);
  const [heightSet, setHeightSet] = useState(false);

  useEffect(() => {
    if (isLayoutDone && measuredHeight !== null && !heightSet) {
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
          duration: 280,
          useNativeDriver: false,
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
        opacity: animatedOpacity,
        overflow: 'hidden',
      }}
      onLayout={(event) => {
        if (!isLayoutDone) {
          const height = event.nativeEvent.layout.height;
          if (height > 0) {
            setMeasuredHeight(height);
            setIsLayoutDone(true);
          }
        }
      }}
    >
      {children}
    </Animated.View>
  );
};

const NotificationsScreen = () => {
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

  const handleDelete = (id: string) => {
    const notificationToDelete = notifications.find(n => n.id === id);
    if (!notificationToDelete) return;
    
    setDeletedNotification(notificationToDelete);
    setNotifications(prev => prev.filter(n => n.id !== id));
    
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
    
    const exists = notifications.find(n => n.id === deletedNotification.id);
    if (exists) {
      hideUndoButton();
      return;
    }
    
    setNotifications(prev => {
      const newList = [...prev, deletedNotification];
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

  const handleClearAll = () => {
    Alert.alert(
      "Limpiar Notificaciones",
      "¿Eliminar todas las notificaciones? Esta acción no se puede deshacer.",
      [
        { 
          text: "Cancelar", 
          style: "cancel" 
        },
        { 
          text: "Eliminar Todas", 
          style: "destructive", 
          onPress: () => setNotifications([]) 
        }
      ]
    );
  };

  const handleMarkAllRead = () => {
    Alert.alert(
      "Marcar como Leídas",
      "¿Marcar todas las notificaciones como leídas?",
      [
        { 
          text: "Cancelar", 
          style: "cancel" 
        },
        { 
          text: "Marcar Todas", 
          style: "default", 
          onPress: () => setNotifications(prev => prev.map(n => ({ ...n, read: true }))) 
        }
      ]
    );
  };

  const handleNotificationPress = (item: NotificationItemData) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    
    const typeDetails = getNotificationTypeDetails(item.type);
    
    if (item.type === 'project_update') {
      const projectItem = item as ProjectNotificationItemData;
      Alert.alert(
        "Detalles del Proyecto",
        `ID: ${projectItem.projectId}\nProyecto: ${projectItem.projectName}\nTarea: ${projectItem.taskSummary || 'No especificada'}`,
        [
          { 
            text: "Cerrar", 
            style: "cancel" 
          },
          { 
            text: "Ir al Proyecto", 
            style: "default",
            onPress: () => console.log("Navegar a proyecto") 
          }
        ]
      );
    } else if (item.type === 'incident_alert') {
      const incidentItem = item as IncidentNotificationItemData;
      Alert.alert(
        "Alerta de Incidencia",
        `ID Incidencia: ${incidentItem.incidentId}\nSeveridad: ${incidentItem.severity.toUpperCase()}\nEstado: ${incidentItem.status.replace('_',' ')}`,
        [
          { 
            text: "Cerrar", 
            style: "cancel" 
          },
          { 
            text: "Ver Detalles", 
            style: "default",
            onPress: () => console.log("Navegar a incidencia") 
          }
        ]
      );
    } else {
      Alert.alert(
        item.title, 
        item.message, 
        [{ 
          text: "OK", 
          style: "default" 
        }]
      );
    }
  };

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
          accentColor={typeDetails.accentColor}
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
              <View style={styles.notificationHeader}>
                <Text style={[styles.notificationTitle, item.read && styles.notificationTitleRead]} numberOfLines={1}>
                  {item.title}
                </Text>
                {!item.read && <View style={[styles.unreadIndicator, { backgroundColor: typeDetails.accentColor }]} />}
              </View>
              <Text style={[styles.notificationMessage, item.read && styles.notificationMessageRead]} numberOfLines={2}>
                {item.message}
              </Text>
              <View style={styles.notificationFooter}>
                <Text style={[styles.notificationTime, item.read && styles.notificationTimeRead]}>
                  {item.time}
                </Text>
                {item.type === 'incident_alert' && (
                  <View style={[styles.severityBadge, { 
                    backgroundColor: (item as IncidentNotificationItemData).severity === 'alta' ? '#FFEBEE' : 
                                    (item as IncidentNotificationItemData).severity === 'media' ? '#FFF8E1' : '#E8F5E9'
                  }]}>
                    <Text style={[styles.severityText, {
                      color: (item as IncidentNotificationItemData).severity === 'alta' ? '#D32F2F' : 
                             (item as IncidentNotificationItemData).severity === 'media' ? '#FF8F00' : '#388E3C'
                    }]}>
                      {(item as IncidentNotificationItemData).severity.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </SwipeableNotification>
      </AnimatedNotificationItem>
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity 
                onPress={handleMarkAllRead} 
                style={styles.headerButton}
                accessibilityLabel="Marcar todas como leídas"
              >
                <Ionicons name="checkmark-done-outline" size={24} color="#4A5568" />
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity 
                onPress={handleClearAll} 
                style={styles.headerButton}
                accessibilityLabel="Eliminar todas las notificaciones"
              >
                <Ionicons name="trash-outline" size={22} color="#4A5568" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {notifications.length > 0 && (
          <View style={styles.swipeHintContainer}>
            <Ionicons name="arrow-back-outline" size={16} color="#5A67D8" style={{ marginRight: 8 }} />
            <Text style={styles.swipeHintText}>Desliza para eliminar</Text>
          </View>
        )}

        {notifications.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="notifications-off-outline" size={48} color="#CBD5E0" />
            </View>
            <Text style={styles.emptyStateTitle}>No hay notificaciones</Text>
            <Text style={styles.emptyStateText}>
              Cuando tengas nuevas notificaciones, aparecerán aquí.
            </Text>
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
              <Text style={styles.undoText}>Deshacer eliminación</Text>
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
  accentColor,
}: {
  children: React.ReactNode;
  onDeleteIntent: () => void;
  setScrollEnabled: (enabled: boolean) => void;
  accentColor: string;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(1)).current;
  const deleteScale = useRef(new Animated.Value(1)).current;
  const SWIPE_THRESHOLD = -Dimensions.get('window').width * 0.3;

  const swipeOpacity = translateX.interpolate({
    inputRange: [SWIPE_THRESHOLD * 1.5, SWIPE_THRESHOLD, 0],
    outputRange: [0.7, 0.85, 1],
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
          translateX.setValue(gs.dx / 3);
        }
      },
      onPanResponderRelease: (_, gs) => {
        setScrollEnabled(true);
        if (gs.dx < SWIPE_THRESHOLD) {
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
      <View style={[styles.deleteActionBackground, { backgroundColor: accentColor }]}>
        <Ionicons name="trash-outline" size={20} color="white" />
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
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  container: { 
    flex: 1 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#2D3748',
    fontFamily: 'System',
    letterSpacing: -0.5
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2
  },
  headerActions: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  headerButton: { 
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: '#F7FAFC'
  },
  listContentContainer: { 
    paddingHorizontal: 16, 
    paddingTop: 8, 
    paddingBottom: 24 
  },
  swipeableContainerWrapper: {
    borderRadius: 14,
    backgroundColor: 'transparent',
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  deleteActionBackground: {
    position: 'absolute', 
    top: 0, 
    bottom: 0, 
    right: 0, 
    width: '100%',
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-end',
    paddingHorizontal: 24, 
    borderRadius: 14,
  },
  deleteActionText: { 
    color: 'white', 
    fontSize: 14, 
    fontWeight: '600', 
    marginLeft: 8 
  },
  notificationItemOuter: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#EDF2F7'
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  notificationTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#2D3748', 
    marginBottom: 4,
    flex: 1,
    paddingRight: 8
  },
  notificationTitleRead: { 
    color: '#718096' 
  },
  notificationMessage: { 
    fontSize: 14, 
    color: '#4A5568', 
    lineHeight: 20, 
    marginBottom: 8 
  },
  notificationMessageRead: { 
    color: '#A0AEC0' 
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  notificationTime: { 
    fontSize: 12, 
    color: '#718096' 
  },
  notificationTimeRead: { 
    color: '#CBD5E0' 
  },
  iconContainer: {
    width: 40, 
    height: 40, 
    borderRadius: 12,
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16,
    marginTop: 2,
  },
  notificationContent: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyStateContainer: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 40,
  },
  emptyStateIcon: {
    backgroundColor: '#F7FAFC',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  emptyStateTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#2D3748', 
    marginBottom: 8 
  },
  emptyStateText: { 
    fontSize: 15, 
    color: '#718096', 
    textAlign: 'center', 
    lineHeight: 22,
    paddingHorizontal: 40
  },
  swipeHintContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 12, 
    backgroundColor: '#EBF4FF',
    marginHorizontal: 24, 
    borderRadius: 10, 
    marginTop: 8, 
    marginBottom: 8,
  },
  swipeHintText: { 
    color: '#5A67D8', 
    fontSize: 13, 
    fontWeight: '500' 
  },
  undoContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  undoText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700'
  }
});

export default NotificationsScreen;