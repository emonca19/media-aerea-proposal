// app/pilot/dashboard/components/QuickActionsMenuCard.tsx
import { Ionicons } from '@expo/vector-icons';
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
  };
  
  return (
    <View style={globalStyles.card_container}>
      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsContainer}>
        <TouchableOpacity 
          activeOpacity={0.85}
          style={styles.timelineStyleButton} 
          onPress={onOpenNewActivity}
        >
          <View style={styles.timelineButtonContent}>
            <View style={[styles.timelineIconCircle, { borderColor: '#3b82f6', backgroundColor: '#eff6ff' }]}>
              <Ionicons name="add-circle" size={24} color="#3b82f6" />
            </View>
            <View style={styles.timelineButtonText}>
              <Text style={styles.timelineActionLabel}>Registrar Nueva Actividad</Text>
              <Text style={styles.timelineActionSubtitle}>Captura y monitorea tu trabajo</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          activeOpacity={0.85}
          style={styles.timelineStyleButton} 
          onPress={onOpenNewIncident}
        >
          <View style={styles.timelineButtonContent}>
            <View style={[styles.timelineIconCircle, { borderColor: '#f97316', backgroundColor: '#fff7ed' }]}>
              <Ionicons name="warning" size={24} color="#f97316" />
            </View>
            <View style={styles.timelineButtonText}>
              <Text style={styles.timelineActionLabel}>Reportar Incidente</Text>
              <Text style={styles.timelineActionSubtitle}>Notificar problemas o emergencias</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <QuickRegisterActivityForm
        isVisible={isQuickActivityFormVisible}
        onClose={() => setIsQuickActivityFormVisible(false)}
        onSubmit={handleQuickActivitySubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18, 
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12
  },
  actionsContainer: {
    gap: 12,
    width: '100%'
  },
  timelineStyleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    width: '100%'
  },
  timelineButtonContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timelineIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  timelineButtonText: {
    flex: 1
  },
  timelineActionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#22223b',
    marginBottom: 2
  },
  timelineActionSubtitle: {
    fontSize: 13,
    color: '#64748b'
  }
});

export default QuickActionsMenuCard;
