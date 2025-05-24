import { BaseEntity, DroneStatus } from "./common";

export interface Drone extends BaseEntity {
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  acquisitionDate: Date;
  status: DroneStatus;
  assignedTo?: string; // User ID
  specifications: {
    maxFlightTime: number; // in minutes
    maxSpeed: number; // km/h
    camera: string;
    sensors: string[];
    weight: number; // in kg
  };
  maintenanceHistory: DroneMaintenanceRecord[];
  notes?: string;
}

export interface DroneMaintenanceRecord {
  date: Date;
  type: "ROUTINE" | "REPAIR" | "UPGRADE";
  description: string;
  cost?: number;
  performedBy: string;
  nextMaintenanceDate?: Date;
}
