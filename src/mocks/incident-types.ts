import { IncidentType } from "../types/common";

export interface IncidentTypeInfo {
  id: IncidentType;
  label: string;
  icon: any; // Use any for icon names to avoid strict type checking
}

// Incident types with Spanish translations
export const incidentTypes: IncidentTypeInfo[] = [
  { id: 'WEATHER', label: 'Clima', icon: 'rainy-outline' as any },
  { id: 'EQUIPMENT', label: 'Equipo', icon: 'warning-outline' as any },
  { id: 'ACCIDENT', label: 'Accidente', icon: 'alert-circle-outline' as any },
  { id: 'CLIENT_PRIORITY', label: 'Prioridad Cliente', icon: 'star-outline' as any },
  { id: 'DELAY', label: 'Retraso', icon: 'time-outline' as any },
  { id: 'OTHER', label: 'Otro', icon: 'help-circle-outline' as any },
];

// Helper function to get incident type info by id
export const getIncidentTypeInfo = (type: IncidentType): IncidentTypeInfo => {
  return incidentTypes.find(t => t.id === type) || incidentTypes[incidentTypes.length - 1]; // fallback to "Other"
};
