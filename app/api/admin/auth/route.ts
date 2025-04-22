// app/api/admin/auth/route.ts

import { NextResponse } from "next/server"
import { sign } from "jsonwebtoken"
import { verifyCredentials } from "@/lib/auth/credentials"
import { JwtPayload } from "@/lib/types/auth"

// Constants and types
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me"

// JWT token expiration (1 day)
const TOKEN_EXPIRATION = "1d"

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    const { username, password } = body

    // Check if credentials are provided
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      )
    }

    // Validate credentials using our credential management system
    const isValid = await verifyCredentials(username, password)
    
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Create JWT token with proper payload type
    const payload: JwtPayload = { username }
    const token = sign(
      payload,
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    )

    // Return success with token
    return NextResponse.json({ token })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    )
  }
}