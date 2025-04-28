// app/api/admin/webhooks/[id]/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/utils/admin-service'; // Assuming this path is correct
import { db } from '@/lib/db/postgres'; // Assuming this path is correct
import { discordWebhooks } from '@/lib/db/schema'; // Assuming this path is correct
import { eq } from 'drizzle-orm';

// POST: Test a webhook
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication first
    const authHeader = request.headers.get('authorization');
    const auth = await verifyAuthToken(authHeader);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // --- Correctly await params before accessing properties ---
    const resolvedParams = await params; // Await the params object itself
    const id = parseInt(resolvedParams.id); // Access id on the resolved object
    // --- End of fix ---

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid webhook ID' }, { status: 400 });
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
        text: `Sent by ${auth.username}`, // Use authenticated username
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
        username: webhook.name || 'Test Notification', // Use webhook name or default
        avatar_url: webhook.avatar || undefined, // Use webhook avatar or none
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Discord webhook error response: ${errorText}`); // Log Discord's specific error
      throw new Error(`Discord webhook error: ${response.status} ${response.statusText}`);
    }

    return NextResponse.json({
      message: 'Test message sent successfully',
    });
  } catch (error) {
    console.error(`Error testing webhook:`, error);
    // Provide a more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : 'Failed to send test message';
    return NextResponse.json(
      { message: errorMessage, error: String(error) },
      { status: 500 },
    );
  }
}