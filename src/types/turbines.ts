import { BaseEntity, TurbineStatus } from "./common";
import { PhotoSubmission } from "./pictures";

export interface Turbine extends BaseEntity {
  name: string;
  windParkId: string; // Reference by ID instead of full object
  projectId: string; // Reference by ID instead of full object
  status: TurbineStatus;
  position?: {
    x: number;
    y: number;
  }; // Position on park map
  lastInspection?: Date;
  nextInspection?: Date;
  notes?: string;
}

export interface TurbineInspectionHistory {
  turbineId: string; // Reference by ID instead of full object
  inspections: {
    date: Date;
    pilotId: string;
    pilotName: string;
    photoSubmission?: PhotoSubmission;
    notes?: string;
  }[];
}
