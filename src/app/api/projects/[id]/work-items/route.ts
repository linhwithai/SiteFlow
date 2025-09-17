import { eq, desc, and, or, like, gte, lte, isNull } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { constructionWorkItemSchema, constructionProjectSchema, constructionLogSchema } from '@/models/Schema';
import type { WorkItemFilters } from '@/types/WorkItem';

// GET /api/projects/[id]/work-items - Get work items for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const projectId = Number.parseInt(params.id);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const workItemType = searchParams.get('workItemType');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const workDateFrom = searchParams.get('workDateFrom');
    const workDateTo = searchParams.get('workDateTo');
    const dueDateFrom = searchParams.get('dueDateFrom');
    const dueDateTo = searchParams.get('dueDateTo');

    const database = await db;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [
      eq(constructionWorkItemSchema.projectId, projectId),
      isNull(constructionWorkItemSchema.deletedAt),
    ];

    if (search) {
      whereConditions.push(
        or(
          like(constructionWorkItemSchema.workItemTitle, `%${search}%`),
          like(constructionWorkItemSchema.workItemDescription, `%${search}%`),
        )!,
      );
    }

    if (workItemType) {
      whereConditions.push(eq(constructionWorkItemSchema.workItemType, workItemType));
    }

    if (status) {
      whereConditions.push(eq(constructionWorkItemSchema.status, status));
    }

    if (priority) {
      whereConditions.push(eq(constructionWorkItemSchema.priority, priority));
    }

    if (assignedTo) {
      whereConditions.push(eq(constructionWorkItemSchema.assignedTo, assignedTo));
    }

    if (workDateFrom) {
      whereConditions.push(gte(constructionWorkItemSchema.workDate, new Date(workDateFrom)));
    }

    if (workDateTo) {
      whereConditions.push(lte(constructionWorkItemSchema.workDate, new Date(workDateTo)));
    }

    if (dueDateFrom) {
      whereConditions.push(gte(constructionWorkItemSchema.dueDate, new Date(dueDateFrom)));
    }

    if (dueDateTo) {
      whereConditions.push(lte(constructionWorkItemSchema.dueDate, new Date(dueDateTo)));
    }

    // Get work items
    const workItems = await database
      .select()
      .from(constructionWorkItemSchema)
      .where(and(...whereConditions))
      .orderBy(desc(constructionWorkItemSchema.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await database
      .select({ count: constructionWorkItemSchema.id })
      .from(constructionWorkItemSchema)
      .where(and(...whereConditions));

    const total = totalResult.length;

    logger.info(`Work items fetched for project ${projectId}: ${workItems.length} of ${total}`);

    return NextResponse.json({
      workItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching work items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work items' },
      { status: 500 },
    );
  }
}

// POST /api/projects/[id]/work-items - Create a new work item
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const projectId = Number.parseInt(params.id);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const body = await request.json();

    const createWorkItemSchema = z.object({
      taskId: z.number().optional(),
      dailyLogId: z.number().optional(),
      workItemTitle: z.string().min(1, 'Work item title is required').max(255, 'Title too long'),
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
      ]),
      status: z.enum(['planned', 'in_progress', 'completed', 'cancelled', 'on_hold']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      assignedTo: z.string().optional(),
      workDate: z.string().optional(),
      dueDate: z.string().optional(),
      estimatedWorkHours: z.number().min(0).optional(),
      constructionLocation: z.string().max(255).optional(),
      weather: z.string().max(100).optional(),
      laborCount: z.number().min(0).optional(),
      materials: z.array(z.string()).optional(),
      equipment: z.array(z.string()).optional(),
      notes: z.string().max(1000).optional(),
    });

    const validatedData = createWorkItemSchema.parse(body);
    logger.info('✅ Validated work item data:', validatedData);

    const database = await db;

    // Verify project exists and is active
    const project = await database
      .select({ id: constructionProjectSchema.id, organizationId: constructionProjectSchema.organizationId })
      .from(constructionProjectSchema)
      .where(
        and(
          eq(constructionProjectSchema.id, projectId),
          eq(constructionProjectSchema.isActive, true)
        )
      )
      .limit(1);

    if (!project.length) {
      return NextResponse.json({ error: 'Project not found or inactive' }, { status: 404 });
    }

    // If dailyLogId is provided, verify it belongs to the same project
    if (validatedData.dailyLogId) {
      const dailyLog = await database
        .select({ projectId: constructionLogSchema.projectId })
        .from(constructionLogSchema)
        .where(eq(constructionLogSchema.id, validatedData.dailyLogId))
        .limit(1);
        
      if (!dailyLog.length || dailyLog[0].projectId !== projectId) {
        return NextResponse.json(
          { error: 'Daily log does not belong to this project' }, 
          { status: 400 }
        );
      }
    }

    // Create work item
    const newWorkItem = await database
      .insert(constructionWorkItemSchema)
      .values({
        projectId,
        taskId: validatedData.taskId,
        dailyLogId: validatedData.dailyLogId,
        organizationId: project[0].organizationId,
        workItemTitle: validatedData.workItemTitle,
        workItemDescription: validatedData.workItemDescription,
        workItemType: validatedData.workItemType,
        status: validatedData.status || 'planned',
        priority: validatedData.priority || 'medium',
        assignedTo: validatedData.assignedTo,
        workDate: validatedData.workDate ? new Date(validatedData.workDate) : undefined,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        estimatedWorkHours: validatedData.estimatedWorkHours,
        constructionLocation: validatedData.constructionLocation,
        weather: validatedData.weather,
        laborCount: validatedData.laborCount || 0,
        materials: validatedData.materials ? JSON.stringify(validatedData.materials) : undefined,
        equipment: validatedData.equipment ? JSON.stringify(validatedData.equipment) : undefined,
        notes: validatedData.notes,
        createdById: 'demo-user-1', // TODO: Get from auth
        version: 1,
        isActive: true,
      })
      .returning();

    logger.info(`Work item created: ${newWorkItem[0].id} for project ${projectId}`);

    return NextResponse.json({ workItem: newWorkItem[0] }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('❌ Validation error in POST /api/projects/[id]/work-items:', error.errors);
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }

    logger.error('Error creating work item:', error);
    return NextResponse.json(
      { error: 'Failed to create work item' },
      { status: 500 },
    );
  }
}