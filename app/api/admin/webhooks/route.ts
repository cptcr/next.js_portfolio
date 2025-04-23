// app/api/admin/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth';
import { discordService } from '@/lib/services/discord';
import { usersService } from '@/lib/services/users';

// GET: List all webhook configurations
export async function GET(request: NextRequest) {
  try {
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
    
    const webhooks = await discordService.listWebhooks();
    
    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error('Error listing webhooks:', error);
    return NextResponse.json(
      { message: 'Failed to list webhooks' },
      { status: 500 }
    );
  }
}

// POST: Create a new webhook configuration
export async function POST(request: NextRequest) {
  try {
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
        { message: 'Not authorized to create webhooks' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { name, url, avatar, enabled = true, categories } = body;
    
    // Validate required fields
    if (!name || !url) {
      return NextResponse.json(
        { message: 'Name and URL are required' },
        { status: 400 }
      );
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { message: 'Invalid URL format' },
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
      message: 'Webhook created successfully',
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { message: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}
