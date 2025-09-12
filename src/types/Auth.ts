import type { EnumValues } from './Enum';

// ===== ORGANIZATION ROLES =====
export const ORG_ROLE = {
  OWNER: 'org:owner',
  ADMIN: 'org:admin',
  MEMBER: 'org:member',
} as const;

export type OrgRole = EnumValues<typeof ORG_ROLE>;

// ===== PROJECT ROLES =====
export const PROJECT_ROLE = {
  PROJECT_MANAGER: 'project:manager',
  SITE_ENGINEER: 'project:site_engineer',
  SUPERVISOR: 'project:supervisor',
  MEMBER: 'project:member',
} as const;

export type ProjectRole = EnumValues<typeof PROJECT_ROLE>;

// ===== ORGANIZATION PERMISSIONS =====
export const ORG_PERMISSION = {
  // Organization management
  MANAGE_ORGANIZATION: 'org:manage_organization',
  MANAGE_MEMBERS: 'org:manage_members',
  MANAGE_BILLING: 'org:manage_billing',
  // Project management
  CREATE_PROJECTS: 'org:create_projects',
  MANAGE_ALL_PROJECTS: 'org:manage_all_projects',
  VIEW_ALL_PROJECTS: 'org:view_all_projects',
  // Daily logs
  CREATE_DAILY_LOGS: 'org:create_daily_logs',
  MANAGE_ALL_DAILY_LOGS: 'org:manage_all_daily_logs',
  VIEW_ALL_DAILY_LOGS: 'org:view_all_daily_logs',
  // File management
  UPLOAD_FILES: 'org:upload_files',
  MANAGE_ALL_FILES: 'org:manage_all_files',
  VIEW_ALL_FILES: 'org:view_all_files',
} as const;

export type OrgPermission = EnumValues<typeof ORG_PERMISSION>;

// ===== PROJECT PERMISSIONS =====
export const PROJECT_PERMISSION = {
  // Project management
  MANAGE_PROJECT: 'project:manage_project',
  VIEW_PROJECT: 'project:view_project',
  // Daily logs
  CREATE_DAILY_LOGS: 'project:create_daily_logs',
  MANAGE_DAILY_LOGS: 'project:manage_daily_logs',
  VIEW_DAILY_LOGS: 'project:view_daily_logs',
  // File management
  UPLOAD_FILES: 'project:upload_files',
  MANAGE_FILES: 'project:manage_files',
  VIEW_FILES: 'project:view_files',
} as const;

export type ProjectPermission = EnumValues<typeof PROJECT_PERMISSION>;
