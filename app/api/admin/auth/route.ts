// app/api/admin/auth/route.ts

import { NextResponse } from "next/server"
import { sign } from "jsonwebtoken"

// Constants and types
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me"
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password"

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

    // Validate credentials
    if (
      username !== ADMIN_USERNAME ||
      password !== ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = sign(
      { username },
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