// app/api/admin/users/[id]/permissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth';
import { usersService } from '@/lib/services/users';

// GET: Get user permissions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // app/api/admin/users/[id]/permissions/route.ts (continued)
    try {
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    // Authenticate
    const currentUser = await authService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
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
    const currentUser = await authService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Only admins and users with canManageUsers permission can update permissions
    const canManageUsers = await usersService.hasPermission(currentUser.id, 'canManageUsers');
    
    if (!canManageUsers && currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to update permissions' },
        { status: 403 }
      );
    }
    
    // Check if user exists
    const user = await usersService.getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
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
    
    // Don't allow non-admins to grant admin-level permissions
    if (currentUser.role !== 'admin') {
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