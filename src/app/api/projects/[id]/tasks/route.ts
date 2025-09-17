import { and, desc, eq, ilike, or } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
// import { constructionTaskSchema } from '@/models/Schema';

// Validation schemas
const createTaskSchema = z.object({
  taskTitle: z.string().min(1, 'Title is required'),
  taskDescription: z.string().optional(),
  taskPriority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  taskStatus: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  taskType: z.enum(['FOUNDATION', 'STRUCTURE', 'FINISHING', 'MEP', 'INSPECTION', 'SAFETY', 'QUALITY', 'ADMINISTRATIVE']),
  assignedTo: z.string().optional(),
  startDate: z.string().optional(),
  expectedEndDate: z.string().optional(),
  estimatedWorkHours: z.number().min(0).optional(),
  actualWorkHours: z.number().min(0).optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
});

// const updateTaskSchema = createTaskSchema.partial();

// GET /api/projects/[id]/tasks
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const projectId = Number.parseInt(params.id);
    const { searchParams } = new URL(request.url);

    // Query parameters
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');
    const assignedTo = searchParams.get('assignedTo');
    const search = searchParams.get('search');
    // const sortBy = searchParams.get('sortBy') || 'createdAt';
    // const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [eq(constructionTaskSchema.projectId, projectId)];

    if (status) {
      whereConditions.push(eq(constructionTaskSchema.taskStatus, status as any));
    }

    if (priority) {
      whereConditions.push(eq(constructionTaskSchema.taskPriority, priority as any));
    }

    if (type) {
      whereConditions.push(eq(constructionTaskSchema.taskType, type as any));
    }

    if (assignedTo) {
      whereConditions.push(eq(constructionTaskSchema.assignedTo, assignedTo));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(constructionTaskSchema.taskTitle, `%${search}%`),
          ilike(constructionTaskSchema.taskDescription, `%${search}%`),
        )!,
      );
    }

    const dbInstance = await db;

    // Get tasks with pagination
    const tasks = await dbInstance
      .select()
      .from(constructionTaskSchema)
      .where(and(...whereConditions))
      .orderBy(desc(constructionTaskSchema.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await dbInstance
      .select({ count: constructionTaskSchema.id })
      .from(constructionTaskSchema)
      .where(and(...whereConditions));

    const total = totalResult.length;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project tasks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

// POST /api/projects/[id]/tasks
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const projectId = Number.parseInt(params.id);
    const body = await request.json();

    // Validate request body
    const validatedData = createTaskSchema.parse(body);

    // Hardcoded for development - in production, get from auth
    const orgId = 'org_demo_1';
    const userId = 'user_2test123';

    const dbInstance = await db;
    const newTask = await dbInstance
      .insert(constructionTaskSchema)
      .values({
        projectId,
        organizationId: orgId,
        taskTitle: validatedData.taskTitle,
        taskDescription: validatedData.taskDescription,
        taskPriority: validatedData.taskPriority,
        taskStatus: validatedData.taskStatus || 'PENDING',
        taskType: validatedData.taskType,
        assignedTo: validatedData.assignedTo,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        expectedEndDate: validatedData.expectedEndDate ? new Date(validatedData.expectedEndDate) : null,
        estimatedWorkHours: validatedData.estimatedWorkHours,
        actualWorkHours: validatedData.actualWorkHours || 0,
        progressPercentage: validatedData.progressPercentage || 0,
        createdById: userId,
        updatedById: userId,
        version: 1,
      })
      .returning();

    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error('Error creating project task:', error);
    return NextResponse.json(
      { error: 'Failed to create project task', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
