/**
 * Mock API for testing Project Stats without database
 * GET /api/projects/stats/mock - Returns demo project statistics
 */

import { NextResponse } from 'next/server';

import { demoStats } from '@/data/demo-data';

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json(demoStats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch mock project stats' },
      { status: 500 }
    );
  }
}
