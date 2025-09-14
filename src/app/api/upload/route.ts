/**
 * File Upload API endpoint
 * POST /api/upload - Upload files to Cloudinary
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';

import { uploadImage } from '@/libs/Cloudinary';
import { logger } from '@/libs/Logger';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload API called');

    // Check content type
    const contentType = request.headers.get('content-type');
    console.log('📋 Content-Type:', contentType);

    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.log('❌ Invalid content type, expected multipart/form-data');
      return NextResponse.json(
        { error: 'Invalid content type. Expected multipart/form-data.' },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    console.log('📋 FormData parsed successfully');

    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'siteflow';
    const tags = formData.get('tags') as string;

    console.log('📁 File info:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      folder,
      tags,
    });

    if (!file) {
      console.log('❌ No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 },
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Check if Cloudinary is configured
    console.log('🔧 Cloudinary config check:', {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY ? '***' : 'not set',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? '***' : 'not set',
    });

    // Upload to Cloudinary
    const result = await uploadImage(buffer, folder, {
      tags: tags ? tags.split(',') : undefined,
      addWatermark: true,
      watermarkText: 'SiteFlow',
    });

    logger.info('File uploaded successfully', {
      publicId: result.public_id,
      folder,
      originalName: file.name,
    });

    return NextResponse.json({
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        thumbnailUrl: result.thumbnail_url,
        width: result.width,
        height: result.height,
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('💥 Upload error:', error);
    logger.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

// Generate upload signature for client-side uploads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'siteflow';

    const { generateUploadSignature } = await import('@/libs/Cloudinary');
    const signature = generateUploadSignature(folder);

    return NextResponse.json({
      success: true,
      data: signature,
    });
  } catch (error) {
    logger.error('Error generating upload signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 },
    );
  }
}
