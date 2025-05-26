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
import { mockPhotoSubmissions } from "../../../src/mocks/index";
import { PhotoSubmissionStatus } from "../../../src/types/common";
import {
  PhotoSubmission,
  PhotoSubmissionReview,
} from "../../../src/types/pictures";

export default function PicturesReviewScreen() {
  const [submissions, setSubmissions] =
    useState<PhotoSubmission[]>(mockPhotoSubmissions);
  const [selectedSubmission, setSelectedSubmission] =
    useState<PhotoSubmission | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [completenessScore, setCompletenessScore] = useState(100);
  const [legibilityScore, setLegibilityScore] = useState(100);
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
    setCompletenessScore(submission.photoSubmissionReview?.completeness || 100);
    setLegibilityScore(submission.photoSubmissionReview?.legibility || 100);
    setReviewModalVisible(true);
  };

  const handleApproveSubmission = () => {
    if (!selectedSubmission) return;

    const review: PhotoSubmissionReview = {
      status: "APPROVED",
      completeness: completenessScore,
      legibility: legibilityScore,
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

    const review: PhotoSubmissionReview = {
      status: "REJECTED",
      completeness: completenessScore,
      legibility: legibilityScore,
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

  const getCompletenessColor = (score: number) => {
    if (score >= 95) return "#10b981"; // green
    if (score >= 85) return "#f59e0b"; // orange
    return "#ef4444"; // red
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
          <View style={styles.detailRow}>
            <Ionicons name="link-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>Link de Drive disponible</Text>
          </View>
        </View>

        {/* Indicadores de completitud y legibilidad */}
        {review && (
          <View style={styles.qualityIndicators}>
            <View style={styles.indicator}>
              <Text style={styles.indicatorLabel}>Completitud</Text>
              <View style={styles.scoreContainer}>
                <View
                  style={[
                    styles.scoreBar,
                    {
                      backgroundColor: getCompletenessColor(
                        review.completeness
                      ),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.scoreProgress,
                      { width: `${review.completeness}%` },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.scoreText,
                    { color: getCompletenessColor(review.completeness) },
                  ]}
                >
                  {review.completeness}%
                </Text>
              </View>
            </View>

            <View style={styles.indicator}>
              <Text style={styles.indicatorLabel}>Legibilidad</Text>
              <View style={styles.scoreContainer}>
                <View
                  style={[
                    styles.scoreBar,
                    {
                      backgroundColor: getCompletenessColor(review.legibility),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.scoreProgress,
                      { width: `${review.legibility}%` },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.scoreText,
                    { color: getCompletenessColor(review.legibility) },
                  ]}
                >
                  {review.legibility}%
                </Text>
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
              Revisado por {review.reviewedBy} el{" "}
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
        presentationStyle="pageSheet"
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
                  <View style={styles.submissionInfo}>
                    <Text style={styles.infoTitle}>
                      Información de la Entrega
                    </Text>
                    <Text style={styles.infoText}>
                      Piloto: {selectedSubmission.pilotName}
                    </Text>
                    <Text style={styles.infoText}>
                      Proyecto: {selectedSubmission.projectName}
                    </Text>
                    <Text style={styles.infoText}>
                      Fecha:{" "}
                      {new Date(
                        selectedSubmission.submissionDate
                      ).toLocaleDateString("es-ES")}
                    </Text>
                    <Text style={styles.infoText}>
                      Turbinas:{" "}
                      {selectedSubmission.turbinesInspected.join(", ")}
                    </Text>
                    <Text style={styles.infoText}>
                      Link de Drive disponible
                    </Text>
                  </View>

                  {/* Evaluación de completitud */}
                  <View style={styles.evaluationSection}>
                    <Text style={styles.evaluationTitle}>
                      Evaluación de Completitud
                    </Text>
                    <View style={styles.sliderContainer}>
                      <Text style={styles.sliderLabel}>
                        Completitud: {completenessScore}%
                      </Text>
                      <View style={styles.sliderTrack}>
                        <TouchableOpacity
                          style={[
                            styles.sliderThumb,
                            { left: `${(completenessScore / 100) * 85}%` },
                          ]}
                          // Note: In a real implementation, you'd use a proper slider component
                        />
                      </View>
                      <View style={styles.sliderButtons}>
                        <TouchableOpacity
                          style={styles.scoreButton}
                          onPress={() =>
                            setCompletenessScore(
                              Math.max(0, completenessScore - 5)
                            )
                          }
                        >
                          <Text style={styles.scoreButtonText}>-5</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.scoreButton}
                          onPress={() =>
                            setCompletenessScore(
                              Math.min(100, completenessScore + 5)
                            )
                          }
                        >
                          <Text style={styles.scoreButtonText}>+5</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Evaluación de legibilidad */}
                  <View style={styles.evaluationSection}>
                    <Text style={styles.evaluationTitle}>
                      Evaluación de Legibilidad
                    </Text>
                    <View style={styles.sliderContainer}>
                      <Text style={styles.sliderLabel}>
                        Legibilidad: {legibilityScore}%
                      </Text>
                      <View style={styles.sliderTrack}>
                        <TouchableOpacity
                          style={[
                            styles.sliderThumb,
                            { left: `${(legibilityScore / 100) * 85}%` },
                          ]}
                        />
                      </View>
                      <View style={styles.sliderButtons}>
                        <TouchableOpacity
                          style={styles.scoreButton}
                          onPress={() =>
                            setLegibilityScore(Math.max(0, legibilityScore - 5))
                          }
                        >
                          <Text style={styles.scoreButtonText}>-5</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.scoreButton}
                          onPress={() =>
                            setLegibilityScore(
                              Math.min(100, legibilityScore + 5)
                            )
                          }
                        >
                          <Text style={styles.scoreButtonText}>+5</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
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
                numberOfLines={4}
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
    backgroundColor: "#f8fafc",
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
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
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
    padding: 20,
    maxHeight: 400,
  },
  submissionInfo: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
    marginBottom: 12,
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
  scoreButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
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
    minHeight: 120,
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
});
