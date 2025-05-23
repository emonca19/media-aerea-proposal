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
  };
  
  return (
    <View style={globalStyles.card_container}>
      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          activeOpacity={0.85}
          style={styles.mainActionButton} 
          onPress={onOpenNewActivity}
        >
          <LinearGradient
            colors={['#3b82f6', '#1d4ed8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            <View style={styles.mainButtonContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="add-circle" size={32} color="white" />
              </View>
              <View style={styles.labelContainer}>
                <Text style={styles.mainActionLabel}>Registrar Nueva Actividad</Text>
                <Text style={styles.mainActionSubtitle}>Captura y monitorea tu trabajo</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>        <TouchableOpacity 
          activeOpacity={0.85}
          style={styles.secondaryActionButton} 
          onPress={onOpenNewIncident}
        >
          <LinearGradient
            colors={['#f97316', '#ea580c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            <View style={styles.mainButtonContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="warning" size={28} color="white" />
              </View>
              <View style={styles.labelContainer}>
                <Text style={styles.mainActionLabel}>Reportar Incidente</Text>
                <Text style={styles.mainActionSubtitle}>Notificar problemas o emergencias</Text>
              </View>
            </View>
          </LinearGradient>
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
  },  actionsContainer: {
    gap: 14,
    width: '100%' // Asegurar que el contenedor ocupe todo el ancho disponible
  },  mainActionButton: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: 'hidden',
    width: '100%' // Asegurar que ocupe todo el ancho
  },
  gradientBackground: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  mainButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  labelContainer: {
    flex: 1
  },
  mainActionLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white'
  },
  mainActionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2
  },  secondaryActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    width: '100%' // Asegurar que ocupe todo el ancho
  },
  secondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 10
  },
  secondaryActionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  }
});

export default QuickActionsMenuCard;
