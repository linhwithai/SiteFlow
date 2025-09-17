/**
 * Daily Log Types for Construction Project Management
 * Optimized with better validation and error handling
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
  mimeType: string;
  thumbnailUrl?: string;
};

export type DailyLog = {
  id: number;
  projectId: number; // REQUIRED - Daily log must belong to a project
  organizationId: string;
  title: string;
  logDate: Date;
  weather?: string;
  temperature?: number;
  workDescription: string;
  workHours: number;
  workersCount: number;
  issues?: string;
  notes?: string;
  // ERP Audit Trail
  createdById: string;
  updatedById?: string;
  version: number;
  // ERP Soft Delete
  deletedAt?: Date;
  deletedById?: string;
  // System fields
  updatedAt: Date;
  createdAt: Date;
  // Relations
  photos?: ProjectPhoto[];
  projectName?: string; // Denormalized for performance
};

export type CreateDailyLogRequest = {
  projectId: number; // REQUIRED - Must belong to a project
  title: string;
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
  title?: string;
  logDate?: string;
  weather?: string;
  temperature?: number;
  workDescription?: string;
  workHours?: number;
  workersCount?: number;
  issues?: string;
  notes?: string;
  // Note: projectId cannot be changed after creation
};

export type DailyLogFilters = {
  projectId?: number; // Filter by specific project
  logDateFrom?: string;
  logDateTo?: string;
  weather?: string;
  workDescription?: string;
  search?: string;
  // Additional filters for better UX
  workHoursMin?: number;
  workHoursMax?: number;
  workersCountMin?: number;
  workersCountMax?: number;
  hasIssues?: boolean;
  hasPhotos?: boolean;
};

export type DailyLogStats = {
  total: number;
  thisWeek: number;
  thisMonth: number;
  totalWorkHours: number;
  averageWorkHours: number;
  totalWorkers: number;
  averageWorkers: number;
  // Additional stats for better insights
  weatherBreakdown: Record<string, number>;
  workHoursByWeek: Array<{ week: string; hours: number }>;
  productivityTrend: Array<{ date: string; productivity: number }>;
  topIssues: Array<{ issue: string; count: number }>;
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
  stats?: DailyLogStats; // Include stats in list response for better UX
};

// Error types for better error handling
export type DailyLogError = {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
};

export type DailyLogValidationError = {
  field: string;
  message: string;
  value?: any;
};
