/**
 * Project Photos API endpoints
 * GET /api/projects/[id]/photos - Get photos for a project
 * POST /api/projects/[id]/photos - Add photo to project
 */

import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { constructionPhotoSchema } from '@/models/Schema';

// Validation schemas
const addPhotoSchema = z.object({
  publicId: z.string().min(1, 'Public ID is required'),
  url: z.string().url('Invalid URL'),
  name: z.string().min(1, 'Name is required'),
  size: z.number().min(0, 'Size must be positive'),
  width: z.number().min(0, 'Width must be non-negative'),
  height: z.number().min(0, 'Height must be non-negative'),
  tags: z.array(z.string()).optional(),
});

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

    // Get photos for the project using Drizzle ORM
    const photos = await database
      .select()
      .from(constructionPhotoSchema)
      .where(eq(constructionPhotoSchema.projectId, projectId))
      .orderBy(constructionPhotoSchema.createdAt);

    // Transform photos to match expected format
    const transformedPhotos = photos.map((photo: any) => ({
      id: photo.id.toString(),
      publicId: photo.fileName,
      url: photo.fileUrl,
      name: photo.originalName,
      size: photo.fileSize,
      width: 800, // Default width since not stored
      height: 600, // Default height since not stored
      uploadedAt: photo.createdAt,
      tags: photo.tags ? JSON.parse(photo.tags) : [],
    }));

    logger.info(`Photos fetched for project ${projectId}: ${photos.length} photos`);

    return NextResponse.json({ photos: transformedPhotos });
  } catch (error) {
    logger.error('Error fetching project photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project photos' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    console.log('📸 Photo upload API called for project:', params.id);

    const projectId = Number.parseInt(params.id);
    if (isNaN(projectId)) {
      console.log('❌ Invalid project ID:', params.id);
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const body = await request.json();
    console.log('📋 Request body:', body);

    const validatedData = addPhotoSchema.parse(body);
    console.log('✅ Validated data:', validatedData);

    // Get database connection
    console.log('🔌 Getting database connection...');
    const database = await db;
    console.log('✅ Database connected');

    // Add photo to project using Drizzle ORM
    console.log('💾 Inserting photo to database...');
    const [newPhoto] = await database
      .insert(constructionPhotoSchema)
      .values({
        projectId: projectId,
        organizationId: 'org_demo_1', // Use demo org for now
        fileName: validatedData.publicId,
        originalName: validatedData.name,
        fileUrl: validatedData.url,
        fileSize: validatedData.size,
        mimeType: 'image/jpeg', // Default mime type
        tags: JSON.stringify(validatedData.tags || []),
        uploadedById: 'demo-user-1', // Use demo user for now
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      })
      .returning();

    console.log('✅ Photo inserted successfully:', newPhoto);
    logger.info(`Photo added to project ${projectId}: ${newPhoto.fileName}`);

    return NextResponse.json({ photo: newPhoto });
  } catch (error) {
    console.error('💥 Photo upload error:', error);

    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors);
      logger.error('Validation error in POST /api/projects/[id]/photos:', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    console.error('❌ Database error:', error);
    logger.error('Error adding photo to project:', error);
    return NextResponse.json(
      { error: 'Failed to add photo to project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
