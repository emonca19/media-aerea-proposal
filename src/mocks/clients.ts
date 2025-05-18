import { Client } from '../types/clients';

export const mockClients: Client[] = [
  {
    id: 'c1',
    name: 'Eólica del Norte',
    contactName: 'Ana López',
    contactEmail: 'ana.lopez@eolica.com',
    projects: ['p1', 'p2'],
    contracts: ['ct1'],
  },
  {
    id: 'c2',
    name: 'Vientos del Sur',
    contactName: 'Carlos Pérez',
    contactEmail: 'carlos.perez@vientos.com',
    projects: ['p3'],
    contracts: ['ct2'],
  },
];