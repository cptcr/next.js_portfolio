// app/api/admin/api-keys/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { apiKeysService, ApiKeyPermissions } from '@/lib/services/apiKeys';
import { hasPermission } from '@/lib/services/users';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';

// Verify authentication middleware
async function verifyAuth(request: NextRequest) {
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

// GET: List all API keys for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user can manage API keys
    const canManageApiKeys = await hasPermission(auth.userId, 'canManageApiKeys');

    // Admins can see all keys, but users with canManageApiKeys can only see their own
    const isAdmin = auth.role === 'admin';

    // Get user ID from query params (only admins can filter by user)
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');
    let userId = auth.userId;

    // If admin is requesting keys for another user
    if (userIdParam && isAdmin) {
      userId = parseInt(userIdParam, 10);
      if (isNaN(userId)) {
        return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
      }
    } else if (userIdParam && !isAdmin) {
      return NextResponse.json(
        { message: "Not authorized to view other users' keys" },
        { status: 403 },
      );
    }

    // Get API keys
    if (!isAdmin && !canManageApiKeys) {
      return NextResponse.json({ message: 'Not authorized to manage API keys' }, { status: 403 });
    }

    const apiKeys = await apiKeysService.listApiKeys(userId);

    return NextResponse.json({
      apiKeys: apiKeys.map((key) => ({
        ...key,
        key: undefined, // Don't expose the hash
      })),
    });
  } catch (error) {
    console.error('Error listing API keys:', error);
    return NextResponse.json(
      { message: 'Failed to list API keys', error: String(error) },
      { status: 500 },
    );
  }
}

// POST: Create a new API key
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user can create API keys
    const canCreateApiKeys = await hasPermission(auth.userId, 'canCreateApiKeys');
    if (auth.role !== 'admin' && !canCreateApiKeys) {
      return NextResponse.json({ message: 'Not authorized to create API keys' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, permissions, expiresAt, userId: targetUserId } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ message: 'API key name is required' }, { status: 400 });
    }

    // Only admins can create keys for other users
    let userId = auth.userId;
    if (targetUserId && auth.role === 'admin') {
      userId = targetUserId;
    }

    // Parse expiration date if provided
    let expDate: Date | undefined = undefined;
    if (expiresAt) {
      expDate = new Date(expiresAt);
      if (isNaN(expDate.getTime())) {
        return NextResponse.json({ message: 'Invalid expiration date' }, { status: 400 });
      }
    }

    // Create the API key
    const result = await apiKeysService.createApiKey(
      userId,
      name,
      permissions as ApiKeyPermissions,
      expDate,
    );

    return NextResponse.json({
      message: 'API key created successfully',
      apiKey: {
        id: result.apiKey.id,
        name: result.apiKey.name,
        prefix: result.apiKey.prefix,
        permissions: result.apiKey.permissions,
        expiresAt: result.apiKey.expiresAt,
        createdAt: result.apiKey.createdAt,
      },
      key: result.plainTextKey, // Full key is only returned once
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { message: 'Failed to create API key', error: String(error) },
      { status: 500 },
    );
  }
}
