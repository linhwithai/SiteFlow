import { eq, and, isNull } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { constructionWorkItemSchema } from '@/models/Schema';
import { WORK_ITEM_TEMPLATES } from '@/data/workItemTemplates';

// POST /api/projects/[id]/work-items/import - Import work items from template
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

    const importSchema = z.object({
      templateId: z.string().min(1, 'Template ID is required'),
    });

    const { templateId } = importSchema.parse(body);

    // Find template
    const template = WORK_ITEM_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const database = await db;

    // Check if project exists
    const projectExists = await database
      .select({ id: constructionWorkItemSchema.projectId })
      .from(constructionWorkItemSchema)
      .where(eq(constructionWorkItemSchema.projectId, projectId))
      .limit(1);

    if (projectExists.length === 0) {
      // This is a simple check - in real app, you'd check the actual project table
      logger.info(`Importing work items for project ${projectId} from template ${templateId}`);
    }

    // Create work items from template
    const workItemsToCreate = template.workItems.map(workItem => ({
      projectId,
      organizationId: 'org_demo_1', // TODO: Get from auth
      workItemTitle: workItem.workItemTitle,
      workItemDescription: workItem.workItemDescription,
      workItemType: workItem.workItemType,
      status: workItem.status || 'planned',
      priority: workItem.priority || 'medium',
      assignedTo: workItem.assignedTo,
      workDate: workItem.workDate ? new Date(workItem.workDate) : undefined,
      dueDate: workItem.dueDate ? new Date(workItem.dueDate) : undefined,
      estimatedWorkHours: workItem.estimatedWorkHours,
      constructionLocation: workItem.constructionLocation,
      weather: workItem.weather,
      laborCount: workItem.laborCount || 0,
      materials: workItem.materials ? JSON.stringify(workItem.materials) : undefined,
      equipment: workItem.equipment ? JSON.stringify(workItem.equipment) : undefined,
      notes: workItem.notes,
      createdById: 'demo-user-1', // TODO: Get from auth
      version: 1,
      isActive: true,
    }));

    // Insert all work items
    const createdWorkItems = await database
      .insert(constructionWorkItemSchema)
      .values(workItemsToCreate)
      .returning();

    logger.info(`Imported ${createdWorkItems.length} work items for project ${projectId} from template ${templateId}`);

    return NextResponse.json({
      message: `Successfully imported ${createdWorkItems.length} work items`,
      workItems: createdWorkItems,
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('❌ Validation error in POST /api/projects/[id]/work-items/import:', error.errors);
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }

    logger.error('Error importing work items:', error);
    return NextResponse.json(
      { error: 'Failed to import work items' },
      { status: 500 },
    );
  }
}

// GET /api/projects/[id]/work-items/import - Get available templates
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const projectId = Number.parseInt(params.id);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    // Return available templates
    const templates = WORK_ITEM_TEMPLATES.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      workItemCount: template.workItems.length,
    }));

    logger.info(`Templates fetched for project ${projectId}: ${templates.length} templates`);

    return NextResponse.json({ templates });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 },
    );
  }
}








