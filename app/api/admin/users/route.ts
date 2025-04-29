// app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { listUsers, hasPermission, getUserByUsername, createUser } from '@/lib/services/users';
import { hash } from 'bcryptjs';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';

// Middleware to verify authentication
async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing or invalid authorization header',
    };
  }

  const token = authHeader.substring(7);

  try {
    const payload = verify(token, JWT_SECRET);
    return {
      authenticated: true,
      username: (payload as any).username,
      userId: (payload as any).userId,
      role: (payload as any).role,
    };
  } catch (error) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }
}

// GET: List all users
export async function GET(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user is admin or has permission to manage users
    if (auth.role !== 'admin' && !(await hasPermission(auth.userId, 'canManageUsers'))) {
      return NextResponse.json(
        { message: 'You do not have permission to view users' },
        { status: 403 },
      );
    }

    // Get the limit from query params (if any)
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get users from service
    const users = await listUsers(limit, offset);

    // Remove passwords from response
    const safeUsers = users.map((user: { [x: string]: any; password: any }) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json(
      { message: 'Failed to list users', error: String(error) },
      { status: 500 },
    );
  }
}

// POST: Create a new user
export async function POST(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user is admin or has permission to manage users
    if (auth.role !== 'admin' && !(await hasPermission(auth.userId, 'canManageUsers'))) {
      return NextResponse.json(
        { message: 'You do not have permission to create users' },
        { status: 403 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { username, email, password, realName, role } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Username, email, and password are required' },
        { status: 400 },
      );
    }

    // Check if username already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
    }

    // Prevent non-admins from creating admins
    if (auth.role !== 'admin' && role === 'admin') {
      return NextResponse.json({ message: 'Only admins can create admin users' }, { status: 403 });
    }

    // Create the user
    const user = await createUser({
      username,
      email,
      password,
      realName: realName || null,
      role: role || 'user',
    });

    // Remove password from response
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      message: 'User created successfully',
      user: safeUser,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Failed to create user', error: String(error) },
      { status: 500 },
    );
  }
}
