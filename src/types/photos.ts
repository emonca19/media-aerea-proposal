import { BaseEntity, PhotoSubmissionStatus } from "./common";

export interface PhotoSubmission extends BaseEntity {
  pilotId: string;
  pilotName: string;
  projectId: string;
  projectName: string;
  submissionDate: Date;
  driveLink: string;
  status: PhotoSubmissionStatus;
  turbinesInspected: string[]; // Turbine IDs
  expectedPhotos: number;
  actualPhotos: number;
  completeness?: number; // 0-100 percentage
  legibility?: number; // 0-100 percentage
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  notificationSent: boolean;
}

export interface PhotoReview {
  submissionId: string;
  action: "APPROVE" | "REJECT";
  completeness: number; // 0-100
  legibility: number; // 0-100
  rejectionReason?: string;
  reviewedBy: string;
  reviewDate: Date;
}

export interface PhotoCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  expectedCount: number; // per turbine
}
