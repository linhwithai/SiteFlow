/**
 * Project Daily Logs API endpoints
 * GET /api/projects/[id]/daily-logs - List daily logs for a specific project
 * POST /api/projects/[id]/daily-logs - Create new daily log for a project
 */

import { and, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { constructionLogSchema, constructionPhotoSchema, constructionProjectSchema } from '@/models/Schema';

// Validation schemas
const createDailyLogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  logDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid date format'),
  weather: z.string().max(100, 'Weather description too long').optional(),
  temperature: z.number().int().min(15).max(35, 'Temperature must be between 15 and 35°C').optional(),
  workDescription: z.string().min(1, 'Work description is required').max(2000, 'Work description too long'),
  workHours: z.number().int().min(0).max(24, 'Work hours must be between 0 and 24').default(8),
  workersCount: z.number().int().min(0, 'Workers count must be non-negative').default(0),
  issues: z.string().max(1000, 'Issues description too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  photos: z.array(z.object({
    url: z.string().url('Invalid file URL'),
    name: z.string().min(1, 'File name is required'),
    size: z.number().int().min(0, 'File size must be positive'),
    width: z.number().int().min(1, 'Width must be positive').optional(),
    height: z.number().int().min(1, 'Height must be positive').optional(),
    caption: z.string().max(500, 'Caption too long').optional(),
    thumbnailUrl: z.string().optional(),
  })).optional().default([]),
});

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  constructionDateFrom: z.string().optional(),
  constructionDateTo: z.string().optional(),
  weather: z.string().optional(),
  constructionWorkDescription: z.string().optional(),
  search: z.string().optional(),
});

// Helper functions
function createSuccessResponse(data: any, status = 200) {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      version: 'v1',
      timestamp: new Date().toISOString(),
    },
  }, { status });
}

function createErrorResponse(message: string, status = 400) {
  return NextResponse.json({
    success: false,
    error: {
      message,
      code: status,
    },
    meta: {
      version: 'v1',
      timestamp: new Date().toISOString(),
    },
  }, { status });
}

function validateProjectId(params: { id: string }) {
  const projectId = parseInt(params.id);
  if (isNaN(projectId) || projectId <= 0) {
    return {
      success: false,
      error: createErrorResponse('Invalid project ID', 400),
    };
  }
  return { success: true, projectId };
}

function extractOrganizationId(): string {
  return 'org_demo_1';
}

function extractUserId(): string {
  return 'test-user-123';
}

// GET /api/projects/[id]/daily-logs - Get daily logs for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Validate project ID
    const projectIdValidation = validateProjectId(params);
    if (!projectIdValidation.success) {
      return projectIdValidation.error;
    }
    const { projectId } = projectIdValidation;

    // Extract organization ID
    const orgId = extractOrganizationId();

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const queryValidation = querySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return createErrorResponse('Invalid query parameters', 400);
    }
    const { page, limit, constructionDateFrom, constructionDateTo, weather, constructionWorkDescription, search } = queryValidation.data;

    // Get database connection
    const database = await db;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [
      eq(constructionLogSchema.projectId, projectId),
      eq(constructionLogSchema.organizationId, orgId),
    ];

    if (constructionDateFrom) {
      whereConditions.push(gte(constructionLogSchema.constructionDate, new Date(constructionDateFrom)));
    }

    if (constructionDateTo) {
      whereConditions.push(lte(constructionLogSchema.constructionDate, new Date(constructionDateTo)));
    }

    if (weather) {
      whereConditions.push(ilike(constructionLogSchema.weather, `%${weather}%`));
    }

    if (constructionWorkDescription) {
      whereConditions.push(ilike(constructionLogSchema.constructionWorkDescription, `%${constructionWorkDescription}%`));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(constructionLogSchema.constructionWorkDescription, `%${search}%`),
          ilike(constructionLogSchema.issues, `%${search}%`),
          ilike(constructionLogSchema.notes, `%${search}%`),
        )!,
      );
    }

    // Query daily logs with pagination
    const [dailyLogs, totalCount] = await Promise.all([
      database
        .select()
        .from(constructionLogSchema)
        .where(and(...whereConditions))
        .orderBy(desc(constructionLogSchema.constructionDate))
        .limit(limit)
        .offset(offset),
      database
        .select({ count: sql`count(*)` })
        .from(constructionLogSchema)
        .where(and(...whereConditions)),
    ]);

    const total = Number(totalCount[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    // Get photos for each daily log
    const dailyLogsWithPhotos = await Promise.all(
      dailyLogs.map(async (log) => {
        const photos = await database
          .select()
          .from(constructionPhotoSchema)
          .where(
            and(
              eq(constructionPhotoSchema.dailyLogId, log.id),
              eq(constructionPhotoSchema.projectId, projectId),
              eq(constructionPhotoSchema.organizationId, orgId),
            ),
          )
          .orderBy(constructionPhotoSchema.createdAt);

        return {
          id: log.id,
          projectId: log.projectId,
          organizationId: log.organizationId,
          title: log.logTitle,
          logDate: log.constructionDate,
          weather: log.weather,
          temperature: log.temperature,
          workDescription: log.constructionWorkDescription,
          workHours: log.dailyWorkHours,
          workersCount: log.laborCount,
          issues: log.issues,
          notes: log.notes,
          createdById: log.createdById,
          updatedAt: log.updatedAt,
          createdAt: log.createdAt,
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
      }),
    );

    const result = {
      dailyLogs: dailyLogsWithPhotos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        constructionDateFrom,
        constructionDateTo,
        weather,
        constructionWorkDescription,
        search,
      },
    };

    return createSuccessResponse(result);
  } catch (error) {
    logger.error('Error fetching daily logs:', error);
    return createErrorResponse('Failed to fetch daily logs', 500);
  }
}

// POST /api/projects/[id]/daily-logs - Create daily log for a project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Validate project ID
    const projectIdValidation = validateProjectId(params);
    if (!projectIdValidation.success) {
      return projectIdValidation.error;
    }
    const { projectId } = projectIdValidation;

    // Extract organization and user IDs
    const orgId = extractOrganizationId();
    const userId = extractUserId();

    // Parse and validate request body
    const body = await request.json();
    logger.info('Received request body:', JSON.stringify(body, null, 2));
    
    const bodyValidation = createDailyLogSchema.safeParse(body);
    if (!bodyValidation.success) {
      logger.error('Validation error:', bodyValidation.error.errors);
      return NextResponse.json({
        success: false,
        error: {
          message: 'Invalid request data',
          details: bodyValidation.error.errors,
          code: 400,
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      }, { status: 400 });
    }
    const validatedData = bodyValidation.data;

    // Get database connection
    const database = await db;

    // Verify project exists and belongs to organization
    const project = await database
      .select({ id: constructionProjectSchema.id })
      .from(constructionProjectSchema)
      .where(
        and(
          eq(constructionProjectSchema.id, projectId),
          eq(constructionProjectSchema.organizationId, orgId),
          eq(constructionProjectSchema.isActive, true)
        )
      )
      .limit(1);

    if (!project.length) {
      return createErrorResponse('Project not found or does not belong to your organization', 404);
    }

    // Create daily log
    const insertData = {
      projectId: projectId,
      logTitle: validatedData.title,
      constructionDate: new Date(validatedData.logDate),
      weather: validatedData.weather,
      temperature: validatedData.temperature,
      constructionWorkDescription: validatedData.workDescription,
      dailyWorkHours: validatedData.workHours,
      laborCount: validatedData.workersCount,
      issues: validatedData.issues,
      notes: validatedData.notes,
      organizationId: orgId,
      createdById: userId,
    };

    const [newDailyLog] = await database
      .insert(constructionLogSchema)
      .values(insertData)
      .returning();

    // Create photos if provided
    let createdPhotos = [];
    if (validatedData.photos && validatedData.photos.length > 0) {
      const photoInsertData = validatedData.photos.map(photo => ({
        projectId: projectId,
        dailyLogId: newDailyLog.id,
        organizationId: orgId,
        fileName: photo.name,
        originalName: photo.name,
        fileUrl: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        fileSize: photo.size,
        mimeType: 'image/jpeg', // Default MIME type
        caption: photo.caption || '',
        tags: 'daily-log,construction',
        uploadedById: userId,
      }));

      createdPhotos = await database
        .insert(constructionPhotoSchema)
        .values(photoInsertData)
        .returning();
    }

    // Return daily log with photos
    const responseData = {
      ...newDailyLog,
      photos: createdPhotos
    };

    return createSuccessResponse(responseData, 201);
  } catch (error) {
    logger.error('Error creating daily log:', error);
    return createErrorResponse('Failed to create daily log', 500);
  }
}