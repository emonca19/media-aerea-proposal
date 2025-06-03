
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QuickRegisterActivityForm from '../../activity-management/add-activity/quick-register-form';
import { styles as globalStyles } from '../main-dashboard/dashboard-styles';

// Constantes para textos de botones - esto previene cualquier cambio dinámico
const BUTTON_TEXTS = {
  ACTIVITY: 'Actividad',
  INCIDENT: 'Incidente'
} as const;

// Texto estático forzado para el botón de incidente
const INCIDENT_BUTTON_TEXT = 'Incidente';

interface QuickActionsMenuCardProps {
  onNavigate: (route: string) => void;
  onOpenNewActivity: () => void;
  onOpenNewIncident: () => void;
  onSubmitActivity?: (activityData: any) => void;
  onViewActivities?: () => void;
  onViewTurbines?: () => void;
  onViewFlights?: () => void;
  onLogout?: () => void;
  currentProject?: any;
  onGoToPreflightChecklist?: () => void;
}

const QuickActionsMenuCard: React.FC<QuickActionsMenuCardProps> = ({ 
  onNavigate, 
  onOpenNewActivity, 
  onOpenNewIncident, 
  onSubmitActivity,
  onViewActivities,
  onViewTurbines,
  onViewFlights,
  onLogout,
  currentProject,
  onGoToPreflightChecklist
}) => {
  const [isQuickActivityFormVisible, setIsQuickActivityFormVisible] = useState(false);
  
  // Memoizar los textos de los botones para evitar cambios dinámicos
  const buttonTexts = useMemo(() => ({
    activity: BUTTON_TEXTS.ACTIVITY,
    incident: INCIDENT_BUTTON_TEXT
  }), []);
  
  const handleQuickActivitySubmit = (activityData: any) => {
    setIsQuickActivityFormVisible(false);
    
    const formattedData = {
      type: activityData.type,
      turbineId: activityData.turbineId,
      notes: activityData.notes,
      customName: activityData.type === 'OTHER' ? activityData.notes.substring(0, 30) : '',
      isForNow: true,
      pendingTime: new Date().toISOString()
    };
    
    if (onSubmitActivity) {
      onSubmitActivity(formattedData);
    } else {
      onOpenNewActivity();
    }
  };  return (
    <View style={[globalStyles.card_container, styles.quickActionsCard]}>
      <View style={styles.actionsContainer}>
        <LinearGradient
          colors={["#792ed9", "#aa74f0"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.gradientButtonPrimary}
        >
          <TouchableOpacity 
            activeOpacity={0.9}
            style={styles.gradientBtnContentPrimary}
            onPress={onOpenNewActivity}
          >
            <View style={styles.buttonIconContainer}>
              <Ionicons name="add-circle" size={24} color="#ffffff" />
            </View>
            <Text style={styles.buttonTextPrimary}>{buttonTexts.activity}</Text>
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient
          colors={["#f59e0b", "#d97706"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.gradientButtonSecondary}
        >
          <TouchableOpacity 
            activeOpacity={0.9}
            style={styles.gradientBtnContentSecondary}
            onPress={onOpenNewIncident}
          >
            <View style={styles.buttonIconContainer}>
              <Ionicons name="warning" size={20} color="#ffffff" />
            </View>
            <Text style={styles.buttonTextSecondary}>{INCIDENT_BUTTON_TEXT}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <QuickRegisterActivityForm
        isVisible={isQuickActivityFormVisible}
        onClose={() => setIsQuickActivityFormVisible(false)}
        onSubmit={handleQuickActivitySubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({  quickActionsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20, // Changed from 16 to 20
    marginTop: 0,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },  actionsContainer: {
    flexDirection: 'row',
    gap: 12, // Changed from 8 to 12
    width: '100%',
  },
  gradientButtonPrimary: {
    flex: 1.6,
    borderRadius: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  gradientButtonSecondary: {
    flex: 1,
    borderRadius: 12,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },gradientBtnContentPrimary: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  gradientBtnContentSecondary: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
  },buttonIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  buttonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  buttonTextSecondary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 2,  },
});

export default memo(QuickActionsMenuCard);
