// app/api/admin/posts/route.ts

import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import fs from "fs"
import path from "path"
import { slugify } from "@/lib/utils/helpers"

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me"
const POSTS_DIRECTORY = path.join(process.cwd(), "posts")

// Ensure posts directory exists
if (!fs.existsSync(POSTS_DIRECTORY)) {
  fs.mkdirSync(POSTS_DIRECTORY, { recursive: true })
}

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
    
    // Check if post with this slug already exists
    const filePath = path.join(POSTS_DIRECTORY, `${slug}.md`)
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: "A post with this title already exists" },
        { status: 409 }
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
    
    // Write to file
    fs.writeFileSync(filePath, markdownContent, "utf-8")
    
    // Return success
    return NextResponse.json({
      message: "Post created successfully",
      slug,
      filePath: `posts/${slug}.md`
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
    
    // Read all markdown files in posts directory
    const files = fs.readdirSync(POSTS_DIRECTORY)
    const posts = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const filePath = path.join(POSTS_DIRECTORY, file)
        const content = fs.readFileSync(filePath, 'utf-8')
        
        // Extract frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/)
        const frontmatter = frontmatterMatch?.[1] || ''
        
        // Parse frontmatter
        const titleMatch = frontmatter.match(/title: "([^"]*)"/)
        const dateMatch = frontmatter.match(/date: "([^"]*)"/)
        const excerptMatch = frontmatter.match(/excerpt: "([^"]*)"/)
        const categoryMatch = frontmatter.match(/category: "([^"]*)"/)
        const featuredMatch = frontmatter.match(/featured: (true|false)/)
        
        return {
          slug: file.replace(/\.md$/, ''),
          title: titleMatch?.[1] || 'Untitled',
          date: dateMatch?.[1] || '',
          excerpt: excerptMatch?.[1] || '',
          category: categoryMatch?.[1] || '',
          featured: featuredMatch?.[1] === 'true',
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { message: "Failed to fetch posts", error: String(error) },
      { status: 500 }
    )
  }
}