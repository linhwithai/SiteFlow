/**
 * Daily Log Stats API endpoint
 * GET /api/daily-logs/stats - Get daily log statistics
 */

import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { dailyLogSchema } from '@/models/Schema';

export async function GET() {
  try {
    // Use real organization ID from database
    const orgId = 'org_demo_1';
    // const userId = 'test-user-123';

    // Uncomment these lines when ready for production
    // const { userId, orgId } = await auth();
    // if (!userId || !orgId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get database connection
    const database = await db;

    // Calculate date ranges
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get daily log statistics
    const [stats] = await database
      .select({
        total: sql<number>`count(*)`,
        thisWeek: sql<number>`count(case when log_date >= ${startOfWeek} then 1 end)`,
        thisMonth: sql<number>`count(case when log_date >= ${startOfMonth} then 1 end)`,
        totalWorkHours: sql<number>`coalesce(sum(work_hours), 0)`,
        averageWorkHours: sql<number>`coalesce(avg(work_hours), 0)`,
        totalWorkers: sql<number>`coalesce(sum(workers_count), 0)`,
        averageWorkers: sql<number>`coalesce(avg(workers_count), 0)`,
      })
      .from(dailyLogSchema)
      .where(eq(dailyLogSchema.organizationId, orgId));

    logger.info(`Daily log stats fetched for org ${orgId}`);

    return NextResponse.json({
      total: Number(stats.total),
      thisWeek: Number(stats.thisWeek),
      thisMonth: Number(stats.thisMonth),
      totalWorkHours: Number(stats.totalWorkHours),
      averageWorkHours: Number(stats.averageWorkHours),
      totalWorkers: Number(stats.totalWorkers),
      averageWorkers: Number(stats.averageWorkers),
    });
  } catch (error) {
    logger.error('Error fetching daily log stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily log stats' },
      { status: 500 },
    );
  }
}
