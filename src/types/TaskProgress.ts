/**
 * Task Progress Types for Construction Project Management
 * Track progress of tasks over time with detailed work descriptions
 */

export type TaskProgress = {
  id: number;
  taskId: number;
  dailyLogId?: number;
  workItemId?: number;
  organizationId: string;
  progressDate: Date;
  progressPercentage: number; // 0-100
  workDescription: string;
  workHours: number;
  workersCount: number;
  issues?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTaskProgressRequest = {
  taskId: number;
  dailyLogId?: number;
  workItemId?: number;
  progressDate: string; // ISO date string
  progressPercentage: number; // 0-100
  workDescription: string;
  workHours?: number;
  workersCount?: number;
  issues?: string;
  notes?: string;
};

export type UpdateTaskProgressRequest = {
  progressDate?: string; // ISO date string
  progressPercentage?: number; // 0-100
  workDescription?: string;
  workHours?: number;
  workersCount?: number;
  issues?: string;
  notes?: string;
};

export type TaskProgressFilters = {
  taskId?: number;
  dailyLogId?: number;
  workItemId?: number;
  progressDateFrom?: string;
  progressDateTo?: string;
  search?: string;
};

export type TaskProgressListResponse = {
  progress: TaskProgress[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: TaskProgressFilters;
};

export type TaskProgressStats = {
  total: number;
  totalWorkHours: number;
  averageProgress: number;
  currentProgress: number;
  progressHistory: {
    date: string;
    progress: number;
    workHours: number;
  }[];
  weeklyProgress: {
    week: string;
    progress: number;
    workHours: number;
  }[];
  monthlyProgress: {
    month: string;
    progress: number;
    workHours: number;
  }[];
};

// Task Progress with related data
export type TaskProgressWithRelations = TaskProgress & {
  task?: {
    id: number;
    title: string;
    status: string;
    priority: string;
    type: string;
  };
  dailyLog?: {
    id: number;
    title: string;
    logDate: Date;
  };
  workItem?: {
    id: number;
    title: string;
    workType: string;
    status: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
};

// Task Progress Timeline for visualization
export type TaskProgressTimeline = {
  taskId: number;
  taskTitle: string;
  totalProgress: number;
  timeline: {
    date: string;
    progress: number;
    workHours: number;
    workDescription: string;
    issues?: string;
  }[];
  milestones: {
    date: string;
    progress: number;
    description: string;
  }[];
};

