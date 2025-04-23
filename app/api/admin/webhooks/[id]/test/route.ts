import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth';
import { discordService } from '@/lib/services/discord';
import { usersService } from '@/lib/services/users';

// POST: Test a webhook by sending a message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const webhookId = parseInt(params.id);
    
    if (isNaN(webhookId)) {
      return NextResponse.json(
        { message: 'Invalid webhook ID' },
        { status: 400 }
      );
    }
    
    // Authenticate
    const currentUser = await authService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Check if user has permission to manage settings
    const canManageSettings = await usersService.hasPermission(currentUser.id, 'canManageSettings');
    
    if (!canManageSettings && currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to test webhooks' },
        { status: 403 }
      );
    }
    
    // Get webhook
    const webhook = await discordService.getWebhookById(webhookId);
    
    if (!webhook) {
      return NextResponse.json(
        { message: 'Webhook not found' },
        { status: 404 }
      );
    }
    
    // Send a test message
    const testMessage = "🔔 This is a test message from your blog. If you're seeing this, your webhook is working properly!";
    
    // Create simple embed for the test
    const embed = {
      title: "Webhook Test",
      description: "This is a test notification to verify that your webhook is configured correctly.",
      color: 0x3498db, // Blue
      footer: {
        text: `Sent by ${currentUser.username}`,
      },
      timestamp: new Date().toISOString(),
    };
    
    await discordService.sendWebhookNotification(
      webhook.url,
      testMessage,
      [embed],
      webhook.name || 'Test Notification',
      webhook.avatar || undefined
    );
    
    return NextResponse.json({
      message: 'Test message sent successfully',
    });
  } catch (error) {
    console.error(`Error testing webhook ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to send test message', error: String(error) },
      { status: 500 }
    );
  }
}