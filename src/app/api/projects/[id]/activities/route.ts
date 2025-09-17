/**
 * Project Activities API endpoint
 * GET /api/projects/[id]/activities - Get recent activities for a project
 */

import { eq, and, desc } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { constructionLogSchema, constructionPhotoSchema } from '@/models/Schema';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const projectId = Number.parseInt(params.id);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    // Get database connection
    const database = await db;

    // Get recent daily logs (last 10)
    const recentLogs = await database
      .select({
        id: constructionLogSchema.id,
        logTitle: constructionLogSchema.logTitle,
        constructionDate: constructionLogSchema.constructionDate,
        createdAt: constructionLogSchema.createdAt,
        createdById: constructionLogSchema.createdById,
      })
      .from(constructionLogSchema)
      .where(eq(constructionLogSchema.projectId, projectId))
      .orderBy(desc(constructionLogSchema.createdAt))
      .limit(5);

    // Get recent photos (last 10)
    const recentPhotos = await database
      .select({
        id: constructionPhotoSchema.id,
        originalName: constructionPhotoSchema.originalName,
        createdAt: constructionPhotoSchema.createdAt,
        uploadedById: constructionPhotoSchema.uploadedById,
      })
      .from(constructionPhotoSchema)
      .where(eq(constructionPhotoSchema.projectId, projectId))
      .orderBy(desc(constructionPhotoSchema.createdAt))
      .limit(5);

    // Combine and sort activities
    const activities = [
      ...recentLogs.map(log => ({
        type: 'daily-log',
        id: log.id,
        title: 'Nhật ký mới được tạo',
        description: log.logTitle,
        timestamp: log.createdAt,
        userId: log.createdById,
      })),
      ...recentPhotos.map(photo => ({
        type: 'photo-upload',
        id: photo.id,
        title: 'Ảnh công trường mới',
        description: `Ảnh: ${photo.originalName}`,
        timestamp: photo.createdAt,
        userId: photo.uploadedById,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    logger.info(`Activities fetched for project ${projectId}: ${activities.length} activities`);

    return NextResponse.json({ activities });
  } catch (error) {
    logger.error('Error fetching project activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project activities' },
      { status: 500 },
    );
  }
}







