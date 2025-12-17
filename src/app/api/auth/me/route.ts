import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = verifyAdminToken(request);
  
  if (!auth.valid) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  return NextResponse.json({ 
    email: auth.email,
    role: auth.role,
    authenticated: true
  });
}
