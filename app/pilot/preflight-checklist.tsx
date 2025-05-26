import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CloseCircle, TickCircle } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react';
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
import { mockTurbines } from '../../src/mocks/index';

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
  const params = useLocalSearchParams<{ turbineId?: string; activityToStart?: string }>();
  const { turbineId, activityToStart } = params; // activityToStart here is the critical one
  const router = useRouter();
  const [preflightChecklist, setPreflightChecklist] = useState(initialPreflightChecklist);
  const [generalNotes, setGeneralNotes] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<Category[]>([]);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  const [photoTakenCategories, setPhotoTakenCategories] = useState<Category[]>([]);

  const turbine = turbineId ? mockTurbines.find(t => t.id === turbineId) : null;

  // Add this useEffect to log received parameters
  useEffect(() => {
    console.log('[PreflightChecklistScreen] Received params on load/change:', JSON.stringify(params));
    console.log('[PreflightChecklistScreen] Parsed turbineId from params:', turbineId);
    console.log('[PreflightChecklistScreen] Parsed activityToStart (activity ID) from params:', activityToStart);
    console.log('[PreflightChecklistScreen] Derived turbine object (ID if exists, else null):', turbine ? turbine.id : 'null');
  }, [params, turbineId, activityToStart, turbine]); // Corrected dependencies array

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
    
    // Ya no requerimos que todas las fotos estén tomadas
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
    console.log('[PreflightChecklistScreen] submitChecklist called.');
    console.log('[PreflightChecklistScreen] submitChecklist - current activityToStart (param):', activityToStart);
    console.log('[PreflightChecklistScreen] submitChecklist - current turbineId (param):', turbineId);
    console.log('[PreflightChecklistScreen] submitChecklist - current turbine (object):', turbine ? turbine.id : 'null');

    if (activityToStart) {
      console.log('[PreflightChecklistScreen] submitChecklist: Navigating with activityToStartAfterPreflight.');
      router.replace({
        pathname: '/pilot/dashboard',
        params: {
          activityToStartAfterPreflight: String(activityToStart),
          preflightCompletedForTurbine: 'true',
          turbineIdForActivityStart: turbine ? turbine.id : (typeof turbineId === 'string' ? turbineId : undefined),
        }
      });
    } else if (turbine) {
      console.log('[PreflightChecklistScreen] submitChecklist: Navigating with turbineIdForActivityStart (no pre-existing activity ID).');
      router.replace({
        pathname: '/pilot/dashboard',
        params: {
          preflightCompletedForTurbine: 'true',
          turbineIdForActivityStart: turbine.id,
        }
      });
    } else {
      // This is the log you are seeing
      console.warn("[PreflightChecklistScreen] submitChecklist: Neither activityToStart (param) nor turbine (object) are present. Returning to dashboard without specific start parameters.");
      router.push('/pilot/dashboard');
    }
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
          headerTintColor: '#4338ca',
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
              {photoTakenCategories.length > 0 && photoTakenCategories.length < CATEGORIES.length && (
                <Text style={styles.photoHint}>
                  Has tomado {photoTakenCategories.length} de {CATEGORIES.length} fotos (opcional)
                </Text>
              )}
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
                      size={26} 
                      color="#4f46e5" 
                    />
                    <Text style={styles.categoryTitle}>{category}</Text>
                  </View>                      <TouchableOpacity 
                    onPress={() => handleOpenCamera(category)} 
                    style={{ 
                      marginRight: 8, 
                      padding: 6,
                      backgroundColor: photoTakenCategories.includes(category) ? '#eef2ff' : 'transparent',
                      borderRadius: 20
                    }}
                  >
                    <MaterialCommunityIcons 
                      name="camera" 
                      size={24} 
                      color={photoTakenCategories.includes(category) ? "#4f46e5" : "#6b7280"}
                    />
                  </TouchableOpacity>
                  <View style={styles.categoryStatus}>
                    <Text style={styles.categoryPercentage}>
                      {getCompletionPercentage(category)}%
                    </Text>                    
                    <MaterialCommunityIcons 
                      name={expandedCategory.includes(category) ? 'chevron-up' : 'chevron-down'} 
                      size={22} 
                      color="#4f46e5" 
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
                              <TickCircle size={22} color="#4f46e5" variant="Bold" />
                            ) : (
                              <CloseCircle size={22} color="#ef4444" variant="Bold" />
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
                            trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
                            thumbColor={item.checked ? '#4f46e5' : '#f3f4f6'}
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
            </Card>            <TouchableOpacity
              style={[
                styles.submitButton,
                getCompletionPercentage() < 100 && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitPreflight}
              disabled={getCompletionPercentage() < 100}
            >
              <Text style={styles.submitButtonText}>
                {getCompletionPercentage() === 100 ? 
                  'Confirmar y Comenzar Vuelo' : 
                  'Completar todos los checks'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.turbineContainer}>
            <View style={styles.turbineHeader}>
              <MaterialCommunityIcons name="wind-turbine" size={32} color="#4338ca" />
              <Text style={styles.turbineTitle}>Checklist de Turbina {turbine.name}</Text>
            </View>
            <Text style={styles.turbineSubtitle}>
              Complete todas las verificaciones antes de comenzar la inspección
            </Text>
            
            <Card style={styles.turbineCard}>
              <View style={styles.checklistItem}>
                <View style={styles.itemContent}>
                  <TickCircle size={22} color="#4f46e5" variant="Bold" />
                  <Text style={styles.itemTextChecked}>Verificación estructural</Text>
                </View>
              </View>
              <View style={styles.checklistItem}>
                <View style={styles.itemContent}>
                  <TickCircle size={22} color="#4f46e5" variant="Bold" />
                  <Text style={styles.itemTextChecked}>Aspas</Text>
                </View>
              </View>
              <View style={styles.checklistItem}>
                <View style={styles.itemContent}>
                  <CloseCircle size={22} color="#ef4444" variant="Bold" />
                  <Text style={styles.itemText}>Sistema eléctrico</Text>
                </View>
                <Switch
                  value={false}
                  onValueChange={() => {}}
                  trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
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
    backgroundColor: '#f5f7ff', // Fondo más coherente con el dashboard
  },
  content: {
    padding: 20, // Más padding para dar más espacio y consistencia
  },
  header: {
    marginBottom: 5, 
    padding: 22,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5edff',
  },
  headerTitle: {
    fontSize: 24, // Tamaño coherente con el dashboard
    fontWeight: '700',
    color: '#4338ca', // Color principal del sistema
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  progressContainer: {
    height: 8, // Altura consistente con el dashboard
    backgroundColor: '#e0e7ff', // Fondo azul claro
    borderRadius: 4, // Bordes ligeramente redondeados
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#4f46e5', // Color principal violeta/azul
  },
  progressText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4f46e5', // Combinando con el color de la barra
    textAlign: 'right',
    marginTop: 6,
  },
  categoryCard: {
    marginBottom: 5, // Más espacio entre categorías
    borderRadius: 16, // Redondeado consistente
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#4f46e5', // Sombra coordinada con color principal
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1, // Añadimos borde
    borderColor: '#e5edff', // Borde sutil azul claro
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14, // Más padding para dar espacio
    borderBottomWidth: 1,
    borderBottomColor: '#e5edff',
    backgroundColor: '#fafbff', // Fondo ligeramente distinto
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryTitle: {
    fontSize: 17, 
    fontWeight: '700',
    color: '#4338ca', // Color más intenso similar al dashboard
    marginLeft: 12,
    letterSpacing: 0.2, // Espaciado de letras consistente
  },
  categoryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#eef2ff', // Fondo más consistente con el tema violeta
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    minWidth: 85,
    borderWidth: 1,
    borderColor: '#c7d2fe', // Borde más coherente con el tema 
  },
  categoryPercentage: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4f46e5', // Usando nuestro color azul/violeta principal
    marginRight: 6,
  },
  checklistItems: {
    paddingHorizontal: 16, // Más espacio en los laterales
    paddingBottom: 16,
    paddingTop: 0,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12, // Más espacio vertical
    paddingHorizontal: 10, // Padding horizontal consistente
    marginVertical: 5, // Separación consistente entre items
    borderRadius: 10, // Redondeado coherente con otros elementos
    backgroundColor: '#ffffff',
    shadowColor: '#a5b4fc', // Sombra violeta muy sutil
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f5f7ff', // Borde muy sutil
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12, // Más separación
  },
  itemText: {
    fontSize: 16, // Ligeramente más grande
    color: '#1f2937', // Color más oscuro para mejor legibilidad
    marginLeft: 10, 
    flexShrink: 1,
    fontWeight: '600', // Más negrita
  },
  itemTextChecked: {
    fontSize: 16,
    color: '#94a3b8', // Gris más claro para items marcados
    marginLeft: 10,
    flexShrink: 1,
    textDecorationLine: 'line-through',
    fontWeight: '500',
    fontStyle: 'italic', // Añadir estilo itálico para marcar aún más
  },
  notesCard: {
    marginBottom: 0, // Espaciado consistente
    marginHorizontal: 0,
    padding: 20, // Padding más generoso
    backgroundColor: '#ffffff',
    borderRadius: 16, // Radio consistente con dashboard
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5edff', // Borde sutil que coincide con las tarjetas del dashboard
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4338ca', // Consistente con otros títulos
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  notesInput: {
    backgroundColor: '#f9faff', // Fondo sutilmente coloreado, más consistente con el dashboard
    borderWidth: 1, // Borde consistente
    borderColor: '#e0e7ff', // Color del borde coherente con el tema
    borderRadius: 10,
    padding: 16,
    minHeight: 120, // Área más grande
    textAlignVertical: 'top',
    color: '#1f2937', // Texto más oscuro para mejor lectura
    fontSize: 15,
    shadowColor: '#e0e7ff', // Sombra interior sutil
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  submitButton: {
    backgroundColor: '#4f46e5', // Color coordinado con el nuevo esquema
    padding: 18,
    borderRadius: 12, // Redondeado similar al dashboard
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 32,
    marginTop: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#a5b4fc', // Color más clarito
    opacity: 0.6,
    shadowColor: 'transparent',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5, // Pequeño espaciado para mejor legibilidad
  },
  turbineContainer: {
    flex: 1,
  },
  turbineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5edff',
  },
  turbineTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4338ca',
    marginLeft: 16,
    letterSpacing: 0.2,
  },
  turbineSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 28,
    paddingHorizontal: 16,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  turbineCard: {
    marginBottom: 28,
    borderRadius: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5edff',
    backgroundColor: '#ffffff',
    padding: 18,
  },
  photoHint: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
});
