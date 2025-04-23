import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth';
import { discordService } from '@/lib/services/discord';
import { usersService } from '@/lib/services/users';

// GET: Get a webhook by ID
export async function GET(
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
        { message: 'Not authorized to view webhooks' },
        { status: 403 }
      );
    }
    
    const webhook = await discordService.getWebhookById(webhookId);
    
    if (!webhook) {
      return NextResponse.json(
        { message: 'Webhook not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ webhook });
  } catch (error) {
    console.error(`Error getting webhook ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to get webhook' },
      { status: 500 }
    );
  }
}

// PUT: Update a webhook
export async function PUT(
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
        { message: 'Not authorized to update webhooks' },
        { status: 403 }
      );
    }
    
    // Check if webhook exists
    const existingWebhook = await discordService.getWebhookById(webhookId);
    
    if (!existingWebhook) {
      return NextResponse.json(
        { message: 'Webhook not found' },
        { status: 404 }
      );
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
        return NextResponse.json(
          { message: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }
    if (avatar !== undefined) updateData.avatar = avatar;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (categories !== undefined) updateData.categories = categories;
    
    // Update webhook
    const updatedWebhook = await discordService.updateWebhook(webhookId, updateData);
    
    return NextResponse.json({
      webhook: updatedWebhook,
      message: 'Webhook updated successfully',
    });
  } catch (error) {
    console.error(`Error updating webhook ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update webhook' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a webhook
export async function DELETE(
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
        { message: 'Not authorized to delete webhooks' },
        { status: 403 }
      );
    }
    
    // Check if webhook exists
    const existingWebhook = await discordService.getWebhookById(webhookId);
    
    if (!existingWebhook) {
      return NextResponse.json(
        { message: 'Webhook not found' },
        { status: 404 }
      );
    }
    
    // Delete webhook
    await discordService.deleteWebhook(webhookId);
    
    return NextResponse.json({
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    console.error(`Error deleting webhook ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}