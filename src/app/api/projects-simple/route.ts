import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Projects Simple API is working!',
    projects: [],
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  return NextResponse.json({
    message: 'Create project simple endpoint is working!',
    timestamp: new Date().toISOString(),
  });
}
