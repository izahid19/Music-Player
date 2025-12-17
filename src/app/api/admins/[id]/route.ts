import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { verifyAdminToken } from '@/lib/auth';
import { RateLimiter } from '@/lib/rate-limit';

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const FROM_EMAIL = process.env.FROM_EMAIL!;
const FROM_NAME = process.env.FROM_NAME!;

// Send removal notification email using Brevo
async function sendAdminRemovedEmail(to: string, superAdminEmail: string): Promise<boolean> {
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
        subject: 'Update regarding your Admin Access at Playyly',
        htmlContent: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #334155; line-height: 1.6;">
            <h1 style="color: #667eea; text-align: left; font-size: 24px; margin-bottom: 30px;">🎵 Playyly</h1>
            
            <p style="font-size: 16px; color: #334155;">Hi there,</p>

            <p style="font-size: 16px; color: #334155;">
              We truly appreciate the time and effort you've put into the Playyly Music Player dashboard.
            </p>

            <p style="font-size: 16px; color: #334155;">
              We appreciate how much time, energy, and heart it takes to manage and curate content — and we’re grateful you chose to share your journey with us.
            </p>

            <p style="font-size: 16px; color: #334155;">
              While your admin access isn't being continued at this time, this decision does not reflect your skills, experience, or potential. We truly appreciated the insights and contributions you shared throughout the process.
            </p>

            <p style="font-size: 16px; color: #334155;">
              At Playyly, we believe that every path is unique — and sometimes, things change. We'd love to stay connected and keep you in mind for future opportunities where your strengths can truly shine.
            </p>

            <p style="font-size: 16px; color: #334155;">
              Until then, we’re wishing you nothing but success, growth, and exciting opportunities ahead.
            </p>

            <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <p style="font-size: 16px; color: #334155; margin: 0;">Best regards,</p>
              <p style="font-size: 16px; color: #667eea; font-weight: 600; margin: 5px 0 0 0;">The Playyly Team</p>
            </div>
          </div>
        `,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send admin removal email:', error);
    return false;
  }
}

// DELETE admin user (super_admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAdminToken(request);
  
  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (auth.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admin can remove admins' }, { status: 403 });
  }

  // Rate limit: 20 admin removals per hour per super admin
  const userRateLimit = await RateLimiter.check(request, 'remove_admin_user', {
    limit: 20,
    window: 60 * 60,
    identifier: auth.email // Rate limit by user email
  });

  if (!userRateLimit.success) {
    return RateLimiter.response(userRateLimit);
  }

  try {
    const { id } = await params;
    
    await dbConnect();

    const admin = await AdminUser.findByIdAndDelete(id);
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Send notification email to removed admin (fire and forget)
    sendAdminRemovedEmail(admin.email, auth.email!);

    return NextResponse.json({
      success: true,
      message: 'Admin removed successfully. Notification email sent.',
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    return NextResponse.json({ error: 'Failed to remove admin' }, { status: 500 });
  }
}
