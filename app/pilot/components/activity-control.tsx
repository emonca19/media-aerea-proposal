import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { activityTypes } from './quick-register-activity-form';

interface ActivityControlProps {
  ongoingActivity: any | null;
  onStart: () => void;
  onPause: (reason: string) => void;
  onResume: () => void;
  onFinish: () => void;
  isPaused: boolean;
  currentPauseReason?: string;
}

const PAUSE_REASONS = [
  { label: "Esperando permiso", icon: "clock-outline", color: "#f59e0b" },
  { label: "Clima", icon: "weather-partly-cloudy", color: "#38bdf8" },
  { label: "Descanso", icon: "coffee-outline", color: "#a78bfa" },
  { label: "Revisión técnica", icon: "tools", color: "#f87171" },  { label: "Otro", icon: "dots-horizontal", color: "#64748b" },
];

export default function ActivityControl({
  ongoingActivity,
  onStart,
  onPause,
  onResume,
  onFinish,
  isPaused,
  currentPauseReason
}: ActivityControlProps) {
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [pauseReason, setPauseReason] = useState<string>("");
  const [pauseNotes, setPauseNotes] = useState("");
  const [pauseStart, setPauseStart] = useState<number | null>(null);
  const [accumulated, setAccumulated] = useState(0); // tiempo acumulado antes de pausar
  const [currentTime, setCurrentTime] = useState(Date.now());

  const hasActivity = ongoingActivity && ongoingActivity.actualStart;

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
    return currentTime - start - totalPauseTime;
  }
  // Formato de fecha y hora
  function formatDateTime(date: Date) {
    return date.toLocaleDateString('es-MX', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) +
      ' ' + date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

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
              return <Ionicons name="briefcase-outline" size={36} color="#4F6DF5" />;
            })()}
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {ongoingActivity.description || ongoingActivity.type || 'Actividad en curso'}
          </Text>
          {/* Nueva etiqueta y contador principal de actividad */}
          <Text style={{ color: '#64748b', fontSize: 15, fontWeight: '500', textAlign: 'center', marginBottom: 0 }}>
            Tiempo transcurrido
          </Text>          <Text
            style={{
              fontSize: 48,
              color: '#111',
              fontWeight: 'bold',
              textAlign: 'center',
              marginVertical: 10,
              letterSpacing: 2,
            }}
          >
            {formatDurationMs(getElapsed())}
          </Text>
          {/* Mostrar fecha/hora de inicio de la actividad si existe */}
          {ongoingActivity.actualStart && (
            <Text style={{ color: '#8A94A6', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>
              Inicio: {formatDateTime(new Date(ongoingActivity.actualStart))}
            </Text>
          )}          {/* Si está en pausa, mostrar información de pausa debajo con texto más pequeño */}
          {isPaused && pauseStart && (
            <View style={{ alignItems: 'center', marginTop: 4, marginBottom: 8 }}>
              <Text style={{
                color: '#f59e0b',
                fontWeight: '500',
                fontSize: 12,
                textAlign: 'center',
                marginBottom: 2,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>En pausa</Text>
              <Text style={{
                fontSize: 16,
                color: '#f59e0b',
                fontWeight: '600',
                textAlign: 'center',
                letterSpacing: 0.5,
              }}>
                {formatDurationMs(currentTime - pauseStart)}
              </Text>
              {currentPauseReason && (
                <Text style={{
                  fontSize: 11,
                  color: '#9ca3af',
                  textAlign: 'center',
                  marginTop: 2,
                  fontStyle: 'italic',
                }}>
                  Motivo: {currentPauseReason}
                </Text>
              )}
            </View>
          )}          {/* Botón principal: Terminar o Reanudar */}
          <View style={styles.cardActionsRow}>
            {!isPaused && (
              <LinearGradient
                colors={["#ff5858", "#f857a6"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <TouchableOpacity style={styles.gradientBtnContent} onPress={onFinish} activeOpacity={0.9}>
                  <Ionicons name="stop" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Terminar</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
            {isPaused && (
              <LinearGradient
                colors={["#43cea2", "#185a9d"]}
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
          
          {/* Botón de pausa pequeño debajo */}
          {!isPaused && (
            <TouchableOpacity 
              style={styles.smallPauseButton} 
              onPress={() => setPauseModalVisible(true)} 
              activeOpacity={0.7}
            >
              <Ionicons name="pause" size={12} color="#9ca3af" style={{ marginRight: 4 }} />
              <Text style={styles.smallPauseText}>Pausar actividad</Text>
            </TouchableOpacity>
          )}
        </>
      )}
      <Modal visible={pauseModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.pauseModalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Motivo de la pausa</Text>
              <TouchableOpacity onPress={() => setPauseModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ width: '100%' }}>
              {PAUSE_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.label}
                  style={[
                    styles.pauseReasonBtn,
                    { backgroundColor: pauseReason === reason.label ? reason.color : '#f3f4f6', borderColor: reason.color },
                  ]}
                  onPress={() => setPauseReason(reason.label)}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name={reason.icon as any} size={22} color={pauseReason === reason.label ? '#fff' : reason.color} style={{ marginRight: 12 }} />
                  <Text style={[
                    styles.pauseReasonText,
                    { color: pauseReason === reason.label ? '#fff' : '#1e293b', fontWeight: pauseReason === reason.label ? 'bold' : '500' }
                  ]}>{reason.label}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.notesLabel}>Notas adicionales (opcional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Describe detalles de la pausa..."
                placeholderTextColor="#94a3b8"
                value={pauseNotes}
                onChangeText={setPauseNotes}
                multiline
              />
            </ScrollView>
            <TouchableOpacity
              style={[styles.confirmPauseBtn, !pauseReason && { opacity: 0.5 }]}
              disabled={!pauseReason}
              onPress={() => {
                setPauseModalVisible(false);
                onPause(pauseReason + (pauseNotes ? `: ${pauseNotes}` : ""));
                setPauseReason("");
                setPauseNotes("");
              }}
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.confirmPauseText}>Confirmar Pausa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function formatDurationMs(ms: number) {
  if (!ms || ms < 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  activeBox: {
    alignItems: 'center',
    width: '100%',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginRight: 8,
  },
  pauseButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  finishButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  pausedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pausedText: {
    color: '#f59e0b',
    fontWeight: '600',
    marginRight: 12,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  resumeButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseModalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: 340,
    maxHeight: 480,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  closeButton: {
    padding: 6,
  },
  pauseReasonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 10,
    marginHorizontal: 2,
  },
  pauseReasonText: {
    fontSize: 16,
  },
  reasonButtonSelected: {
    backgroundColor: '#e0e7ff',
  },
  reasonText: {
    fontSize: 16,
    color: '#374151',
  },
  reasonTextSelected: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  notesLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 18,
    marginBottom: 4,
    fontWeight: '500',
  },
  notesInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    marginBottom: 10,
  },
  confirmPauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    marginTop: 10,
  },
  confirmPauseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  compactContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  compactActiveBox: {
    width: '100%',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactActivityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  compactTimeLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  compactTimer: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 2,
  },
  compactPausedTimer: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 2,
  },
  compactActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 2,
  },
  compactActionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 10,
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  compactActionLabel: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  compactPausedText: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  compactFinishBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 10,
    marginHorizontal: 4,
    paddingVertical: 10,
  },
  compactPauseBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    marginHorizontal: 4,
    paddingVertical: 10,
  },
  compactResumeBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 10,
    marginHorizontal: 4,
    paddingVertical: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 10,
  },
  iconBox: {
    backgroundColor: '#e0e7ff',
    borderRadius: 10,
    padding: 8,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBox: {
    alignItems: 'center',
    marginVertical: 8,
  },
  flatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1.5,
  },
  flatBtnPrimary: {
    backgroundColor: '#fff',
    borderColor: '#2563eb',
  },
  flatBtnSecondary: {
    backgroundColor: '#f8fafc',
    borderColor: '#64748b',
  },
  flatBtnTextPrimary: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 15,
  },
  flatBtnTextSecondary: {
    color: '#64748b',
    fontWeight: 'bold',
    fontSize: 15,
  },
  verticalContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  verticalActiveBox: {
    width: '100%',
    alignItems: 'center',
  },
  bigActivityTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 6,
  },
  bigPausedText: {
    color: '#f59e0b',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  bigIconBox: {
    backgroundColor: '#e0e7ff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigTimerBox: {
    alignItems: 'center',
    marginVertical: 16,
  },
  bigTimeLabel: {
    fontSize: 17,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  timerShadowBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 32,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 2,
  },
  bigTimer: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#2563eb',
    letterSpacing: 2,
    textAlign: 'center',
  },
  bigPausedTimer: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#f59e0b',
    letterSpacing: 2,
    textAlign: 'center',
  },
  bigActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    width: '100%',
    gap: 18,
  },
  bigActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 18,
    marginHorizontal: 6,
    marginBottom: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  bigActionLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  bigStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 22,
    paddingHorizontal: 38,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  bigStartButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  compactModernContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  compactModernActiveBox: {
    width: '100%',
  },
  compactModernHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactModernIconBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactModernTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  compactModernPausedText: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  compactModernTimerBox: {
    alignItems: 'center',
    marginVertical: 8,
  },
  compactModernTimeLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  compactModernTimerBg: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 24,
    marginTop: 2,
    minWidth: 120,
  },
  compactModernTimer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    letterSpacing: 1,
  },
  compactModernPausedTimer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f59e0b',
    textAlign: 'center',
    letterSpacing: 1,
  },
  compactModernActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  compactModernActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 2,
  },
  compactModernActionLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  compactStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignSelf: 'center',
  },
  compactStartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bigBlackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    margin: 6,
    minHeight: 56,
    minWidth: 0,
    flex: 1,
  },
  bigBlackButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  bigTimerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    letterSpacing: 1,
    marginVertical: 2,
  },
  bigPausedTimerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f59e0b',
    textAlign: 'center',
    letterSpacing: 1,
    marginVertical: 2,
  },
  cardContainer: {
    backgroundColor: '#F4F7FF',
    borderRadius: 22,
    padding: 24,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
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
  },
  smallPauseButton: {
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
  smallPauseText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
});
