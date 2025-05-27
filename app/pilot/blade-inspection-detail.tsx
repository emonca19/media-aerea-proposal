import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#3b82f6', primaryLight: '#dbeafe', primaryDark: '#2563eb',
  success: '#10b981', successLight: '#d1fae5',
  danger: '#ef4444', dangerLight: '#fee2e2',
  textPrimary: '#1f2937', textSecondary: '#4b5563', textMuted: '#9ca3af', textWhite: '#ffffff',
  cardBackground: '#ffffff', background: '#f0f2f5', // Match dashboard background
  border: '#e5e7eb', borderLight: '#f3f4f6',
  iconDefault: '#6b7280',
  // Nuevos colores para aspas más bonitas
  bladeDefault: ['#f8fafc', '#e2e8f0', '#cbd5e1'], // Gradiente plateado más elegante
  bladeChecked: ['#34d399', '#10b981', '#059669'], // Verde más vibrante
  bladeSelectedVisual: ['#60a5fa', '#3b82f6', '#1d4ed8'], // Azul más intenso
  bladeHighlight: 'rgba(255,255,255,0.4)', // Brillo sutil
  bladeShadowDark: 'rgba(0,0,0,0.15)', // Sombra más suave
  // Restore missing properties
  hubGradient: ['#4b5563', '#374151', '#2d3748'], // Hub más oscuro y metálico
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
      <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.customHeader}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/pilot/dashboard')}>
          <Ionicons name="arrow-back" size={26} color={COLORS.textWhite} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.mainHeaderTitle}>Inspección de Aspas</Text>
          <Text style={styles.subHeaderTitle}>Turbina {turbineId?.replace('turbine-', 'T-') || 'Desconocida'}</Text>
        </View>
        <View style={styles.headerStatusBadge}>
          <Text style={styles.headerStatusText}>{checkedCount}/{blades.length}</Text>
          <Ionicons name="checkmark-done-outline" size={16} color={COLORS.primaryLight} style={{marginLeft: 4}} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentScrollViewContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainProgressCard}>
            <View style={styles.mainProgressHeader}>
                <Text style={styles.mainProgressLabel}>Progreso General</Text>
                <Text style={styles.mainProgressValue}>{Math.round((checkedCount / blades.length) * 100)}%</Text>
            </View>
            <View style={styles.mainProgressBarBackground}><Animated.View style={[styles.mainProgressBarForeground, { width: `${(checkedCount / blades.length) * 100}%` }]} /></View>
            {allBladesChecked && (<View style={styles.allCheckedIndicator}><Ionicons name="shield-checkmark" size={18} color={COLORS.success} /><Text style={styles.allCheckedText}>Todas las aspas revisadas</Text></View>)}
        </View>

        <View style={styles.turbineVisualizerCard}>
            <Text style={styles.visualizerTitle}>Visualizador de Turbina</Text>
            <View style={styles.turbineAssembly}>
                <View style={styles.nacelleShape} />
                <LinearGradient colors={COLORS.hubGradient} style={styles.turbineHub}>
                    <View style={styles.hubCenterDetail}/>
                </LinearGradient>

                <Animated.View style={[styles.bladesContainerAnimated, animatedRotationStyle]}>
                    {blades.map((blade, index) => {
                        const baseBladeRotation = `${index * (360 / NUM_BLADES)}deg`; 
                        const isThisBladeChecked = blade.checked;
                        const isThisBladeAtTop = index === currentBladeIndex; 

                        let bladeGradientColors = COLORS.bladeDefault;
                        if (isThisBladeChecked) bladeGradientColors = COLORS.bladeChecked;
                        else if (isThisBladeAtTop) bladeGradientColors = COLORS.bladeSelectedVisual;
                    
                        return (
                            <View
                                key={blade.id}
                                style={[ styles.bladeWrapperVisual, { transform: [{ rotate: baseBladeRotation }] } ]}
                            >
                                <Pressable 
                                    style={styles.bladePressableAreaVisual} 
                                    onPress={() => handleBladePress(blade.id, index)} 
                                    disabled={isThisBladeChecked}
                                >
                                    <LinearGradient colors={bladeGradientColors} style={styles.bladeRealisticVisual}>
                                        <LinearGradient 
                                            colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.1)', 'transparent']}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: '15%',
                                                right: '15%',
                                                height: '40%',
                                                borderTopLeftRadius: 30,
                                                borderTopRightRadius: 30,
                                            }}
                                        />
                                        
                                        <View style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            borderTopLeftRadius: 35,
                                            borderTopRightRadius: 35,
                                            borderBottomLeftRadius: 12,
                                            borderBottomRightRadius: 12,
                                            borderWidth: 1,
                                            borderColor: 'rgba(0,0,0,0.1)',
                                        }} />
                                        
                                        {isThisBladeChecked && (
                                            <Animated.View style={[styles.checkIconOnBladeVisual, {opacity: checkIconOpacity, transform: [{scale: checkIconScale}]}]}>
                                                <Ionicons name="checkmark" size={28} color={COLORS.textWhite} />
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
        
        <View style={styles.bladeStatusListCard}>
            <Text style={styles.statusListTitle}>Estado de Inspección</Text>
            {blades.map((blade, index) => (
                <TouchableOpacity key={blade.id} style={[styles.bladeStatusItem, index === currentBladeIndex && styles.bladeStatusItemActive, blade.checked && styles.bladeStatusItemChecked ]}
                    onPress={() => setCurrentBladeIndex(index)} activeOpacity={0.7}>
                    <View style={styles.bladeItemContent}>
                        <View style={[styles.bladeItemIconContainer, index === currentBladeIndex && {backgroundColor: COLORS.primaryLight}, blade.checked && {backgroundColor: COLORS.successLight}]}>
                            <MaterialCommunityIcons name="wind-turbine-blade" size={20} color={blade.checked ? COLORS.success : (index === currentBladeIndex ? COLORS.primary : COLORS.iconDefault)} />
                        </View>
                        <Text style={[styles.bladeItemName, blade.checked && {color: COLORS.success}, index === currentBladeIndex && !blade.checked && {color: COLORS.primary, fontWeight:'bold'}]}>{blade.name}</Text>
                    </View>
                    {blade.checked ? (<View style={styles.itemCheckedBadge}><Ionicons name="checkmark-circle" size={18} color={COLORS.success} /><Text style={styles.itemCheckedText}>Revisada</Text></View>)
                    : (<TouchableOpacity style={styles.itemCheckButton} onPress={() => handleBladePress(blade.id, index)}><Text style={styles.itemCheckButtonText}>Marcar</Text><Ionicons name="checkbox-outline" size={18} color={COLORS.primary} /></TouchableOpacity>)}
                </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
          <TouchableOpacity style={[styles.mainActionButton, !allBladesChecked && styles.mainActionButtonDisabled ]} onPress={handleFinishInspection} disabled={!allBladesChecked} activeOpacity={0.8}>
              <LinearGradient colors={allBladesChecked ? [COLORS.success, '#047857'] : [COLORS.textMuted, '#9ca3af']} style={styles.mainActionButtonGradient}>
                  <Ionicons name={allBladesChecked ? 'flag' : 'hourglass-outline'} size={22} color={COLORS.textWhite} style={{ marginRight: 10 }} />
                  <Text style={styles.mainActionButtonText}>{allBladesChecked ? 'Finalizar Inspección Completa' : `Revisar ${NUM_BLADES - checkedCount} Aspa(s) Más`}</Text>
              </LinearGradient>
          </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: COLORS.background },
  customHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: (StatusBar.currentHeight || 0) + 10, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerBackButton: { padding: 8, borderRadius: 20 },
  headerTitleContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
  mainHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textWhite, textAlign: 'center' },
  subHeaderTitle: { fontSize: 13, color: COLORS.primaryLight, textAlign: 'center', marginTop: 2 },
  headerStatusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  headerStatusText: { fontSize: 13, fontWeight: 'bold', color: COLORS.textWhite },
  contentScrollView: { flex: 1 },
  contentScrollViewContent: { paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 100 },
  
  mainProgressCard: { 
    backgroundColor: COLORS.cardBackground, 
    borderRadius: 16,
    padding: 20,
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    shadowColor: COLORS.textPrimary, 
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, 
    shadowRadius: 8, 
    elevation: 4,
    maxWidth: 420, // Added to match dashboard card style
    alignSelf: 'center', // Added to match dashboard card style
    width: '100%' // Added to match dashboard card style
  },
  mainProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mainProgressLabel: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  mainProgressValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  mainProgressBarBackground: { height: 10, backgroundColor: COLORS.borderLight, borderRadius: 5, overflow: 'hidden' },
  mainProgressBarForeground: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 5 },
  allCheckedIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: COLORS.successLight, borderRadius: 10, alignSelf: 'flex-start' },
  allCheckedText: { fontSize: 13, fontWeight: '600', color: COLORS.success, marginLeft: 6 },
  
  turbineVisualizerCard: { 
    backgroundColor: COLORS.cardBackground, 
    borderRadius: 16,
    padding: 24,
    alignItems: 'center', 
    marginBottom: 20, 
    minHeight: 350, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    shadowColor: COLORS.textPrimary, 
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, 
    shadowRadius: 8, 
    elevation: 4,
    maxWidth: 420, // Added to match dashboard card style
    alignSelf: 'center', // Added to match dashboard card style
    width: '100%' // Added to match dashboard card style
  },
  visualizerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 24 },
  
  turbineAssembly: { 
    width: 320, 
    height: 320, 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative'
  },
  nacelleShape: { 
    width: 0, height: 0, 
    opacity: 0 // Kept as is, assuming it's a placeholder or for future use
  },
  turbineHub: { 
    width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', 
    zIndex: 10, borderWidth: 3, borderColor: '#374151', elevation: 8,
    shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.25, shadowRadius: 6
  },
  hubCenterDetail: { 
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#1f2937',
    shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.3, shadowRadius: 3
  },
  bladesContainerAnimated: { 
    width: '100%', height: '100%', position: 'absolute', alignItems: 'center', justifyContent: 'center'
  },
  bladeWrapperVisual: {
    width: 60, // Blade width
    height: 280, // Total length from center for rotation pivot
    position: 'absolute', 
    left: '50%', 
    top: '50%',
    marginLeft: -30, // Half of blade width
    marginTop: -140, // Half of blade visual length (for center rotation)
    alignItems: 'center', 
    justifyContent: 'flex-start', // Blade extends "upwards" from pivot
  },
  bladePressableAreaVisual: { 
      width: '100%', 
      height: '50%', // Pressable area is the outer half of the blade length
  },
  bladeRealisticVisual: { 
    width: '100%', 
    height: '100%', // This refers to height of bladePressableAreaVisual
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: COLORS.bladeShadowDark, // Using defined shadow color
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 1, // Opacity is handled by the color itself (rgba)
    shadowRadius: 8, 
    elevation: 8,
    borderWidth: Platform.OS === 'android' ? 0 : 1, // Subtle border, conditional for Android elevation
    borderColor: COLORS.bladeHighlight, // Using defined highlight color
    position: 'relative',
    overflow: 'hidden',
    transform: [{ scaleX: 0.9 }], // Makes blade slightly thinner
    backgroundColor: 'transparent', // Gradient is the background
  },
  checkIconOnBladeVisual: { 
    position: 'absolute', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 6,
    top: '35%', // Position checkmark appropriately on the blade
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    padding: 4,
  },
  
  bladeStatusListCard: { 
    backgroundColor: COLORS.cardBackground, 
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    shadowColor: COLORS.textPrimary, 
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, 
    shadowRadius: 8, 
    elevation: 4,
    maxWidth: 420, // Added to match dashboard card style
    alignSelf: 'center', // Added to match dashboard card style
    width: '100%' // Added to match dashboard card style
  },
  statusListTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 16, paddingLeft: 4 },
  bladeStatusItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 14,
    paddingHorizontal: 16, 
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: COLORS.background, // Slightly different background for item itself
    borderWidth: 1, 
    borderColor: COLORS.borderLight,
    shadowColor: '#000', // Subtle shadow for each item
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1 
  },
  bladeStatusItemActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  bladeStatusItemChecked: { backgroundColor: COLORS.successLight, borderColor: COLORS.success },
  bladeItemContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  bladeItemIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.borderLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  bladeItemName: { fontSize: 15, fontWeight: '500', color: COLORS.textSecondary, flexShrink: 1 },
  itemCheckedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: COLORS.cardBackground }, // Badge bg matches card for contrast
  itemCheckedText: { fontSize: 12, fontWeight: '600', color: COLORS.success, marginLeft: 4 },
  itemCheckButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: COLORS.primary },
  itemCheckButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.primary, marginRight: 4 },
  
  footer: { 
    paddingHorizontal: 16, 
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: COLORS.cardBackground, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07, 
    shadowRadius: 8, 
    elevation: 8 
  },
  mainActionButton: { borderRadius: 14, overflow: 'hidden' },
  mainActionButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  mainActionButtonDisabled: { opacity: 0.7 },
  mainActionButtonText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textWhite },
});

export default BladeInspectionDetail;