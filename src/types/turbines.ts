import { BaseEntity, TurbineStatus } from "./common";

export interface Turbine extends BaseEntity {
  name: string;
  windParkId: string;
  projectId: string;
  status: TurbineStatus;
  position?: {
    x: number;
    y: number;
  }; // Position on park map
  lastInspection?: Date;
  nextInspection?: Date;
  specifications?: {
    model: string;
    height: number;
    bladeLength: number;
    capacity: number; // MW
  };
  notes?: string;
}

export interface TurbineInspectionHistory {
  turbineId: string;
  inspections: {
    date: Date;
    pilotId: string;
    pilotName: string;
    photoSubmissionId?: string;
    status: "COMPLETED" | "PENDING_PHOTOS" | "APPROVED";
    notes?: string;
  }[];
}
