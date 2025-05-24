import { Client } from "../types/clients";

export const mockClients: Client[] = [
  {
    id: "1",
    name: "Eólica del Norte",
    contactInfo: {
      name: "Ana López",
      email: "ana.lopez@eolica.com",
      phone: "+34 987 654 321",
    },
    projects: ["1", "3", "5"],
    contracts: ["1", "3", "5"],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "2",
    name: "Vientos del Sur",
    contactInfo: {
      name: "Carlos Pérez",
      email: "carlos.perez@vientos.com",
      phone: "+34 654 987 321",
    },
    projects: ["2", "4", "6"],
    contracts: ["2", "4", "6"],
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-11-15"),
  },
];
