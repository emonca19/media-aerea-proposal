import { BaseEntity, IncidentType } from "./common";

export interface Incident extends BaseEntity {
  type: IncidentType;
  description: string;
  projectId: string;
  turbineId?: string;
  pilotId: string;
  droneId?: string;
  dateTime: Date;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  evidencePhotos: string[]; // URLs to evidence photos (required)
  resolved: boolean;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface WeatherDelay extends BaseEntity {
  projectId: string;
  pilotId: string;
  startTime: Date;
  endTime?: Date;
  weatherCondition: "RAIN" | "HIGH_WIND" | "FOG" | "STORM" | "OTHER";
  description: string;
  evidencePhotos?: string[];
}
