// app/api/admin/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { discordService } from '@/lib/services/discord';
import { usersService } from '@/lib/services/users';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

// Middleware to verify authentication
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "Missing or invalid authorization header" };
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = verify(token, JWT_SECRET);
    return { 
      authenticated: true, 
      username: (payload as any).username, 
      userId: (payload as any).userId, 
      role: (payload as any).role 
    };
  } catch (error) {
    return { authenticated: false, error: "Invalid or expired token" };
  }
}

// GET: List all webhooks
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      );
    }
    
    // Check if user has permission to manage settings
    const canManageSettings = auth.role === 'admin' || await usersService.hasPermission(auth.userId, 'canManageSettings');
    
    if (!canManageSettings) {
      return NextResponse.json(
        { message: "You do not have permission to manage webhooks" },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { name, url, avatar, enabled = true, categories } = body;
    
    // Validate required fields
    if (!name || !url) {
      return NextResponse.json(
        { message: "Name and URL are required" },
        { status: 400 }
      );
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { message: "Invalid URL format" },
        { status: 400 }
      );
    }
    
    // Create webhook
    const webhook = await discordService.createWebhook({
      name,
      url,
      avatar,
      enabled,
      categories: categories || null,
    });
    
    return NextResponse.json({
      webhook,
      message: "Webhook created successfully",
    });
  } catch (error) {
    console.error("Error creating webhook:", error);
    return NextResponse.json(
      { message: "Failed to create webhook", error: String(error) },
      { status: 500 }
    );
  }
}