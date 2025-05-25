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
  completeness: number; // 0-100 percentage
  legibility: number; // 0-100 percentage
  reviewedBy: string;
  reviewedAt: Date;
  rejectionReason?: string; // Only present when status is REJECTED
}
