// app/api/v1/users/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { apiAuthMiddleware } from '@/lib/middleware/apiAuth';
import { getUserById, updateUser, deleteUser } from '@/lib/services/users';

// GET: Get user by ID (protected by API key with readUsers permission)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return apiAuthMiddleware(
    request,
    async (req, apiKeyId) => {
      try {
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

        return NextResponse.json({ user: safeUser });
      } catch (error) {
        console.error('Error getting user via API:', error);
        return NextResponse.json(
          { message: 'Failed to get user', error: String(error) },
          { status: 500 },
        );
      }
    },
    { requiredPermissions: ['readUsers'] },
  );
}

// PUT: Update user (protected by API key with writeUsers permission)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return apiAuthMiddleware(
    request,
    async (req, apiKeyId) => {
      try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
          return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }

        // Parse request body
        const body = await req.json();
        const { username, email, password, realName, role } = body;

        // Check if user exists
        const existingUser = await getUserById(id);
        if (!existingUser) {
          return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Prepare updates
        const updates: any = {};
        if (username) updates.username = username;
        if (email) updates.email = email;
        if (password) updates.password = password;
        if (realName !== undefined) updates.realName = realName;
        if (role) updates.role = role;

        // Update user
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
        console.error('Error updating user via API:', error);
        return NextResponse.json(
          { message: 'Failed to update user', error: String(error) },
          { status: 500 },
        );
      }
    },
    { requiredPermissions: ['writeUsers'] },
  );
}

// DELETE: Delete user (protected by API key with writeUsers permission)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return apiAuthMiddleware(
    request,
    async (req, apiKeyId) => {
      try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
          return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await getUserById(id);
        if (!existingUser) {
          return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Delete the user
        await deleteUser(id);

        return NextResponse.json({
          message: 'User deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting user via API:', error);
        return NextResponse.json(
          { message: 'Failed to delete user', error: String(error) },
          { status: 500 },
        );
      }
    },
    { requiredPermissions: ['writeUsers'] },
  );
}
