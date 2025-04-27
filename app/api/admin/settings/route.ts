// app/api/admin/settings/route.ts
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { settingsService } from "@/lib/services/settings";

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

// Middleware to verify authentication
async function verifyAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "Missing or invalid authorization header" };
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = verify(token, JWT_SECRET);
    return { authenticated: true, username: (payload as any).username, userId: (payload as any).userId, role: (payload as any).role };
  } catch (error) {
    return { authenticated: false, error: "Invalid or expired token" };
  }
}

// Get all settings
export async function GET(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      );
    }
    
    // Get all settings
    const settings = await settingsService.getAllSettings();
    
    return NextResponse.json({
      settings
    });
  } catch (error) {
    console.error("Error getting settings:", error);
    return NextResponse.json(
      { message: "Failed to get settings", error: String(error) },
      { status: 500 }
    );
  }
}

// Update settings
export async function PUT(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Update settings
    await settingsService.setMultipleSettings(body);
    
    return NextResponse.json({
      message: "Settings updated successfully"
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { message: "Failed to update settings", error: String(error) },
      { status: 500 }
    );
  }
}