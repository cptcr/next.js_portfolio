// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth';
import { settingsService } from '@/lib/services/settings';
import { usersService } from '@/lib/services/users';

// GET: Get all settings
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
    
    // All users can view settings, but let's keep this consistent with other endpoints
    const settings = await settingsService.getAllSettings();
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json(
      { message: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

// PUT: Update multiple settings
export async function PUT(request: NextRequest) {
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
        { message: 'Not authorized to manage settings' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate settings object
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { message: 'Invalid settings format' },
        { status: 400 }
      );
    }
    
    // Update settings
    await settingsService.setMultipleSettings(body);
    
    return NextResponse.json({
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

