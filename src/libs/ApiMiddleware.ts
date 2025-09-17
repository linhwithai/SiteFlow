/**
 * API Middleware for Daily Logs
 * 
 * This module provides middleware functions for rate limiting,
 * caching, and error handling for daily logs API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { CacheInvalidator, createCacheManager } from './Cache';
import { logger } from './Logger';
import { withRateLimit, extractUserIdentifier } from './RateLimiter';

// Cache manager for daily logs
const dailyLogCache = createCacheManager('PROJECT');

// Rate limiting configurations for daily logs
const DAILY_LOG_RATE_LIMITS = {
  LIST: { windowMs: 15 * 60 * 1000, maxRequests: 50 }, // 50 requests per 15 minutes
  CREATE: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 requests per 15 minutes
  UPDATE: { windowMs: 15 * 60 * 1000, maxRequests: 20 }, // 20 requests per 15 minutes
  DELETE: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
  PHOTOS: { windowMs: 60 * 60 * 1000, maxRequests: 20 }, // 20 requests per hour
  STATS: { windowMs: 5 * 60 * 1000, maxRequests: 30 }, // 30 requests per 5 minutes
} as const;

/**
 * Apply rate limiting to daily logs endpoints
 */
export function withDailyLogRateLimit(operation: keyof typeof DAILY_LOG_RATE_LIMITS) {
  const config = DAILY_LOG_RATE_LIMITS[operation];
  const rateLimiter = withRateLimit('GENERAL', extractUserIdentifier);
  
  return async (request: NextRequest) => {
    const result = await rateLimiter(request);
    
    if (!result.allowed) {
      return result.response;
    }
    
    return null;
  };
}

/**
 * Cache key generators for daily logs
 */
export const cacheKeys = {
  dailyLogsList: (projectId: number, filters: Record<string, any>) => 
    `daily-logs:list:${projectId}:${JSON.stringify(filters)}`,
  
  dailyLogDetail: (projectId: number, dailyLogId: number) => 
    `daily-logs:detail:${projectId}:${dailyLogId}`,
  
  dailyLogStats: (projectId: number) => 
    `daily-logs:stats:${projectId}`,
  
  dailyLogPhotos: (projectId: number, dailyLogId: number) => 
    `daily-logs:photos:${projectId}:${dailyLogId}`,
};

/**
 * Get cached data or execute function and cache result
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await dailyLogCache.get<T>(key);
    if (cached !== null) {
      logger.debug('Cache hit for daily logs', {  key  });
      return cached;
    }

    // Execute fetcher function
    const result = await fetcher();
    
    // Store in cache
    await dailyLogCache.set(key, result, ttl);
    
    logger.debug('Cache miss, stored result', { key });
    return result;
  } catch (error) {
    logger.error('Cache error for daily logs', {  key, error  });
    // If cache fails, still execute fetcher
    return await fetcher();
  }
}

/**
 * Invalidate cache for daily logs
 */
export async function invalidateDailyLogCache(projectId: number, dailyLogId?: number) {
  try {
    // Invalidate project-level cache
    await CacheInvalidator.invalidateProject(projectId);
    
    // Invalidate specific daily log cache if provided
    if (dailyLogId) {
      await dailyLogCache.delete(cacheKeys.dailyLogDetail(projectId, dailyLogId));
      await dailyLogCache.delete(cacheKeys.dailyLogPhotos(projectId, dailyLogId));
    }
    
    // Invalidate stats cache
    await dailyLogCache.delete(cacheKeys.dailyLogStats(projectId));
    
    logger.info('Daily log cache invalidated', {  projectId, dailyLogId  });
  } catch (error) {
    logger.error('Error invalidating daily log cache', {  projectId, dailyLogId, error  });
  }
}

/**
 * Standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: any
): NextResponse {
  const errorResponse = {
    success: false,
    error: {
      code: getErrorCode(status),
      message,
      details,
    },
    meta: {
      version: 'v1',
      timestamp: new Date().toISOString(),
    },
  };

  logger.error('API Error Response', {  message, status, details  });

  return NextResponse.json(errorResponse, { status });
}

/**
 * Get error code based on status
 */
function getErrorCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION_ERROR';
    case 429:
      return 'RATE_LIMIT_EXCEEDED';
    case 500:
      return 'INTERNAL_SERVER_ERROR';
    default:
      return 'UNKNOWN_ERROR';
  }
}

/**
 * Standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  meta?: Record<string, any>
): NextResponse {
  const response = {
    success: true,
    data,
    meta: {
      version: 'v1',
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Validate request parameters
 */
export function validateParams<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error', {  errors: error.errors  });
      return {
        success: false,
        error: createErrorResponse('Validation failed', 400, {
          validationErrors: error.errors,
        }),
      };
    }
    
    logger.error('Unknown validation error', {  error  });
    return {
      success: false,
      error: createErrorResponse('Invalid request data', 400),
    };
  }
}

/**
 * Extract and validate project ID from params
 */
export function validateProjectId(params: { id: string }): 
  { success: true; projectId: number } | { success: false; error: NextResponse } {
  const projectId = Number.parseInt(params.id);
  
  if (isNaN(projectId) || projectId <= 0) {
    return {
      success: false,
      error: createErrorResponse('Invalid project ID', 400),
    };
  }
  
  return { success: true, projectId };
}

/**
 * Extract and validate daily log ID from params
 */
export function validateDailyLogId(params: { dailyLogId: string }): 
  { success: true; dailyLogId: number } | { success: false; error: NextResponse } {
  const dailyLogId = Number.parseInt(params.dailyLogId);
  
  if (isNaN(dailyLogId) || dailyLogId <= 0) {
    return {
      success: false,
      error: createErrorResponse('Invalid daily log ID', 400),
    };
  }
  
  return { success: true, dailyLogId };
}

/**
 * Extract organization ID from request (placeholder implementation)
 * In production, this would extract from JWT token or session
 */
export function extractOrganizationId(request: NextRequest): string {
  // For now, return a demo organization ID
  // In production, extract from JWT token or session
  return 'org_demo_1';
}

/**
 * Extract user ID from request (placeholder implementation)
 * In production, this would extract from JWT token or session
 */
export function extractUserId(request: NextRequest): string {
  // For now, return a demo user ID
  // In production, extract from JWT token or session
  const userId = 'test-user-123';
  console.log('extractUserId called, returning:', userId);
  return userId;
}

/**
 * Log API request
 */
export function logApiRequest(
  method: string,
  endpoint: string,
  projectId?: number,
  dailyLogId?: number,
  additionalData?: Record<string, any>
) {
  logger.info('API Request', { 
    method,
    endpoint,
    projectId,
    dailyLogId,
    ...additionalData,
   });
}

/**
 * Log API response
 */
export function logApiResponse(
  method: string,
  endpoint: string,
  status: number,
  projectId?: number,
  dailyLogId?: number,
  additionalData?: Record<string, any>
) {
  logger.info('API Response', { 
    method,
    endpoint,
    status,
    projectId,
    dailyLogId,
    ...additionalData,
   });
}

