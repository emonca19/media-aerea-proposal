import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CloseCircle, TickCircle } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  FlatList,
} from 'react-native';
import { mockActivities } from "../../src/mocks/activities";
import { mockTurbines } from "../../src/mocks/turbines";
import { Activity } from "../../src/types/activities";
import { Turbine, TurbineStatus } from "../../src/types/turbines";

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
  // ... (initialPreflightChecklist data remains the same)
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

const COLORS = { /* ... (COLORS object remains the same) ... */
  background: '#f8fafc',
  cardBackground: '#ffffff',
  primary: '#2563eb',
  primaryLight: '#eff6ff',
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
    
  const [currentActivityToStart, setCurrentActivityToStart] = useState<Activity | null>(null);
  const [currentTurbine, setCurrentTurbine] = useState<Turbine | null>(null);
  const [isTurbineModalVisible, setIsTurbineModalVisible] = useState(false);

  useEffect(() => { /* ... (useEffect logic remains the same) ... */ 
    let determinedActivity: Activity | null = null;
    let determinedTurbine: Turbine | null = null;
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
      const normalizedTurbineIdParam = turbineIdFromRoute.replace(/-/g, '_');
      const turbineFromParam = mockTurbines.find(t => t.id === normalizedTurbineIdParam);
      if (turbineFromParam) determinedTurbine = turbineFromParam;
    }
    setCurrentActivityToStart(determinedActivity);
    setCurrentTurbine(determinedTurbine);
  }, [turbineIdFromRoute, activityToStartIdFromRoute]);
  
  const handleToggleItem = (id: string) => { /* ... (handleToggleItem logic remains the same) ... */ 
    setPreflightChecklist(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      const toggledItem = updated.find(item => item.id === id);
      if (toggledItem && toggledItem.checked && !expandedCategory.includes(toggledItem.category)) {
        setExpandedCategory(prevExpanded => [...prevExpanded, toggledItem.category]);
      }
      return updated;
    });
  };

  const handleOpenCameraForItem = async (itemId: string) => {
    if (!cameraPermission?.granted) {
      const camPerm = await requestCameraPermission();
      if (!camPerm.granted) { Alert.alert('Permiso Denegado', 'Se requiere permiso de cámara.'); return; }
    }
    if (!mediaLibraryPermission?.granted) {
      const libPerm = await requestMediaLibraryPermission();
      if (!libPerm.granted) { Alert.alert('Permiso Denegado', 'Se requiere permiso de la galería.'); return; }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({ 
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: false, 
        quality: 0.8 
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setPreflightChecklist(prev => 
          prev.map(item => item.id === itemId ? { ...item, photoUri: uri } : item)
        );
      }
    } catch (error) { console.error('Error opening camera:', error); Alert.alert('Error', 'No se pudo abrir la cámara.'); }
  };

  const toggleCategory = (category: Category) => { setExpandedCategory(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);};
  
  const areSeguridadPhotosComplete = () => {
    const seguridadItems = preflightChecklist.filter(item => item.category === CATEGORY_REQUIRING_ITEM_PHOTOS);
    return seguridadItems.every(item => !!item.photoUri);
  };

  const handleSubmitPreflight = () => {
    if (!areSeguridadPhotosComplete()) {
      Alert.alert(
        'Fotos Requeridas',
        `Es obligatorio tomar una foto para cada ítem de la categoría "${CATEGORY_REQUIRING_ITEM_PHOTOS}" antes de continuar.`,
        [{ text: 'Entendido' }]
      );
      if (!expandedCategory.includes(CATEGORY_REQUIRING_ITEM_PHOTOS)) {
        toggleCategory(CATEGORY_REQUIRING_ITEM_PHOTOS);
      }
      return;
    }
    submitChecklist();
  };

  const submitChecklist = async () => { /* ... (submitChecklist navigation logic remains the same) ... */ 
    const activityIdToPass = activityToStartIdFromRoute ?? currentActivityToStart?.id;
    const turbineIdToPass = currentTurbine?.id ? currentTurbine.id.replace(/-/g, '_') : undefined;
    const navigationParams: Record<string, string | boolean | number | undefined> = { timestamp: Date.now() };
    if (activityIdToPass) navigationParams.activityToStartAfterPreflight = activityIdToPass;
    if (turbineIdToPass) {
      navigationParams.turbineIdForActivityStart = turbineIdToPass;
      navigationParams.preflightCompletedForTurbine = true;
    } else {
      navigationParams.preflightCompletedForTurbine = false;
    }
    if (!navigationParams.activityToStartAfterPreflight) delete navigationParams.activityToStartAfterPreflight;
    if (!navigationParams.turbineIdForActivityStart) delete navigationParams.turbineIdForActivityStart;
    const queryParams = new URLSearchParams();
    if (navigationParams.activityToStartAfterPreflight) queryParams.append('activityToStartAfterPreflight', String(navigationParams.activityToStartAfterPreflight));
    if (navigationParams.turbineIdForActivityStart) queryParams.append('turbineIdForActivityStart', String(navigationParams.turbineIdForActivityStart));
    if (typeof navigationParams.preflightCompletedForTurbine === 'boolean') queryParams.append('preflightCompletedForTurbine', String(navigationParams.preflightCompletedForTurbine));
    const dashboardUrl = `/pilot/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    router.push(dashboardUrl as any);
  };
  
  const getCompletionPercentage = (category?: Category) => { /* ... */ 
    const items = category ? preflightChecklist.filter(i => i.category === category) : preflightChecklist;
    if (items.length === 0) return 100;
    return Math.round((items.filter(i => i.checked).length / items.length) * 100);
  };

  const allGeneralItemsChecked = preflightChecklist.every(item => item.checked);

  const getCategoryStatus = (category: Category) => { /* ... */ 
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
    .map(item => ({id: item.id, uri: item.photoUri!, itemName: item.item })); // Added itemName for context if needed

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ /* ... */ title: screenTitle, headerStyle: { backgroundColor: COLORS.cardBackground }, headerTintColor: COLORS.primary, headerTitleStyle: { fontWeight: '600', fontSize: 17, color: COLORS.textPrimary }, headerShadowVisible: false, headerBackTitleVisible: false,}}/>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
        
        {currentTurbine && ( /* ... (Turbine ContextualInfoCard JSX) ... */ 
           <TouchableOpacity 
            style={styles.contextualInfoCard}
            onPress={() => setIsTurbineModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.contextualInfoRow}>
              <MaterialCommunityIcons name="wind-turbine" size={18} color={COLORS.textSecondary} style={styles.contextualInfoIcon} />
              <Text style={styles.contextualInfoLabel}>Turbina:</Text>
              <Text style={styles.contextualInfoValue}>{currentTurbine.name}</Text>
              <Ionicons name="chevron-forward-outline" size={18} color={COLORS.textMuted} style={{marginLeft: 'auto'}}/>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.summaryCard}>
          {/* ... (Summary Card content updated for Seguridad photo count) ... */}
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconWrapper}>
              <MaterialCommunityIcons name="clipboard-check-multiple-outline" size={26} color={COLORS.primary} />
            </View>
            <Text style={styles.summaryTitle}>
              {currentTurbine ? 'Revisión de Turbina' : 'Verificación General'}
            </Text>
          </View>
          <Text style={styles.summarySubtitle}>
            {allGeneralItemsChecked && areSeguridadPhotosComplete()
              ? "Todos los puntos verificados. ¡Listo para proceder!" 
              : "Completa todos los puntos y fotos requeridas."}
          </Text>

          <View style={styles.overallProgressRow}>
            <Text style={styles.overallProgressLabel}>Progreso Total</Text>
            <Text style={[styles.overallProgressPercentage, allGeneralItemsChecked && { color: COLORS.success } ]}>
              {getCompletionPercentage()}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[ styles.progressBarFill, { width: `${getCompletionPercentage()}%` }, allGeneralItemsChecked && { backgroundColor: COLORS.success }]} />
          </View>
          
          <View style={styles.summaryBadgesContainer}>
            <View style={[styles.summaryBadge, allGeneralItemsChecked ? styles.summaryBadgeSuccess : styles.summaryBadgeWarning]}>
                <MaterialCommunityIcons name={allGeneralItemsChecked ? "shield-check-outline" : "progress-alert"} size={14} color={allGeneralItemsChecked ? COLORS.success : COLORS.warning} />
                <Text style={[styles.summaryBadgeText, allGeneralItemsChecked ? {color: COLORS.success} : {color: COLORS.warning}]}>
                    {allGeneralItemsChecked ? "Checks Completos" : "Checks Pendientes"}
                </Text>
            </View>
            <View style={[styles.summaryBadge, areSeguridadPhotosComplete() ? styles.summaryBadgeSuccess : styles.summaryBadgeDanger]}>
                <MaterialCommunityIcons name={areSeguridadPhotosComplete() ? "camera-check-outline" : "camera-off-outline"} size={14} color={areSeguridadPhotosComplete() ? COLORS.success : COLORS.danger} />
                <Text style={[styles.summaryBadgeText, areSeguridadPhotosComplete() ? {color: COLORS.success} : {color: COLORS.danger}]}>
                    Seguridad: {seguridadPhotosTakenCount}/{totalSeguridadItems} fotos
                </Text>
            </View>
          </View>
        </View>

        {CATEGORIES.map(category => {
          const categoryStatus = getCategoryStatus(category);
          const isExpanded = expandedCategory.includes(category);
          const isSeguridad = category === CATEGORY_REQUIRING_ITEM_PHOTOS;
          
          const currentCategorySeguridadPhotos = isSeguridad ? 
            preflightChecklist
              .filter(item => item.category === CATEGORY_REQUIRING_ITEM_PHOTOS && item.photoUri)
              .map(item => ({id: item.id, uri: item.photoUri!, itemName: item.item }))
            : [];


          return (
            <View key={category} style={styles.categoryCard}>
              <TouchableOpacity style={styles.categoryHeader} onPress={() => toggleCategory(category)} activeOpacity={0.7}>
                <View style={styles.categoryTitleSection}>
                  <View style={[ styles.categoryIconWrapper, categoryStatus.isComplete ? {backgroundColor: COLORS.successLight, borderColor: COLORS.success} : {backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary} ]}>
                    <MaterialCommunityIcons name={categoryIcons[category]} size={22} color={categoryStatus.isComplete ? COLORS.success : COLORS.primary} />
                  </View>
                  <View>
                    <Text style={[ styles.categoryTitle, categoryStatus.isComplete && {color: COLORS.success} ]}>
                      {category}
                      {isSeguridad && <Text style={styles.requiredAsterisk}> *</Text>}
                    </Text>
                    <Text style={styles.categorySubtitle}>
                      {categoryStatus.checkedItems} de {categoryStatus.totalItems} verificados
                      {isSeguridad && `, ${currentCategorySeguridadPhotos.length} fotos`}
                    </Text>
                  </View>
                </View>
                <View style={styles.categoryActions}>
                  {/* No camera button at category header level now */}
                  <View style={[ styles.categoryPercentageBadge, categoryStatus.isComplete ? {backgroundColor: COLORS.successLight} : {backgroundColor: COLORS.primaryLight} ]}>
                      <Text style={[ styles.categoryPercentageText, categoryStatus.isComplete ? {color: COLORS.success} : {color: COLORS.primary} ]}>
                          {categoryStatus.percentage}%
                      </Text>
                  </View>
                  <MaterialCommunityIcons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={COLORS.iconDefault} />
                </View>
              </TouchableOpacity>
              {isExpanded && (
                <View style={styles.checklistItemsContainer}>
                  {preflightChecklist
                    .filter(item => item.category === category)
                    .map((item, index, arr) => (
                      <View key={item.id} style={[ styles.checklistItem, index === arr.length - 1 && styles.checklistItemLast ]}>
                        <View style={styles.checklistItemMain}>
                           <View style={[ styles.itemStatusIconWrapper, item.checked ? {backgroundColor: COLORS.successLight} : {backgroundColor: COLORS.dangerLight} ]}>
                            {item.checked ? ( <TickCircle size={18} color={COLORS.success} variant="Bold" /> ) : ( <CloseCircle size={18} color={COLORS.danger} variant="Bold" /> )}
                          </View>
                          <Text style={[ styles.itemText, item.checked && styles.itemTextChecked ]}>{item.item}</Text>
                        </View>
                        <View style={styles.itemActionsContainer}>
                          {isSeguridad && (
                            <TouchableOpacity
                              onPress={() => handleOpenCameraForItem(item.id)}
                              style={[styles.itemActionButton]}
                            >
                              <MaterialCommunityIcons
                                name="camera-outline"
                                size={20}
                                color={item.photoUri ? COLORS.success : COLORS.danger}
                              />
                            </TouchableOpacity>
                          )}
                          <Switch
                            value={item.checked}
                            onValueChange={() => handleToggleItem(item.id)}
                            trackColor={{ false: COLORS.border, true: COLORS.successLight }}
                            thumbColor={item.checked ? COLORS.success : COLORS.cardBackground}
                            ios_backgroundColor={COLORS.border}
                            style={styles.itemSwitch}
                          />
                        </View>
                      </View>
                    ))}
                    {/* Gallery for Seguridad photos, shown if expanded and photos exist */}
                    {isSeguridad && currentCategorySeguridadPhotos.length > 0 && (
                        <View style={styles.categoryGalleryContainer}>
                            <Text style={styles.galleryTitle}>Fotos de {category}</Text>
                            <FlatList
                                horizontal
                                data={currentCategorySeguridadPhotos}
                                renderItem={({ item: photo }) => (
                                    <TouchableOpacity onPress={() => Alert.alert("Foto de Seguridad", `Item: ${photo.itemName}`)}>
                                        <Image source={{ uri: photo.uri }} style={styles.galleryThumbnail} />
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(photo) => photo.uri}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.galleryListContent}
                            />
                        </View>
                    )}
                </View>
              )}
            </View>
          );
        })}
        
        <View style={styles.notesCard}>
            {/* ... (NotesCard JSX remains the same) ... */}
             <View style={styles.notesHeader}>
                <Ionicons name="document-text-outline" size={20} color={COLORS.primary} style={{marginRight: 8}}/>
                <Text style={styles.notesTitle}>{currentTurbine ? `Notas Adicionales para ${currentTurbine.name}` : 'Notas Generales'}</Text>
            </View>
            <TextInput
                style={styles.notesInput}
                multiline
                placeholder={currentTurbine ? `Observaciones específicas...` : 'Añadir comentarios relevantes...'}
                placeholderTextColor={COLORS.textMuted}
                value={generalNotes}
                onChangeText={setGeneralNotes}
            />
        </View>
        
        <TouchableOpacity
          style={[ styles.submitButton, (!allGeneralItemsChecked || !areSeguridadPhotosComplete()) && styles.submitButtonDisabled ]}
          onPress={handleSubmitPreflight}
          disabled={!allGeneralItemsChecked || !areSeguridadPhotosComplete()}
          activeOpacity={0.8}
        >
          {/* ... (SubmitButton JSX remains the same) ... */}
          <MaterialCommunityIcons
                name={(!allGeneralItemsChecked || !areSeguridadPhotosComplete()) ? "progress-clock" : "check-circle-outline"}
                size={20}
                color={COLORS.white}
            />
            <Text style={styles.submitButtonText}>
                {(!allGeneralItemsChecked || !areSeguridadPhotosComplete()) ?
                'Completar Checklist' :
                (currentTurbine ? `Confirmar para ${currentTurbine.name}` : 'Finalizar Verificación')
                }
            </Text>
        </TouchableOpacity>
      </ScrollView>

      {currentTurbine && ( <Modal animationType="slide" transparent={true} visible={isTurbineModalVisible} onRequestClose={() => setIsTurbineModalVisible(false)}>
         {/* ... (Turbine Info Modal JSX remains the same) ... */}
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentContainer}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  {getTurbineStatusIcon(currentTurbine.status)}
                  <Text style={styles.modalTitle}>{currentTurbine.name}</Text>
                </View>
                <TouchableOpacity onPress={() => setIsTurbineModalVisible(false)} style={styles.modalCloseButton}>
                  <Ionicons name="close-circle" size={28} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              
              <View style={[styles.modalStatusBadge, { backgroundColor: getTurbineStatusColor(currentTurbine.status) }]}>
                  <Text style={styles.modalStatusText}>
                    {currentTurbine.status ? currentTurbine.status.replace('_', ' ') : 'DESCONOCIDO'}
                  </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Detalles de la Turbina</Text>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>ID:</Text>
                  <Text style={styles.modalDetailValue}>{currentTurbine.id}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Parque Eólico:</Text>
                  <Text style={styles.modalDetailValue}>{currentTurbine.windParkId}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Modelo:</Text>
                  <Text style={styles.modalDetailValue}>{currentTurbine.model || 'No especificado'}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Altura de Buje:</Text>
                  <Text style={styles.modalDetailValue}>{currentTurbine.hubHeight ? `${currentTurbine.hubHeight}m` : 'N/A'}</Text>
                </View>
                 <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Diámetro de Rotor:</Text>
                  <Text style={styles.modalDetailValue}>{currentTurbine.rotorDiameter ? `${currentTurbine.rotorDiameter}m` : 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Mantenimiento</Text>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Última Inspección:</Text>
                  <Text style={styles.modalDetailValue}>
                    {currentTurbine.lastInspection ? new Date(currentTurbine.lastInspection).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Próxima Inspección:</Text>
                  <Text style={styles.modalDetailValue}>
                    {currentTurbine.nextInspection ? new Date(currentTurbine.nextInspection).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
      </Modal>)}
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