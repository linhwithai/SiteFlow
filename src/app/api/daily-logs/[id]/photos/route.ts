/**
 * Daily Log Photos API endpoints
 * GET /api/daily-logs/[id]/photos - Get photos for a daily log
 * POST /api/daily-logs/[id]/photos - Add photo to daily log
 */

import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { projectPhotoSchema } from '@/models/Schema';

// Validation schemas
const addPhotoSchema = z.object({
  publicId: z.string().min(1, 'Public ID is required'),
  url: z.string().url('Invalid URL'),
  name: z.string().min(1, 'Name is required'),
  size: z.number().min(0, 'Size must be positive'),
  width: z.number().min(1, 'Width must be positive'),
  height: z.number().min(1, 'Height must be positive'),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const dailyLogId = Number.parseInt(params.id);
    if (isNaN(dailyLogId)) {
      return NextResponse.json({ error: 'Invalid daily log ID' }, { status: 400 });
    }

    // Use real organization ID from database
    const orgId = 'org_demo_1';
    // const userId = 'test-user-123';

    // Uncomment these lines when ready for production
    // const { userId, orgId } = await auth();
    // if (!userId || !orgId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get database connection
    const database = await db;

    // Get photos for the daily log
    const photos = await database
      .select()
      .from(projectPhotoSchema)
      .where(eq(projectPhotoSchema.dailyLogId, dailyLogId))
      .orderBy(projectPhotoSchema.createdAt);

    // Transform photos to match expected format
    const transformedPhotos = photos.map((photo: any) => ({
      id: photo.id.toString(),
      publicId: photo.fileName,
      url: photo.fileUrl,
      name: photo.originalName,
      size: photo.fileSize,
      width: 800, // Default width since not stored
      height: 600, // Default height since not stored
      caption: photo.caption,
      tags: photo.tags ? JSON.parse(photo.tags) : [],
      uploadedAt: photo.createdAt,
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    console.log('📸 Photo upload API called for daily log:', params.id);

    const dailyLogId = Number.parseInt(params.id);
    if (isNaN(dailyLogId)) {
      console.log('❌ Invalid daily log ID:', params.id);
      return NextResponse.json({ error: 'Invalid daily log ID' }, { status: 400 });
    }

    const body = await request.json();
    console.log('📋 Request body:', body);

    const validatedData = addPhotoSchema.parse(body);
    console.log('✅ Validated data:', validatedData);

    // Use real organization ID from database
    const orgId = 'org_demo_1';
    const userId = 'test-user-123';

    // Uncomment these lines when ready for production
    // const { userId, orgId } = await auth();
    // if (!userId || !orgId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get database connection
    console.log('🔌 Getting database connection...');
    const database = await db;
    console.log('✅ Database connected');

    // First, get the daily log to get the project ID
    const dailyLog = await database
      .select()
      .from(projectPhotoSchema)
      .where(eq(projectPhotoSchema.dailyLogId, dailyLogId))
      .limit(1);

    // For now, we'll use a default project ID since we need to get it from daily log
    // In a real implementation, you'd join with daily_log table
    const projectId = 1; // This should be fetched from daily_log table

    // Add photo to daily log
    console.log('💾 Inserting photo to database...');
    const [newPhoto] = await database
      .insert(projectPhotoSchema)
      .values({
        projectId,
        dailyLogId,
        organizationId: orgId,
        fileName: validatedData.publicId,
        originalName: validatedData.name,
        fileUrl: validatedData.url,
        fileSize: validatedData.size,
        mimeType: 'image/jpeg', // Default mime type
        caption: validatedData.caption,
        tags: JSON.stringify(validatedData.tags || []),
        uploadedById: userId,
      })
      .returning();

    console.log('✅ Photo inserted successfully:', newPhoto);
    logger.info(`Photo added to daily log ${dailyLogId}: ${newPhoto.fileName}`);

    return NextResponse.json({ photo: newPhoto });
  } catch (error) {
    console.error('💥 Photo upload error:', error);

    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors);
      logger.error('Validation error in POST /api/daily-logs/[id]/photos:', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    console.error('❌ Database error:', error);
    logger.error('Error adding photo to daily log:', error);
    return NextResponse.json(
      { error: 'Failed to add photo to daily log', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}


