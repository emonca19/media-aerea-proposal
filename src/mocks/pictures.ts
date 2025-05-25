import { PhotoSubmissionStatus } from "../types/common";
import { PhotoSubmission, PhotoSubmissionReview } from "../types/pictures";

export const mockPhotoSubmissionReviews: PhotoSubmissionReview[] = [
  {
    status: "APPROVED" as PhotoSubmissionStatus,
    completeness: 95,
    legibility: 92,
    reviewedBy: "admin_001",
    reviewedAt: new Date("2025-05-23T10:30:00Z"),
  },
  {
    status: "REJECTED" as PhotoSubmissionStatus,
    completeness: 78,
    legibility: 65,
    reviewedBy: "admin_001",
    reviewedAt: new Date("2025-05-22T14:15:00Z"),
    rejectionReason:
      "Several photos are blurry and blade details are not clearly visible. Please retake photos of turbines T-003 and T-007.",
  },
  {
    status: "APPROVED" as PhotoSubmissionStatus,
    completeness: 100,
    legibility: 98,
    reviewedBy: "admin_002",
    reviewedAt: new Date("2025-05-21T16:45:00Z"),
  },
];

export const mockPhotoSubmissions: PhotoSubmission[] = [
  {
    id: "photo_sub_001",
    pilotId: "pilot_001",
    pilotName: "John Smith",
    projectId: "proj_001",
    projectName: "WindFarm Alpha Inspection Q2 2025",
    submissionDate: new Date("2025-05-23T09:00:00Z"),
    driveLink: "https://drive.google.com/",
    turbinesInspected: ["turbine_001", "turbine_002", "turbine_003"],
    photoSubmissionReview: mockPhotoSubmissionReviews[0],
    createdAt: new Date("2025-05-23T09:00:00Z"),
    updatedAt: new Date("2025-05-23T10:30:00Z"),
  },
  {
    id: "photo_sub_002",
    pilotId: "pilot_002",
    pilotName: "Sarah Johnson",
    projectId: "proj_002",
    projectName: "Coastal Wind Inspection Phase 1",
    submissionDate: new Date("2025-05-22T13:30:00Z"),
    driveLink: "https://drive.google.com/",
    turbinesInspected: [
      "turbine_004",
      "turbine_005",
      "turbine_006",
      "turbine_007",
    ],
    photoSubmissionReview: mockPhotoSubmissionReviews[1],
    createdAt: new Date("2025-05-22T13:30:00Z"),
    updatedAt: new Date("2025-05-22T14:15:00Z"),
  },
  {
    id: "photo_sub_003",
    pilotId: "pilot_003",
    pilotName: "Mike Rodriguez",
    projectId: "proj_001",
    projectName: "WindFarm Alpha Inspection Q2 2025",
    submissionDate: new Date("2025-05-21T16:00:00Z"),
    driveLink: "https://drive.google.com/",
    turbinesInspected: ["turbine_008", "turbine_009"],
    photoSubmissionReview: mockPhotoSubmissionReviews[2],
    createdAt: new Date("2025-05-21T16:00:00Z"),
    updatedAt: new Date("2025-05-21T16:45:00Z"),
  },
  {
    id: "photo_sub_004",
    pilotId: "pilot_004",
    pilotName: "Emma Davis",
    projectId: "proj_003",
    projectName: "Mountain Ridge Emergency Inspection",
    submissionDate: new Date("2025-05-24T08:15:00Z"),
    driveLink: "https://drive.google.com/",
    turbinesInspected: ["turbine_010", "turbine_011"],
    // No review yet - still pending
    createdAt: new Date("2025-05-24T08:15:00Z"),
    updatedAt: new Date("2025-05-24T08:15:00Z"),
  },
  {
    id: "photo_sub_005",
    pilotId: "pilot_001",
    pilotName: "John Smith",
    projectId: "proj_001",
    projectName: "WindFarm Alpha Inspection Q2 2025",
    submissionDate: new Date("2025-05-24T14:30:00Z"),
    driveLink: "https://drive.google.com/",
    turbinesInspected: ["turbine_012"],
    // No review yet - still pending
    createdAt: new Date("2025-05-24T14:30:00Z"),
    updatedAt: new Date("2025-05-24T14:30:00Z"),
  },
];
