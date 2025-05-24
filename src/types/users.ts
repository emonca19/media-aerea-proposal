import { BaseEntity, UserRole } from "./common";

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  lastLogin?: Date;
  profileImage?: string;
}

export interface UserStats {
  userId: string;
  averageTimePerTurbine: number; // in minutes
  photoDeliveryTime: number; // average time between work completion and photo upload (hours)
  dailyCompletionRate: number; // percentage (0-100)
  totalTurbinesInspected: number;
  totalProjectsCompleted: number;
}
