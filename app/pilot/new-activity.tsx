import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Definici�n de la interfaz de datos
export interface ActivityFormData {
  type: string;
  customName: string;
  notes: string;
  isForNow: boolean;
  pendingTime: string;
  turbineId?: string;
}

// Props opcionales para que se pueda usar como pantalla o como componente dentro de un modal
interface NewActivityScreenProps {
  onSubmit?: (activityData: ActivityFormData) => void;
}

export default function NewActivityScreen({ onSubmit }: NewActivityScreenProps = {}) {
  const router = useRouter();
  // Use a default generic activity type
  const [activityType] = useState('GENERIC');
  const [customName, setCustomName] = useState('');
  const [notes, setNotes] = useState('');
  const [isForNow, setIsForNow] = useState(true);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  
  const onTimeChange = (event: any, date?: Date) => {
    // For Android, close the picker when a date is selected
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    // Update the selected time if a date was picked
    if (date) {
      setSelectedTime(date);
    }
  };

  const handleSubmit = () => {
    // Validar entradas
    if (!customName.trim()) {
      alert('Por favor ingresa un nombre para la actividad');
      return;
    }

    // Crear objeto de datos
    const activityData: ActivityFormData = {
      type: activityType || 'GENERIC',
      customName: customName.trim(),
      notes: notes.trim(),
      isForNow: isForNow,
      pendingTime: isForNow ? '' : selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Si tenemos una funci�n onSubmit (modo modal), la llamamos
    if (onSubmit) {
      onSubmit(activityData);
    } else {
      // Modo pantalla independiente - navegar de vuelta
      console.log('Actividad creada:', activityData);
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Registrar',
          headerStyle: { 
            backgroundColor: '#f0f4f8' 
          },
          headerShadowVisible: false
        }} 
      />
      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Registrar Actividad</Text>
        
        <Text style={styles.label}>Nombre Actividad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Inspección Turbina"
          value={customName}
          onChangeText={setCustomName}
          editable={true}
          returnKeyType="next"
        />

        <Text style={styles.label}>Notas</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detalles..."
          value={notes}
          onChangeText={setNotes}
          multiline
          editable={true}
          textAlignVertical="top"
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>�Iniciar ahora?</Text>
          <Switch value={isForNow} onValueChange={setIsForNow} />
        </View>

        {!isForNow && (
          <View>
            <Text style={styles.label}>Horario</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
              <MaterialCommunityIcons name="clock-outline" size={20} />
              <Text style={styles.timeText}>{selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
          </View>
        )}

        {showPicker && Platform.OS === 'ios' && (
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.pickerDoneButton}>Listo</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="spinner"
              onChange={onTimeChange}
              textColor="#1e3a8a"
            />
          </View>
        )}

        {showPicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{isForNow ? 'Iniciar' : 'Programar'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  content: { padding: 16, paddingTop: 24, paddingBottom: 32 },
  pageTitle: { fontSize: 26, fontWeight: '700', color: '#1e3a8a', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', color: '#1e3a8a', marginBottom: 8 },
  input: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#fff' },
  textArea: { height: 80, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  timeText: { marginLeft: 8, fontSize: 16, color: '#334155' },
  button: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 16 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'flex-end', padding: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  pickerDoneButton: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
});
