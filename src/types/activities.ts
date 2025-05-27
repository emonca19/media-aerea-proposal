import { ActivityStatus, ActivityType, BaseEntity } from "./common";

export interface Activity extends BaseEntity {
  type: ActivityType;
  status: ActivityStatus; // PLANNED, IN_PROGRESS, or COMPLETED
  startTime?: Date; // Optional for planned activities
  endTime?: Date;
  durationSeconds?: number; // Calculated from startTime and endTime
  projectId: string;
  turbineId?: string;
  pilotId: string;
  droneId?: string;
  notes?: string;
  orderIndex: number; // Order of the activity for the day (both planned and completed)
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
  plannedActivities: Activity[]; // Activities planned for the day (status: PLANNED)
  completedActivities: Activity[]; // Activities completed during the day (status: COMPLETED)
  inProgressActivity?: Activity; // Current activity in progress (status: IN_PROGRESS)
  totalWorkTime: number; // in minutes (calculated from completed activities)
  turbinesWorked: string[];
  preflightCompleted: boolean;
  photosSubmitted: boolean;
}

// Utility functions for working with activities
export const ActivityUtils = {
  /**
   * Get all activities for a day sorted by order index
   */
  getAllActivitiesSorted: (summary: DailyActivitySummary): Activity[] => {
    const allActivities = [
      ...summary.completedActivities,
      ...(summary.inProgressActivity ? [summary.inProgressActivity] : []),
      ...summary.plannedActivities,
    ];
    return allActivities.sort((a, b) => a.orderIndex - b.orderIndex);
  },

  /**
   * Get the next planned activity based on order index
   */
  getNextPlannedActivity: (summary: DailyActivitySummary): Activity | null => {
    if (summary.plannedActivities.length === 0) return null;
    return summary.plannedActivities.sort(
      (a, b) => a.orderIndex - b.orderIndex
    )[0];
  },

  /**
   * Get the current activity (either in progress or the next planned one)
   */
  getCurrentActivity: (summary: DailyActivitySummary): Activity | null => {
    return (
      summary.inProgressActivity ||
      ActivityUtils.getNextPlannedActivity(summary)
    );
  },

  /**
   * Calculate total duration of completed activities in seconds
   */
  getTotalCompletedDuration: (activities: Activity[]): number => {
    return activities
      .filter(
        (activity) =>
          activity.status === "COMPLETED" && activity.durationSeconds
      )
      .reduce((total, activity) => total + (activity.durationSeconds || 0), 0);
  },

  /**
   * Get the highest order index for a day to determine next position
   */
  getNextOrderIndex: (summary: DailyActivitySummary): number => {
    const allActivities = ActivityUtils.getAllActivitiesSorted(summary);
    return allActivities.length > 0
      ? Math.max(...allActivities.map((a) => a.orderIndex)) + 1
      : 1;
  },

  /**
   * Check if an activity can be started (no other activity is in progress)
   */
  canStartActivity: (summary: DailyActivitySummary): boolean => {
    return !summary.inProgressActivity;
  },

  /**
   * Filter activities by status
   */
  filterByStatus: (
    activities: Activity[],
    status: ActivityStatus
  ): Activity[] => {
    return activities.filter((activity) => activity.status === status);
  },
};
