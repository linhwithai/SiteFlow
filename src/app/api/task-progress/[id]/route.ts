/**
 * Individual Task Progress API endpoints
 * GET /api/task-progress/[id] - Get task progress by ID
 * PUT /api/task-progress/[id] - Update task progress
 * DELETE /api/task-progress/[id] - Delete task progress
 */

import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
// import { constructionTaskProgressSchema, constructionTaskSchema } from '@/models/Schema';

// Validation schemas
const updateTaskProgressSchema = z.object({
  progressDate: z.string().datetime('Invalid date format').optional(),
  progressPercentage: z.number().int().min(0).max(100, 'Progress must be between 0 and 100').optional(),
  constructionWorkDescription: z.string().min(1, 'Work workItemDescription is required').max(2000, 'Work workItemDescription too long').optional(),
  dailyWorkHours: z.number().int().min(0).max(24, 'Work hours must be between 0 and 24').optional(),
  laborCount: z.number().int().min(0, 'Workers count must be non-negative').optional(),
  issues: z.string().max(1000, 'Issues workItemDescription too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const orgId = 'org_demo_1';
    const progressId = Number.parseInt(params.id);
    
    if (isNaN(progressId)) {
      return NextResponse.json({ error: 'Invalid progress ID' }, { status: 400 });
    }

    // Get database connection
    const database = await db;

    // Get task progress
    const [progress] = await database
      .select()
      .from(constructionTaskProgressSchema)
      .where(
        and(
          eq(constructionTaskProgressSchema.id, progressId),
          eq(constructionTaskProgressSchema.organizationId, orgId),
        ),
      )
      .limit(1);

    if (!progress) {
      return NextResponse.json({ error: 'Task progress not found' }, { status: 404 });
    }

    return NextResponse.json(progress);
  } catch (error) {
    logger.error('Error fetching task progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task progress' },
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
    const userId = 'test-user-123';
    const progressId = Number.parseInt(params.id);
    
    if (isNaN(progressId)) {
      return NextResponse.json({ error: 'Invalid progress ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateTaskProgressSchema.parse(body);

    // Get database connection
    const database = await db;

    // Check if progress exists and belongs to organization
    const [existingProgress] = await database
      .select()
      .from(constructionTaskProgressSchema)
      .where(
        and(
          eq(constructionTaskProgressSchema.id, progressId),
          eq(constructionTaskProgressSchema.organizationId, orgId),
        ),
      )
      .limit(1);

    if (!existingProgress) {
      return NextResponse.json({ error: 'Task progress not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      updatedById: userId,
      updatedAt: new Date(),
    };

    // Handle date field
    if (validatedData.progressDate) {
      updateData.progressDate = new Date(validatedData.progressDate);
    }

    // Update task progress
    const [updatedProgress] = await database
      .update(constructionTaskProgressSchema)
      .set(updateData)
      .where(
        and(
          eq(constructionTaskProgressSchema.id, progressId),
          eq(constructionTaskProgressSchema.organizationId, orgId),
        ),
      )
      .returning();

    // If progress percentage was updated, update the task's progress
    if (validatedData.progressPercentage !== undefined) {
      await database
        .update(constructionTaskSchema)
        .set({
          progress: validatedData.progressPercentage,
          updatedAt: new Date(),
        })
        .where(eq(constructionTaskSchema.id, existingProgress.taskId));
    }

    logger.info(`Task progress updated: ${progressId} by user ${userId}`);

    return NextResponse.json(updatedProgress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in PUT /api/task-progress/[id]:', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    logger.error('Error updating task progress:', error);
    return NextResponse.json(
      { error: 'Failed to update task progress' },
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
    const userId = 'test-user-123';
    const progressId = Number.parseInt(params.id);
    
    if (isNaN(progressId)) {
      return NextResponse.json({ error: 'Invalid progress ID' }, { status: 400 });
    }

    // Get database connection
    const database = await db;

    // Check if progress exists and belongs to organization
    const [existingProgress] = await database
      .select()
      .from(constructionTaskProgressSchema)
      .where(
        and(
          eq(constructionTaskProgressSchema.id, progressId),
          eq(constructionTaskProgressSchema.organizationId, orgId),
        ),
      )
      .limit(1);

    if (!existingProgress) {
      return NextResponse.json({ error: 'Task progress not found' }, { status: 404 });
    }

    // Soft delete task progress
    await database
      .update(constructionTaskProgressSchema)
      .set({
        deletedAt: new Date(),
        deletedById: userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(constructionTaskProgressSchema.id, progressId),
          eq(constructionTaskProgressSchema.organizationId, orgId),
        ),
      );

    logger.info(`Task progress deleted: ${progressId} by user ${userId}`);

    return NextResponse.json({ message: 'Task progress deleted successfully' });
  } catch (error) {
    logger.error('Error deleting task progress:', error);
    return NextResponse.json(
      { error: 'Failed to delete task progress' },
      { status: 500 },
    );
  }
}








