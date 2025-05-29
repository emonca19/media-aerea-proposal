import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Import common types and mocks
import { mockTurbines } from "../../../src/mocks/turbines";
import { ActivityType } from "../../../src/types/common";

// Activity types with icons for the UI
export const activityTypes = [
  { type: "MOBILIZATION" as ActivityType, label: "Movilización", icon: "bus" },
  {
    type: "TURBINE_WORK" as ActivityType,
    label: "Trabajo en Turbina",
    icon: "wind-turbine",
  },
  { type: "TRAVEL" as ActivityType, label: "Traslado entre Turbinas", icon: "car" },
  { type: "LUNCH" as ActivityType, label: "Tiempo de Comida", icon: "food" },
  {
    type: "AWAITING_PERMISSION" as ActivityType,
    label: "Esperando Permisos",
    icon: "clock-time-four",
  },
  { type: "OTHER" as ActivityType, label: "Otro", icon: "dots-horizontal" },
];

// Interfaz para las actividades programadas
interface ScheduledActivity {
  id: string;
  type: ActivityType;
  turbineId?: string;
  notes: string;
  scheduledTime: Date;
}

interface QuickRegisterActivityFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (activityData: any) => void;
}

// Componente para elementos reordenables con botones
interface ReorderableActivityItemProps {
  activity: ScheduledActivity;
  index: number;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  totalItems: number;
}

const ReorderableActivityItem: React.FC<ReorderableActivityItemProps> = ({
  activity,
  index,
  onRemove,
  onMoveUp,
  onMoveDown,
  totalItems,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  
  const activityTypeInfo = activityTypes.find(
    (act) => act.type === activity.type
  );  const turbineInfo = activity.turbineId
    ? mockTurbines.find((t) => t.id === activity.turbineId)
    : undefined;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleMoveUp = () => {
    if (index > 0) {
      animatePress();
      onMoveUp(index);
      // Haptic feedback
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {
          // Haptics not available, continue silently
        }
      }
    }
  };

  const handleMoveDown = () => {
    if (index < totalItems - 1) {
      animatePress();
      onMoveDown(index);
      // Haptic feedback
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {
          // Haptics not available, continue silently
        }
      }
    }
  };

  return (
    <Animated.View style={[styles.scheduledActivityItem, { transform: [{ scale: scaleAnim }] }]}>
      {/* Indicador de orden numérico */}
      <View style={styles.orderIndicator}>
        <Text style={styles.orderNumber}>{index + 1}</Text>
      </View>

      {/* Botones de reorden */}
      <View style={styles.reorderButtons}>
        <TouchableOpacity
          style={[
            styles.reorderButton,
            index === 0 && styles.reorderButtonDisabled,
          ]}
          onPress={handleMoveUp}
          disabled={index === 0}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="chevron-up"
            size={16}
            color={index === 0 ? "#cbd5e1" : "#7c3aed"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.reorderButton,
            index === totalItems - 1 && styles.reorderButtonDisabled,
          ]}
          onPress={handleMoveDown}
          disabled={index === totalItems - 1}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="chevron-down"
            size={16}
            color={index === totalItems - 1 ? "#cbd5e1" : "#7c3aed"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.scheduledActivityContent}>
        <View style={styles.scheduledActivityHeader}>
          <MaterialCommunityIcons
            name={(activityTypeInfo?.icon as any) || "calendar-clock"}
            size={18}
            color="#aa74f0"
          />
          <Text style={styles.scheduledActivityTitle}>
            {activityTypeInfo?.label || "Actividad"}
            {turbineInfo && (
              <Text style={styles.scheduledActivityAsset}>
                {" "}
                • {turbineInfo.name}
              </Text>
            )}
          </Text>
        </View>
      </View>

      {/* Botón para eliminar */}
      <TouchableOpacity
        style={styles.removeActivityButton}
        onPress={() => onRemove(activity.id)}
        accessibilityLabel="Eliminar actividad programada"
        activeOpacity={0.7}
      >
        <Ionicons name="close-circle" size={22} color="#ef4444" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const QuickRegisterActivityForm: React.FC<QuickRegisterActivityFormProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [selectedTurbine, setSelectedTurbine] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isForNow, setIsForNow] = useState(true);
  const [scheduledActivities, setScheduledActivities] = useState<
    ScheduledActivity[]
  >([]);

  // Actualiza el tiempo actual cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Resetea el formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isVisible) {
      setSelectedType(null);
      setSelectedTurbine("");
      setNotes("");
      setIsForNow(true);
      setScheduledActivities([]);
    }
  }, [isVisible]);

  const formatTime = (date: Date | null) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Función para añadir actividad a la lista programada
  const handleAddToScheduledList = () => {
    if (!selectedType) {
      Alert.alert("Error", "Selecciona un tipo de actividad");
      return;
    }

    if (selectedType === "TURBINE_WORK" && !selectedTurbine) {
      Alert.alert("Error", "Selecciona una turbina para esta actividad");
      return;
    }

    const newActivity: ScheduledActivity = {
      id: Date.now().toString(),
      type: selectedType,
      notes: "",
      scheduledTime: new Date(),
      ...(selectedType === "TURBINE_WORK"
        ? { turbineId: selectedTurbine }
        : {}),
    };

    setScheduledActivities([...scheduledActivities, newActivity]);

    // Reset form fields
    setSelectedType(null);
    setSelectedTurbine("");
  };

  // Función para eliminar una actividad de la lista programada
  const handleRemoveScheduledActivity = (id: string) => {
    setScheduledActivities(
      scheduledActivities.filter((activity) => activity.id !== id)
    );
  };

  // Funciones para reordenar actividades con botones
  const moveActivityUp = (index: number) => {
    if (index > 0) {
      const newActivities = [...scheduledActivities];
      [newActivities[index - 1], newActivities[index]] = [
        newActivities[index],
        newActivities[index - 1],
      ];
      setScheduledActivities(newActivities);
    }
  };

  const moveActivityDown = (index: number) => {
    if (index < scheduledActivities.length - 1) {
      const newActivities = [...scheduledActivities];
      [newActivities[index], newActivities[index + 1]] = [
        newActivities[index + 1],
        newActivities[index],
      ];
      setScheduledActivities(newActivities);
    }
  };

  const handleSubmit = () => {
    // Si hay actividades programadas, enviarlas todas
    if (!isForNow && scheduledActivities.length > 0) {
      const baseTime = new Date();
      baseTime.setHours(baseTime.getHours() + 1);

      const activitiesData = scheduledActivities.map((act, index) => {
        const scheduledTime = new Date(baseTime);
        scheduledTime.setMinutes(scheduledTime.getMinutes() + index * 30);

        return {
          type: act.type,
          turbineId: act.turbineId,
          notes: act.notes,
          isForNow: false,
          scheduledTime: scheduledTime,
        };
      });

      onSubmit({
        isMultiple: true,
        activities: activitiesData,
      });
      onClose();
      return;
    }

    // Para actividad inmediata
    if (isForNow) {
      if (!selectedType) {
        Alert.alert("Error", "Selecciona un tipo de actividad");
        return;
      }
      if (selectedType === "TURBINE_WORK" && !selectedTurbine) {
        Alert.alert("Error", "Selecciona una turbina");
        return;
      }

      // Validación especial para trabajo en turbina
      if (selectedType === "TURBINE_WORK" && selectedTurbine && isForNow) {
        Alert.alert(
          "Checklist Prevuelo Requerido",
          "Para trabajar en una turbina, primero debes completar el checklist de prevuelo. ¿Deseas ir al checklist ahora?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Ir al Checklist",
              onPress: () => {
                onClose();
                router.push(
                  `/pilot/preflight-checklist?turbineId=${selectedTurbine}`
                );
              },
            },
          ]
        );
        return;
      }

      const activityData = {
        type: selectedType,
        turbineId:
          selectedType === "TURBINE_WORK" ? selectedTurbine : undefined,
        notes: notes,
        isForNow: true,
        startTime: new Date(),
      };
      onSubmit(activityData);
      onClose();
    } else {
      Alert.alert(
        "Sin Actividades",
        "Añade al menos una actividad a la lista o cambia a 'Para ahora'."
      );
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.closeButtonContainer}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={36} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.headerTitle}>Registrar Actividad</Text>

            <Text style={styles.currentTimeDisplay}>
              {currentTime.toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              {" - "}
              {formatTime(currentTime)}
            </Text>

            <Text style={styles.subtitle}>Tipo de Actividad</Text>
            <View style={styles.typeSelection}>
              {activityTypes.map(({ type, label, icon }) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeCard,
                    selectedType === type && styles.typeCardSelected,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <MaterialCommunityIcons
                    name={icon as any}
                    size={24}
                    color={selectedType === type ? "#ffffff" : "#7c3aed"}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      selectedType === type && styles.typeLabelSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedType === "TURBINE_WORK" && (
              <View style={styles.turbineSelection}>
                <Text style={styles.subtitle}>Selecciona Turbina</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.turbineScroll}
                >
                  {mockTurbines.map((turbine) => (
                    <TouchableOpacity
                      key={turbine.id}
                      style={[
                        styles.turbineCard,
                        selectedTurbine === turbine.id &&
                          styles.turbineCardSelected,
                      ]}
                      onPress={() => setSelectedTurbine(turbine.id)}
                    >
                      <Ionicons
                        name="cog"
                        size={24}
                        color={
                          selectedTurbine === turbine.id ? "#ffffff" : "#7c3aed"
                        }
                      />
                      <Text
                        style={[
                          styles.turbineName,
                          selectedTurbine === turbine.id &&
                            styles.turbineNameSelected,
                        ]}
                      >
                        {turbine.name}
                      </Text>
                      <Text
                        style={[
                          styles.turbineStatus,
                          selectedTurbine === turbine.id &&
                            styles.turbineStatusSelected,
                        ]}                      >
                        {turbine.status === "APPROVED"
                          ? "Completada"
                          : turbine.status === "INSPECTED" ||
                            turbine.status === "PHOTOS_UPLOADED" ||
                            turbine.status === "PHOTOS_REJECTED"
                          ? "En Progreso"
                          : "Pendiente"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginVertical: 12,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.timeOptionButton,
                  isForNow && styles.timeOptionButtonSelected,
                ]}
                onPress={() => setIsForNow(true)}
              >
                <Ionicons
                  name="flash"
                  size={18}
                  color={isForNow ? "#ffffff" : "#7c3aed"}
                />
                <Text
                  style={[
                    styles.timeOptionText,
                    isForNow && styles.timeOptionTextSelected,
                  ]}
                >
                  Para ahora
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timeOptionButton,
                  !isForNow && styles.timeOptionButtonLater,
                ]}
                onPress={() => setIsForNow(false)}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={!isForNow ? "#ffffff" : "#e17728"}
                />
                <Text
                  style={[
                    styles.timeOptionTextLater,
                    !isForNow && styles.timeOptionTextLaterSelected,
                  ]}
                >
                  Para más tarde
                </Text>
              </TouchableOpacity>
            </View>

            {isForNow && (
              <View style={styles.notesSection}>
                <Text style={styles.subtitle}>Notas (Opcional)</Text>
                <TextInput
                  style={styles.notesInput}
                  multiline
                  placeholder="Describe los detalles de la actividad..."
                  placeholderTextColor="#94a3b8"
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>
            )}

            {!isForNow && (
              <View style={styles.addButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.addToListButton,
                    !selectedType && { opacity: 0.7 },
                  ]}
                  onPress={handleAddToScheduledList}
                  disabled={!selectedType}
                >
                  <View style={styles.addButtonContent}>
                    <View style={styles.addButtonIconContainer}>
                      <Ionicons name="add" size={24} color="#fff" />
                    </View>
                    <Text style={styles.addToListButtonText}>
                      Añadir a Lista
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {!isForNow && scheduledActivities.length > 0 && (
              <View style={styles.scheduledListContainer}>
                <Text style={styles.subtitle}>
                  Actividades Programadas ({scheduledActivities.length})
                </Text>
                <Text style={styles.reorderInstructions}>
                  Usa las flechas para reordenar las actividades
                </Text>
                <View style={styles.scheduledList}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {scheduledActivities.map((activity, index) => {
                      if (!activity || !activity.type) return null;

                      return (
                        <ReorderableActivityItem
                          key={activity.id}
                          activity={activity}
                          index={index}
                          onRemove={handleRemoveScheduledActivity}
                          onMoveUp={moveActivityUp}
                          onMoveDown={moveActivityDown}
                          totalItems={scheduledActivities.length}
                        />
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSubmit}
            >
              <Text style={styles.actionButtonText}>
                {isForNow
                  ? selectedType === "TURBINE_WORK" && selectedTurbine
                    ? `Iniciar en ${
                        mockTurbines.find((t) => t.id === selectedTurbine)?.name
                      }`
                    : "Iniciar Actividad"
                  : scheduledActivities.length > 0
                  ? `Guardar ${scheduledActivities.length} Actividades`
                  : "Programar Actividad"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },  modalContent: {
    backgroundColor: "white",
    borderRadius: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  closeButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    paddingRight: 10,
    paddingTop: 10,
    marginBottom: 0,
  },
  closeButton: {
    padding: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#aa74f0", // Changed from "#1e3a8a"
    marginBottom: 10,
    marginTop: 5,
    textAlign: "center",
  },
  currentTimeDisplay: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 15,
    marginTop: 0,
    textAlign: "center",
  },
  subtitle: {
    color: "#aa74f0", // Changed from "#374151"
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 8,
  },
  typeSelection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  typeCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 80,
    marginBottom: 10,
  },
  typeCardSelected: {
    backgroundColor: "#8b5cf6",
    borderColor: "#7c3aed",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.3,
    elevation: 5,
  },
  typeLabel: {
    color: "#6b46c1",
    fontWeight: "500",
    textAlign: "center",
    fontSize: 13,
  },
  typeLabelSelected: {
    color: "#ffffff",
  },
  turbineSelection: {
    marginBottom: 15,
  },
  turbineScroll: {
    gap: 10,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  turbineCard: {
    width: 110,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 90,
  },
  turbineCardSelected: {
    backgroundColor: "#8b5cf6",
    borderColor: "#7c3aed",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.3,
    elevation: 5,
  },
  turbineName: {
    color: "#6b46c1",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  turbineNameSelected: {
    color: "#ffffff",
  },
  turbineStatus: {
    color: "#64748b",
    fontSize: 10,
    textAlign: "center",
    textTransform: "uppercase",
    marginTop: 2,
  },
  turbineStatusSelected: {
    color: "#ffffff",
    opacity: 0.85,
  },
  notesSection: {
    marginBottom: 15,
  },
  notesInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    color: "#1e3a8a",
    fontSize: 14,
  },
  addButtonContainer: {
    alignItems: "center",
    marginVertical: 16,
  },  addToListButton: {
    backgroundColor: "#f59e0b",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 0,
    marginBottom: 0,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonIconContainer: {
    marginRight: 8,
  },
  addToListButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  scheduledListContainer: {
    marginTop: 2,
    marginBottom: 15,
  },  reorderInstructions: {
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
    backgroundColor: "#f3f0ff",
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#8b5cf6",
  },
  scheduledList: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  scheduledActivityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  reorderButtons: {
    flexDirection: "column",
    marginRight: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  reorderButton: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 4,
    marginVertical: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 24,
    minHeight: 24,
  },
  reorderButtonDisabled: {
    opacity: 0.4,
    backgroundColor: "#f1f5f9",
  },
  scheduledActivityContent: {
    flex: 1,
    marginRight: 10,
  },
  scheduledActivityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  scheduledActivityTitle: {
    color: "#aa74f0", // Changed from "#1e3a8a"
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  scheduledActivityAsset: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "500",
  },  removeActivityButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  actionButton: {
    backgroundColor: "#8b5cf6",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 15,
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  timeOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#8b5cf6",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    backgroundColor: "#ffffff",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeOptionButtonSelected: {
    backgroundColor: "#8b5cf6",
    borderColor: "#7c3aed",
    shadowOpacity: 0.3,
    elevation: 4,
  },
  timeOptionButtonLater: {
    backgroundColor: "#f59e0b",
    borderColor: "#e17728",
    shadowColor: "#f59e0b",
    shadowOpacity: 0.3,
    elevation: 4,
  },
  timeOptionText: {
    marginLeft: 6,
    color: "#6b46c1",
    fontWeight: "600",
    fontSize: 14,
  },
  timeOptionTextSelected: {
    color: "#ffffff",
  },
  timeOptionTextLater: {
    marginLeft: 6,
    color: "#e17728",
    fontWeight: "600",
    fontSize: 14,
  },
  timeOptionTextLaterSelected: {
    color: "#ffffff",
  },  orderIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  orderNumber: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
});

export default QuickRegisterActivityForm;
