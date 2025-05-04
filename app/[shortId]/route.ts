// app/[shortId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { urlShortenerService } from '@/lib/services/urlShortener';

export async function GET(
  request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const { shortId } = params;
    
    // Look up the short URL
    const url = await urlShortenerService.getShortUrl(shortId);
    
    // If not found, return 404
    if (!url) {
      return new NextResponse('Short URL not found', { status: 404 });
    }
    
    // Check if the URL has expired
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return new NextResponse('This short URL has expired', { status: 410 }); // Gone
    }
    
    // Record the click (don't await to avoid delaying the redirect)
    urlShortenerService.recordClick(shortId).catch(err => {
      console.error(`Failed to record click for ${shortId}:`, err);
    });
    
    // Redirect to the original URL
    return NextResponse.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error handling short URL redirect:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}