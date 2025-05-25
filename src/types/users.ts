import { BaseEntity, UserRole } from "./common";
import { PilotUser } from "./pilots";

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  lastLogin?: Date;
  profileImage?: string;
}

export interface AdminUser extends User {
  role: "ADMIN";
  systemPermissions: SystemPermission[];
}

export interface SuperAdminUser extends User {
  role: "SUPER_ADMIN";
  systemPermissions: SystemPermission[];
}

export type SystemPermission =
  | "USER_MANAGEMENT"
  | "ROLE_ASSIGNMENT"
  | "ACCOUNT_DEACTIVATION"
  | "AUDIT_LOGS";

export type AnyUser = PilotUser | AdminUser | SuperAdminUser;
