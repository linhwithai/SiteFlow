/**
 * Validation Schemas Index
 * 
 * This module exports all validation schemas for easy importing
 */

// Daily Log Schemas
export * from './dailyLogSchemas';

// Work Item Schemas
export * from './workItemSchemas';

// Project Schemas
export * from './projectSchemas';

// Common validation utilities
export { z } from 'zod';

// Validation error helper
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: any,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Validation result type
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ValidationError;
};

// Safe validation wrapper
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: new ValidationError(
          firstError.message,
          firstError.path.join('.'),
          firstError.input,
          'VALIDATION_ERROR'
        )
      };
    }
    return {
      success: false,
      error: new ValidationError(
        'Unknown validation error',
        undefined,
        data,
        'UNKNOWN_ERROR'
      )
    };
  }
}

// Batch validation helper
export function validateBatch<T>(
  schema: z.ZodSchema<T>,
  items: unknown[]
): ValidationResult<T[]> {
  const results: T[] = [];
  const errors: ValidationError[] = [];

  for (let i = 0; i < items.length; i++) {
    const result = safeValidate(schema, items[i]);
    if (result.success) {
      results.push(result.data);
    } else {
      errors.push(new ValidationError(
        `Item ${i + 1}: ${result.error.message}`,
        result.error.field,
        result.error.value,
        result.error.code
      ));
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: new ValidationError(
        `Validation failed for ${errors.length} items`,
        undefined,
        errors,
        'BATCH_VALIDATION_ERROR'
      )
    };
  }

  return { success: true, data: results };
}




