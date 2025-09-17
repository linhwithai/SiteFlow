/**
 * Individual Project Daily Log API endpoints
 * GET /api/projects/[id]/daily-logs/[dailyLogId] - Get daily log by ID
 * PUT /api/projects/[id]/daily-logs/[dailyLogId] - Update daily log
 * DELETE /api/projects/[id]/daily-logs/[dailyLogId] - Delete daily log
 */

import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { extractAuthContext, validateOrganizationAccess, checkRateLimit, logSecurityEvent } from '@/libs/SimpleAuth';
import { constructionLogSchema, constructionPhotoSchema } from '@/models/Schema';

// Validation schemas
const photoSchema = z.object({
  url: z.string().url('Invalid photo URL'),
  name: z.string().min(1, 'Photo name is required'),
  size: z.number().int().min(0, 'Photo size must be non-negative'),
  width: z.number().int().min(1, 'Photo width must be positive').optional(),
  height: z.number().int().min(1, 'Photo height must be positive').optional(),
  caption: z.string().max(500, 'Caption too long').optional(),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
});

const updateDailyLogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  logDate: z.string().datetime('Invalid date format').optional(),
  weather: z.string().max(100, 'Weather description too long').optional(),
  temperature: z.number().int().min(-50).max(60, 'Temperature must be between -50 and 60°C').optional(),
  workDescription: z.string().min(1, 'Work description is required').max(2000, 'Work description too long').optional(),
  workHours: z.number().int().min(0).max(24, 'Work hours must be between 0 and 24').optional(),
  workersCount: z.number().int().min(0, 'Workers count must be non-negative').optional(),
  issues: z.string().max(1000, 'Issues description too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  photos: z.array(photoSchema).optional(),
});

// GET /api/projects/[id]/daily-logs/[dailyLogId] - Get daily log by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; dailyLogId: string } },
) {
  try {
    const projectId = parseInt(params.id);
    const dailyLogId = parseInt(params.dailyLogId);
    
    if (isNaN(projectId) || isNaN(dailyLogId)) {
      return NextResponse.json({
        success: false,
        error: { message: 'Invalid project ID or daily log ID' },
      }, { status: 400 });
    }

    // Extract authentication context
    const auth = extractAuthContext(request);
    
    // Simple rate limiting
    const rateLimitKey = `daily-log-detail:${auth.userId}:${projectId}:${dailyLogId}`;
    if (!checkRateLimit(rateLimitKey, 60, 60000)) { // 60 requests per minute
      return NextResponse.json({
        success: false,
        error: { message: 'Rate limit exceeded' },
      }, { status: 429 });
    }
    
    // Get database connection
    const database = await db;

    // Get daily log by ID, project AND organization (security check)
    const [dailyLog] = await database
      .select()
      .from(constructionLogSchema)
      .where(
        and(
          eq(constructionLogSchema.id, dailyLogId),
          eq(constructionLogSchema.projectId, projectId),
          eq(constructionLogSchema.organizationId, auth.organizationId), // Security: Organization isolation
        ),
      )
      .limit(1);

    if (!dailyLog) {
      return NextResponse.json({
        success: false,
        error: { message: 'Daily log not found' },
      }, { status: 404 });
    }

    // Get photos for the daily log (with organization check)
    const photos = await database
      .select()
      .from(constructionPhotoSchema)
      .where(
        and(
          eq(constructionPhotoSchema.dailyLogId, dailyLogId),
          eq(constructionPhotoSchema.projectId, projectId),
          eq(constructionPhotoSchema.organizationId, auth.organizationId), // Security: Organization isolation
        ),
      )
      .orderBy(constructionPhotoSchema.createdAt);

    // Map database fields to API response format
    const result = {
      id: dailyLog.id,
      projectId: dailyLog.projectId,
      organizationId: dailyLog.organizationId,
      title: dailyLog.logTitle,
      logDate: dailyLog.constructionDate,
      weather: dailyLog.weather,
      temperature: dailyLog.temperature,
      workDescription: dailyLog.constructionWorkDescription,
      workHours: dailyLog.dailyWorkHours,
      workersCount: dailyLog.laborCount,
      issues: dailyLog.issues,
      notes: dailyLog.notes,
      createdById: dailyLog.createdById,
      updatedAt: dailyLog.updatedAt,
      createdAt: dailyLog.createdAt,
      photos: photos.map((photo: any) => ({
        id: photo.id.toString(),
        publicId: photo.fileName,
        url: photo.fileUrl,
        name: photo.originalName,
        size: photo.fileSize,
        uploadedAt: photo.createdAt,
        tags: photo.tags ? (typeof photo.tags === 'string' ? photo.tags.split(',').map(tag => tag.trim()) : photo.tags) : [],
        caption: photo.caption,
      })),
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error fetching daily log:', error);
    return NextResponse.json({
      success: false,
      error: { message: 'Failed to fetch daily log' },
    }, { status: 500 });
  }
}

// PUT /api/projects/[id]/daily-logs/[dailyLogId] - Update daily log
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; dailyLogId: string } },
) {
  try {
    const projectId = parseInt(params.id);
    const dailyLogId = parseInt(params.dailyLogId);
    
    if (isNaN(projectId) || isNaN(dailyLogId)) {
      return NextResponse.json({
        success: false,
        error: { message: 'Invalid project ID or daily log ID' },
      }, { status: 400 });
    }

    // Extract organization ID from request headers or auth
    const orgId = request.headers.get('x-organization-id') || 'org_demo_1';
    const userId = request.headers.get('x-user-id') || 'test-user-123';

    // Parse and validate request body
    const body = await request.json();
    logger.info('PUT request body:', JSON.stringify(body, null, 2));
    
    const bodyValidation = updateDailyLogSchema.safeParse(body);
    if (!bodyValidation.success) {
      logger.error('Validation error:', bodyValidation.error.errors);
      return NextResponse.json({
        success: false,
        error: { message: 'Invalid request data', details: bodyValidation.error.errors },
      }, { status: 400 });
    }
    const validatedData = bodyValidation.data;

    // Get database connection
    const database = await db;

    // Check if daily log exists and belongs to project AND organization
    const [existingDailyLog] = await database
      .select()
      .from(constructionLogSchema)
      .where(
        and(
          eq(constructionLogSchema.id, dailyLogId),
          eq(constructionLogSchema.projectId, projectId),
          eq(constructionLogSchema.organizationId, orgId), // Security: Organization isolation
        ),
      )
      .limit(1);

    if (!existingDailyLog) {
      return NextResponse.json({
        success: false,
        error: { message: 'Daily log not found' },
      }, { status: 404 });
    }

    // Update daily log
    const [updatedDailyLog] = await database
      .update(constructionLogSchema)
      .set({
        logTitle: validatedData.title,
        constructionDate: validatedData.logDate ? new Date(validatedData.logDate) : undefined,
        weather: validatedData.weather,
        temperature: validatedData.temperature,
        constructionWorkDescription: validatedData.workDescription,
        dailyWorkHours: validatedData.workHours,
        laborCount: validatedData.workersCount,
        issues: validatedData.issues,
        notes: validatedData.notes,
        updatedAt: new Date(),
        updatedById: userId, // Security: Track who updated
      })
      .where(eq(constructionLogSchema.id, dailyLogId))
      .returning();

    // Handle photos if provided
    if (validatedData.photos && Array.isArray(validatedData.photos)) {
      // Delete existing photos
      await database
        .delete(constructionPhotoSchema)
        .where(
          and(
            eq(constructionPhotoSchema.dailyLogId, dailyLogId),
            eq(constructionPhotoSchema.projectId, projectId),
            eq(constructionPhotoSchema.organizationId, orgId),
          ),
        );

      // Insert new photos
      if (validatedData.photos.length > 0) {
        const photosToInsert = validatedData.photos.map((photo) => ({
          dailyLogId: dailyLogId,
          projectId: projectId,
          organizationId: orgId,
          fileName: photo.url.split('/').pop() || `photo_${Date.now()}`,
          originalName: photo.name,
          fileUrl: photo.url,
          fileSize: photo.size,
          mimeType: 'image/jpeg', // Default, can be enhanced
          width: photo.width || null,
          height: photo.height || null,
          caption: photo.caption || '',
          tags: 'daily-log,construction,updated',
          uploadedById: userId, // Use uploadedById instead of createdById
          createdAt: new Date(),
        }));

        await database
          .insert(constructionPhotoSchema)
          .values(photosToInsert);
      }
    }

    // Get updated photos for response
    const updatedPhotos = await database
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

    const result = {
      id: updatedDailyLog.id,
      projectId: updatedDailyLog.projectId,
      organizationId: updatedDailyLog.organizationId,
      title: updatedDailyLog.logTitle,
      logDate: updatedDailyLog.constructionDate,
      weather: updatedDailyLog.weather,
      temperature: updatedDailyLog.temperature,
      workDescription: updatedDailyLog.constructionWorkDescription,
      workHours: updatedDailyLog.dailyWorkHours,
      workersCount: updatedDailyLog.laborCount,
      issues: updatedDailyLog.issues,
      notes: updatedDailyLog.notes,
      createdById: updatedDailyLog.createdById,
      updatedAt: updatedDailyLog.updatedAt,
      createdAt: updatedDailyLog.createdAt,
      photos: updatedPhotos.map((photo: any) => ({
        id: photo.id.toString(),
        publicId: photo.fileName,
        url: photo.fileUrl,
        name: photo.originalName,
        size: photo.fileSize,
        uploadedAt: photo.createdAt,
        tags: photo.tags ? (typeof photo.tags === 'string' ? photo.tags.split(',').map(tag => tag.trim()) : photo.tags) : [],
        caption: photo.caption,
      })),
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error updating daily log:', error);
    return NextResponse.json({
      success: false,
      error: { message: 'Failed to update daily log' },
    }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/daily-logs/[dailyLogId] - Delete daily log
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; dailyLogId: string } },
) {
  try {
    const projectId = parseInt(params.id);
    const dailyLogId = parseInt(params.dailyLogId);
    
    if (isNaN(projectId) || isNaN(dailyLogId)) {
      return NextResponse.json({
        success: false,
        error: { message: 'Invalid project ID or daily log ID' },
      }, { status: 400 });
    }

    // Extract organization ID from request headers or auth
    const orgId = request.headers.get('x-organization-id') || 'org_demo_1';
    const userId = request.headers.get('x-user-id') || 'test-user-123';

    // Get database connection
    const database = await db;

    // Check if daily log exists and belongs to project AND organization
    const [existingDailyLog] = await database
      .select()
      .from(constructionLogSchema)
      .where(
        and(
          eq(constructionLogSchema.id, dailyLogId),
          eq(constructionLogSchema.projectId, projectId),
          eq(constructionLogSchema.organizationId, orgId), // Security: Organization isolation
        ),
      )
      .limit(1);

    if (!existingDailyLog) {
      return NextResponse.json({
        success: false,
        error: { message: 'Daily log not found' },
      }, { status: 404 });
    }

    // Soft delete daily log
    await database
      .update(constructionLogSchema)
      .set({
        deletedAt: new Date(),
        deletedById: userId, // Security: Track who deleted
      })
      .where(eq(constructionLogSchema.id, dailyLogId));

    return NextResponse.json({
      success: true,
      data: { message: 'Daily log deleted successfully' },
    });
  } catch (error) {
    logger.error('Error deleting daily log:', error);
    return NextResponse.json({
      success: false,
      error: { message: 'Failed to delete daily log' },
    }, { status: 500 });
  }
}


