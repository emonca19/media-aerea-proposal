import { BaseEntity } from "./common";

export type CameraStatus = "AVAILABLE" | "IN_USE" | "MAINTENANCE";

export interface Camera extends BaseEntity {
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  acquisitionDate: Date;
  status: CameraStatus;
  assignedTo?: string; // User ID
  notes?: string;
}
