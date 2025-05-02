// app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import {
  hasPermission,
  getUserById,
  updateUser,
  listUsers,
  deleteUser,
} from '@/lib/services/users';

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

// Get user by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user has permission to view users
    if (auth.role !== 'admin' && !(await hasPermission(auth.userId, 'canManageUsers'))) {
      return NextResponse.json(
        { message: 'You do not have permission to view user details' },
        { status: 403 },
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    // Get user
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Remove password from response
    const { password, ...safeUser } = user;

    return NextResponse.json({
      user: safeUser,
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { message: 'Failed to get user', error: String(error) },
      { status: 500 },
    );
  }
}

// Update user
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user has permission to update users
    if (auth.role !== 'admin' && !(await hasPermission(auth.userId, 'canManageUsers'))) {
      return NextResponse.json(
        { message: 'You do not have permission to update users' },
        { status: 403 },
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { username, email, password, realName, role } = body;

    // Check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prevent non-admins from changing role to admin
    if (auth.role !== 'admin' && role === 'admin') {
      return NextResponse.json(
        { message: 'Only admins can promote users to admin role' },
        { status: 403 },
      );
    }

    // Update user
    const updates: any = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (password) updates.password = password;
    if (realName !== undefined) updates.realName = realName;
    if (role) updates.role = role;

    const updatedUser = await updateUser(id, updates);

    if (!updatedUser) {
      return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
    }

    // Remove password from response
    const { password: _, ...safeUser } = updatedUser;

    return NextResponse.json({
      message: 'User updated successfully',
      user: safeUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Failed to update user', error: String(error) },
      { status: 500 },
    );
  }
}

// Delete user
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user has permission to delete users
    if (auth.role !== 'admin' && !(await hasPermission(auth.userId, 'canManageUsers'))) {
      return NextResponse.json(
        { message: 'You do not have permission to delete users' },
        { status: 403 },
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prevent deleting the last admin
    if (existingUser.role === 'admin') {
      const allUsers = await listUsers(100);
      const adminUsers = allUsers.filter((user: { role: string }) => user.role === 'admin');

      if (adminUsers.length <= 1) {
        return NextResponse.json({ message: 'Cannot delete the last admin user' }, { status: 403 });
      }
    }

    // Delete the user
    await deleteUser(id);

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Failed to delete user', error: String(error) },
      { status: 500 },
    );
  }
}
