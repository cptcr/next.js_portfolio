// app/api/v1/posts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { apiAuthMiddleware } from '@/lib/middleware/apiAuth'; // Assuming this is correctly set up
import { postsService } from '@/lib/services/posts';

// GET: List posts (protected by API key) - Remains the same
export async function GET(request: NextRequest) {
  // ... (previous GET handler code is likely fine if it works)
  return apiAuthMiddleware(
    request,
    async (req, userId) => {
      // Assuming middleware now passes userId
      // Defensive check: Ensure middleware provided a valid userId
      if (typeof userId !== 'number' || isNaN(userId)) {
        console.error('[API GET /v1/posts] Auth middleware failed to provide valid userId.');
        return NextResponse.json(
          { message: 'Internal Server Error: Invalid authentication context' },
          { status: 500 },
        );
      }
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
          { status: 500 },
        );
      }
    },
    { requiredPermissions: ['readPosts'] }, // Ensure permission check is appropriate
  );
}

// POST: Create a post (protected by API key with write permission)
export async function POST(request: NextRequest) {
  // ***** MODIFICATION *****
  // Assume apiAuthMiddleware validates the key, checks permissions,
  // finds the associated user_id, and passes it as the second argument.
  return apiAuthMiddleware(
    request,
    async (req, userId) => {
      // <--- Renamed parameter for clarity; MUST be the actual User ID
      // Defensive check: Ensure middleware provided a valid userId
      if (typeof userId !== 'number' || isNaN(userId)) {
        console.error('[API POST /v1/posts] Auth middleware failed to provide valid userId.');
        // Return 500 or 401 depending on desired behavior if auth context is broken
        return NextResponse.json(
          { message: 'Authentication Error: User ID not found for API key' },
          { status: 500 },
        );
      }

      try {
        // Parse request body
        const body = await req.json();
        // Include 'date' if your test script sends it, otherwise publishedAt defaults to new Date()
        const { title, excerpt, category, content, featured, date } = body;

        // Validate required fields
        if (!title || !excerpt || !category || !content) {
          return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // *** THE FIX: Use the actual userId from the authenticated API key ***
        const authorId = userId;

        // Create the post using the correct authorId
        const post = await postsService.createPost({
          title,
          excerpt,
          category,
          content,
          featured: featured || false,
          authorId: authorId, // <-- Pass the correct user ID here
          // Use date from payload if available, else current date
          publishedAt: date ? new Date(date) : new Date(),
        });

        // Return a more detailed success response, including the created post object
        return NextResponse.json(
          {
            message: 'Post created successfully',
            post: {
              // Return the created post data matching structure of GET maybe
              id: post.id,
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              category: post.category,
              featured: post.featured,
              publishedAt: post.publishedAt,
              createdAt: post.createdAt,
              authorId: post.authorId, // Include authorId for confirmation
            },
            // Or keep the simpler response if preferred:
            // id: post.id,
            // slug: post.slug
          },
          { status: 201 },
        ); // Use 201 Created status
      } catch (error) {
        console.error('Error creating post via API:', error);
        // Pass the full error string back for easier debugging
        return NextResponse.json(
          { message: 'Failed to create post', error: String(error) },
          { status: 500 },
        );
      }
    },
    // Ensure the permission check is correct for creating posts
    { requiredPermissions: ['writePosts'] },
  );
}
