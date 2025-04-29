// app/api/admin/api-keys/[id]/logs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { apiKeysService } from '@/lib/services/apiKeys';
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

// Middleware to check if user can access the API key logs
async function canAccessKeyLogs(auth: any, keyId: number) {
  if (!auth.authenticated) {
    return { allowed: false, error: auth.error };
  }

  // Admin can access all logs
  if (auth.role === 'admin') {
    return { allowed: true };
  }

  // Check if user has permission to manage API keys
  const canManageApiKeys = await hasPermission(auth.userId, 'canManageApiKeys');
  if (!canManageApiKeys) {
    return { allowed: false, error: 'Not authorized to access API key logs' };
  }

  // Get the API key to check ownership
  const apiKey = await apiKeysService.getApiKeyById(keyId);
  if (!apiKey) {
    return { allowed: false, error: 'API key not found' };
  }

  // Check if the API key belongs to the user
  if (apiKey.userId !== auth.userId) {
    return { allowed: false, error: 'Not authorized to access logs for this API key' };
  }

  return { allowed: true, apiKey };
}

// GET: Get logs for a specific API key
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

    // Check if user can access logs for this key
    const { allowed, error } = await canAccessKeyLogs(auth, id);
    if (!allowed) {
      return NextResponse.json({ message: error }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Parse date range if provided
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (searchParams.get('startDate')) {
      startDate = new Date(searchParams.get('startDate')!);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json({ message: 'Invalid start date' }, { status: 400 });
      }
    }

    if (searchParams.get('endDate')) {
      endDate = new Date(searchParams.get('endDate')!);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json({ message: 'Invalid end date' }, { status: 400 });
      }
    }

    // Get logs for the API key
    const logs = await apiKeysService.getApiLogs({
      apiKeyId: id,
      limit,
      offset,
      startDate,
      endDate,
    });

    // Get usage statistics
    const stats = await apiKeysService.getApiUsageStats({
      apiKeyId: id,
      startDate,
      endDate,
    });

    return NextResponse.json({
      logs,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: logs.length === limit,
      },
    });
  } catch (error) {
    console.error('Error getting API key logs:', error);
    return NextResponse.json(
      { message: 'Failed to get API key logs', error: String(error) },
      { status: 500 },
    );
  }
}
