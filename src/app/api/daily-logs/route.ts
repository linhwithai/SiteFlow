/**
 * Daily Logs API endpoints
 * GET /api/daily-logs - List daily logs with filters
 * POST /api/daily-logs - Create new daily log
 */

import { and, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { dailyLogSchema } from '@/models/Schema';

// Validation schemas
const createDailyLogSchema = z.object({
  projectId: z.number().int().positive('Project ID must be positive'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  logDate: z.string().datetime('Invalid date format'),
  weather: z.string().max(100, 'Weather description too long').optional(),
  temperature: z.number().int().min(-50).max(60, 'Temperature must be between -50 and 60°C').optional(),
  workDescription: z.string().min(1, 'Work description is required').max(2000, 'Work description too long'),
  workHours: z.number().int().min(0).max(24, 'Work hours must be between 0 and 24').default(8),
  workersCount: z.number().int().min(0, 'Workers count must be non-negative').default(0),
  issues: z.string().max(1000, 'Issues description too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
});

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  projectId: z.string().transform(Number).optional(),
  logDateFrom: z.string().datetime().optional(),
  logDateTo: z.string().datetime().optional(),
  weather: z.string().optional(),
  workDescription: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Use real organization ID from database
    const orgId = 'org_demo_1';
    // const userId = 'test-user-123';

    // Uncomment these lines when ready for production
    // const { userId, orgId } = await auth();
    // if (!userId || !orgId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedQuery = querySchema.parse(queryParams);

    const { page, limit, projectId, logDateFrom, logDateTo, weather, workDescription, search } = validatedQuery;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [
      eq(dailyLogSchema.organizationId, orgId),
    ];

    if (projectId) {
      whereConditions.push(eq(dailyLogSchema.projectId, projectId));
    }

    if (logDateFrom) {
      whereConditions.push(gte(dailyLogSchema.logDate, new Date(logDateFrom)));
    }

    if (logDateTo) {
      whereConditions.push(lte(dailyLogSchema.logDate, new Date(logDateTo)));
    }

    if (weather) {
      whereConditions.push(ilike(dailyLogSchema.weather, `%${weather}%`));
    }

    if (workDescription) {
      whereConditions.push(ilike(dailyLogSchema.workDescription, `%${workDescription}%`));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(dailyLogSchema.workDescription, `%${search}%`),
          ilike(dailyLogSchema.issues, `%${search}%`),
          ilike(dailyLogSchema.notes, `%${search}%`),
        )!,
      );
    }

    // Get database connection
    const database = await db;

    // Query daily logs with pagination
    const [dailyLogs, totalCount] = await Promise.all([
      database
        .select()
        .from(dailyLogSchema)
        .where(and(...whereConditions))
        .orderBy(desc(dailyLogSchema.logDate))
        .limit(limit)
        .offset(offset),
      database
        .select({ count: sql`count(*)` })
        .from(dailyLogSchema)
        .where(and(...whereConditions)),
    ]);

    const total = Number(totalCount[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    logger.info(`Daily logs fetched: ${dailyLogs.length} of ${total} for org ${orgId}`);

    return NextResponse.json({
      dailyLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        projectId,
        logDateFrom,
        logDateTo,
        weather,
        workDescription,
        search,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in GET /api/daily-logs:', error.errors);
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 },
      );
    }

    logger.error('Error fetching daily logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily logs' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use real organization ID from database
    const orgId = 'org_demo_1';
    const userId = 'test-user-123';

    // Uncomment these lines when ready for production
    // const { userId, orgId } = await auth();
    // if (!userId || !orgId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const validatedData = createDailyLogSchema.parse(body);

    // Get database connection
    const database = await db;

    // Create daily log
    const [newDailyLog] = await database
      .insert(dailyLogSchema)
      .values({
        ...validatedData,
        logDate: new Date(validatedData.logDate),
        organizationId: orgId,
        createdById: userId,
      })
      .returning();

    logger.info(`Daily log created: ${newDailyLog.id} for project ${validatedData.projectId}`);

    return NextResponse.json(newDailyLog, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in POST /api/daily-logs:', error.errors);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    logger.error('Error creating daily log:', error);
    return NextResponse.json(
      { error: 'Failed to create daily log' },
      { status: 500 },
    );
  }
}
