/**
 * Individual Project Photo API endpoints
 * DELETE /api/projects/[id]/photos/[photoId] - Delete photo from project
 */

import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { deleteImage } from '@/libs/Cloudinary';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { projectPhotoSchema } from '@/models/Schema';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; photoId: string } },
) {
  try {
    const projectId = Number.parseInt(params.id);
    const photoId = Number.parseInt(params.photoId);

    if (isNaN(projectId) || isNaN(photoId)) {
      return NextResponse.json({ error: 'Invalid project ID or photo ID' }, { status: 400 });
    }

    // Get database connection
    const database = await db;

    // Check if photo exists and belongs to project
    const [existingPhoto] = await database
      .select()
      .from(projectPhotoSchema)
      .where(
        and(
          eq(projectPhotoSchema.id, photoId),
          eq(projectPhotoSchema.projectId, projectId),
        ),
      )
      .limit(1);

    if (!existingPhoto) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Delete photo from Cloudinary first
    try {
      console.log('🗑️ Deleting photo from Cloudinary:', existingPhoto.fileName);
      await deleteImage(existingPhoto.fileName);
      console.log('✅ Photo deleted from Cloudinary successfully');
    } catch (cloudinaryError) {
      console.error('❌ Error deleting from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
      logger.warn(`Failed to delete photo from Cloudinary: ${existingPhoto.fileName}`, cloudinaryError);
    }

    // Delete photo from database
    await database
      .delete(projectPhotoSchema)
      .where(
        and(
          eq(projectPhotoSchema.id, photoId),
          eq(projectPhotoSchema.projectId, projectId),
        ),
      );

    logger.info(`Photo deleted from project ${projectId}: ${existingPhoto.fileName}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting project photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete project photo' },
      { status: 500 },
    );
  }
}
