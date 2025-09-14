import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/libs/DB';
import { projectTaskSchema } from '@/models/Schema';
import { eq, and } from 'drizzle-orm';

// Validation schemas
const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  type: z.enum(['construction', 'inspection', 'maintenance', 'safety', 'quality', 'administrative', 'other']).optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
  progress: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/projects/[id]/tasks/[taskId] - Get a specific task
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const taskId = parseInt(params.taskId);

    // Hardcoded for development - in production, get from auth
    const orgId = 'org_demo_1';

    const dbInstance = await db;
    const task = await dbInstance
      .select()
      .from(projectTaskSchema)
      .where(
        and(
          eq(projectTaskSchema.id, taskId),
          eq(projectTaskSchema.projectId, projectId),
          eq(projectTaskSchema.organizationId, orgId)
        )
      )
      .limit(1);

    if (task.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      task: {
        ...task[0],
        tags: task[0].tags ? JSON.parse(task[0].tags) : [],
        dependencies: task[0].dependencies ? JSON.parse(task[0].dependencies) : [],
      },
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]/tasks/[taskId] - Update a task
export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const body = await _request.json();
    const validatedData = updateTaskSchema.parse(body);

    const projectId = parseInt(params.id);
    const taskId = parseInt(params.taskId);

    // Hardcoded for development - in production, get from auth
    const orgId = 'org_demo_1';

    // Check if task exists
    const dbInstance = await db;
    const existingTask = await dbInstance
      .select()
      .from(projectTaskSchema)
      .where(
        and(
          eq(projectTaskSchema.id, taskId),
          eq(projectTaskSchema.projectId, projectId),
          eq(projectTaskSchema.organizationId, orgId)
        )
      )
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.assignedTo !== undefined) updateData.assignedTo = validatedData.assignedTo;
    if (validatedData.dueDate !== undefined) updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null;
    if (validatedData.estimatedHours !== undefined) updateData.estimatedHours = validatedData.estimatedHours;
    if (validatedData.actualHours !== undefined) updateData.actualHours = validatedData.actualHours;
    if (validatedData.progress !== undefined) updateData.progress = validatedData.progress;
    if (validatedData.tags !== undefined) updateData.tags = JSON.stringify(validatedData.tags);
    if (validatedData.dependencies !== undefined) updateData.dependencies = JSON.stringify(validatedData.dependencies);
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    // Set completedAt if status is completed
    if (validatedData.status === 'completed' && existingTask[0].status !== 'completed') {
      updateData.completedAt = new Date();
    }

    const updatedTask = await dbInstance
      .update(projectTaskSchema)
      .set(updateData)
      .where(
        and(
          eq(projectTaskSchema.id, taskId),
          eq(projectTaskSchema.projectId, projectId),
          eq(projectTaskSchema.organizationId, orgId)
        )
      )
      .returning();

    return NextResponse.json({
      task: {
        ...updatedTask[0],
        tags: updatedTask[0].tags ? JSON.parse(updatedTask[0].tags) : [],
        dependencies: updatedTask[0].dependencies ? JSON.parse(updatedTask[0].dependencies) : [],
      },
    });
  } catch (error) {
    console.error('Error updating task:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/tasks/[taskId] - Delete a task (soft delete)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const taskId = parseInt(params.taskId);

    // Hardcoded for development - in production, get from auth
    const orgId = 'org_demo_1';

    // Check if task exists
    const dbInstance = await db;
    const existingTask = await dbInstance
      .select()
      .from(projectTaskSchema)
      .where(
        and(
          eq(projectTaskSchema.id, taskId),
          eq(projectTaskSchema.projectId, projectId),
          eq(projectTaskSchema.organizationId, orgId)
        )
      )
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await dbInstance
      .update(projectTaskSchema)
      .set({ isActive: false })
      .where(
        and(
          eq(projectTaskSchema.id, taskId),
          eq(projectTaskSchema.projectId, projectId),
          eq(projectTaskSchema.organizationId, orgId)
        )
      );

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}