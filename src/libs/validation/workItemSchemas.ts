/**
 * Work Item Validation Schemas
 * 
 * This module provides Zod validation schemas for work item operations
 * to ensure type safety and data validation across the application
 */

import { z } from 'zod';

// Base validation schemas
export const workItemSchema = z.object({
  id: z.number().int().positive('Invalid work item ID'),
  projectId: z.number().int().positive('Project ID is required'),
  dailyLogId: z.number().int().positive('Daily log ID is required').optional(),
  organizationId: z.string().min(1, 'Organization ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Status must be one of: pending, in_progress, completed, cancelled' })
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Priority must be one of: low, medium, high, urgent' })
  }),
  type: z.enum(['task', 'milestone', 'deliverable', 'issue'], {
    errorMap: () => ({ message: 'Type must be one of: task, milestone, deliverable, issue' })
  }),
  assignedTo: z.string().min(1, 'Assigned to is required').optional(),
  estimatedHours: z.number().min(0, 'Estimated hours must be non-negative').optional(),
  actualHours: z.number().min(0, 'Actual hours must be non-negative').optional(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  completedDate: z.date().optional(),
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
});

// Request validation schemas
export const createWorkItemRequestSchema = z.object({
  projectId: z.number().int().positive('Project ID is required'),
  dailyLogId: z.number().int().positive('Daily log ID is required').optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  type: z.enum(['task', 'milestone', 'deliverable', 'issue']).default('task'),
  assignedTo: z.string().min(1, 'Assigned to is required').optional(),
  estimatedHours: z.number().min(0, 'Estimated hours must be non-negative').optional(),
  startDate: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid start date format').optional(),
  dueDate: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid due date format').optional(),
});

export const updateWorkItemRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  type: z.enum(['task', 'milestone', 'deliverable', 'issue']).optional(),
  assignedTo: z.string().min(1, 'Assigned to is required').optional(),
  estimatedHours: z.number().min(0, 'Estimated hours must be non-negative').optional(),
  actualHours: z.number().min(0, 'Actual hours must be non-negative').optional(),
  startDate: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid start date format').optional(),
  dueDate: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid due date format').optional(),
  completedDate: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid completed date format').optional(),
});

// Filter validation schemas
export const workItemFiltersSchema = z.object({
  projectId: z.number().int().positive('Invalid project ID').optional(),
  dailyLogId: z.number().int().positive('Invalid daily log ID').optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  type: z.enum(['task', 'milestone', 'deliverable', 'issue']).optional(),
  assignedTo: z.string().min(1, 'Assigned to is required').optional(),
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
  dueDateFrom: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid due date format').optional(),
  dueDateTo: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid due date format').optional(),
  overdue: z.boolean().optional(),
});

// Stats validation schemas
export const workItemStatsSchema = z.object({
  total: z.number().int().min(0, 'Total must be non-negative'),
  pending: z.number().int().min(0, 'Pending count must be non-negative'),
  inProgress: z.number().int().min(0, 'In progress count must be non-negative'),
  completed: z.number().int().min(0, 'Completed count must be non-negative'),
  cancelled: z.number().int().min(0, 'Cancelled count must be non-negative'),
  overdue: z.number().int().min(0, 'Overdue count must be non-negative'),
  totalEstimatedHours: z.number().min(0, 'Total estimated hours must be non-negative'),
  totalActualHours: z.number().min(0, 'Total actual hours must be non-negative'),
  completionRate: z.number().min(0).max(100, 'Completion rate must be between 0 and 100'),
  averageCompletionTime: z.number().min(0, 'Average completion time must be non-negative'),
  priorityBreakdown: z.record(z.string(), z.number().int().min(0)),
  typeBreakdown: z.record(z.string(), z.number().int().min(0)),
  statusBreakdown: z.record(z.string(), z.number().int().min(0)),
});

// Response validation schemas
export const workItemListResponseSchema = z.object({
  workItems: z.array(workItemSchema),
  pagination: z.object({
    page: z.number().int().positive('Page must be positive'),
    limit: z.number().int().positive('Limit must be positive'),
    total: z.number().int().min(0, 'Total must be non-negative'),
    totalPages: z.number().int().min(0, 'Total pages must be non-negative'),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
  filters: workItemFiltersSchema,
  stats: workItemStatsSchema.optional(),
});

// Validation helper functions
export function validateCreateWorkItem(data: unknown) {
  return createWorkItemRequestSchema.parse(data);
}

export function validateUpdateWorkItem(data: unknown) {
  return updateWorkItemRequestSchema.parse(data);
}

export function validateWorkItemFilters(data: unknown) {
  return workItemFiltersSchema.parse(data);
}

export function validateWorkItemListResponse(data: unknown) {
  return workItemListResponseSchema.parse(data);
}

export function validateWorkItemStats(data: unknown) {
  return workItemStatsSchema.parse(data);
}

// Type inference from schemas
export type WorkItem = z.infer<typeof workItemSchema>;
export type CreateWorkItemRequest = z.infer<typeof createWorkItemRequestSchema>;
export type UpdateWorkItemRequest = z.infer<typeof updateWorkItemRequestSchema>;
export type WorkItemFilters = z.infer<typeof workItemFiltersSchema>;
export type WorkItemStats = z.infer<typeof workItemStatsSchema>;
export type WorkItemListResponse = z.infer<typeof workItemListResponseSchema>;




