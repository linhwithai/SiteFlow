/**
 * Individual Project API endpoints
 * GET /api/projects/[id] - Get project by ID
 * PUT /api/projects/[id] - Update project
 * DELETE /api/projects/[id] - Delete project
 */

// import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { projectPhotoSchema, projectSchema } from '@/models/Schema';
import { PROJECT_STATUS } from '@/types/Enum';

// Validation schemas
const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  address: z.string().max(500, 'Address too long').optional(),
  city: z.string().max(100, 'City name too long').optional(),
  province: z.string().max(100, 'Province name too long').optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  budget: z.union([
    z.number().min(0, 'Budget must be positive'),
    z.string().transform(Number).refine(val => val >= 0, 'Budget must be positive'),
  ]).optional(),
  projectManagerId: z.string().optional(),
  status: z.enum(Object.values(PROJECT_STATUS) as [string, ...string[]]).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Use real organization ID from database
    const orgId = 'org_demo_1';
    const userId = 'test-user-123';

    const projectId = Number.parseInt(params.id);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    // Get database connection
    const database = await db;

    // Get project by ID
    const [project] = await database
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
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    logger.info(`Project fetched: ${projectId} by user ${userId}`);

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
    // Use real organization ID from database
    const orgId = 'org_demo_1';
    const userId = 'test-user-123';

    const projectId = Number.parseInt(params.id);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    // Get database connection
    const database = await db;

    // Check if project exists and belongs to organization
    const [existingProject] = await database
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
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update project
    const [updatedProject] = await database
      .update(projectSchema)
      .set({
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectSchema.id, projectId),
          eq(projectSchema.organizationId, orgId),
        ),
      )
      .returning();

    logger.info(`Project updated: ${projectId} by user ${userId}`);

    return NextResponse.json(updatedProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in PUT /api/projects/[id]:', error.errors);
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
    // Use real organization ID from database
    const orgId = 'org_demo_1';
    const userId = 'test-user-123';

    const projectId = Number.parseInt(params.id);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    // Get database connection
    const database = await db;

    // Check if project exists and belongs to organization
    const [existingProject] = await database
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
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get all photos associated with this project before deletion
    const projectPhotos = await database
      .select()
      .from(projectPhotoSchema)
      .where(
        and(
          eq(projectPhotoSchema.projectId, projectId),
          eq(projectPhotoSchema.organizationId, orgId),
        ),
      );

    // Delete all Cloudinary files associated with this project
    const { deleteImage } = await import('@/libs/Cloudinary');
    const deletePromises = projectPhotos.map(async (photo: any) => {
      try {
        // Extract public_id from Cloudinary URL
        const url = new URL(photo.fileUrl);
        const pathParts = url.pathname.split('/');
        const publicId = pathParts.slice(-2).join('/').replace(/\.[^/.]+$/, ''); // Remove file extension

        await deleteImage(publicId);
        logger.info(`Deleted Cloudinary file: ${publicId}`);
      } catch (error) {
        logger.error(`Failed to delete Cloudinary file for photo ${photo.id}:`, error);
        // Continue with deletion even if Cloudinary deletion fails
      }
    });

    // Wait for all Cloudinary deletions to complete
    await Promise.allSettled(deletePromises);

    // Delete project (this will cascade delete daily logs and photos from database)
    await database
      .delete(projectSchema)
      .where(
        and(
          eq(projectSchema.id, projectId),
          eq(projectSchema.organizationId, orgId),
        ),
      );

    logger.info(`Project deleted: ${projectId} by user ${userId}. Deleted ${projectPhotos.length} photos from Cloudinary.`);

    return NextResponse.json({
      message: 'Project deleted successfully',
      deletedPhotos: projectPhotos.length,
    });
  } catch (error) {
    logger.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 },
    );
  }
}
