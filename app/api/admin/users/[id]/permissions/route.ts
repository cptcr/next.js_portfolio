// app/api/admin/users/[id]/permissions/route.ts
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

// GET: Get user permissions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
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
    
    // Authorization: Users can view their own permissions, admins can view any permissions
    const canManageUsers = await usersService.hasPermission(currentUser.id, 'canManageUsers');
    
    if (userId !== currentUser.id && !canManageUsers && currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to view these permissions' },
        { status: 403 }
      );
    }
    
    // Get user with permissions
    const user = await usersService.getUserWithPermissions(userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      permissions: user.permissions || null,
    });
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return NextResponse.json(
      { message: 'Failed to get user permissions' },
      { status: 500 }
    );
  }
}

// PUT: Update user permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
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
    
    // Only admins and users with canManageUsers permission can update permissions
    const hasManageUsersPermission = await usersService.hasPermission(currentUser.id, 'canManageUsers');
    
    if (!hasManageUsersPermission && currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to update permissions' },
        { status: 403 }
      );
    }
    
    // Check if user exists
    const targetUser = await usersService.getUserById(userId);
    
    if (!targetUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Regular admins cannot modify other admins' permissions
    if (targetUser.role === 'admin' && currentUser.username !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to modify admin permissions' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { 
      canCreatePosts, 
      canEditOwnPosts, 
      canEditAllPosts, 
      canDeleteOwnPosts, 
      canDeleteAllPosts, 
      canManageUsers, 
      canManageSettings 
    } = body;
    
    // Don't allow non-root admins to grant admin-level permissions
    if (currentUser.role === 'admin' && currentUser.username !== 'admin') {
      if (canEditAllPosts || canDeleteAllPosts || canManageUsers || canManageSettings) {
        return NextResponse.json(
          { message: 'Not authorized to grant admin-level permissions' },
          { status: 403 }
        );
      }
    }
    
    // Update permissions
    const updateData: any = {};
    if (canCreatePosts !== undefined) updateData.canCreatePosts = canCreatePosts;
    if (canEditOwnPosts !== undefined) updateData.canEditOwnPosts = canEditOwnPosts;
    if (canEditAllPosts !== undefined) updateData.canEditAllPosts = canEditAllPosts;
    if (canDeleteOwnPosts !== undefined) updateData.canDeleteOwnPosts = canDeleteOwnPosts;
    if (canDeleteAllPosts !== undefined) updateData.canDeleteAllPosts = canDeleteAllPosts;
    if (canManageUsers !== undefined) updateData.canManageUsers = canManageUsers;
    if (canManageSettings !== undefined) updateData.canManageSettings = canManageSettings;
    
    const updatedPermissions = await usersService.updatePermissions(userId, updateData);
    
    return NextResponse.json({
      permissions: updatedPermissions,
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return NextResponse.json(
      { message: 'Failed to update user permissions' },
      { status: 500 }
    );
  }
}