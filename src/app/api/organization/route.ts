import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { organizationSchema } from '@/models/Schema';

export async function GET() {
  try {
    const database = await db;

    // Get organization info
    const org = await database
      .select()
      .from(organizationSchema)
      .where(eq(organizationSchema.id, 'org_demo_1'))
      .limit(1);

    if (!org.length) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 },
      );
    }

    const organization = org[0];

    // Mock member data (in real app, this would come from Clerk)
    const members = [
      {
        id: 'user_1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        role: 'org:owner',
        joinedAt: '2024-01-15T00:00:00Z',
        imageUrl: null,
      },
      {
        id: 'user_2',
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        role: 'org:admin',
        joinedAt: '2024-02-01T00:00:00Z',
        imageUrl: null,
      },
      {
        id: 'user_3',
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        role: 'org:member',
        joinedAt: '2024-02-15T00:00:00Z',
        imageUrl: null,
      },
    ];

    // Mock project stats
    const projectStats = {
      totalProjects: 22,
      activeProjects: 15,
      completedProjects: 5,
      pausedProjects: 2,
      totalBudget: 5000000000000, // 5 trillion VND
    };

    logger.info(`Organization info fetched for ${organization.name}`);

    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        imageUrl: organization.imageUrl,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
        membersCount: members.length,
        role: 'org:owner', // Mock current user role
      },
      members,
      stats: projectStats,
    });
  } catch (error) {
    logger.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
