// app/pilot/dashboard/components/NewIncidentFormModal.tsx
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView, // AÑADIDO
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { incidentTypes } from './pilot-dashboard-data'; // EJEMPLO
import { styles } from './pilot-dashboard-styles';

// Interfaz para los datos del formulario que se envían
export interface IncidentFormData {
  type: string;        // ID del tipo de incidente (ej. 'INC_WEATHER')
  description: string;
}

// Props del componente Modal
interface NewIncidentFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (incidentData: IncidentFormData) => void;
  incidentTypes: typeof incidentTypes; // Añadimos este prop explícitamente
}

const NewIncidentFormModal: React.FC<NewIncidentFormModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  incidentTypes: providedIncidentTypes,
}) => {
  // Usar los tipos de incidentes proporcionados o los importados por defecto
  const typesToUse = providedIncidentTypes || incidentTypes;
  // Estado inicial seguro
  const initialIncidentTypeId = typesToUse[0]?.id || '';
  const [incidentTypeId, setIncidentTypeId] = useState<string>(initialIncidentTypeId);
  const [incidentDescription, setIncidentDescription] = useState('');

  // Efecto para resetear el formulario cuando el modal se abre/cierra
  useEffect(() => {
    if (isVisible) {
      console.log("NewIncidentFormModal: Modal visible, reseteando formulario.");
      setIncidentTypeId(initialIncidentTypeId);
      setIncidentDescription('');
    }
    // else { // Opcional: reset con delay al cerrar
    //   setTimeout(() => {
    //     setIncidentTypeId(initialIncidentTypeId);
    //     setIncidentDescription('');
    //   }, 300);
    // }
  }, [isVisible, initialIncidentTypeId]);

  const handleSubmit = () => {
    if (!incidentTypeId) { // Comprobar si el ID es una cadena vacía (si incidentTypes estaba vacío)
      Alert.alert("Campo Requerido", "Por favor, selecciona un tipo de incidente.");
      return;
    }
    if (!incidentDescription.trim()) {
      Alert.alert("Campo Requerido", "Por favor, ingresa una descripción para el incidente.");
      return;
    }

    console.log("NewIncidentFormModal: Enviando datos:", {
      type: incidentTypeId,
      description: incidentDescription.trim(),
    });

    onSubmit({
      type: incidentTypeId,
      description: incidentDescription.trim(),
    });
    // onClose(); // El componente padre (PilotDashboard) cierra el modal
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modal_overlay} 
      >
        
        <ScrollView
          contentContainerStyle={styles.modal_scroll_content_container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modal_view}>
            <View style={styles.modal_headerContainer}>
              <Text style={styles.modal_title}>Registrar Nuevo Incidente</Text>
              <TouchableOpacity onPress={onClose} style={styles.modal_closeButton}>
                <Ionicons name="close-circle-outline" size={28} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.form_label}>Tipo de Incidente:</Text>
            <View style={styles.form_pickerContainer}>
              <Picker
                selectedValue={incidentTypeId}
                onValueChange={(itemValue) => setIncidentTypeId(itemValue)}
                style={styles.form_picker}
                itemStyle={styles.form_pickerItem} // Principalmente para iOS
              >                {/* Añadir un item placeholder si se desea */}
                {/* <Picker.Item label="Seleccione un tipo..." value="" enabled={false} style={{color: '#9ca3af'}} /> */}
                {typesToUse.map((type) => (
                  <Picker.Item key={type.id} label={type.label} value={type.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.form_label}>Descripción Detallada del Incidente:</Text>
            <TextInput
              style={[styles.form_textInput, styles.form_textArea]}
              placeholder="Describe qué ocurrió, las condiciones observadas, el impacto, etc."
              value={incidentDescription}
              onChangeText={setIncidentDescription}
              multiline={true}
              numberOfLines={5} // Aumentado para más espacio
              placeholderTextColor="#94a3b8" // Changed from '#9ca3af'
              textAlignVertical="top" // Para Android, para que el texto multilínea empiece arriba
            />

            <TouchableOpacity style={styles.modal_button} onPress={handleSubmit}>
              <Text style={styles.modal_buttonText}>Registrar Incidente</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// No necesitas exportar IncidentTypeDefinition desde aquí si se importa de pilotDashboardData
// export { IncidentTypeDefinition };

export default NewIncidentFormModal;