// Common types used across the system
export type UserRole = "PILOT" | "ADMIN" | "SUPER_ADMIN";

export type ProjectStatus = "ACTIVE" | "PAUSED" | "FINISHED" | "COMPLETED";

export type TurbineStatus =
  | "NOT_STARTED"
  | "INSPECTED"
  | "PHOTOS_UPLOADED"
  | "APPROVED";

export type DroneStatus =
  | "OPERATIONAL"
  | "MAINTENANCE"
  | "OUT_OF_SERVICE"
  | "ASSIGNED";

export type ActivityType =
  | "MOBILIZATION"
  | "TURBINE_WORK"
  | "BREAK"
  | "WEATHER_DELAY"
  | "DEMOBILIZATION"
  | "TRAVEL"
  | "OTHER";

export type PhotoSubmissionStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export type IncidentType =
  | "WEATHER"
  | "EQUIPMENT"
  | "ACCIDENT"
  | "CLIENT_PRIORITY"
  | "OTHER";

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  name: string;
}
