// app/api/admin/url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { z } from 'zod';
import { urlShortenerService } from '@/lib/services/urlShortener';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';

// Validation schema for URL shortening
const createShortUrlSchema = z.object({
  originalUrl: z.string().url('Must be a valid URL'),
  expiresIn: z.string().optional(), // e.g., "1h", "12h", "1d", "7d"
  isPublic: z.boolean().default(false),
  customId: z.string().optional(),
});

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
    if (typeof userId !== 'number') {
      throw new Error('Invalid user ID in token payload');
    }

    return {
      authenticated: true,
      userId: userId,
    };
  } catch (error) {
    return { authenticated: false, error: 'Invalid or expired token', userId: undefined };
  }
}

// GET: List all short URLs for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const includeExpired = searchParams.get('includeExpired') === 'true';

    // Get URLs from service
    const urls = await urlShortenerService.listShortUrls({
      userId: auth.userId,
      limit,
      offset,
      includeExpired,
    });

    // Return the URLs
    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Error listing short URLs:', error);
    return NextResponse.json(
      { message: 'Failed to list short URLs', error: String(error) },
      { status: 500 },
    );
  }
}

// POST: Create a new short URL
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate request
    const result = createShortUrlSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: result.error.errors },
        { status: 400 },
      );
    }

    const { originalUrl, expiresIn, isPublic, customId } = result.data;

    // Create the short URL
    const shortUrl = await urlShortenerService.createShortUrl(originalUrl, {
      userId: auth.userId,
      expiresIn,
      isPublic,
      customId,
    });

    // Return the created short URL
    return NextResponse.json({
      message: 'Short URL created successfully',
      url: shortUrl,
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { message: 'Failed to create short URL', error: String(error) },
      { status: 500 },
    );
  }
}

// DELETE: Delete a short URL
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'number') {
      return NextResponse.json({ message: 'Invalid URL ID' }, { status: 400 });
    }

    // Delete the short URL
    const deleted = await urlShortenerService.deleteShortUrl(id, auth.userId);

    if (!deleted) {
      return NextResponse.json(
        { message: 'Short URL not found or you do not have permission to delete it' },
        { status: 404 },
      );
    }

    // Return success
    return NextResponse.json({ message: 'Short URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting short URL:', error);
    return NextResponse.json(
      { message: 'Failed to delete short URL', error: String(error) },
      { status: 500 },
    );
  }
}
