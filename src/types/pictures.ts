import { BaseEntity, PhotoSubmissionStatus } from "./common";

export interface PhotoSubmission extends BaseEntity {
  pilotId: string;
  pilotName: string;
  projectId: string;
  projectName: string;
  submissionDate: Date;
  driveLink: string;
  turbinesInspected: string[]; // Turbine IDs
  photoSubmissionReview?: PhotoSubmissionReview; // When the object is null, it means the submission is still pending review
}

export interface PhotoSubmissionReview {
  status: PhotoSubmissionStatus;
  bladeRectitude: 'aceptable' | 'posibles_problemas' | 'errores_procesamiento';
  captureDistance: 'aceptable' | 'posibles_conflictos';
  exposure: 'buena' | 'muy_oscura' | 'muy_brillante';
  focus: 'aceptable' | 'deficiente';
  bladePosition: 'correcta' | 'parcialmente_correcta' | 'incorrecta';
  reviewedBy: string;
  reviewedAt: Date;
  rejectionReason?: string; // Only present when status is REJECTED
}
