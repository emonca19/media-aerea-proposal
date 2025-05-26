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
  const activityToStartIdFromRoute = Array.isArray(params.activityToStart) ? params.activityToStart[0] : params.activityToStart;  const [preflightChecklist, setPreflightChecklist] = useState(initialPreflightChecklist);
  const [generalNotes, setGeneralNotes] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<Category[]>([...CATEGORIES]); // Todas expandidas por defecto
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
    setPreflightChecklist(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      
      // Auto-expand category when first item is checked
      const toggledItem = updated.find(item => item.id === id);
      if (toggledItem && toggledItem.checked && !expandedCategory.includes(toggledItem.category)) {
        setExpandedCategory(prevExpanded => [...prevExpanded, toggledItem.category]);
      }
      
      return updated;
    });
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

  // Get checklist status for each category
  const getCategoryStatus = (category: Category) => {
    const items = preflightChecklist.filter(i => i.category === category);
    const checkedItems = items.filter(i => i.checked).length;
    const totalItems = items.length;
    const percentage = Math.round((checkedItems / totalItems) * 100);
    return {
      checkedItems,
      totalItems,
      percentage,
      isComplete: percentage === 100
    };
  };

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
        {/* Si hay turbina, mostrar la tarjeta de información arriba */}
        {currentTurbine && (
          <Card style={styles.turbineInfoCard}>
            <View style={styles.turbineInfoHeader}>
              <View style={styles.turbineInfoIconContainer}>
                <MaterialCommunityIcons name="information" size={20} color="#4f46e5" />
              </View>
              <Text style={styles.turbineInfoHeaderTitle}>Información de la Turbina</Text>
            </View>
            <View style={styles.turbineInfoContent}>
              <View style={styles.turbineInfoRow}>
                <View style={styles.turbineInfoItem}>
                  <Text style={styles.turbineInfoLabel}>ID Turbina</Text>
                  <Text style={styles.turbineInfoValue}>{currentTurbine.id}</Text>
                </View>
              </View>
              <View style={styles.turbineInfoRow}>
                <View style={styles.turbineInfoItem}>
                  <Text style={styles.turbineInfoLabel}>Parque Eólico</Text>
                  <Text style={styles.turbineInfoValue}>{currentTurbine.windParkId}</Text>
                </View>
              </View>
              <View style={styles.turbineInfoRow}>
                <View style={styles.turbineInfoItem}>
                  <Text style={styles.turbineInfoLabel}>Próxima Inspección</Text>
                  <Text style={styles.turbineInfoValue}>
                    {currentTurbine.nextInspection ? new Date(currentTurbine.nextInspection).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}        {/* Header y progreso del checklist */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="clipboard-check" size={32} color="#3b82f6" />
          </View>
          <Text style={styles.headerTitle}>{currentTurbine ? 'Checklist Prevuelo de Turbina' : 'Verificación Prevuelo General'}</Text>
          <Text style={styles.headerSubtitle}>
            {currentTurbine ? `Completa todos los checks antes de inspeccionar la turbina ${currentTurbine.name}.` : 'Completa todos los checks antes de despegar con seguridad.'}
          </Text>

          {/* Progress Section with enhanced styling */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Progreso del Checklist</Text>
              <Text style={[
                styles.progressPercentage,
                allGeneralItemsChecked && styles.progressPercentageComplete
              ]}>
                {allGeneralItemsChecked ? "✓ 100%" : `${getCompletionPercentage()}%`}
              </Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={[
                styles.progressBar,
                { width: `${getCompletionPercentage()}%` },
                allGeneralItemsChecked && styles.progressBarComplete
              ]} />
              {allGeneralItemsChecked && <View style={styles.progressGlowComplete} />}
              <View style={styles.progressGlow} />
            </View>
            {/* Status badges */}
            <View style={styles.statusBadges}>
              <View style={[styles.statusBadge, allGeneralItemsChecked ? styles.statusBadgeComplete : styles.statusBadgeIncomplete]}>
                <MaterialCommunityIcons
                  name={allGeneralItemsChecked ? "check-circle" : "clock-outline"}
                  size={16}
                  color={allGeneralItemsChecked ? "#22c55e" : "#f59e0b"}
                />
                <Text style={[styles.statusBadgeText, allGeneralItemsChecked ? styles.statusBadgeTextComplete : styles.statusBadgeTextIncomplete]}>
                  {allGeneralItemsChecked ? "✅ ¡Listo para volar!" : "⏳ Completando checklist"}
                </Text>
              </View>
              {photoTakenCategories.length > 0 && (
                <View style={styles.statusBadge}>
                  <MaterialCommunityIcons name="camera" size={16} color="#6366f1" />
                  <Text style={styles.statusBadgeText}>
                    📸 {photoTakenCategories.length}/{CATEGORIES.length} fotos tomadas
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Checklist por categorías */}
        {CATEGORIES.map(category => {
          const categoryStatus = getCategoryStatus(category);
          return (
            <Card key={category} style={styles.categoryCard}>
              <TouchableOpacity
                style={[
                  styles.categoryHeader,
                  categoryStatus.isComplete && styles.categoryHeaderComplete
                ]}
                onPress={() => toggleCategory(category)}
              >
                <View style={styles.categoryTitleContainer}>
                  <View style={[
                    styles.categoryIconContainer,
                    categoryStatus.isComplete ? styles.categoryIconContainerComplete : styles.categoryIconContainerIncomplete
                  ]}>
                    <MaterialCommunityIcons
                      name={categoryIcons[category]}
                      size={24}
                      color={categoryStatus.isComplete ? "#22c55e" : "#4f46e5"}
                    />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={[
                      styles.categoryTitle,
                      categoryStatus.isComplete && styles.categoryTitleComplete
                    ]}>
                      {category}
                    </Text>
                    <Text style={styles.categoryProgress}>
                      {categoryStatus.checkedItems}/{categoryStatus.totalItems} completado
                    </Text>
                  </View>
                </View>
                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleOpenCamera(category);
                    }}
                    style={[
                      styles.cameraIconTouchable,
                      photoTakenCategories.includes(category) && styles.cameraIconTouchableActive
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="camera"
                      size={20}
                      color={photoTakenCategories.includes(category) ? "#4f46e5" : "#9ca3af"}
                    />
                    {photoTakenCategories.includes(category) && (
                      <View style={styles.photoIndicator}>
                        <MaterialCommunityIcons name="check" size={12} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={styles.categoryStatus}>
                    <View style={[
                      styles.percentageCircle,
                      categoryStatus.isComplete ? styles.percentageCircleComplete : styles.percentageCircleIncomplete
                    ]}>
                      <Text style={[
                        styles.categoryPercentage,
                        categoryStatus.isComplete && styles.categoryPercentageComplete
                      ]}>
                        {categoryStatus.percentage}%
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={expandedCategory.includes(category) ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#6b7280"
                    />
                  </View>
                </View>
              </TouchableOpacity>
              {expandedCategory.includes(category) && (
                <View style={styles.checklistItems}>
                  {preflightChecklist
                    .filter(item => item.category === category)
                    .map((item, index) => (
                      <View key={item.id} style={[
                        styles.checklistItem,
                        index === preflightChecklist.filter(i => i.category === category).length - 1 && styles.checklistItemLast
                      ]}>
                        <View style={styles.itemContent}>
                          <View style={[
                            styles.checkIcon,
                            item.checked ? styles.checkIconChecked : styles.checkIconUnchecked
                          ]}>
                            {item.checked ? (
                              <TickCircle size={20} color="#22c55e" variant="Bold" />
                            ) : (
                              <CloseCircle size={20} color="#ef4444" variant="Bold" />
                            )}
                          </View>
                          <Text style={[
                            styles.itemText,
                            item.checked && styles.itemTextChecked
                          ]}>
                            {item.item}
                          </Text>
                        </View>
                        <View style={styles.switchContainer}>
                          <Switch
                            value={item.checked}
                            onValueChange={() => handleToggleItem(item.id)}
                            trackColor={{ false: '#e5e7eb', true: '#dcfce7' }}
                            thumbColor={item.checked ? '#22c55e' : '#f9fafb'}
                            ios_backgroundColor="#e5e7eb"
                          />
                        </View>
                      </View>
                    ))}
                </View>
              )}
            </Card>
          );
        })}
        {/* Notas */}
        <Card style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <MaterialCommunityIcons name="note-text" size={20} color="#4f46e5" />
            <Text style={styles.notesTitle}>{currentTurbine ? `Notas para ${currentTurbine.name}` : 'Notas Adicionales (General)'}</Text>
          </View>
          <View style={styles.notesInputContainer}>
            <TextInput
              style={styles.notesInput}
              multiline
              placeholder={currentTurbine ? `Notas específicas para la turbina ${currentTurbine.name}...` : 'Agregar notas o comentarios relevantes...'}
              placeholderTextColor="#9ca3af"
              value={generalNotes}
              onChangeText={setGeneralNotes}
            />
          </View>
        </Card>
        {/* Botón de submit */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!allGeneralItemsChecked) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitPreflight}
          disabled={!allGeneralItemsChecked}
        >
          <View style={styles.submitButtonContent}>
            <MaterialCommunityIcons
              name={!allGeneralItemsChecked ? "clock-outline" : "check-circle"}
              size={20}
              color="#ffffff"
            />
            <Text style={styles.submitButtonText}>
              {!allGeneralItemsChecked ?
                (currentTurbine ? 'Completar todos los checks' : 'Completar todos los checks') :
                (currentTurbine ? `Confirmar Checklist para ${currentTurbine.name}` : 'Confirmar Checklist General')
              }
            </Text>
          </View>
          {allGeneralItemsChecked && (
            <View style={styles.submitButtonGlow} />
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },  header: {
    marginBottom: 20,
    marginTop: 12,
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },  headerIconContainer: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    backgroundColor: '#eff6ff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#dbeafe',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: 0.5,
  },  headerSubtitle: {
    fontSize: 17,
    color: '#6b7280',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },  progressSection: {
    marginTop: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3b82f6',
  },
  progressPercentageComplete: {
    color: '#10b981',
  },  progressContainer: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#d1d5db',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    position: 'relative',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 10,
  },
  progressBarComplete: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  progressGlowComplete: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 10,
  },  statusBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  statusBadgeComplete: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    shadowColor: '#22c55e',
    shadowOpacity: 0.15,
  },
  statusBadgeIncomplete: {
    backgroundColor: '#fffbeb',
    borderColor: '#fed7aa',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.15,
  },  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusBadgeTextComplete: {
    color: '#166534',
  },
  statusBadgeTextIncomplete: {
    color: '#b45309',
  },  categoryCard: {
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  categoryCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  categoryCardContent: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoryHeaderComplete: {
    backgroundColor: '#f0fdf4',
    borderBottomColor: '#bbf7d0',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },  categoryIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 2,
    borderColor: '#dbeafe',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryIconContainerComplete: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    shadowColor: '#22c55e',
    shadowOpacity: 0.15,
  },
  categoryIconContainerIncomplete: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.12,
  },categoryInfo: {
    flex: 1,
  },  categoryTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryTitleComplete: {
    color: '#166534',
  },  categoryProgress: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },  cameraIconTouchable: {
    padding: 12,
    borderRadius: 26,
    backgroundColor: '#f8fafc',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cameraIconTouchableActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.15,
  },  photoIndicator: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },  percentageCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  percentageCircleComplete: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    shadowColor: '#22c55e',
    shadowOpacity: 0.15,
  },
  percentageCircleIncomplete: {
    backgroundColor: '#fffbeb',
    borderColor: '#fed7aa',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.15,
  },  categoryPercentage: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '700',
  },
  categoryPercentageComplete: {
    color: '#166534',
  },  checklistItems: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginVertical: 3,
  },
  checklistItemLast: {
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
  },  checkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  checkIconChecked: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  checkIconUnchecked: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },  itemText: {
    fontSize: 17,
    color: '#374151',
    flexShrink: 1,
    lineHeight: 24,
    fontWeight: '500',
  },
  itemTextChecked: {
    color: '#166534',
    fontWeight: '600',
  },
  switchContainer: {
    marginLeft: 16,
    padding: 4,
  },  notesCard: {
    marginTop: 12, 
    marginBottom: 24,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },  notesInputContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  notesInput: {
    minHeight: 130,
    textAlignVertical: 'top',
    backgroundColor: 'transparent',
    padding: 20,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontWeight: '400',
  },  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 22,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
  },  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowColor: '#6b7280',
    shadowOpacity: 0.2,
    borderColor: '#d1d5db',
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },  submitButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
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
  },  turbineInfoCard: {
    padding: 0,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },  turbineInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 14,
  },  turbineInfoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  turbineInfoHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
  },
  turbineInfoContent: {
    padding: 24,
    backgroundColor: '#ffffff',
  },  turbineInfoRow: {
    marginBottom: 18,
    paddingVertical: 6,
  },
  turbineInfoItem: {
    flex: 1,
  },
  turbineInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  turbineInfoValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
  },
  turbineInfoText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 6,
  },
});

export default PreflightChecklistScreen;
