/**
 * Organizations API endpoints
 * GET /api/organizations - List all organizations
 */

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { organizationSchema } from '@/models/Schema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get database connection
    const database = await db;

    // Query all organizations
    const organizations = await database
      .select()
      .from(organizationSchema)
      .orderBy(organizationSchema.createdAt);

    logger.info(`Found ${organizations.length} organizations in database`);

    return NextResponse.json({
      organizations,
      count: organizations.length,
    });

  } catch (error) {
    logger.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 },
    );
  }
}
