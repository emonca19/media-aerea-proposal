import { BaseEntity, IncidentType } from "./common";

export interface Incident extends BaseEntity {
  type: IncidentType;
  description: string;
  projectId: string;
  turbineId?: string;
  pilotId: string;
  droneId?: string;
  dateTime: Date;
  evidencePhotos: string[];
}