import {
  Activity,
  DailyActivitySummary,
  PreflightChecklist,
} from "../types/activities";
import { ActivityStatus, ActivityType } from "../types/common";

// Helper function to create consistent dates
const createDate = (dateStr: string): Date => new Date(dateStr);

// Previous day completed activities (May 27, 2025)
export const mockCompletedActivities: Activity[] = [
  {
    id: "act_20250527_001",
    type: "MOBILIZATION" as ActivityType,
    status: "COMPLETED" as ActivityStatus,
    startTime: createDate("2025-05-27T07:00:00Z"),
    endTime: createDate("2025-05-27T07:45:00Z"),
    durationSeconds: 2700, // 45 minutes
    projectId: "proj_001",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Movilización desde hotel al parque eólico. Revisión inicial de equipos",
    orderIndex: 1,
    createdAt: createDate("2025-05-27T07:00:00Z"),
    updatedAt: createDate("2025-05-27T07:45:00Z"),
  },
  {
    id: "act_20250527_002",
    type: "TURBINE_WORK" as ActivityType,
    status: "COMPLETED" as ActivityStatus,
    startTime: createDate("2025-05-27T08:15:00Z"),
    endTime: createDate("2025-05-27T11:30:00Z"),
    durationSeconds: 11700, // 3 hours 15 minutes
    projectId: "proj_001",
    turbineId: "turbine_001",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Inspección completa de turbina T-001. Revisión de aspas, torre y nacelle. 147 fotos capturadas",
    orderIndex: 2,
    createdAt: createDate("2025-05-27T08:15:00Z"),
    updatedAt: createDate("2025-05-27T11:30:00Z"),
  },
  {
    id: "act_20250527_003",
    type: "LUNCH" as ActivityType,
    status: "COMPLETED" as ActivityStatus,
    startTime: createDate("2025-05-27T12:00:00Z"),
    endTime: createDate("2025-05-27T13:00:00Z"),
    durationSeconds: 3600, // 1 hour
    projectId: "proj_001",
    pilotId: "pilot_001",
    notes: "Descanso para almuerzo",
    orderIndex: 3,
    createdAt: createDate("2025-05-27T12:00:00Z"),
    updatedAt: createDate("2025-05-27T13:00:00Z"),
  },
  {
    id: "act_20250527_004",
    type: "TURBINE_WORK" as ActivityType,
    status: "COMPLETED" as ActivityStatus,
    startTime: createDate("2025-05-27T13:30:00Z"),
    endTime: createDate("2025-05-27T16:45:00Z"),
    durationSeconds: 11700, // 3 hours 15 minutes
    projectId: "proj_001",
    turbineId: "turbine_002",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Inspección completa de turbina T-002. Detectadas anomalías menores en aspa 2. 163 fotos capturadas",
    orderIndex: 4,
    createdAt: createDate("2025-05-27T13:30:00Z"),
    updatedAt: createDate("2025-05-27T16:45:00Z"),
  },
  {
    id: "act_20250527_005",
    type: "DEMOBILIZATION" as ActivityType,
    status: "COMPLETED" as ActivityStatus,
    startTime: createDate("2025-05-27T17:00:00Z"),
    endTime: createDate("2025-05-27T17:30:00Z"),
    durationSeconds: 1800, // 30 minutes
    projectId: "proj_001",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Desmontaje de equipo y regreso al hotel",
    orderIndex: 5,
    createdAt: createDate("2025-05-27T17:00:00Z"),
    updatedAt: createDate("2025-05-27T17:30:00Z"),
  },
];

// Current day activities (May 28, 2025 - Today)
export const mockTodayCompletedActivities: Activity[] = [
  {
    id: "act_20250528_001",
    type: "MOBILIZATION" as ActivityType,
    status: "COMPLETED" as ActivityStatus,
    startTime: createDate("2025-05-28T07:00:00Z"),
    endTime: createDate("2025-05-28T07:35:00Z"),
    durationSeconds: 2100, // 35 minutes
    projectId: "proj_001",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Movilización matutina completada. Condiciones climáticas favorables",
    orderIndex: 1,
    createdAt: createDate("2025-05-28T07:00:00Z"),
    updatedAt: createDate("2025-05-28T07:35:00Z"),
  },
  {
    id: "act_20250528_002",
    type: "TURBINE_WORK" as ActivityType,
    status: "COMPLETED" as ActivityStatus,
    startTime: createDate("2025-05-28T08:00:00Z"),
    endTime: createDate("2025-05-28T11:15:00Z"),
    durationSeconds: 11700, // 3 hours 15 minutes
    projectId: "proj_001",
    turbineId: "turbine_003",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Inspección de turbina T-003 completada exitosamente. Todas las aspas en buen estado. 156 fotos capturadas",
    orderIndex: 2,
    createdAt: createDate("2025-05-28T08:00:00Z"),
    updatedAt: createDate("2025-05-28T11:15:00Z"),
  },
];

export const mockTodayInProgressActivity: Activity = {
  id: "act_20250528_003",
  type: "TURBINE_WORK" as ActivityType,
  status: "IN_PROGRESS" as ActivityStatus,
  startTime: createDate("2025-05-28T11:45:00Z"),
  projectId: "proj_001",
  turbineId: "turbine_004",
  pilotId: "pilot_001",
  droneId: "drone_001",
  notes: "Inspección en progreso de turbina T-004. Revisando aspa 2 de 3",
  orderIndex: 3,
  createdAt: createDate("2025-05-28T11:45:00Z"),
  updatedAt: createDate("2025-05-28T11:45:00Z"),
};

export const mockTodayPlannedActivities: Activity[] = [
  {
    id: "act_20250528_004",
    type: "LUNCH" as ActivityType,
    status: "PLANNED" as ActivityStatus,
    projectId: "proj_001",
    pilotId: "pilot_001",
    notes: "Descanso programado para almuerzo",
    orderIndex: 4,
    createdAt: createDate("2025-05-28T07:00:00Z"),
    updatedAt: createDate("2025-05-28T07:00:00Z"),
  },
  {
    id: "act_20250528_005",
    type: "TURBINE_WORK" as ActivityType,
    status: "PLANNED" as ActivityStatus,
    projectId: "proj_001",
    turbineId: "turbine_005",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Inspección programada de turbina T-005",
    orderIndex: 5,
    createdAt: createDate("2025-05-28T07:00:00Z"),
    updatedAt: createDate("2025-05-28T07:00:00Z"),
  },
  {
    id: "act_20250528_006",
    type: "TURBINE_WORK" as ActivityType,
    status: "PLANNED" as ActivityStatus,
    projectId: "proj_001",
    turbineId: "turbine_006",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Inspección programada de turbina T-006",
    orderIndex: 6,
    createdAt: createDate("2025-05-28T07:00:00Z"),
    updatedAt: createDate("2025-05-28T07:00:00Z"),
  },
  {
    id: "act_20250528_007",
    type: "TURBINE_WORK" as ActivityType,
    status: "PLANNED" as ActivityStatus,
    projectId: "proj_001",
    turbineId: "turbine_007",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Inspección programada de turbina T-007 (última del día)",
    orderIndex: 7,
    createdAt: createDate("2025-05-28T07:00:00Z"),
    updatedAt: createDate("2025-05-28T07:00:00Z"),
  },
  {
    id: "act_20250528_008",
    type: "DEMOBILIZATION" as ActivityType,
    status: "PLANNED" as ActivityStatus,
    projectId: "proj_001",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Desmontaje de equipos y retorno al hotel",
    orderIndex: 8,
    createdAt: createDate("2025-05-28T07:00:00Z"),
    updatedAt: createDate("2025-05-28T07:00:00Z"),
  },
];

// Consolidated activities array (legacy support)
export const mockActivities: Activity[] = [
  ...mockCompletedActivities,
  ...mockTodayCompletedActivities,
  mockTodayInProgressActivity,
  ...mockTodayPlannedActivities,
];

// Preflight checklists mock data
export const mockPreflightChecklists: PreflightChecklist[] = [
  {
    id: "pfc_20250527_001",
    pilotId: "pilot_001",
    droneId: "drone_001",
    projectId: "proj_001",
    checklistItems: {
      droneCondition: true,
      batteryLevel: true,
      weatherConditions: true,
      eppValidation: true,
      areaPhotography: true,
      communicationCheck: true,
    },
    areaPhotos: [
      "https://example.com/photos/area_001_20250527.jpg",
      "https://example.com/photos/area_002_20250527.jpg",
    ],
    notes: "Condiciones ideales para vuelo. Batería al 100%, viento 8 km/h",
    completed: true,
    createdAt: createDate("2025-05-27T06:30:00Z"),
    updatedAt: createDate("2025-05-27T06:45:00Z"),
  },
  {
    id: "pfc_20250528_001",
    pilotId: "pilot_001",
    droneId: "drone_001",
    projectId: "proj_001",
    checklistItems: {
      droneCondition: true,
      batteryLevel: true,
      weatherConditions: true,
      eppValidation: true,
      areaPhotography: true,
      communicationCheck: true,
    },
    areaPhotos: [
      "https://example.com/photos/area_001_20250528.jpg",
      "https://example.com/photos/area_002_20250528.jpg",
    ],
    notes: "Excelentes condiciones meteorológicas. Batería al 98%, viento 6 km/h del suroeste",
    completed: true,
    createdAt: createDate("2025-05-28T06:45:00Z"),
    updatedAt: createDate("2025-05-28T07:00:00Z"),
  },
  {
    id: "pfc_20250525_002",
    pilotId: "pilot_002",
    droneId: "drone_002",
    projectId: "proj_002",
    checklistItems: {
      droneCondition: true,
      batteryLevel: true,
      weatherConditions: false,
      eppValidation: true,
      areaPhotography: true,
      communicationCheck: true,
    },
    areaPhotos: ["https://example.com/photos/area_003_20250525.jpg"],
    notes: "Condiciones meteorológicas marginales - monitoreando velocidad del viento (15-18 km/h)",
    completed: false,
    createdAt: createDate("2025-05-25T07:00:00Z"),
    updatedAt: createDate("2025-05-25T07:15:00Z"),
  },
];

// Daily activity summaries mock data
export const mockDailyActivitySummaries: DailyActivitySummary[] = [
  // Yesterday's summary (May 27, 2025 - completed day)
  {
    date: createDate("2025-05-27"),
    pilotId: "pilot_001",
    projectId: "proj_001",
    plannedActivities: [], // No planned activities for completed days
    completedActivities: mockCompletedActivities,
    totalWorkTime: 488, // Total: 45min + 3h15min + 1h + 3h15min + 30min = 8h5min = 485min + 3min rounding
    turbinesWorked: ["turbine_001", "turbine_002"],
    preflightCompleted: true,
    photosSubmitted: true,
  },
  // Today's summary (May 28, 2025 - current day with ongoing activities)
  {
    date: createDate("2025-05-28"),
    pilotId: "pilot_001",
    projectId: "proj_001",
    plannedActivities: mockTodayPlannedActivities.sort(
      (a, b) => a.orderIndex - b.orderIndex
    ),
    completedActivities: mockTodayCompletedActivities.sort(
      (a, b) => a.orderIndex - b.orderIndex
    ),
    inProgressActivity: mockTodayInProgressActivity,
    totalWorkTime: 230, // 35min + 3h15min = 3h50min = 230 minutes
    turbinesWorked: ["turbine_003"],
    preflightCompleted: true,
    photosSubmitted: false, // Still working on today's activities
  },
  // Another pilot's summary for today (different project)
  {
    date: createDate("2025-05-28"),
    pilotId: "pilot_002",
    projectId: "proj_002",
    plannedActivities: [
      {
        id: "act_pilot2_20250528_001",
        type: "MOBILIZATION" as ActivityType,
        status: "PLANNED" as ActivityStatus,
        projectId: "proj_002",
        pilotId: "pilot_002",
        droneId: "drone_002",
        notes: "Movilización matutina hacia parque eólico Las Brisas",
        orderIndex: 1,
        createdAt: createDate("2025-05-28T06:00:00Z"),
        updatedAt: createDate("2025-05-28T06:00:00Z"),
      },
      {
        id: "act_pilot2_20250528_002",
        type: "AWAITING_PERMISSION" as ActivityType,
        status: "PLANNED" as ActivityStatus,
        projectId: "proj_002",
        pilotId: "pilot_002",
        notes: "Esperando autorización del cliente para iniciar inspecciones",
        orderIndex: 2,
        createdAt: createDate("2025-05-28T06:00:00Z"),
        updatedAt: createDate("2025-05-28T06:00:00Z"),
      },
    ],
    completedActivities: [],
    totalWorkTime: 0,
    turbinesWorked: [],
    preflightCompleted: false,
    photosSubmitted: false,
  },
];

// Helper function to get today's activity summary
export const getTodayActivitySummary = (): DailyActivitySummary => {
  const today = new Date("2025-05-28");
  return (
    mockDailyActivitySummaries.find(
      (summary) =>
        summary.date.toDateString() === today.toDateString() &&
        summary.pilotId === "pilot_001"
    ) || mockDailyActivitySummaries[1]
  ); // Fallback to pilot_001's current summary
};
