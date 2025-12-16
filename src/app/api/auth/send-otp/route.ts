import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Otp from '@/models/Otp';

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const FROM_EMAIL = process.env.FROM_EMAIL!;
const FROM_NAME = process.env.FROM_NAME!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

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
          <h1 style="color: #667eea; text-align: center;">Playyly Admin</h1>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin: 0;">Your One-Time Password</h2>
            <p style="font-size: 48px; font-weight: bold; color: white; letter-spacing: 8px; margin: 20px 0;">${otp}</p>
            <p style="color: rgba(255,255,255,0.8); margin: 0;">This code expires in 5 minutes</p>
          </div>
          <p style="color: #666; text-align: center; margin-top: 20px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    }),
  });

  return response.ok;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Only allow admin email
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized email address' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Delete any existing OTPs for this email
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    await Otp.create({
      email: email.toLowerCase(),
      otp,
    });

    // Send OTP via Brevo
    const emailSent = await sendEmailWithBrevo(email, otp);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
