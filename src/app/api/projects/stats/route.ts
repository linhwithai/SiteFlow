/**
 * Project Statistics API endpoint
 * GET /api/projects/stats - Get project statistics
 */

import { auth } from '@clerk/nextjs/server';
import { and, count, eq, sum } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { projectSchema } from '@/models/Schema';
import { PROJECT_STATUS } from '@/types/Enum';
import type { ProjectStats } from '@/types/Project';

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total projects
    const [totalResult] = await db
      .select({ count: count() })
      .from(projectSchema)
      .where(
        and(
          eq(projectSchema.organizationId, orgId),
          eq(projectSchema.isActive, true),
        ),
      );

    // Get projects by status
    const [activeResult] = await db
      .select({ count: count() })
      .from(projectSchema)
      .where(
        and(
          eq(projectSchema.organizationId, orgId),
          eq(projectSchema.status, PROJECT_STATUS.ACTIVE),
          eq(projectSchema.isActive, true),
        ),
      );

    const [completedResult] = await db
      .select({ count: count() })
      .from(projectSchema)
      .where(
        and(
          eq(projectSchema.organizationId, orgId),
          eq(projectSchema.status, PROJECT_STATUS.COMPLETED),
          eq(projectSchema.isActive, true),
        ),
      );

    const [onHoldResult] = await db
      .select({ count: count() })
      .from(projectSchema)
      .where(
        and(
          eq(projectSchema.organizationId, orgId),
          eq(projectSchema.status, PROJECT_STATUS.ON_HOLD),
          eq(projectSchema.isActive, true),
        ),
      );

    const [cancelledResult] = await db
      .select({ count: count() })
      .from(projectSchema)
      .where(
        and(
          eq(projectSchema.organizationId, orgId),
          eq(projectSchema.status, PROJECT_STATUS.CANCELLED),
          eq(projectSchema.isActive, true),
        ),
      );

    // Get budget statistics
    const [budgetResult] = await db
      .select({
        totalBudget: sum(projectSchema.budget),
        count: count(),
      })
      .from(projectSchema)
      .where(
        and(
          eq(projectSchema.organizationId, orgId),
          eq(projectSchema.isActive, true),
        ),
      );

    const total = totalResult?.count || 0;
    const totalBudget = Number(budgetResult?.totalBudget) || 0;
    const averageBudget = total > 0 ? totalBudget / total : 0;

    const stats: ProjectStats = {
      total,
      active: activeResult?.count || 0,
      completed: completedResult?.count || 0,
      onHold: onHoldResult?.count || 0,
      cancelled: cancelledResult?.count || 0,
      totalBudget,
      averageBudget,
    };

    return NextResponse.json(stats);
  } catch (error) {
    logger.error('Error fetching project stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project statistics' },
      { status: 500 },
    );
  }
}
