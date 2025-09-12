/**
 * Projects API endpoints
 * GET /api/projects - List projects with filters
 * POST /api/projects - Create new project
 */

import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { projectSchema } from '@/models/Schema';
import { PROJECT_STATUS } from '@/types/Enum';

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  address: z.string().max(500, 'Address too long').optional(),
  city: z.string().max(100, 'City name too long').optional(),
  province: z.string().max(100, 'Province name too long').optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().min(0, 'Budget must be positive').optional(),
  projectManagerId: z.string().optional(),
});

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  status: z.enum(Object.values(PROJECT_STATUS) as [string, ...string[]]).optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  projectManagerId: z.string().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
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

    const { page, limit, status, city, province, projectManagerId, isActive, search } = validatedQuery;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [
      eq(projectSchema.organizationId, orgId),
    ];

    if (status) {
      whereConditions.push(eq(projectSchema.status, status));
    }

    if (city) {
      whereConditions.push(ilike(projectSchema.city, `%${city}%`));
    }

    if (province) {
      whereConditions.push(ilike(projectSchema.province, `%${province}%`));
    }

    if (projectManagerId) {
      whereConditions.push(eq(projectSchema.projectManagerId, projectManagerId));
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(projectSchema.isActive, isActive));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(projectSchema.name, `%${search}%`),
          ilike(projectSchema.description, `%${search}%`),
          ilike(projectSchema.address, `%${search}%`),
        ),
      );
    }

    // Get database connection
    const database = await db;

    // Query projects with pagination
    const [projects, totalCount] = await Promise.all([
      database
        .select()
        .from(projectSchema)
        .where(and(...whereConditions))
        .orderBy(desc(projectSchema.createdAt))
        .limit(limit)
        .offset(offset),
      database
        .select({ count: sql`count(*)` })
        .from(projectSchema)
        .where(and(...whereConditions))
        .then(result => result[0]?.count || 0),
    ]);

    const total = Number(totalCount);
    const totalPages = Math.ceil(total / limit);

    logger.info(`Projects fetched: ${projects.length} of ${total} for org ${orgId}`);

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        status,
        city,
        province,
        projectManagerId,
        isActive,
        search,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in GET /api/projects:', error.errors);
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 },
      );
    }

    logger.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use real organization ID from database
    const orgId = 'org_demo_1';
    // const userId = 'test-user-123';

    // Uncomment these lines when ready for production
    // const { userId, orgId } = await auth();
    // if (!userId || !orgId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    // Get database connection
    const database = await db;

    // Create project
    const [newProject] = await database
      .insert(projectSchema)
      .values({
        organizationId: orgId,
        name: validatedData.name,
        description: validatedData.description,
        address: validatedData.address,
        city: validatedData.city,
        province: validatedData.province,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        budget: validatedData.budget,
        status: PROJECT_STATUS.PLANNING,
        projectManagerId: validatedData.projectManagerId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    logger.info(`Project created: ${newProject?.id} by user ${userId}`);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in POST /api/projects:', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    logger.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 },
    );
  }
}
