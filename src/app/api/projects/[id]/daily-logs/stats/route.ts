/**
 * Daily Log Stats API endpoint
 * GET /api/projects/[id]/daily-logs/stats - Get daily log statistics for a project
 */

import { and, count, eq, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { 
  withDailyLogRateLimit, 
  withCache, 
  invalidateDailyLogCache,
  createErrorResponse,
  createSuccessResponse,
  validateProjectId,
  extractOrganizationId,
  logApiRequest,
  logApiResponse,
  cacheKeys
} from '@/libs/ApiMiddleware';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { constructionLogSchema, constructionProjectSchema } from '@/models/Schema';

// GET /api/projects/[id]/daily-logs/stats - Get daily log stats for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // Apply rate limiting
  const rateLimitResponse = await withDailyLogRateLimit('STATS')(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Validate project ID
  const projectIdValidation = validateProjectId(params);
  if (!projectIdValidation.success) {
    return projectIdValidation.error;
  }
  const { projectId } = projectIdValidation;

  // Extract organization ID
  const orgId = extractOrganizationId(request);

  // Log API request
  logApiRequest('GET', '/api/projects/[id]/daily-logs/stats', projectId);

  try {
    // Create cache key
    const cacheKey = cacheKeys.dailyLogStats(projectId);

    // Get data with caching
    const result = await withCache(cacheKey, async () => {
      // Get database connection
      const database = await db;

      // Verify project exists and belongs to organization
      const [project] = await database
        .select({ id: constructionProjectSchema.id })
        .from(constructionProjectSchema)
        .where(
          and(
            eq(constructionProjectSchema.id, projectId),
            eq(constructionProjectSchema.organizationId, orgId),
            eq(constructionProjectSchema.isActive, true)
          )
        )
        .limit(1);

      if (!project) {
        return null;
      }

      // Get daily log statistics
      const [totalLogs] = await database
        .select({ count: count() })
        .from(constructionLogSchema)
        .where(
          and(
            eq(constructionLogSchema.projectId, projectId),
            eq(constructionLogSchema.organizationId, orgId)
          )
        );

      // Get logs by weather
      const weatherStats = await database
        .select({
          weather: constructionLogSchema.weather,
          count: count(),
        })
        .from(constructionLogSchema)
        .where(
          and(
            eq(constructionLogSchema.projectId, projectId),
            eq(constructionLogSchema.organizationId, orgId),
            sql`${constructionLogSchema.weather} IS NOT NULL`
          )
        )
        .groupBy(constructionLogSchema.weather);

      // Get total work hours
      const [workHoursStats] = await database
        .select({
          totalWorkHours: sql<number>`COALESCE(SUM(${constructionLogSchema.dailyWorkHours}), 0)`,
          totalLaborCount: sql<number>`COALESCE(SUM(${constructionLogSchema.laborCount}), 0)`,
        })
        .from(constructionLogSchema)
        .where(
          and(
            eq(constructionLogSchema.projectId, projectId),
            eq(constructionLogSchema.organizationId, orgId)
          )
        );

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [recentActivity] = await database
        .select({ count: count() })
        .from(constructionLogSchema)
        .where(
          and(
            eq(constructionLogSchema.projectId, projectId),
            eq(constructionLogSchema.organizationId, orgId),
            sql`${constructionLogSchema.constructionDate} >= ${sevenDaysAgo}`
          )
        );

      return {
        totalLogs: totalLogs.count,
        totalWorkHours: workHoursStats.totalWorkHours,
        totalLaborCount: workHoursStats.totalLaborCount,
        recentActivity: recentActivity.count,
        weatherBreakdown: weatherStats.reduce((acc, stat) => {
          acc[stat.weather || 'Unknown'] = stat.count;
          return acc;
        }, {} as Record<string, number>),
      };
    }, 5 * 60 * 1000); // 5 minutes cache TTL

    if (!result) {
      logApiResponse('GET', '/api/projects/[id]/daily-logs/stats', 404, projectId);
      return createErrorResponse('Project not found', 404);
    }

    // Log successful response
    logApiResponse('GET', '/api/projects/[id]/daily-logs/stats', 200, projectId, undefined, {
      totalLogs: result.totalLogs
    });

    return createSuccessResponse(result);
  } catch (error) {
    logger.error('Error fetching daily log stats:', error);
    logApiResponse('GET', '/api/projects/[id]/daily-logs/stats', 500, projectId);
    return createErrorResponse('Failed to fetch daily log stats', 500);
  }
}


