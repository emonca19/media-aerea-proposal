import { Drone } from "./drones";
import { Project } from "./projects";
import { User } from "./users";

export interface PilotUser extends User {
  role: "PILOT";
  currentProject?: Project;
  assignedDrone?: Drone;
  isAvailable: boolean;
  stats: PilotStats;
  droneOperatorLicense?: string;
}

export interface PilotStats {
  averageTimePerTurbineSeconds: number; // in seconds
  photoDeliveryTimeMinutes: number; // average time between work completion and photo upload (minutes)
  dailyCompletionRatePercentage: number; // percentage (0-100)
  totalTurbinesInspected: number;
  totalProjectsCompleted: number;
  totalFlightMinutes: number;
  incidentCount: number;
  onTimePhotoDeliveryRatePercentage: number; // percentage (0-100)
}
