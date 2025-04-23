// app/api/admin/change-password/route.ts

import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { verifyCredentials, updateCredentials } from "@/lib/auth/credentials"
import { AuthVerification, PasswordChangeRequest, PasswordChangeResponse } from "@/lib/types/auth"

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me"

// Middleware to verify authentication
async function verifyAuth(request: Request): Promise<AuthVerification> {
  const authHeader = request.headers.get("authorization")
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "Missing or invalid authorization header" }
  }
  
  const token = authHeader.substring(7)
  
  try {
    const payload = verify(token, JWT_SECRET)
    return { 
      authenticated: true, 
      username: (payload as any).username 
    }
  } catch (error) {
    return { 
      authenticated: false, 
      error: "Invalid or expired token" 
    }
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request)
    
    if (!auth.authenticated || !auth.username) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body: PasswordChangeRequest = await request.json()
    const { currentPassword, newPassword, newUsername } = body
    
    // Check if required fields are provided
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required" },
        { status: 400 }
      )
    }
    
    // Verify current password
    const isValid = await verifyCredentials(auth.username, currentPassword)
    
    if (!isValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 }
      )
    }
    
    // Update credentials
    const username = newUsername || auth.username // Use current username if not changing
    const success = await updateCredentials(username, newPassword)
    
    if (!success) {
      return NextResponse.json(
        { message: "Failed to update credentials" },
        { status: 500 }
      )
    }
    
    // Prepare response
    const response: PasswordChangeResponse = { 
      message: "Credentials updated successfully",
      usernameChanged: !!newUsername
    }
    
    // Return success
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error updating credentials:", error)
    return NextResponse.json(
      { message: "Failed to update credentials", error: String(error) },
      { status: 500 }
    )
  }
}