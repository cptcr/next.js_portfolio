// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { username, password } = body;

    // Validate inputs
    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    // Authenticate user
    const authResult = await authService.authenticateUser(username, password);

    if (!authResult.success) {
      return NextResponse.json(
        { message: authResult.message || 'Authentication failed' },
        { status: 401 },
      );
    }

    // Set auth cookie
    if (authResult.token) {
      authService.setAuthCookie(authResult.token);
    }

    // Return success response with user info (but not token - it's in the cookie)
    return NextResponse.json({
      success: true,
      user: authResult.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Login failed' }, { status: 500 });
  }
}
