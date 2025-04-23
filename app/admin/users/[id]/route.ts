// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth';
import { usersService } from '@/lib/services/users';

// GET: Get user by ID
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
    const currentUser = await authService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Authorization: Users can view their own profile, admins can view any profile
    const canManageUsers = await usersService.hasPermission(currentUser.id, 'canManageUsers');
    
    if (userId !== currentUser.id && !canManageUsers && currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to view this user' },
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
    
    // Return sanitized user data
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        realName: user.realName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        permissions: user.permissions,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { message: 'Failed to get user' },
      { status: 500 }
    );
  }
}

// PUT: Update a user
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
    
    // Authorization: Users can update their own profile, admins can update any profile
    const canManageUsers = await usersService.hasPermission(currentUser.id, 'canManageUsers');
    
    if (userId !== currentUser.id && !canManageUsers && currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to update this user' },
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
    const { email, password, realName, role, avatarUrl, bio } = body;
    
    // Only admin can change role
    if (role && role !== user.role && currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to change user role' },
        { status: 403 }
      );
    }
    
    // Update user
    const updateData: any = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (realName !== undefined) updateData.realName = realName;
    if (role) updateData.role = role;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (bio !== undefined) updateData.bio = bio;
    
    const updatedUser = await usersService.updateUser(userId, updateData);
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Failed to update user' },
        { status: 500 }
      );
    }
    
    // Return sanitized user data
    return NextResponse.json({
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        realName: updatedUser.realName,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        bio: updatedUser.bio,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a user
export async function DELETE(
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
    
    // Only admins can delete users
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to delete users' },
        { status: 403 }
      );
    }
    
    // Prevent deleting yourself
    if (userId === currentUser.id) {
      return NextResponse.json(
        { message: 'Cannot delete your own account' },
        { status: 400 }
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
    
    // Delete user
    await usersService.deleteUser(userId);
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
