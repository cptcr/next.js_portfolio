// app/api/admin/users/[id]/permissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verify } from "jsonwebtoken";
import { usersService } from '@/lib/services/users'; // Assuming usersService is correctly implemented

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

// Helper function to verify authentication from Authorization header
async function verifyAuth(request: NextRequest): Promise<{ authenticated: boolean; username?: string; error?: string }> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // console.log('[verifyAuth] Missing or invalid authorization header');
    return { authenticated: false, error: "Missing or invalid authorization header" };
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  if (!token) {
      // console.log('[verifyAuth] Token is empty after removing prefix');
      return { authenticated: false, error: "Missing token" };
  }

  try {
    const payload = verify(token, JWT_SECRET);
    if (typeof payload === 'object' && payload !== null && 'username' in payload) {
        // console.log(`[verifyAuth] Token verified for username: ${payload.username}`);
        return {
          authenticated: true,
          username: payload.username as string
        };
    } else {
        console.error('[verifyAuth] Invalid token payload structure:', payload);
        return { authenticated: false, error: "Invalid token payload" };
    }
  } catch (error: any) {
    // Log specific JWT errors
     if (error.name === 'TokenExpiredError') {
        console.error('[verifyAuth] Token verification failed: Token expired at', new Date(error.expiredAt * 1000));
    } else if (error.name === 'JsonWebTokenError') {
        console.error('[verifyAuth] Token verification failed: Invalid token -', error.message);
    } else {
        console.error('[verifyAuth] Error verifying token:', error);
    }
    return {
      authenticated: false,
      error: "Invalid or expired token"
    };
  }
}

// GET: Get user permissions
export async function GET(
  request: NextRequest,
  // Use the standard destructuring method directly
  { params }: { params: { id: string } }
) {
  // console.log(`[GET /api/.../permissions] Handler invoked. Params received.`); // Keep logs minimal

  try {
    // Access params.id directly after destructuring
    const userIdString = params.id;
    // console.log(`[GET] Accessed params.id: ${userIdString}`);

    const userId = parseInt(userIdString);
    if (isNaN(userId)) {
      console.log(`[GET] Invalid user ID format after parsing: ${userIdString}`);
      return NextResponse.json(
        { message: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    // console.log(`[GET] Parsed userId: ${userId}`);

    // Authenticate the request
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.username) {
      return NextResponse.json({ message: auth.error || 'Not authenticated' }, { status: 401 });
    }
    // Fetch current user
    const currentUser = await usersService.getUserByUsername(auth.username);
    if (!currentUser) {
      return NextResponse.json({ message: 'Authenticated user not found' }, { status: 404 });
    }
    // Authorization check
    const canManageUsers = await usersService.hasPermission(currentUser.id, 'canManageUsers');
    if (userId !== currentUser.id && !canManageUsers && currentUser.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized to view these permissions' }, { status: 403 });
    }
    // Fetch target user
    const targetUser = await usersService.getUserWithPermissions(userId);
    if (!targetUser) {
      return NextResponse.json({ message: 'Target user not found' }, { status: 404 });
    }
    // Return permissions
    return NextResponse.json({ permissions: targetUser.permissions || null });

  } catch (error) {
    console.error(`[GET] Error getting user permissions:`, error);
    return NextResponse.json(
      { message: 'Failed to get user permissions due to server error' },
      { status: 500 }
    );
  }
}

// PUT: Update user permissions
export async function PUT(
  request: NextRequest,
  // Use the standard destructuring method directly
  { params }: { params: { id: string } }
) {
  // console.log(`[PUT /api/.../permissions] Handler invoked. Params received.`); // Keep logs minimal

  try {
    // Access params.id directly after destructuring
    const userIdString = params.id;
    // console.log(`[PUT] Accessed params.id: ${userIdString}`);

    const userId = parseInt(userIdString);
     if (isNaN(userId)) {
       console.log(`[PUT] Invalid user ID format after parsing: ${userIdString}`);
      return NextResponse.json(
        { message: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    // console.log(`[PUT] Parsed userId: ${userId}`);

    // Authenticate the request
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.username) {
      return NextResponse.json({ message: auth.error || 'Not authenticated' }, { status: 401 });
    }
     // Fetch current user
    const currentUser = await usersService.getUserByUsername(auth.username);
    if (!currentUser) {
      return NextResponse.json({ message: 'Authenticated user not found' }, { status: 404 });
    }
    // Authorization Check 1
    const hasManageUsersPermission = await usersService.hasPermission(currentUser.id, 'canManageUsers');
    if (!hasManageUsersPermission && currentUser.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized to update permissions' }, { status: 403 });
    }
    // Fetch target user
    const targetUser = await usersService.getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ message: 'Target user not found' }, { status: 404 });
    }
    // Authorization Check 2
    if (targetUser.role === 'admin' && currentUser.username !== 'admin') {
      return NextResponse.json({ message: 'Not authorized to modify admin permissions' }, { status: 403 });
    }
    // Parse body
    const body = await request.json();
    const { canCreatePosts, canEditOwnPosts, canEditAllPosts, canDeleteOwnPosts, canDeleteAllPosts, canManageUsers, canManageSettings } = body;
    // Authorization Check 3 (Allow all admins)
    const isTryingToGrantAdminPermissions = canEditAllPosts || canDeleteAllPosts || canManageUsers || canManageSettings;
    if (currentUser.role !== 'admin' && isTryingToGrantAdminPermissions) {
        console.log(`[PUT] Authorization failed: User ${currentUser.username} (Role: ${currentUser.role}) cannot grant admin-level permissions.`);
        return NextResponse.json({ message: 'Not authorized to grant admin-level permissions' }, { status: 403 });
    }
    // Prepare update data
    const updateData: { [key: string]: boolean } = {};
    if (canCreatePosts !== undefined) updateData.canCreatePosts = !!canCreatePosts;
    if (canEditOwnPosts !== undefined) updateData.canEditOwnPosts = !!canEditOwnPosts;
    if (canEditAllPosts !== undefined) updateData.canEditAllPosts = !!canEditAllPosts;
    if (canDeleteOwnPosts !== undefined) updateData.canDeleteOwnPosts = !!canDeleteOwnPosts;
    if (canDeleteAllPosts !== undefined) updateData.canDeleteAllPosts = !!canDeleteAllPosts;
    if (canManageUsers !== undefined) updateData.canManageUsers = !!canManageUsers;
    if (canManageSettings !== undefined) updateData.canManageSettings = !!canManageSettings;
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'No permission data provided to update' }, { status: 400 });
    }
    // Update permissions
    const updatedPermissions = await usersService.updatePermissions(userId, updateData);
    if (!updatedPermissions) {
        console.error(`[PUT] Failed to update permissions for user ID: ${userId}. usersService.updatePermissions returned null/falsy.`);
         return NextResponse.json({ message: 'Failed to update permissions in database' }, { status: 500 });
    }
    // Return updated permissions
    return NextResponse.json({ permissions: updatedPermissions });

  } catch (error) {
    console.error(`[PUT] Error updating user permissions:`, error);
    return NextResponse.json(
      { message: 'Failed to update user permissions due to server error' },
      { status: 500 }
    );
  }
}
