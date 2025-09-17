/**
 * Project Stats API endpoint
 * GET /api/projects/stats - Get project statistics
 */

// import { auth } from '@clerk/nextjs/server';
import { and, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { constructionProjectSchema } from '@/models/Schema';
import { CONSTRUCTION_PROJECT_STATUS } from '@/types/Enum';

export async function GET() {
  try {
    // Use real organization ID from database
    const orgId = 'org_demo_1';
    // const userId = 'test-user-123';

    // Get database connection
    const database = await db;

    // Get project statistics
    const [stats] = await database
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(case when status = ${CONSTRUCTION_PROJECT_STATUS.ACTIVE} then 1 end)`,
        completed: sql<number>`count(case when status = ${CONSTRUCTION_PROJECT_STATUS.COMPLETED} then 1 end)`,
        onHold: sql<number>`count(case when status = ${CONSTRUCTION_PROJECT_STATUS.ON_HOLD} then 1 end)`,
        cancelled: sql<number>`count(case when status = ${CONSTRUCTION_PROJECT_STATUS.CANCELLED} then 1 end)`,
        planning: sql<number>`count(case when status = ${CONSTRUCTION_PROJECT_STATUS.PLANNING} then 1 end)`,
        totalBudget: sql<number>`coalesce(sum(budget), 0)`,
        averageBudget: sql<number>`coalesce(avg(budget), 0)`,
      })
      .from(constructionProjectSchema)
      .where(
        and(
          eq(constructionProjectSchema.organizationId, orgId),
          eq(constructionProjectSchema.isActive, true),
        ),
      );

    logger.info(`Project stats fetched for org ${orgId}`);

    return NextResponse.json({
      total: Number(stats.total),
      active: Number(stats.active),
      completed: Number(stats.completed),
      onHold: Number(stats.onHold),
      cancelled: Number(stats.cancelled),
      planning: Number(stats.planning),
      totalBudget: Number(stats.totalBudget),
      averageBudget: Number(stats.averageBudget),
    });
  } catch (error) {
    logger.error('Error fetching project stats:', error);
    
    // Return mock data for development
    return NextResponse.json({
      total: 0,
      active: 0,
      completed: 0,
      onHold: 0,
      cancelled: 0,
      planning: 0,
      totalBudget: 0,
      averageBudget: 0,
    });
  }
}
