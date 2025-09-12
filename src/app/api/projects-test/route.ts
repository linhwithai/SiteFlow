import { NextResponse } from 'next/server';
import { z } from 'zod';

// Simple validation schema
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  city: z.string().max(100, 'City name too long').optional(),
  province: z.string().max(100, 'Province name too long').optional(),
  budget: z.number().min(0, 'Budget must be positive').optional(),
});

export async function GET() {
  return NextResponse.json({
    message: 'Projects Test API is working!',
    projects: [
      {
        id: 1,
        name: 'Sample Project 1',
        description: 'This is a sample project',
        city: 'Ho Chi Minh City',
        province: 'Ho Chi Minh',
        budget: 1000000000,
        status: 'PLANNING',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    // Mock project creation
    const newProject = {
      id: Math.floor(Math.random() * 1000) + 1,
      organizationId: 'test-org-123',
      name: validatedData.name,
      description: validatedData.description,
      city: validatedData.city,
      province: validatedData.province,
      budget: validatedData.budget,
      status: 'PLANNING',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 },
    );
  }
}
