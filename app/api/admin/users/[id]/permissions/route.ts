// app/api/admin/users/[id]/permissions/route.ts
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { usersService } from '@/lib/services/users';

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

// Get user permissions
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user has permission to manage users
    if (
      auth.role !== 'admin' &&
      !(await usersService.hasPermission(auth.userId, 'canManageUsers'))
    ) {
      return NextResponse.json(
        { message: 'You do not have permission to view user permissions' },
        { status: 403 },
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    // Get user with permissions
    const userWithPermissions = await usersService.getUserWithPermissions(id);

    if (!userWithPermissions) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      permissions: userWithPermissions.permissions,
    });
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return NextResponse.json(
      { message: 'Failed to get user permissions', error: String(error) },
      { status: 500 },
    );
  }
}

// Update user permissions
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user has permission to manage users
    if (
      auth.role !== 'admin' &&
      !(await usersService.hasPermission(auth.userId, 'canManageUsers'))
    ) {
      return NextResponse.json(
        { message: 'You do not have permission to update user permissions' },
        { status: 403 },
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();

    // Check if user exists
    const user = await usersService.getUserById(id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update permissions
    const updatedPermissions = await usersService.updatePermissions(id, body);

    return NextResponse.json({
      message: 'Permissions updated successfully',
      permissions: updatedPermissions,
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return NextResponse.json(
      { message: 'Failed to update user permissions', error: String(error) },
      { status: 500 },
    );
  }
}
