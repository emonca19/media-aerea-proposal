import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  onToggleIncidentBlocking?: (incidentId: string, isBlocking: boolean) => void;
  onFinishActivityByBlockingIncident?: (incidentId: string) => void;
  // New props for blade inspection
  requiresBladeInspection?: boolean;
  hasCompletedBladeInspection?: boolean;
  onGoToBladeInspection?: () => void;
  bladeInspectionTimingData?: any[]; // New prop for timing data
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
  onToggleIncidentBlocking,
  onFinishActivityByBlockingIncident,
  requiresBladeInspection = false,
  hasCompletedBladeInspection = false,
  onGoToBladeInspection,
  bladeInspectionTimingData
}: ActivityControlProps) {
  const [pauseStart, setPauseStart] = useState<number | null>(null);
  const [accumulated, setAccumulated] = useState(0); // tiempo acumulado antes de pausar
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [activityStartTime, setActivityStartTime] = useState<string | null>(null);

  const hasActivity = ongoingActivity && ongoingActivity.actualStart;

  const isInspectionPendingAndActionable = requiresBladeInspection && !hasCompletedBladeInspection && onGoToBladeInspection;
  const isInspectionRequiredNotActionable = requiresBladeInspection && !hasCompletedBladeInspection && !onGoToBladeInspection;


  // Update current time continuously
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  // Maneja el inicio y fin de la pausa
  React.useEffect(() => {
    if (!hasActivity) return;
    if (isPaused && !pauseStart) {
      const now = Date.now();
      setPauseStart(now);
      // Acumula el tiempo trabajado hasta el momento de pausar
      const start = new Date(ongoingActivity.actualStart).getTime();
      const totalPauseTime = ongoingActivity?.pauseHistory?.reduce((total: number, pause: any) => {
        if (pause.end) {
          return total + (new Date(pause.end).getTime() - new Date(pause.start).getTime());
        }
        return total;
      }, 0) || 0;
      setAccumulated(now - start - totalPauseTime);
    } else if (!isPaused && pauseStart) {
      // Al reanudar, resetear pauseStart
      setPauseStart(null);
    }
  }, [isPaused, hasActivity, ongoingActivity, pauseStart]);

  React.useEffect(() => {
    if (ongoingActivity && ongoingActivity.actualStart) {
      const startDate = new Date(ongoingActivity.actualStart);
      // Format date as DD/MM/YYYY, HH:MM
      const formattedStartDate = startDate.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      setActivityStartTime(formattedStartDate);
    } else {
      setActivityStartTime(null); // Clear if no activity or start date
    }
  }, [ongoingActivity]); // Re-run when ongoingActivity changes

  // Automatically pause activity when an incident is reported
  React.useEffect(() => {
    if (currentIncident && hasActivity && !isPaused) {
      // Create pause reason from incident information
      const pauseReason = `Incidente: ${currentIncident.type} - ${currentIncident.description}`;
      onPause(pauseReason);
    }
  }, [currentIncident, hasActivity, isPaused, onPause]);

  // Calculate total pause time from all pauses
  function getTotalPauseTime() {
    if (!ongoingActivity?.pauseHistory) return 0;
    return ongoingActivity.pauseHistory.reduce((total: number, pause: any) => {
      if (pause.end) {
        return total + (new Date(pause.end).getTime() - new Date(pause.start).getTime());
      }
      return total;
    }, 0);
  }

  // Calcula el tiempo mostrado
  function getElapsed() {
    if (!ongoingActivity?.actualStart) return 0;
    const start = new Date(ongoingActivity.actualStart).getTime();
    const totalPauseTime = getTotalPauseTime();
    
    if (isPaused && pauseStart) {
      // Durante la pausa, mostrar el tiempo acumulado hasta el momento de pausar
      return accumulated;
    }
    
    // Tiempo total transcurrido menos las pausas
    return currentTime - start - totalPauseTime;  }

  // Compacto y visual, con icono, nombre, tiempo y botones grandes
  return (
    <View style={styles.container}>
      {/* Removed "iniciar jornada" button as requested */}
      {ongoingActivity && (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%', marginBottom: 10 }}>
            <Text style={{ fontSize: 14, color: '#8A94A6', fontWeight: '400', marginBottom: 10, textAlign: 'center' }}>Actividad en curso</Text>
          </View>
          <View style={styles.iconCircleBox}>
            {(() => {
              const type = ongoingActivity.type;
              if (type === 'movilizacion' || type === 'movilización') {
                return <MaterialCommunityIcons name="car" size={36} color="#4F6DF5" />;
              }
              const found = activityTypes.find((t) => t.type === type);
              if (found && found.icon) {
                return <MaterialCommunityIcons name={found.icon as any} size={36} color="#4F6DF5" />;
              }
              return <Ionicons name="briefcase-outline" size={36} color="#4F6DF5" />;            })()}
          </View>
          <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
            {ongoingActivity.description || ongoingActivity.type || 'Actividad en curso'}
          </Text>
          {/* Si está en pausa, mostrar información de pausa debajo con texto más pequeño */}
          {isPaused && pauseStart && (
            <View style={{ alignItems: 'center', marginTop: 4, marginBottom: 8 }}>
              {/* En pausa grande y contador que avanza */}
              <Text style={{
                color: '#f59e0b',
                fontWeight: '700',
                fontSize: 32,
                textAlign: 'center',
                marginBottom: 2,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>En pausa</Text>
              {/* Tiempo trabajado antes de la pausa, pequeño y ESTÁTICO */}
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
          )}          {/* Nueva etiqueta y contador principal de actividad, ahora debajo de la pausa */}
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
              marginTop: 2, // Adjust as needed for spacing
              marginBottom: 5, // Add some space before the pause info
            }}>
              Iniciada el: {activityStartTime}
            </Text>
          )}          {/* Blade inspection status for turbine activities */}
          {requiresBladeInspection && (
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
                  Inspección de Aspas: {hasCompletedBladeInspection ? 'Completada' : 'Pendiente'}
                </Text>
              </View>
              
              {/* Show blade timing data if available */}
              {hasCompletedBladeInspection && bladeInspectionTimingData && bladeInspectionTimingData.length > 0 && (
                <View style={styles.bladeTimingContainer}>
                  <Text style={styles.bladeTimingTitle}>Tiempos de Inspección:</Text>
                  {bladeInspectionTimingData.map((blade, index) => (
                    <View key={index} style={styles.bladeTimingItem}>
                      <Text style={styles.bladeTimingName}>{blade.bladeName || `Aspa ${blade.bladeNumber}`}</Text>
                      <Text style={styles.bladeTimingTime}>
                        {Math.floor(blade.inspectionTime / 60)}:{(blade.inspectionTime % 60).toString().padStart(2, '0')}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.bladeTimingTotal}>
                    <Text style={styles.bladeTimingTotalText}>
                      Total: {Math.floor(bladeInspectionTimingData.reduce((sum, blade) => sum + blade.inspectionTime, 0) / 60)}:
                      {(bladeInspectionTimingData.reduce((sum, blade) => sum + blade.inspectionTime, 0) % 60).toString().padStart(2, '0')}
                    </Text>
                  </View>
                </View>
              )}
              
              {isInspectionPendingAndActionable && (
                <TouchableOpacity 
                  style={styles.bladeInspectionButton}
                  onPress={onGoToBladeInspection}
                >
                  <Ionicons name="search-outline" size={14} color="#8b5cf6" style={{marginRight: 4}} />
                  <Text style={styles.bladeInspectionButtonText}>Inspeccionar Aspas</Text>
                </TouchableOpacity>
              )}
            </View>
          )}{/* Botón principal: Terminar o Reanudar */}
          <View style={styles.cardActionsRow}>
            {!isPaused && (
              <>
                {isInspectionPendingAndActionable ? (
                  // Only the disabled "Terminar" button.
                  // The "Completar Inspección" button is removed from this row.
                  // The onGoToBladeInspection prop would need to be triggered by another UI element if desired.
                  <LinearGradient
                    colors={["#9ca3af", "#6b7280"]} // Grey gradient
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    <TouchableOpacity
                      style={styles.gradientBtnContent}
                      onPress={() => Alert.alert("Inspección Requerida", "Debe completar la inspección de aspas para terminar la actividad.")}
                      activeOpacity={1} // Less feedback for disabled appearance
                    >
                      <Ionicons name="lock-closed-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.buttonText}>Requiere Inspección</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                ) : isInspectionRequiredNotActionable ? (
                  // Case: Inspection is required, but no onGoToBladeInspection prop is provided.
                  // Show only the disabled "Terminar" button.
                  <LinearGradient
                    colors={["#9ca3af", "#6b7280"]} // Grey gradient
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    <TouchableOpacity
                      style={styles.gradientBtnContent}
                      onPress={() => Alert.alert("Inspección Requerida", "La inspección de aspas es necesaria pero la acción para completarla no está disponible.")}
                      activeOpacity={1}
                    >
                      <Ionicons name="lock-closed-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.buttonText}>Requiere Inspección</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                ) : (
                  /* Botón Terminar (Habilitado, Rojo) */
                  /* Covers: No inspection required OR inspection required AND completed. */
                  <LinearGradient
                    colors={["#ff5858", "#f857a6"]} // Red gradient for finish
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    <TouchableOpacity
                      style={styles.gradientBtnContent}
                      onPress={onFinish}
                      activeOpacity={0.9}
                    >
                      <Ionicons name="stop" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.buttonText}>Terminar</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                )}
              </>
            )}
            {isPaused && (
              <LinearGradient
                colors={["#43cea2", "#185a9d"]} // Green gradient for resume
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

      {/* Current incident display when there's an incident */}
      {currentIncident && (
        <View style={styles.currentIncidentDisplay}>
          <View style={styles.incidentHeader}>
            <View style={styles.incidentHeaderLeft}>
              <Ionicons name="warning" size={16} color="#ef4444" style={{ marginRight: 4 }} />
              <Text style={styles.incidentTitle}>Incidente</Text>
            </View>
            {/* Stop button in top right corner */}
            <TouchableOpacity
              style={styles.stopButtonTopRight}
              onPress={() => {
                Alert.alert(
                  "Terminar Actividad por Incidente Bloqueante",
                  "¿Estás seguro de que quieres terminar la actividad debido a este incidente bloqueante? La actividad no se marcará como completada.",
                  [
                    {
                      text: "Cancelar",
                      style: "cancel"
                    },
                    {
                      text: "Terminar Actividad",
                      style: "destructive",
                      onPress: () => {
                        // Llamar función para terminar actividad por incidente bloqueante
                        if (onFinishActivityByBlockingIncident) {
                          onFinishActivityByBlockingIncident(currentIncident.id);
                        }
                      }
                    }
                  ]
                );
              }}            >
              <Ionicons 
                name="stop-circle" 
                size={20} 
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
      )}</View>
  );
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
    marginBottom: 12, // Changed from 20 to 12
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
  smallPauseText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseModalBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 5,
  },
  pauseReasonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 10,
  },
  pauseReasonText: {
    fontSize: 14,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    color: '#1e293b',
  },
  iconCircleBox: {
    backgroundColor: '#E8EDFB',
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
    color: '#4F6DF5',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardMainTimer: {
    fontSize: 38,
    color: '#4F6DF5',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 2,
    letterSpacing: 1,
  },
  pausedTimeBox: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  pausedTimeLabel: {
    fontSize: 16,
    color: '#f59e0b',
    fontWeight: '600',
    marginBottom: 2,
  },
  pausedTimeMain: {
    fontSize: 38,
    color: '#f59e0b',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 18,
    width: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F6DF5',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  warningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
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
  timerGradientCircle: {
    borderRadius: 999,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    width: 160,
    alignSelf: 'center',
    shadowColor: '#4F6DF5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  timerGradientCirclePaused: {
    borderRadius: 999,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    width: 160,
    alignSelf: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  timerShadowWrap: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F6DF5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },  timerShadowWrapPaused: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },  smallPauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  incidentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#f3e8ff', // Changed to purple background
    borderWidth: 1,
    borderColor: '#e9d5ff', // Changed to purple border
    alignSelf: 'center',
  },
  incidentButtonText: {
    fontSize: 13,
    color: '#8b5cf6', // Changed to purple
    fontWeight: '600',
  },  currentIncidentDisplay: {
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
  },incidentTime: {
    fontSize: 12,
    color: '#991b1b',
    fontStyle: 'italic',
  },  blockingControlsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fecaca',
  },
  blockingControlsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f1d1d',
    marginBottom: 12,
  },
  blockingToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
  },
  blockingToggleButtonActive: {
    backgroundColor: '#dc2626',
    borderColor: '#b91c1c',
  },
  blockingToggleTextContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  blockingToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 2,
  },
  blockingToggleTextActive: {
    color: 'white',
  },
  blockingToggleSubtext: {
    fontSize: 12,
    color: '#7f1d1d',
    lineHeight: 16,
  },
  blockingToggleSubtextActive: {
    color: '#fecaca',
  },  confirmPauseBtn: {
    backgroundColor: '#4F6DF5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  confirmPauseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },  blockingToggleButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  blockingToggleButtonSmallActive: {
    backgroundColor: '#dc2626',
    borderColor: '#b91c1c',
  },  blockingToggleTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
  },  blockingToggleTextSmallActive: {
    color: 'white',
  },
  terminateByIncidentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },  terminateByIncidentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
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
});

