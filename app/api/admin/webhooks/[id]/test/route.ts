// app/api/admin/webhooks/[id]/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/utils/admin-service';
import { discordWebhooks, db } from '@/lib/db/postgres';
import { eq } from 'drizzle-orm';

// POST: Test a webhook
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid webhook ID' }, { status: 400 });
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const auth = await verifyAuthToken(authHeader);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Get webhook from database
    const [webhook] = await db.select().from(discordWebhooks).where(eq(discordWebhooks.id, id));

    if (!webhook) {
      return NextResponse.json({ message: 'Webhook not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const customMessage = body.message;

    // Default test message if none provided
    const message =
      customMessage ||
      "🔔 This is a test message from your blog admin panel. If you're seeing this, your webhook is working properly!";

    // Create simple embed for the test
    const embed = {
      title: 'Webhook Test',
      description:
        'This is a test notification to verify that your webhook is configured correctly.',
      color: 0x3498db, // Blue
      footer: {
        text: `Sent by ${auth.username}`,
      },
      timestamp: new Date().toISOString(),
    };

    // Send test message to Discord
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
        embeds: [embed],
        username: webhook.name || 'Test Notification',
        avatar_url: webhook.avatar || undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord webhook error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return NextResponse.json({
      message: 'Test message sent successfully',
    });
  } catch (error) {
    console.error(`Error testing webhook:`, error);
    return NextResponse.json(
      { message: 'Failed to send test message', error: String(error) },
      { status: 500 },
    );
  }
}