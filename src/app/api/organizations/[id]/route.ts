/**
 * Individual Organization API endpoints
 * GET /api/organizations/[id] - Get organization by ID
 * PUT /api/organizations/[id] - Update organization
 * DELETE /api/organizations/[id] - Delete organization (soft delete)
 */

import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { organizationSchema } from '@/models/Schema';

// Validation schema for organization update
const updateOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(255, 'Name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  address: z.string().max(500, 'Address too long').optional(),
  phone: z.string().max(20, 'Phone too long').optional(),
  email: z.string().email('Invalid email format').optional(),
  website: z.string().url('Invalid website URL').optional(),
  logo: z.string().url('Invalid logo URL').optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // For testing purposes, use hardcoded values
    // TODO: Implement proper Clerk authentication
    const userId = 'test-user-123';
    const orgId = 'org_demo_1';

    // Check if user has access to this organization
    if (orgId !== params.id) {
      return NextResponse.json(
        { error: 'Forbidden - Access denied to this organization' },
        { status: 403 },
      );
    }

    // Get database connection
    const database = await db;

    // Get organization by ID
    const [organization] = await database
      .select()
      .from(organizationSchema)
      .where(
        and(
          eq(organizationSchema.id, params.id),
          eq(organizationSchema.isActive, true),
        ),
      )
      .limit(1);

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 },
      );
    }

    logger.info(`Organization fetched: ${params.id} by user ${userId}`);

    return NextResponse.json(organization);
  } catch (error) {
    logger.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // For testing purposes, use hardcoded values
    // TODO: Implement proper Clerk authentication
    const userId = 'test-user-123';
    const orgId = 'org_demo_1';

    // Check if user has access to this organization
    if (orgId !== params.id) {
      return NextResponse.json(
        { error: 'Forbidden - Access denied to this organization' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validatedData = updateOrganizationSchema.parse(body);

    // Get database connection
    const database = await db;

    // Check if organization exists and is active
    const [existingOrg] = await database
      .select()
      .from(organizationSchema)
      .where(
        and(
          eq(organizationSchema.id, params.id),
          eq(organizationSchema.isActive, true),
        ),
      )
      .limit(1);

    if (!existingOrg) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 },
      );
    }

    // Update organization
    const [updatedOrg] = await database
      .update(organizationSchema)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(organizationSchema.id, params.id),
          eq(organizationSchema.isActive, true),
        ),
      )
      .returning();

    logger.info(`Organization updated: ${params.id} by user ${userId}`);

    return NextResponse.json(updatedOrg);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in PUT /api/organizations/[id]:', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    logger.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // For testing purposes, use hardcoded values
    // TODO: Implement proper Clerk authentication
    const userId = 'test-user-123';
    const orgId = 'org_demo_1';

    // Check if user has access to this organization
    if (orgId !== params.id) {
      return NextResponse.json(
        { error: 'Forbidden - Access denied to this organization' },
        { status: 403 },
      );
    }

    // Get database connection
    const database = await db;

    // Soft delete organization
    const [deletedOrg] = await database
      .update(organizationSchema)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(organizationSchema.id, params.id),
          eq(organizationSchema.isActive, true),
        ),
      )
      .returning();

    if (!deletedOrg) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 },
      );
    }

    logger.info(`Organization deleted: ${params.id} by user ${userId}`);

    return NextResponse.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    logger.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 },
    );
  }
}
