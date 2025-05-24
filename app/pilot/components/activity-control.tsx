import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { activityTypes } from './quick-register-activity-form';

interface Pause {
  reason: string;
  start: string;
  end?: string;
}

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
  { label: "Revisión técnica", icon: "tools", color: "#f87171" },
  { label: "Otro", icon: "dots-horizontal", color: "#64748b" },
];

function getActivityIcon(type: string) {
  const found = activityTypes.find((t) => t.type === type);
  if (found && found.icon) {
    return <MaterialCommunityIcons name={found.icon as any} size={32} color="#2563eb" style={{ marginRight: 10 }} />;
  }
  return <Ionicons name="briefcase-outline" size={32} color="#2563eb" style={{ marginRight: 10 }} />;
}

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
  const [now, setNow] = useState(Date.now());
  const [pauseStart, setPauseStart] = useState<number | null>(null);

  // Real-time timer update
  React.useEffect(() => {
    if (!ongoingActivity || !ongoingActivity.actualStart) return;
    if (isPaused) {
      // Pausa: inicia contador de pausa
      setPauseStart(Date.now());
    } else {
      setPauseStart(null);
    }
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [ongoingActivity && ongoingActivity.actualStart, isPaused]);

  // Compacto y visual, con icono, nombre, tiempo y botones grandes
  return (
    <View style={styles.compactModernContainer}>
      {!ongoingActivity ? (
        <TouchableOpacity style={styles.compactStartButton} onPress={onStart}>
          <Ionicons name="play" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.compactStartButtonText}>Iniciar Jornada</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.compactModernActiveBox}>
          <View style={styles.compactModernHeaderRow}>
            <View style={styles.compactModernIconBox}>{getActivityIcon(ongoingActivity.type)}</View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.compactModernTitle} numberOfLines={1}>{ongoingActivity.name || "Actividad en curso"}</Text>
              {isPaused && (
                <Text style={styles.compactModernPausedText}>Pausada: {currentPauseReason}</Text>
              )}
            </View>
          </View>
          <View style={styles.compactModernTimerBox}>
            <Text style={styles.compactModernTimeLabel}>{isPaused ? "Tiempo en pausa" : "Total trabajado hoy"}</Text>
            <View style={styles.compactModernTimerBg}>
              <Text style={isPaused ? styles.compactModernPausedTimer : styles.compactModernTimer}>
                {isPaused && pauseStart
                  ? formatDuration(new Date(pauseStart).toISOString(), undefined, now)
                  : formatDuration(ongoingActivity.actualStart, undefined, now)}
              </Text>
            </View>
          </View>
          <View style={styles.compactModernActionsRow}>
            {!isPaused && (
              <>
                <TouchableOpacity style={styles.compactModernActionBtn} onPress={onFinish}>
                  <Ionicons name="stop" size={20} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.compactModernActionLabel}>Terminar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.compactModernActionBtn} onPress={() => setPauseModalVisible(true)}>
                  <Ionicons name="pause" size={20} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.compactModernActionLabel}>Pausar</Text>
                </TouchableOpacity>
              </>
            )}
            {isPaused && (
              <TouchableOpacity style={styles.compactModernActionBtn} onPress={onResume}>
                <Ionicons name="play" size={20} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.compactModernActionLabel}>Reanudar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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

function formatDuration(start: string | undefined, end?: string, nowOverride?: number) {
  if (!start) return '00:00:00';
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : (nowOverride ? new Date(nowOverride) : new Date());
  const diff = Math.max(0, endDate.getTime() - startDate.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
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
});
