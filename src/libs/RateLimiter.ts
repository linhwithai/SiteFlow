/**
 * Rate Limiting System for ERP API
 * 
 * This module provides rate limiting functionality to prevent abuse
 * and ensure fair usage of the API resources
 */

import { logger } from './Logger';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (identifier: string) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // General API endpoints
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  
  // Authentication endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  
  // File upload endpoints
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  },
  
  // Financial endpoints (more restrictive)
  FINANCIAL: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20,
  },
  
  // Reporting endpoints
  REPORTS: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 5,
  },
  
  // Webhook endpoints
  WEBHOOK: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
  },
} as const;

export class RateLimiter {
  private config: RateLimitConfig;
  private store: Map<string, RateLimitEntry>;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.store = rateLimitStore;
  }

  /**
   * Check if request is within rate limit
   */
  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`;

    const now = Date.now();
    // const windowStart = now - this.config.windowMs;

    // Get current entry
    let entry = this.store.get(key);

    // Clean up expired entries
    if (entry && entry.resetTime < now) {
      this.store.delete(key);
      entry = undefined;
    }

    // Create new entry if none exists
    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      logger.warn('Rate limit exceeded', {
        identifier,
        key,
        count: entry.count,
        maxRequests: this.config.maxRequests,
        retryAfter,
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter,
      };
    }

    // Increment counter
    entry.count++;
    this.store.set(key, entry);

    // Clean up old entries periodically
    this.cleanup();

    logger.debug('Rate limit check passed', {
      identifier,
      key,
      count: entry.count,
      maxRequests: this.config.maxRequests,
      remaining: this.config.maxRequests - entry.count,
    });

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  async resetLimit(identifier: string): Promise<void> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`;

    this.store.delete(key);
    
    logger.info('Rate limit reset', { identifier, key });
  }

  /**
   * Get current rate limit status
   */
  async getStatus(identifier: string): Promise<{
    count: number;
    remaining: number;
    resetTime: number;
  } | null> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`;

    const entry = this.store.get(key);
    
    if (!entry || entry.resetTime < Date.now()) {
      return null;
    }

    return {
      count: entry.count,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.store.delete(key));

    if (expiredKeys.length > 0) {
      logger.debug('Cleaned up expired rate limit entries', {
        count: expiredKeys.length,
      });
    }
  }

  /**
   * Get all active rate limits (for monitoring)
   */
  getAllActiveLimits(): Array<{
    key: string;
    count: number;
    remaining: number;
    resetTime: number;
  }> {
    const now = Date.now();
    const activeLimits: Array<{
      key: string;
      count: number;
      remaining: number;
      resetTime: number;
    }> = [];

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime >= now) {
        activeLimits.push({
          key,
          count: entry.count,
          remaining: this.config.maxRequests - entry.count,
          resetTime: entry.resetTime,
        });
      }
    }

    return activeLimits;
  }
}

// Factory function to create rate limiters for different endpoints
export function createRateLimiter(type: keyof typeof RATE_LIMIT_CONFIGS): RateLimiter {
  const config = RATE_LIMIT_CONFIGS[type];
  
  return new RateLimiter({
    ...config,
    keyGenerator: (identifier: string) => `rate_limit:${type}:${identifier}`,
  });
}

// Middleware function for API routes
export function withRateLimit(
  type: keyof typeof RATE_LIMIT_CONFIGS,
  identifierExtractor?: (request: Request) => string
) {
  const rateLimiter = createRateLimiter(type);

  return async (request: Request): Promise<{
    allowed: boolean;
    response?: Response;
  }> => {
    try {
      // Extract identifier (IP address, user ID, etc.)
      const identifier = identifierExtractor 
        ? identifierExtractor(request)
        : getClientIP(request);

      const result = await rateLimiter.checkLimit(identifier);

      if (!result.allowed) {
        return {
          allowed: false,
          response: new Response(
            JSON.stringify({
              success: false,
              error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests',
                details: {
                  retryAfter: result.retryAfter,
                  resetTime: result.resetTime,
                },
              },
              meta: {
                version: 'v1',
                timestamp: new Date().toISOString(),
              },
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': result.retryAfter?.toString() || '60',
                'X-RateLimit-Limit': RATE_LIMIT_CONFIGS[type].maxRequests.toString(),
                'X-RateLimit-Remaining': result.remaining.toString(),
                'X-RateLimit-Reset': result.resetTime.toString(),
              },
            }
          ),
        };
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Rate limiting error:', error);
      // Allow request to proceed if rate limiting fails
      return { allowed: true };
    }
  };
}

// Helper function to extract client IP
function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded?.split(',')[0]?.trim() || 'unknown';
  }
  
  if (realIP) {
    return realIP;
  }
  
  // Fallback to a default identifier
  return 'unknown';
}

// Helper function to extract user ID from request
export function extractUserIdentifier(request: Request): string {
  // This would typically extract user ID from JWT token or session
  // For now, we'll use IP as fallback
  return getClientIP(request);
}
