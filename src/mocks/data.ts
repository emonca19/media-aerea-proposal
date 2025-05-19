import { Activity, Project, Turbine, User, WindPark } from '../types';

export const mockUser: User = {
  id: '1',
  email: 'piloto@example.com',
  name: 'Juan Piloto',
  role: 'PILOT',
  active: true,
};

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Inspección Parque Norte',
    clientId: '1',
    contractId: '1',
    startDate: new Date('2025-05-20'),
    endDate: new Date('2025-06-20'),
    status: 'ACTIVE',
    description: 'Inspección completa del parque eólico zona norte',
  },
  {
    id: '2',
    name: 'Mantenimiento Parque Sur',
    clientId: '2',
    contractId: '2',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-07-01'),
    status: 'PAUSED',
    description: 'Mantenimiento preventivo parque sur',
  },
  {
    id: '3',
    name: 'Revisión Parque Este',
    clientId: '1',
    contractId: '3',
    startDate: new Date('2025-07-01'),
    endDate: new Date('2025-08-01'),
    status: 'COMPLETED',
    description: 'Revisión técnica del parque eólico en la zona este',
  },
  {
    id: '4',
    name: 'Inspección Parque Oeste',
    clientId: '2',
    contractId: '4',
    startDate: new Date('2025-08-15'),
    endDate: new Date('2025-09-15'),
    status: 'ACTIVE',
    description: 'Inspección de turbinas en el parque eólico oeste',
  },
  {
    id: '5',
    name: 'Prueba Parque Centro',
    clientId: '1',
    contractId: '5',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-09-10'),
    status: 'ACTIVE',
    description: 'Pruebas de rendimiento en el parque eólico centro',
  },
  {
    id: '6',
    name: 'Auditoría Parque Oeste',
    clientId: '2',
    contractId: '6',
    startDate: new Date('2025-10-01'),
    endDate: new Date('2025-10-05'),
    status: 'ACTIVE', // Changed from 'SCHEDULED' to 'ACTIVE' to match the allowed statuses
    description: 'Auditoría de cumplimiento normativo en el parque oeste',
  },
];

export const mockParks: WindPark[] = [
  {
    id: '1',
    name: 'Parque Eólico Norte',
    location: {
      latitude: 25.7617,
      longitude: -100.1234,
      address: 'Carretera Nacional km 85, Monterrey',
    },
    projectId: '1',
    clientId: '1',
  },
];

export const mockTurbines: Turbine[] = [
  {
    id: '1',
    name: 'T-001',
    parkId: '1',
    projectId: '1',
    status: 'NOT_STARTED',
  },
  {
    id: '2',
    name: 'T-002',
    parkId: '1',
    projectId: '1',
    status: 'INSPECTED',
    lastInspection: new Date('2025-05-17'),
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'MOBILIZATION',
    startTime: new Date('2025-05-18T08:00:00'),
    endTime: new Date('2025-05-18T09:00:00'),
    projectId: '1',
    userId: '1',
    notes: 'Traslado al parque',
  },
  {
    id: '2',
    type: 'TURBINE_WORK',
    startTime: new Date('2025-05-18T09:00:00'),
    endTime: new Date('2025-05-18T11:00:00'),
    projectId: '1',
    turbineId: '1',
    userId: '1',
    notes: 'Inspección completa de T-001',
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'piloto@example.com',
    name: 'Juan Piloto',
    role: 'PILOT',
    active: true,
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Ana Administradora',
    role: 'ADMIN',
    active: true,
  },
  {
    id: '3',
    email: 'super@example.com',
    name: 'Carlos SuperAdmin',
    role: 'SUPER_ADMIN',
    active: true,
  },
];
