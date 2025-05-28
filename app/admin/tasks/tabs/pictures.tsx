import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { mockPhotoSubmissions } from "../../../../src/mocks/index";
import { mockTurbines } from "../../../../src/mocks/turbines";
import { PhotoSubmissionStatus } from "../../../../src/types/common";
import {
  PhotoSubmission,
  PhotoSubmissionReview,
} from "../../../../src/types/pictures";

export default function PicturesReviewScreen() {
  const [submissions, setSubmissions] =
    useState<PhotoSubmission[]>(mockPhotoSubmissions);
  const [selectedSubmission, setSelectedSubmission] =
    useState<PhotoSubmission | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  // New evaluation metrics state
  const [bladeRectitude, setBladeRectitude] = useState<
    "aceptable" | "posibles_problemas" | "errores_procesamiento" | undefined
  >(undefined);
  const [captureDistance, setCaptureDistance] = useState<
    "aceptable" | "posibles_conflictos" | undefined
  >(undefined);
  const [exposure, setExposure] = useState<
    "buena" | "muy_oscura" | "muy_brillante" | undefined
  >(undefined);
  const [focus, setFocus] = useState<
    "bueno" | "regular" | "deficiente" | undefined
  >(undefined);
  const [bladePosition, setBladePosition] = useState<
    "correcta" | "parcialmente_correcta" | "incorrecta" | undefined
  >(undefined);

  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "PENDING_REVIEW" | "APPROVED" | "REJECTED"
  >("PENDING_REVIEW");

  // Helper function to get submission status
  const getSubmissionStatus = (
    submission: PhotoSubmission
  ): PhotoSubmissionStatus => {
    if (!submission.photoSubmissionReview) {
      return "PENDING_REVIEW";
    }
    return submission.photoSubmissionReview.status;
  };

  // Filter submissions based on status
  const filteredSubmissions = submissions.filter((submission) => {
    if (filterStatus === "ALL") return true;
    return getSubmissionStatus(submission) === filterStatus;
  });

  const openDriveLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "No se pudo abrir el enlace de Drive");
    });
  };
  const handleReviewSubmission = (submission: PhotoSubmission) => {
    setSelectedSubmission(submission);
    const review = submission.photoSubmissionReview;
    if (review) {
      setBladeRectitude(review.bladeRectitude);
      setCaptureDistance(review.captureDistance);
      setExposure(review.exposure);
      setFocus(review.focus);
      setBladePosition(review.bladePosition);
    } else {
      // Reset to undefined for new review (unselected state)
      setBladeRectitude(undefined);
      setCaptureDistance(undefined);
      setExposure(undefined);
      setFocus(undefined);
      setBladePosition(undefined);
    }
    setReviewModalVisible(true);
  };
  const handleApproveSubmission = () => {
    if (!selectedSubmission) return;

    // Validate that all evaluation categories are selected
    if (
      !bladeRectitude ||
      !captureDistance ||
      !exposure ||
      !focus ||
      !bladePosition
    ) {
      Alert.alert(
        "Evaluación Incompleta",
        "Debe evaluar todas las categorías antes de aprobar la entrega."
      );
      return;
    }

    const review: PhotoSubmissionReview = {
      status: "APPROVED",
      bladeRectitude: bladeRectitude!,
      captureDistance: captureDistance!,
      exposure: exposure!,
      focus: focus!,
      bladePosition: bladePosition!,
      reviewedBy: "Admin Usuario",
      reviewedAt: new Date(),
    };

    updateSubmissionStatus(selectedSubmission.id, review);
    setReviewModalVisible(false);

    Alert.alert(
      "Entrega Aprobada",
      `La entrega de ${selectedSubmission.pilotName} ha sido aprobada. Se notificará al piloto y al cliente.`,
      [{ text: "OK" }]
    );
  };

  const handleRejectSubmission = () => {
    setReviewModalVisible(false);
    setRejectionModalVisible(true);
  };
  const confirmRejection = () => {
    if (!selectedSubmission || !rejectionReason.trim()) {
      Alert.alert("Error", "Debe proporcionar un motivo de rechazo");
      return;
    }

    // Validate that all evaluation categories are selected
    if (
      !bladeRectitude ||
      !captureDistance ||
      !exposure ||
      !focus ||
      !bladePosition
    ) {
      Alert.alert(
        "Evaluación Incompleta",
        "Debe evaluar todas las categorías antes de rechazar la entrega."
      );
      return;
    }

    const review: PhotoSubmissionReview = {
      status: "REJECTED",
      bladeRectitude: bladeRectitude!,
      captureDistance: captureDistance!,
      exposure: exposure!,
      focus: focus!,
      bladePosition: bladePosition!,
      rejectionReason: rejectionReason.trim(),
      reviewedBy: "Admin Usuario",
      reviewedAt: new Date(),
    };

    updateSubmissionStatus(selectedSubmission.id, review);
    setRejectionModalVisible(false);
    setRejectionReason("");

    Alert.alert(
      "Entrega Rechazada",
      `La entrega de ${selectedSubmission.pilotName} ha sido rechazada. Se notificará al piloto con el motivo especificado.`,
      [{ text: "OK" }]
    );
  };

  const updateSubmissionStatus = (
    submissionId: string,
    review: PhotoSubmissionReview
  ) => {
    setSubmissions((prevSubmissions) =>
      prevSubmissions.map((submission) =>
        submission.id === submissionId
          ? {
              ...submission,
              photoSubmissionReview: review,
              updatedAt: new Date(),
            }
          : submission
      )
    );
  };
  const getStatusColor = (status: PhotoSubmissionStatus) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "#f59e0b";
      case "APPROVED":
        return "#10b981";
      case "REJECTED":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: PhotoSubmissionStatus) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "Pendiente";
      case "APPROVED":
        return "Aprobada";
      case "REJECTED":
        return "Rechazada";
      default:
        return status;
    }
  };
  // Helper function to convert turbine IDs to names
  const getTurbineNames = (turbineIds: string[]): string => {
    const names = turbineIds.map((id) => {
      const turbine = mockTurbines.find((t) => t.id === id);
      return turbine ? turbine.name : id;
    });
    return names.join(", ");
  };

  // Helper functions for new metrics
  const getMetricColor = (metric: string, value: string) => {
    if (metric === "bladeRectitude") {
      if (value === "aceptable") return "#10b981"; // green
      if (value === "posibles_problemas") return "#f59e0b"; // orange
      return "#ef4444"; // red
    }
    if (metric === "captureDistance") {
      if (value === "aceptable") return "#10b981"; // green
      return "#f59e0b"; // orange
    }
    if (metric === "exposure") {
      if (value === "buena") return "#10b981"; // green
      return "#f59e0b"; // orange
    }
    if (metric === "focus") {
      if (value === "bueno") return "#10b981"; // green
      if (value === "regular") return "#f59e0b"; // orange
      return "#ef4444"; // red
    }
    if (metric === "bladePosition") {
      if (value === "correcta") return "#10b981"; // green
      if (value === "parcialmente_correcta") return "#f59e0b"; // orange
      return "#ef4444"; // red
    }
    return "#6b7280";
  };
  const getMetricLabel = (metric: string, value: string) => {
    if (metric === "bladeRectitude") {
      if (value === "aceptable") return "Aceptable";
      if (value === "posibles_problemas") return "Posibles problemas";
      return "Errores de procesamiento";
    }
    if (metric === "captureDistance") {
      if (value === "aceptable") return "Aceptable";
      return "Posibles conflictos";
    }
    if (metric === "exposure") {
      if (value === "buena") return "Buena";
      if (value === "muy_oscura") return "Muy oscura";
      return "Muy brillante";
    }
    if (metric === "focus") {
      if (value === "bueno") return "Bueno";
      if (value === "regular") return "Regular";
      return "Deficiente";
    }
    if (metric === "bladePosition") {
      if (value === "correcta") return "Correcta";
      if (value === "parcialmente_correcta") return "Parcialmente correcta";
      return "Incorrecta";
    }
    return value;
  };
  const getMetricIcon = (metric: string, value: string) => {
    if (metric === "bladeRectitude") {
      if (value === "aceptable") return "checkmark-circle";
      if (value === "posibles_problemas") return "warning";
      return "close-circle";
    }
    if (metric === "captureDistance") {
      if (value === "aceptable") return "checkmark-circle";
      return "warning";
    }
    if (metric === "exposure") {
      if (value === "buena") return "checkmark-circle";
      if (value === "muy_oscura") return "moon";
      return "sunny";
    }
    if (metric === "focus") {
      if (value === "bueno") return "checkmark-circle";
      if (value === "regular") return "warning";
      return "close-circle";
    }
    if (metric === "bladePosition") {
      if (value === "correcta") return "checkmark-circle";
      if (value === "parcialmente_correcta") return "warning";
      return "close-circle";
    }
    return "help-circle";
  };
  const renderSubmissionItem = ({ item }: { item: PhotoSubmission }) => {
    const status = getSubmissionStatus(item);
    const review = item.photoSubmissionReview;

    return (
      <View style={styles.submissionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.pilotInfo}>
            <Text style={styles.pilotName}>{item.pilotName}</Text>
            <Text style={styles.projectName}>{item.projectName}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(status)}</Text>
          </View>
        </View>
        <View style={styles.submissionDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {new Date(item.submissionDate).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <Text> </Text>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="wind-turbine"
              size={16}
              color="#6b7280"
            />
            <Text style={styles.detailText}>
              {item.turbinesInspected.length} turbinas inspeccionadas
            </Text>
          </View>
        </View>
        {/* Indicadores de las nuevas métricas */}
        {review && (
          <View style={styles.qualityIndicators}>
            <View style={styles.indicator}>
              <Text style={styles.indicatorLabel}>Rectitud de la pala</Text>
              <View style={styles.metricContainer}>
                <View
                  style={[
                    styles.metricBadge,
                    {
                      backgroundColor: getMetricColor(
                        "bladeRectitude",
                        review.bladeRectitude
                      ),
                    },
                  ]}
                >
                  <Text style={styles.metricText}>
                    {getMetricLabel("bladeRectitude", review.bladeRectitude)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.indicator}>
              <Text style={styles.indicatorLabel}>Distancia de captura</Text>
              <View style={styles.metricContainer}>
                <View
                  style={[
                    styles.metricBadge,
                    {
                      backgroundColor: getMetricColor(
                        "captureDistance",
                        review.captureDistance
                      ),
                    },
                  ]}
                >
                  <Text style={styles.metricText}>
                    {getMetricLabel("captureDistance", review.captureDistance)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
        {/* Segunda fila de métricas */}
        {review && (
          <View style={styles.qualityIndicators}>
            <View style={styles.indicator}>
              <Text style={styles.indicatorLabel}>Exposición</Text>
              <View style={styles.metricContainer}>
                <View
                  style={[
                    styles.metricBadge,
                    {
                      backgroundColor: getMetricColor(
                        "exposure",
                        review.exposure
                      ),
                    },
                  ]}
                >
                  <Text style={styles.metricText}>
                    {getMetricLabel("exposure", review.exposure)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.indicator}>
              <Text style={styles.indicatorLabel}>Enfoque</Text>
              <View style={styles.metricContainer}>
                <View
                  style={[
                    styles.metricBadge,
                    {
                      backgroundColor: getMetricColor("focus", review.focus),
                    },
                  ]}
                >
                  <Text style={styles.metricText}>
                    {getMetricLabel("focus", review.focus)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
        {/* Tercera fila para posición de la pala */}
        {review && (
          <View
            style={[styles.qualityIndicators, { justifyContent: "flex-start" }]}
          >
            <View style={[styles.indicator, { flex: 0.5 }]}>
              <Text style={styles.indicatorLabel}>
                Posición alrededor de la pala
              </Text>
              <View style={styles.metricContainer}>
                <View
                  style={[
                    styles.metricBadge,
                    {
                      backgroundColor: getMetricColor(
                        "bladePosition",
                        review.bladePosition
                      ),
                    },
                  ]}
                >
                  <Text style={styles.metricText}>
                    {getMetricLabel("bladePosition", review.bladePosition)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
        {/* Razón de rechazo si existe */}
        {review?.rejectionReason && (
          <View style={styles.rejectionContainer}>
            <Text style={styles.rejectionLabel}>Motivo de rechazo:</Text>
            <Text style={styles.rejectionText}>{review.rejectionReason}</Text>
          </View>
        )}
        {/* Información de revisión */}
        {review && (
          <View style={styles.reviewInfo}>
            <Text style={styles.reviewText}>
              Revisado por {review.reviewedBy} el
              {new Date(review.reviewedAt).toLocaleDateString("es-ES")}
            </Text>
          </View>
        )}
        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.driveButton}
            onPress={() => openDriveLink(item.driveLink)}
          >
            <MaterialCommunityIcons
              name="google-drive"
              size={18}
              color="#4285f4"
            />
            <Text style={styles.driveButtonText}>Ver en Drive</Text>
          </TouchableOpacity>

          {status === "PENDING_REVIEW" && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => handleReviewSubmission(item)}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#fff"
              />
              <Text style={styles.reviewButtonText}>Revisar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Fotos",
        }}
      />
      {/* Filtros de estado */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: "PENDING_REVIEW", label: "Pendientes" },
            { key: "APPROVED", label: "Aprobadas" },
            { key: "REJECTED", label: "Rechazadas" },
            { key: "ALL", label: "Todas" },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                filterStatus === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilterStatus(filter.key as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterStatus === filter.key && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Lista de entregas */}
      <FlatList
        data={filteredSubmissions}
        keyExtractor={(item) => item.id}
        renderItem={renderSubmissionItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No hay entregas para mostrar</Text>
          </View>
        }
      />
      {/* Modal de revisión */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Revisar Entrega</Text>
              <TouchableOpacity
                onPress={() => setReviewModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedSubmission && (
                <>
                  {" "}
                  <View style={styles.submissionInfo}>
                    <Text style={styles.infoTitle}>
                      Información de la Entrega
                    </Text>

                    <View style={styles.infoRow}>
                      <Ionicons
                        name="person-circle"
                        size={20}
                        color="#6366f1"
                      />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Piloto</Text>
                        <Text style={styles.infoValue}>
                          {selectedSubmission.pilotName}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="briefcase" size={20} color="#10b981" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Proyecto</Text>
                        <Text style={styles.infoValue}>
                          {selectedSubmission.projectName}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="calendar" size={20} color="#f59e0b" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Fecha de Entrega</Text>
                        <Text style={styles.infoValue}>
                          {new Date(
                            selectedSubmission.submissionDate
                          ).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons
                        name="wind-turbine"
                        size={20}
                        color="#8b5cf6"
                      />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>
                          Turbinas Inspeccionadas
                        </Text>
                        <Text style={styles.infoValue}>
                          {getTurbineNames(
                            selectedSubmission.turbinesInspected
                          )}
                        </Text>
                        <Text style={styles.infoSubtext}>
                          {selectedSubmission.turbinesInspected.length} turbina
                          {selectedSubmission.turbinesInspected.length !== 1
                            ? "s"
                            : ""}{" "}
                          en total
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* Evaluación de Rectitud de la pala */}
                  <View style={styles.evaluationSection}>
                    <Text style={styles.evaluationTitle}>
                      Rectitud de la pala
                    </Text>
                    <View style={styles.metricOptionsContainer}>
                      {[
                        "errores_procesamiento",
                        "posibles_problemas",
                        "aceptable",
                      ].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.metricOption,
                            bladeRectitude === option &&
                              styles.metricOptionSelected,
                            {
                              backgroundColor:
                                bladeRectitude === option
                                  ? getMetricColor("bladeRectitude", option)
                                  : "#ffffff",
                              borderColor:
                                bladeRectitude === option
                                  ? getMetricColor("bladeRectitude", option)
                                  : "#e5e7eb",
                            },
                          ]}
                          onPress={() => setBladeRectitude(option as any)}
                        >
                          <Ionicons
                            name={
                              getMetricIcon("bladeRectitude", option) as any
                            }
                            size={20}
                            color={
                              bladeRectitude === option
                                ? "#fff"
                                : getMetricColor("bladeRectitude", option)
                            }
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  {/* Evaluación de Distancia de captura */}
                  <View style={styles.evaluationSection}>
                    <Text style={styles.evaluationTitle}>
                      Distancia de captura de foto
                    </Text>
                    <View style={styles.metricOptionsContainer}>
                      {["posibles_conflictos", "aceptable"].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.metricOption,
                            captureDistance === option &&
                              styles.metricOptionSelected,
                            {
                              backgroundColor:
                                captureDistance === option
                                  ? getMetricColor("captureDistance", option)
                                  : "#ffffff",
                              borderColor:
                                captureDistance === option
                                  ? getMetricColor("captureDistance", option)
                                  : "#e5e7eb",
                            },
                          ]}
                          onPress={() => setCaptureDistance(option as any)}
                        >
                          <Ionicons
                            name={
                              getMetricIcon("captureDistance", option) as any
                            }
                            size={20}
                            color={
                              captureDistance === option
                                ? "#fff"
                                : getMetricColor("captureDistance", option)
                            }
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  {/* Evaluación de Exposición */}
                  <View style={styles.evaluationSection}>
                    <Text style={styles.evaluationTitle}>Exposición</Text>
                    <View style={styles.metricOptionsContainer}>
                      {["muy_oscura", "muy_brillante", "buena"].map(
                        (option) => (
                          <TouchableOpacity
                            key={option}
                            style={[
                              styles.metricOption,
                              exposure === option &&
                                styles.metricOptionSelected,
                              {
                                backgroundColor:
                                  exposure === option
                                    ? getMetricColor("exposure", option)
                                    : "#ffffff",
                                borderColor:
                                  exposure === option
                                    ? getMetricColor("exposure", option)
                                    : "#e5e7eb",
                              },
                            ]}
                            onPress={() => setExposure(option as any)}
                          >
                            <Ionicons
                              name={getMetricIcon("exposure", option) as any}
                              size={20}
                              color={
                                exposure === option
                                  ? "#fff"
                                  : getMetricColor("exposure", option)
                              }
                            />
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  </View>
                  {/* Evaluación de Enfoque */}
                  <View style={styles.evaluationSection}>
                    <Text style={styles.evaluationTitle}>Enfoque</Text>
                    <View style={styles.metricOptionsContainer}>
                      {["deficiente", "regular", "bueno"].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.metricOption,
                            focus === option && styles.metricOptionSelected,
                            {
                              backgroundColor:
                                focus === option
                                  ? getMetricColor("focus", option)
                                  : "#ffffff",
                              borderColor:
                                focus === option
                                  ? getMetricColor("focus", option)
                                  : "#e5e7eb",
                            },
                          ]}
                          onPress={() => setFocus(option as any)}
                        >
                          <Ionicons
                            name={getMetricIcon("focus", option) as any}
                            size={18}
                            color={
                              focus === option
                                ? "#fff"
                                : getMetricColor("focus", option)
                            }
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  {/* Evaluación de Posición alrededor de la pala */}
                  <View style={styles.evaluationSection}>
                    <Text style={styles.evaluationTitle}>
                      Posición alrededor de la pala
                    </Text>
                    <View style={styles.metricOptionsContainer}>
                      {["incorrecta", "parcialmente_correcta", "correcta"].map(
                        (option) => (
                          <TouchableOpacity
                            key={option}
                            style={[
                              styles.metricOption,
                              bladePosition === option &&
                                styles.metricOptionSelected,
                              {
                                backgroundColor:
                                  bladePosition === option
                                    ? getMetricColor("bladePosition", option)
                                    : "#ffffff",
                                borderColor:
                                  bladePosition === option
                                    ? getMetricColor("bladePosition", option)
                                    : "#e5e7eb",
                              },
                            ]}
                            onPress={() => setBladePosition(option as any)}
                          >
                            <Ionicons
                              name={
                                getMetricIcon("bladePosition", option) as any
                              }
                              size={18}
                              color={
                                bladePosition === option
                                  ? "#fff"
                                  : getMetricColor("bladePosition", option)
                              }
                            />
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  </View>
                  {/* Spacer to separate evaluation sections from action buttons */}
                  <View style={styles.modalActionsSpacer} />
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={handleRejectSubmission}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.rejectButtonText}>Rechazar Entrega</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.approveButton}
                onPress={handleApproveSubmission}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.approveButtonText}>Aceptar Entrega</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal de rechazo con motivo */}
      <Modal
        visible={rejectionModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setRejectionModalVisible(false)}
      >
        <View style={styles.rejectionModalOverlay}>
          <View style={styles.rejectionModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Motivo de Rechazo</Text>
              <TouchableOpacity
                onPress={() => setRejectionModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.rejectionInstructions}>
                Especifique el motivo del rechazo. Esta información será enviada
                al piloto.
              </Text>
              <TextInput
                style={styles.rejectionInput}
                placeholder="Ejemplo: Faltan fotos de las palas en turbina T-04, algunas imágenes están desenfocadas..."
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setRejectionModalVisible(false);
                  setRejectionReason("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmRejectButton}
                onPress={confirmRejection}
              >
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.confirmRejectButtonText}>
                  Enviar Rechazo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  filterButtonActive: {
    backgroundColor: "#9C46CE",
    borderColor: "#9C46CE",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  submissionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  pilotInfo: {
    flex: 1,
  },
  pilotName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  projectName: {
    fontSize: 14,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  submissionDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 8,
  },
  qualityIndicators: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  indicator: {
    flex: 1,
    marginHorizontal: 4,
  },
  indicatorLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    opacity: 0.3,
    marginRight: 8,
  },
  scoreProgress: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "currentColor",
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 35,
  },
  metricContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metricBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
  },
  metricText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  metricOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  metricOption: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    flex: 1,
    minWidth: "30%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  metricOptionSelected: {
    borderColor: "#9C46CE",
    shadowColor: "#9C46CE",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  metricOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    lineHeight: 18,
  },
  metricOptionTextSelected: {
    color: "#fff",
  },
  rejectionContainer: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  rejectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 14,
    color: "#991b1b",
  },
  reviewInfo: {
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 12,
    color: "#0369a1",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  driveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#4285f4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: "center",
  },
  driveButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4285f4",
    marginLeft: 6,
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9C46CE",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 16,
  }, // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  submissionInfo: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 4,
  },
  evaluationSection: {
    marginBottom: 24,
  },
  evaluationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
  },
  sliderContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 12,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    marginBottom: 16,
    position: "relative",
  },
  sliderThumb: {
    position: "absolute",
    top: -6,
    width: 18,
    height: 18,
    backgroundColor: "#9C46CE",
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  scoreButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scoreButtonText: { fontSize: 14, fontWeight: "500", color: "#4b5563" },
  modalActionsSpacer: {
    height: 24,
    backgroundColor: "#fff",
  },
  // Info section styles
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    lineHeight: 20,
  },
  infoSubtext: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  driveLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  driveLinkText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3b82f6",
    marginLeft: 4,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 12,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 6,
  },
  approveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 12,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 6,
  },
  rejectionInstructions: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 16,
    lineHeight: 20,
  },
  rejectionInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#fff",
    minHeight: 150,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4b5563",
  },
  confirmRejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 6,
  },
  confirmRejectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 6,
  },
  // Rejection modal specific styles (bottom sheet)
  rejectionModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  rejectionModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    minHeight: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
});
