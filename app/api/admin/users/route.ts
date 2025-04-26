// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verify } from "jsonwebtoken";
import { usersService } from '@/lib/services/users';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

// Middleware to verify authentication
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "Missing or invalid authorization header" };
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = verify(token, JWT_SECRET);
    return { 
      authenticated: true, 
      username: (payload as any).username 
    };
  } catch (error) {
    return { 
      authenticated: false, 
      error: "Invalid or expired token" 
    };
  }
}

// GET: List all users
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const auth = await verifyAuth(request);
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      );
    }
    
    // Get current user details to check permissions
    const currentUser = await usersService.getUserByUsername(auth.username);
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission to manage users
    const canManageUsers = await usersService.hasPermission(currentUser.id, 'canManageUsers');
    
    if (!canManageUsers && currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to view users' },
        { status: 403 }
      );
    }
    
    // Get search params for pagination
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
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
    // Authenticate
    const auth = await verifyAuth(request);
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      );
    }
    
    // Get current user details to check permissions
    const currentUser = await usersService.getUserByUsername(auth.username);
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
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
    const { username, email, password, realName, role = 'user', avatarUrl } = body;
    
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
    // Only root admin can create other admins
    if (role === 'admin') {
      if (currentUser.role !== 'admin') {
        return NextResponse.json(
          { message: 'Not authorized to create admin users' },
          { status: 403 }
        );
      }
      
      // Check if this is the root admin
      if (currentUser.username !== 'admin') {
        return NextResponse.json(
          { message: 'Only the root admin can create other admin users' },
          { status: 403 }
        );
      }
    }
    
    // Create user
    const newUser = await usersService.createUser({
      username,
      email,
      password,
      realName,
      role,
      avatarUrl,
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
      { message: 'Failed to create user', error: String(error) },
      { status: 500 }
    );
  }
}