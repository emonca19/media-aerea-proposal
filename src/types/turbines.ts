import { BaseEntity, TurbineStatus } from "./common";
import { PhotoSubmission } from "./photos";
import { Project } from "./projects";
import { WindPark } from "./windParks";

export interface Turbine extends BaseEntity {
  name: string;
  windPark: WindPark;
  project: Project;
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
  turbine: Turbine;
  inspections: {
    date: Date;
    pilotId: string;
    pilotName: string;
    photoSubmission?: PhotoSubmission;
    notes?: string;
  }[];
}
