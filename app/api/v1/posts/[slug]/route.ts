// app/api/v1/posts/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { apiAuthMiddleware } from '@/lib/middleware/apiAuth';
import { postsService } from '@/lib/services/posts';

// GET: Get post by slug (protected by API key)
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  return apiAuthMiddleware(
    request,
    async (req, apiKeyId) => {
      try {
        // Get slug from params
        const { slug } = params;

        if (!slug) {
          return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
        }

        // Get post from database service
        const post = await postsService.getPostBySlug(slug);

        if (!post) {
          return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json({ post });
      } catch (error) {
        console.error('Error fetching post via API:', error);
        return NextResponse.json(
          { message: 'Failed to fetch post', error: String(error) },
          { status: 500 }
        );
      }
    },
    { requiredPermissions: ['readPosts'] }
  );
}

// PUT: Update a post by slug (protected by API key with write permission)
export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  return apiAuthMiddleware(
    request,
    async (req, apiKeyId) => {
      try {
        // Get slug from params
        const { slug } = params;

        if (!slug) {
          return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
        }

        // Get post to check if exists and get ID
        const existingPost = await postsService.getPostBySlug(slug);

        if (!existingPost) {
          return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        // Parse request body
        const body = await req.json();
        const { title, excerpt, category, content, featured, date } = body;

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
          apiKeyId || existingPost.authorId // Fallback to original author if apiKeyId not provided
        );

        return NextResponse.json({
          message: 'Post updated successfully',
          post: updatedPost,
        });
      } catch (error) {
        console.error('Error updating post via API:', error);
        return NextResponse.json(
          { message: 'Failed to update post', error: String(error) },
          { status: 500 }
        );
      }
    },
    { requiredPermissions: ['writePosts'] }
  );
}

// DELETE: Delete a post by slug (protected by API key with write permission)
export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  return apiAuthMiddleware(
    request,
    async (req, apiKeyId) => {
      try {
        // Get slug from params
        const { slug } = params;

        if (!slug) {
          return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
        }

        // Get post to check if exists and get ID
        const existingPost = await postsService.getPostBySlug(slug);

        if (!existingPost) {
          return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        // Delete post
        await postsService.deletePost(
          existingPost.id, 
          apiKeyId || existingPost.authorId // Fallback to original author if apiKeyId not provided
        );

        return NextResponse.json({
          message: 'Post deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting post via API:', error);
        return NextResponse.json(
          { message: 'Failed to delete post', error: String(error) },
          { status: 500 }
        );
      }
    },
    { requiredPermissions: ['writePosts'] }
  );
}