import { eq, and, isNull } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { constructionWorkItemSchema } from '@/models/Schema';

// GET /api/projects/[id]/work-items/[workItemId] - Get a specific work item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; workItemId: string } },
) {
  try {
    const projectId = Number.parseInt(params.id);
    const workItemId = Number.parseInt(params.workItemId);

    if (isNaN(projectId) || isNaN(workItemId)) {
      return NextResponse.json({ error: 'Invalid project or work item ID' }, { status: 400 });
    }

    const database = await db;

    const workItem = await database
      .select()
      .from(constructionWorkItemSchema)
      .where(
        and(
          eq(constructionWorkItemSchema.id, workItemId),
          eq(constructionWorkItemSchema.projectId, projectId),
          isNull(constructionWorkItemSchema.deletedAt),
        ),
      )
      .limit(1);

    if (workItem.length === 0) {
      return NextResponse.json({ error: 'Work item not found' }, { status: 404 });
    }

    logger.info(`Work item fetched: ${workItemId} for project ${projectId}`);

    return NextResponse.json({ workItem: workItem[0] });
  } catch (error) {
    logger.error('Error fetching work item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work item' },
      { status: 500 },
    );
  }
}

// PUT /api/projects/[id]/work-items/[workItemId] - Update a work item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; workItemId: string } },
) {
  try {
    const projectId = Number.parseInt(params.id);
    const workItemId = Number.parseInt(params.workItemId);

    if (isNaN(projectId) || isNaN(workItemId)) {
      return NextResponse.json({ error: 'Invalid project or work item ID' }, { status: 400 });
    }

    const body = await request.json();

    const updateWorkItemSchema = z.object({
      workItemTitle: z.string().min(1, 'Work item title is required').max(255, 'Title too long').optional(),
      workItemDescription: z.string().max(1000, 'Description too long').optional(),
      workItemType: z.enum([
        'concrete_work',
        'steel_work',
        'masonry',
        'finishing',
        'mep_installation',
        'inspection',
        'safety_check',
        'excavation',
        'foundation',
        'roofing',
        'plumbing',
        'electrical',
        'painting',
        'landscaping',
        'cleanup',
        'other',
      ]).optional(),
      status: z.enum(['planned', 'in_progress', 'completed', 'cancelled', 'on_hold']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      assignedTo: z.string().optional(),
      workDate: z.string().optional(),
      dueDate: z.string().optional(),
      estimatedWorkHours: z.number().min(0).optional(),
      actualWorkHours: z.number().min(0).optional(),
      constructionLocation: z.string().max(255).optional(),
      weather: z.string().max(100).optional(),
      laborCount: z.number().min(0).optional(),
      materials: z.array(z.string()).optional(),
      equipment: z.array(z.string()).optional(),
      notes: z.string().max(1000).optional(),
    });

    const validatedData = updateWorkItemSchema.parse(body);
    logger.info('✅ Validated work item update data:', validatedData);

    const database = await db;

    // Check if work item exists
    const existingWorkItem = await database
      .select()
      .from(constructionWorkItemSchema)
      .where(
        and(
          eq(constructionWorkItemSchema.id, workItemId),
          eq(constructionWorkItemSchema.projectId, projectId),
          isNull(constructionWorkItemSchema.deletedAt),
        ),
      )
      .limit(1);

    if (existingWorkItem.length === 0) {
      return NextResponse.json({ error: 'Work item not found' }, { status: 404 });
    }

    // Update work item
    const updatedWorkItem = await database
      .update(constructionWorkItemSchema)
      .set({
        ...validatedData,
        workDate: validatedData.workDate ? new Date(validatedData.workDate) : undefined,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        materials: validatedData.materials ? JSON.stringify(validatedData.materials) : undefined,
        equipment: validatedData.equipment ? JSON.stringify(validatedData.equipment) : undefined,
        updatedById: 'demo-user-1', // TODO: Get from auth
        version: existingWorkItem[0].version + 1,
        updatedAt: new Date(),
      })
      .where(eq(constructionWorkItemSchema.id, workItemId))
      .returning();

    logger.info(`Work item updated: ${workItemId} for project ${projectId}`);

    return NextResponse.json({ workItem: updatedWorkItem[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('❌ Validation error in PUT /api/projects/[id]/work-items/[workItemId]:', error.errors);
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }

    logger.error('Error updating work item:', error);
    return NextResponse.json(
      { error: 'Failed to update work item' },
      { status: 500 },
    );
  }
}

// DELETE /api/projects/[id]/work-items/[workItemId] - Delete a work item (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; workItemId: string } },
) {
  try {
    const projectId = Number.parseInt(params.id);
    const workItemId = Number.parseInt(params.workItemId);

    if (isNaN(projectId) || isNaN(workItemId)) {
      return NextResponse.json({ error: 'Invalid project or work item ID' }, { status: 400 });
    }

    const database = await db;

    // Check if work item exists
    const existingWorkItem = await database
      .select()
      .from(constructionWorkItemSchema)
      .where(
        and(
          eq(constructionWorkItemSchema.id, workItemId),
          eq(constructionWorkItemSchema.projectId, projectId),
          isNull(constructionWorkItemSchema.deletedAt),
        ),
      )
      .limit(1);

    if (existingWorkItem.length === 0) {
      return NextResponse.json({ error: 'Work item not found' }, { status: 404 });
    }

    // Soft delete work item
    await database
      .update(constructionWorkItemSchema)
      .set({
        deletedAt: new Date(),
        deletedById: 'demo-user-1', // TODO: Get from auth
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(constructionWorkItemSchema.id, workItemId));

    logger.info(`Work item deleted: ${workItemId} for project ${projectId}`);

    return NextResponse.json({ message: 'Work item deleted successfully' });
  } catch (error) {
    logger.error('Error deleting work item:', error);
    return NextResponse.json(
      { error: 'Failed to delete work item' },
      { status: 500 },
    );
  }
}








