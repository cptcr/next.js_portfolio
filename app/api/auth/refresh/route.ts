import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Generate new token
    const token = authService.generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Set new auth cookie
    authService.setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ message: 'Token refresh failed' }, { status: 500 });
  }
}
