import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { put, list, del } from '@vercel/blob';
import { slugify } from "@/lib/utils/helpers"

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me"

// Middleware to verify authentication
async function verifyAuth(request: Request) {
  const authHeader = request.headers.get("authorization")
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "Missing or invalid authorization header" }
  }
  
  const token = authHeader.substring(7)
  
  try {
    const payload = verify(token, JWT_SECRET)
    return { authenticated: true, username: (payload as any).username }
  } catch (error) {
    return { authenticated: false, error: "Invalid or expired token" }
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request)
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { title, excerpt, category, content, date, featured } = body
    
    // Validate required fields
    if (!title || !excerpt || !category || !content) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Generate slug from title
    const slug = slugify(title)
    
    // Create markdown content
    const markdownContent = `---
title: "${title}"
date: "${date || new Date().toISOString()}"
excerpt: "${excerpt}"
category: "${category}"
featured: ${featured || false}
---

${content}
`
    
    // Upload to Vercel Blob
    const blob = await put(`posts/${slug}.md`, markdownContent, {
      contentType: 'text/markdown',
      access: 'public', // or 'private' if you prefer
    });
    
    // Return success
    return NextResponse.json({
      message: "Post created successfully",
      slug,
      url: blob.url
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      { message: "Failed to create post", error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request)
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      )
    }
    
    // List all blobs in the 'posts' directory
    const { blobs } = await list({ prefix: 'posts/' });
    
    // Process each blob to get post data
    const posts = await Promise.all(
      blobs.map(async (blob) => {
        try {
          // Fetch the content
          const response = await fetch(blob.url);
          const content = await response.text();
          
          // Extract slug from path
          const slug = blob.pathname.replace(/^posts\/|\.md$/g, '');
          
          // Extract frontmatter
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
          const frontmatter = frontmatterMatch?.[1] || '';
          
          // Parse frontmatter
          const titleMatch = frontmatter.match(/title: "([^"]*)"/);
          const dateMatch = frontmatter.match(/date: "([^"]*)"/);
          const excerptMatch = frontmatter.match(/excerpt: "([^"]*)"/);
          const categoryMatch = frontmatter.match(/category: "([^"]*)"/);
          const featuredMatch = frontmatter.match(/featured: (true|false)/);
          
          return {
            slug,
            title: titleMatch?.[1] || 'Untitled',
            date: dateMatch?.[1] || '',
            excerpt: excerptMatch?.[1] || '',
            category: categoryMatch?.[1] || '',
            featured: featuredMatch?.[1] === 'true',
            url: blob.url
          };
        } catch (err) {
          console.error(`Error processing blob ${blob.url}:`, err);
          return null;
        }
      })
    );
    
    // Filter out any failed processing and sort by date
    const validPosts = posts.filter(Boolean)
      .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime());
    
    return NextResponse.json({ posts: validPosts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { message: "Failed to fetch posts", error: String(error) },
      { status: 500 }
    );
  }
}