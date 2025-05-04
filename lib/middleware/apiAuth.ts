// lib/middleware/apiAuth.ts

import { NextRequest, NextResponse } from 'next/server';
// Assuming ApiKeyPermissions is exported from apiKeys service or a shared types file
import { apiKeysService, ApiKeyPermissions } from '../services/apiKeys';

// Define the handler signature - expecting the User ID
type ApiHandler = (req: NextRequest, userId: number) => Promise<NextResponse>;

// Remove the local ApiKeyPermissions definition here

export async function apiAuthMiddleware(
  req: NextRequest,
  handler: ApiHandler,
  options: { requiredPermissions?: string[] } = {},
): Promise<NextResponse> {
  const startTime = Date.now();
  let responseStatus = 200;
  let logApiKeyId: number | undefined = undefined;
  let logUserId: number | undefined = undefined;

  try {
    // Get API key from headers
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      // ... (return 401) ...
      return NextResponse.json(
        { error: 'Missing API key. Please provide your API key in the x-api-key header.' },
        { status: 401 },
      );
    }

    // Validate API key - Must return an object like { valid: boolean; apiKey?: { id: number; userId: number; ... }; permissions?: ApiKeyPermissions }
    const validation = await apiKeysService.validateApiKey(apiKey);

    // Check validation result, apiKey object, AND the presence and type of userId
    if (!validation.valid || !validation.apiKey || typeof validation.apiKey.userId !== 'number') {
      console.error('API Key validation failed or userId missing/invalid:', validation);
      return NextResponse.json(
        { error: 'Invalid API key, or key is not associated with a user.' },
        { status: 401 },
      );
    }

    // Extract the correct User ID and the API Key ID
    const userId = validation.apiKey.userId;
    logApiKeyId = validation.apiKey.id;
    logUserId = userId;

    // --- Permission Checks ---
    // Use the imported ApiKeyPermissions type
    const permissions: ApiKeyPermissions = validation.permissions || {};
    const requiredPermissions = options.requiredPermissions || [];
    let hasAllPermissions = true;

    for (const perm of requiredPermissions) {
      // FIX: Keep type assertion because the original ApiKeyPermissions type lacks an index signature
      if (!(permissions as Record<string, any>)[perm]) {
        hasAllPermissions = false;
        break;
      }
    }

    if (!hasAllPermissions) {
      return NextResponse.json(
        { error: `API key lacks required permissions: ${requiredPermissions.join(', ')}` },
        { status: 403 },
      );
    }
    // --- End Permission Checks ---

    // Call the handler, passing the correct USER ID
    const response = await handler(req, userId);
    responseStatus = response.status;

    return response;
  } catch (error) {
    console.error('API authentication middleware error:', error);
    responseStatus = 500;
    return NextResponse.json(
      { error: 'An internal error occurred during authentication.' },
      { status: 500 },
    );
  } finally {
    // Log API usage
    try {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const requestHeaders = req.headers;

      await apiKeysService.logApiUsage({
        apiKeyId: logApiKeyId,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        statusCode: responseStatus,
        responseTime,
        requestIp:
          requestHeaders.get('x-real-ip') || requestHeaders.get('x-forwarded-for') || 'unknown',
        userAgent: requestHeaders.get('user-agent') || undefined,
      });
    } catch (logError) {
      console.error('Error logging API usage:', logError);
    }
  }
}
