// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth';
import { usersService } from '@/lib/services/users';

// GET: List all users
export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const currentUser = await authService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Check if user has permission to manage users
    const canManageUsers = await usersService.hasPermission(currentUser.id, 'canManageUsers');
    
    if (!canManageUsers && currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to manage users' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get users
    const users = await usersService.listUsers(limit, offset);
    const total = await usersService.countUsers();
    
    // Remove sensitive data
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      realName: user.realName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
    
    return NextResponse.json({
      users: sanitizedUsers,
      meta: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json(
      { message: 'Failed to list users' },
      { status: 500 }
    );
  }
}

// POST: Create a new user
export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const currentUser = await authService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Check if user has permission to manage users
    const canManageUsers = await usersService.hasPermission(currentUser.id, 'canManageUsers');
    
    if (!canManageUsers && currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to create users' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { username, email, password, realName, role = 'user', avatarUrl, bio } = body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Username, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Check if username or email already exists
    const existingByUsername = await usersService.getUserByUsername(username);
    if (existingByUsername) {
      return NextResponse.json(
        { message: 'Username already exists' },
        { status: 400 }
      );
    }
    
    // Only admin can create admin users
    if (role === 'admin' && currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to create admin users' },
        { status: 403 }
      );
    }
    
    // Create user
    const newUser = await usersService.createUser({
      username,
      email,
      password,
      realName,
      role,
      avatarUrl,
      bio,
    });
    
    // Return sanitized user data
    return NextResponse.json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        realName: newUser.realName,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Failed to create user' },
      { status: 500 }
    );
  }
}