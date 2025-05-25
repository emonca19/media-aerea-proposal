import { BaseEntity, Location } from "./common";

export interface WindPark extends BaseEntity {
  name: string;
  location: Location;
  clientId: string;
  projectId: string;
  mapImage?: string; // URL to park layout image
  turbineIds: string[]; // Reference turbines by ID instead of full objects
  notes?: string;
}
