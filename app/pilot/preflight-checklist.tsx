import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { mockActivities } from "../../src/mocks/activities";
import { mockTurbines } from "../../src/mocks/turbines";
import { TurbineStatus } from "../../src/types/index";
import { setGlobalProjectData } from '../../src/utils/globalState';
import { Storage } from '../../src/utils/storage';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const CATEGORIES = ['Dron', 'Seguridad', 'Condiciones'] as const;
type Category = typeof CATEGORIES[number];
const CATEGORY_REQUIRING_ITEM_PHOTOS: Category = 'Seguridad';

interface ChecklistItem {
  id: string;
  category: Category;
  item: string;
  checked: boolean;
  notes?: string;
  photoUri?: string;
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
  'Dron': 'quadcopter',
  'Seguridad': 'shield-lock-outline',
  'Condiciones': 'weather-partly-cloudy',
};

const COLORS = {
  background: '#f8fafc',
  cardBackground: '#ffffff',
  primary: '#aa74f0',
  primaryLight: '#f3e8ff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e5e7eb',
  borderLight: '#f1f5f9',
  success: '#059669',
  successLight: '#ecfdf5',
  danger: '#ef4444',
  dangerLight: '#fef2f2',
  warning: '#f59e0b',
  warningLight: '#fffbeb',
  iconDefault: '#64748b',
  white: '#ffffff',
  modalBackdrop: 'rgba(0, 0, 0, 0.5)',
};

const getTurbineStatusColor = (status?: TurbineStatus | string): string => { /* ... */ 
  switch (status) {
    case 'OPERATIONAL': return COLORS.success;
    case 'STANDBY': return COLORS.warning;
    case 'MAINTENANCE_PLANNED': return COLORS.primary;
    case 'OFFLINE': return COLORS.danger;
    case 'READY': return COLORS.success;
    case 'ACCESSIBLE': return COLORS.primary;
    default: return COLORS.textMuted;
  }
};
const getTurbineStatusIcon = (status?: TurbineStatus | string) => { /* ... */ 
  const color = getTurbineStatusColor(status);
  switch (status) {
    case 'OPERATIONAL': return <MaterialCommunityIcons name="wind-turbine" size={22} color={color} />;
    case 'STANDBY': return <Ionicons name="pause-circle-outline" size={22} color={color} />;
    case 'MAINTENANCE_PLANNED': return <Ionicons name="build-outline" size={22} color={color} />;
    case 'OFFLINE': return <Ionicons name="power-outline" size={22} color={color} />;
    case 'READY': return <Ionicons name="checkmark-circle-outline" size={22} color={color} />;
    case 'ACCESSIBLE': return <Ionicons name="location-outline" size={22} color={color} />;
    default: return <Ionicons name="help-circle-outline" size={22} color={color} />;
  }
};

const PreflightChecklistScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  const turbineIdFromRoute = Array.isArray(params.turbineId) ? params.turbineId[0] : params.turbineId;
  const activityToStartIdFromRoute = Array.isArray(params.activityToStart) ? params.activityToStart[0] : params.activityToStart;
  
  const [preflightChecklist, setPreflightChecklist] = useState<ChecklistItem[]>(initialPreflightChecklist);
  const [generalNotes, setGeneralNotes] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<Category[]>([...CATEGORIES]);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
    
  const [currentActivityToStart, setCurrentActivityToStart] = useState<any | null>(null);
  const [currentTurbine, setCurrentTurbine] = useState<any | null>(null);
  const [isTurbineModalVisible, setIsTurbineModalVisible] = useState(false);

  useEffect(() => {
    let determinedActivity: any | null = null;
    let determinedTurbine: any | null = null;
    
    if (activityToStartIdFromRoute) {
      const foundActivity = mockActivities.find(act => act.id === activityToStartIdFromRoute);
      if (foundActivity) {
        determinedActivity = foundActivity;
        if (determinedActivity.turbineId) {
          const normalizedActivityTurbineId = determinedActivity.turbineId.replace(/-/g, '_');
          const turbineForActivity = mockTurbines.find(t => t.id === normalizedActivityTurbineId);
          if (turbineForActivity) determinedTurbine = turbineForActivity;
        } else if (turbineIdFromRoute) { 
          const normalizedTurbineIdParam = turbineIdFromRoute.replace(/-/g, '_');
          const turbineFromParam = mockTurbines.find(t => t.id === normalizedTurbineIdParam);
          if (turbineFromParam) determinedTurbine = turbineFromParam;
        }
      } else if (turbineIdFromRoute) { 
        const normalizedTurbineIdParam = turbineIdFromRoute.replace(/-/g, '_');
        const turbineFromParam = mockTurbines.find(t => t.id === normalizedTurbineIdParam);
        if (turbineFromParam) determinedTurbine = turbineFromParam;
      }
    } else if (turbineIdFromRoute) { 
      // Create mock turbine object
      determinedTurbine = {
        id: turbineIdFromRoute,
        name: `Turbina ${turbineIdFromRoute.replace(/[^0-9]/g, '')}`,
        status: 'READY'
      };
    }
    
    setCurrentActivityToStart(determinedActivity);
    setCurrentTurbine(determinedTurbine);
  }, [turbineIdFromRoute, activityToStartIdFromRoute]);
  
  // Reset checklist when turbine changes
  useEffect(() => {
    console.log("Turbine changed, resetting checklist for:", turbineIdFromRoute);
    // Reset all checklist items to unchecked
    setPreflightChecklist(initialPreflightChecklist.map(item => ({
      ...item,
      checked: false,
      notes: undefined,
      photoUri: undefined
    })));
    // Reset general notes
    setGeneralNotes('');
  }, [turbineIdFromRoute]);
  const handleToggleItem = (id: string) => {
    const item = preflightChecklist.find(item => item.id === id);
    
    // If item requires photo (Seguridad category) and doesn't have one, don't allow checking
    if (item && item.category === CATEGORY_REQUIRING_ITEM_PHOTOS && !item.photoUri && !item.checked) {
      Alert.alert(
        'Foto requerida',
        'Debes tomar una foto de este elemento antes de marcarlo como completado.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    
    setPreflightChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleOpenCameraForItem = async (itemId: string) => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara para tomar fotos.');
        return;
      }
    }
    
    if (!mediaLibraryPermission?.granted) {
      const permission = await requestMediaLibraryPermission();
      if (!permission.granted) {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para guardar fotos.');
        return;
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPreflightChecklist(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, photoUri: result.assets[0].uri } : item
          )
        );
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Inténtalo de nuevo.');
    }
  };

  const toggleCategory = (category: Category) => {
    setExpandedCategory(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };
  
  const areSeguridadPhotosComplete = () => {
    const seguridadItems = preflightChecklist.filter(item => item.category === CATEGORY_REQUIRING_ITEM_PHOTOS);
    return seguridadItems.every(item => !!item.photoUri);
  };

  const handleSubmitPreflight = () => {
    if (!areSeguridadPhotosComplete()) {
      Alert.alert(
        'Fotos requeridas',
        'Debes tomar fotos de todos los elementos de seguridad antes de continuar.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    submitChecklist();
  };

  const submitChecklist = async () => {
    const activityIdToPass = activityToStartIdFromRoute ?? currentActivityToStart?.id;
    const turbineIdToPass = currentTurbine?.id ? currentTurbine.id.replace(/-/g, '_') : undefined;
    const isNewTurbineActivity = Array.isArray(params.isNewTurbineActivity) ? 
      params.isNewTurbineActivity[0] === 'true' : 
      params.isNewTurbineActivity === 'true';
    
    console.log("Submitting checklist with params:", {
      activityIdToPass,
      turbineIdToPass,
      isNewTurbineActivity,
      currentTurbineId: currentTurbine?.id
    });
    
    const navigationParams: Record<string, string | boolean | number | undefined> = { 
      timestamp: Date.now() 
    };
    
    // Important: Use the exact parameter name expected by pilot-dashboard.tsx
    if (activityIdToPass) navigationParams.activityToStartAfterPreflight = activityIdToPass;
    
    if (turbineIdToPass) {
      navigationParams.turbineIdForActivityStart = turbineIdToPass;
      // Always mark preflight as completed when there's a turbine
      navigationParams.preflightCompletedForTurbine = "true";
    }
    
    // Indicate that it's a new turbine activity if that's the case
    if (isNewTurbineActivity) {
      navigationParams.isNewTurbineActivity = "true";
    }
      // Store the new activity in storage so turbines-status can detect it
    try {
      if (isNewTurbineActivity && activityIdToPass && turbineIdToPass) {
        const projectKey = 'pilot_dashboard_current_project';
        const stored = await Storage.getItem(projectKey);
        let project = stored ? JSON.parse(stored) : { activities: [] };
        
        // Create the new activity that will be started
        const newActivity = {
          id: activityIdToPass,
          type: "TURBINE_WORK",
          name: `Trabajo en ${currentTurbine?.name}`,
          notes: `Inspección y trabajo en ${currentTurbine?.name}`,
          status: "EN_PROGRESO",
          time: "Hoy - En curso",
          description: `Trabajo en turbina ${currentTurbine?.name}`,
          turbineId: turbineIdToPass,
          actualStart: new Date().toISOString(),
          scheduledStart: new Date().toISOString(),
          scheduledEnd: null,
          actualEnd: null,
        };
        
        // Add to activities array
        project.activities = project.activities || [];
        project.activities.unshift(newActivity);
        
        // Save back to storage
        await Storage.setItem(projectKey, JSON.stringify(project));
        console.log("Saved new turbine activity to storage:", newActivity);
        
        // Also update global data for React Native
        setGlobalProjectData(project);
      } else {
        // For React Native, create and set the activity directly
        if (isNewTurbineActivity && activityIdToPass && turbineIdToPass) {
          const newActivity = {
            id: activityIdToPass,
            type: "TURBINE_WORK",
            name: `Trabajo en ${currentTurbine?.name}`,
            notes: `Inspección y trabajo en ${currentTurbine?.name}`,
            status: "EN_PROGRESO",
            time: "Hoy - En curso",
            description: `Trabajo en turbina ${currentTurbine?.name}`,
            turbineId: turbineIdToPass,
            actualStart: new Date().toISOString(),
            scheduledStart: new Date().toISOString(),
            scheduledEnd: null,
            actualEnd: null,
          };
          
          // Update global data with new activity
          const currentGlobalData = { activities: [newActivity] };
          setGlobalProjectData(currentGlobalData);
          console.log("Set new turbine activity to global data:", newActivity);
        }
      }
    } catch (error) {
      console.error("Error saving activity:", error);
    }
    
    // Build the URL with parameters
    const queryParams = new URLSearchParams();
    Object.entries(navigationParams).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    
    const dashboardUrl = `/pilot/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log("Navigating to:", dashboardUrl);
    router.push(dashboardUrl as any);
  };
  
  const getCompletionPercentage = (category?: Category) => {
    const items = category ? preflightChecklist.filter(i => i.category === category) : preflightChecklist;
    if (items.length === 0) return 100;
    return Math.round((items.filter(i => i.checked).length / items.length) * 100);
  };

  const allGeneralItemsChecked = preflightChecklist.every(item => item.checked);

  const getCategoryStatus = (category: Category) => {
    const items = preflightChecklist.filter(i => i.category === category);
    const checkedItems = items.filter(i => i.checked).length;
    const totalItems = items.length;
    const percentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 100;
    return { checkedItems, totalItems, percentage, isComplete: percentage === 100 };
  };

  const screenTitle = currentTurbine 
    ? `Checklist ${currentTurbine.name.substring(0,10)}${currentTurbine.name.length > 10 ? '...' : ''}` 
    : 'Checklist Prevuelo';

  const seguridadPhotosTakenCount = preflightChecklist.filter(item => item.category === CATEGORY_REQUIRING_ITEM_PHOTOS && !!item.photoUri).length;
  const totalSeguridadItems = preflightChecklist.filter(item => item.category === CATEGORY_REQUIRING_ITEM_PHOTOS).length;
  
  // Photos only from "Seguridad" items
  const seguridadItemPhotos = preflightChecklist
    .filter(item => item.category === CATEGORY_REQUIRING_ITEM_PHOTOS && item.photoUri)
    .map(item => ({id: item.id, uri: item.photoUri!, itemName: item.item }));

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ 
        title: screenTitle, 
        headerStyle: { backgroundColor: COLORS.cardBackground }, 
        headerTintColor: COLORS.primary, 
        headerTitleStyle: { fontWeight: '600', fontSize: 17, color: COLORS.textPrimary }, 
        headerShadowVisible: false, 
        headerBackTitleVisible: false,
      }}/>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
        {/* Context info card */}
        {currentTurbine && (
          <View style={styles.contextualInfoCard}>
            <View style={styles.contextualInfoRow}>
              <Ionicons name="nuclear" size={18} color={COLORS.primary} style={styles.contextualInfoIcon} />
              <Text style={styles.contextualInfoLabel}>Turbina:</Text>
              <Text style={styles.contextualInfoValue}>{currentTurbine.name}</Text>
            </View>
          </View>
        )}

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconWrapper}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.summaryTitle}>Checklist Prevuelo</Text>
          </View>
          
          <Text style={styles.summarySubtitle}>
            Completa todos los elementos antes de iniciar el vuelo
          </Text>

          <View style={styles.overallProgressRow}>
            <Text style={styles.overallProgressLabel}>Progreso General</Text>
            <Text style={styles.overallProgressPercentage}>{getCompletionPercentage()}%</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${getCompletionPercentage()}%` }]} />
          </View>

          <View style={styles.summaryBadgesContainer}>
            <View style={[styles.summaryBadge, styles.summaryBadgeWarning]}>
              <Ionicons name="camera" size={12} color={COLORS.warning} />
              <Text style={styles.summaryBadgeText}>
                {seguridadPhotosTakenCount}/{totalSeguridadItems} Fotos
              </Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        {CATEGORIES.map(category => {
          const categoryStatus = getCategoryStatus(category);
          const isExpanded = expandedCategory.includes(category);
          const categoryItems = preflightChecklist.filter(item => item.category === category);
          const categoryPhotos = categoryItems.filter(item => !!item.photoUri);
          
          return (
            <View key={category} style={styles.categoryCard}>
              <TouchableOpacity style={styles.categoryHeader} onPress={() => toggleCategory(category)}>
                <View style={styles.categoryTitleSection}>
                  <View style={[
                    styles.categoryIconWrapper,
                    { 
                      backgroundColor: categoryStatus.isComplete ? COLORS.successLight : COLORS.primaryLight,
                      borderColor: categoryStatus.isComplete ? COLORS.success : COLORS.primary,
                    }
                  ]}>
                    <MaterialCommunityIcons 
                      name={categoryIcons[category]} 
                      size={20} 
                      color={categoryStatus.isComplete ? COLORS.success : COLORS.primary} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.categoryTitle}>{category}</Text>
                      {category === CATEGORY_REQUIRING_ITEM_PHOTOS && (
                        <Text style={styles.requiredAsterisk}> *</Text>
                      )}
                    </View>
                    <Text style={styles.categorySubtitle}>
                      {categoryStatus.checkedItems}/{categoryStatus.totalItems} completados
                    </Text>
                  </View>
                </View>
                
                <View style={styles.categoryActions}>
                  <View style={[
                    styles.categoryPercentageBadge,
                    categoryStatus.isComplete && styles.summaryBadgeSuccess
                  ]}>
                    <Text style={[
                      styles.categoryPercentageText,
                      categoryStatus.isComplete && { color: COLORS.success }
                    ]}>
                      {categoryStatus.percentage}%
                    </Text>
                  </View>
                  
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={COLORS.textSecondary} 
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <>
                  <View style={styles.checklistItemsContainer}>
                    {categoryItems.map((item, index) => (
                      <View 
                        key={item.id} 
                        style={[
                          styles.checklistItem,
                          index === categoryItems.length - 1 && styles.checklistItemLast
                        ]}
                      >
                        <View style={styles.checklistItemMain}>
                          <View style={[
                            styles.itemStatusIconWrapper,
                            { backgroundColor: item.checked ? COLORS.successLight : COLORS.borderLight }
                          ]}>
                            <Ionicons 
                              name={item.checked ? "checkmark" : "ellipse-outline"} 
                              size={16} 
                              color={item.checked ? COLORS.success : COLORS.textMuted} 
                            />
                          </View>
                          <Text style={[
                            styles.itemText,
                            item.checked && styles.itemTextChecked
                          ]}>
                            {item.item}
                          </Text>
                        </View>
                        
                        <View style={styles.itemActionsContainer}>
                          {item.category === CATEGORY_REQUIRING_ITEM_PHOTOS && (
                            <TouchableOpacity 
                              style={styles.itemActionButton}
                              onPress={() => handleOpenCameraForItem(item.id)}
                            >
                              <Ionicons 
                                name={item.photoUri ? "camera" : "camera-outline"} 
                                size={18} 
                                color={item.photoUri ? COLORS.success : COLORS.textSecondary} 
                              />
                            </TouchableOpacity>
                          )}
                          
                          <Switch
                            style={styles.itemSwitch}
                            value={item.checked}
                            onValueChange={() => handleToggleItem(item.id)}
                            trackColor={{ false: COLORS.borderLight, true: COLORS.successLight }}
                            thumbColor={item.checked ? COLORS.success : COLORS.textMuted}
                          />
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Category gallery for photos */}
                  {category === CATEGORY_REQUIRING_ITEM_PHOTOS && categoryPhotos.length > 0 && (
                    <View style={styles.categoryGalleryContainer}>
                      <Text style={styles.galleryTitle}>Fotos tomadas ({categoryPhotos.length})</Text>
                      <FlatList
                        data={categoryPhotos}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.galleryListContent}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                          <Image source={{ uri: item.photoUri! }} style={styles.galleryThumbnail} />
                        )}
                      />
                    </View>
                  )}
                </>
              )}
            </View>
          );
        })}

        {/* Notes Section */}
        <View style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <Ionicons name="document-text" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
            <Text style={styles.notesTitle}>Notas Adicionales</Text>
          </View>
          <TextInput
            style={styles.notesInput}
            placeholder="Agregar observaciones o comentarios..."
            value={generalNotes}
            onChangeText={setGeneralNotes}
            multiline
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!allGeneralItemsChecked || !areSeguridadPhotosComplete()) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitPreflight}
          disabled={!allGeneralItemsChecked || !areSeguridadPhotosComplete()}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color={COLORS.white} 
          />
          <Text style={styles.submitButtonText}>Completar Checklist</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (Most styles remain the same) ...
  screenContainer: { flex: 1, backgroundColor: COLORS.background, },
  scrollContainer: { flex: 1, },
  scrollContentContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, },
  contextualInfoCard: { backgroundColor: COLORS.cardBackground, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1, },
  contextualInfoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, },
  contextualInfoIcon: { marginRight: 10, width: 18, textAlign: 'center', },
  contextualInfoLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500', marginRight: 6, },
  contextualInfoValue: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '500', flexShrink: 1, },
  summaryCard: { backgroundColor: COLORS.cardBackground, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1, },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, },
  summaryIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1.5, borderColor: COLORS.primary, },
  summaryTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, },
  summarySubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16, lineHeight: 18, paddingLeft: 52, },
  overallProgressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, paddingHorizontal: 4, },
  overallProgressLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary, },
  overallProgressPercentage: { fontSize: 14, fontWeight: '700', color: COLORS.primary, },
  progressBarContainer: { height: 8, backgroundColor: COLORS.borderLight, borderRadius: 4, overflow: 'hidden', marginHorizontal: 4, marginBottom: 12, },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4, },
  summaryBadgesContainer: { flexDirection: 'row', gap: 10, marginTop: 8, paddingLeft: 4, flexWrap: 'wrap', },
  summaryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.borderLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border, gap: 6, },
  summaryBadgeSuccess: { backgroundColor: COLORS.successLight, borderColor: COLORS.success, },
  summaryBadgeWarning: { backgroundColor: COLORS.warningLight, borderColor: COLORS.warning, },
  summaryBadgeDanger: { backgroundColor: COLORS.dangerLight, borderColor: COLORS.danger, },
  summaryBadgeText: { fontSize: 11, fontWeight: '500', color: COLORS.textSecondary, },
  
  // Gallery Styles (now inside category)
  categoryGalleryContainer: { // New container for gallery inside category
    marginTop: 12, // Space above the gallery within the category
    paddingHorizontal: 0, // Gallery itself might have padding for items
    paddingBottom: 8, // Space below gallery
  },
  galleryTitle: { // Can be reused for category gallery title
    fontSize: 14, // Slightly smaller for in-category gallery
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
    paddingLeft: 4, // Align with item content
  },
  galleryListContent: {
    paddingLeft: 4, // Start thumbnails slightly indented
    paddingVertical: 4,
  },
  galleryThumbnail: {
    width: 65, // Slightly smaller thumbnails for in-category
    height: 65,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.borderLight,
  },

  categoryCard: { backgroundColor: COLORS.cardBackground, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1, overflow: 'hidden', },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, },
  categoryTitleSection: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8, },
  categoryIconWrapper: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1.5, },
  categoryTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, },
  requiredAsterisk: { color: COLORS.danger, fontSize: 16, fontWeight: 'bold', },
  categorySubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1, },
  categoryActions: { flexDirection: 'row', alignItems: 'center', gap: 12, }, // Increased gap slightly
  categoryPercentageBadge: { backgroundColor: COLORS.borderLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, },
  categoryPercentageText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, },
  
  checklistItemsContainer: {
    // No top padding needed if checklistItem has borderTop
  },
  checklistItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: COLORS.borderLight, },
  checklistItemLast: { 
    // No specific style, last item in the list
  },
  checklistItemMain: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10, },
  itemStatusIconWrapper: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 10, },
  itemText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 18, flexShrink: 1, },
  itemTextChecked: { color: COLORS.textSecondary, textDecorationLine: Platform.OS === 'ios' ? 'none' : 'line-through', opacity: 0.7, },
  
  itemActionsContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, }, // Increased gap for clarity
  itemActionButton: { padding: 6, borderRadius: 18, }, // Simple touchable area for camera
  itemSwitch: { transform: Platform.OS === 'ios' ? [{ scaleX: 0.85 }, { scaleY: 0.85 }] : [], },
  
  notesCard: { backgroundColor: COLORS.cardBackground, borderRadius: 10, padding: 14, marginTop: 0, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1, },
  notesHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, },
  notesTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, },
  notesInput: { minHeight: 80, textAlignVertical: 'top', backgroundColor: COLORS.borderLight, padding: 10, fontSize: 13, color: COLORS.textPrimary, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, lineHeight: 18, },
  
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2, gap: 8, },
  submitButtonDisabled: { backgroundColor: COLORS.textMuted, shadowOpacity: 0.1, elevation: 1, },
  submitButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '600', },
  
  modalOverlay: { flex: 1, backgroundColor: COLORS.modalBackdrop, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, },
  modalContentContainer: { backgroundColor: COLORS.cardBackground, borderRadius: 12, padding: 20, width: '100%', maxHeight: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5, },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, },
  modalTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginLeft: 10, flexShrink: 1, },
  modalCloseButton: { padding: 4, },
  modalStatusBadge: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15, alignSelf: 'flex-start', marginBottom: 16, },
  modalStatusText: { fontSize: 13, fontWeight: '600', color: COLORS.white, textTransform: 'capitalize', },
  modalSection: { marginBottom: 16, },
  modalSectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, },
  modalDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 5, },
  modalDetailLabel: { fontSize: 14, color: COLORS.textSecondary, marginRight: 10, fontWeight: '500', },
  modalDetailValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500', textAlign: 'right', flexShrink: 1, },
});

export default PreflightChecklistScreen;