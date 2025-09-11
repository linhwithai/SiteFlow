/**
 * Individual Project API endpoints
 * GET /api/projects/[id] - Get project by ID
 * PUT /api/projects/[id] - Update project
 * DELETE /api/projects/[id] - Delete project
 */

import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { projectSchema } from '@/models/Schema';
import { PROJECT_STATUS } from '@/types/Enum';

// Validation schema
const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  address: z.string().max(500, 'Address too long').optional(),
  city: z.string().max(100, 'City name too long').optional(),
  province: z.string().max(100, 'Province name too long').optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().min(0, 'Budget must be positive').optional(),
  status: z.enum(Object.values(PROJECT_STATUS) as [string, ...string[]]).optional(),
  projectManagerId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = Number.parseInt(params.id, 10);

    const [project] = await db
      .select()
      .from(projectSchema)
      .where(
        and(
          eq(projectSchema.id, projectId),
          eq(projectSchema.organizationId, orgId),
        ),
      )
      .limit(1);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    logger.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = Number.parseInt(params.id, 10);
    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    // Check if project exists and belongs to organization
    const [existingProject] = await db
      .select()
      .from(projectSchema)
      .where(
        and(
          eq(projectSchema.id, projectId),
          eq(projectSchema.organizationId, orgId),
        ),
      )
      .limit(1);

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 },
      );
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    };

    // Convert date strings to Date objects
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate);
    }

    // Update project
    const [updatedProject] = await db
      .update(projectSchema)
      .set(updateData)
      .where(eq(projectSchema.id, projectId))
      .returning();

    logger.info(`Project updated: ${projectId} by user ${userId}`);

    return NextResponse.json(updatedProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    logger.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = Number.parseInt(params.id, 10);

    // Check if project exists and belongs to organization
    const [existingProject] = await db
      .select()
      .from(projectSchema)
      .where(
        and(
          eq(projectSchema.id, projectId),
          eq(projectSchema.organizationId, orgId),
        ),
      )
      .limit(1);

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 },
      );
    }

    // Soft delete - set isActive to false
    await db
      .update(projectSchema)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(projectSchema.id, projectId));

    logger.info(`Project deleted: ${projectId} by user ${userId}`);

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    logger.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 },
    );
  }
}
