import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
  primary: '#9333ea', primaryLight: '#f3e8ff', primaryDark: '#7c3aed',
  success: '#10b981', successLight: '#d1fae5',
  danger: '#ef4444', dangerLight: '#fee2e2',
  textPrimary: '#1f2937', textSecondary: '#4b5563', textMuted: '#9ca3af', textWhite: '#ffffff',
  cardBackground: '#ffffff', background: '#ffffff', // Changed to white background
  border: '#e5e7eb', borderLight: '#f3f4f6',
  iconDefault: '#6b7280',  // Nuevos colores para aspas más bonitas
  bladeDefault: ['#f8fafc', '#e2e8f0', '#cbd5e1'] as const, // Gradiente plateado más elegante
  bladeChecked: ['#34d399', '#10b981', '#059669'] as const, // Verde más vibrante
  bladeSelectedVisual: ['#c4a8f5', '#9333ea', '#7c3aed'] as const, // Morado más intenso y fuerte
  bladeHighlight: 'rgba(255,255,255,0.4)', // Brillo sutil
  bladeShadowDark: 'rgba(0,0,0,0.15)', // Sombra más suave
  // Restore missing properties
  hubGradient: ['#4b5563', '#374151', '#2d3748'] as const, // Hub más oscuro y metálico
  nacelleColor: '#e2e8f0', // Nacelle un poco más clara
};

interface BladeStatus {
  id: string;
  name: string;
  checked: boolean;
  timestamp?: string;
  startTime?: Date;
  inspectionTime?: number; // tiempo en segundos
  isActive?: boolean; // whether this blade is currently being inspected
}

const BladeInspectionDetail = () => {
  const params = useLocalSearchParams();
  const turbineId = params.turbineId as string;
  const activityId = params.activityId as string;
  
  // Guardar la referencia a la turbina actual para detectar cambios
  const [currentTurbineId, setCurrentTurbineId] = useState<string | null>(null);
  
  const NUM_BLADES = 3;
  const [blades, setBlades] = useState<BladeStatus[]>(
    Array.from({ length: NUM_BLADES }, (_, i) => ({
      id: `blade_${i + 1}`, 
      name: `Aspa ${i + 1}`, 
      checked: false,
      isActive: false,
    }))
  );
  const [currentBladeIndex, setCurrentBladeIndex] = useState(0);
  const [checkAnimation] = useState(new Animated.Value(0));
  const [currentTime, setCurrentTime] = useState(new Date());
  const turbineRotation = useRef(new Animated.Value(0)).current;
  // Timer para actualizar el tiempo cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Efecto para detectar cambio de turbina y reiniciar aspas
  useEffect(() => {
    // Si es la primera carga o si cambió el ID de la turbina
    if (currentTurbineId === null || currentTurbineId !== turbineId) {
      console.log(`[BladeInspection] Turbina cambiada o primera carga: ${turbineId}`);
      
      // Reiniciar todas las aspas
      setBlades(Array.from({ length: NUM_BLADES }, (_, i) => ({
        id: `blade_${i + 1}`, 
        name: `Aspa ${i + 1}`, 
        checked: false,
        isActive: false,
      })));
      
      // Resetear el índice de la aspa actual
      setCurrentBladeIndex(0);
      
      // Actualizar el ID de turbina actual
      setCurrentTurbineId(turbineId);
    }
  }, [turbineId, currentTurbineId, NUM_BLADES]);
  
  useEffect(() => {
    const targetRotationDegrees = -currentBladeIndex * (360 / NUM_BLADES);
    Animated.spring(turbineRotation, {
      toValue: targetRotationDegrees,
      tension: 25, friction: 8, useNativeDriver: true,
    }).start();
  }, [currentBladeIndex, turbineRotation]);  const handleBladePress = (pressedBladeId: string, pressedBladeIndex: number) => {
    // Always allow navigation to other blades (even if one is active)
    setCurrentBladeIndex(pressedBladeIndex);
  };

  const handleStartStopInspection = () => {
    const currentBlade = blades[currentBladeIndex];
    
    // Check if any OTHER blade is currently active
    const hasOtherActiveIncompleteBlade = blades.some(blade => 
      blade.isActive && !blade.checked && blade.id !== currentBlade.id
    );
    
    if (hasOtherActiveIncompleteBlade && !currentBlade.isActive) {
      Alert.alert(
        'Inspección en Progreso', 
        'Debe completar la inspección actual antes de comenzar otra aspa.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    // If blade is not checked and not active, start the inspection
    if (!currentBlade.checked && !currentBlade.isActive) {
      const now = new Date();
      setBlades(prev => prev.map((blade, index) => 
        index === currentBladeIndex 
          ? { ...blade, startTime: now, isActive: true }
          : blade
      ));
    }
    // If blade is already active but not checked, complete it
    else if (currentBlade.isActive && !currentBlade.checked) {
      const now = new Date();
      const startTime = currentBlade.startTime || now;
      const inspectionTime = Math.round((now.getTime() - startTime.getTime()) / 1000);
      
      setBlades(prev => prev.map(b => 
        b.id === currentBlade.id 
          ? { 
              ...b, 
              checked: true, 
              isActive: false,
              timestamp: now.toISOString(),
              inspectionTime
            } 
          : b
      ));
      
      checkAnimation.setValue(0);
      Animated.spring(checkAnimation, {
        toValue: 1, tension: 60, friction: 6, useNativeDriver: true,
      }).start();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };  const getCurrentInspectionTime = () => {
    const currentBlade = blades[currentBladeIndex];
    if (currentBlade.checked && currentBlade.inspectionTime) {
      return currentBlade.inspectionTime;
    }
    if (currentBlade.startTime && currentBlade.isActive && !currentBlade.checked) {
      return Math.round((currentTime.getTime() - currentBlade.startTime.getTime()) / 1000);
    }
    return 0;
  };

  const allBladesChecked = blades.every(blade => blade.checked);
  const checkedCount = blades.filter(blade => blade.checked).length;
  const handleFinishInspection = () => { 
    if (!allBladesChecked) {
      Alert.alert('Inspección Incompleta', 'Debe revisar todas las aspas antes de finalizar.', [{ text: 'Entendido' }]);
      return;
    }
    
    // Prepare blade timing data to pass to activity control
    const bladeTimingData = blades.map(blade => ({
      bladeNumber: parseInt(blade.id.split('_')[1]),
      bladeName: blade.name,
      inspectionTime: blade.inspectionTime || 0,
      timestamp: blade.timestamp
    }));
    
    // Directly navigate back to the dashboard without a confirmation alert
    router.replace({
      pathname: '/pilot/dashboard',
      params: { 
        bladeInspectionCompleted: 'true', 
        turbineId, 
        activityId, 
        timestamp: Date.now().toString(),
        keepActivityRunning: 'true',
        bladeTimingData: JSON.stringify(bladeTimingData) // Pass timing data
      }
    });
  };

  const animatedRotationStyle = {
    transform: [{
      rotate: turbineRotation.interpolate({ inputRange: [-360, 0, 360], outputRange: ['-360deg', '0deg', '360deg'] })
    }]
  };
  
  const checkIconScale = checkAnimation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.3, 1]});
  const checkIconOpacity = checkAnimation.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1]});  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => {
            // Navigate back to dashboard with activity still running
            router.replace({
              pathname: '/pilot/dashboard',
              params: { 
                turbineId, 
                activityId, 
                timestamp: Date.now().toString(),
                keepActivityRunning: 'true'
              }
            });
          }}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={COLORS.textPrimary} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspección de Aspas</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      {/* Contenido principal con ScrollView */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Visualizador de turbina mejorado */}
        <View style={styles.turbineSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <MaterialCommunityIcons name="wind-turbine" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Turbina {turbineId?.replace('turbine-', 'T-') || 'Desconocida'}</Text>
          </View>
          
          <View style={styles.turbineContainer}>
            <LinearGradient colors={COLORS.hubGradient} style={styles.compactHub}>
              <View style={styles.hubCenter}/>
            </LinearGradient>

            <Animated.View style={[styles.bladesContainer, animatedRotationStyle]}>
              {blades.map((blade, index) => {
                const baseBladeRotation = `${index * (360 / NUM_BLADES)}deg`; 
                const isSelected = index === currentBladeIndex;
                const isChecked = blade.checked;
                let bladeColors: readonly string[] = COLORS.bladeDefault;
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
          
          {/* Estadísticas de progreso */}
          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{checkedCount}</Text>
              <Text style={styles.statLabel}>Completadas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{blades.length - checkedCount}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Math.round((checkedCount / blades.length) * 100)}%</Text>
              <Text style={styles.statLabel}>Progreso</Text>
            </View>
          </View>
        </View>

        {/* Botón de iniciar/completar inspección - MOVED HERE */}
        {!blades[currentBladeIndex].checked && (
          <View style={styles.inspectionButtonCard}>
            <TouchableOpacity 
              style={styles.markCompleteButton}
              onPress={handleStartStopInspection}
              activeOpacity={0.8}
            >
              <LinearGradient 
                colors={blades[currentBladeIndex].isActive ? [COLORS.success, '#047857'] : [COLORS.primary, COLORS.primaryDark]}
                style={styles.markCompleteGradient}
              >
                <Ionicons 
                  name={blades[currentBladeIndex].isActive ? "checkmark-circle" : "play-circle"} 
                  size={18} 
                  color={COLORS.textWhite} 
                  style={{ marginRight: 8 }} 
                />
                <Text style={styles.markCompleteText}>
                  {blades[currentBladeIndex].isActive ? 'Completar Inspección' : 'Iniciar Inspección'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Navegación entre aspas mejorada */}
        <View style={styles.bladeNavigationCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="list-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Seleccionar Aspa</Text>
          </View>          
          <View style={styles.bladeNavigation}>
            {blades.map((blade, index) => {
              return (
                <TouchableOpacity 
                  key={blade.id}
                  style={[
                    styles.navButton,
                    index === currentBladeIndex && styles.navButtonActive,
                    blade.checked && styles.navButtonChecked,
                    blade.isActive && !blade.checked && styles.navButtonInProgress,
                  ]}
                  onPress={() => handleBladePress(blade.id, index)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons 
                    name="wind-turbine" 
                    size={24} 
                    color={blade.checked ? COLORS.textWhite : 
                          blade.isActive ? COLORS.textWhite :
                          (index === currentBladeIndex ? COLORS.textWhite : COLORS.textSecondary)} 
                  />
                  <Text style={[
                    styles.navButtonText,
                    index === currentBladeIndex && styles.navButtonTextActive,
                    blade.checked && styles.navButtonTextChecked,
                    blade.isActive && !blade.checked && styles.navButtonTextInProgress,
                  ]}>
                    {blade.name}
                  </Text>
                  {blade.checked && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color={COLORS.textWhite} />
                    </View>
                  )}
                  {blade.isActive && !blade.checked && (
                    <View style={styles.activeBadge}>
                      <Ionicons name="timer" size={12} color={COLORS.textWhite} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Información del aspa actual con cronómetro */}
        <View style={styles.currentBladeCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>
              {blades[currentBladeIndex].name}
            </Text>
            {blades[currentBladeIndex].checked && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.completedText}>Completada</Text>
              </View>
            )}
          </View>            

          {/* Cronómetro y tiempo de inspección */}
          <View style={styles.timerSection}>
            {(blades[currentBladeIndex].checked || blades[currentBladeIndex].isActive) && (
              <View style={styles.timerDisplay}>
                <Ionicons 
                  name={blades[currentBladeIndex].checked ? "checkmark-circle" : "timer-outline"} 
                  size={24} 
                  color={blades[currentBladeIndex].checked ? COLORS.success : COLORS.primary} 
                />
                <Text style={styles.timerText}>
                  {blades[currentBladeIndex].checked 
                    ? `Completada en ${formatTime(blades[currentBladeIndex].inspectionTime || 0)}`
                    : `Tiempo: ${formatTime(getCurrentInspectionTime())}`
                  }
                </Text>
              </View>
            )}
            
            {blades[currentBladeIndex].checked && blades[currentBladeIndex].timestamp && (
              <Text style={styles.timestampText}>
                Finalizada: {new Date(blades[currentBladeIndex].timestamp!).toLocaleTimeString()}
              </Text>
            )}
          </View>
          
          {/* Lista de todas las aspas con tiempos */}
          <View style={styles.allBladesSection}>
            <Text style={styles.allBladesSectionTitle}>Resumen de Inspección</Text>
            {blades.map((blade, index) => (
              <View key={blade.id} style={styles.bladeListItem}>
                <View style={styles.bladeListInfo}>
                  <Ionicons 
                    name={blade.checked ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={blade.checked ? COLORS.success : COLORS.textMuted} 
                  />
                  <Text style={styles.bladeListName}>{blade.name}</Text>
                </View>
                <Text style={styles.bladeListTime}>
                  {blade.checked 
                    ? formatTime(blade.inspectionTime || 0)
                    : '--:--'
                  }
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Espacio adicional para el footer fijo */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Botón de finalizar - siempre visible */}
      <View style={styles.fixedFooter}>
        <TouchableOpacity 
          style={[styles.finishButton, !allBladesChecked && styles.finishButtonDisabled]} 
          onPress={handleFinishInspection} 
          disabled={!allBladesChecked} 
          activeOpacity={0.8}
        >
          <View style={styles.finishButtonContent}>
            <Ionicons 
              name={allBladesChecked ? 'checkmark-circle' : 'hourglass-outline'} 
              size={18} 
              color={allBladesChecked ? COLORS.textWhite : COLORS.textMuted} 
              style={{ marginRight: 8 }} 
            />
            <Text style={[styles.finishButtonText, !allBladesChecked && styles.finishButtonTextDisabled]}>
              {allBladesChecked ? 'Finalizar Inspección' : `Faltan ${NUM_BLADES - checkedCount} Aspa(s)`}
            </Text>
          </View>
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

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 5 : StatusBar.currentHeight || 0 + 16,
    paddingBottom: 16,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerBackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, // Same width as back button to center the title
  },

  // Scroll view styles
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  bottomSpacer: {
    height: 80, // Reduced since we only have one button now
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
  headerTitleContainer: { display: 'none' },
  mainHeaderTitle: { display: 'none' },
  subHeaderTitle: { display: 'none' },
  headerStatusBadge: { display: 'none' },
  headerStatusText: { display: 'none' },
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

  // Secciones con header común
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },

  // Sección de turbina
  turbineSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    alignSelf: 'center',
    marginBottom: -10, // Reduced from 20 to 12
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

  // Estadísticas de progreso
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },

  // Navegación entre aspas
  bladeNavigationCard: {
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
  bladeNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    position: 'relative',
  },
  navButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },  navButtonChecked: {
    backgroundColor: COLORS.success,
    borderColor: '#047857',
  },
  navButtonInProgress: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
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
  navButtonTextInProgress: {
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
  activeBadge: {
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
  currentBladeCard: {
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

  // Sección de cronómetro
  timerSection: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  timestampText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Botón de marcar completo
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

  // Inspection button card - NEW STYLE
  inspectionButtonCard: {
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

  // Resumen de todas las aspas
  allBladesSection: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  allBladesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  bladeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  bladeListInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bladeListName: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 8,
    fontWeight: '500',
  },
  bladeListTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Footer fijo
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 14 : 16,
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
    borderRadius: 12,
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  finishButtonDisabled: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: 'transparent',
    elevation: 0,
  },
  finishButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  finishButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  finishButtonTextDisabled: {
    color: COLORS.textMuted,
  },

  // Remove unused footer styles
  footerButtonsContainer: { display: 'none' },
  backButton: { display: 'none' },
  backButtonText: { display: 'none' },

  // Estilos legacy (mantener para evitar errores)
  customHeader: { display: 'none' },
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

  // Estilos que mantener pero no usar
  currentBladeInfo: { display: 'none' },
  bladeInfoHeader: { display: 'none' },
  bladeInfoTitle: { display: 'none' },
});

export default BladeInspectionDetail;