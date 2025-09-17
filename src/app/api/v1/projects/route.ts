/**
 * Projects API v1 endpoints
 * GET /api/v1/projects - List projects with filters
 * POST /api/v1/projects - Create new project
 */

import { auth } from '@clerk/nextjs/server';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { constructionProjectSchema } from '@/models/Schema';
import { CONSTRUCTION_PROJECT_STATUS } from '@/types/Enum';

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name too long'),
  workItemDescription: z.string().max(1000, 'Description too long').optional(),
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
  status: z.enum(Object.values(CONSTRUCTION_PROJECT_STATUS) as [string, ...string[]]).optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  projectManagerId: z.string().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedQuery = querySchema.parse(queryParams);

    const { page, limit, status, city, province, projectManagerId, isActive, search } = validatedQuery;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [
      eq(constructionProjectSchema.organizationId, orgId),
    ];

    if (status) {
      whereConditions.push(eq(constructionProjectSchema.status, status));
    }

    if (city) {
      whereConditions.push(ilike(constructionProjectSchema.city, `%${city}%`));
    }

    if (province) {
      whereConditions.push(ilike(constructionProjectSchema.province, `%${province}%`));
    }

    if (projectManagerId) {
      whereConditions.push(eq(constructionProjectSchema.projectManagerId, projectManagerId));
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(constructionProjectSchema.isActive, isActive));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(constructionProjectSchema.name, `%${search}%`),
          ilike(constructionProjectSchema.workItemDescription, `%${search}%`),
          ilike(constructionProjectSchema.address, `%${search}%`),
        )!,
      );
    }

    // Get database connection
    const database = await db;

    // Query projects with pagination
    const [projects, totalCount] = await Promise.all([
      database
        .select()
        .from(constructionProjectSchema)
        .where(and(...whereConditions))
        .orderBy(desc(constructionProjectSchema.createdAt))
        .limit(limit)
        .offset(offset),
      database
        .select({ count: sql`count(*)` })
        .from(constructionProjectSchema)
        .where(and(...whereConditions))
        .then((result: any) => result[0]?.count || 0),
    ]);

    const total = Number(totalCount);
    const totalPages = Math.ceil(total / limit);

    logger.info(`Projects fetched for org ${orgId}`, {
      total,
      page,
      limit,
      filters: { status, city, province, projectManagerId, isActive, search },
    });

    return NextResponse.json({
      success: true,
      data: {
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
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in GET /api/v1/projects:', error.errors);
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.errors,
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    logger.error('Error fetching projects:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch projects',
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    // Get database connection
    const database = await db;

    // Create project with ERP audit trail
    const [newProject] = await database
      .insert(constructionProjectSchema)
      .values({
        ...validatedData,
        organizationId: orgId,
        createdById: userId,
        updatedById: userId,
        version: 1,
      })
      .returning();

    logger.info(`Project created for org ${orgId}`, {
      projectId: newProject.id,
      projectName: newProject.name,
      createdBy: userId,
    });

    return NextResponse.json({
      success: true,
      data: newProject,
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in POST /api/v1/projects:', error.errors);
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    logger.error('Error creating project:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create project',
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
