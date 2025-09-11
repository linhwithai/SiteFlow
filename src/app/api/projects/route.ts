/**
 * Projects API endpoints
 * GET /api/projects - List projects with filters
 * POST /api/projects - Create new project
 */

import { auth } from '@clerk/nextjs/server';
import { and, desc, eq, ilike, or } from 'drizzle-orm';
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
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Build where conditions
    const conditions = [eq(projectSchema.organizationId, orgId)];

    if (query.status) {
      conditions.push(eq(projectSchema.status, query.status));
    }

    if (query.city) {
      conditions.push(ilike(projectSchema.city, `%${query.city}%`));
    }

    if (query.province) {
      conditions.push(ilike(projectSchema.province, `%${query.province}%`));
    }

    if (query.projectManagerId) {
      conditions.push(eq(projectSchema.projectManagerId, query.projectManagerId));
    }

    if (query.isActive !== undefined) {
      conditions.push(eq(projectSchema.isActive, query.isActive));
    }

    if (query.search) {
      conditions.push(
        or(
          ilike(projectSchema.name, `%${query.search}%`),
          ilike(projectSchema.description, `%${query.search}%`),
          ilike(projectSchema.address, `%${query.search}%`),
        )!,
      );
    }

    // Get total count
    const totalResult = await db
      .select({ count: projectSchema.id })
      .from(projectSchema)
      .where(and(...conditions));

    const total = totalResult.length;

    // Get projects with pagination
    const projects = await db
      .select()
      .from(projectSchema)
      .where(and(...conditions))
      .orderBy(desc(projectSchema.createdAt))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);

    return NextResponse.json({
      projects,
      total,
      page: query.page,
      limit: query.limit,
    });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
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

    // Create project
    const [newProject] = await db
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
