/**
 * Users API endpoints
 * GET /api/users - List users in organization
 */

// import { db } from '@/libs/DB';
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

export async function GET() {
  try {
    // For now, return mock users data
    // In production, this would query Clerk or your user database
    const users = [
      {
        id: 'user_demo_1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        role: 'Project Manager',
      },
      {
        id: 'user_demo_2',
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        role: 'Site Engineer',
      },
      {
        id: 'user_demo_3',
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        role: 'Project Manager',
      },
      {
        id: 'user_demo_4',
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        role: 'Supervisor',
      },
      {
        id: 'user_demo_5',
        name: 'Hoàng Văn E',
        email: 'hoangvane@example.com',
        role: 'Project Manager',
      },
    ];

    logger.info(`Found ${users.length} users`);

    return NextResponse.json({
      users,
      count: users.length,
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    );
  }
}
