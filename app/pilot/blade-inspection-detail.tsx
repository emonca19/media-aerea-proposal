import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Platform, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
  primary: '#3b82f6', primaryLight: '#dbeafe', primaryDark: '#2563eb',
  success: '#10b981', successLight: '#d1fae5',
  danger: '#ef4444', dangerLight: '#fee2e2',
  textPrimary: '#1f2937', textSecondary: '#4b5563', textMuted: '#9ca3af', textWhite: '#ffffff',
  cardBackground: '#ffffff', background: '#f0f2f5', // Match dashboard background
  border: '#e5e7eb', borderLight: '#f3f4f6',
  iconDefault: '#6b7280',  // Nuevos colores para aspas más bonitas
  bladeDefault: ['#f8fafc', '#e2e8f0', '#cbd5e1'] as const, // Gradiente plateado más elegante
  bladeChecked: ['#34d399', '#10b981', '#059669'] as const, // Verde más vibrante
  bladeSelectedVisual: ['#60a5fa', '#3b82f6', '#1d4ed8'] as const, // Azul más intenso
  bladeHighlight: 'rgba(255,255,255,0.4)', // Brillo sutil
  bladeShadowDark: 'rgba(0,0,0,0.15)', // Sombra más suave
  // Restore missing properties
  hubGradient: ['#4b5563', '#374151', '#2d3748'] as const, // Hub más oscuro y metálico
  nacelleColor: '#e2e8f0', // Nacelle un poco más clara
};

interface BladeStatus {
  id: string;  name: string; checked: boolean;  timestamp?: string;}

const BladeInspectionDetail = () => {
  const params = useLocalSearchParams();
  const turbineId = params.turbineId as string;
  const activityId = params.activityId as string;
  
  const NUM_BLADES = 3;

  const [blades, setBlades] = useState<BladeStatus[]>(
    Array.from({ length: NUM_BLADES }, (_, i) => ({
      id: `blade_${i + 1}`, name: `Aspa ${i + 1}`, checked: false,
    }))
  );
  
  const [currentBladeIndex, setCurrentBladeIndex] = useState(0);
  const [checkAnimation] = useState(new Animated.Value(0));
  const turbineRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const targetRotationDegrees = -currentBladeIndex * (360 / NUM_BLADES);
    Animated.spring(turbineRotation, {
      toValue: targetRotationDegrees,
      tension: 25, friction: 8, useNativeDriver: true, // Ajustar para una rotación más suave
    }).start();
  }, [currentBladeIndex, turbineRotation]);

  const handleBladePress = (pressedBladeId: string, pressedBladeIndex: number) => {
    setCurrentBladeIndex(pressedBladeIndex);
    if (!blades[pressedBladeIndex].checked) {
      setBlades(prev => prev.map(b => 
        b.id === pressedBladeId ? { ...b, checked: true, timestamp: new Date().toISOString() } : b
      ));
      checkAnimation.setValue(0);
      Animated.spring(checkAnimation, {
        toValue: 1, tension: 60, friction: 6, useNativeDriver: true,
      }).start();
    }
  };

  const allBladesChecked = blades.every(blade => blade.checked);
  const checkedCount = blades.filter(blade => blade.checked).length;

  const handleFinishInspection = () => { 
    if (!allBladesChecked) {
      Alert.alert('Inspección Incompleta', 'Debe revisar todas las aspas antes de finalizar.', [{ text: 'Entendido' }]);
      return;
    }
    
    // Directly navigate back to the dashboard without a confirmation alert
    router.replace({
      pathname: '/pilot/dashboard', // Changed to /pilot/dashboard to match example and back button
      params: { 
        bladeInspectionCompleted: 'true', 
        turbineId, 
        activityId, 
        timestamp: Date.now().toString(),
        keepActivityRunning: 'true' // Flag to keep activity running on the dashboard
      }
    });
  };

  const animatedRotationStyle = {
    transform: [{
      rotate: turbineRotation.interpolate({ inputRange: [-360, 0, 360], outputRange: ['-360deg', '0deg', '360deg'] })
    }]
  };
  
  const checkIconScale = checkAnimation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.3, 1]});
  const checkIconOpacity = checkAnimation.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1]});
  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header compacto con información esencial */}
      <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.compactHeader}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/pilot/dashboard')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Inspección de Aspas</Text>
          <Text style={styles.headerSubtitle}>Turbina {turbineId?.replace('turbine-', 'T-') || 'Desconocida'}</Text>
        </View>
        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>{checkedCount}/{blades.length}</Text>
          <View style={styles.progressCircle}>
            <Animated.View style={[styles.progressFill, { width: `${(checkedCount / blades.length) * 100}%` }]} />
          </View>
        </View>
      </LinearGradient>

      {/* Contenido principal sin scroll - todo visible */}
      <View style={styles.mainContent}>
        
        {/* Visualizador de turbina más compacto */}
        <View style={styles.turbineSection}>
          <View style={styles.turbineContainer}>
            <LinearGradient colors={COLORS.hubGradient} style={styles.compactHub}>
              <View style={styles.hubCenter}/>
            </LinearGradient>

            <Animated.View style={[styles.bladesContainer, animatedRotationStyle]}>
              {blades.map((blade, index) => {
                const baseBladeRotation = `${index * (360 / NUM_BLADES)}deg`; 
                const isSelected = index === currentBladeIndex;
                const isChecked = blade.checked;                let bladeColors: readonly string[] = COLORS.bladeDefault;
                if (isChecked) bladeColors = COLORS.bladeChecked;
                else if (isSelected) bladeColors = COLORS.bladeSelectedVisual;
                
                return (
                  <View
                    key={blade.id}
                    style={[styles.bladeWrapper, { transform: [{ rotate: baseBladeRotation }] }]}
                  >
                    <Pressable 
                      style={styles.bladeArea} 
                      onPress={() => handleBladePress(blade.id, index)} 
                      disabled={isChecked}
                    >
                      <LinearGradient colors={bladeColors as any} style={styles.compactBlade}>
                        {isChecked && (
                          <Animated.View style={[styles.checkIcon, {opacity: checkIconOpacity, transform: [{scale: checkIconScale}]}]}>
                            <Ionicons name="checkmark" size={20} color={COLORS.textWhite} />
                          </Animated.View>
                        )}
                      </LinearGradient>
                    </Pressable>
                  </View>
                );
              })}
            </Animated.View>
          </View>
        </View>

        {/* Controles de navegación entre aspas - siempre visibles */}
        <View style={styles.bladeNavigation}>
          {blades.map((blade, index) => (
            <TouchableOpacity 
              key={blade.id}
              style={[
                styles.navButton,
                index === currentBladeIndex && styles.navButtonActive,
                blade.checked && styles.navButtonChecked
              ]}
              onPress={() => setCurrentBladeIndex(index)}
              activeOpacity={0.7}
            >              <MaterialCommunityIcons 
                name="wind-turbine" 
                size={24} 
                color={blade.checked ? COLORS.success : (index === currentBladeIndex ? COLORS.textWhite : COLORS.textSecondary)} 
              />
              <Text style={[
                styles.navButtonText,
                index === currentBladeIndex && styles.navButtonTextActive,
                blade.checked && styles.navButtonTextChecked
              ]}>
                {blade.name}
              </Text>
              {blade.checked && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color={COLORS.textWhite} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Información del aspa actual */}
        <View style={styles.currentBladeInfo}>
          <View style={styles.bladeInfoHeader}>
            <Text style={styles.bladeInfoTitle}>
              {blades[currentBladeIndex].name} - 
              {blades[currentBladeIndex].checked ? ' Revisada' : ' Pendiente'}
            </Text>
            {blades[currentBladeIndex].checked && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.completedText}>Completada</Text>
              </View>
            )}
          </View>
          
          {!blades[currentBladeIndex].checked && (
            <TouchableOpacity 
              style={styles.markCompleteButton} 
              onPress={() => handleBladePress(blades[currentBladeIndex].id, currentBladeIndex)}
              activeOpacity={0.8}
            >
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.markCompleteGradient}>
                <Ionicons name="checkmark-outline" size={20} color={COLORS.textWhite} style={{ marginRight: 8 }} />
                <Text style={styles.markCompleteText}>Marcar como Revisada</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Botón de finalizar - siempre visible */}
      <View style={styles.fixedFooter}>
        <TouchableOpacity 
          style={[styles.finishButton, !allBladesChecked && styles.finishButtonDisabled]} 
          onPress={handleFinishInspection} 
          disabled={!allBladesChecked} 
          activeOpacity={0.8}
        >
          <LinearGradient 
            colors={allBladesChecked ? [COLORS.success, '#047857'] : [COLORS.textMuted, '#9ca3af']} 
            style={styles.finishButtonGradient}
          >
            <Ionicons 
              name={allBladesChecked ? 'flag' : 'hourglass-outline'} 
              size={20} 
              color={COLORS.textWhite} 
              style={{ marginRight: 8 }} 
            />
            <Text style={styles.finishButtonText}>
              {allBladesChecked ? 'Finalizar Inspección' : `Faltan ${NUM_BLADES - checkedCount} Aspa(s)`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  
  // Header compacto
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: (StatusBar.currentHeight || 0) + 10,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerBackButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.primaryLight,
    textAlign: 'center',
    marginTop: 2,
  },
  progressIndicator: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  progressCircle: {
    width: 40,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.textWhite,
    borderRadius: 3,
  },

  // Contenido principal
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },

  // Sección de turbina compacta
  turbineSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  turbineContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  compactHub: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#374151',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  hubCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1f2937',
  },
  bladesContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bladeWrapper: {
    width: 40,
    height: 180,
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -20,
    marginTop: -90,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  bladeArea: {
    width: '100%',
    height: '50%',
  },
  compactBlade: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.bladeShadowDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: Platform.OS === 'android' ? 0 : 1,
    borderColor: COLORS.bladeHighlight,
  },
  checkIcon: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 15,
    padding: 6,
  },

  // Navegación entre aspas
  bladeNavigation: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    position: 'relative',
  },
  navButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  navButtonChecked: {
    backgroundColor: COLORS.success,
    borderColor: '#047857',
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  navButtonTextActive: {
    color: COLORS.textWhite,
  },
  navButtonTextChecked: {
    color: COLORS.textWhite,
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Información del aspa actual
  currentBladeInfo: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  bladeInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bladeInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 4,
  },
  markCompleteButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  markCompleteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  markCompleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textWhite,
  },

  // Footer fijo
  fixedFooter: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 5,
  },
  finishButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  finishButtonDisabled: {
    opacity: 0.7,
  },
  finishButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },

  // Estilos legacy (mantener para evitar errores)
  customHeader: { display: 'none' },
  headerTitleContainer: { display: 'none' },
  mainHeaderTitle: { display: 'none' },
  subHeaderTitle: { display: 'none' },
  headerStatusBadge: { display: 'none' },
  headerStatusText: { display: 'none' },
  contentScrollView: { display: 'none' },
  contentScrollViewContent: { display: 'none' },
  mainProgressCard: { display: 'none' },
  mainProgressHeader: { display: 'none' },
  mainProgressLabel: { display: 'none' },
  mainProgressValue: { display: 'none' },
  mainProgressBarBackground: { display: 'none' },
  mainProgressBarForeground: { display: 'none' },
  allCheckedIndicator: { display: 'none' },
  allCheckedText: { display: 'none' },
  turbineVisualizerCard: { display: 'none' },
  visualizerTitle: { display: 'none' },
  turbineAssembly: { display: 'none' },
  nacelleShape: { display: 'none' },
  turbineHub: { display: 'none' },
  hubCenterDetail: { display: 'none' },
  bladesContainerAnimated: { display: 'none' },
  bladeWrapperVisual: { display: 'none' },
  bladePressableAreaVisual: { display: 'none' },
  bladeRealisticVisual: { display: 'none' },
  checkIconOnBladeVisual: { display: 'none' },
  bladeStatusListCard: { display: 'none' },
  statusListTitle: { display: 'none' },
  bladeStatusItem: { display: 'none' },
  bladeStatusItemActive: { display: 'none' },
  bladeStatusItemChecked: { display: 'none' },
  bladeItemContent: { display: 'none' },
  bladeItemIconContainer: { display: 'none' },
  bladeItemName: { display: 'none' },
  itemCheckedBadge: { display: 'none' },
  itemCheckedText: { display: 'none' },
  itemCheckButton: { display: 'none' },
  itemCheckButtonText: { display: 'none' },
  footer: { display: 'none' },
  mainActionButton: { display: 'none' },
  mainActionButtonGradient: { display: 'none' },
  mainActionButtonDisabled: { display: 'none' },
  mainActionButtonText: { display: 'none' },
});

export default BladeInspectionDetail;