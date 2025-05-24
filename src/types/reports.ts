export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  projectIds?: string[];
  clientIds?: string[];
  pilotIds?: string[];
  windParkIds?: string[];
  turbineIds?: string[];
  status?: string[];
}

export interface Report {
  id: string;
  name: string;
  type: "PROJECT" | "PILOT" | "CLIENT" | "TURBINE" | "GENERAL";
  format: "PDF" | "EXCEL" | "CSV";
  filters: ReportFilter;
  generatedBy: string;
  generatedAt: Date;
  downloadUrl?: string;
}

export interface ProjectReport {
  projectId: string;
  projectName: string;
  clientName: string;
  windParkName: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  progress: {
    totalTurbines: number;
    completed: number;
    inProgress: number;
    pending: number;
    completionPercentage: number;
  };
  timeMetrics: {
    totalHours: number;
    averageTimePerTurbine: number;
    delays: number;
  };
  qualityMetrics: {
    photoSubmissions: number;
    approved: number;
    rejected: number;
    approvalRate: number;
  };
}

export interface PilotReport {
  pilotId: string;
  pilotName: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  performance: {
    totalTurbines: number;
    averageTimePerTurbine: number;
    totalHours: number;
    projectsWorked: number;
  };
  quality: {
    photoSubmissions: number;
    approvalRate: number;
    averageDeliveryTime: number;
  };
  activities: {
    workTime: number;
    breakTime: number;
    weatherDelays: number;
    incidents: number;
  };
}
