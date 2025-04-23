import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { message: 'Authentication check failed' },
      { status: 500 }
    );
  }
}