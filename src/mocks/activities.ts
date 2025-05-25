import {
  Activity,
  DailyActivitySummary,
  PreflightChecklist,
} from "../types/activities";
import { ActivityStatus, ActivityType } from "../types/common";

// Completed activities (from previous day)
export const mockCompletedActivities: Activity[] = [
  {
    id: "act_001",
    type: "MOBILIZATION" as ActivityType,
    status: "COMPLETED" as ActivityStatus,
    startTime: new Date("2025-05-24T07:00:00Z"),
    endTime: new Date("2025-05-24T07:30:00Z"),
    durationSeconds: 1800,
    projectId: "proj_001",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Setting up equipment and preparing for the day",
    customCode: "MOB-001",
    orderIndex: 1,
    createdAt: new Date("2025-05-24T07:00:00Z"),
    updatedAt: new Date("2025-05-24T07:30:00Z"),
  },
  {
    id: "act_002",
    type: "TURBINE_WORK" as ActivityType,
    status: "COMPLETED" as ActivityStatus,
    startTime: new Date("2025-05-24T08:00:00Z"),
    endTime: new Date("2025-05-24T10:30:00Z"),
    durationSeconds: 9000,
    projectId: "proj_001",
    turbineId: "turbine_001",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Inspecting turbine blades and tower",
    customCode: "TW-001",
    orderIndex: 2,
    createdAt: new Date("2025-05-24T08:00:00Z"),
    updatedAt: new Date("2025-05-24T10:30:00Z"),
  },
  {
    id: "act_003",
    type: "LUNCH" as ActivityType,
    status: "COMPLETED" as ActivityStatus,
    startTime: new Date("2025-05-24T12:00:00Z"),
    endTime: new Date("2025-05-24T13:00:00Z"),
    durationSeconds: 3600,
    projectId: "proj_001",
    pilotId: "pilot_001",
    notes: "Lunch break",
    orderIndex: 3,
    createdAt: new Date("2025-05-24T12:00:00Z"),
    updatedAt: new Date("2025-05-24T13:00:00Z"),
  },
];

// Current day activities (May 25, 2025)
export const mockTodayCompletedActivities: Activity[] = [
  {
    id: "act_today_001",
    type: "MOBILIZATION" as ActivityType,
    status: "COMPLETED" as ActivityStatus,
    startTime: new Date("2025-05-25T07:00:00Z"),
    endTime: new Date("2025-05-25T07:30:00Z"),
    durationSeconds: 1800,
    projectId: "proj_001",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Morning setup completed",
    customCode: "MOB-002",
    orderIndex: 1,
    createdAt: new Date("2025-05-25T07:00:00Z"),
    updatedAt: new Date("2025-05-25T07:30:00Z"),
  },
  {
    id: "act_today_002",
    type: "TURBINE_WORK" as ActivityType,
    status: "COMPLETED" as ActivityStatus,
    startTime: new Date("2025-05-25T08:00:00Z"),
    endTime: new Date("2025-05-25T10:00:00Z"),
    durationSeconds: 7200,
    projectId: "proj_001",
    turbineId: "turbine_003",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Turbine 3 inspection completed",
    customCode: "TW-003",
    orderIndex: 2,
    createdAt: new Date("2025-05-25T08:00:00Z"),
    updatedAt: new Date("2025-05-25T10:00:00Z"),
  },
];

export const mockTodayInProgressActivity: Activity = {
  id: "act_today_003",
  type: "TURBINE_WORK" as ActivityType,
  status: "IN_PROGRESS" as ActivityStatus,
  startTime: new Date("2025-05-25T10:30:00Z"),
  projectId: "proj_001",
  turbineId: "turbine_004",
  pilotId: "pilot_001",
  droneId: "drone_001",
  notes: "Currently inspecting turbine 4",
  customCode: "TW-004",
  orderIndex: 3,
  createdAt: new Date("2025-05-25T10:30:00Z"),
  updatedAt: new Date("2025-05-25T10:30:00Z"),
};

export const mockTodayPlannedActivities: Activity[] = [
  {
    id: "act_today_004",
    type: "LUNCH" as ActivityType,
    status: "PLANNED" as ActivityStatus,
    projectId: "proj_001",
    pilotId: "pilot_001",
    notes: "Planned lunch break",
    orderIndex: 4,
    createdAt: new Date("2025-05-25T07:00:00Z"),
    updatedAt: new Date("2025-05-25T07:00:00Z"),
  },
  {
    id: "act_today_005",
    type: "TURBINE_WORK" as ActivityType,
    status: "PLANNED" as ActivityStatus,
    projectId: "proj_001",
    turbineId: "turbine_005",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Planned inspection of turbine 5",
    customCode: "TW-005",
    orderIndex: 5,
    createdAt: new Date("2025-05-25T07:00:00Z"),
    updatedAt: new Date("2025-05-25T07:00:00Z"),
  },
  {
    id: "act_today_006",
    type: "TURBINE_WORK" as ActivityType,
    status: "PLANNED" as ActivityStatus,
    projectId: "proj_001",
    turbineId: "turbine_006",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "Planned inspection of turbine 6",
    customCode: "TW-006",
    orderIndex: 6,
    createdAt: new Date("2025-05-25T07:00:00Z"),
    updatedAt: new Date("2025-05-25T07:00:00Z"),
  },
  {
    id: "act_today_007",
    type: "DEMOBILIZATION" as ActivityType,
    status: "PLANNED" as ActivityStatus,
    projectId: "proj_001",
    pilotId: "pilot_001",
    droneId: "drone_001",
    notes: "End of day cleanup and equipment packing",
    customCode: "DEMOB-002",
    orderIndex: 7,
    createdAt: new Date("2025-05-25T07:00:00Z"),
    updatedAt: new Date("2025-05-25T07:00:00Z"),
  },
];

// Legacy activities for backwards compatibility
export const mockActivities: Activity[] = [
  ...mockCompletedActivities,
  ...mockTodayCompletedActivities,
  mockTodayInProgressActivity,
  ...mockTodayPlannedActivities,
];

export const mockPreflightChecklists: PreflightChecklist[] = [
  {
    id: "pfc_001",
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
      "https://example.com/photos/area_001.jpg",
      "https://example.com/photos/area_002.jpg",
    ],
    notes: "All systems green, ready for operation",
    completed: true,
    createdAt: new Date("2025-05-24T06:30:00Z"),
    updatedAt: new Date("2025-05-24T06:45:00Z"),
  },
  {
    id: "pfc_002",
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
    areaPhotos: ["https://example.com/photos/area_003.jpg"],
    notes: "Weather conditions marginal - monitoring wind speeds",
    completed: false,
    createdAt: new Date("2025-05-24T07:00:00Z"),
    updatedAt: new Date("2025-05-24T07:15:00Z"),
  },
];

export const mockDailyActivitySummaries: DailyActivitySummary[] = [
  // Yesterday's summary (completed day)
  {
    date: new Date("2025-05-24"),
    pilotId: "pilot_001",
    projectId: "proj_001",
    plannedActivities: [], // No planned activities for past days
    completedActivities: mockCompletedActivities,
    totalWorkTime: 240, // 4 hours in minutes (1800 + 9000 + 3600 seconds = 14400 seconds = 240 minutes)
    turbinesWorked: ["turbine_001"],
    preflightCompleted: true,
    photosSubmitted: true,
  },
  // Today's summary (current day with mix of completed, in-progress, and planned)
  {
    date: new Date("2025-05-25"),
    pilotId: "pilot_001",
    projectId: "proj_001",
    plannedActivities: mockTodayPlannedActivities.sort(
      (a, b) => a.orderIndex - b.orderIndex
    ),
    completedActivities: mockTodayCompletedActivities.sort(
      (a, b) => a.orderIndex - b.orderIndex
    ),
    inProgressActivity: mockTodayInProgressActivity,
    totalWorkTime: 150, // 2.5 hours in minutes (1800 + 7200 seconds = 9000 seconds = 150 minutes)
    turbinesWorked: ["turbine_003"],
    preflightCompleted: true,
    photosSubmitted: false,
  },
  // Another pilot's summary for today
  {
    date: new Date("2025-05-25"),
    pilotId: "pilot_002",
    projectId: "proj_002",
    plannedActivities: [
      {
        id: "act_pilot2_001",
        type: "MOBILIZATION" as ActivityType,
        status: "PLANNED" as ActivityStatus,
        projectId: "proj_002",
        pilotId: "pilot_002",
        droneId: "drone_002",
        notes: "Morning setup for pilot 2",
        orderIndex: 1,
        createdAt: new Date("2025-05-25T06:00:00Z"),
        updatedAt: new Date("2025-05-25T06:00:00Z"),
      },
      {
        id: "act_pilot2_002",
        type: "AWAITING_PERMISSION" as ActivityType,
        status: "PLANNED" as ActivityStatus,
        projectId: "proj_002",
        pilotId: "pilot_002",
        notes: "Waiting for client approval",
        orderIndex: 2,
        createdAt: new Date("2025-05-25T06:00:00Z"),
        updatedAt: new Date("2025-05-25T06:00:00Z"),
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
  return (
    mockDailyActivitySummaries.find(
      (summary) =>
        summary.date.toDateString() === new Date("2025-05-25").toDateString()
    ) || mockDailyActivitySummaries[1]
  ); // Fallback to pilot_001's summary
};
