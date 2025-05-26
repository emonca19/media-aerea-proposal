// app/pilot/components/incident-form-modal.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import NewIncidentScreen, { IncidentFormData } from '../new-incident';

interface IncidentFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (incidentData: IncidentFormData) => void;
  activities?: { id: string; name: string; status: string }[];
}

const IncidentFormModal: React.FC<IncidentFormModalProps> = ({ 
  isVisible, 
  onClose, 
  onSubmit,
  activities = []
}) => {
  const router = useRouter();

  // Intercepta la navegación de vuelta para cerrar el modal en su lugar
  React.useEffect(() => {
    const originalBack = router.back;
    router.back = () => {
      onClose();
    };
    return () => {
      router.back = originalBack;
    };
  }, [router, onClose]);

  // Manejador para cuando se envía el formulario desde la pantalla de incidentes
  const handleIncidentSubmit = (incidentData: IncidentFormData) => {
    onSubmit(incidentData);
    onClose();
  };
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Cerrar modal de incidente" accessibilityRole="button">
              <Ionicons name="close" size={36} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <NewIncidentScreen 
            onSubmit={handleIncidentSubmit} 
            activities={activities}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalContent: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 24, // Increased padding to move button lower
    // No shadow for consistency with new activity modal
  },
  closeButton: {
    padding: 12, // Increased for easier tap
  },
});

export default IncidentFormModal;
