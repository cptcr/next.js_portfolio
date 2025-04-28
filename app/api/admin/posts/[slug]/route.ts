// app/api/admin/posts/[slug]/route.ts

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

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    // Get slug from params
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
    }

    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Get post from database service
    const post = await postsService.getPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { message: 'Failed to fetch post', error: String(error) },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  try {
    // Get slug from params
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
    }

    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { title, excerpt, category, content, date, featured } = body;

    // Get post to check if exists and get ID
    const existingPost = await postsService.getPostBySlug(slug);

    if (!existingPost) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Update post
    const updatedPost = await postsService.updatePost(
      existingPost.id,
      {
        title,
        excerpt,
        category,
        content,
        featured,
        publishedAt: date ? new Date(date) : undefined,
      },
      auth.userId,
    );

    return NextResponse.json({
      message: 'Post updated successfully',
      post: updatedPost,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { message: 'Failed to update post', error: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  try {
    // Get slug from params
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
    }

    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Get post to check if exists and get ID
    const existingPost = await postsService.getPostBySlug(slug);

    if (!existingPost) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Delete post
    await postsService.deletePost(existingPost.id, auth.userId);

    return NextResponse.json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { message: 'Failed to delete post', error: String(error) },
      { status: 500 },
    );
  }
}
