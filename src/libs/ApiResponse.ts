/**
 * Standardized API Response Format for ERP System
 * 
 * This file provides a consistent response format across all API endpoints
 * to ensure better error handling, versioning, and client integration
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: PaginationMeta;
    version: string;
    timestamp: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  version: string = 'v1',
  pagination?: PaginationMeta
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      version,
      timestamp: new Date().toISOString(),
      ...(pagination && { pagination }),
    },
  };
}

// Error response helper
export function createErrorResponse(
  error: ApiError,
  version: string = 'v1'
): ApiResponse {
  return {
    success: false,
    error,
    meta: {
      version,
      timestamp: new Date().toISOString(),
    },
  };
}

// Common error codes
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resource Management
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Business Logic
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // System Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // ERP Specific
  AUDIT_TRAIL_ERROR: 'AUDIT_TRAIL_ERROR',
  SOFT_DELETE_ERROR: 'SOFT_DELETE_ERROR',
  VERSION_CONFLICT: 'VERSION_CONFLICT',
  FINANCIAL_VALIDATION_ERROR: 'FINANCIAL_VALIDATION_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Common error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.UNAUTHORIZED]: 'Authentication required',
  [ERROR_CODES.FORBIDDEN]: 'Insufficient permissions',
  [ERROR_CODES.INVALID_TOKEN]: 'Invalid or expired token',
  [ERROR_CODES.VALIDATION_ERROR]: 'Validation failed',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input data',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Required field is missing',
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Resource not found',
  [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: 'Resource already exists',
  [ERROR_CODES.RESOURCE_CONFLICT]: 'Resource conflict',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions for this operation',
  [ERROR_CODES.BUSINESS_RULE_VIOLATION]: 'Business rule violation',
  [ERROR_CODES.QUOTA_EXCEEDED]: 'Quota exceeded',
  [ERROR_CODES.INTERNAL_ERROR]: 'Internal server error',
  [ERROR_CODES.DATABASE_ERROR]: 'Database operation failed',
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'External service error',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [ERROR_CODES.AUDIT_TRAIL_ERROR]: 'Audit trail operation failed',
  [ERROR_CODES.SOFT_DELETE_ERROR]: 'Soft delete operation failed',
  [ERROR_CODES.VERSION_CONFLICT]: 'Version conflict detected',
  [ERROR_CODES.FINANCIAL_VALIDATION_ERROR]: 'Financial validation failed',
} as const;

// Helper function to create standardized error responses
export function createStandardError(
  code: ErrorCode,
  customMessage?: string,
  details?: any,
  version: string = 'v1'
): ApiResponse {
  return createErrorResponse(
    {
      code,
      message: customMessage || ERROR_MESSAGES[code],
      details,
    },
    version
  );
}

// Helper function to create validation error response
export function createValidationError(
  errors: any[],
  version: string = 'v1'
): ApiResponse {
  return createErrorResponse(
    {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed',
      details: errors,
    },
    version
  );
}

// Helper function to create not found error response
export function createNotFoundError(
  resource: string,
  version: string = 'v1'
): ApiResponse {
  return createErrorResponse(
    {
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: `${resource} not found`,
    },
    version
  );
}

// Helper function to create unauthorized error response
export function createUnauthorizedError(
  version: string = 'v1'
): ApiResponse {
  return createErrorResponse(
    {
      code: ERROR_CODES.UNAUTHORIZED,
      message: ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED],
    },
    version
  );
}

// Helper function to create forbidden error response
export function createForbiddenError(
  version: string = 'v1'
): ApiResponse {
  return createErrorResponse(
    {
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES[ERROR_CODES.FORBIDDEN],
    },
    version
  );
}

// Helper function to create internal error response
export function createInternalError(
  error?: Error,
  version: string = 'v1'
): ApiResponse {
  return createErrorResponse(
    {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
      details: error?.message,
    },
    version
  );
}
