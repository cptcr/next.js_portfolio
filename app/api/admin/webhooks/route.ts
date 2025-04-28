// app/api/admin/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/utils/admin-service';
import { discordWebhooks, db } from '@/lib/db/postgres';
import { eq } from 'drizzle-orm';

type WebhookBodyData = {
  name: string;
  url: string;
  avatar?: string;
  enabled?: boolean;
  categories?: string[] | null;
};

// GET: List all webhooks
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const auth = await verifyAuthToken(authHeader);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Get all webhooks from database
    const webhooks = await db.select().from(discordWebhooks);

    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error('Error listing webhooks:', error);
    return NextResponse.json(
      { message: 'Failed to list webhooks', error: String(error) },
      { status: 500 },
    );
  }
}

// POST: Create a new webhook
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const auth = await verifyAuthToken(authHeader);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Parse request body
    const body: WebhookBodyData = await request.json();
    const { name, url, avatar, enabled = true, categories } = body;

    // Validate required fields
    if (!name || !url) {
      return NextResponse.json({ message: 'Name and URL are required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json({ message: 'Invalid URL format' }, { status: 400 });
    }

    // Insert webhook into database
    const [webhook] = await db
      .insert(discordWebhooks)
      .values({
        name,
        url,
        avatar: avatar || null,
        enabled,
        categories: categories || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      webhook,
      message: 'Webhook created successfully',
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { message: 'Failed to create webhook', error: String(error) },
      { status: 500 },
    );
  }
}