import { BaseEntity, Location } from "./common";
import { Turbine } from "./turbines";

export interface WindPark extends BaseEntity {
  name: string;
  location: Location;
  clientId: string;
  projectId: string;
  mapImage?: string; // URL to park layout image
  turbines: Turbine[];
  notes?: string;
}
