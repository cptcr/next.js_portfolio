// app/api/admin/verify/route.ts

import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { usersService } from "@/lib/services/users"

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me"
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    console.log("Authorization Header:", authHeader)
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Missing or invalid authorization header" },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7)
    console.log("Token:", token)
    
    const payload = verify(token, JWT_SECRET)
    console.log("Decoded Payload:", payload)
    
    const username = (payload as any).username
    console.log("Looking for user with username:", username)

    const user = await usersService.getUserByUsername(username)
    console.log("User found:", user)
    
    if (!user) {
      return NextResponse.json(
        { valid: false, message: "User not found" },
        { status: 401 }
      )
    }
    
    const userWithPermissions = await usersService.getUserWithPermissions(user.id)
    
    return NextResponse.json({ 
      valid: true,
      username,
      role: user.role,
      permissions: userWithPermissions?.permissions || null
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { valid: false, message: "Invalid or expired token" },
      { status: 401 }
    )
  }
}
