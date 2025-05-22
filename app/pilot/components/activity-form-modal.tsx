// app/pilot/components/activity-form-modal.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import NewActivityScreen, { ActivityFormData } from '../new-activity';

interface ActivityFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (activityData: ActivityFormData) => void;
}

const ActivityFormModal: React.FC<ActivityFormModalProps> = ({ isVisible, onClose, onSubmit }) => {
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

  // Manejador para cuando se envía el formulario desde la pantalla de actividad
  const handleActivitySubmit = (activityData: ActivityFormData) => {
    onSubmit(activityData);
    onClose();
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <NewActivityScreen onSubmit={handleActivitySubmit} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    padding: 8,
  },
});

export default ActivityFormModal;
