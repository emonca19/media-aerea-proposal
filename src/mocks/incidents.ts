import { IncidentType } from "../types/common";
import { Incident } from "../types/incidents";

export const mockIncidents: Incident[] = [
  {
    id: "incident_001",
    type: "WEATHER" as IncidentType,
    description:
      "Ráfagas de viento fuerte excedieron los límites seguros de operación durante la inspección del aerogenerador. Operación suspendida por seguridad.",
    projectId: "proj_001",
    turbineId: "turbine_003",
    pilotId: "pilot_001",
    droneId: "drone_001",
    dateTime: new Date("2025-05-22T14:30:00Z"),
    evidencePhotos: [
      "https://example.com/evidence/weather_001.jpg",
      "https://example.com/evidence/wind_meter_001.jpg",
    ],
    createdAt: new Date("2025-05-22T14:45:00Z"),
    updatedAt: new Date("2025-05-22T14:45:00Z"),
  },
  {
    id: "incident_002",
    type: "EQUIPMENT" as IncidentType,
    description:
      "El dron experimentó una falla en el gimbal durante el vuelo. Se realizó aterrizaje de emergencia exitosamente.",
    projectId: "proj_002",
    turbineId: "turbine_008",
    pilotId: "pilot_002",
    droneId: "drone_002",
    dateTime: new Date("2025-05-20T11:15:00Z"),
    evidencePhotos: [
      "https://example.com/evidence/drone_damage_001.jpg",
      "https://example.com/evidence/gimbal_issue_001.jpg",
    ],
    createdAt: new Date("2025-05-20T11:30:00Z"),
    updatedAt: new Date("2025-05-20T11:30:00Z"),
  },
  {
    id: "incident_003",
    type: "CLIENT_PRIORITY" as IncidentType,
    description:
      "El cliente solicitó inspección inmediata del aerogenerador debido a reportes inusuales de vibración del equipo de mantenimiento.",
    projectId: "proj_001",
    turbineId: "turbine_012",
    pilotId: "pilot_003",
    droneId: "drone_003",
    dateTime: new Date("2025-05-21T09:00:00Z"),
    evidencePhotos: [
      "https://example.com/evidence/priority_inspection_001.jpg",
    ],
    createdAt: new Date("2025-05-21T09:15:00Z"),
    updatedAt: new Date("2025-05-21T09:15:00Z"),
  },
  {
    id: "incident_004",
    type: "ACCIDENT" as IncidentType,
    description:
      "Colisión menor con ave durante el vuelo. El dron sufrió daño menor en el sensor frontal. No se reportaron lesiones.",
    projectId: "proj_003",
    turbineId: "turbine_005",
    pilotId: "pilot_004",
    droneId: "drone_004",
    dateTime: new Date("2025-05-19T15:45:00Z"),
    evidencePhotos: [
      "https://example.com/evidence/bird_collision_001.jpg",
      "https://example.com/evidence/sensor_damage_001.jpg",
    ],
    createdAt: new Date("2025-05-19T16:00:00Z"),
    updatedAt: new Date("2025-05-19T16:00:00Z"),
  },
  {
    id: "incident_005",
    type: "OTHER" as IncidentType,
    description:
      "Personal no autorizado ingresó a la zona de vuelo restringida. Las operaciones de vuelo se detuvieron temporalmente hasta que el área fue despejada.",
    projectId: "proj_002",
    pilotId: "pilot_002",
    dateTime: new Date("2025-05-18T13:20:00Z"),
    evidencePhotos: ["https://example.com/evidence/unauthorized_entry_001.jpg"],
    createdAt: new Date("2025-05-18T13:35:00Z"),
    updatedAt: new Date("2025-05-18T13:35:00Z"),
  },
];
