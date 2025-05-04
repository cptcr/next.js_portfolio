// app/api/v1/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { apiAuthMiddleware } from '@/lib/middleware/apiAuth';
import { getUserByUsername, createUser, listUsers } from '@/lib/services/users';

// GET: List users (protected by API key with readUsers permission)
export async function GET(request: NextRequest) {
  return apiAuthMiddleware(
    request,
    async (req, apiKeyId) => {
      try {
        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

        // Get users
        const users = await listUsers(limit, offset);

        // Remove sensitive information
        const safeUsers = users.map((user: { [x: string]: any; password: any }) => {
          const { password, ...safeUser } = user;
          return safeUser;
        });

        return NextResponse.json({ users: safeUsers });
      } catch (error) {
        console.error('Error listing users via API:', error);
        return NextResponse.json(
          { message: 'Failed to list users', error: String(error) },
          { status: 500 },
        );
      }
    },
    { requiredPermissions: ['readUsers'] },
  );
}

// POST: Create a new user (protected by API key with writeUsers permission)
export async function POST(request: NextRequest) {
  return apiAuthMiddleware(
    request,
    async (req, apiKeyId) => {
      try {
        // Parse request body
        const body = await req.json();
        const { username, email, password, realName, role } = body;

        // Validate required fields
        if (!username || !email || !password) {
          return NextResponse.json(
            { message: 'Username, email, and password are required' },
            { status: 400 },
          );
        }

        // Check if username already exists
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
          return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
        }

        // Create the user
        const user = await createUser({
          username,
          email,
          password,
          realName: realName || null,
          role: role || 'user',
        });

        // Remove password from response
        const { password: _, ...safeUser } = user;

        return NextResponse.json({
          message: 'User created successfully',
          user: safeUser,
        });
      } catch (error) {
        console.error('Error creating user via API:', error);
        return NextResponse.json(
          { message: 'Failed to create user', error: String(error) },
          { status: 500 },
        );
      }
    },
    { requiredPermissions: ['writeUsers'] },
  );
}
