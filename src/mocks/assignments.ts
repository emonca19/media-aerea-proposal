import {
  DroneAvailability,
  PilotAvailability,
  ProjectAssignment,
} from "../types/assignments";

export const mockProjectAssignments: ProjectAssignment[] = [
  {
    id: "assign_001",
    projectId: "proj_001",
    pilotIds: ["pilot_001", "pilot_003"],
    droneIds: ["drone_001", "drone_003"],
    estimatedStartDate: new Date("2025-05-20"),
    estimatedEndDate: new Date("2025-06-15"),
    estimatedDuration: 26,
    assignedBy: "admin_001",
    confirmed: true,
    notes: "Asignación principal para inspección Parque Eólico Alfa",
    createdAt: new Date("2025-05-15T10:00:00Z"),
    updatedAt: new Date("2025-05-18T14:30:00Z"),
  },
  {
    id: "assign_002",
    projectId: "proj_002",
    pilotIds: ["pilot_002"],
    droneIds: ["drone_002"],
    estimatedStartDate: new Date("2025-06-01"),
    estimatedEndDate: new Date("2025-06-20"),
    estimatedDuration: 19,
    assignedBy: "admin_001",
    confirmed: false,
    notes: "Pendiente confirmación del piloto para parque eólico costero",
    createdAt: new Date("2025-05-20T09:00:00Z"),
    updatedAt: new Date("2025-05-20T09:00:00Z"),
  },
  {
    id: "assign_003",
    projectId: "proj_003",
    pilotIds: ["pilot_004"],
    droneIds: ["drone_004"],
    estimatedStartDate: new Date("2025-06-25"),
    estimatedEndDate: new Date("2025-07-10"),
    estimatedDuration: 15,
    assignedBy: "admin_002",
    confirmed: true,
    notes: "Asignación de inspección de emergencia",
    createdAt: new Date("2025-05-22T16:00:00Z"),
    updatedAt: new Date("2025-05-23T08:00:00Z"),
  },
];

export const mockPilotAvailability: PilotAvailability[] = [
  {
    pilotId: "pilot_001",
    pilotName: "Juan Carlos Méndez",
    available: false,
    currentProject: "proj_001",
    availability: [
      {
        startDate: new Date("2025-06-16"),
        endDate: new Date("2025-07-31"),
      },
    ],
  },
  {
    pilotId: "pilot_002",
    pilotName: "Ana Patricia Morales",
    available: true,
    availability: [
      {
        startDate: new Date("2025-05-24"),
        endDate: new Date("2025-05-31"),
      },
      {
        startDate: new Date("2025-06-21"),
        endDate: new Date("2025-08-15"),
      },
    ],
  },
  {
    pilotId: "pilot_003",
    pilotName: "Miguel Rodríguez",
    available: false,
    currentProject: "proj_001",
    availability: [
      {
        startDate: new Date("2025-06-16"),
        endDate: new Date("2025-09-30"),
      },
    ],
  },
  {
    pilotId: "pilot_004",
    pilotName: "Carmen Elena Vásquez",
    available: false,
    currentProject: "proj_003",
    availability: [
      {
        startDate: new Date("2025-07-11"),
        endDate: new Date("2025-12-31"),
      },
    ],
  },
];

export const mockDroneAvailability: DroneAvailability[] = [
  {
    droneId: "drone_001",
    droneName: "DJI Mavic 3 - Unidad 001",
    available: false,
    currentProject: "proj_001",
    status: "OPERATIONAL",
    assignedTo: "pilot_001",
  },
  {
    droneId: "drone_002",
    droneName: "DJI Mavic 3 - Unidad 002",
    available: true,
    status: "OPERATIONAL",
  },
  {
    droneId: "drone_003",
    droneName: "DJI Mavic 3 - Unidad 003",
    available: false,
    currentProject: "proj_001",
    status: "OPERATIONAL",
    assignedTo: "pilot_003",
  },
  {
    droneId: "drone_004",
    droneName: "DJI Air 2S - Unidad 001",
    available: false,
    currentProject: "proj_003",
    status: "OPERATIONAL",
    assignedTo: "pilot_004",
  },
  {
    droneId: "drone_005",
    droneName: "DJI Mini 3 Pro - Unidad 001",
    available: false,
    status: "MAINTENANCE",
  },
];
