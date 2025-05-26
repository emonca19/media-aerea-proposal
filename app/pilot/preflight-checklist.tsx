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
import { mockActivities } from "../../src/mocks/activities";
import { mockTurbines } from "../../src/mocks/turbines";
import { Activity } from "../../src/types/activities";
import { Turbine } from "../../src/types/turbines";

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

// Define PreflightChecklistRouteParams for useLocalSearchParams
interface PreflightChecklistRouteParams {
  turbineId?: string;
  activityToStart?: string;
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

const PreflightChecklistScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  const turbineIdFromRoute = Array.isArray(params.turbineId) ? params.turbineId[0] : params.turbineId;
  const activityToStartIdFromRoute = Array.isArray(params.activityToStart) ? params.activityToStart[0] : params.activityToStart;

  const [preflightChecklist, setPreflightChecklist] = useState(initialPreflightChecklist);
  const [generalNotes, setGeneralNotes] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<Category[]>([]);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  const [photoTakenCategories, setPhotoTakenCategories] = useState<Category[]>([]);
  
  const [currentActivityToStart, setCurrentActivityToStart] = useState<Activity | null>(null);
  const [currentTurbine, setCurrentTurbine] = useState<Turbine | null>(null);

  useEffect(() => {
    console.log(
      "[PreflightChecklistScreen] useEffect - Params received on load/change:",
      { turbineIdParam: turbineIdFromRoute, activityIdParam: activityToStartIdFromRoute }
    );

    let determinedActivity: Activity | null = null;
    let determinedTurbine: Turbine | null = null;

    if (activityToStartIdFromRoute) {
      const foundActivity = mockActivities.find(act => act.id === activityToStartIdFromRoute);
      if (foundActivity) {
        determinedActivity = foundActivity;
        console.log("[PreflightChecklistScreen] useEffect - Found activity from activityIdParam:", determinedActivity.id);

        if (determinedActivity.turbineId) {
          const normalizedActivityTurbineId = determinedActivity.turbineId.replace(/-/g, '_');
          const turbineForActivity = mockTurbines.find(t => t.id === normalizedActivityTurbineId);
          if (turbineForActivity) {
            determinedTurbine = turbineForActivity;
            console.log(`[PreflightChecklistScreen] useEffect - Activity '${determinedActivity.id}' turbineId '${determinedActivity.turbineId}' (norm: '${normalizedActivityTurbineId}'). Found turbine: ${determinedTurbine.id}`);
          } else {
            console.warn(`[PreflightChecklistScreen] useEffect - Turbine for activity '${determinedActivity.id}' (turbineId '${determinedActivity.turbineId}', norm: '${normalizedActivityTurbineId}') not found. Available mock turbine IDs: ${mockTurbines.map(t => t.id).join(', ')}`);
          }
        } else if (turbineIdFromRoute) { 
          const normalizedTurbineIdParam = turbineIdFromRoute.replace(/-/g, '_');
          const turbineFromParam = mockTurbines.find(t => t.id === normalizedTurbineIdParam);
          if (turbineFromParam) {
            determinedTurbine = turbineFromParam;
            console.log(`[PreflightChecklistScreen] useEffect - Activity '${determinedActivity.id}' has no turbineId. Used route turbineId '${turbineIdFromRoute}' (norm: '${normalizedTurbineIdParam}'). Found turbine: ${determinedTurbine.id}`);
          } else {
            console.warn(`[PreflightChecklistScreen] useEffect - Activity '${determinedActivity.id}' has no turbineId. Route turbineId '${turbineIdFromRoute}' (norm: '${normalizedTurbineIdParam}') not found. Available mock turbine IDs: ${mockTurbines.map(t => t.id).join(', ')}`);
          }
        } else {
          console.log(`[PreflightChecklistScreen] useEffect - Activity '${determinedActivity.id}' has no turbineId, and no fallback turbineIdFromRoute param.`);
        }
      } else { 
        console.warn(`[PreflightChecklistScreen] useEffect - Activity with id '${activityToStartIdFromRoute}' not found.`);
        if (turbineIdFromRoute) { 
          const normalizedTurbineIdParam = turbineIdFromRoute.replace(/-/g, '_');
          const turbineFromParam = mockTurbines.find(t => t.id === normalizedTurbineIdParam);
          if (turbineFromParam) {
            determinedTurbine = turbineFromParam;
            console.log(`[PreflightChecklistScreen] useEffect - Activity '${activityToStartIdFromRoute}' (not found). Used route turbineId '${turbineIdFromRoute}' (norm: '${normalizedTurbineIdParam}'). Found turbine: ${determinedTurbine.id}`);
          } else {
            console.warn(`[PreflightChecklistScreen] useEffect - Activity '${activityToStartIdFromRoute}' (not found). Route turbineId '${turbineIdFromRoute}' (norm: '${normalizedTurbineIdParam}') also not found. Available mock turbine IDs: ${mockTurbines.map(t => t.id).join(', ')}`);
          }
        }
      }
    } else if (turbineIdFromRoute) { 
      const normalizedTurbineIdParam = turbineIdFromRoute.replace(/-/g, '_');
      const turbineFromParam = mockTurbines.find(t => t.id === normalizedTurbineIdParam);
      if (turbineFromParam) {
        determinedTurbine = turbineFromParam;
        console.log(`[PreflightChecklistScreen] useEffect - No activityIdParam. Used route turbineId '${turbineIdFromRoute}' (norm: '${normalizedTurbineIdParam}'). Found turbine: ${determinedTurbine.id}`);
      } else {
        console.warn(`[PreflightChecklistScreen] useEffect - No activityIdParam. Route turbineId '${turbineIdFromRoute}' (norm: '${normalizedTurbineIdParam}') not found. Available mock turbine IDs: ${mockTurbines.map(t => t.id).join(', ')}`);
      }
    } else {
      console.warn("[PreflightChecklistScreen] useEffect - Neither activityIdParam nor turbineIdParam provided.");
    }

    setCurrentActivityToStart(determinedActivity);
    setCurrentTurbine(determinedTurbine);

  }, [turbineIdFromRoute, activityToStartIdFromRoute]);

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled) {
        console.log('ImagePicker Result URI:', result.assets ? result.assets[0].uri : 'No assets');
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
    // This function is called for the general preflight checklist.
    // The submit button (for general preflight) is disabled if not all items are checked,
    // ensuring that by the time this function is invoked, the checklist is complete.
    // Therefore, no further checks for completeness or alerts for incomplete items are needed here.
    submitChecklist();
  };

  const submitChecklist = async () => {
    // Derive activityId to start: use route param or fallback to determined activity state
    const activityIdToPass = activityToStartIdFromRoute ?? currentActivityToStart?.id;
    const turbineIdToPass = currentTurbine?.id ? currentTurbine.id.replace(/-/g, '_') : undefined;

    console.log('[PreflightChecklistScreen] submitChecklist: currentTurbine (state for nav):', currentTurbine ? currentTurbine.id : 'null');
    console.log('[PreflightChecklistScreen] submitChecklist: currentActivityToStart (state for context):', currentActivityToStart ? currentActivityToStart.id : 'null');
    console.log('[PreflightChecklistScreen] submitChecklist: resolved activityIdToPass:', activityIdToPass);
    // console.log('[PreflightChecklistScreen] submitChecklist: activityToStartIdFromRoute (original param to send back):', activityIdToPass);
    console.log('[PreflightChecklistScreen] submitChecklist: turbineIdForNav (normalized, derived from currentTurbine state):', turbineIdToPass);

    const navigationParams: Record<string, string | boolean | number | undefined> = { timestamp: Date.now() };

    if (activityIdToPass) {
      navigationParams.activityToStartAfterPreflight = activityIdToPass;
    }

    if (turbineIdToPass) {
      navigationParams.turbineIdForActivityStart = turbineIdToPass;
      navigationParams.preflightCompletedForTurbine = true;
    } else {
      navigationParams.preflightCompletedForTurbine = false;
    }

    // Ensure undefined is not passed for string params if not set, router might handle it, but explicit is better.
    if (!navigationParams.activityToStartAfterPreflight) delete navigationParams.activityToStartAfterPreflight;
    if (!navigationParams.turbineIdForActivityStart) delete navigationParams.turbineIdForActivityStart;

    // Final log for navigation params
    console.log('[PreflightChecklistScreen] FINAL NAV PARAMS:', JSON.stringify(navigationParams));

    if (Object.keys(navigationParams).length > 1 || navigationParams.preflightCompletedForTurbine) { 
        console.log(`[PreflightChecklistScreen] submitChecklist: Navigating to PilotDashboard with params:`, navigationParams);
    } else {
        console.warn("[PreflightChecklistScreen] submitChecklist: Context unclear or no specific action. Returning to dashboard generally.", navigationParams);
    }

    // Build query string manually for navigation to ensure params are passed on web
    const queryParams = new URLSearchParams();
    if (navigationParams.activityToStartAfterPreflight) {
      queryParams.append('activityToStartAfterPreflight', String(navigationParams.activityToStartAfterPreflight));
    }
    if (navigationParams.turbineIdForActivityStart) {
      queryParams.append('turbineIdForActivityStart', String(navigationParams.turbineIdForActivityStart));
      queryParams.append('preflightCompletedForTurbine', String(navigationParams.preflightCompletedForTurbine));
    }
    // Optionally include timestamp to force route change if needed
    // queryParams.append('timestamp', String(navigationParams.timestamp));
    const dashboardUrl = `/pilot/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('[PreflightChecklistScreen] submitChecklist: Navigating via URL:', dashboardUrl);
    router.push(dashboardUrl as unknown as any);
  };

  const getCompletionPercentage = (category?: Category) => {
    const items = category ? 
      preflightChecklist.filter(i => i.category === category) : 
      preflightChecklist;
    if (items.length === 0) return 100;
    const checked = items.filter(i => i.checked).length;
    return Math.round((checked / items.length) * 100);
  };

  const isGeneralPreflight = !currentTurbine;
  const allGeneralItemsChecked = preflightChecklist.every(item => item.checked);
  // Button is disabled for general preflight if not all items are checked.
  // For turbine-specific, button is always enabled (simplified flow).
  const generalSubmitButtonDisabled = isGeneralPreflight && !allGeneralItemsChecked;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: currentTurbine ? `Checklist Turbina ${currentTurbine.name}` : 'Checklist Prevuelo General',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#4338ca',
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.content}>
        {isGeneralPreflight ? (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Verificación Prevuelo General</Text>
              <Text style={styles.headerSubtitle}>
                Completa todos los checks antes de despegar.
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
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleOpenCamera(category)} 
                    style={[
                        styles.cameraIconTouchable, 
                        { backgroundColor: photoTakenCategories.includes(category) ? '#eef2ff' : 'transparent'}
                    ]}
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
              <Text style={styles.notesTitle}>Notas Adicionales (General)</Text>
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
                generalSubmitButtonDisabled && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitPreflight}
              disabled={generalSubmitButtonDisabled}
            >
              <Text style={styles.submitButtonText}>
                {generalSubmitButtonDisabled ? 
                  'Completar todos los checks' : 
                  'Confirmar Checklist General'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          // UI for Turbine-Specific Checklist
          <View style={styles.turbineContainer}>
            <View style={styles.turbineHeader}>
              <MaterialCommunityIcons name="wind-turbine" size={32} color="#4338ca" />
              <Text style={styles.turbineTitle}>Checklist para Turbina: {currentTurbine.name}</Text>
            </View>
            <Text style={styles.turbineSubtitle}>
              Verificaciones específicas para la inspección de {currentTurbine.name}.
              Este checklist es simplificado y se asume completado al continuar.
            </Text>
            
            <Card style={styles.turbineInfoCard}>
                <Text style={styles.turbineInfoText}>Turbina ID: {currentTurbine.id}</Text>
                <Text style={styles.turbineInfoText}>Parque Eólico: {currentTurbine.windParkId}</Text>
                <Text style={styles.turbineInfoText}>Próxima Inspección: {currentTurbine.nextInspection ? new Date(currentTurbine.nextInspection).toLocaleDateString() : 'N/A'}</Text>
            </Card>

            <Card style={styles.notesCard}> 
              <Text style={styles.notesTitle}>Notas para {currentTurbine.name}</Text>
              <TextInput
                style={styles.notesInput}
                multiline
                placeholder={`Notas específicas para la turbina ${currentTurbine.name}...`}
                placeholderTextColor="#9ca3af"
                value={generalNotes}
                onChangeText={setGeneralNotes}
              />
            </Card>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitChecklist} // Directly call submitChecklist for turbine-specific
            >
              <Text style={styles.submitButtonText}>Confirmar Checklist para {currentTurbine.name}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7ff',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20, 
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4338ca',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e0e7ff',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4f46e5',
  },
  progressText: {
    fontSize: 12,
    color: '#4f46e5',
    textAlign: 'right',
    marginBottom: 8,
  },
  photoHint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  categoryCard: {
    marginBottom: 16,
    padding: 0, 
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 8, 
    borderTopRightRadius: 8,
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 10,
  },
  cameraIconTouchable: {
    marginRight: 8,
    padding: 6,
    borderRadius: 20,
  },
  categoryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryPercentage: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
    marginRight: 8,
  },
  checklistItems: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
  },
  itemText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
    flexShrink: 1, 
  },
  itemTextChecked: {
    color: '#10b981', 
    textDecorationLine: 'none', 
  },
  notesCard: {
    marginTop: 8, 
    marginBottom: 20,
    padding: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10, 
  },
  submitButtonDisabled: {
    backgroundColor: '#a5b4fc', 
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  turbineContainer: {
    padding: 0, 
  },
  turbineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4, 
  },
  turbineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4338ca',
    marginLeft: 8,
  },
  turbineSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  turbineInfoCard: {
    padding: 16,
    marginBottom: 16,
  },
  turbineInfoText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 6,
  },
});

export default PreflightChecklistScreen;
