// app/api/url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { urlShortenerService } from '@/lib/services/urlShortener';

// Validation schema for public URL shortening
const createPublicShortUrlSchema = z.object({
  originalUrl: z.string().url('Must be a valid URL'),
  expiresIn: z.enum(['1h', '12h', '1d', '7d']).default('1d'),
});

// Rate limiting variables
const IP_RATE_LIMIT = 10; // Max requests per hour per IP
const ipRequests: { [ip: string]: { count: number; resetTime: number } } = {};

// Simple rate limiting middleware
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;

  // Initialize or reset if expired
  if (!ipRequests[ip] || ipRequests[ip].resetTime < now) {
    ipRequests[ip] = {
      count: 1,
      resetTime: now + hourInMs,
    };
    return true;
  }

  // Increment and check
  ipRequests[ip].count++;
  return ipRequests[ip].count <= IP_RATE_LIMIT;
}

// POST: Create a new public short URL
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: 'Rate limit exceeded. Try again later.' },
        { status: 429 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request
    const result = createPublicShortUrlSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: result.error.errors },
        { status: 400 },
      );
    }

    const { originalUrl, expiresIn } = result.data;

    // Create the short URL (no user ID for public URLs)
    const shortUrl = await urlShortenerService.createShortUrl(originalUrl, {
      expiresIn,
      isPublic: true,
    });

    // Get the base URL for the full short URL
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const fullShortUrl = `${protocol}://${host}/${shortUrl.shortId}`;

    // Return the created short URL
    return NextResponse.json({
      message: 'Short URL created successfully',
      shortUrl: fullShortUrl,
      originalUrl: shortUrl.originalUrl,
      expiresAt: shortUrl.expiresAt,
    });
  } catch (error) {
    console.error('Error creating public short URL:', error);
    return NextResponse.json(
      { message: 'Failed to create short URL', error: String(error) },
      { status: 500 },
    );
  }
}
