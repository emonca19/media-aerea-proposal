import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from './common';

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  checked: boolean;
  notes?: string;
}

interface TurbineChecklistProps {
  turbineId: string;
  onSubmit: (checklist: ChecklistItem[]) => void;
}

const initialTurbineChecklist: ChecklistItem[] = [
  // Inspección Visual
  { id: 'v1', category: 'Visual', item: 'Palas sin daños visibles', checked: false },
  { id: 'v2', category: 'Visual', item: 'Sin deformaciones en estructura', checked: false },
  { id: 'v3', category: 'Visual', item: 'Pintura en buen estado', checked: false },
  { id: 'v4', category: 'Visual', item: 'Sin corrosión visible', checked: false },
  
  // Inspección Térmica
  { id: 't1', category: 'Térmica', item: 'Temperatura de palas uniforme', checked: false },
  { id: 't2', category: 'Térmica', item: 'Sin puntos calientes en nacelle', checked: false },
  { id: 't3', category: 'Térmica', item: 'Rodamientos en rango normal', checked: false },
  
  // Inspección Estructural
  { id: 'e1', category: 'Estructural', item: 'Uniones de palas correctas', checked: false },
  { id: 'e2', category: 'Estructural', item: 'Torre sin deformaciones', checked: false },
  { id: 'e3', category: 'Estructural', item: 'Base sin grietas', checked: false },
];

export function TurbineChecklist({ turbineId, onSubmit }: TurbineChecklistProps) {
  const [checklist, setChecklist] = useState(initialTurbineChecklist);
  const [generalNotes, setGeneralNotes] = useState('');

  const handleToggleItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleAddNote = (id: string, note: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, notes: note } : item
      )
    );
  };

  const handleSubmit = () => {
    // Add general notes to a special checklist item
    const completeChecklist = [
      ...checklist,
      {
        id: 'general',
        category: 'General',
        item: 'Notas generales',
        checked: true,
        notes: generalNotes,
      },
    ];
    onSubmit(completeChecklist);
  };

  const categories = Array.from(new Set(checklist.map(item => item.category)));

  return (
    <ScrollView style={styles.container}>
      {categories.map(category => (
        <Card key={category} title={`Inspección ${category}`}>
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
                {item.checked && (
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Agregar notas específicas..."
                    placeholderTextColor="#8892b0"
                    value={item.notes}
                    onChangeText={(text) => handleAddNote(item.id, text)}
                    multiline
                  />
                )}
              </View>
            ))}
        </Card>
      ))}

      <Card title="Notas Generales">
        <TextInput
          style={styles.generalNotes}
          placeholder="Agregar notas generales de la inspección..."
          placeholderTextColor="#8892b0"
          value={generalNotes}
          onChangeText={setGeneralNotes}
          multiline
          numberOfLines={4}
        />
      </Card>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Completar Inspección</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  checklistItem: {
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  noteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginTop: 8,
  },
  generalNotes: {
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