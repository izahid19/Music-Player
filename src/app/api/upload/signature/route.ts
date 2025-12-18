import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { verifyAdminToken, unauthorizedResponse } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const auth = verifyAdminToken(request);
  if (!auth.valid) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { type, filename } = body;

    if (!type || !filename) {
      return NextResponse.json(
        { error: 'Type and filename are required' },
        { status: 400 }
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = type === 'audio' ? 'playly/songs' : 'playly/covers';
    const publicId = filename.replace(/\.[^/.]+$/, ''); // Remove extension
    const resourceType = type === 'audio' ? 'video' : 'image';

    // Generate signature for direct upload
    const paramsToSign = {
      timestamp,
      folder,
      public_id: publicId,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      publicId,
      resourceType,
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
