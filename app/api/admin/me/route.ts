// app/api/admin/me/route.ts
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { usersService } from "@/lib/services/users";

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

// Get current user information
export async function GET(request: Request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }
    
    // Extract token
    const token = authHeader.substring(7);
    
    // Verify token
    const payload = verify(token, JWT_SECRET) as { username: string };
    const username = payload.username;
    
    // Get user with permissions
    const user = await usersService.getUserByUsername(username);
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    
    // Get permissions
    const userWithPermissions = await usersService.getUserWithPermissions(user.id);
    
    // Return user data and permissions
    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      realName: user.realName,
      role: user.role,
      permissions: userWithPermissions?.permissions
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    return NextResponse.json(
      { message: "Failed to get user information", error: String(error) },
      { status: 500 }
    );
  }
}