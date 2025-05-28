// filepath: c:\Users\rover\Documents\GitHub\media-aerea-proposal\app\admin\(kpis)\report.tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

// Mock data imports
import { mockClients } from "../../src/mocks/clients";
import { mockPilotUsers } from "../../src/mocks/pilots";
import { mockProjects } from "../../src/mocks/projects";
import { mockReports } from "../../src/mocks/reports";
import { mockTurbines } from "../../src/mocks/turbines";
import { mockWindParks } from "../../src/mocks/windParks";

interface ReportFilters {
  reportType: "PROJECT" | "PILOT" | "CLIENT" | "TURBINE" | "GENERAL";
  format: "PDF" | "EXCEL" | "CSV";
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  selectedProjects: string[];
  selectedPilots: string[];
  selectedClients: string[];
  selectedWindParks: string[];
  selectedTurbines: string[];
  statusFilter: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  type: "PROJECT" | "PILOT" | "CLIENT" | "TURBINE" | "GENERAL";
  description: string;
  icon: string;
  color: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "project_progress",
    name: "Progreso de Proyectos",
    type: "PROJECT",
    description:
      "Reporte detallado del progreso de proyectos con métricas de turbinas inspeccionadas",
    icon: "trending-up",
    color: "#3b82f6",
  },
  {
    id: "pilot_performance",
    name: "Rendimiento de Pilotos",
    type: "PILOT",
    description:
      "Análisis de eficiencia, horas de vuelo e incidentes por piloto",
    icon: "person",
    color: "#10b981",
  },
  {
    id: "client_summary",
    name: "Resumen por Cliente",
    type: "CLIENT",
    description:
      "Consolidado de proyectos, turbinas y satisfacción por cliente",
    icon: "business",
    color: "#f59e0b",
  },
  {
    id: "turbine_status",
    name: "Estado de Turbinas",
    type: "TURBINE",
    description:
      "Inventario completo de turbinas con estados y próximas inspecciones",
    icon: "settings",
    color: "#8b5cf6",
  },
  {
    id: "operational_overview",
    name: "Resumen Operacional",
    type: "GENERAL",
    description:
      "Vista general del sistema con KPIs principales y cuellos de botella",
    icon: "analytics",
    color: "#ef4444",
  },
];

const statusOptions = [
  "NOT_STARTED",
  "INSPECTED",
  "PHOTOS_UPLOADED",
  "PHOTOS_REJECTED",
  "APPROVED",
];

export default function ReportsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Smart back navigation function
  const handleBack = () => {
    const from = params.from as string;

    if (from === "kpis") {
      router.push("/admin/profile/kpisdashboard");
    } else if (from === "dashboard") {
      router.push("/admin/dashboard/dashboard");
    } else {
      // Default fallback - try router.back() first
      try {
        router.back();
      } catch (error) {
        // If that fails, go to KPIs dashboard
        router.push("/admin/profile/kpisdashboard");
      }
    }
  };
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: "GENERAL",
    format: "PDF",
    dateRange: {
      startDate: new Date(2025, 4, 1), // May 1, 2025
      endDate: new Date(2025, 4, 24), // May 24, 2025
    },
    selectedProjects: [],
    selectedPilots: [],
    selectedClients: [],
    selectedWindParks: [],
    selectedTurbines: [],
    statusFilter: [],
  });
  const [generatingReport, setGeneratingReport] = useState(false);

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setFilters((prev) => ({ ...prev, reportType: template.type }));
    setShowFilters(true);
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;

    setGeneratingReport(true);

    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(false);
      setShowFilters(false);
      Alert.alert(
        "Reporte Generado",
        `El reporte "${selectedTemplate.name}" ha sido generado exitosamente en formato ${filters.format}.`,
        [
          {
            text: "Descargar",
            onPress: () => {
              Alert.alert("Descarga", "Iniciando descarga del reporte...");
            },
          },
          { text: "OK" },
        ]
      );
    }, 3000);
  };

  // Optimized filter update functions using useCallback
  const updateFormat = React.useCallback((format: "PDF" | "EXCEL" | "CSV") => {
    setFilters((prev) => ({ ...prev, format }));
  }, []);

  const updateProjects = React.useCallback((projectId: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedProjects: prev.selectedProjects.includes(projectId)
        ? prev.selectedProjects.filter((id) => id !== projectId)
        : [...prev.selectedProjects, projectId],
    }));
  }, []);

  const updatePilots = React.useCallback((pilotId: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedPilots: prev.selectedPilots.includes(pilotId)
        ? prev.selectedPilots.filter((id) => id !== pilotId)
        : [...prev.selectedPilots, pilotId],
    }));
  }, []);

  const updateClients = React.useCallback((clientId: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedClients: prev.selectedClients.includes(clientId)
        ? prev.selectedClients.filter((id) => id !== clientId)
        : [...prev.selectedClients, clientId],
    }));
  }, []);

  const updateWindParks = React.useCallback((parkId: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedWindParks: prev.selectedWindParks.includes(parkId)
        ? prev.selectedWindParks.filter((id) => id !== parkId)
        : [...prev.selectedWindParks, parkId],
    }));
  }, []);

  const updateStatusFilter = React.useCallback((status: string) => {
    setFilters((prev) => ({
      ...prev,
      statusFilter: prev.statusFilter.includes(status)
        ? prev.statusFilter.filter((s) => s !== status)
        : [...prev.statusFilter, status],
    }));
  }, []);

  const getFilterCounts = React.useMemo(
    () => ({
      projects: filters.selectedProjects.length || mockProjects.length,
      pilots: filters.selectedPilots.length || mockPilotUsers.length,
      clients: filters.selectedClients.length || mockClients.length,
      windParks: filters.selectedWindParks.length || mockWindParks.length,
      turbines: filters.selectedTurbines.length || mockTurbines.length,
    }),
    [filters]
  );
  const FilterModal = React.memo(() => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={["#1e40af", "#3b82f6", "#60a5fa"]}
          style={styles.modalHeader}
        >
          <View style={styles.modalHeaderContent}>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Configurar Reporte: {selectedTemplate?.name}
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.modalContent}>
          {/* Format Selection */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>
              Formato de Exportación
            </Text>
            <View style={styles.formatOptions}>
              {(["PDF", "EXCEL", "CSV"] as const).map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.formatOption,
                    filters.format === format && styles.formatOptionSelected,
                  ]}
                  onPress={() => updateFormat(format)}
                >
                  <Ionicons
                    name={
                      format === "PDF"
                        ? "document-text"
                        : format === "EXCEL"
                        ? "grid"
                        : "list"
                    }
                    size={20}
                    color={filters.format === format ? "white" : "#3b82f6"}
                  />
                  <Text
                    style={[
                      styles.formatOptionText,
                      filters.format === format &&
                        styles.formatOptionTextSelected,
                    ]}
                  >
                    {format}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Range */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Rango de Fechas</Text>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity style={styles.dateButton}>
                <MaterialIcons name="date-range" size={20} color="#3b82f6" />
                <Text style={styles.dateButtonText}>
                  {filters.dateRange.startDate.toLocaleDateString("es-ES")}
                </Text>
              </TouchableOpacity>
              <Text style={styles.dateRangeSeparator}>a</Text>
              <TouchableOpacity style={styles.dateButton}>
                <MaterialIcons name="date-range" size={20} color="#3b82f6" />
                <Text style={styles.dateButtonText}>
                  {filters.dateRange.endDate.toLocaleDateString("es-ES")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Project Selection */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>
              Proyectos ({getFilterCounts.projects} seleccionados)
            </Text>
            <View style={styles.filterOptionsGrid}>
              {mockProjects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.filterChip,
                    filters.selectedProjects.includes(project.id) &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() => updateProjects(project.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.selectedProjects.includes(project.id) &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    {project.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pilot Selection */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>
              Pilotos ({getFilterCounts.pilots} seleccionados)
            </Text>
            <View style={styles.filterOptionsGrid}>
              {mockPilotUsers.map((pilot) => (
                <TouchableOpacity
                  key={pilot.id}
                  style={[
                    styles.filterChip,
                    filters.selectedPilots.includes(pilot.id) &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() => updatePilots(pilot.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.selectedPilots.includes(pilot.id) &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    {pilot.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Client Selection */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>
              Clientes ({getFilterCounts.clients} seleccionados)
            </Text>
            <View style={styles.filterOptionsGrid}>
              {mockClients.map((client) => (
                <TouchableOpacity
                  key={client.id}
                  style={[
                    styles.filterChip,
                    filters.selectedClients.includes(client.id) &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() => updateClients(client.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.selectedClients.includes(client.id) &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    {client.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Wind Parks Selection */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>
              Parques Eólicos ({getFilterCounts.windParks} seleccionados)
            </Text>
            <View style={styles.filterOptionsGrid}>
              {mockWindParks.map((park) => (
                <TouchableOpacity
                  key={park.id}
                  style={[
                    styles.filterChip,
                    filters.selectedWindParks.includes(park.id) &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() => updateWindParks(park.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.selectedWindParks.includes(park.id) &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    {park.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Estado de Turbinas</Text>
            <View style={styles.filterOptionsGrid}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    filters.statusFilter.includes(status) &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() => updateStatusFilter(status)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.statusFilter.includes(status) &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    {status.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Generate Button */}
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              generatingReport && styles.generateButtonDisabled,
            ]}
            onPress={handleGenerateReport}
            disabled={generatingReport}
          >
            {generatingReport ? (
              <View style={styles.generatingContent}>
                <Ionicons
                  name="refresh"
                  size={20}
                  color="white"
                  style={styles.spinningIcon}
                />
                <Text style={styles.generateButtonText}>Generando...</Text>
              </View>
            ) : (
              <View style={styles.generateContent}>
                <Ionicons name="download" size={20} color="white" />
                <Text style={styles.generateButtonText}>
                  Generar Reporte {filters.format}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ));

  FilterModal.displayName = "FilterModal";

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Generar Reportes</Text>
              <Text style={styles.subtitle}>
                Selecciona el tipo de reporte que deseas generar
              </Text>
            </View>
          </View>
        </Animated.View>
        {/* Report Templates */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.templatesSection}
        >
          <View style={styles.templateGrid}>
            {reportTemplates.map((template, index) => (
              <Animated.View
                key={template.id}
                entering={FadeInDown.delay(400 + index * 100)}
                style={styles.templateCard}
              >
                <TouchableOpacity
                  style={styles.templateContent}
                  onPress={() => handleTemplateSelect(template)}
                >
                  <LinearGradient
                    colors={[template.color, `${template.color}CC`]}
                    style={styles.templateIcon}
                  >
                    <Ionicons
                      name={template.icon as any}
                      size={28}
                      color="white"
                    />
                  </LinearGradient>

                  <View style={styles.templateInfo}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateDescription}>
                      {template.description}
                    </Text>
                    <Text style={styles.templateType}>
                      Tipo: {template.type}
                    </Text>
                  </View>

                  <View style={styles.templateAction}>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#64748b"
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(800)}
          style={styles.recentSection}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reportes Recientes</Text>
            <View style={styles.sectionIndicator}>
              <Text style={styles.sectionCount}>{mockReports.length}</Text>
            </View>
          </View>

          <View style={styles.recentReports}>
            {mockReports.slice(0, 3).map((report, index) => (
              <Animated.View
                key={report.id}
                entering={FadeInDown.delay(900 + index * 100)}
                style={styles.recentReportCard}
              >
                <TouchableOpacity activeOpacity={0.9}>
                  <LinearGradient
                    colors={[
                      report.type === "PROJECT"
                        ? "#fafbff"
                        : report.type === "PILOT"
                        ? "#f0fdfa"
                        : report.type === "CLIENT"
                        ? "#fffbeb"
                        : "#faf5ff",
                      "#ffffff",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.recentReportGradient}
                  >
                    {/* Background Pattern */}
                    <View style={styles.cardPattern} />

                    {/* Header with enhanced icon and info */}
                    <View style={styles.recentReportHeader}>
                      <View style={styles.iconContainer}>
                        <LinearGradient
                          colors={[
                            report.type === "PROJECT"
                              ? "#3b82f6"
                              : report.type === "PILOT"
                              ? "#10b981"
                              : report.type === "CLIENT"
                              ? "#f59e0b"
                              : "#8b5cf6",
                            report.type === "PROJECT"
                              ? "#1d4ed8"
                              : report.type === "PILOT"
                              ? "#059669"
                              : report.type === "CLIENT"
                              ? "#d97706"
                              : "#7c3aed",
                          ]}
                          style={styles.recentReportIcon}
                        >
                          <Ionicons
                            name={
                              report.type === "PROJECT"
                                ? "folder"
                                : report.type === "PILOT"
                                ? "person"
                                : report.type === "CLIENT"
                                ? "business"
                                : "analytics"
                            }
                            size={20}
                            color="white"
                          />
                          {/* Icon glow effect */}
                          <View style={styles.iconGlow} />
                        </LinearGradient>

                        {/* Status indicator */}
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor:
                                report.type === "PROJECT"
                                  ? "#22c55e"
                                  : report.type === "PILOT"
                                  ? "#3b82f6"
                                  : report.type === "CLIENT"
                                  ? "#f59e0b"
                                  : "#8b5cf6",
                            },
                          ]}
                        />
                      </View>

                      <View style={styles.recentReportInfo}>
                        <Text style={styles.recentReportName}>
                          {report.name}
                        </Text>
                        <View style={styles.metaInfo}>
                          <Ionicons
                            name="time-outline"
                            size={12}
                            color="#64748b"
                          />
                          <Text style={styles.recentReportDate}>
                            {report.generatedAt.toLocaleDateString("es-ES")}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.downloadButton}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={["#3b82f6", "#1d4ed8"]}
                          style={styles.downloadButtonGradient}
                        >
                          <Ionicons
                            name="download-outline"
                            size={16}
                            color="white"
                          />
                        </LinearGradient>
                        <View style={styles.buttonGlow} />
                      </TouchableOpacity>
                    </View>

                    {/* Enhanced stats section */}
                    <View style={styles.recentReportStats}>
                      <View style={styles.statGroup}>
                        <View
                          style={[
                            styles.statBadge,
                            {
                              backgroundColor:
                                report.type === "PROJECT"
                                  ? "#dbeafe"
                                  : report.type === "PILOT"
                                  ? "#d1fae5"
                                  : report.type === "CLIENT"
                                  ? "#fef3c7"
                                  : "#e9d5ff",
                            },
                          ]}
                        >
                          <Ionicons
                            name="document-text-outline"
                            size={10}
                            color={
                              report.type === "PROJECT"
                                ? "#1e40af"
                                : report.type === "PILOT"
                                ? "#047857"
                                : report.type === "CLIENT"
                                ? "#92400e"
                                : "#6b21a8"
                            }
                          />
                          <Text
                            style={[
                              styles.statBadgeText,
                              {
                                color:
                                  report.type === "PROJECT"
                                    ? "#1e40af"
                                    : report.type === "PILOT"
                                    ? "#047857"
                                    : report.type === "CLIENT"
                                    ? "#92400e"
                                    : "#6b21a8",
                              },
                            ]}
                          >
                            {report.format}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statBadge,
                            {
                              backgroundColor: "#f1f5f9",
                              borderWidth: 1,
                              borderColor: "#e2e8f0",
                            },
                          ]}
                        >
                          <Ionicons
                            name="layers-outline"
                            size={10}
                            color="#475569"
                          />
                          <Text
                            style={[styles.statBadgeText, { color: "#475569" }]}
                          >
                            {report.type}
                          </Text>
                        </View>
                      </View>

                      {/* Size indicator */}
                      <View style={styles.sizeIndicator}>
                        <Text style={styles.sizeText}>2.4 MB</Text>
                      </View>
                    </View>

                    {/* Subtle border overlay with enhanced effect */}
                    <View style={styles.recentReportOverlay} />

                    {/* Corner accent */}
                    <View
                      style={[
                        styles.cornerAccent,
                        {
                          backgroundColor:
                            report.type === "PROJECT"
                              ? "#3b82f6"
                              : report.type === "PILOT"
                              ? "#10b981"
                              : report.type === "CLIENT"
                              ? "#f59e0b"
                              : "#8b5cf6",
                        },
                      ]}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
      <FilterModal />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    marginTop: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    lineHeight: 24,
  },
  templatesSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  templateGrid: {
    gap: 12,
  },
  templateCard: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  templateContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 4,
  },
  templateType: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  templateAction: {
    padding: 8,
  },
  recentSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionIndicator: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  recentReports: {
    gap: 16,
  },
  recentReportCard: {
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  recentReportGradient: {
    borderRadius: 16,
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },
  cardPattern: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(59, 130, 246, 0.03)",
  },
  recentReportHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    position: "relative",
    marginRight: 16,
  },
  recentReportIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconGlow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    zIndex: -1,
  },
  statusDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
  },
  recentReportInfo: {
    flex: 1,
  },
  recentReportName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
    lineHeight: 20,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recentReportDate: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  downloadButton: {
    position: "relative",
  },
  downloadButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    zIndex: -1,
  },
  recentReportStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statGroup: {
    flexDirection: "row",
    gap: 10,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sizeIndicator: {
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sizeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  recentReportOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cornerAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 3,
    height: 24,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  modalHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  formatOptions: {
    flexDirection: "row",
    gap: 12,
  },
  formatOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  formatOptionSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  formatOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
  formatOptionTextSelected: {
    color: "white",
  },
  dateRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: "#1e293b",
  },
  dateRangeSeparator: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  filterOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterChipSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  filterChipText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  filterChipTextSelected: {
    color: "white",
  },
  modalFooter: {
    padding: 20,
    paddingBottom: 30,
  },
  generateButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  generateButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  generateContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  generatingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  spinningIcon: {
    // Add rotation animation if needed
  },
});
