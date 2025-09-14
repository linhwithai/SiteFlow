/**
 * Daily Log Types for Construction Project Management
 */

export type ProjectPhoto = {
  id: string;
  publicId: string;
  url: string;
  name: string;
  size: number;
  width: number;
  height: number;
  caption?: string;
  tags: string[];
  uploadedAt: Date;
};

export type DailyLog = {
  id: number;
  projectId: number;
  organizationId: string;
  logDate: Date;
  weather?: string;
  temperature?: number;
  workDescription: string;
  workHours: number;
  workersCount: number;
  issues?: string;
  notes?: string;
  createdById: string;
  updatedAt: Date;
  createdAt: Date;
  photos?: ProjectPhoto[];
};

export type CreateDailyLogRequest = {
  projectId: number;
  logDate: string; // ISO date string
  weather?: string;
  temperature?: number;
  workDescription: string;
  workHours?: number;
  workersCount?: number;
  issues?: string;
  notes?: string;
};

export type UpdateDailyLogRequest = {
  logDate?: string;
  weather?: string;
  temperature?: number;
  workDescription?: string;
  workHours?: number;
  workersCount?: number;
  issues?: string;
  notes?: string;
};

export type DailyLogFilters = {
  projectId?: number;
  logDateFrom?: string;
  logDateTo?: string;
  weather?: string;
  workDescription?: string;
  search?: string;
};

export type DailyLogStats = {
  total: number;
  thisWeek: number;
  thisMonth: number;
  totalWorkHours: number;
  averageWorkHours: number;
  totalWorkers: number;
  averageWorkers: number;
};

export type DailyLogListResponse = {
  dailyLogs: DailyLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: DailyLogFilters;
};
