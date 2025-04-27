// app/api/admin/posts/route.ts

import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { postsService } from '@/lib/services/posts';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';

// Middleware to verify authentication
async function verifyAuth(request: Request) {
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

export async function POST(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { title, excerpt, category, content, date, featured } = body;

    // Validate required fields
    if (!title || !excerpt || !category || !content) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Create post using database service
    const post = await postsService.createPost({
      title,
      excerpt,
      category,
      content,
      featured: featured || false,
      authorId: auth.userId,
      publishedAt: date ? new Date(date) : new Date(),
    });

    // Return success
    return NextResponse.json({
      message: 'Post created successfully',
      slug: post.slug,
      id: post.id,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { message: 'Failed to create post', error: String(error) },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || undefined;
    const searchTerm = url.searchParams.get('search') || undefined;
    const featured =
      url.searchParams.get('featured') === 'true'
        ? true
        : url.searchParams.get('featured') === 'false'
          ? false
          : undefined;
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 10;
    const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : 0;

    // Get posts from database service
    const posts = await postsService.listPosts({
      category,
      featured,
      searchTerm,
      limit,
      offset,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { message: 'Failed to fetch posts', error: String(error) },
      { status: 500 },
    );
  }
}
