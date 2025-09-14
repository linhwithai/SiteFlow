/**
 * Delete Upload API endpoint
 * DELETE /api/upload/[publicId] - Delete file from Cloudinary
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { deleteImage } from '@/libs/Cloudinary';
import { logger } from '@/libs/Logger';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { publicId: string } },
) {
  try {
    const { publicId } = params;

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 },
      );
    }

    // Delete from Cloudinary
    await deleteImage(publicId);

    logger.info('File deleted successfully', {
      publicId,
    });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 },
    );
  }
}
