import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, return mock user data
    // In production, you would fetch from your database
    const userData = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      imageUrl: '',
      createdAt: new Date().toISOString(),
      lastSignInAt: new Date().toISOString(),
      organizationMemberships: [
        {
          organization: {
            id: orgId || 'org_demo_1',
            name: 'Demo Organization',
            imageUrl: '',
            role: 'admin'
          }
        }
      ]
    };

    return NextResponse.json(
      { data: userData, message: 'User data retrieved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
