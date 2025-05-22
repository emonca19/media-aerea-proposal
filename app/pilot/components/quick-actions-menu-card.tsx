// app/pilot/dashboard/components/QuickActionsMenuCard.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './pilot-dashboard-styles'; // Ajusta la ruta si es necesario

interface QuickActionsMenuCardProps {
  onNavigate: (route: string) => void;
  onOpenNewActivity: () => void;
  onOpenNewIncident: () => void;
}

const QuickActionButton = ({ iconName, label, onPress, color, isMain }: { iconName: keyof typeof Ionicons.glyphMap, label: string, onPress: () => void, color?: string, isMain?: boolean }) => (
  <TouchableOpacity style={[styles.quickAction_button, isMain && styles.quickAction_button_main]} onPress={onPress}>
    <View style={[styles.quickAction_iconContainer, !isMain && color ? { backgroundColor: color, borderRadius: 16 } : (isMain && color ? { backgroundColor: color, borderRadius: 16 } : {})]}>
      <Ionicons name={iconName} size={isMain ? 22 : 20} color={color ? "white" : "#2563eb"} />
    </View>
    <Text style={styles.quickAction_label}>{label}</Text>
  </TouchableOpacity>
);

const QuickActionsMenuCard: React.FC<QuickActionsMenuCardProps> = ({ onNavigate, onOpenNewActivity, onOpenNewIncident }) => {
  return (
    <View style={styles.card_container}>
      <Text style={styles.card_title_medium}>Acciones Rápidas</Text>
      <View style={styles.quickActions_grid}>
        <QuickActionButton
          iconName="add-circle-outline"
          label="Registrar Actividad"
          onPress={onOpenNewActivity}
          color="#2563eb"
          isMain={true} // Indicate this is the main button
        />
        <QuickActionButton
          iconName="warning-outline"
          label="Reportar Incidente"
          onPress={onOpenNewIncident}
          color="#f59e42"
        />
        <QuickActionButton
          iconName="chatbubbles-outline"
          label="Soporte"
          onPress={() => onNavigate('/pilot/support-chat')}
          color="#ef4444"
        />
      </View>
    </View>
  );
};

export default QuickActionsMenuCard;
