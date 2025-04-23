// app/api/admin/verify/route.ts

import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

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
    
    // Return success
    return NextResponse.json({ 
      valid: true,
      username: (payload as any).username
    })
  } catch (error) {
    // Token verification failed
    return NextResponse.json(
      { valid: false, message: "Invalid or expired token" },
      { status: 401 }
    )
  }
}