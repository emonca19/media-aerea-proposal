import {
  DroneAvailability,
  PilotAvailability,
  ProjectAssignment,
} from "../types/assignments";

export interface CameraAvailability {
  cameraId: string;
  cameraName: string;
  model: string;
  available: boolean;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE";
}

export const mockProjectAssignments: ProjectAssignment[] = [
  {
    id: "assign_001",
    projectId: "proj_001",
    pilotIds: ["pilot_001", "pilot_003"],
    droneIds: ["drone_001", "drone_003"],
    cameraIds: ["camera_001"],
    turbineIds: ["turbine_001", "turbine_002", "turbine_003"],
    estimatedStartDate: new Date("2025-05-20"),
    estimatedEndDate: new Date("2025-06-15"),
    estimatedDuration: 27,
    assignedBy: "admin_001",
    notes: "Asignación principal para inspección Parque Eólico Alfa",
    createdAt: new Date("2025-05-15T10:00:00Z"),
    updatedAt: new Date("2025-05-18T14:30:00Z"),
  },
  {
    id: "assign_002",
    projectId: "proj_002",
    pilotIds: ["pilot_002"],
    droneIds: ["drone_002"],
    cameraIds: ["camera_003"],
    turbineIds: ["turbine_004", "turbine_005"],
    estimatedStartDate: new Date("2025-06-01"),
    estimatedEndDate: new Date("2025-06-20"),
    estimatedDuration: 20,
    assignedBy: "admin_001",
    notes: "Pendiente confirmación del piloto para parque eólico costero",
    createdAt: new Date("2025-05-20T09:00:00Z"),
    updatedAt: new Date("2025-05-20T09:00:00Z"),
  },
  {
    id: "assign_003",
    projectId: "proj_003",
    pilotIds: ["pilot_004"],
    droneIds: ["drone_004"],
    cameraIds: ["camera_007"],
    turbineIds: ["turbine_006", "turbine_007", "turbine_008", "turbine_009"],
    estimatedStartDate: new Date("2025-06-25"),
    estimatedEndDate: new Date("2025-07-10"),
    estimatedDuration: 16,
    assignedBy: "admin_002",
    notes: "Asignación de inspección de emergencia",
    createdAt: new Date("2025-05-22T16:00:00Z"),
    updatedAt: new Date("2025-05-23T08:00:00Z"),
  },
];

export const mockPilotAvailability: PilotAvailability[] = [
  {
    pilotId: "pilot_001",
    pilotName: "Juan Carlos Méndez",
    available: true,
    availability: [
      {
        startDate: new Date("2025-05-25"),
        endDate: new Date("2025-06-15"),
      },
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
    available: true,
    availability: [
      {
        startDate: new Date("2025-05-25"),
        endDate: new Date("2025-06-15"),
      },
      {
        startDate: new Date("2025-06-16"),
        endDate: new Date("2025-09-30"),
      },
    ],
  },
  {
    pilotId: "pilot_004",
    pilotName: "Carmen Elena Vásquez",
    available: true,
    availability: [
      {
        startDate: new Date("2025-05-26"),
        endDate: new Date("2025-06-30"),
      },
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
    serialNumber: "M3E001234567",
    available: true,
    status: "OPERATIONAL",
  },
  {
    droneId: "drone_002",
    droneName: "DJI Mavic 3 - Unidad 002",
    serialNumber: "M3E002345678",
    available: true,
    status: "OPERATIONAL",
  },
  {
    droneId: "drone_003",
    droneName: "DJI Mavic 3 - Unidad 003",
    serialNumber: "M3E003456789",
    available: true,
    status: "OPERATIONAL",
  },
  {
    droneId: "drone_004",
    droneName: "DJI Air 2S - Unidad 001",
    serialNumber: "A2S001234567",
    available: true,
    status: "OPERATIONAL",
  },
  {
    droneId: "drone_005",
    droneName: "DJI Mini 3 Pro - Unidad 001",
    serialNumber: "M3P001234567",
    available: false,
    status: "MAINTENANCE",
  },
  {
    droneId: "drone_006",
    droneName: "Autel EVO Lite+ - Unidad 001",
    serialNumber: "EL+001234567",
    available: true,
    status: "OPERATIONAL",
  },
];

export const mockCameraAvailability: CameraAvailability[] = [
  {
    cameraId: "camera_002",
    cameraName: "DJI Zenmuse X7",
    model: "Zenmuse X7",
    available: true,
    status: "AVAILABLE",
  },
  {
    cameraId: "camera_004",
    cameraName: "FLIR Vue TZ20-R",
    model: "Vue TZ20-R",
    available: true,
    status: "AVAILABLE",
  },
  {
    cameraId: "camera_006",
    cameraName: "Sentera PHX",
    model: "PHX",
    available: true,
    status: "AVAILABLE",
  },
  {
    cameraId: "camera_001",
    cameraName: "DJI Zenmuse H20T",
    model: "Zenmuse H20T",
    available: false,
    status: "IN_USE",
  },
  {
    cameraId: "camera_003",
    cameraName: "DJI Zenmuse P1",
    model: "Zenmuse P1",
    available: false,
    status: "IN_USE",
  },
  {
    cameraId: "camera_007",
    cameraName: "Insta360 Sphere",
    model: "Sphere",
    available: false,
    status: "IN_USE",
  },
  {
    cameraId: "camera_005",
    cameraName: "DJI Zenmuse Z30",
    model: "Zenmuse Z30",
    available: false,
    status: "MAINTENANCE",
  },
];
