// app/api/admin/webhooks/[id]/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { discordService } from '@/lib/services/discord';

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

// POST: Test a webhook
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid webhook ID" },
        { status: 400 }
      );
    }
    
    // Verify authentication
    const auth = await verifyAuth(request);
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      );
    }
    
    // Get webhook
    const webhook = await discordService.getWebhookById(id);
    
    if (!webhook) {
      return NextResponse.json(
        { message: "Webhook not found" },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const customMessage = body.message;
    
    // Default test message if none provided
    const message = customMessage || 
      "🔔 This is a test message from your blog admin panel. If you're seeing this, your webhook is working properly!";
    
    // Create simple embed for the test
    const embed = {
      title: "Webhook Test",
      description: "This is a test notification to verify that your webhook is configured correctly.",
      color: 0x3498db, // Blue
      footer: {
        text: `Sent by ${auth.username}`,
      },
      timestamp: new Date().toISOString(),
    };
    
    // Send test message
    await discordService.sendWebhookNotification(
      webhook.url,
      message,
      [embed],
      webhook.name || 'Test Notification',
      webhook.avatar || undefined
    );
    
    return NextResponse.json({
      message: "Test message sent successfully",
    });
  } catch (error) {
    console.error(`Error testing webhook:`, error);
    return NextResponse.json(
      { message: "Failed to send test message", error: String(error) },
      { status: 500 }
    );
  }
}