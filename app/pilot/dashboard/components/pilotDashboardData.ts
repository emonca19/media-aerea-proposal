// app/pilot/dashboard/pilotDashboardData.ts
// Datos iniciales para el dashboard del piloto

// Datos del piloto
export const pilot = {
  id: 'P001',
  name: 'Juan Rodríguez',
  role: 'Piloto Senior',
  licenseNumber: 'RPAS-1234',
  experience: '5 años',
  avatar: require('../../../../assets/images/pilot-avatar.jpg'),
};

// Tipos de actividades rápidas
export const quickActivityTypes = [
  { id: 'ACT_PREP', label: 'Preparación', icon: 'construct-outline' },
  { id: 'ACT_FLIGHT', label: 'Vuelo', icon: 'airplane-outline' },
  { id: 'ACT_PHOTO', label: 'Fotografía', icon: 'camera-outline' },
  { id: 'ACT_VIDEO', label: 'Video', icon: 'videocam-outline' },
  { id: 'ACT_MAINT', label: 'Mantenimiento', icon: 'hardware-chip-outline' },
  { id: 'ACT_TRANSIT', label: 'Traslado', icon: 'car-outline' },
  { id: 'ACT_BRIEF', label: 'Briefing', icon: 'people-outline' },
  { id: 'ACT_OTHER', label: 'Otro', icon: 'ellipsis-horizontal-outline' },
];

// Tipos de incidentes
export const incidentTypes = [
  { id: 'INC_WEATHER', label: 'Clima adverso', icon: 'rainy-outline' as const },
  { id: 'INC_TECH', label: 'Fallo técnico', icon: 'warning-outline' as const },
  { id: 'INC_BATT', label: 'Batería baja', icon: 'battery-dead-outline' as const },
  { id: 'INC_SIGNAL', label: 'Pérdida de señal', icon: 'wifi-outline' as const },
  { id: 'INC_OBSTACLE', label: 'Obstáculo', icon: 'stop-circle-outline' as const },
  { id: 'INC_OTHER', label: 'Otro', icon: 'help-circle-outline' as const },
];

// Definición para un item del checklist
export interface ChecklistItemData {
  id: string;
  task: string;
  completed: boolean;
}

// Definición para un incidente en los datos del proyecto
export interface IncidentData {
  id: string;
  type: string; // Corresponds to incidentTypes id e.g., 'INC_WEATHER'
  description: string;
  timestamp: string;
  // label and icon will be derived based on type using incidentTypes
}

// Proyecto actual del piloto
export const initialCurrentProject = {
  id: 'PROJ001',
  name: 'Inspección Parque Eólico Norte',
  client: 'Energía Renovable S.A.',
  location: 'Cantabria, España',
  startDate: '2025-05-21T08:00:00',
  endDate: '2025-05-25T18:00:00',
  status: 'EN_PROGRESO', // Mantener en mayúsculas
  description: 'Inspección de rutina de 25 aerogeneradores en el parque eólico norte.',
  progress: 35,
  drone: 'DJI Matrice 300 RTK', // Added drone
  checklist: [ // Added checklist
    { id: 'chk1', task: 'Verificar baterías del drone', completed: true },
    { id: 'chk2', task: 'Inspeccionar hélices', completed: true },
    { id: 'chk3', task: 'Calibrar brújula', completed: false },
    { id: 'chk4', task: 'Confirmar plan de vuelo', completed: false },
  ] as ChecklistItemData[],
  weather: {
    temperature: 22,
    windSpeed: 18,
    humidity: 45,
    condition: 'Parcialmente nublado',
    icon: 'partly-cloudy',
  },
  alerts: [
    {
      id: 'ALT001',
      type: 'WEATHER',
      message: 'Alerta de viento: Se esperan ráfagas de 25 km/h a partir de las 14:00',
      timestamp: '2025-05-21T10:30:00',
      severity: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW', // Ensure severity matches union type
    },
    {
      id: 'ALT002',
      type: 'SCHEDULE',
      message: 'Actividad pendiente: Fotografía de turbina #8 (atrasada)',
      timestamp: '2025-05-21T09:15:00',
      severity: 'LOW' as 'HIGH' | 'MEDIUM' | 'LOW', // Ensure severity matches union type
    },
  ],
  activities: [
    {
      id: 'ACT001',
      type: 'Inspección',
      description: 'Revisión visual turbina #3',
      status: 'COMPLETADA', // Mantener en mayúsculas
      notes: 'Sin observaciones particulares.', // Added notes
      scheduledStart: '2025-05-21T09:00:00',
      scheduledEnd: '2025-05-21T09:30:00',
      actualStart: '2025-05-21T09:05:00',
      actualEnd: '2025-05-21T09:25:00',
    },
    {
      id: 'ACT002',
      type: 'Fotografía',
      description: 'Fotografía detallada álabes turbina #5',
      status: 'EN_PROGRESO', // Mantener en mayúsculas
      notes: 'Enfocarse en posibles fisuras.', // Added notes
      scheduledStart: '2025-05-21T10:00:00',
      scheduledEnd: '2025-05-21T11:30:00',
      actualStart: '2025-05-21T10:10:00',
      actualEnd: null,
    },
    {
      id: 'ACT003',
      type: 'Vuelo',
      description: 'Vuelo reconocimiento sector oeste',
      status: 'PENDIENTE', // Mantener en mayúsculas
      notes: 'Verificar condiciones meteorológicas antes de iniciar.', // Added notes
      scheduledStart: '2025-05-21T13:00:00',
      scheduledEnd: '2025-05-21T14:30:00',
      actualStart: null,
      actualEnd: null,
    },
    {
      id: 'ACT004',
      type: 'Inspección',
      description: 'Inspección de nacelle turbina #7',
      status: 'POR_ASIGNAR', // Mantener en mayúsculas
      notes: '', // Added notes
      scheduledStart: null,
      scheduledEnd: null,
      actualStart: null,
      actualEnd: null,
    },
    {
      id: 'ACT005',
      type: 'Mantenimiento',
      description: 'Calibración de gimbal del dron',
      status: 'POR_ASIGNAR', // Mantener en mayúsculas
      notes: 'Realizar después del primer vuelo de prueba.', // Added notes
      scheduledStart: null,
      scheduledEnd: null,
      actualStart: null,
      actualEnd: null,
    },
  ],
  incidents: [ // Added incidents
    {
      id: 'INC001',
      type: 'INC_BATT',
      description: 'Batería #2 mostró descarga rápida durante prueba.',
      timestamp: '2025-05-20T15:00:00',
    }
  ] as IncidentData[],
};
