import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { RateLimiter } from '@/lib/rate-limit';

const JWT_SECRET = process.env.JWT_SECRET!;
const SUPER_ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

export async function POST(request: NextRequest) {
  // Rate limit: 5 verification attempts per 15 minutes per IP
  const rateLimit = await RateLimiter.check(request, 'verify_otp', {
    limit: 5,
    window: 15 * 60
  });

  if (!rateLimit.success) {
    return RateLimiter.response(rateLimit);
  }

  try {
    const { email, otp } = await request.json();
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

    // Get OTP from Redis
    const otpKey = `otp:${emailLower}`;
    const storedOtp = await redis.get(otpKey);

    if (!storedOtp) {
      return NextResponse.json(
        { error: 'OTP expired. Please request a new one.' },
        { status: 401 }
      );
    }

    // Compare OTPs (convert to string and trim for safety)
    const storedOtpStr = String(storedOtp).trim();
    const inputOtpStr = String(otp).trim();

    if (storedOtpStr !== inputOtpStr) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 401 }
      );
    }

    // Delete used OTP and rate limit
    await redis.del(otpKey);
    await redis.del(`otp_rate_limit:${emailLower}`);

    // Determine role
    const role = isSuperAdmin ? 'super_admin' : (adminUser?.role || 'admin');

    // Create JWT token with role
    const token = jwt.sign(
      {
        email: emailLower,
        role: role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create response with HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      role: role,
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
