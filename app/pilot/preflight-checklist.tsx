import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CloseCircle, TickCircle } from 'iconsax-react-native';
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
import { mockTurbines } from '../../src/mocks/data';

// Define the type for icon names from MaterialCommunityIcons
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const CATEGORIES = ['Dron', 'Seguridad', 'Condiciones'] as const;
type Category = typeof CATEGORIES[number];

interface ChecklistItem {
  id: string;
  category: Category;
  item: string;
  checked: boolean;
  notes?: string;
}

const initialPreflightChecklist: ChecklistItem[] = [
  { id: '1', category: 'Dron', item: 'Hélices en buen estado', checked: false },
  { id: '2', category: 'Dron', item: 'Baterías cargadas', checked: false },
  { id: '3', category: 'Dron', item: 'Cámara funcionando', checked: false },
  { id: '4', category: 'Dron', item: 'GPS conectado', checked: false },
  { id: '5', category: 'Seguridad', item: 'Conos de seguridad disponibles', checked: false },
  { id: '6', category: 'Seguridad', item: 'Área de despegue despejada', checked: false },
  { id: '7', category: 'Seguridad', item: 'EPP completo', checked: false },
  { id: '8', category: 'Condiciones', item: 'Viento dentro de límites', checked: false },
  { id: '9', category: 'Condiciones', item: 'Visibilidad adecuada', checked: false },
  { id: '10', category: 'Condiciones', item: 'Sin precipitación', checked: false },
];

const categoryIcons: Record<Category, MaterialCommunityIconName> = {
  'Dron': 'drone',
  'Seguridad': 'shield-check',
  'Condiciones': 'weather-cloudy'
};

export default function PreflightChecklistScreen() {
  const { turbineId } = useLocalSearchParams();
  const router = useRouter();
  const [preflightChecklist, setPreflightChecklist] = useState(initialPreflightChecklist);
  const [generalNotes, setGeneralNotes] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<Category[]>([]);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  const [photoTakenCategories, setPhotoTakenCategories] = useState<Category[]>([]);

  const turbine = turbineId ? mockTurbines.find(t => t.id === turbineId) : null;

  const handleToggleItem = (id: string) => {
    setPreflightChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleOpenCamera = async (category: Category) => {
    if (!cameraPermission?.granted) {
      const permissionResult = await requestCameraPermission();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }
    }

    if (!mediaLibraryPermission?.granted) {
      const permissionResult = await requestMediaLibraryPermission();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Media library permission is required to save photos.');
        return;
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        console.log('ImagePicker Result:', result.assets ? result.assets[0].uri : 'No assets');
        // Here you can handle the taken image, e.g., save its URI
        // Alert.alert('Photo Taken', `Photo for ${category} taken successfully! URI: ${result.assets ? result.assets[0].uri : 'N/A'}`);
        if (!photoTakenCategories.includes(category)) {
          setPhotoTakenCategories(prev => [...prev, category]);
        }
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const toggleCategory = (category: Category) => {
    setExpandedCategory(prevExpandedCategories =>
      prevExpandedCategories.includes(category)
        ? prevExpandedCategories.filter(c => c !== category)
        : [...prevExpandedCategories, category]
    );
  };

  const handleSubmitPreflight = () => {
    const uncheckedItems = preflightChecklist.filter(item => !item.checked);
    const allPhotosTaken = photoTakenCategories.length === CATEGORIES.length;

    if (!allPhotosTaken) {
      Alert.alert(
        'Fotos Faltantes',
        'Por favor, toma una foto para cada categoría antes de continuar.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    if (uncheckedItems.length > 0) {
      Alert.alert(
        'Lista Incompleta',
        '¿Estás seguro de que quieres iniciar el vuelo con elementos sin verificar?',
        [
          { text: 'Revisar', style: 'cancel' },
          { text: 'Continuar', onPress: submitChecklist }
        ]
      );
    } else {
      submitChecklist();
    }
  };
  const submitChecklist = () => {
    const successMessage = turbine ? 
      `¡Checklist completado para ${turbine.name}! Ahora puedes iniciar el trabajo en la turbina.` : 
      '¡Todo listo para el vuelo!';
      
    Alert.alert(
      'Checklist Completado',
      successMessage,
      [
        { 
          text: 'Continuar', 
          onPress: () => {
            if (turbine) {
              // Si hay una turbina específica, ir al activity log con un mensaje
              router.push('/pilot/activity-log');
              // Opcional: Aquí podrías pasar parámetros para pre-seleccionar la turbina
            } else {
              router.push('/pilot/dashboard');
            }
            // Reset form states
            setPreflightChecklist(initialPreflightChecklist);
            setGeneralNotes('');
            setExpandedCategory([]);
            setPhotoTakenCategories([]);
          }
        }
      ]
    );
  };

  const getCompletionPercentage = (category?: Category) => {
    const items = category ? 
      preflightChecklist.filter(i => i.category === category) : 
      preflightChecklist;
      
    const checked = items.filter(i => i.checked).length;
    return Math.round((checked / items.length) * 100);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: turbine ? `Inspección - ${turbine.name}` : 'Checklist Prevuelo',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#1e40af',
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.content}>
        {!turbine ? (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Verificación Prevuelo</Text>
              <Text style={styles.headerSubtitle}>
                Completa todos los checks antes de despegar
              </Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${getCompletionPercentage()}%` }]} />
              </View>
              <Text style={styles.progressText}>{getCompletionPercentage()}% completado</Text>
            </View>

            {CATEGORIES.map(category => (
              <Card key={category} style={styles.categoryCard}>
                <TouchableOpacity 
                  style={styles.categoryHeader}
                  onPress={() => toggleCategory(category)}
                >
                  <View style={styles.categoryTitleContainer}>
                    <MaterialCommunityIcons 
                      name={categoryIcons[category]} 
                      size={24} 
                      color="#1e40af" 
                    />
                    <Text style={styles.categoryTitle}>{category}</Text>
                  </View>
                    <TouchableOpacity onPress={() => handleOpenCamera(category)} style={{ marginRight: 8, padding: 4 /* Added padding for touchability */ }}>
                      <MaterialCommunityIcons 
                        name="camera" 
                        size={28 /* Increased size */} 
                        color={photoTakenCategories.includes(category) ? "#10b981" : "#6b7280"} /* Changed color for default state */
                      />
                    </TouchableOpacity>
                  <View style={styles.categoryStatus}>
                    <Text style={styles.categoryPercentage}>
                      {getCompletionPercentage(category)}%
                    </Text>
                    <MaterialCommunityIcons 
                      name={expandedCategory.includes(category) ? 'chevron-up' : 'chevron-down'} 
                      size={24} 
                      color="#6b7280" 
                    />
                  </View>
                </TouchableOpacity>

                {expandedCategory.includes(category) && (
                  <View style={styles.checklistItems}>
                    {preflightChecklist
                      .filter(item => item.category === category)
                      .map(item => (
                        <View key={item.id} style={styles.checklistItem}>
                          <View style={styles.itemContent}>
                            {item.checked ? (
                              <TickCircle size={24} color="#10b981" variant="Bold" />
                            ) : (
                              <CloseCircle size={24} color="#ef4444" variant="Bold" />
                            )}
                            <Text style={[
                              styles.itemText,
                              item.checked && styles.itemTextChecked
                            ]}>
                              {item.item}
                            </Text>
                          </View>
                          <Switch
                            value={item.checked}
                            onValueChange={() => handleToggleItem(item.id)}
                            trackColor={{ false: '#d1d5db', true: '#a7f3d0' }}
                            thumbColor={item.checked ? '#10b981' : '#f3f4f6'}
                          />
                        </View>
                      ))}
                  </View>
                )}
              </Card>
            ))}

            <Card style={styles.notesCard}>
              <Text style={styles.notesTitle}>Notas Adicionales</Text>
              <TextInput
                style={styles.notesInput}
                multiline
                placeholder="Agregar notas o comentarios relevantes..."
                placeholderTextColor="#9ca3af"
                value={generalNotes}
                onChangeText={setGeneralNotes}
              />
            </Card>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (getCompletionPercentage() < 100 || photoTakenCategories.length < CATEGORIES.length) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitPreflight}
              disabled={getCompletionPercentage() < 100 || photoTakenCategories.length < CATEGORIES.length}
            >
              <Text style={styles.submitButtonText}>
                {getCompletionPercentage() === 100 && photoTakenCategories.length === CATEGORIES.length ? 
                  'Confirmar y Comenzar Vuelo' : 
                  (getCompletionPercentage() < 100 ? 'Completar todos los checks' : 'Tomar todas las fotos')}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.turbineContainer}>
            <View style={styles.turbineHeader}>
              <MaterialCommunityIcons name="wind-turbine" size={32} color="#1e40af" />
              <Text style={styles.turbineTitle}>Checklist de Turbina {turbine.name}</Text>
            </View>
            <Text style={styles.turbineSubtitle}>
              Complete todas las verificaciones antes de comenzar la inspección
            </Text>
            
            <Card style={styles.turbineCard}>
              <View style={styles.checklistItem}>
                <View style={styles.itemContent}>
                  <TickCircle size={24} color="#10b981" variant="Bold" />
                  <Text style={styles.itemTextChecked}>Verificación estructural</Text>
                </View>
              </View>
              <View style={styles.checklistItem}>
                <View style={styles.itemContent}>
                  <TickCircle size={24} color="#10b981" variant="Bold" />
                  <Text style={styles.itemTextChecked}>Aspas</Text>
                </View>
              </View>
              <View style={styles.checklistItem}>
                <View style={styles.itemContent}>
                  <CloseCircle size={24} color="#ef4444" variant="Bold" />
                  <Text style={styles.itemText}>Sistema eléctrico</Text>
                </View>
                <Switch
                  value={false}
                  onValueChange={() => {}}
                  trackColor={{ false: '#d1d5db', true: '#a7f3d0' }}
                  thumbColor="#f3f4f6"
                />
              </View>
            </Card>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => router.push('/pilot/activity-log')}
            >
              <Text style={styles.submitButtonText}>Finalizar Inspección</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 12,
  },  header: {
    marginBottom: 20, // Reduced from 24
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24, // Increased from 22
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
    letterSpacing: -0.5, // Added for modern look
  },
  headerSubtitle: {
    fontSize: 15, // Increased from 14
    color: '#64748b', // Slightly darker
    marginBottom: 20, // Increased from 16
    lineHeight: 20,
  },
  progressContainer: {
    height: 8, // Increased from 6
    backgroundColor: '#f1f5f9', // Lighter background
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1e40af',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    textAlign: 'right',
    marginTop: 4, // Added spacing
  },categoryCard: {
    marginBottom: 12, // Reduced from 16
    borderRadius: 16, // Increased from 12
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryTitle: {
    fontSize: 17, // Slightly reduced from 18
    fontWeight: '600',
    color: '#1e40af',
    marginLeft: 10, // Reduced from 12
  },
  categoryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 88, // Added to stabilize width
  },
  categoryPercentage: {
    fontSize: 15, // Reduced from 16
    fontWeight: '600',
    color: '#1e40af',
    marginRight: 6, // Reduced from 8
  },checklistItems: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5, // Reduced from 12
    paddingHorizontal: 0,
    marginVertical: 2, // Added small vertical spacing
    borderRadius: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8, // Reduced from 12
  },
  itemText: {
    fontSize: 15, // Slightly reduced from 16
    color: '#374151',
    marginLeft: 8, // Reduced from 12
    flexShrink: 1,
    fontWeight: '500',
  },
  itemTextChecked: {
    fontSize: 15,
    color: '#6b7280',
    marginLeft: 8,
    flexShrink: 1,
    textDecorationLine: 'line-through',
    fontWeight: '400',
  },
  notesCard: {
    marginBottom: 24,
    marginHorizontal: 0,
    padding: 0,
  },
  notesTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#374151',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#1e40af',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
    shadowColor: 'transparent',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  turbineContainer: {
    flex: 1,
  },
  turbineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  turbineTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e40af',
    marginLeft: 12,
  },
  turbineSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  turbineCard: {
    marginBottom: 24,
  },
});
