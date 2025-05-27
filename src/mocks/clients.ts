import { Client } from "../types/clients";

export const mockClients: Client[] = [
  {
    id: "client_001",
    name: "Energía Verde Corp",
    contactInfo: {
      name: "Roberto Wilson",
      email: "roberto.wilson@energiaverde.com",
      phone: "+34-91-555-0101",
    },
    projects: ["proj_001", "proj_002"],
    createdAt: new Date("2024-01-15T09:00:00Z"),
    updatedAt: new Date("2025-03-10T14:30:00Z"),
  },
  {
    id: "client_002",
    name: "Soluciones Eólicas Técnicas",
    contactInfo: {
      name: "María García",
      email: "maria.garcia@solucioneseolicas.com",
      phone: "+34-93-555-0202",
    },
    projects: ["proj_003"],
    createdAt: new Date("2024-03-20T11:00:00Z"),
    updatedAt: new Date("2025-04-05T16:45:00Z"),
  },
  {
    id: "client_003",
    name: "Parques Eólicos Costeros SL",
    contactInfo: {
      name: "David Thompson",
      email: "david.thompson@parqueseolicoscosteros.com",
      phone: "+34-96-555-0303",
    },
    projects: ["proj_004"],
    createdAt: new Date("2024-06-10T08:30:00Z"),
    updatedAt: new Date("2025-05-20T10:15:00Z"),
  },
  {
    id: "client_004",
    name: "Sistemas de Energía Montañosa SA",
    contactInfo: {
      name: "Jennifer López",
      email: "jennifer.lopez@energiamontanosa.com",
      phone: "+34-985-555-0404",
    },
    projects: [],
    createdAt: new Date("2025-05-01T12:00:00Z"),
    updatedAt: new Date("2025-05-01T12:00:00Z"),
  },
];
