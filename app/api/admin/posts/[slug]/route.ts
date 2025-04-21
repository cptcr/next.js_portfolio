import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { put, list } from '@vercel/blob';

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

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Get slug from params
    const { slug } = params
    
    if (!slug) {
      return NextResponse.json(
        { message: "Slug is required" },
        { status: 400 }
      )
    }
    
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
    
    // Update the blob - in Vercel Blob, updating is the same as creating,
    // it will overwrite the existing blob with the same path
    const blob = await put(`posts/${slug}.md`, markdownContent, {
      contentType: 'text/markdown',
      access: 'public', // or 'private' if you prefer
    });
    
    // Return success
    return NextResponse.json({
      message: "Post updated successfully",
      slug,
      url: blob.url
    })
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json(
      { message: "Failed to update post", error: String(error) },
      { status: 500 }
    )
  }
}