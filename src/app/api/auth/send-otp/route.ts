import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import dbConnect from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { RateLimiter } from '@/lib/rate-limit';

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const FROM_EMAIL = process.env.FROM_EMAIL!;
const FROM_NAME = process.env.FROM_NAME!;
const SUPER_ADMIN_EMAIL = process.env.ADMIN_EMAIL!; // Super admin from env

const OTP_EXPIRY_SECONDS = 10 * 60; // 10 minutes
const RATE_LIMIT_SECONDS = 2 * 60; // 2 minutes

// ... (helper functions remain the same) ...

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmailWithBrevo(to: string, otp: string): Promise<boolean> {
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
      to: [
        {
          email: to,
          name: 'Admin',
        },
      ],
      subject: `Your Playyly Admin Login OTP: ${otp}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #667eea; text-align: center; font-size: 24px;">Playyly Admin</h1>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin: 0; font-size: 18px;">Your One-Time Password</h2>
            <p style="font-size: 32px; font-weight: bold; color: white; letter-spacing: 6px; margin: 20px 0;">${otp}</p>
            <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">This code expires in 10 minutes</p>
          </div>
          <p style="color: #666; text-align: center; margin-top: 20px; font-size: 13px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    }),
  });

  return response.ok;
}

export async function POST(request: NextRequest) {
  // IP-based rate limit: 5 OTP requests per hour per IP
  const ipLimit = await RateLimiter.check(request, 'otp_request_ip', {
    limit: 5,
    window: 60 * 60 // 1 hour
  });

  if (!ipLimit.success) {
    return RateLimiter.response(ipLimit);
  }

  try {
    const { email } = await request.json();
    const emailLower = email.toLowerCase().trim();

    // Connect to database
    await dbConnect();

    // Check if email is super admin (from env)
    const isSuperAdmin = emailLower === SUPER_ADMIN_EMAIL.toLowerCase();
    
    // Check if email is in allowed admins list
    let adminUser = null;
    if (!isSuperAdmin) {
      adminUser = await AdminUser.findOne({ email: emailLower });
      if (!adminUser) {
        return NextResponse.json(
          { error: 'You are not authorized to access the admin dashboard. Please contact the super admin.' },
          { status: 403 }
        );
      }
    }

    // Check rate limit - can only request OTP every 2 minutes
    const rateLimitKey = `otp_rate_limit:${emailLower}`;
    const lastRequest = await redis.get(rateLimitKey);
    
    if (lastRequest) {
      const ttl = await redis.ttl(rateLimitKey);
      return NextResponse.json(
        { 
          error: `Please wait ${Math.ceil(ttl / 60)} minute(s) before requesting a new OTP`,
          retryAfter: ttl 
        },
        { status: 429 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();

    // Store OTP in Redis with 10 minute expiry
    const otpKey = `otp:${emailLower}`;
    await redis.set(otpKey, otp, { ex: OTP_EXPIRY_SECONDS });

    // Set rate limit for 2 minutes
    await redis.set(rateLimitKey, '1', { ex: RATE_LIMIT_SECONDS });

    // Send OTP via Brevo
    const emailSent = await sendEmailWithBrevo(email, otp);

    if (!emailSent) {
      // Clean up if email fails
      await redis.del(otpKey);
      await redis.del(rateLimitKey);
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: OTP_EXPIRY_SECONDS,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
