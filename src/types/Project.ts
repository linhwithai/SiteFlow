/**
 * Project-related types and interfaces
 */

import type { PROJECT_STATUS } from './Enum';

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

export type Project = {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  status: ProjectStatus;
  projectManagerId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProjectRequest = {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  budget?: number;
  projectManagerId?: string;
};

export type UpdateProjectRequest = {
  status?: ProjectStatus;
  isActive?: boolean;
} & Partial<CreateProjectRequest>;

export type ProjectListResponse = {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    status?: string;
    city?: string;
    province?: string;
    projectManagerId?: string;
    isActive?: boolean;
    search?: string;
  };
};

export type ProjectFilters = {
  status?: ProjectStatus;
  city?: string;
  province?: string;
  projectManagerId?: string;
  isActive?: boolean;
  search?: string;
};

export type ProjectStats = {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  cancelled: number;
  totalBudget: number;
  averageBudget: number;
};
