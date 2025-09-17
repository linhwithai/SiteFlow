/**
 * Daily Log Validation Schemas
 * 
 * This module provides Zod validation schemas for daily log operations
 * to ensure type safety and data validation across the application
 */

import { z } from 'zod';

// Base validation schemas
export const projectPhotoSchema = z.object({
  id: z.string().min(1, 'Photo ID is required'),
  publicId: z.string().min(1, 'Public ID is required'),
  url: z.string().url('Invalid photo URL'),
  name: z.string().min(1, 'Photo name is required'),
  size: z.number().int().positive('Photo size must be positive'),
  width: z.number().int().positive('Photo width must be positive'),
  height: z.number().int().positive('Photo height must be positive'),
  caption: z.string().max(500, 'Caption too long').optional(),
  tags: z.array(z.string()).default([]),
  uploadedAt: z.date(),
  mimeType: z.string().min(1, 'MIME type is required'),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
});

export const dailyLogSchema = z.object({
  id: z.number().int().positive('Invalid daily log ID'),
  projectId: z.number().int().positive('Project ID is required'),
  organizationId: z.string().min(1, 'Organization ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  logDate: z.date(),
  weather: z.string().max(100, 'Weather description too long').optional(),
  temperature: z.number().int().min(-50).max(60, 'Temperature must be between -50 and 60°C').optional(),
  workDescription: z.string().min(1, 'Work description is required').max(2000, 'Work description too long'),
  workHours: z.number().int().min(0).max(24, 'Work hours must be between 0 and 24'),
  workersCount: z.number().int().min(0, 'Workers count must be non-negative'),
  issues: z.string().max(1000, 'Issues description too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  // ERP Audit Trail
  createdById: z.string().min(1, 'Created by ID is required'),
  updatedById: z.string().min(1, 'Updated by ID is required').optional(),
  version: z.number().int().positive('Version must be positive'),
  // ERP Soft Delete
  deletedAt: z.date().optional(),
  deletedById: z.string().min(1, 'Deleted by ID is required').optional(),
  // System fields
  updatedAt: z.date(),
  createdAt: z.date(),
  // Relations
  photos: z.array(projectPhotoSchema).optional(),
  projectName: z.string().optional(),
});

// Request validation schemas
export const createDailyLogRequestSchema = z.object({
  projectId: z.number().int().positive('Project ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  logDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid date format'),
  weather: z.string().max(100, 'Weather description too long').optional(),
  temperature: z.number().int().min(-50).max(60, 'Temperature must be between -50 and 60°C').optional(),
  workDescription: z.string().min(1, 'Work description is required').max(2000, 'Work description too long'),
  workHours: z.number().int().min(0).max(24, 'Work hours must be between 0 and 24').default(8),
  workersCount: z.number().int().min(0, 'Workers count must be non-negative').default(0),
  issues: z.string().max(1000, 'Issues description too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
});

export const updateDailyLogRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  logDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid date format').optional(),
  weather: z.string().max(100, 'Weather description too long').optional(),
  temperature: z.number().int().min(-50).max(60, 'Temperature must be between -50 and 60°C').optional(),
  workDescription: z.string().min(1, 'Work description is required').max(2000, 'Work description too long').optional(),
  workHours: z.number().int().min(0).max(24, 'Work hours must be between 0 and 24').optional(),
  workersCount: z.number().int().min(0, 'Workers count must be non-negative').optional(),
  issues: z.string().max(1000, 'Issues description too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
});

// Filter validation schemas
export const dailyLogFiltersSchema = z.object({
  projectId: z.number().int().positive('Invalid project ID').optional(),
  logDateFrom: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid date format').optional(),
  logDateTo: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid date format').optional(),
  weather: z.string().max(100, 'Weather filter too long').optional(),
  workDescription: z.string().max(200, 'Work description filter too long').optional(),
  search: z.string().max(200, 'Search term too long').optional(),
  workHoursMin: z.number().int().min(0, 'Minimum work hours must be non-negative').optional(),
  workHoursMax: z.number().int().max(24, 'Maximum work hours must not exceed 24').optional(),
  workersCountMin: z.number().int().min(0, 'Minimum workers count must be non-negative').optional(),
  workersCountMax: z.number().int().min(0, 'Maximum workers count must be non-negative').optional(),
  hasIssues: z.boolean().optional(),
  hasPhotos: z.boolean().optional(),
});

// Query parameters validation schemas
export const dailyLogQuerySchema = z.object({
  page: z.string().transform(Number).refine((val) => val > 0, 'Page must be positive').default('1'),
  limit: z.string().transform(Number).refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100').default('10'),
  constructionDateFrom: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid date format').optional(),
  constructionDateTo: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid date format').optional(),
  weather: z.string().max(100, 'Weather filter too long').optional(),
  constructionWorkDescription: z.string().max(200, 'Work description filter too long').optional(),
  search: z.string().max(200, 'Search term too long').optional(),
});

// Stats validation schemas
export const dailyLogStatsSchema = z.object({
  totalLogs: z.number().int().min(0, 'Total logs must be non-negative'),
  totalWorkHours: z.number().min(0, 'Total work hours must be non-negative'),
  totalLaborCount: z.number().int().min(0, 'Total labor count must be non-negative'),
  recentActivity: z.number().int().min(0, 'Recent activity must be non-negative'),
  weatherBreakdown: z.record(z.string(), z.number().int().min(0)),
});

// Response validation schemas
export const dailyLogListResponseSchema = z.object({
  dailyLogs: z.array(dailyLogSchema),
  pagination: z.object({
    page: z.number().int().positive('Page must be positive'),
    limit: z.number().int().positive('Limit must be positive'),
    total: z.number().int().min(0, 'Total must be non-negative'),
    totalPages: z.number().int().min(0, 'Total pages must be non-negative'),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
  filters: dailyLogFiltersSchema,
  stats: dailyLogStatsSchema.optional(),
});

// Error validation schemas
export const dailyLogErrorSchema = z.object({
  code: z.string().min(1, 'Error code is required'),
  message: z.string().min(1, 'Error message is required'),
  field: z.string().optional(),
  details: z.record(z.any()).optional(),
});

export const dailyLogValidationErrorSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  message: z.string().min(1, 'Validation message is required'),
  value: z.any().optional(),
});

// API response validation schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: dailyLogErrorSchema.optional(),
  meta: z.object({
    version: z.string().default('v1'),
    timestamp: z.string().datetime(),
  }).optional(),
});

// Photo upload validation schemas
export const photoUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  originalName: z.string().min(1, 'Original name is required'),
  fileUrl: z.string().url('Invalid file URL'),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional().or(z.literal('')),
  fileSize: z.number().int().positive('File size must be positive'),
  mimeType: z.string().min(1, 'MIME type is required'),
  caption: z.string().max(500, 'Caption too long').optional(),
  tags: z.array(z.string()).optional(),
});

// Validation helper functions
export function validateCreateDailyLog(data: unknown) {
  return createDailyLogRequestSchema.parse(data);
}

export function validateUpdateDailyLog(data: unknown) {
  return updateDailyLogRequestSchema.parse(data);
}

export function validateDailyLogFilters(data: unknown) {
  return dailyLogFiltersSchema.parse(data);
}

export function validateDailyLogQuery(data: unknown) {
  return dailyLogQuerySchema.parse(data);
}

export function validateDailyLogListResponse(data: unknown) {
  return dailyLogListResponseSchema.parse(data);
}

export function validateDailyLogStats(data: unknown) {
  return dailyLogStatsSchema.parse(data);
}

export function validatePhotoUpload(data: unknown) {
  return photoUploadSchema.parse(data);
}

// Type inference from schemas
export type ProjectPhoto = z.infer<typeof projectPhotoSchema>;
export type DailyLog = z.infer<typeof dailyLogSchema>;
export type CreateDailyLogRequest = z.infer<typeof createDailyLogRequestSchema>;
export type UpdateDailyLogRequest = z.infer<typeof updateDailyLogRequestSchema>;
export type DailyLogFilters = z.infer<typeof dailyLogFiltersSchema>;
export type DailyLogQuery = z.infer<typeof dailyLogQuerySchema>;
export type DailyLogStats = z.infer<typeof dailyLogStatsSchema>;
export type DailyLogListResponse = z.infer<typeof dailyLogListResponseSchema>;
export type DailyLogError = z.infer<typeof dailyLogErrorSchema>;
export type DailyLogValidationError = z.infer<typeof dailyLogValidationErrorSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type PhotoUpload = z.infer<typeof photoUploadSchema>;




