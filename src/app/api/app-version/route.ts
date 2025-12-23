import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppVersion from '@/models/AppVersion';
import { verifyAdminToken, unauthorizedResponse } from '@/lib/auth';

// Default config if DB is empty
const DEFAULT_CONFIG = {
  version: '1.0.0',
  minVersion: '1.0.0',
  androidUrl: '/android-app.apk',
  forceUpdate: false,
  changelog: 'Initial release - Enjoy your music on the go!',
  uploadLimit: 40, // 40 MB default
};

// GET app version info (public)
export async function GET() {
  try {
    await dbConnect();

    // Get latest active version
    const latestVersion = await AppVersion.findOne({ isActive: true })
      .sort({ createdAt: -1 });

    if (!latestVersion) {
        return NextResponse.json({
            success: true,
            version: DEFAULT_CONFIG.version,
            minVersion: DEFAULT_CONFIG.minVersion,
            downloadUrl: { android: DEFAULT_CONFIG.androidUrl },
            forceUpdate: DEFAULT_CONFIG.forceUpdate,
            changelog: DEFAULT_CONFIG.changelog,
            uploadLimit: DEFAULT_CONFIG.uploadLimit,
        });
    }

    return NextResponse.json({
      success: true,
      version: latestVersion.version,
      minVersion: latestVersion.minVersion,
      downloadUrl: {
          android: latestVersion.androidUrl,
          ios: latestVersion.iosUrl || '',
      },
      forceUpdate: latestVersion.forceUpdate,
      changelog: latestVersion.changelog,
      uploadLimit: latestVersion.uploadLimit || DEFAULT_CONFIG.uploadLimit,
      updatedAt: latestVersion.updatedAt,
    });
  } catch (error) {
    console.error('Get app version error:', error);
    return NextResponse.json({ error: 'Failed to fetch version' }, { status: 500 });
  }
}

// POST update app version (super admin only)
export async function POST(request: NextRequest) {
    const auth = verifyAdminToken(request);
    if (!auth.valid) {
      return unauthorizedResponse();
    }

    // Only super admin can update app version
    if (auth.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admin can update app configuration' },
        { status: 403 }
      );
    }

    try {
        await dbConnect();
        const body = await request.json();
        
        // We can either update the latest or create a new one. 
        // For simplicity, we'll maintain one "Active" record or create a new one.
        // Let's create a new record to keep history, but mark others inactive? 
        // Or just update the single record pattern.
        
        // Strategy: Find existing active or create new.
        let versionDoc = await AppVersion.findOne({ isActive: true }).sort({ createdAt: -1 });

        if (versionDoc) {
            // Update existing
            versionDoc.version = body.version || versionDoc.version;
            versionDoc.minVersion = body.minVersion || versionDoc.minVersion;
            versionDoc.changelog = body.changelog || versionDoc.changelog;
            versionDoc.androidUrl = body.androidUrl || versionDoc.androidUrl;
            versionDoc.forceUpdate = body.forceUpdate ?? versionDoc.forceUpdate;
            if (body.uploadLimit !== undefined) {
              versionDoc.uploadLimit = Math.min(40, Math.max(1, body.uploadLimit)); // Cap at 40MB
            }
            await versionDoc.save();
        } else {
            // Create New
            versionDoc = await AppVersion.create({
                version: body.version || DEFAULT_CONFIG.version,
                minVersion: body.minVersion || DEFAULT_CONFIG.minVersion,
                changelog: body.changelog || DEFAULT_CONFIG.changelog,
                androidUrl: body.androidUrl || DEFAULT_CONFIG.androidUrl,
                forceUpdate: body.forceUpdate || false,
                uploadLimit: Math.min(40, Math.max(1, body.uploadLimit || DEFAULT_CONFIG.uploadLimit)), // Cap at 40MB
                isActive: true
            });
        }

        return NextResponse.json({ success: true, data: versionDoc });

    } catch (error) {
        console.error('Update app version error:', error);
        return NextResponse.json({ error: 'Failed to update version' }, { status: 500 });
    }
}
