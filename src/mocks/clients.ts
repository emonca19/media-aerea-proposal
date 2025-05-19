import { Client } from '../types/clients';

export const mockClients: Client[] = [  {
    id: '1',
    name: 'Eólica del Norte',
    contactName: 'Ana López',
    contactEmail: 'ana.lopez@eolica.com',
    projects: ['1', '3', '5'],
    contracts: ['1', '3', '5'],
  },
  {
    id: '2',
    name: 'Vientos del Sur',
    contactName: 'Carlos Pérez',
    contactEmail: 'carlos.perez@vientos.com',
    projects: ['2', '4', '6'],
    contracts: ['2', '4', '6'],
  },
];