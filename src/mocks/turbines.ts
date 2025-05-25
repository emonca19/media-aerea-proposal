import { Turbine, TurbineInspectionHistory } from "../types/turbines";
import { TurbineStatus } from "../types/common";

export const mockTurbines: Turbine[] = [
  {
    id: "turbine_001",
    name: "WFA-T001",
    windPark: {
      id: "park_001",
      name: "WindFarm Alpha",
      location: {
        latitude: 41.2033,
        longitude: -77.1945,
        address: "WindFarm Alpha Site, Pennsylvania, USA"
      },
      clientId: "client_001",
      projectId: "proj_001",
      mapImage: "https://example.com/maps/windfarm_alpha.jpg",
      turbines: [], // Would be populated with all turbines
      notes: "Primary wind farm with 24 turbines",
      createdAt: new Date("2023-01-15T10:00:00Z"),
      updatedAt: new Date("2025-05-20T08:00:00Z")
    },
    project: {
      id: "proj_001",
      name: "WindFarm Alpha Inspection Q2 2025",
      description: "Comprehensive quarterly inspection of all turbines at WindFarm Alpha site",
      clientId: "client_001",
      windParkId: "park_001",
      startDate: new Date("2025-05-20"),
      endDate: new Date("2025-06-15"),
      estimatedDuration: 26,
      status: "ACTIVE",
      assignedPilots: ["pilot_001", "pilot_003"],
      assignedDrones: ["drone_001", "drone_003"],
      notes: "Priority project for Q2 completion",
      createdAt: new Date("2025-05-15T10:00:00Z"),
      updatedAt: new Date("2025-05-20T08:00:00Z")
    },
    status: "PHOTOS_UPLOADED" as TurbineStatus,
    position: { x: 100, y: 150 },
    lastInspection: new Date("2025-05-23T10:30:00Z"),
    nextInspection: new Date("2025-08-23T10:30:00Z"),
    notes: "Blade tip shows minor wear, monitor for next inspection",
    createdAt: new Date("2023-01-15T10:00:00Z"),
    updatedAt: new Date("2025-05-23T10:30:00Z")
  },
  {
    id: "turbine_002",
    name: "WFA-T002",
    windPark: {
      id: "park_001",
      name: "WindFarm Alpha",
      location: {
        latitude: 41.2033,
        longitude: -77.1945,
        address: "WindFarm Alpha Site, Pennsylvania, USA"
      },
      clientId: "client_001",
      projectId: "proj_001",
      mapImage: "https://example.com/maps/windfarm_alpha.jpg",
      turbines: [],
      notes: "Primary wind farm with 24 turbines",
      createdAt: new Date("2023-01-15T10:00:00Z"),
      updatedAt: new Date("2025-05-20T08:00:00Z")
    },
    project: {
      id: "proj_001",
      name: "WindFarm Alpha Inspection Q2 2025",
      description: "Comprehensive quarterly inspection of all turbines at WindFarm Alpha site",
      clientId: "client_001",
      windParkId: "park_001",
      startDate: new Date("2025-05-20"),
      endDate: new Date("2025-06-15"),
      estimatedDuration: 26,
      status: "ACTIVE",
      assignedPilots: ["pilot_001", "pilot_003"],
      assignedDrones: ["drone_001", "drone_003"],
      notes: "Priority project for Q2 completion",
      createdAt: new Date("2025-05-15T10:00:00Z"),
      updatedAt: new Date("2025-05-20T08:00:00Z")
    },
    status: "APPROVED" as TurbineStatus,
    position: { x: 200, y: 150 },
    lastInspection: new Date("2025-05-22T14:15:00Z"),
    nextInspection: new Date("2025-08-22T14:15:00Z"),
    notes: "All systems normal, excellent condition",
    createdAt: new Date("2023-01-15T10:00:00Z"),
    updatedAt: new Date("2025-05-22T14:15:00Z")
  },
  {
    id: "turbine_003",
    name: "WFA-T003",
    windPark: {
      id: "park_001",
      name: "WindFarm Alpha",
      location: {
        latitude: 41.2033,
        longitude: -77.1945,
        address: "WindFarm Alpha Site, Pennsylvania, USA"
      },
      clientId: "client_001",
      projectId: "proj_001",
      mapImage: "https://example.com/maps/windfarm_alpha.jpg",
      turbines: [],
      notes: "Primary wind farm with 24 turbines",
      createdAt: new Date("2023-01-15T10:00:00Z"),
      updatedAt: new Date("2025-05-20T08:00:00Z")
    },
    project: {
      id: "proj_001",
      name: "WindFarm Alpha Inspection Q2 2025",
      description: "Comprehensive quarterly inspection of all turbines at WindFarm Alpha site",
      clientId: "client_001",
      windParkId: "park_001",
      startDate: new Date("2025-05-20"),
      endDate: new Date("2025-06-15"),
      estimatedDuration: 26,
      status: "ACTIVE",
      assignedPilots: ["pilot_001", "pilot_003"],
      assignedDrones: ["drone_001", "drone_003"],
      notes: "Priority project for Q2 completion",
      createdAt: new Date("2025-05-15T10:00:00Z"),
      updatedAt: new Date("2025-05-20T08:00:00Z")
    },
    status: "INSPECTED" as TurbineStatus,
    position: { x: 300, y: 150 },
    lastInspection: new Date("2025-05-24T09:45:00Z"),
    nextInspection: new Date("2025-08-24T09:45:00Z"),
    notes: "Inspection completed, awaiting photo upload",
    createdAt: new Date("2023-01-15T10:00:00Z"),
    updatedAt: new Date("2025-05-24T09:45:00Z")
  },
  {
    id: "turbine_004",
    name: "CWF-T001",
    windPark: {
      id: "park_002",
      name: "Coastal Wind Farm Beta",
      location: {
        latitude: 39.7392,
        longitude: -74.4231,
        address: "Coastal Wind Farm Beta, New Jersey, USA"
      },
      clientId: "client_003",
      projectId: "proj_002",
      mapImage: "https://example.com/maps/coastal_beta.jpg",
      turbines: [],
      notes: "Coastal installation with marine environment considerations",
      createdAt: new Date("2024-02-10T09:00:00Z"),
      updatedAt: new Date("2025-04-15T08:00:00Z")
    },
    project: {
      id: "proj_002",
      name: "Coastal Wind Inspection Phase 1",
      description: "Initial inspection phase for new coastal wind farm installation",
      clientId: "client_003",
      windParkId: "park_002",
      startDate: new Date("2025-04-15"),
      endDate: new Date("2025-05-30"),
      estimatedDuration: 45,
      status: "ACTIVE",
      assignedPilots: ["pilot_002"],
      assignedDrones: ["drone_002"],
      notes: "Weather dependent - monitor marine conditions",
      createdAt: new Date("2025-04-10T09:30:00Z"),
      updatedAt: new Date("2025-05-22T14:15:00Z")
    },
    status: "NOT_STARTED" as TurbineStatus,
    position: { x: 50, y: 100 },
    nextInspection: new Date("2025-05-25T08:00:00Z"),
    notes: "Scheduled for inspection pending weather conditions",
    createdAt: new Date("2024-02-10T09:00:00Z"),
    updatedAt: new Date("2025-04-15T08:00:00Z")
  },
  {
    id: "turbine_005",
    name: "MR-T001",
    windPark: {
      id: "park_003",
      name: "Mountain Ridge Wind Farm",
      location: {
        latitude: 44.2619,
        longitude: -72.5806,
        address: "Mountain Ridge Wind Farm, Vermont, USA"
      },
      clientId: "client_002",
      projectId: "proj_003",
      mapImage: "https://example.com/maps/mountain_ridge.jpg",
      turbines: [],
      notes: "High altitude installation requiring special equipment",
      createdAt: new Date("2023-09-05T11:00:00Z"),
      updatedAt: new Date("2025-05-22T08:00:00Z")
    },
    project: {
      id: "proj_003",
      name: "Mountain Ridge Emergency Inspection",
      description: "Emergency inspection following storm damage reports",
      clientId: "client_002",
      windParkId: "park_003",
      startDate: new Date("2025-05-22"),
      endDate: new Date("2025-06-05"),
      estimatedDuration: 14,
      status: "ACTIVE",
      assignedPilots: ["pilot_004"],
      assignedDrones: ["drone_004"],
      notes: "High priority emergency inspection",
      createdAt: new Date("2025-05-22T08:00:00Z"),
      updatedAt: new Date("2025-05-22T08:00:00Z")
    },
    status: "PHOTOS_REJECTED" as TurbineStatus,
    position: { x: 125, y: 75 },
    lastInspection: new Date("2025-05-23T11:30:00Z"),
    nextInspection: new Date("2025-05-25T11:30:00Z"),
    notes: "Photos rejected due to storm damage obscuring view - re-inspection required",
    createdAt: new Date("2023-09-05T11:00:00Z"),
    updatedAt: new Date("2025-05-23T16:00:00Z")
  }
];

export const mockTurbineInspectionHistories: TurbineInspectionHistory[] = [
  {
    turbine: mockTurbines[0], // WFA-T001
    inspections: [
      {
        date: new Date("2025-05-23T10:30:00Z"),
        pilotId: "pilot_001",
        pilotName: "John Smith",
        photoSubmission: {
          id: "photo_sub_001",
          pilotId: "pilot_001",
          pilotName: "John Smith",
          projectId: "proj_001",
          projectName: "WindFarm Alpha Inspection Q2 2025",
          submissionDate: new Date("2025-05-23T09:00:00Z"),
          driveLink: "https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J",
          turbinesInspected: ["turbine_001", "turbine_002", "turbine_003"],
          photoSubmissionReview: {
            status: "APPROVED",
            completeness: 95,
            legibility: 92,
            reviewedBy: "admin_001",
            reviewedAt: new Date("2025-05-23T10:30:00Z")
          },
          createdAt: new Date("2025-05-23T09:00:00Z"),
          updatedAt: new Date("2025-05-23T10:30:00Z")
        },
        notes: "Routine quarterly inspection - blade tip shows minor wear"
      },
      {
        date: new Date("2025-02-15T14:20:00Z"),
        pilotId: "pilot_003",
        pilotName: "Mike Rodriguez",
        notes: "Previous quarterly inspection - all systems normal"
      }
    ]
  },
  {
    turbine: mockTurbines[1], // WFA-T002
    inspections: [
      {
        date: new Date("2025-05-22T14:15:00Z"),
        pilotId: "pilot_001",
        pilotName: "John Smith",
        photoSubmission: {
          id: "photo_sub_001",
          pilotId: "pilot_001",
          pilotName: "John Smith",
          projectId: "proj_001",
          projectName: "WindFarm Alpha Inspection Q2 2025",
          submissionDate: new Date("2025-05-23T09:00:00Z"),
          driveLink: "https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J",
          turbinesInspected: ["turbine_001", "turbine_002", "turbine_003"],
          photoSubmissionReview: {
            status: "APPROVED",
            completeness: 95,
            legibility: 92,
            reviewedBy: "admin_001",
            reviewedAt: new Date("2025-05-23T10:30:00Z")
          },
          createdAt: new Date("2025-05-23T09:00:00Z"),
          updatedAt: new Date("2025-05-23T10:30:00Z")
        },
        notes: "Excellent condition - all systems normal"
      }
    ]
  },
  {
    turbine: mockTurbines[4], // MR-T001
    inspections: [
      {
        date: new Date("2025-05-23T11:30:00Z"),
        pilotId: "pilot_004",
        pilotName: "Emma Davis",
        photoSubmission: {
          id: "photo_sub_006",
          pilotId: "pilot_004",
          pilotName: "Emma Davis",
          projectId: "proj_003",
          projectName: "Mountain Ridge Emergency Inspection",
          submissionDate: new Date("2025-05-23T12:00:00Z"),
          driveLink: "https://drive.google.com/drive/folders/6F7G8H9I0J1K2L3M4N5O",
          turbinesInspected: ["turbine_005"],
          photoSubmissionReview: {
            status: "REJECTED",
            completeness: 60,
            legibility: 45,
            reviewedBy: "admin_001",
            reviewedAt: new Date("2025-05-23T16:00:00Z"),
            rejectionReason: "Storm damage debris obscuring blade view - requires re-inspection"
          },
          createdAt: new Date("2025-05-23T12:00:00Z"),
          updatedAt: new Date("2025-05-23T16:00:00Z")
        },
        notes: "Emergency inspection due to storm damage reports - photos rejected due to debris"
      }
    ]
  }
];
