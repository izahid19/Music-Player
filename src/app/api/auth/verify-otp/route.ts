import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();
    const emailLower = email.toLowerCase();

    // Only allow admin email
    if (emailLower !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized email address' },
        { status: 403 }
      );
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

    // Create JWT token
    const token = jwt.sign(
      {
        email: emailLower,
        role: 'admin',
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create response with HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
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
