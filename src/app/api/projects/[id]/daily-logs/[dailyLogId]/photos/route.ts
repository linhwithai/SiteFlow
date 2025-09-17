/**
 * Daily Log Photos API endpoints
 * GET /api/projects/[id]/daily-logs/[dailyLogId]/photos - Get photos for a daily log
 * POST /api/projects/[id]/daily-logs/[dailyLogId]/photos - Upload photo to daily log
 */

import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { constructionLogSchema, constructionPhotoSchema, constructionProjectSchema } from '@/models/Schema';

// Validation schemas
const uploadPhotoSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  originalName: z.string().min(1, 'Original name is required'),
  fileUrl: z.string().url('Invalid file URL'),
  thumbnailUrl: z.string().optional(),
  fileSize: z.number().int().positive('File size must be positive'),
  mimeType: z.string().min(1, 'MIME type is required'),
  caption: z.string().max(500, 'Caption too long').optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/projects/[id]/daily-logs/[dailyLogId]/photos - Get photos for daily log
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; dailyLogId: string } },
) {
  try {
    const projectId = Number.parseInt(params.id);
    const dailyLogId = Number.parseInt(params.dailyLogId);
    
    if (isNaN(projectId) || isNaN(dailyLogId)) {
      return NextResponse.json({ error: 'Invalid project ID or daily log ID' }, { status: 400 });
    }

    const orgId = 'org_demo_1';

    // Get database connection
    const database = await db;

    // Verify daily log exists and belongs to project
    const [dailyLog] = await database
      .select()
      .from(constructionLogSchema)
      .where(
        and(
          eq(constructionLogSchema.id, dailyLogId),
          eq(constructionLogSchema.projectId, projectId),
          eq(constructionLogSchema.organizationId, orgId),
        ),
      )
      .limit(1);

    if (!dailyLog) {
      return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
    }

    // Get photos for the daily log
    const photos = await database
      .select()
      .from(constructionPhotoSchema)
      .where(
        and(
          eq(constructionPhotoSchema.dailyLogId, dailyLogId),
          eq(constructionPhotoSchema.projectId, projectId),
          eq(constructionPhotoSchema.organizationId, orgId),
        ),
      )
      .orderBy(constructionPhotoSchema.createdAt);

    // Transform photos to match expected format
    const transformedPhotos = photos.map((photo: any) => ({
      id: photo.id.toString(),
      publicId: photo.fileName,
      url: photo.fileUrl,
      name: photo.originalName,
      size: photo.fileSize,
      uploadedAt: photo.createdAt,
      tags: photo.tags ? JSON.parse(photo.tags) : [],
      caption: photo.caption,
    }));

    logger.info(`Photos fetched for daily log ${dailyLogId}: ${photos.length} photos`);

    return NextResponse.json({ photos: transformedPhotos });
  } catch (error) {
    logger.error('Error fetching daily log photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily log photos' },
      { status: 500 },
    );
  }
}

// POST /api/projects/[id]/daily-logs/[dailyLogId]/photos - Upload photo to daily log
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; dailyLogId: string } },
) {
  try {
    const projectId = Number.parseInt(params.id);
    const dailyLogId = Number.parseInt(params.dailyLogId);
    
    if (isNaN(projectId) || isNaN(dailyLogId)) {
      return NextResponse.json({ error: 'Invalid project ID or daily log ID' }, { status: 400 });
    }

    const orgId = 'org_demo_1';
    const userId = 'test-user-123';

    const body = await request.json();
    const validatedData = uploadPhotoSchema.parse(body);

    // Get database connection
    const database = await db;

    // Verify daily log exists and belongs to project
    const [dailyLog] = await database
      .select()
      .from(constructionLogSchema)
      .where(
        and(
          eq(constructionLogSchema.id, dailyLogId),
          eq(constructionLogSchema.projectId, projectId),
          eq(constructionLogSchema.organizationId, orgId),
        ),
      )
      .limit(1);

    if (!dailyLog) {
      return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
    }

    // Create photo record
    const [newPhoto] = await database
      .insert(constructionPhotoSchema)
      .values({
        projectId: projectId,
        dailyLogId: dailyLogId,
        organizationId: orgId,
        fileName: validatedData.fileName,
        originalName: validatedData.originalName,
        fileUrl: validatedData.fileUrl,
        thumbnailUrl: validatedData.thumbnailUrl || undefined,
        fileSize: validatedData.fileSize,
        mimeType: validatedData.mimeType,
        caption: validatedData.caption,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : undefined,
        uploadedById: userId,
      })
      .returning();

    logger.info(`Photo uploaded to daily log ${dailyLogId}: ${newPhoto.id}`);

    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in POST /api/projects/[id]/daily-logs/[dailyLogId]/photos:', error.errors);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    logger.error('Error uploading photo to daily log:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo to daily log' },
      { status: 500 },
    );
  }
}
