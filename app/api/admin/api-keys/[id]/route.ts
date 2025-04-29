// app/api/admin/api-keys/[id]/route.ts

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

// Middleware to check if user can manage the API key
async function canManageKey(auth: any, keyId: number) {
  if (!auth.authenticated) {
    return { allowed: false, error: auth.error };
  }

  // Admin can manage all keys
  if (auth.role === 'admin') {
    return { allowed: true };
  }

  // Check if user has permission to manage API keys
  const canManageApiKeys = await hasPermission(auth.userId, 'canManageApiKeys');
  if (!canManageApiKeys) {
    return { allowed: false, error: 'Not authorized to manage API keys' };
  }

  // Get the API key to check ownership
  const apiKey = await apiKeysService.getApiKeyById(keyId);
  if (!apiKey) {
    return { allowed: false, error: 'API key not found' };
  }

  // Check if the API key belongs to the user
  if (apiKey.userId !== auth.userId) {
    return { allowed: false, error: 'Not authorized to manage this API key' };
  }

  return { allowed: true, apiKey };
}

// GET: Get a specific API key by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid API key ID' }, { status: 400 });
    }

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user can manage this key
    const { allowed, error, apiKey } = await canManageKey(auth, id);
    if (!allowed) {
      return NextResponse.json({ message: error }, { status: 403 });
    }

    // If the key was already retrieved in canManageKey, use it
    const keyData = apiKey || (await apiKeysService.getApiKeyById(id));
    if (!keyData) {
      return NextResponse.json({ message: 'API key not found' }, { status: 404 });
    }

    // Return the API key (without the hash)
    return NextResponse.json({
      apiKey: {
        ...keyData,
        key: undefined,
      },
    });
  } catch (error) {
    console.error('Error getting API key:', error);
    return NextResponse.json(
      { message: 'Failed to get API key', error: String(error) },
      { status: 500 },
    );
  }
}

// PUT: Update an API key
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid API key ID' }, { status: 400 });
    }

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user can manage this key
    const { allowed, error } = await canManageKey(auth, id);
    if (!allowed) {
      return NextResponse.json({ message: error }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, permissions, enabled, expiresAt } = body;

    // Prepare updates
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (permissions !== undefined) updates.permissions = permissions;
    if (enabled !== undefined) updates.enabled = enabled;

    // Parse expiration date if provided
    if (expiresAt !== undefined) {
      if (expiresAt === null) {
        updates.expiresAt = null;
      } else {
        const expDate = new Date(expiresAt);
        if (isNaN(expDate.getTime())) {
          return NextResponse.json({ message: 'Invalid expiration date' }, { status: 400 });
        }
        updates.expiresAt = expDate;
      }
    }

    // Update the API key
    const updatedKey = await apiKeysService.updateApiKey(id, updates);
    if (!updatedKey) {
      return NextResponse.json({ message: 'API key not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'API key updated successfully',
      apiKey: {
        ...updatedKey,
        key: undefined,
      },
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { message: 'Failed to update API key', error: String(error) },
      { status: 500 },
    );
  }
}

// DELETE: Delete an API key
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid API key ID' }, { status: 400 });
    }

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user can manage this key
    const { allowed, error } = await canManageKey(auth, id);
    if (!allowed) {
      return NextResponse.json({ message: error }, { status: 403 });
    }

    // Delete the API key
    await apiKeysService.deleteApiKey(id);

    return NextResponse.json({
      message: 'API key deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { message: 'Failed to delete API key', error: String(error) },
      { status: 500 },
    );
  }
}
