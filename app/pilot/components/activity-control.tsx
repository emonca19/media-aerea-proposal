import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { requiresBladeInspection as validateBladeInspectionRequired } from '../../../src/utils/bladeInspectionValidation';
import ActivitySuggestionsCard from "./activity-suggestions-card";
import { activityTypes } from './quick-register-activity-form';

interface ActivityControlProps {
  ongoingActivity: any | null;
  onStart: () => void;
  onPause: (reason: string) => void;
  onResume: () => void;
  onFinish: () => void;
  isPaused: boolean;
  currentPauseReason?: string;
  onIncidentCreate?: (incidentData: any) => void;
  currentIncident?: any | null;
  onFinishActivityByBlockingIncident?: (incidentId: string) => void;
  requiresBladeInspection?: boolean;
  hasCompletedBladeInspection?: boolean;
  onGoToBladeInspection?: () => void;
  bladeInspectionTimingData?: any[]; 
}



export default function ActivityControl({
  ongoingActivity,
  onStart,
  onPause,
  onResume,
  onFinish,
  isPaused,
  currentPauseReason,
  onIncidentCreate,
  currentIncident,
  onFinishActivityByBlockingIncident,
  requiresBladeInspection = false,
  hasCompletedBladeInspection = false,
  onGoToBladeInspection,
  bladeInspectionTimingData
}: ActivityControlProps) {
  const [pauseStart, setPauseStart] = useState<number | null>(null);
  const [accumulated, setAccumulated] = useState(0); 
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [activityStartTime, setActivityStartTime] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [terminationType, setTerminationType] = useState<'completed' | 'incident'>('completed');
  const [suggestedActivities, setSuggestedActivities] = useState<any[]>([]);

  const hasActivity = ongoingActivity && ongoingActivity.actualStart; 
  const shouldRequireBladeInspection = requiresBladeInspection && 
                                       ongoingActivity && 
                                       validateBladeInspectionRequired(ongoingActivity);
                                       
  const isInspectionPendingAndActionable = shouldRequireBladeInspection && !hasCompletedBladeInspection && onGoToBladeInspection;
  const isInspectionRequiredNotActionable = shouldRequireBladeInspection && !hasCompletedBladeInspection && !onGoToBladeInspection;

  React.useEffect(() => {
    if (ongoingActivity) {
      const mockSuggestedActivities = [
        { 
          id: 'sugg1', 
          name: 'Inspección Visual Turbina', 
          type: 'TURBINE_INSPECTION',
          turbineId: 'turbine1'
        },
        { 
          id: 'sugg2', 
          name: 'Mantenimiento Preventivo', 
          type: 'MAINTENANCE'
        },
        { 
          id: 'sugg3', 
          name: 'Documentación de Incidencias', 
          type: 'DOCUMENTATION'
        }
      ];
      
      setSuggestedActivities(mockSuggestedActivities);
    }
  }, [ongoingActivity]);

  const handleFinishWithSuggestions = () => {
    onFinish();
    
  };

  const handleFinishByBlockingIncident = (incidentId: string) => {
    if (onFinishActivityByBlockingIncident) {
      onFinishActivityByBlockingIncident(incidentId);
    }
  };

  const handleActivitySelect = (activityId: string, isTurbineActivity: boolean) => {
    setShowSuggestions(false);
    
   
  };
  const handleCloseWithoutSelection = () => {
    setShowSuggestions(false);
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  React.useEffect(() => {
    if (!hasActivity) return;
    if (isPaused && !pauseStart) {
      const now = Date.now();
      setPauseStart(now);
      const start = new Date(ongoingActivity.actualStart).getTime();
      const totalPauseTime = ongoingActivity?.pauseHistory?.reduce((total: number, pause: any) => {
        if (pause.end) {
          return total + (new Date(pause.end).getTime() - new Date(pause.start).getTime());
        }
        return total;
      }, 0) || 0;
      setAccumulated(now - start - totalPauseTime);
    } else if (!isPaused && pauseStart) {
      setPauseStart(null);
    }
  }, [isPaused, hasActivity, ongoingActivity, pauseStart]);

  React.useEffect(() => {
    if (ongoingActivity && ongoingActivity.actualStart) {
      const startDate = new Date(ongoingActivity.actualStart);
      const formattedStartDate = startDate.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      setActivityStartTime(formattedStartDate);
    } else {
      setActivityStartTime(null); 
    }
  }, [ongoingActivity]); 

  
  React.useEffect(() => {
    if (currentIncident && hasActivity && !isPaused) {
      const pauseReason = `Incidente: ${currentIncident.type} - ${currentIncident.description}`;
      onPause(pauseReason);
    }
  }, [currentIncident, hasActivity, isPaused, onPause]);

  function getTotalPauseTime() {
    if (!ongoingActivity?.pauseHistory) return 0;
    return ongoingActivity.pauseHistory.reduce((total: number, pause: any) => {
      if (pause.end) {
        return total + (new Date(pause.end).getTime() - new Date(pause.start).getTime());
      }
      return total;
    }, 0);
  }

  function getElapsed() {
    if (!ongoingActivity?.actualStart) return 0;
    const start = new Date(ongoingActivity.actualStart).getTime();
    const totalPauseTime = getTotalPauseTime();
    
    if (isPaused && pauseStart) {
      
      return accumulated;
    }
    
    return currentTime - start - totalPauseTime;  }

  return (
    <View style={styles.container}>
      
      {ongoingActivity && (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%', marginBottom: 10 }}>
            <Text style={{ fontSize: 14, color: '#8A94A6', fontWeight: '400', marginBottom: 10, textAlign: 'center' }}>Actividad en curso</Text>
          </View>
          <View style={styles.iconCircleBox}>
            {(() => {
              const type = ongoingActivity.type;
              if (type === 'movilizacion' || type === 'movilización') {
                return <MaterialCommunityIcons name="car" size={36} color="#aa74f0" />;
              }
              const found = activityTypes.find((t) => t.type === type);
              if (found && found.icon) {
                return <MaterialCommunityIcons name={found.icon as any} size={36} color="#aa74f0" />;
              }
              return <Ionicons name="briefcase-outline" size={36} color="#aa74f0" />;            })()}
          </View><Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
            {ongoingActivity.description || 
              (ongoingActivity.type && activityTypes.find(t => t.type === ongoingActivity.type)?.label) || 
              ongoingActivity.type || 
              'Actividad en curso'}
          </Text>
          
          {isPaused && pauseStart && (
            <View style={{ alignItems: 'center', marginTop: 4, marginBottom: 8 }}>
             
              <Text style={{
                color: '#f59e0b',
                fontWeight: '700',
                fontSize: 32,
                textAlign: 'center',
                marginBottom: -10,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>En pausa</Text>
              
              <Text style={{
                fontSize: 40, // Increased from 14
                color: '#f59e0b',
                fontWeight: '600',
                textAlign: 'center',
                letterSpacing: 0.5,
                marginTop: 2,
              }}>
                {formatDurationMs(currentTime - (pauseStart || currentTime))}
              </Text>
            </View>
          )}        
          <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '500', textAlign: 'center', marginBottom: 0 }}>
            Tiempo transcurrido
          </Text>
          <Text
            style={{
              fontSize: 20, // Decreased from 36
              color: '#111',
              fontWeight: 'bold',
              textAlign: 'center',
              marginVertical: 10,
              letterSpacing: 2,
            }}
          >
            {formatDurationMs(getElapsed())}
          </Text>
          {activityStartTime && (
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              textAlign: 'center',
              marginTop: 2,
              marginBottom: shouldRequireBladeInspection && !hasCompletedBladeInspection ? 5 : 15,
            }}>
              Iniciada el: {activityStartTime}
            </Text>
          )}        
          {shouldRequireBladeInspection && (
            <View style={styles.bladeInspectionStatus}>
              <View style={styles.bladeInspectionHeader}>
                <Ionicons 
                  name={hasCompletedBladeInspection ? "checkmark-circle" : "nuclear"} 
                  size={16} 
                  color={hasCompletedBladeInspection ? "#10b981" : "#f59e0b"} 
                />
                <Text style={[
                  styles.bladeInspectionText,
                  hasCompletedBladeInspection && styles.bladeInspectionCompleted
                ]}>
                  Inspección de Aspas: {hasCompletedBladeInspection ? 'Completada ✓' : 'Pendiente'}
                </Text>
              </View>
              
              
              {hasCompletedBladeInspection && (
                <View>
                  {bladeInspectionTimingData && bladeInspectionTimingData.length > 0 ? (
                    <View style={styles.bladeTimingContainer}>
                      <Text style={styles.bladeTimingTitle}>Tiempos de Inspección por Aspa:</Text>
                      {bladeInspectionTimingData.map((blade, index) => (
                        <View key={index} style={styles.bladeTimingItem}>
                          <Text style={styles.bladeTimingName}>
                            {blade.bladeName || blade.name || `Aspa ${blade.bladeNumber || (index + 1)}`}
                          </Text>
                          <Text style={styles.bladeTimingTime}>
                            {formatTime(blade.inspectionTime || blade.timeSpent || 0)}
                          </Text>
                        </View>
                      ))}
                      <View style={styles.bladeTimingTotal}>
                        <Text style={styles.bladeTimingTotalText}>
                          Tiempo Total: {formatTime(bladeInspectionTimingData.reduce((sum, blade) => 
                            sum + (blade.inspectionTime || blade.timeSpent || 0), 0))}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.noTimingDataContainer}>
                      <Text style={styles.noTimingDataText}>
                        Inspección completada sin datos de tiempo detallados
                      </Text>
                    </View>
                  )}
                </View>
              )}
              
              {isInspectionPendingAndActionable && (
                <TouchableOpacity 
                  style={styles.bladeInspectionButton}
                  onPress={() => {
                    console.log("Going to blade inspection...");
                    onGoToBladeInspection();
                  }}
                >
                  <Ionicons name="search-outline" size={14} color="#8b5cf6" style={{marginRight: 4}} />
                  <Text style={styles.bladeInspectionButtonText}>Completar Inspección</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <View style={styles.cardActionsRow}>
            {!isPaused && (
              <>
                {isInspectionPendingAndActionable ? (
                  <LinearGradient
                    colors={["#9ca3af", "#6b7280"]} 
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    <TouchableOpacity
                      style={styles.gradientBtnContent}
                      onPress={() => {
                        console.log("Button disabled - inspection required");
                      }}
                      activeOpacity={1}
                    >
                      <Ionicons name="lock-closed-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.buttonText}>Completar Inspección Primero</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                ) : isInspectionRequiredNotActionable ? (
                  <LinearGradient
                    colors={["#9ca3af", "#6b7280"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    <TouchableOpacity
                      style={styles.gradientBtnContent}
                      onPress={() => {}}
                      activeOpacity={1}
                    >
                      <Ionicons name="lock-closed-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.buttonText}>Requiere Inspección</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                ) : (
                  
                  <LinearGradient
                    colors={["#aa74f0", "#e17728"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    <TouchableOpacity
                      style={styles.gradientBtnContent}
                      onPress={() => {
                        console.log("Finishing activity...");
                        handleFinishWithSuggestions();
                      }}
                      activeOpacity={0.9}
                    >
                      <Ionicons name="stop" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.buttonText}>
                        Terminar Actividad
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                )}
              </>
            )}
            {isPaused && (
              <LinearGradient
                colors={["#e17728", "#e7dc29"]} 
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <TouchableOpacity style={styles.gradientBtnContent} onPress={onResume} activeOpacity={0.9}>
                  <Ionicons name="play" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Reanudar</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>
        </>
      )}

      
      {currentIncident && (
        <View style={styles.currentIncidentDisplay}>
          <View style={styles.incidentHeader}>
            <View style={styles.incidentHeaderLeft}>
              <Ionicons name="warning" size={16} color="#ef4444" style={{ marginRight: 4 }} />
              <Text style={styles.incidentTitle}>Incidente</Text>
            </View>
            <TouchableOpacity
              style={styles.stopButtonTopRight}
              onPress={() => {
                handleFinishByBlockingIncident(currentIncident.id);
               
              }}
            >
              <Ionicons 
                name="stop-circle" 
                size={24} 
                color="#dc2626" 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.incidentType} numberOfLines={1} ellipsizeMode="tail">
            {currentIncident.label || currentIncident.type}
          </Text>
          {currentIncident.description && (
            <Text style={[styles.incidentDescription, {flexWrap: 'wrap'}]}>
              {currentIncident.description}
            </Text>
          )}
        </View>
      )}

      {showSuggestions && (
        <View style={styles.suggestionsOverlay}>
          <ActivitySuggestionsCard 
            activities={suggestedActivities}
            onActivitySelect={handleActivitySelect}
            onClose={handleCloseWithoutSelection}
            onGoToPreflightChecklist={(turbineId, activityId) => {
              Alert.alert("Checklist", `Abriendo checklist para turbina ${turbineId} y actividad ${activityId}`);
              setShowSuggestions(false);
            }}
            terminationType={terminationType}
          />
        </View>
      )}
    </View>
  );
}

function formatTime(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatDurationMs(ms: number) {
  if (!ms || ms < 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 12, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  iconCircleBox: {
    backgroundColor: '#f3e8ff', 
    borderRadius: 999,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#aa74f0', 
    textAlign: 'center',
    marginBottom: 8,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 18,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gradientButton: {
    flex: 1,
    borderRadius: 14,
    marginHorizontal: 4,
    marginVertical: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
    currentIncidentDisplay: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    width: '100%',
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  incidentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  incidentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  incidentType: {
    fontSize: 11,
    fontWeight: '500',
    color: '#dc2626',
    marginBottom: 2,
  },
  incidentDescription: {
    fontSize: 11,
    color: '#7f1d1d',
    lineHeight: 14,
  },  stopButtonTopRight: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 4,
  },
  bladeInspectionStatus: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
  },
  bladeInspectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between', // Removed to allow button to be on new line if text is long
    marginBottom: 4,
  },
  bladeInspectionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f59e0b',
    flex: 1,
    marginLeft: 6,
  },
  bladeInspectionCompleted: {
    color: '#10b981',
  },
  bladeInspectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff', // Changed to purple background
    paddingHorizontal: 10, 
    paddingVertical: 6,    
    borderRadius: 6,
    alignSelf: 'flex-start', 
    marginTop: 8, 
  },  
  bladeInspectionButtonText: {
    fontSize: 13, 
    color: '#8b5cf6', // Changed to purple
    fontWeight: '600',
    marginLeft: 4, 
  },
  bladeTimingContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  bladeTimingTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284c7',
    marginBottom: 6,
  },
  bladeTimingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  bladeTimingName: {
    fontSize: 11,
    color: '#0369a1',
    flex: 1,
  },
  bladeTimingTime: {
    fontSize: 11,
    color: '#0369a1',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  bladeTimingTotal: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#bae6fd',
  },
  bladeTimingTotalText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
    textAlign: 'center',
  },
  suggestionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 16,
  },
  noTimingDataContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  noTimingDataText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

