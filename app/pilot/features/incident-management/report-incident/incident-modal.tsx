// app/pilot/components/incident-form-modal.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import NewIncidentScreen, { IncidentFormData } from './new-incident-form';

interface IncidentFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (incidentData: IncidentFormData) => void;
  currentActivity?: { id: string; name: string; status: string } | null;
}

const IncidentFormModal: React.FC<IncidentFormModalProps> = ({ 
  isVisible, 
  onClose, 
  onSubmit,
  currentActivity = null
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
  return (
    <NewIncidentScreen 
      isVisible={isVisible}
      onClose={onClose}
      onSubmit={onSubmit} 
      currentActivity={currentActivity}
    />
  );
};

export default IncidentFormModal;
