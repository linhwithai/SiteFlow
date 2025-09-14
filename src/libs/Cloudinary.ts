import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo',
});

export { cloudinary };

// Helper function to upload image
export async function uploadImage(
  file: File | Buffer,
  folder: string = 'siteflow',
  options: {
    public_id?: string;
    transformation?: any;
    tags?: string[];
  } = {},
): Promise<{
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
  }> {
  try {
    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'demo') {
      throw new Error('Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
    }

    // Convert File to base64 string for Cloudinary
    let fileData: string;
    if (file instanceof File) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      fileData = `data:${file.type};base64,${base64}`;
    } else {
      const base64 = file.toString('base64');
      fileData = `data:image/jpeg;base64,${base64}`;
    }

    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      public_id: options.public_id,
      transformation: options.transformation,
      tags: options.tags,
      resource_type: 'auto',
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
}

// Helper function to delete image
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
}

// Helper function to generate signed upload URL
export function generateUploadSignature(folder: string = 'siteflow'): {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
} {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
  };
}

// Helper function to transform image URL
export function getTransformedImageUrl(
  publicId: string,
  transformations: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {},
): string {
  return cloudinary.url(publicId, {
    ...transformations,
    secure: true,
  });
}
