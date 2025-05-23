// app/pilot/dashboard/components/QuickActionsMenuCard.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './pilot-dashboard-styles'; // Ajusta la ruta si es necesario
import QuickRegisterActivityForm from './quick-register-activity-form';

interface QuickActionsMenuCardProps {
  onNavigate: (route: string) => void;
  onOpenNewActivity: () => void;
  onOpenNewIncident: () => void;
  onSubmitActivity?: (activityData: any) => void;
}

const QuickActionButton = ({ iconName, label, onPress, color }: { iconName: keyof typeof Ionicons.glyphMap, label: string, onPress: () => void, color?: string }) => (
  <TouchableOpacity style={styles.quickAction_button} onPress={onPress}>
    <View style={[styles.quickAction_iconContainer, color ? { backgroundColor: color, borderRadius: 16 } : {}]}>
      <Ionicons name={iconName} size={20} color={color ? "white" : "#2563eb"} />
    </View>
    <Text style={styles.quickAction_label}>{label}</Text>
  </TouchableOpacity>
);

const QuickActionsMenuCard: React.FC<QuickActionsMenuCardProps> = ({ onNavigate, onOpenNewActivity, onOpenNewIncident, onSubmitActivity }) => {
  const [isQuickActivityFormVisible, setIsQuickActivityFormVisible] = useState(false);
    // Handle direct submission from the form
  const handleQuickActivitySubmit = (activityData: any) => {
    // Close the form
    setIsQuickActivityFormVisible(false);
    
    // Format data to match what the parent component expects
    const formattedData = {
      type: activityData.type,
      turbineId: activityData.turbineId,
      notes: activityData.notes,
      customName: activityData.type === 'OTHER' ? activityData.notes.substring(0, 30) : '',
      isForNow: true,
      pendingTime: new Date().toISOString()
    };
      // Now pass the formatted data to the parent handler
    // If onSubmitActivity exists, use it, otherwise fall back to onOpenNewActivity
    if (onSubmitActivity) {
      onSubmitActivity(formattedData);
    } else {
      // Fallback to just opening the activity modal
      onOpenNewActivity();
    }
  };
  
  return (
    <View style={styles.card_container}>
      <Text style={styles.card_title_medium}>Acciones Rápidas</Text>
      <View style={styles.quickActions_grid}>
        <QuickActionButton
          iconName="warning-outline"
          label="Reportar Incidente"
          onPress={onOpenNewIncident}
          color="#f59e42"
        />
        <QuickActionButton
          iconName="flash-outline"
          label="Turbinas"
          onPress={() => onNavigate('/pilot/turbines')}
          color="#0ea5e9"
        />
        <QuickActionButton
          iconName="map-outline"
          label="Mapa de Sitio"
          onPress={() => onNavigate('/pilot/site-map')}
          color="#10b981"
        />
      </View>

      {/* Our styled Quick Register Activity form */}
      <QuickRegisterActivityForm
        isVisible={isQuickActivityFormVisible}
        onClose={() => setIsQuickActivityFormVisible(false)}
        onSubmit={handleQuickActivitySubmit}
      />
    </View>
  );
};

export default QuickActionsMenuCard;
