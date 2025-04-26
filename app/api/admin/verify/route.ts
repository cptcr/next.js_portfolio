// app/api/admin/verify/route.ts

import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { usersService } from "@/lib/services/users"

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me"

export async function GET(request: Request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Missing or invalid authorization header" },
        { status: 401 }
      )
    }
    
    // Extract token
    const token = authHeader.substring(7)
    
    // Verify token
    const payload = verify(token, JWT_SECRET)
    const username = (payload as any).username
    
    // Verify that the user exists
    const user = await usersService.getUserByUsername(username)
    
    if (!user) {
      return NextResponse.json(
        { valid: false, message: "User not found" },
        { status: 401 }
      )
    }
    
    // Get user permissions
    const userWithPermissions = await usersService.getUserWithPermissions(user.id)
    
    // Return success with user information
    return NextResponse.json({ 
      valid: true,
      username,
      role: user.role,
      permissions: userWithPermissions?.permissions || null
    })
  } catch (error) {
    // Token verification failed
    console.error("Verification error:", error)
    return NextResponse.json(
      { valid: false, message: "Invalid or expired token" },
      { status: 401 }
    )
  }
}