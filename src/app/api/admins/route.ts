import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { verifyAdminToken } from '@/lib/auth';
import { RateLimiter } from '@/lib/rate-limit';

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const FROM_EMAIL = process.env.FROM_EMAIL!;
const FROM_NAME = process.env.FROM_NAME!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Send email notification using Brevo
async function sendAdminNotificationEmail(
  to: string, 
  type: 'added' | 'removed',
  addedByEmail: string
): Promise<boolean> {
  const subject = type === 'added' 
    ? '🎉 You have been added as a Playyly Admin!'
    : '⚠️ Your Playyly Admin access has been removed';

  const htmlContent = type === 'added' 
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #667eea; text-align: center; font-size: 28px;">🎵 Playyly</h1>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; border-radius: 16px; text-align: center;">
          <h2 style="color: white; margin: 0 0 15px 0; font-size: 22px;">Welcome, Admin! 🎉</h2>
          <p style="color: rgba(255,255,255,0.9); margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
            You have been added as an admin to the Playyly Music Player dashboard by <strong>${addedByEmail}</strong>.
          </p>
          <p style="color: rgba(255,255,255,0.8); margin: 0 0 25px 0; font-size: 14px;">
            You can now login to manage the music library, add songs, and more!
          </p>
          <a href="${APP_URL}/admin/login" 
             style="display: inline-block; background: white; color: #667eea; padding: 14px 32px; 
                    border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            Login to Dashboard →
          </a>
        </div>
        <p style="color: #666; text-align: center; margin-top: 25px; font-size: 13px;">
          If you believe this was a mistake, please contact the super admin.
        </p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #667eea; text-align: center; font-size: 28px;">🎵 Playyly</h1>
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px 20px; border-radius: 16px; text-align: center;">
          <h2 style="color: white; margin: 0 0 15px 0; font-size: 22px;">Admin Access Removed</h2>
          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px; line-height: 1.5;">
            Your admin access to the Playyly Music Player dashboard has been removed by the super admin.
          </p>
        </div>
        <p style="color: #666; text-align: center; margin-top: 25px; font-size: 13px;">
          If you believe this was a mistake, please contact the super admin at <strong>${addedByEmail}</strong>.
        </p>
      </div>
    `;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: FROM_NAME,
          email: FROM_EMAIL,
        },
        to: [{ email: to, name: 'Admin' }],
        subject,
        htmlContent,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return false;
  }
}

// GET all admin users (super_admin only)
export async function GET(request: NextRequest) {
  const auth = verifyAdminToken(request);
  
  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (auth.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admin can view admin users' }, { status: 403 });
  }

  try {
    await dbConnect();
    
    const admins = await AdminUser.find({})
      .sort({ createdAt: -1 })
      .select('email role addedBy createdAt');
    
    return NextResponse.json({
      success: true,
      admins: admins.map(admin => ({
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        addedBy: admin.addedBy,
        createdAt: admin.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get admins error:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

// POST add new admin (super_admin only)
export async function POST(request: NextRequest) {
  const auth = verifyAdminToken(request);
  
  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (auth.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admin can add new admins' }, { status: 403 });
  }

  // Rate limit: 10 admin additions per hour per super admin
  const userRateLimit = await RateLimiter.check(request, 'add_admin_user', {
    limit: 10,
    window: 60 * 60,
    identifier: auth.email // Rate limit by user email
  });

  if (!userRateLimit.success) {
    return RateLimiter.response(userRateLimit);
  }

  try {
    const { email } = await request.json();
    const emailLower = email.toLowerCase().trim();

    if (!emailLower || !emailLower.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ email: emailLower });
    if (existingAdmin) {
      return NextResponse.json({ error: 'This email is already an admin' }, { status: 400 });
    }

    // Create new admin
    const newAdmin = await AdminUser.create({
      email: emailLower,
      role: 'admin',
      addedBy: auth.email,
    });

    // Send notification email (don't wait for it, fire and forget)
    sendAdminNotificationEmail(emailLower, 'added', auth.email!);

    return NextResponse.json({
      success: true,
      message: 'Admin added successfully. Invitation email sent!',
      admin: {
        id: newAdmin._id.toString(),
        email: newAdmin.email,
        role: newAdmin.role,
        addedBy: newAdmin.addedBy,
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error) {
    console.error('Add admin error:', error);
    return NextResponse.json({ error: 'Failed to add admin' }, { status: 500 });
  }
}
