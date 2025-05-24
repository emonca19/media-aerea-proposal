import { BaseEntity, ContactInfo } from "./common";

export interface Client extends BaseEntity {
  name: string;
  contactInfo: ContactInfo;
  contracts: string[]; // Contract IDs
  projects: string[]; // Project IDs
  customCodes?: Record<string, string>; // Custom activity codes for this client
}

export interface Contract extends BaseEntity {
  clientId: string;
  contractNumber: string;
  startDate: Date;
  endDate: Date;
  description: string;
  active: boolean;
}
