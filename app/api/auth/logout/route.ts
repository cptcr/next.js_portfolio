import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth';

export async function POST(request: NextRequest) {
  try {
    // Clear auth cookie
    authService.clearAuthCookie();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
  }
}
