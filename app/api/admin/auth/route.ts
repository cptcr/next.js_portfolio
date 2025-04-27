// app/api/admin/auth/route.ts
// Handler for admin login
import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { usersService } from '@/lib/services/users';
import { compare } from 'bcryptjs';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';
const JWT_EXPIRES_IN = '24h';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    // Get user by username
    const user = await usersService.getUserByUsername(username);

    if (!user) {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    // Verify password
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    // Generate JWT token
    const token = sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    return NextResponse.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { message: 'Authentication failed', error: String(error) },
      { status: 500 },
    );
  }
}
