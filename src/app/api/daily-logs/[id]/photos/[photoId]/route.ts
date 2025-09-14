/**
 * Daily Log Photo Management API endpoints
 * DELETE /api/daily-logs/[id]/photos/[photoId] - Delete photo from daily log
 * PUT /api/daily-logs/[id]/photos/[photoId] - Update photo metadata
 */

import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { deleteImage } from '@/libs/Cloudinary';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { projectPhotoSchema } from '@/models/Schema';

// Validation schemas
const updatePhotoSchema = z.object({
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; photoId: string } },
) {
  try {
    const dailyLogId = Number.parseInt(params.id);
    const photoId = Number.parseInt(params.photoId);

    if (isNaN(dailyLogId) || isNaN(photoId)) {
      return NextResponse.json({ error: 'Invalid daily log ID or photo ID' }, { status: 400 });
    }

    // Use real organization ID from database
    const orgId = 'org_demo_1';
    const userId = 'test-user-123';

    // Uncomment these lines when ready for production
    // const { userId, orgId } = await auth();
    // if (!userId || !orgId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get database connection
    const database = await db;

    // First, get the photo to get the Cloudinary public ID
    const [photo] = await database
      .select()
      .from(projectPhotoSchema)
      .where(
        and(
          eq(projectPhotoSchema.id, photoId),
          eq(projectPhotoSchema.dailyLogId, dailyLogId),
          eq(projectPhotoSchema.organizationId, orgId),
        ),
      )
      .limit(1);

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Delete from Cloudinary first
    try {
      await deleteImage(photo.fileName);
      console.log('✅ Photo deleted from Cloudinary:', photo.fileName);
    } catch (cloudinaryError) {
      console.error('⚠️ Failed to delete from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database
    await database
      .delete(projectPhotoSchema)
      .where(
        and(
          eq(projectPhotoSchema.id, photoId),
          eq(projectPhotoSchema.dailyLogId, dailyLogId),
          eq(projectPhotoSchema.organizationId, orgId),
        ),
      );

    logger.info(`Photo deleted from daily log ${dailyLogId}: ${photo.fileName}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting daily log photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; photoId: string } },
) {
  try {
    const dailyLogId = Number.parseInt(params.id);
    const photoId = Number.parseInt(params.photoId);

    if (isNaN(dailyLogId) || isNaN(photoId)) {
      return NextResponse.json({ error: 'Invalid daily log ID or photo ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updatePhotoSchema.parse(body);

    // Use real organization ID from database
    const orgId = 'org_demo_1';
    const userId = 'test-user-123';

    // Uncomment these lines when ready for production
    // const { userId, orgId } = await auth();
    // if (!userId || !orgId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get database connection
    const database = await db;

    // Update photo metadata
    const [updatedPhoto] = await database
      .update(projectPhotoSchema)
      .set({
        caption: validatedData.caption,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : undefined,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectPhotoSchema.id, photoId),
          eq(projectPhotoSchema.dailyLogId, dailyLogId),
          eq(projectPhotoSchema.organizationId, orgId),
        ),
      )
      .returning();

    if (!updatedPhoto) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    logger.info(`Photo updated in daily log ${dailyLogId}: ${updatedPhoto.fileName}`);

    return NextResponse.json({ photo: updatedPhoto });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in PUT /api/daily-logs/[id]/photos/[photoId]:', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    logger.error('Error updating daily log photo:', error);
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 },
    );
  }
}
