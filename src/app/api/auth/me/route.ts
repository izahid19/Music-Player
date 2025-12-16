import { NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@playly.com';

export async function GET() {
  return NextResponse.json({ 
    email: ADMIN_EMAIL 
  });
}
