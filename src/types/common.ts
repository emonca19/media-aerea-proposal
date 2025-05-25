// Common types used across the system
export type UserRole = "PILOT" | "ADMIN" | "SUPER_ADMIN";

export type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

export type TurbineStatus =
  | "NOT_STARTED"
  | "INSPECTED"
  | "PHOTOS_UPLOADED"
  | "PHOTOS_REJECTED"
  | "APPROVED";

export type DroneStatus = "AVAILABLE" | "IN_USE";

export type ActivityType =
  | "MOBILIZATION"
  | "AWAITING_PERMISSION"
  | "TURBINE_WORK"
  | "TRAVEL"
  | "LUNCH"
  | "DEMOBILIZATION"
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
