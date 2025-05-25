import {
  PilotReport,
  ProjectReport,
  Report,
  ReportFilter,
} from "../types/reports";

export const mockReportFilters: ReportFilter[] = [
  {
    startDate: new Date("2025-05-01"),
    endDate: new Date("2025-05-31"),
    projectIds: ["proj_001", "proj_002"],
    clientIds: ["client_001"],
    pilotIds: ["pilot_001", "pilot_003"],
  },
  {
    startDate: new Date("2025-04-01"),
    endDate: new Date("2025-04-30"),
    projectIds: ["proj_004"],
    status: ["COMPLETED"],
  },
  {
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    clientIds: ["client_002", "client_003"],
  },
];

export const mockReports: Report[] = [
  {
    id: "report_001",
    name: "Reporte de Progreso de Proyectos Mayo 2025",
    type: "PROJECT",
    format: "PDF",
    filters: mockReportFilters[0],
    generatedBy: "admin_001",
    generatedAt: new Date("2025-05-24T09:00:00Z"),
    downloadUrl: "https://example.com/reports/may_2025_progress.pdf",
  },
  {
    id: "report_002",
    name: "Análisis de Rendimiento de Pilotos Q1 2025",
    type: "PILOT",
    format: "EXCEL",
    filters: {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-03-31"),
      pilotIds: ["pilot_001", "pilot_002", "pilot_003", "pilot_004"],
    },
    generatedBy: "admin_002",
    generatedAt: new Date("2025-04-05T14:30:00Z"),
    downloadUrl: "https://example.com/reports/q1_2025_pilot_performance.xlsx",
  },
  {
    id: "report_003",
    name: "Resumen de Actividad Cliente - Energía Verde Corp",
    type: "CLIENT",
    format: "CSV",
    filters: {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-05-24"),
      clientIds: ["client_001"],
    },
    generatedBy: "admin_001",
    generatedAt: new Date("2025-05-24T11:15:00Z"),
    downloadUrl: "https://example.com/reports/greenenergy_activity_summary.csv",
  },
  {
    id: "report_004",
    name: "Reporte de Finalización Parque Eólico Desértico",
    type: "PROJECT",
    format: "PDF",
    filters: mockReportFilters[1],
    generatedBy: "admin_002",
    generatedAt: new Date("2025-04-16T10:00:00Z"),
    downloadUrl: "https://example.com/reports/desert_wind_completion.pdf",
  },
  {
    id: "report_005",
    name: "Estado de Inspección de Turbinas - Mayo 2025",
    type: "TURBINE",
    format: "EXCEL",
    filters: {
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-05-31"),
      turbineIds: [
        "turbine_001",
        "turbine_002",
        "turbine_003",
        "turbine_004",
        "turbine_005",
      ],
    },
    generatedBy: "admin_001",
    generatedAt: new Date("2025-05-24T15:45:00Z"),
  },
];

export const mockProjectReports: ProjectReport[] = [
  {
    projectId: "proj_001",
    projectName: "WindFarm Alpha Inspection Q2 2025",
    clientName: "GreenEnergy Corp",
    windParkName: "WindFarm Alpha",
    period: {
      startDate: new Date("2025-05-20"),
      endDate: new Date("2025-05-24"),
    },
    progress: {
      totalTurbines: 24,
      completed: 8,
      inProgress: 8,
      pending: 8,
      completionPercentage: 67,
    },
    timeMetrics: {
      totalHours: 156,
      averageTimePerTurbine: 2.3,
      delays: 3,
    },
    qualityMetrics: {
      photoSubmissions: 10,
      approved: 8,
      rejected: 2,
      approvalRate: 80,
    },
  },
  {
    projectId: "proj_002",
    projectName: "Coastal Wind Inspection Phase 1",
    clientName: "Coastal Wind Farms LLC",
    windParkName: "Coastal Wind Farm Beta",
    period: {
      startDate: new Date("2025-04-15"),
      endDate: new Date("2025-05-24"),
    },
    progress: {
      totalTurbines: 18,
      completed: 6,
      inProgress: 6,
      pending: 6,
      completionPercentage: 56,
    },
    timeMetrics: {
      totalHours: 98,
      averageTimePerTurbine: 2.7,
      delays: 5,
    },
    qualityMetrics: {
      photoSubmissions: 8,
      approved: 6,
      rejected: 2,
      approvalRate: 75,
    },
  },
];

export const mockPilotReports: PilotReport[] = [
  {
    pilotId: "pilot_001",
    pilotName: "Juan Carlos Méndez",
    period: {
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-05-24"),
    },
    performance: {
      totalTurbines: 12,
      averageTimePerTurbine: 2.3,
      totalHours: 96,
      projectsWorked: 1,
    },
    quality: {
      photoSubmissions: 5,
      approvalRate: 90,
      averageDeliveryTime: 45,
    },
    activities: {
      workTime: 85,
      breakTime: 8,
      weatherDelays: 3,
      incidents: 1,
    },
  },
  {
    pilotId: "pilot_002",
    pilotName: "Ana Patricia Morales",
    period: {
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-05-24"),
    },
    performance: {
      totalTurbines: 8,
      averageTimePerTurbine: 2.7,
      totalHours: 72,
      projectsWorked: 1,
    },
    quality: {
      photoSubmissions: 3,
      approvalRate: 67,
      averageDeliveryTime: 65,
    },
    activities: {
      workTime: 78,
      breakTime: 12,
      weatherDelays: 8,
      incidents: 2,
    },
  },
  {
    pilotId: "pilot_003",
    pilotName: "Miguel Rodríguez",
    period: {
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-05-24"),
    },
    performance: {
      totalTurbines: 6,
      averageTimePerTurbine: 2.2,
      totalHours: 58,
      projectsWorked: 1,
    },
    quality: {
      photoSubmissions: 2,
      approvalRate: 100,
      averageDeliveryTime: 35,
    },
    activities: {
      workTime: 92,
      breakTime: 5,
      weatherDelays: 2,
      incidents: 0,
    },
  },
];
