import { ActivityType, BaseEntity } from "./common";

export interface Activity extends BaseEntity {
  type: ActivityType;
  startTime: Date;
  endTime?: Date;
  duration?: number; // calculated in minutes
  projectId: string;
  turbineId?: string;
  pilotId: string;
  droneId?: string;
  notes?: string;
  customCode?: string; // Client-specific activity code
}

export interface PreflightChecklist extends BaseEntity {
  pilotId: string;
  droneId: string;
  projectId: string;
  checklistItems: {
    droneCondition: boolean;
    batteryLevel: boolean;
    weatherConditions: boolean;
    eppValidation: boolean;
    areaPhotography: boolean;
    communicationCheck: boolean;
  };
  areaPhotos: string[]; // URLs to area photos
  notes?: string;
  completed: boolean;
}

export interface DailyActivitySummary {
  date: Date;
  pilotId: string;
  projectId: string;
  activities: Activity[];
  totalWorkTime: number; // in minutes
  turbinesWorked: string[];
  preflightCompleted: boolean;
  photosSubmitted: boolean;
}
