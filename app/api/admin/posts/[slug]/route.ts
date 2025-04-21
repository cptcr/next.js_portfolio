// app/api/admin/posts/[slug]/route.ts

import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import fs from "fs"
import path from "path"

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me"
const POSTS_DIRECTORY = path.join(process.cwd(), "posts")

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

export async function DELETE(
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
    
    // Check if file exists
    const filePath = path.join(POSTS_DIRECTORY, `${slug}.md`)
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      )
    }
    
    // Delete the file
    fs.unlinkSync(filePath)
    
    // Return success
    return NextResponse.json({
      message: "Post deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { message: "Failed to delete post", error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(
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
    
    // Check if file exists
    const filePath = path.join(POSTS_DIRECTORY, `${slug}.md`)
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      )
    }
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // Parse frontmatter and content
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/)
    const frontmatter = frontmatterMatch?.[1] || ''
    const postContent = content.replace(/^---\n[\s\S]*?\n---\n/, '')
    
    // Parse frontmatter
    const titleMatch = frontmatter.match(/title: "([^"]*)"/)
    const dateMatch = frontmatter.match(/date: "([^"]*)"/)
    const excerptMatch = frontmatter.match(/excerpt: "([^"]*)"/)
    const categoryMatch = frontmatter.match(/category: "([^"]*)"/)
    const featuredMatch = frontmatter.match(/featured: (true|false)/)
    
    // Return post data
    return NextResponse.json({
      slug,
      title: titleMatch?.[1] || '',
      date: dateMatch?.[1] || '',
      excerpt: excerptMatch?.[1] || '',
      category: categoryMatch?.[1] || '',
      featured: featuredMatch?.[1] === 'true',
      content: postContent
    })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { message: "Failed to fetch post", error: String(error) },
      { status: 500 }
    )
  }
}