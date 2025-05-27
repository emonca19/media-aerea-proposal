/**
 * Global state management for pilot dashboard project data
 * Works across React Native components
 */

export interface GlobalProjectData {
  activities: any[];
  [key: string]: any;
}

// Global variable to share data between components in React Native
let globalProjectData: GlobalProjectData | null = null;

// Function to set project data (called from dashboard)
export const setGlobalProjectData = (projectData: GlobalProjectData) => {
  globalProjectData = projectData;
  console.log('Global project data updated:', projectData?.activities?.length || 0, 'activities');
};

// Function to get current project data
export const getGlobalProjectData = (): GlobalProjectData | null => {
  return globalProjectData;
};

// Function to get current activities from global state
export const getCurrentActivities = () => {
  try {
    // In React Native, we use global state
    if (globalProjectData && globalProjectData.activities) {
      return globalProjectData.activities;
    }
    
    // Return empty array if no data available
    return [];
  } catch (error) {
    console.error('Error getting current activities:', error);
    return [];
  }
};

// Function to add activity to global state
export const addActivityToGlobalData = (activity: any) => {
  try {
    if (globalProjectData) {
      globalProjectData.activities = globalProjectData.activities || [];
      globalProjectData.activities.unshift(activity);
      console.log('Activity added to global data:', activity.name);
    }
  } catch (error) {
    console.error('Error adding activity to global data:', error);
  }
};

// Function to update activity in global state
export const updateActivityInGlobalData = (activityId: string, updates: any) => {
  try {
    if (globalProjectData && globalProjectData.activities) {
      globalProjectData.activities = globalProjectData.activities.map(act => 
        act.id === activityId ? { ...act, ...updates } : act
      );
      console.log('Activity updated in global data:', activityId);
    }
  } catch (error) {
    console.error('Error updating activity in global data:', error);
  }
};
