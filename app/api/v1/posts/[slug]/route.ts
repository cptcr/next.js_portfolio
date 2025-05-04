import { NextResponse, NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { postsService } from '@/lib/services/posts';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';
type SlugParams = { params: Promise<{ slug: string }> };

// Shared authentication logic
async function verifyAuth(request: NextRequest | Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or invalid authorization header', userId: null };
  }
  const token = authHeader.substring(7);
  try {
    const payload = verify(token, JWT_SECRET);
    // Ensure userId is extracted correctly and is a number
    const userId = (payload as any)?.userId;
    if (typeof userId !== 'number') {
      throw new Error('Invalid user ID in token payload');
    }
    return {
      authenticated: true,
      userId: userId, // Return only userId if that's all needed downstream
    };
  } catch (error) {
    return { authenticated: false, error: 'Invalid or expired token', userId: null };
  }
}

// GET Handler
export async function GET(request: NextRequest, context: SlugParams) {
  console.log(`>>> ENTERING GET /api/admin/posts/[slug]`);
  try {
    // Do an await operation before accessing params
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Now it's safe to access params
    const { slug } = await context.params;
    console.log(`>>> GET slug accessed: ${slug}`);

    if (!slug) {
      return NextResponse.json({ message: 'Slug parameter is missing' }, { status: 400 });
    }

    const post = await postsService.getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }
    // Return only the necessary post data
    return NextResponse.json(post);
  } catch (error) {
    console.error(`Error fetching post (admin):`, error);
    return NextResponse.json(
      { message: 'Failed to fetch post', error: String(error) },
      { status: 500 },
    );
  }
}

// PUT Handler
export async function PUT(request: NextRequest, context: SlugParams) {
  console.log(`>>> ENTERING PUT /api/admin/posts/[slug]`);
  try {
    // Do an await operation before accessing params
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { message: auth.error || 'Authentication failed or User ID missing' },
        { status: 401 },
      );
    }

    // Now it's safe to access params
    const { slug } = await context.params;
    console.log(`>>> PUT slug accessed: ${slug}`);

    if (!slug) {
      return NextResponse.json({ message: 'Slug parameter is missing' }, { status: 400 });
    }

    const body = await request.json();
    const { title, excerpt, category, content, date, featured } = body;

    const existingPost = await postsService.getPostBySlug(slug);
    if (!existingPost) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

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
      auth.userId, // Use validated userId
    );

    return NextResponse.json({ message: 'Post updated successfully', post: updatedPost });
  } catch (error) {
    console.error(`Error updating post (admin):`, error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      return NextResponse.json(
        { message: 'Permission denied', error: error.message },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { message: 'Failed to update post', error: String(error) },
      { status: 500 },
    );
  }
}

// DELETE Handler
export async function DELETE(request: NextRequest, context: SlugParams) {
  console.log(`>>> ENTERING DELETE /api/admin/posts/[slug]`);
  try {
    // Do an await operation before accessing params
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { message: auth.error || 'Authentication failed or User ID missing' },
        { status: 401 },
      );
    }

    // Now it's safe to access params
    const { slug } = await context.params;
    console.log(`>>> DELETE slug accessed: ${slug}`);

    if (!slug) {
      console.error('>>> DELETE handler missing slug in params');
      return NextResponse.json({ message: 'Slug parameter is missing' }, { status: 400 });
    }

    const existingPost = await postsService.getPostBySlug(slug);
    if (!existingPost) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    await postsService.deletePost(existingPost.id, auth.userId); // Use validated userId

    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting post (admin):`, error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      return NextResponse.json(
        { message: 'Permission denied', error: error.message },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { message: 'Failed to delete post', error: String(error) },
      { status: 500 },
    );
  }
}
