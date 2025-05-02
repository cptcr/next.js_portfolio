// app/api/admin/users/[id]/permissions/route.ts
import { NextResponse, NextRequest } from 'next/server'; // Import NextRequest
import { verify } from 'jsonwebtoken';
import {
  getUserWithPermissions,
  updatePermissions,
  hasPermission,
  getUserById,
} from '@/lib/services/users'; // Assuming paths are correct

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';

// Middleware to verify authentication (Consider moving to dedicated middleware file)
async function verifyAuth(request: NextRequest) {
  // Use NextRequest here
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing or invalid authorization header',
      username: null, // Ensure properties exist on error return
      userId: null,
      role: null,
    };
  }

  const token = authHeader.substring(7);

  try {
    const payload = verify(token, JWT_SECRET);
    // Add type safety if possible for the payload
    return {
      authenticated: true,
      username: (payload as any).username,
      userId: (payload as any).userId,
      role: (payload as any).role,
    };
  } catch (error) {
    return {
      authenticated: false,
      error: 'Invalid or expired token',
      username: null,
      userId: null,
      role: null,
    };
  }
}

// Get user permissions
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated || !auth.userId) {
      // Check userId existence
      return NextResponse.json({ message: auth.error || 'Authentication failed' }, { status: 401 });
    }

    // Check if user has permission to manage users
    if (auth.role !== 'admin' && !(await hasPermission(auth.userId, 'canManageUsers'))) {
      return NextResponse.json(
        { message: 'You do not have permission to view user permissions' },
        { status: 403 },
      );
    }

    // --- Correctly await params THEN access properties ---
    const resolvedParams = await params; // Step 1: Await the params object
    const id = parseInt(resolvedParams.id); // Step 2: Access id on the result
    // --- End of fix ---

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    // Get user with permissions
    const userWithPermissions = await getUserWithPermissions(id);

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
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated || !auth.userId) {
      // Check userId existence
      return NextResponse.json({ message: auth.error || 'Authentication failed' }, { status: 401 });
    }

    // Check if user has permission to manage users
    if (auth.role !== 'admin' && !(await hasPermission(auth.userId, 'canManageUsers'))) {
      return NextResponse.json(
        { message: 'You do not have permission to update user permissions' },
        { status: 403 },
      );
    }

    // --- Correctly await params THEN access properties ---
    const resolvedParams = await params; // Step 1: Await the params object
    const id = parseInt(resolvedParams.id); // Step 2: Access id on the result
    // --- End of fix ---

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    // Parse request body
    // Consider adding validation for the body structure (e.g., using Zod)
    const body = await request.json();

    // Check if user exists
    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update permissions
    const updatedPermissions = await updatePermissions(id, body);

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
