// app/pilot/dashboard/components/AlertsDisplayCard.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../dashboard/main-dashboard/dashboard-styles';

interface AlertItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW'; // Definir los niveles de severidad
}

interface AlertsDisplayCardProps {
  alerts: AlertItem[];
  isVisible: boolean;
  onToggle: () => void;
  onDismissAlert: (alertId: string) => void;
  onViewDetails?: (alert: AlertItem) => void; // Opcional para ver detalles de alerta
  showDismissAllButton?: boolean; // Nueva prop opcional
  onDismissAllAlerts?: () => void; // Nueva prop opcional para manejar el descarte de todas las alertas
}

const AlertCardItem = React.memo(({ item, onDismissAlert, onViewDetails }: { item: AlertItem, onDismissAlert: (id: string) => void, onViewDetails?: (alert: AlertItem) => void }) => {
  const getSeverityStyle = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'HIGH':
        return styles.alertItem_highSeverity;
      case 'MEDIUM':
        return styles.alertItem_mediumSeverity;
      case 'LOW':
      default:
        return styles.alertItem_lowSeverity;
    }
  };

  const getSeverityIcon = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'HIGH':
        return 'alert-circle'; // Icono para alta severidad
      case 'MEDIUM':
        return 'warning'; // Icono para media severidad
      case 'LOW':
      default:
        return 'information-circle'; // Icono para baja severidad
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.alertItem_container, getSeverityStyle(item.severity)]} 
      onPress={() => onViewDetails && onViewDetails(item)}
      activeOpacity={onViewDetails ? 0.7 : 1}
    >
      <Ionicons 
        name={getSeverityIcon(item.severity)} 
        size={24} 
        color={styles.alertItem_icon.color} // Asumiendo un color base para el icono, la severidad puede sobreescribirlo
        style={styles.alertItem_icon}
      />
      <View style={styles.alertItem_content}>
        <Text style={styles.alertItem_message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.alertItem_timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
      <TouchableOpacity onPress={() => onDismissAlert(item.id)} style={styles.alertItem_dismissButton}>
        <Ionicons name="close-circle" size={22} color="#6b7280" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});
AlertCardItem.displayName = "AlertCardItem";

const AlertsDisplayCard: React.FC<AlertsDisplayCardProps> = ({ alerts, isVisible, onToggle, onDismissAlert, onViewDetails, showDismissAllButton, onDismissAllAlerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <View style={[styles.card_container, styles.alertsCard_noAlertsContainer]}>
        <Ionicons name="notifications-off-outline" size={32} color="#6b7280" />
        <Text style={styles.alertsCard_noAlertsText}>No hay alertas activas en este momento.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card_container}>
      <TouchableOpacity onPress={onToggle} style={styles.alertsCard_header}>
        <View style={styles.alertsCard_titleContainer}>
          <Ionicons name="notifications-outline" size={24} color={styles.card_title_icon.color} style={styles.card_title_icon} />
          <Text style={styles.card_title_medium}>Alertas ({alerts.length})</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {isVisible && showDismissAllButton && onDismissAllAlerts && alerts.length > 0 && (
            <TouchableOpacity onPress={onDismissAllAlerts} style={styles.dismissAllButton}> 
              <Ionicons name="close-circle-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          )}
          <Ionicons name={isVisible ? "chevron-up-outline" : "chevron-down-outline"} size={24} color="#6b7280" style={{marginLeft: 8}}/>
        </View>
      </TouchableOpacity>

      {isVisible && (
        <FlatList
          data={alerts}
          renderItem={({ item }) => <AlertCardItem item={item} onDismissAlert={onDismissAlert} onViewDetails={onViewDetails}/>}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => <View style={styles.alertItem_separator} />}
          style={styles.alertsCard_list}
        />
      )}
    </View>
  );
};

export default AlertsDisplayCard;

// All card containers use styles.card_container, which is now flat (no shadow/elevation)
