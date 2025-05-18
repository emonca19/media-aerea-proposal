import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Card } from '../../src/components/common';

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  checked: boolean;
  notes?: string;
}

const initialChecklist: ChecklistItem[] = [
  // Dron
  { id: '1', category: 'Dron', item: 'Hélices en buen estado', checked: false },
  { id: '2', category: 'Dron', item: 'Baterías cargadas', checked: false },
  { id: '3', category: 'Dron', item: 'Cámara funcionando', checked: false },
  { id: '4', category: 'Dron', item: 'GPS conectado', checked: false },
  
  // Seguridad
  { id: '5', category: 'Seguridad', item: 'Conos de seguridad disponibles', checked: false },
  { id: '6', category: 'Seguridad', item: 'Área de despegue despejada', checked: false },
  { id: '7', category: 'Seguridad', item: 'EPP completo', checked: false },
  
  // Condiciones
  { id: '8', category: 'Condiciones', item: 'Viento dentro de límites', checked: false },
  { id: '9', category: 'Condiciones', item: 'Visibilidad adecuada', checked: false },
  { id: '10', category: 'Condiciones', item: 'Sin precipitación', checked: false },
];

export default function PreflightChecklistScreen() {
  const [checklist, setChecklist] = useState(initialChecklist);
  const [notes, setNotes] = useState('');

  const handleToggleItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleSubmit = () => {
    const uncheckedItems = checklist.filter(item => !item.checked);
    if (uncheckedItems.length > 0) {
      Alert.alert(
        'Lista Incompleta',
        '¿Estás seguro de que quieres iniciar el vuelo con elementos sin verificar?',
        [
          { text: 'Revisar', style: 'cancel' },
          { text: 'Continuar', style: 'destructive', onPress: submitChecklist }
        ]
      );
    } else {
      submitChecklist();
    }
  };

  const submitChecklist = () => {
    // Aquí iría la lógica para guardar el checklist
    Alert.alert('Éxito', 'Checklist completado. Puede iniciar el vuelo.');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Checklist Prevuelo',
          headerStyle: { backgroundColor: '#1a237e' },
          headerTintColor: '#fff',
        }}
      />
      <LinearGradient
        colors={['#1a237e', '#0d47a1', '#01579b']}
        style={styles.gradient}
      >
        <ScrollView style={styles.content}>
          {['Dron', 'Seguridad', 'Condiciones'].map(category => (
            <Card key={category} title={category}>
              {checklist
                .filter(item => item.category === category)
                .map(item => (
                  <View key={item.id} style={styles.checklistItem}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemText}>{item.item}</Text>
                      <Switch
                        value={item.checked}
                        onValueChange={() => handleToggleItem(item.id)}
                        trackColor={{ false: '#666', true: '#64ffda' }}
                        thumbColor={item.checked ? '#fff' : '#f4f3f4'}
                      />
                    </View>
                    {item.notes && (
                      <Text style={styles.itemNotes}>{item.notes}</Text>
                    )}
                  </View>
                ))}
            </Card>
          ))}

          <Card title="Notas Adicionales">
            <TextInput
              style={styles.notesInput}
              multiline
              numberOfLines={4}
              placeholder="Agregar notas o comentarios..."
              placeholderTextColor="#8892b0"
              value={notes}
              onChangeText={setNotes}
            />
          </Card>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>
              Confirmar y Comenzar Vuelo
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a192f',
  },
  gradient: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  checklistItem: {
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  itemNotes: {
    color: '#8892b0',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 8,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#64ffda',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  submitButtonText: {
    color: '#0a192f',
    fontSize: 16,
    fontWeight: '600',
  },
});
