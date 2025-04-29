// app/api/admin/webhooks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/utils/admin-service'; // Assuming this path is correct
import { db } from '@/lib/db/postgres'; // Assuming this path is correct
import { discordWebhooks } from '@/lib/db/schema'; // Assuming this path is correct
import { eq } from 'drizzle-orm';

type WebhookUpdateData = {
  name?: string;
  url?: string;
  avatar?: string | null;
  enabled?: boolean;
  categories?: string[] | null;
  updatedAt?: Date;
};

// GET: Get a single webhook by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // --- Correctly await params before accessing properties ---
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    // --- End of fix ---

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

    return NextResponse.json({ webhook });
  } catch (error) {
    // Log with resolved ID if possible, otherwise use original params
    const errorId =
      typeof params === 'object' && params !== null && 'id' in params ? params.id : 'unknown ID';
    console.error(`Error getting webhook ${errorId}:`, error);
    return NextResponse.json(
      { message: 'Failed to get webhook', error: String(error) },
      { status: 500 },
    );
  }
}

// PUT: Update a webhook
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // --- Correctly await params before accessing properties ---
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    // --- End of fix ---

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid webhook ID' }, { status: 400 });
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const auth = await verifyAuthToken(authHeader);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if webhook exists
    const [existingWebhook] = await db
      .select()
      .from(discordWebhooks)
      .where(eq(discordWebhooks.id, id));

    if (!existingWebhook) {
      return NextResponse.json({ message: 'Webhook not found' }, { status: 404 });
    }

    // Parse request body
    const body: WebhookUpdateData = await request.json();
    const { name, url, avatar, enabled, categories } = body;

    // Create update object with only provided fields
    const updateData: WebhookUpdateData = {};
    if (name !== undefined) updateData.name = name;
    if (url !== undefined) {
      // Validate URL format if provided
      try {
        new URL(url);
        updateData.url = url;
      } catch (e) {
        return NextResponse.json({ message: 'Invalid URL format' }, { status: 400 });
      }
    }
    if (avatar !== undefined) updateData.avatar = avatar;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (categories !== undefined) updateData.categories = categories;

    // Add updated timestamp
    updateData.updatedAt = new Date();

    // Update webhook in database
    const [updatedWebhook] = await db
      .update(discordWebhooks)
      .set(updateData)
      .where(eq(discordWebhooks.id, id))
      .returning();

    return NextResponse.json({
      webhook: updatedWebhook,
      message: 'Webhook updated successfully',
    });
  } catch (error) {
    // Log with resolved ID if possible, otherwise use original params
    const errorId =
      typeof params === 'object' && params !== null && 'id' in params ? params.id : 'unknown ID';
    console.error(`Error updating webhook ${errorId}:`, error);
    return NextResponse.json(
      { message: 'Failed to update webhook', error: String(error) },
      { status: 500 },
    );
  }
}

// DELETE: Delete a webhook
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // --- Correctly await params before accessing properties ---
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    // --- End of fix ---

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid webhook ID' }, { status: 400 });
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const auth = await verifyAuthToken(authHeader);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if webhook exists (optional, but good practice before delete)
    const [existingWebhook] = await db
      .select({ id: discordWebhooks.id })
      .from(discordWebhooks)
      .where(eq(discordWebhooks.id, id));

    if (!existingWebhook) {
      // You might choose to return success even if not found, or a 404
      return NextResponse.json({ message: 'Webhook not found' }, { status: 404 });
      // return NextResponse.json({ message: 'Webhook already deleted or never existed' });
    }

    // Delete webhook from database
    await db.delete(discordWebhooks).where(eq(discordWebhooks.id, id));

    return NextResponse.json({
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    // Log with resolved ID if possible, otherwise use original params
    const errorId =
      typeof params === 'object' && params !== null && 'id' in params ? params.id : 'unknown ID';
    console.error(`Error deleting webhook ${errorId}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete webhook', error: String(error) },
      { status: 500 },
    );
  }
}
