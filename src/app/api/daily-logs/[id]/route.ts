/**
 * Individual Daily Log API endpoints
 * GET /api/daily-logs/[id] - Get daily log by ID
 * PUT /api/daily-logs/[id] - Update daily log
 * DELETE /api/daily-logs/[id] - Delete daily log
 */

import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { dailyLogSchema } from '@/models/Schema';

// Validation schemas
const updateDailyLogSchema = z.object({
  logDate: z.string().datetime('Invalid date format').optional(),
  weather: z.string().max(100, 'Weather description too long').optional(),
  temperature: z.number().int().min(-50).max(60, 'Temperature must be between -50 and 60°C').optional(),
  workDescription: z.string().min(1, 'Work description is required').max(2000, 'Work description too long').optional(),
  workHours: z.number().int().min(0).max(24, 'Work hours must be between 0 and 24').optional(),
  workersCount: z.number().int().min(0, 'Workers count must be non-negative').optional(),
  issues: z.string().max(1000, 'Issues description too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const orgId = 'org_demo_1';
    // const userId = 'test-user-123';

    // Uncomment these lines when ready for production
    // const { userId, orgId } = await auth();
    // if (!userId || !orgId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const dailyLogId = Number.parseInt(params.id);
    if (isNaN(dailyLogId)) {
      return NextResponse.json({ error: 'Invalid daily log ID' }, { status: 400 });
    }

    // Get database connection
    const database = await db;

    // Get daily log
    const [dailyLog] = await database
      .select()
      .from(dailyLogSchema)
      .where(
        and(
          eq(dailyLogSchema.id, dailyLogId),
          eq(dailyLogSchema.organizationId, orgId),
        ),
      )
      .limit(1);

    if (!dailyLog) {
      return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
    }

    logger.info(`Daily log fetched: ${dailyLogId} for org ${orgId}`);

    return NextResponse.json(dailyLog);
  } catch (error) {
    logger.error('Error fetching daily log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily log' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const orgId = 'org_demo_1';
    // const userId = 'test-user-123';

    // Uncomment these lines when ready for production
    // const { userId, orgId } = await auth();
    // if (!userId || !orgId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const dailyLogId = Number.parseInt(params.id);
    if (isNaN(dailyLogId)) {
      return NextResponse.json({ error: 'Invalid daily log ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateDailyLogSchema.parse(body);

    // Get database connection
    const database = await db;

    // Check if daily log exists and user has permission
    const [existingDailyLog] = await database
      .select()
      .from(dailyLogSchema)
      .where(
        and(
          eq(dailyLogSchema.id, dailyLogId),
          eq(dailyLogSchema.organizationId, orgId),
        ),
      )
      .limit(1);

    if (!existingDailyLog) {
      return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
    }

    // Update daily log
    const updateData: any = { ...validatedData };
    if (validatedData.logDate) {
      updateData.logDate = new Date(validatedData.logDate);
    }

    const [updatedDailyLog] = await database
      .update(dailyLogSchema)
      .set(updateData)
      .where(
        and(
          eq(dailyLogSchema.id, dailyLogId),
          eq(dailyLogSchema.organizationId, orgId),
        ),
      )
      .returning();

    logger.info(`Daily log updated: ${dailyLogId} for org ${orgId}`);

    return NextResponse.json(updatedDailyLog);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in PUT /api/daily-logs/[id]:', error.errors);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    logger.error('Error updating daily log:', error);
    return NextResponse.json(
      { error: 'Failed to update daily log' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const orgId = 'org_demo_1';
    // const userId = 'test-user-123';

    // Uncomment these lines when ready for production
    // const { userId, orgId } = await auth();
    // if (!userId || !orgId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const dailyLogId = Number.parseInt(params.id);
    if (isNaN(dailyLogId)) {
      return NextResponse.json({ error: 'Invalid daily log ID' }, { status: 400 });
    }

    // Get database connection
    const database = await db;

    // Check if daily log exists
    const [existingDailyLog] = await database
      .select()
      .from(dailyLogSchema)
      .where(
        and(
          eq(dailyLogSchema.id, dailyLogId),
          eq(dailyLogSchema.organizationId, orgId),
        ),
      )
      .limit(1);

    if (!existingDailyLog) {
      return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
    }

    // Delete daily log
    await database
      .delete(dailyLogSchema)
      .where(
        and(
          eq(dailyLogSchema.id, dailyLogId),
          eq(dailyLogSchema.organizationId, orgId),
        ),
      );

    logger.info(`Daily log deleted: ${dailyLogId} for org ${orgId}`);

    return NextResponse.json({ message: 'Daily log deleted successfully' });
  } catch (error) {
    logger.error('Error deleting daily log:', error);
    return NextResponse.json(
      { error: 'Failed to delete daily log' },
      { status: 500 },
    );
  }
}
