import React, { createContext, ReactNode, useContext, useState } from 'react';

// Tipos para las actividades
export interface Activity {
  id: string;
  type: string;
  startTime: Date;
  endTime?: Date;
  notes?: string;
  operator: string;
  turbineId?: string;
  subActivities?: Activity[];
}

export interface Incident {
  id: string;
  type: string;
  description: string;
  activityId: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
}

interface ActivityContextType {
  activities: Activity[];
  incidents: Incident[];
  addActivity: (activity: Omit<Activity, 'id'>) => string;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  endActivity: (id: string, endTime?: Date, notes?: string) => void;
  addIncident: (incident: Omit<Incident, 'id'>) => string;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  getCurrentActivity: () => Activity | null;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// Datos iniciales (los mockActivities existentes)
const initialActivities: Activity[] = [
  {
    id: '0',
    type: 'OTHER',
    startTime: new Date('2023-05-18T07:00:00'),
    endTime: new Date('2023-05-18T07:05:00'),
    notes: 'Inicio de jornada',
    operator: 'Juan Pérez'
  },
  {
    id: '1',
    type: 'MOBILIZATION',
    startTime: new Date('2023-05-18T07:05:00'),
    endTime: new Date('2023-05-18T08:00:00'),
    notes: 'Movilización al parque eólico',
    operator: 'Juan Pérez'
  },
  {
    id: '2',
    type: 'OTHER',
    startTime: new Date('2023-05-18T08:00:00'),
    endTime: new Date('2023-05-18T08:10:00'),
    notes: 'Llegada al sitio',
    operator: 'Juan Pérez',
    subActivities: [
      {
        id: '2-1',
        type: 'BREAK',
        startTime: new Date('2023-05-18T08:10:00'),
        endTime: new Date('2023-05-18T08:30:00'),
        notes: 'Esperando permiso de acceso',
        operator: 'Juan Pérez'
      }
    ]
  },
  {
    id: '3',
    type: 'TURBINE_WORK',
    turbineId: '1',
    startTime: new Date('2023-05-18T08:30:00'),
    endTime: new Date('2023-05-18T10:00:00'),
    notes: 'Inspección de aspas y sistemas eléctricos.',
    operator: 'Juan Pérez',
    subActivities: [
      {
        id: '3-1',
        type: 'BREAK',
        startTime: new Date('2023-05-18T09:00:00'),
        endTime: new Date('2023-05-18T09:15:00'),
        notes: 'Pausa para hidratación',
        operator: 'Juan Pérez'
      }
    ]
  }
];

const initialIncidents: Incident[] = [
  {
    id: 'INC001',
    type: 'WEATHER',
    description: 'Condiciones meteorológicas adversas detectadas durante la inspección.',
    activityId: '2',
    timestamp: '2023-05-18T09:30:00',
    severity: 'medium',
    status: 'resolved'
  }
];

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);

  const addActivity = (activityData: Omit<Activity, 'id'>): string => {
    const newId = `ACT_${Date.now()}`;
    const newActivity: Activity = {
      ...activityData,
      id: newId,
    };
    
    setActivities(prev => [...prev, newActivity]);
    return newId;
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id ? { ...activity, ...updates } : activity
      )
    );
  };

  const endActivity = (id: string, endTime?: Date, notes?: string) => {
    const updates: Partial<Activity> = {
      endTime: endTime || new Date(),
    };
    
    if (notes) {
      updates.notes = notes;
    }
    
    updateActivity(id, updates);
  };

  const addIncident = (incidentData: Omit<Incident, 'id'>): string => {
    const newId = `INC_${Date.now()}`;
    const newIncident: Incident = {
      ...incidentData,
      id: newId,
    };
    
    setIncidents(prev => [...prev, newIncident]);
    return newId;
  };

  const updateIncident = (id: string, updates: Partial<Incident>) => {
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === id ? { ...incident, ...updates } : incident
      )
    );
  };

  const getCurrentActivity = (): Activity | null => {
    // Encuentra la última actividad sin endTime (actividad en curso)
    const activeActivity = activities.find(activity => !activity.endTime);
    return activeActivity || null;
  };

  const value: ActivityContextType = {
    activities,
    incidents,
    addActivity,
    updateActivity,
    endActivity,
    addIncident,
    updateIncident,
    getCurrentActivity,
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}
