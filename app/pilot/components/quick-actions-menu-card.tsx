// app/pilot/dashboard/components/QuickActionsMenuCard.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { styles as globalStyles } from './pilot-dashboard-styles';
import QuickRegisterActivityForm from './quick-register-activity-form';

interface QuickActionsMenuCardProps {
  onNavigate: (route: string) => void;
  onOpenNewActivity: () => void;
  onOpenNewIncident: () => void;
  onSubmitActivity?: (activityData: any) => void;
}

const QuickActionsMenuCard: React.FC<QuickActionsMenuCardProps> = ({ 
  onNavigate, 
  onOpenNewActivity, 
  onOpenNewIncident, 
  onSubmitActivity 
}) => {
  const [isQuickActivityFormVisible, setIsQuickActivityFormVisible] = useState(false);
  
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
    <View style={[globalStyles.card_container, styles.quickActionsCard]}>      <View style={styles.actionsContainer}>        <LinearGradient
          colors={["#10b981", "#059669"]}
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
            <Text style={styles.buttonTextPrimary}>Actividad</Text>
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
            <Text style={styles.buttonTextSecondary}>Incidente</Text>
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
    marginTop: 2,
  },
});

export default QuickActionsMenuCard;
