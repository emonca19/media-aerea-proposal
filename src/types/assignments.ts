import { BaseEntity } from "./common";

export interface ProjectAssignment extends BaseEntity {
  projectId: string;
  pilotIds: string[];
  droneIds: string[];
  turbineIds: string[];
  estimatedStartDate: Date;
  estimatedEndDate: Date;
  estimatedDuration: number; // in days
  assignedBy: string; // Admin user ID
  confirmed: boolean;
  notes?: string;
}

export interface PilotAvailability {
  pilotId: string;
  pilotName: string;
  available: boolean;
  currentProject?: string;
  availability: {
    startDate: Date;
    endDate: Date;
  }[];
}

export interface DroneAvailability {
  droneId: string;
  droneName: string;
  serialNumber: string;
  available: boolean;
  currentProject?: string;
  status: "OPERATIONAL" | "MAINTENANCE" | "OUT_OF_SERVICE";
  assignedTo?: string;
}
