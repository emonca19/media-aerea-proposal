import { Activity, Project, Turbine, User } from "../types";

export const mockUser: User = {
  id: "1",
  email: "piloto@example.com",
  name: "Juan Piloto",
  role: "PILOT",
  active: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

export const mockPhotos = [
  {
    id: "1",
    projectId: "1",
    turbineId: "1",
    url: "https://example.com/photo1.jpg",
    category: "BLADE",
    timestamp: new Date(),
    notes: "Inspección inicial",
  },
];

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Inspección Parque Norte",
    clientId: "1",
    contractId: "1",
    windParkId: "1",
    startDate: new Date("2025-05-20"),
    endDate: new Date("2025-06-20"),
    estimatedDuration: 31,
    status: "ACTIVE",
    description: "Inspección completa del parque eólico zona norte",
    assignedPilots: ["1"],
    assignedDrones: ["1"],
    createdAt: new Date("2025-05-15"),
    updatedAt: new Date("2025-05-20"),
  },
  {
    id: "2",
    name: "Mantenimiento Parque Sur",
    clientId: "2",
    contractId: "2",
    windParkId: "1",
    startDate: new Date("2025-06-01"),
    endDate: new Date("2025-07-01"),
    estimatedDuration: 30,
    status: "PAUSED",
    description: "Mantenimiento preventivo parque sur",
    assignedPilots: ["1", "2"],
    assignedDrones: ["1"],
    createdAt: new Date("2025-05-25"),
    updatedAt: new Date("2025-06-15"),
  },
  {
    id: "3",
    name: "Revisión Parque Este",
    clientId: "1",
    contractId: "3",
    windParkId: "1",
    startDate: new Date("2025-07-01"),
    endDate: new Date("2025-08-01"),
    estimatedDuration: 31,
    status: "COMPLETED",
    description: "Revisión técnica del parque eólico en la zona este",
    assignedPilots: ["1"],
    assignedDrones: ["1"],
    createdAt: new Date("2025-06-20"),
    updatedAt: new Date("2025-08-01"),
  },
  {
    id: "4",
    name: "Inspección Parque Oeste",
    clientId: "2",
    contractId: "4",
    windParkId: "1",
    startDate: new Date("2025-08-15"),
    endDate: new Date("2025-09-15"),
    estimatedDuration: 31,
    status: "ACTIVE",
    description: "Inspección de turbinas en el parque eólico oeste",
    assignedPilots: ["1", "2"],
    assignedDrones: ["1"],
    createdAt: new Date("2025-08-01"),
    updatedAt: new Date("2025-08-15"),
  },
  {
    id: "5",
    name: "Prueba Parque Centro",
    clientId: "1",
    contractId: "5",
    windParkId: "1",
    startDate: new Date("2025-09-01"),
    endDate: new Date("2025-09-10"),
    estimatedDuration: 9,
    status: "ACTIVE",
    description: "Pruebas de rendimiento en el parque eólico centro",
    assignedPilots: ["1"],
    assignedDrones: ["1"],
    createdAt: new Date("2025-08-20"),
    updatedAt: new Date("2025-09-01"),
  },
  {
    id: "6",
    name: "Auditoría Parque Oeste",
    clientId: "2",
    contractId: "6",
    windParkId: "1",
    startDate: new Date("2025-10-01"),
    endDate: new Date("2025-10-05"),
    estimatedDuration: 4,
    status: "ACTIVE",
    description: "Auditoría de cumplimiento normativo en el parque oeste",
    assignedPilots: ["2"],
    assignedDrones: ["1"],
    createdAt: new Date("2025-09-15"),
    updatedAt: new Date("2025-10-01"),
  },
];

export interface WindPark {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  projectId: string;
  clientId: string;
}

export interface Drone {
  id: string;
  model: string;
  serialNumber: string;
}

export const mockDrones: Drone[] = [
  {
    id: "1",
    model: "DJI Phantom 4",
    serialNumber: "SN-12345",
  },
];

export const mockParks: WindPark[] = [
  {
    id: "1",
    name: "Parque Eólico Ejemplo",
    location: {
      latitude: 25.7617,
      longitude: -100.1234,
      address: "Dirección del parque",
    },
    projectId: "1",
    clientId: "1",
  },
];

export const mockTurbines: Turbine[] = [
  {
    id: "1",
    name: "T-001",
    windParkId: "1",
    projectId: "1",
    status: "NOT_STARTED",
    specifications: {
      model: "Vestas V150",
      height: 120,
      bladeLength: 75,
      capacity: 2.5,
    },
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
  {
    id: "2",
    name: "T-002",
    windParkId: "1",
    projectId: "1",
    status: "INSPECTED",
    lastInspection: new Date("2025-05-17"),
    specifications: {
      model: "Vestas V150",
      height: 120,
      bladeLength: 75,
      capacity: 2.5,
    },
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-05-17"),
  },
];

export const mockActivities: Activity[] = [
  {
    id: "1",
    type: "MOBILIZATION",
    startTime: new Date("2025-05-18T08:00:00"),
    endTime: new Date("2025-05-18T09:00:00"),
    projectId: "1",
    pilotId: "1",
    notes: "Traslado al parque",
    createdAt: new Date("2025-05-18T08:00:00"),
    updatedAt: new Date("2025-05-18T09:00:00"),
  },
  {
    id: "2",
    type: "TURBINE_WORK",
    startTime: new Date("2025-05-18T09:00:00"),
    endTime: new Date("2025-05-18T11:00:00"),
    projectId: "1",
    turbineId: "1",
    pilotId: "1",
    notes: "Inspección completa de T-001",
    createdAt: new Date("2025-05-18T09:00:00"),
    updatedAt: new Date("2025-05-18T11:00:00"),
  },
];

export const mockUsers: User[] = [
  {
    id: "1",
    email: "piloto@example.com",
    name: "Juan Piloto",
    role: "PILOT",
    active: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
  {
    id: "2",
    email: "admin@example.com",
    name: "Ana Administradora",
    role: "ADMIN",
    active: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
  {
    id: "3",
    email: "super@example.com",
    name: "Carlos SuperAdmin",
    role: "SUPER_ADMIN",
    active: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
];
