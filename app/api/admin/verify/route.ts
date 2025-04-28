// app/api/admin/verify/route.ts
// Handler to verify admin authentication

import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { getUserById } from '@/lib/services/users';

// Constants
const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: 'Missing or invalid authorization header' },
      { status: 401 },
    );
  }

  const token = authHeader.substring(7);

  try {
    const payload = verify(token, JWT_SECRET) as {
      username: string;
      userId: number;
      role: string;
    };

    // Check if user exists
    const user = await getUserById(payload.userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      authenticated: true,
      username: payload.username,
      userId: payload.userId,
      role: payload.role,
    });
  } catch (error) {
    console.error('JWT verification failed:', error);
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
  }
}
