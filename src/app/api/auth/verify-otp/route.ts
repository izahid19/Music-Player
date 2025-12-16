import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Otp from '@/models/Otp';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    // Only allow admin email
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized email address' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Find OTP in database
    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      otp,
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    // Delete used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Create JWT token
    const token = jwt.sign(
      {
        email: email.toLowerCase(),
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
