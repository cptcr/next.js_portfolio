// app/api/admin/cleanup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { urlShortenerService } from '@/lib/services/urlShortener';
import { codeSnippetsService } from '@/lib/services/codeSnippets';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';

// Verify auth token middleware
async function verifyAuth(request: NextRequest | Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing or invalid authorization header',
      userId: undefined,
    };
  }

  const token = authHeader.substring(7);
  try {
    const payload = verify(token, JWT_SECRET);
    const userId = (payload as any)?.userId;

    // Check if role is admin
    const role = (payload as any)?.role;
    if (role !== 'admin') {
      return { authenticated: false, error: 'Admin role required', userId: undefined };
    }

    return {
      authenticated: true,
      userId: userId,
    };
  } catch (error) {
    return { authenticated: false, error: 'Invalid or expired token', userId: undefined };
  }
}

/**
 * POST: Run cleanup task to delete expired URLs and code snippets
 * This endpoint can be called manually or by a scheduled task
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication (admin only)
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Clean up expired URLs
    const urlCount = await urlShortenerService.cleanupExpiredUrls();

    // Clean up expired code snippets
    const snippetCount = await codeSnippetsService.cleanupExpiredSnippets();

    // Return counts
    return NextResponse.json({
      message: 'Cleanup completed successfully',
      deletedUrls: urlCount,
      deletedSnippets: snippetCount,
    });
  } catch (error) {
    console.error('Error during cleanup task:', error);
    return NextResponse.json(
      { message: 'Failed to run cleanup task', error: String(error) },
      { status: 500 },
    );
  }
}

/**
 * GET: Get counts of expired items without deleting them
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication (admin only)
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Get current time
    const now = new Date();

    // Count expired URLs
    const expiredUrls = await urlShortenerService.listShortUrls({
      includeExpired: true,
    });
    const urlCount = expiredUrls.filter(
      (url) => url.expiresAt && new Date(url.expiresAt) < now,
    ).length;

    // Count expired code snippets
    const expiredSnippets = await codeSnippetsService.listCodeSnippets({
      includeExpired: true,
    });
    const snippetCount = expiredSnippets.filter(
      (snippet) => snippet.expiresAt && new Date(snippet.expiresAt) < now,
    ).length;

    // Return counts
    return NextResponse.json({
      expiredUrls: urlCount,
      expiredSnippets: snippetCount,
    });
  } catch (error) {
    console.error('Error getting expired item counts:', error);
    return NextResponse.json(
      { message: 'Failed to get expired item counts', error: String(error) },
      { status: 500 },
    );
  }
}
