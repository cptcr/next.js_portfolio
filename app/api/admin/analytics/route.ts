// app/api/admin/analytics/route.ts
// Handler for fetching analytics data
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { postsService } from '@/lib/services/posts';
import { usersService } from '@/lib/services/users';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';

// Verify authentication middleware
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

export async function GET(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'overview';
    const period = url.searchParams.get('period') || 'month';

    let data: any = null;

    // Get date range based on period
    let startDate = new Date();
    if (period === 'day') {
      startDate.setDate(startDate.getDate() - 1);
    } else if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }

    // Fetch all posts first
    const allPosts = await postsService.listPosts({ limit: 1000 });

    // Fetch data based on type
    switch (type) {
      case 'overview':
        // Get new posts in period
        const newPosts = allPosts.filter(
          (post: { publishedAt: string | number | Date }) =>
            new Date(post.publishedAt) >= startDate,
        );

        // Calculate average post size (content length)
        const totalSize = allPosts.reduce(
          (sum: any, post: { content: string | any[] }) => sum + post.content.length,
          0,
        );
        const averagePostSize = allPosts.length > 0 ? totalSize / allPosts.length : 0;

        // Get category counts
        const categoryMap: Record<string, number> = {};
        allPosts.forEach((post: { category: string }) => {
          const category = post.category || 'Uncategorized';
          categoryMap[category] = (categoryMap[category] || 0) + 1;
        });

        // Format categories for display
        const categories = Object.entries(categoryMap)
          .map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / allPosts.length) * 100),
          }))
          .sort((a, b) => b.count - a.count);

        data = {
          totalPosts: allPosts.length,
          newPosts: newPosts.length,
          averagePostSize: averagePostSize,
          categoryCounts: categoryMap,
          categories,
        };
        break;

      case 'posts':
        // Format posts for display
        data = allPosts.map(
          (post: {
            slug: any;
            title: any;
            publishedAt: any;
            category: any;
            featured: any;
            createdAt: any;
            content: string | any[];
          }) => ({
            slug: post.slug,
            title: post.title,
            date: post.publishedAt,
            category: post.category || 'Uncategorized',
            featured: post.featured,
            url: `/blog/${post.slug}`,
            createdAt: post.createdAt,
            size: post.content.length,
          }),
        );
        break;

      case 'timeline':
        // Generate timeline data
        const timelineData: { date: string; count: number }[] = [];

        // Set number of intervals based on period
        const intervals = period === 'day' ? 24 : period === 'week' ? 7 : 30;

        // Calculate interval size in milliseconds
        const intervalSize = (Date.now() - startDate.getTime()) / intervals;

        // Create timeline intervals
        for (let i = 0; i < intervals; i++) {
          const intervalStart = new Date(Date.now() - (i + 1) * intervalSize);
          const intervalEnd = new Date(Date.now() - i * intervalSize);

          // Count posts in this interval
          const count = allPosts.filter((post: { publishedAt: string | number | Date }) => {
            const postDate = new Date(post.publishedAt);
            return postDate >= intervalStart && postDate < intervalEnd;
          }).length;

          timelineData.unshift({
            date: intervalStart.toISOString(),
            count,
          });
        }

        data = timelineData;
        break;

      case 'featured':
        // Get featured posts
        const featuredPosts = allPosts.filter((post: { featured: any }) => post.featured);

        // Format posts for display
        data = featuredPosts.map(
          (post: {
            slug: any;
            title: any;
            publishedAt: any;
            category: any;
            featured: any;
            createdAt: any;
            content: string | any[];
          }) => ({
            slug: post.slug,
            title: post.title,
            date: post.publishedAt,
            category: post.category || 'Uncategorized',
            featured: post.featured,
            url: `/blog/${post.slug}`,
            createdAt: post.createdAt,
            size: post.content.length,
          }),
        );
        break;

      default:
        return NextResponse.json({ message: 'Invalid analytics type' }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { message: 'Failed to fetch analytics data', error: String(error) },
      { status: 500 },
    );
  }
}
