import { BaseEntity, Location } from "./common";

export interface WindPark extends BaseEntity {
  name: string;
  location: Location;
  clientId: string;
  projectId: string;
  mapImage?: string; // URL to park layout image
  turbineCount: number;
  notes?: string;
}
