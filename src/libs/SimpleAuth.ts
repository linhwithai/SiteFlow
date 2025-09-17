/**
 * Simple Authentication Middleware
 * Provides basic security checks without complex dependencies
 */

import type { NextRequest } from 'next/server';

export interface AuthContext {
  userId: string;
  organizationId: string;
  isAuthenticated: boolean;
}

/**
 * Extract authentication context from request
 * In production, this should validate JWT tokens or session cookies
 */
export function extractAuthContext(request: NextRequest): AuthContext {
  // In development, use headers or default values
  const userId = request.headers.get('x-user-id') || 'test-user-123';
  const organizationId = request.headers.get('x-organization-id') || 'org_demo_1';
  
  // In production, you would:
  // 1. Extract JWT token from Authorization header
  // 2. Verify token signature
  // 3. Extract user and organization info from token payload
  // 4. Validate user permissions
  
  return {
    userId,
    organizationId,
    isAuthenticated: true, // In production, check if token is valid
  };
}

/**
 * Validate that user has access to organization
 */
export function validateOrganizationAccess(
  userOrgId: string, 
  resourceOrgId: string
): boolean {
  return userOrgId === resourceOrgId;
}

/**
 * Simple rate limiting (in-memory)
 * In production, use Redis or database
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string, 
  limit: number = 100, 
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Log security events
 */
export function logSecurityEvent(
  event: string,
  userId: string,
  organizationId: string,
  details?: any
) {
  console.log(`🔒 Security Event: ${event}`, {
    userId,
    organizationId,
    timestamp: new Date().toISOString(),
    details,
  });
}


