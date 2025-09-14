import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/libs/DB';
import { projectTaskSchema } from '@/models/Schema';
import { eq, and, desc, ilike, or } from 'drizzle-orm';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in_progress', 'review', 'completed', 'cancelled']).optional(),
  type: z.enum(['construction', 'inspection', 'maintenance', 'safety', 'quality', 'administrative', 'other']),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
});

// const updateTaskSchema = createTaskSchema.partial();

// GET /api/projects/[id]/tasks
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const { searchParams } = new URL(request.url);

    // Query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');
    const assignedTo = searchParams.get('assignedTo');
    const search = searchParams.get('search');
    // const sortBy = searchParams.get('sortBy') || 'createdAt';
    // const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [eq(projectTaskSchema.projectId, projectId)];

    if (status) {
      whereConditions.push(eq(projectTaskSchema.status, status as any));
    }

    if (priority) {
      whereConditions.push(eq(projectTaskSchema.priority, priority.toLowerCase() as any));
    }

    if (type) {
      whereConditions.push(eq(projectTaskSchema.type, type.toLowerCase() as any));
    }

    if (assignedTo) {
      whereConditions.push(eq(projectTaskSchema.assignedTo, assignedTo));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(projectTaskSchema.title, `%${search}%`),
          ilike(projectTaskSchema.description, `%${search}%`)
        )!
      );
    }

    const dbInstance = await db;
    
    // Get tasks with pagination
    const tasks = await dbInstance
      .select()
      .from(projectTaskSchema)
      .where(and(...whereConditions))
      .orderBy(desc(projectTaskSchema.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await dbInstance
      .select({ count: projectTaskSchema.id })
      .from(projectTaskSchema)
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
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/tasks
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const body = await request.json();

    // Validate request body
    const validatedData = createTaskSchema.parse(body);

    // Hardcoded for development - in production, get from auth
    const orgId = 'org_demo_1';
    const userId = 'user_2test123';

    const dbInstance = await db;
    const newTask = await dbInstance
      .insert(projectTaskSchema)
      .values({
        projectId,
        organizationId: orgId,
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        status: validatedData.status || 'todo',
        type: validatedData.type,
        assignedTo: validatedData.assignedTo,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        estimatedHours: validatedData.estimatedHours,
        tags: validatedData.tags,
        dependencies: validatedData.dependencies,
        status: 'todo',
        progress: 0,
      })
      .returning();

    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error('Error creating project task:', error);
    return NextResponse.json(
      { error: 'Failed to create project task', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
