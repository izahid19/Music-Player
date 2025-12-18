import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppVersion from '@/models/AppVersion';

// POST - Increment download count (public, called when user clicks download)
export async function POST() {
  try {
    await dbConnect();

    // Find the active version and increment download count
    const result = await AppVersion.findOneAndUpdate(
      { isActive: true },
      { $inc: { downloadCount: 1 } },
      { new: true, sort: { createdAt: -1 } }
    );

    if (!result) {
      return NextResponse.json({ error: 'No active version found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      downloadCount: result.downloadCount,
    });
  } catch (error) {
    console.error('Track download error:', error);
    return NextResponse.json({ error: 'Failed to track download' }, { status: 500 });
  }
}

// GET - Get current download count (for dashboard stats)
export async function GET() {
  try {
    await dbConnect();

    const latestVersion = await AppVersion.findOne({ isActive: true })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      downloadCount: latestVersion?.downloadCount || 0,
    });
  } catch (error) {
    console.error('Get download count error:', error);
    return NextResponse.json({ error: 'Failed to get download count' }, { status: 500 });
  }
}
