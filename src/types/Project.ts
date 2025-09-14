/**
 * Project-related types and interfaces
 */

import type { PROJECT_STATUS, TASK_STATUS, TASK_PRIORITY, TASK_TYPE } from './Enum';

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];
export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
export type TaskType = typeof TASK_TYPE[keyof typeof TASK_TYPE];

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

// Project Task Types
export type ProjectTask = {
  id: string;
  projectId: string;
  organizationId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignedTo?: string; // User ID
  assignedBy?: string; // User ID
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  progress: number; // 0-100
  tags?: string[];
  dependencies?: string[]; // Task IDs
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProjectTaskRequest = {
  projectId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  type: TaskType;
  assignedTo?: string;
  dueDate?: string; // ISO string
  estimatedHours?: number;
  tags?: string[];
  dependencies?: string[];
};

export type UpdateProjectTaskRequest = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assignedTo?: string;
  dueDate?: string; // ISO string
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  tags?: string[];
  dependencies?: string[];
  isActive?: boolean;
};

export type ProjectTaskListResponse = {
  tasks: ProjectTask[];
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
    priority?: string;
    type?: string;
    assignedTo?: string;
    search?: string;
  };
};

export type ProjectTaskFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assignedTo?: string;
  search?: string;
};

export type ProjectTaskStats = {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  completed: number;
  cancelled: number;
  overdue: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  averageProgress: number;
  priorityStats?: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  typeStats?: {
    construction: number;
    inspection: number;
    maintenance: number;
    safety: number;
    quality: number;
    administrative: number;
    other: number;
  };
};