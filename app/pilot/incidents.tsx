import { Stack } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PilotIncidents() {
  const [description, setDescription] = React.useState('');

  const handleSubmit = () => {
    Alert.alert('Incidencia registrada', 'Tu incidencia ha sido enviada.');
    setDescription('');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Registrar Incidencia', headerStyle: { backgroundColor: '#1a237e' }, headerTintColor: '#fff' }} />
      <Text style={styles.title}>Registrar Incidencia</Text>
      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe la incidencia..."
        placeholderTextColor="#8892b0"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      {/* Aquí iría el botón para subir foto */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Enviar Incidencia</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a192f',
    padding: 16,
  },
  title: {
    color: '#64ffda',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#112240',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
  },
  button: {
    backgroundColor: '#64ffda',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#0a192f',
    fontSize: 16,
    fontWeight: '600',
  },
});
