// app/api/v1/posts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { apiAuthMiddleware } from '@/lib/middleware/apiAuth';
import { postsService } from '@/lib/services/posts';

// GET: List posts (protected by API key)
export async function GET(request: NextRequest) {
  return apiAuthMiddleware(
    request,
    async (req, apiKeyId) => {
      try {
        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
        const category = searchParams.get('category') || undefined;
        const searchTerm = searchParams.get('search') || undefined;
        const featured = searchParams.has('featured')
          ? searchParams.get('featured') === 'true'
          : undefined;

        // Get posts
        const posts = await postsService.listPosts({
          limit,
          offset,
          category,
          searchTerm,
          featured,
        });

        // Get total count for pagination
        const totalCount = await postsService.countPosts({
          category,
          searchTerm,
          featured,
        });

        return NextResponse.json({
          posts,
          pagination: {
            limit,
            offset,
            total: totalCount,
            hasMore: offset + posts.length < totalCount,
          },
        });
      } catch (error) {
        console.error('Error fetching posts via API:', error);
        return NextResponse.json(
          { message: 'Failed to fetch posts', error: String(error) },
          { status: 500 }
        );
      }
    },
    { requiredPermissions: ['readPosts'] }
  );
}

// POST: Create a post (protected by API key with write permission)
export async function POST(request: NextRequest) {
  return apiAuthMiddleware(
    request,
    async (req, apiKeyId) => {
      try {
        // Parse request body
        const body = await req.json();
        const { title, excerpt, category, content, featured } = body;

        // Validate required fields
        if (!title || !excerpt || !category || !content) {
          return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Get a default author ID (first admin user)
        const defaultAuthorId = apiKeyId || 1; // Use API key ID as author ID if available, otherwise default to 1

        // Create the post
        const post = await postsService.createPost({
          title,
          excerpt,
          category,
          content,
          featured: featured || false,
          authorId: defaultAuthorId,
          publishedAt: new Date(),
        });

        return NextResponse.json({
          message: 'Post created successfully',
          post: {
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            category: post.category,
            featured: post.featured,
            publishedAt: post.publishedAt,
            createdAt: post.createdAt,
          },
        });
      } catch (error) {
        console.error('Error creating post via API:', error);
        return NextResponse.json(
          { message: 'Failed to create post', error: String(error) },
          { status: 500 }
        );
      }
    },
    { requiredPermissions: ['writePosts'] }
  );
}