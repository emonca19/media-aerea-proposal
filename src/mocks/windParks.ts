import { WindPark } from "../types/windParks";

export const mockWindParks: WindPark[] = [
  {
    id: "park_001",
    name: "Parque Eólico Alfa",
    location: {
      latitude: 41.2033,
      longitude: -77.1945,
      address: "Sitio Parque Eólico Alfa, Pensilvania, EE.UU.",
    },
    clientId: "client_001",
    projectId: "proj_001",
    mapImage: "https://example.com/maps/windfarm_alpha.jpg",
    turbineIds: [
      "turbine_001",
      "turbine_002",
      "turbine_003",
      "turbine_006",
      "turbine_007",
    ],
    notes:
      "Parque eólico principal con 24 aerogeneradores, operativo desde 2023",
    createdAt: new Date("2023-01-15T10:00:00Z"),
    updatedAt: new Date("2025-05-20T08:00:00Z"),
  },
  {
    id: "park_002",
    name: "Parque Eólico Costero Beta",
    location: {
      latitude: 39.7392,
      longitude: -74.4231,
      address: "Parque Eólico Costero Beta, Nueva Jersey, EE.UU.",
    },
    clientId: "client_003",
    projectId: "proj_002",
    mapImage: "https://example.com/maps/coastal_beta.jpg",
    turbineIds: ["turbine_004", "turbine_008"],
    notes:
      "Instalación costera con consideraciones de ambiente marino, 18 aerogeneradores",
    createdAt: new Date("2024-02-10T09:00:00Z"),
    updatedAt: new Date("2025-04-15T08:00:00Z"),
  },
  {
    id: "park_003",
    name: "Parque Eólico Sierra Montañosa",
    location: {
      latitude: 44.2619,
      longitude: -72.5806,
      address: "Parque Eólico Sierra Montañosa, Vermont, EE.UU.",
    },
    clientId: "client_002",
    projectId: "proj_003",
    mapImage: "https://example.com/maps/mountain_ridge.jpg",
    turbineIds: ["turbine_005", "turbine_009"],
    notes:
      "Instalación de alta altitud que requiere equipo especial, 12 aerogeneradores",
    createdAt: new Date("2023-09-05T11:00:00Z"),
    updatedAt: new Date("2025-05-22T08:00:00Z"),
  },
  {
    id: "park_004",
    name: "Parque Eólico Desértico Gamma",
    location: {
      latitude: 32.2217,
      longitude: -110.9265,
      address: "Parque Eólico Desértico Gamma, Arizona, EE.UU.",
    },
    clientId: "client_001",
    projectId: "proj_004",
    mapImage: "https://example.com/maps/desert_gamma.jpg",
    turbineIds: ["turbine_010"],
    notes: "Instalación desértica completada en Q1 2025, 30 aerogeneradores",
    createdAt: new Date("2024-08-20T14:30:00Z"),
    updatedAt: new Date("2025-04-12T16:30:00Z"),
  },
  {
    id: "park_005",
    name: "Plataforma Marina Delta",
    location: {
      latitude: 40.4173,
      longitude: -73.9776,
      address:
        "Plataforma Marina Delta, 15 millas al este de Long Island, NY, EE.UU.",
    },
    clientId: "client_003",
    projectId: "proj_005",
    mapImage: "https://example.com/maps/offshore_delta.jpg",
    turbineIds: [],
    notes: "Plataforma marina en desarrollo, esperando permisos ambientales",
    createdAt: new Date("2024-12-01T10:00:00Z"),
    updatedAt: new Date("2025-05-15T10:30:00Z"),
  },
  {
    id: "park_006",
    name: "Expansión Eólica de la Pradera",
    location: {
      latitude: 41.5868,
      longitude: -93.625,
      address: "Expansión Eólica de la Pradera, Iowa, EE.UU.",
    },
    clientId: "client_004",
    projectId: "proj_006",
    mapImage: "https://example.com/maps/prairie_expansion.jpg",
    turbineIds: [],
    notes:
      "Sitio futuro de expansión para Sistemas de Energía Montañosa, fase de planificación",
    createdAt: new Date("2025-03-15T12:00:00Z"),
    updatedAt: new Date("2025-05-01T14:00:00Z"),
  },
];
