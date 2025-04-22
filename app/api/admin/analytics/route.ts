import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { list } from '@vercel/blob';
import matter from 'gray-matter';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

// Middleware to verify authentication
async function verifyAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "Missing or invalid authorization header" };
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = verify(token, JWT_SECRET);
    return { authenticated: true, username: (payload as any).username };
  } catch (error) {
    return { authenticated: false, error: "Invalid or expired token" };
  }
}

// Function to fetch post metadata from Vercel Blob
async function getPostsMetadata() {
  try {
    // Get all blobs with the posts/ prefix
    const { blobs } = await list({ prefix: 'posts/' });
    
    if (blobs.length === 0) {
      return [];
    }

    // Process each blob to extract metadata
    const postsMetadata = await Promise.all(
      blobs.map(async (blob) => {
        try {
          // Extract slug from the pathname
          const slug = blob.pathname.replace(/^posts\/|\.md$/g, '');
          
          // Fetch the markdown content
          const response = await fetch(blob.url);
          const fileContents = await response.text();

          // Parse metadata with gray-matter
          const { data } = matter(fileContents);
          
          return {
            slug,
            title: data.title || 'Untitled',
            date: data.date || '',
            category: data.category || 'Uncategorized',
            featured: data.featured || false,
            url: blob.url,
            createdAt: blob.uploadedAt,
            size: blob.size
          };
        } catch (err) {
          console.error(`Error processing blob ${blob.url}:`, err);
          return null;
        }
      })
    );

    // Filter out any null values and sort by date (latest first)
    return postsMetadata
      .filter(Boolean)
      .sort((a, b) => new Date(b?.date).getTime() - new Date(a?.date).getTime());
  } catch (error) {
    console.error("Error fetching posts metadata:", error);
    throw error;
  }
}

function calculatePostStats(posts: any[], period = 'month') {
  // Calculate number of days in the period
  const days = period === 'day' ? 1 : period === 'week' ? 7 : 30;
  
  // Calculate period start date
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - days);
  
  // Count posts created in the current period
  const postsInPeriod = posts.filter(post => new Date(post.createdAt) >= periodStart);
  
  // Calculate post creation stats
  const totalPosts = posts.length;
  const newPosts = postsInPeriod.length;
  
  // Calculate average stats
  const averagePostSize = posts.reduce((acc, post) => acc + post.size, 0) / totalPosts || 0;
  
  // Count posts by category
  const categoryCounts: Record<string, number> = {};
  posts.forEach(post => {
    const category = post.category || 'Uncategorized';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  return {
    totalPosts,
    newPosts,
    averagePostSize,
    categoryCounts,
    categories: Object.keys(categoryCounts).map(name => ({
      name,
      count: categoryCounts[name],
      percentage: Math.round((categoryCounts[name] / totalPosts) * 100)
    }))
  };
}

// Format post data by date for charts
function formatPostsByDate(posts: any[], period = 'month') {
  // Determine the number of data points based on period
  const dataPoints = period === 'day' ? 24 : period === 'week' ? 7 : 30;
  
  // Initialize result array with dates and zero counts
  const result: { date: string; count: number; }[] = [];
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date();
    if (period === 'day') {
      date.setHours(date.getHours() - (dataPoints - i - 1));
      date.setMinutes(0, 0, 0);
    } else {
      date.setDate(date.getDate() - (dataPoints - i - 1));
      date.setHours(0, 0, 0, 0);
    }
    
    result.push({
      date: date.toISOString(),
      count: 0
    });
  }
  
  // Count posts for each date
  posts.forEach(post => {
    const postDate = new Date(post.date);
    
    // Find the matching date entry and increment the count
    const entry = result.find(item => {
      const itemDate = new Date(item.date);
      if (period === 'day') {
        return itemDate.getFullYear() === postDate.getFullYear() &&
               itemDate.getMonth() === postDate.getMonth() &&
               itemDate.getDate() === postDate.getDate() &&
               itemDate.getHours() === postDate.getHours();
      } else {
        return itemDate.getFullYear() === postDate.getFullYear() &&
               itemDate.getMonth() === postDate.getMonth() &&
               itemDate.getDate() === postDate.getDate();
      }
    });
    
    if (entry) {
      entry.count++;
    }
  });
  
  return result;
}

export async function GET(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'overview';
    const period = url.searchParams.get('period') as 'day' | 'week' | 'month' || 'month';
    
    // Fetch posts metadata first
    const posts = await getPostsMetadata();
    
    // Prepare response based on requested data type
    let responseData;
    
    switch (type) {
      case 'overview':
        // General blog statistics
        responseData = calculatePostStats(posts, period);
        break;
        
      case 'posts':
        // Return posts list with metadata
        const limit = parseInt(url.searchParams.get('limit') || '10');
        responseData = posts.slice(0, limit);
        break;
        
      case 'timeline':
        // Posts creation over time
        responseData = formatPostsByDate(posts, period);
        break;
        
      case 'categories':
        // Category distribution
        const stats = calculatePostStats(posts);
        responseData = stats.categories;
        break;
        
      case 'featured':
        // Featured posts
        responseData = posts.filter(post => post?.featured);
        break;
        
      default:
        return NextResponse.json(
          { message: "Invalid analytics type requested" },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ data: responseData });
    
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { message: "Failed to fetch analytics data", error: String(error) },
      { status: 500 }
    );
  }
}