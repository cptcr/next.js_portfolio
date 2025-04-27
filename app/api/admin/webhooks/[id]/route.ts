// app/api/admin/webhooks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { discordService } from '@/lib/services/discord';
import { usersService } from '@/lib/services/users';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';

// Middleware to verify authentication
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing or invalid authorization header',
    };
  }

  const token = authHeader.substring(7);

  try {
    const payload = verify(token, JWT_SECRET);
    return {
      authenticated: true,
      username: (payload as any).username,
      userId: (payload as any).userId,
      role: (payload as any).role,
    };
  } catch (error) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }
}

// GET: Get a single webhook by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid webhook ID' }, { status: 400 });
    }

    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user has permission to manage settings
    const canManageSettings =
      auth.role === 'admin' || (await usersService.hasPermission(auth.userId, 'canManageSettings'));

    if (!canManageSettings) {
      return NextResponse.json(
        { message: 'You do not have permission to view webhooks' },
        { status: 403 },
      );
    }

    // Get webhook
    const webhook = await discordService.getWebhookById(id);

    if (!webhook) {
      return NextResponse.json({ message: 'Webhook not found' }, { status: 404 });
    }

    return NextResponse.json({ webhook });
  } catch (error) {
    console.error(`Error getting webhook ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to get webhook', error: String(error) },
      { status: 500 },
    );
  }
}

// PUT: Update a webhook
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid webhook ID' }, { status: 400 });
    }

    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user has permission to manage settings
    const canManageSettings =
      auth.role === 'admin' || (await usersService.hasPermission(auth.userId, 'canManageSettings'));

    if (!canManageSettings) {
      return NextResponse.json(
        { message: 'You do not have permission to update webhooks' },
        { status: 403 },
      );
    }

    // Check if webhook exists
    const existingWebhook = await discordService.getWebhookById(id);

    if (!existingWebhook) {
      return NextResponse.json({ message: 'Webhook not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { name, url, avatar, enabled, categories } = body;

    // Create update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (url !== undefined) {
      // Validate URL format
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

    // Update webhook
    const updatedWebhook = await discordService.updateWebhook(id, updateData);

    return NextResponse.json({
      webhook: updatedWebhook,
      message: 'Webhook updated successfully',
    });
  } catch (error) {
    console.error(`Error updating webhook ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update webhook', error: String(error) },
      { status: 500 },
    );
  }
}

// DELETE: Delete a webhook
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid webhook ID' }, { status: 400 });
    }

    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user has permission to manage settings
    const canManageSettings =
      auth.role === 'admin' || (await usersService.hasPermission(auth.userId, 'canManageSettings'));

    if (!canManageSettings) {
      return NextResponse.json(
        { message: 'You do not have permission to delete webhooks' },
        { status: 403 },
      );
    }

    // Check if webhook exists
    const existingWebhook = await discordService.getWebhookById(id);

    if (!existingWebhook) {
      return NextResponse.json({ message: 'Webhook not found' }, { status: 404 });
    }

    // Delete webhook
    await discordService.deleteWebhook(id);

    return NextResponse.json({
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    console.error(`Error deleting webhook ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete webhook', error: String(error) },
      { status: 500 },
    );
  }
}
