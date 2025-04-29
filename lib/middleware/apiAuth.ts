// lib/middleware/apiAuth.ts

import { NextRequest, NextResponse } from 'next/server';
import { apiKeysService } from '../services/apiKeys';
import { headers } from 'next/headers';

// API authentication middleware
export async function apiAuthMiddleware(
  req: NextRequest,
  handler: (req: NextRequest, apiKeyId?: number) => Promise<NextResponse>,
): Promise<NextResponse> {
  const startTime = Date.now();
  let apiKeyId: number | undefined = undefined;
  let responseStatus = 200;

  try {
    // Get API key from headers
    const apiKey = req.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key. Please provide your API key in the x-api-key header.' },
        { status: 401 },
      );
    }

    // Validate API key
    const validation = await apiKeysService.validateApiKey(apiKey);

    if (!validation.valid || !validation.apiKey) {
      return NextResponse.json({ error: 'Invalid or expired API key.' }, { status: 401 });
    }

    apiKeyId = validation.apiKey.id;

    // Check endpoint permissions
    const permissions = validation.permissions || {};
    const path = req.nextUrl.pathname;
    const method = req.method;

    // Basic permission check logic - can be expanded
    if (path.startsWith('/api/v1/posts')) {
      if (method === 'GET' && !permissions.readPosts) {
        return NextResponse.json(
          { error: 'API key does not have permission to read posts.' },
          { status: 403 },
        );
      }

      if (['POST', 'PUT', 'DELETE'].includes(method) && !permissions.writePosts) {
        return NextResponse.json(
          { error: 'API key does not have permission to write posts.' },
          { status: 403 },
        );
      }
    }

    if (path.startsWith('/api/v1/users')) {
      if (method === 'GET' && !permissions.readUsers) {
        return NextResponse.json(
          { error: 'API key does not have permission to read users.' },
          { status: 403 },
        );
      }

      if (['POST', 'PUT', 'DELETE'].includes(method) && !permissions.writeUsers) {
        return NextResponse.json(
          { error: 'API key does not have permission to write users.' },
          { status: 403 },
        );
      }
    }

    // Admin-only endpoints
    if (path.startsWith('/api/v1/admin') && !permissions.admin) {
      return NextResponse.json(
        { error: 'API key does not have admin permissions.' },
        { status: 403 },
      );
    }

    // If all permission checks pass, call the handler
    const response = await handler(req, apiKeyId);
    responseStatus = response.status;

    return response;
  } catch (error) {
    console.error('API authentication error:', error);
    responseStatus = 500;

    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 },
    );
  } finally {
    // Log API usage
    try {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const headersList = await headers();

      await apiKeysService.logApiUsage({
        apiKeyId,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        statusCode: responseStatus,
        responseTime,
        requestIp: headersList.get('x-real-ip') || headersList.get('x-forwarded-for') || 'unknown',
        userAgent: headersList.get('user-agent') || undefined,
      });
    } catch (logError) {
      console.error('Error logging API usage:', logError);
    }
  }
}
