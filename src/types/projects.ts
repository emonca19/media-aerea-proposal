import { BaseEntity, ProjectStatus } from "./common";

export interface Project extends BaseEntity {
  name: string;
  description: string;
  clientId: string;
  contractId: string;
  windParkId: string;
  startDate: Date;
  endDate: Date;
  estimatedDuration: number; // in days
  status: ProjectStatus;
  assignedPilots: string[]; // User IDs
  assignedDrones: string[]; // Drone IDs
  notes?: string;
}

export interface ProjectProgress {
  projectId: string;
  totalTurbines: number;
  turbinesNotStarted: number;
  turbinesInspected: number;
  turbinesPhotosUploaded: number;
  turbinesApproved: number;
  completionPercentage: number;
}
