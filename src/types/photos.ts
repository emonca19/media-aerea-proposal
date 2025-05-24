export interface PhotoSubmission {
  id: string;
  pilotId: string;
  pilotName: string;
  projectId: string;
  projectName: string;
  submissionDate: string;
  driveLink: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  completeness?: number; // 0-100 percentage
  legibility?: number; // 0-100 percentage
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notificationSent?: boolean;
  turbinesInspected: number;
  expectedPhotos: number;
  actualPhotos: number;
}

export interface PhotoReview {
  submissionId: string;
  action: "APPROVE" | "REJECT";
  completeness: number;
  legibility: number;
  rejectionReason?: string;
  reviewedBy: string;
}
