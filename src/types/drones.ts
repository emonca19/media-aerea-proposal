import { BaseEntity, DroneStatus } from "./common";

export interface Drone extends BaseEntity {
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  acquisitionDate: Date;
  status: DroneStatus;
  assignedTo?: string; // User ID
  notes?: string;
}
