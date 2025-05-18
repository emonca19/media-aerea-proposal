export type UserRole = 'PILOT' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  contractId: string;
  startDate: Date;
  endDate: Date;
  status: 'ACTIVE' | 'PAUSED' | 'FINISHED';
  description: string;
}

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

export interface Turbine {
  id: string;
  name: string;
  parkId: string;
  projectId: string;
  status: 'NOT_STARTED' | 'INSPECTED' | 'PHOTOS_UPLOADED' | 'APPROVED';
  lastInspection?: Date;
}

export interface Activity {
  id: string;
  type: 'MOBILIZATION' | 'TURBINE_WORK' | 'BREAK' | 'WEATHER_DELAY' | 'OTHER';
  startTime: Date;
  endTime?: Date;
  projectId: string;
  turbineId?: string;
  userId: string;
  notes?: string;
}
