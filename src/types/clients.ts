import { BaseEntity, ContactInfo } from "./common";

export interface Client extends BaseEntity {
  name: string;
  contactInfo: ContactInfo;
  projects: string[]; // Project IDs
}
