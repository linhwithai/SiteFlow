import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { projectTaskSchema } from '@/models/Schema';
import { eq, and } from 'drizzle-orm';

// GET /api/projects/[id]/tasks/stats - Get task statistics for a project
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);

    // Hardcoded for development - in production, get from auth
    const orgId = 'org_demo_1';

    const dbInstance = await db;
    
    // Get all tasks for the project
    const tasks = await dbInstance
      .select()
      .from(projectTaskSchema)
      .where(
        and(
          eq(projectTaskSchema.projectId, projectId),
          eq(projectTaskSchema.organizationId, orgId),
          eq(projectTaskSchema.isActive, true)
        )
      );

    // Calculate statistics
    const total = tasks.length;
    const todo = tasks.filter((task: any) => task.status === 'todo').length;
    const inProgress = tasks.filter((task: any) => task.status === 'in_progress').length;
    const review = tasks.filter((task: any) => task.status === 'review').length;
    const completed = tasks.filter((task: any) => task.status === 'completed').length;
    const cancelled = tasks.filter((task: any) => task.status === 'cancelled').length;

    // Calculate overdue tasks (due date is in the past and not completed)
    const now = new Date();
    const overdue = tasks.filter((task: any) => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      !['completed', 'cancelled'].includes(task.status)
    ).length;

    // Calculate time tracking
    const totalEstimatedHours = tasks.reduce((sum: any, task: any) => sum + (task.estimatedHours || 0), 0);
    const totalActualHours = tasks.reduce((sum: any, task: any) => sum + (task.actualHours || 0), 0);

    // Calculate average progress
    const averageProgress = total > 0 ? Math.round(tasks.reduce((sum: any, task: any) => sum + task.progress, 0) / total) : 0;

    // Priority breakdown
    const priorityStats = {
      low: tasks.filter((task: any) => task.priority === 'low').length,
      medium: tasks.filter((task: any) => task.priority === 'medium').length,
      high: tasks.filter((task: any) => task.priority === 'high').length,
      urgent: tasks.filter((task: any) => task.priority === 'urgent').length,
    };

    // Type breakdown
    const typeStats = {
      construction: tasks.filter((task: any) => task.type === 'construction').length,
      inspection: tasks.filter((task: any) => task.type === 'inspection').length,
      maintenance: tasks.filter((task: any) => task.type === 'maintenance').length,
      safety: tasks.filter((task: any) => task.type === 'safety').length,
      quality: tasks.filter((task: any) => task.type === 'quality').length,
      administrative: tasks.filter((task: any) => task.type === 'administrative').length,
      other: tasks.filter((task: any) => task.type === 'other').length,
    };

    return NextResponse.json({
      total,
      todo,
      inProgress,
      review,
      completed,
      cancelled,
      overdue,
      totalEstimatedHours,
      totalActualHours,
      averageProgress,
      priorityStats,
      typeStats,
    });
  } catch (error) {
    console.error('Error fetching task statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task statistics' },
      { status: 500 }
    );
  }
}