// app/api/admin/users/[id]/route.ts
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

// GET: Get a single user by ID
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
    
    // Authorization: Users can view their own profile, admins can view any profile
    const canManageUsers = await usersService.hasPermission(currentUser.id, 'canManageUsers');
    
    if (userId !== currentUser.id && !canManageUsers && currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to view this user' },
        { status: 403 }
      );
    }
    
    // Get user
    const user = await usersService.getUserById(userId);
    
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
    
    // Authorization: Users can update their own profile, admins can update any profile
    const canManageUsers = await usersService.hasPermission(currentUser.id, 'canManageUsers');
    
    if (userId !== currentUser.id && !canManageUsers && currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to update this user' },
        { status: 403 }
      );
    }
    
    // Get target user
    const targetUser = await usersService.getUserById(userId);
    
    if (!targetUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { username, email, password, realName, role, avatarUrl } = body;
    
    // Special rules for modifying root admin or admins
    // Only root admin can change other users to admin role
    if (role && role !== targetUser.role) {
      // Check if trying to change role to/from admin
      if (role === 'admin' || targetUser.role === 'admin') {
        // Only the root admin can do this
        if (currentUser.role !== 'admin' || currentUser.username !== 'admin') {
          return NextResponse.json(
            { message: 'Not authorized to change admin status' },
            { status: 403 }
          );
        }
      }
    }
    
    // Regular admins cannot modify the root admin
    if (targetUser.role === 'admin' && targetUser.username === 'admin') {
      if (currentUser.id !== targetUser.id) {
        return NextResponse.json(
          { message: 'Not authorized to modify the root admin' },
          { status: 403 }
        );
      }
    }
    
    // Update user data
    const userData: any = {};
    if (username !== undefined && username !== targetUser.username) userData.username = username;
    if (email !== undefined) userData.email = email;
    if (password !== undefined) userData.password = password;
    if (realName !== undefined) userData.realName = realName;
    if (role !== undefined) userData.role = role;
    if (avatarUrl !== undefined) userData.avatarUrl = avatarUrl;
    
    // Perform update
    const updatedUser = await usersService.updateUser(userId, userData);
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Failed to update user' },
        { status: 500 }
      );
    }
    
    // Return updated user data
    return NextResponse.json({
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        realName: updatedUser.realName,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Failed to update user', error: String(error) },
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
    
    // Check if current user is admin or has permission
    const isAdmin = currentUser.role === 'admin';
    const canManageUsers = await usersService.hasPermission(currentUser.id, 'canManageUsers');
    
    if (!isAdmin && !canManageUsers) {
      return NextResponse.json(
        { message: 'Not authorized to delete users' },
        { status: 403 }
      );
    }
    
    // Get target user
    const targetUser = await usersService.getUserById(userId);
    
    if (!targetUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Special rules:
    // 1. Root admin cannot be deleted
    // 2. Only root admin can delete other admins
    // 3. Cannot delete yourself
    
    // Check if trying to delete root admin
    if (targetUser.role === 'admin' && targetUser.username === 'admin') {
      return NextResponse.json(
        { message: 'Cannot delete the root admin' },
        { status: 403 }
      );
    }
    
    // Check if trying to delete an admin
    if (targetUser.role === 'admin') {
      // Only root admin can delete admins
      if (currentUser.username !== 'admin') {
        return NextResponse.json(
          { message: 'Only the root admin can delete admin users' },
          { status: 403 }
        );
      }
    }
    
    // Check if trying to delete own account
    if (userId === currentUser.id) {
      return NextResponse.json(
        { message: 'Cannot delete your own account' },
        { status: 403 }
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
      { message: 'Failed to delete user', error: String(error) },
      { status: 500 }
    );
  }
}