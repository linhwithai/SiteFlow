import { eq, and, isNull, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { constructionWorkItemSchema } from '@/models/Schema';

// GET /api/projects/[id]/work-items/stats - Get work item statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const projectId = Number.parseInt(params.id);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const database = await db;

    // Get work item statistics
    const stats = await database
      .select({
        total: sql<number>`count(*)`,
        planned: sql<number>`count(case when status = 'planned' then 1 end)`,
        inProgress: sql<number>`count(case when status = 'in_progress' then 1 end)`,
        completed: sql<number>`count(case when status = 'completed' then 1 end)`,
        cancelled: sql<number>`count(case when status = 'cancelled' then 1 end)`,
        overdue: sql<number>`count(case when due_date < now() and status != 'completed' and status != 'cancelled' then 1 end)`,
        totalEstimatedHours: sql<number>`coalesce(sum(estimated_work_hours), 0)`,
        totalActualHours: sql<number>`coalesce(sum(actual_work_hours), 0)`,
        averageProgress: sql<number>`coalesce(avg(case when status = 'completed' then 100 when status = 'in_progress' then 50 when status = 'planned' then 0 else 0 end), 0)`,
      })
      .from(constructionWorkItemSchema)
      .where(
        and(
          eq(constructionWorkItemSchema.projectId, projectId),
          isNull(constructionWorkItemSchema.deletedAt),
        ),
      );

    const result = stats[0];

    logger.info(`Work item stats fetched for project ${projectId}`);

    return NextResponse.json({
      total: result.total || 0,
      planned: result.planned || 0,
      inProgress: result.inProgress || 0,
      completed: result.completed || 0,
      cancelled: result.cancelled || 0,
      overdue: result.overdue || 0,
      totalEstimatedHours: result.totalEstimatedHours || 0,
      totalActualHours: result.totalActualHours || 0,
      averageProgress: Math.round(result.averageProgress || 0),
    });
  } catch (error) {
    logger.error('Error fetching work item stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work item stats' },
      { status: 500 },
    );
  }
}







