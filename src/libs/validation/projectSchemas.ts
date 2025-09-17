/**
 * Project Validation Schemas
 * 
 * This module provides Zod validation schemas for project operations
 * to ensure type safety and data validation across the application
 */

import { z } from 'zod';

// Base validation schemas
export const projectSchema = z.object({
  id: z.number().int().positive('Invalid project ID'),
  organizationId: z.string().min(1, 'Organization ID is required'),
  name: z.string().min(1, 'Project name is required').max(200, 'Project name too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Status must be one of: planning, active, on_hold, completed, cancelled' })
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Priority must be one of: low, medium, high, urgent' })
  }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.number().min(0, 'Budget must be non-negative').optional(),
  actualCost: z.number().min(0, 'Actual cost must be non-negative').optional(),
  location: z.string().max(200, 'Location too long').optional(),
  clientName: z.string().max(200, 'Client name too long').optional(),
  clientContact: z.string().max(200, 'Client contact too long').optional(),
  projectManager: z.string().min(1, 'Project manager is required').optional(),
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
  isActive: z.boolean().default(true),
});

// Request validation schemas
export const createProjectRequestSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200, 'Project name too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  startDate: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid start date format').optional(),
  endDate: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid end date format').optional(),
  budget: z.number().min(0, 'Budget must be non-negative').optional(),
  location: z.string().max(200, 'Location too long').optional(),
  clientName: z.string().max(200, 'Client name too long').optional(),
  clientContact: z.string().max(200, 'Client contact too long').optional(),
  projectManager: z.string().min(1, 'Project manager is required').optional(),
});

export const updateProjectRequestSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200, 'Project name too long').optional(),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  startDate: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid start date format').optional(),
  endDate: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid end date format').optional(),
  budget: z.number().min(0, 'Budget must be non-negative').optional(),
  actualCost: z.number().min(0, 'Actual cost must be non-negative').optional(),
  location: z.string().max(200, 'Location too long').optional(),
  clientName: z.string().max(200, 'Client name too long').optional(),
  clientContact: z.string().max(200, 'Client contact too long').optional(),
  projectManager: z.string().min(1, 'Project manager is required').optional(),
});

// Filter validation schemas
export const projectFiltersSchema = z.object({
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  projectManager: z.string().min(1, 'Project manager is required').optional(),
  search: z.string().max(200, 'Search term too long').optional(),
  startDateFrom: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid start date format').optional(),
  startDateTo: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid start date format').optional(),
  endDateFrom: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid end date format').optional(),
  endDateTo: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid end date format').optional(),
  budgetMin: z.number().min(0, 'Minimum budget must be non-negative').optional(),
  budgetMax: z.number().min(0, 'Maximum budget must be non-negative').optional(),
  isActive: z.boolean().optional(),
});

// Stats validation schemas
export const projectStatsSchema = z.object({
  total: z.number().int().min(0, 'Total must be non-negative'),
  active: z.number().int().min(0, 'Active count must be non-negative'),
  completed: z.number().int().min(0, 'Completed count must be non-negative'),
  onHold: z.number().int().min(0, 'On hold count must be non-negative'),
  cancelled: z.number().int().min(0, 'Cancelled count must be non-negative'),
  totalBudget: z.number().min(0, 'Total budget must be non-negative'),
  totalActualCost: z.number().min(0, 'Total actual cost must be non-negative'),
  averageBudget: z.number().min(0, 'Average budget must be non-negative'),
  averageActualCost: z.number().min(0, 'Average actual cost must be non-negative'),
  statusBreakdown: z.record(z.string(), z.number().int().min(0)),
  priorityBreakdown: z.record(z.string(), z.number().int().min(0)),
  monthlyProgress: z.array(z.object({
    month: z.string(),
    projects: z.number().int().min(0),
    budget: z.number().min(0),
    actualCost: z.number().min(0),
  })),
});

// Response validation schemas
export const projectListResponseSchema = z.object({
  projects: z.array(projectSchema),
  pagination: z.object({
    page: z.number().int().positive('Page must be positive'),
    limit: z.number().int().positive('Limit must be positive'),
    total: z.number().int().min(0, 'Total must be non-negative'),
    totalPages: z.number().int().min(0, 'Total pages must be non-negative'),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
  filters: projectFiltersSchema,
  stats: projectStatsSchema.optional(),
});

// Validation helper functions
export function validateCreateProject(data: unknown) {
  return createProjectRequestSchema.parse(data);
}

export function validateUpdateProject(data: unknown) {
  return updateProjectRequestSchema.parse(data);
}

export function validateProjectFilters(data: unknown) {
  return projectFiltersSchema.parse(data);
}

export function validateProjectListResponse(data: unknown) {
  return projectListResponseSchema.parse(data);
}

export function validateProjectStats(data: unknown) {
  return projectStatsSchema.parse(data);
}

// Type inference from schemas
export type Project = z.infer<typeof projectSchema>;
export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;
export type UpdateProjectRequest = z.infer<typeof updateProjectRequestSchema>;
export type ProjectFilters = z.infer<typeof projectFiltersSchema>;
export type ProjectStats = z.infer<typeof projectStatsSchema>;
export type ProjectListResponse = z.infer<typeof projectListResponseSchema>;




