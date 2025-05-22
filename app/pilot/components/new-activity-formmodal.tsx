// app/pilot/dashboard/components/NewActivityFormModal.tsx
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView, // AÑADIDO para mejor manejo de teclado en formularios largos
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
// Asegúrate de que tus estilos estén bien definidos y la ruta sea correcta
// Si styles viene de './pilot-dashboard-styles', esa ruta es relativa a este archivo.
// Si los estilos están en pilot-dashboard.tsx al nivel de app/pilot/dashboard/, la ruta sería '../pilot-dashboard-styles'
import { styles } from './pilot-dashboard-styles'; // EJEMPLO: Asumiendo que está un nivel arriba
// Importa los datos directamente. Asegúrate que la ruta sea correcta desde este archivo.
import { quickActivityTypes } from './pilot-dashboard-data'; // EJEMPLO: Asumiendo que está un nivel arriba


// Interfaz para los datos del formulario que se envían
export interface ActivityFormData {
  type: string;         // ID del tipo de actividad (ej. 'ACT_FLIGHT')
  customName: string;   // Nombre final de la actividad
  notes: string;
  isForNow: boolean;
  pendingTime: string;
}

// Props del componente Modal
interface NewActivityFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (activityData: ActivityFormData) => void;
}

const NewActivityFormModal: React.FC<NewActivityFormModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  // Estado inicial seguro, usando el primer tipo de actividad o una cadena vacía
  const initialActivityTypeId = quickActivityTypes[0]?.id || '';
  const [activityTypeId, setActivityTypeId] = useState<string>(initialActivityTypeId);
  const [customActivityNameInput, setCustomActivityNameInput] = useState(''); // Nombre para 'ACT_OTHER'
  const [activityNotes, setActivityNotes] = useState('');
  const [isForNow, setIsForNow] = useState(true);
  const [pendingTimeInput, setPendingTimeInput] = useState('');

  // Efecto para resetear el formulario cuando el modal se abre/cierra
  useEffect(() => {
    if (isVisible) {
      console.log("NewActivityFormModal: Modal visible, reseteando formulario.");
      setActivityTypeId(initialActivityTypeId);
      setCustomActivityNameInput('');
      setActivityNotes('');
      setIsForNow(true);
      setPendingTimeInput('');
    }
    // No es estrictamente necesario limpiar al cerrar si se limpia al abrir,
    // pero tu setTimeout es una buena UX si decides mantenerlo.
    // else {
    //   setTimeout(() => {
    //     setActivityTypeId(initialActivityTypeId);
    //     setCustomActivityNameInput('');
    //     setActivityNotes('');
    //     setIsForNow(true);
    //     setPendingTimeInput('');
    //   }, 300);
    // }
  }, [isVisible, initialActivityTypeId]);

  const handleSubmit = () => {
    const selectedTypeInfo = quickActivityTypes.find(qt => qt.id === activityTypeId);

    let finalActivityName = '';
    if (activityTypeId === 'ACT_OTHER') {
      finalActivityName = customActivityNameInput.trim();
      if (!finalActivityName) {
        Alert.alert("Entrada Requerida", "Por favor, ingresa un nombre para la actividad personalizada.");
        return;
      }
    } else if (selectedTypeInfo) {
      finalActivityName = selectedTypeInfo.label;
    } else {
      // Esto no debería ocurrir si el Picker está bien configurado
      Alert.alert("Error", "Tipo de actividad no válido seleccionado.");
      return;
    }

    if (!isForNow && !pendingTimeInput.trim()) {
      Alert.alert("Entrada Requerida", "Para programar una actividad, por favor especifica el tiempo pendiente.");
      return;
    }

    console.log("NewActivityFormModal: Enviando datos:", {
      type: activityTypeId,
      customName: finalActivityName,
      notes: activityNotes.trim(),
      isForNow,
      pendingTime: isForNow ? '' : pendingTimeInput.trim(),
    });

    onSubmit({
      type: activityTypeId, // Enviar el ID del tipo
      customName: finalActivityName, // Nombre procesado
      notes: activityNotes.trim(),
      isForNow,
      pendingTime: isForNow ? '' : pendingTimeInput.trim(),
    });
    // onClose(); // El componente padre (PilotDashboard) cierra el modal después del submit exitoso
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose} // Permite cerrar con el botón "atrás" de Android
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modal_overlay} // Usa estilos globales o define localmente
      >
        {/* ScrollView AÑADIDO para mejor manejo en pantallas pequeñas o con teclado activo */}
        <ScrollView
          contentContainerStyle={styles.modal_scroll_content_container} // Estilo para el contenido del ScrollView
          keyboardShouldPersistTaps="handled" // Importante para que los taps funcionen dentro del ScrollView con teclado
        >
          <View style={styles.modal_view}>
            <View style={styles.modal_headerContainer}>
              <Text style={styles.modal_title}>Registrar Actividad Rápida</Text>
              <TouchableOpacity onPress={onClose} style={styles.modal_closeButton}>
                <Ionicons name="close-circle-outline" size={28} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.form_label}>Tipo de Actividad:</Text>
            <View style={styles.form_pickerContainer}>
              <Picker
                selectedValue={activityTypeId}
                onValueChange={(itemValue) => {
                  setActivityTypeId(itemValue);
                  // Limpiar nombre personalizado si se cambia de "Otro"
                  if (itemValue !== 'ACT_OTHER') {
                    setCustomActivityNameInput('');
                  }
                }}
                style={styles.form_picker}
                itemStyle={styles.form_pickerItem} // Principalmente para iOS
              >
                {quickActivityTypes.map((type: QuickActivityType) => ( // Tipar 'type' aquí
                  <Picker.Item key={type.id} label={type.label} value={type.id} />
                ))}
              </Picker>
            </View>

            {activityTypeId === 'ACT_OTHER' && (
              <>
                <Text style={styles.form_label}>Nombre Actividad Personalizada:</Text>
                <TextInput
                  style={styles.form_textInput}
                  placeholder="Ej: Revisión de documentación"
                  value={customActivityNameInput}
                  onChangeText={setCustomActivityNameInput}
                  placeholderTextColor="#94a3b8" // Changed from '#9ca3af'
                />
              </>
            )}

            <Text style={styles.form_label}>Notas Adicionales (Opcional):</Text>
            <TextInput
              style={[styles.form_textInput, styles.form_textArea]}
              placeholder="Detalles relevantes sobre la actividad..."
              value={activityNotes}
              onChangeText={setActivityNotes}
              multiline={true}
              numberOfLines={3} // Sugerencia, no un límite estricto en Android
              placeholderTextColor="#94a3b8" // Changed from '#9ca3af'
            />

            <View style={styles.form_switchContainer}>
              <Text style={styles.form_label}>¿Iniciar actividad ahora?</Text>
              <Switch
                trackColor={{ false: "#d1d5db", true: "#a5b4fc" }} // Colores de ejemplo
                thumbColor={isForNow ? styles.switch_thumb_active?.color : styles.switch_thumb_inactive?.color || "#f4f3f4"}
                ios_backgroundColor="#e5e7eb"
                onValueChange={setIsForNow}
                value={isForNow}
              />
            </View>

            {!isForNow && (
              <>
                <Text style={styles.form_label}>Programar para:</Text>
                <TextInput
                  style={styles.form_textInput}
                  placeholder="Ej: Hoy 16:30, Mañana por la mañana"
                  value={pendingTimeInput}
                  onChangeText={setPendingTimeInput}
                  placeholderTextColor="#94a3b8" // Changed from '#9ca3af'
                />
              </>
            )}

            <TouchableOpacity style={styles.modal_button} onPress={handleSubmit}>
              <Text style={styles.modal_buttonText}>
                {isForNow ? 'Iniciar Actividad' : 'Programar Actividad'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// No necesitas exportar QuickActivityType desde aquí si se importa de pilotDashboardData
// export { QuickActivityType }; // Solo si la defines localmente y la necesitas fuera

export default NewActivityFormModal;