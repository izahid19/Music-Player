import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyAdminToken(request: NextRequest): { valid: boolean; email?: string; role?: string } {
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return { valid: false };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string };
    if (decoded.role === 'admin' || decoded.role === 'super_admin') {
      return { valid: true, email: decoded.email, role: decoded.role };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
