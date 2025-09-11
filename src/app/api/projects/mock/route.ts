/**
 * Mock API for testing Projects UI without database
 * GET /api/projects/mock - Returns demo projects data
 */

import { NextResponse } from 'next/server';

import { demoProjects } from '@/data/demo-data';

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      projects: demoProjects,
      total: demoProjects.length,
      page: 1,
      limit: 10,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch mock projects' },
      { status: 500 }
    );
  }
}
