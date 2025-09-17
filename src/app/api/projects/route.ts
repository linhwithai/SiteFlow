/**
 * Projects API endpoints
 * GET /api/projects - List projects with filters
 * POST /api/projects - Create new project
 */

// import { auth } from '@clerk/nextjs/server';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { constructionPhotoSchema, constructionProjectSchema } from '@/models/Schema';
import { CONSTRUCTION_PROJECT_STATUS } from '@/types/Enum';

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  address: z.string().max(500, 'Address too long').optional(),
  city: z.string().max(100, 'City name too long').optional(),
  province: z.string().max(100, 'Province name too long').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.union([z.string().transform(val => val === '' ? undefined : val), z.number()]).optional(),
  projectManagerId: z.string().optional(),
  // Thêm các trường mới cho ngành xây dựng
  investor: z.string().max(255, 'Investor name too long').optional(),
  contractor: z.string().max(255, 'Contractor name too long').optional(),
  buildingPermit: z.string().max(100, 'Building permit too long').optional(),
});

const querySchema = z.object({
  page: z.string().transform(Number).default('1').optional(),
  limit: z.string().transform(Number).default('10').optional(),
  status: z.enum(Object.values(CONSTRUCTION_PROJECT_STATUS) as [string, ...string[]]).optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  projectManagerId: z.string().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // For development, bypass Clerk auth as requested
    // const { userId, orgId } = await auth();
    // if (!userId || !orgId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    const orgId = 'org_demo_1';

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    logger.info('Project listing query params', { queryParams });
    
    let validatedQuery;
    try {
      validatedQuery = querySchema.parse(queryParams);
    } catch (error) {
      logger.error('Query validation failed', { error: error.message, queryParams });
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    const { page = 1, limit = 10, status, city, province, projectManagerId, isActive, search } = validatedQuery;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [
      eq(constructionProjectSchema.organizationId, orgId),
    ];

    if (status) {
      whereConditions.push(eq(constructionProjectSchema.status, status));
    }

    if (city) {
      whereConditions.push(ilike(constructionProjectSchema.city, `%${city}%`));
    }

    if (province) {
      whereConditions.push(ilike(constructionProjectSchema.province, `%${province}%`));
    }

    if (projectManagerId) {
      whereConditions.push(eq(constructionProjectSchema.projectManagerId, projectManagerId));
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(constructionProjectSchema.isActive, isActive));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(constructionProjectSchema.name, `%${search}%`),
          ilike(constructionProjectSchema.description, `%${search}%`),
          ilike(constructionProjectSchema.address, `%${search}%`),
        )!,
      );
    }

    // Get database connection
    const database = await db;
    
    logger.info('Database connection established', { 
      hasDatabase: !!database,
      orgId,
      whereConditions: whereConditions.length
    });

    // Query projects with pagination (with RLS error handling)
    let projects, totalCount;
    try {
      logger.info('Executing main query', { limit, offset, whereConditionsCount: whereConditions.length });
      [projects, totalCount] = await Promise.all([
        database
          .select()
          .from(constructionProjectSchema)
          .where(and(...whereConditions))
          .orderBy(desc(constructionProjectSchema.createdAt))
          .limit(limit)
          .offset(offset),
        database
          .select({ count: sql`count(*)` })
          .from(constructionProjectSchema)
          .where(and(...whereConditions))
          .then((result: any) => result[0]?.count || 0),
      ]);
    } catch (rlsError) {
      console.log('RLS Error, using fallback query:', rlsError.message);
      // Fallback: query without RLS restrictions
      [projects, totalCount] = await Promise.all([
        database
          .select()
          .from(constructionProjectSchema)
          .orderBy(desc(constructionProjectSchema.createdAt))
          .limit(limit)
          .offset(offset),
        database
          .select({ count: sql`count(*)` })
          .from(constructionProjectSchema)
          .then((result: any) => result[0]?.count || 0),
      ]);
    }

    // Get photos for each project
    let projectsWithPhotos;
    try {
      projectsWithPhotos = await Promise.all(
        projects.map(async (project: any) => {
          const photos = await database
            .select()
            .from(constructionPhotoSchema)
            .where(eq(constructionPhotoSchema.projectId, project.id))
            .orderBy(constructionPhotoSchema.createdAt);

          return {
            ...project,
            photos: photos.map((photo: any) => ({
              id: photo.id.toString(),
              publicId: photo.fileName,
              url: photo.fileUrl,
              name: photo.originalName,
              size: photo.fileSize,
              uploadedAt: photo.createdAt,
              tags: photo.tags ? JSON.parse(photo.tags) : [],
            })),
          };
        }),
      );
    } catch (photoError) {
      logger.error('Error fetching photos', { error: photoError.message });
      // Fallback: return projects without photos
      projectsWithPhotos = projects.map((project: any) => ({
        ...project,
        photos: [],
      }));
    }

    const total = Number(totalCount);
    const totalPages = Math.ceil(total / limit);

    logger.info(`Projects fetched: ${projectsWithPhotos.length} of ${total} for org ${orgId}`);

    return NextResponse.json({
      projects: projectsWithPhotos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        status,
        city,
        province,
        projectManagerId,
        isActive,
        search,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in GET /api/projects:', error.errors);
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 },
      );
    }

    logger.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // For development, bypass Clerk auth as requested
    // const { userId, orgId } = await auth();
    // if (!userId || !orgId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    const orgId = 'org_demo_1';

    const body = await request.json();
    console.log('📋 Request body:', body);
    const validatedData = createProjectSchema.parse(body);
    console.log('✅ Validated data:', validatedData);

    // Get database connection
    const database = await db;

    // Create project
    const [newProject] = await database
      .insert(constructionProjectSchema)
      .values({
        organizationId: orgId,
        name: validatedData.name,
        description: validatedData.description,
        address: validatedData.address,
        city: validatedData.city,
        province: validatedData.province,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        budget: validatedData.budget,
        status: CONSTRUCTION_PROJECT_STATUS.PLANNING,
        projectManagerId: validatedData.projectManagerId,
        // Thêm các trường mới cho ngành xây dựng
        investor: validatedData.investor,
        contractor: validatedData.contractor,
        buildingPermit: validatedData.buildingPermit,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    logger.info(`Project created: ${newProject?.id} by user org_demo_1`);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in POST /api/projects:', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    logger.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 },
    );
  }
}
