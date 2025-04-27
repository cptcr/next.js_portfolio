import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth';
import { settingsService, SiteSettingsKey } from '@/lib/services/settings';
import { usersService } from '@/lib/services/users';

// GET: Get a specific setting by key
export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    // Authenticate
    const currentUser = await authService.getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const key = params.key as SiteSettingsKey;
    const value = await settingsService.getSetting(key);

    if (value === null) {
      return NextResponse.json({ message: 'Setting not found' }, { status: 404 });
    }

    return NextResponse.json({
      key,
      value,
    });
  } catch (error) {
    console.error(`Error getting setting ${params.key}:`, error);
    return NextResponse.json({ message: 'Failed to get setting' }, { status: 500 });
  }
}

// PUT: Update a specific setting
export async function PUT(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    // Authenticate
    const currentUser = await authService.getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Check if user has permission to manage settings
    const canManageSettings = await usersService.hasPermission(currentUser.id, 'canManageSettings');

    if (!canManageSettings && currentUser.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized to manage settings' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();

    if (!body || body.value === undefined) {
      return NextResponse.json({ message: 'Value is required' }, { status: 400 });
    }

    const key = params.key as SiteSettingsKey;
    await settingsService.setSetting(key, body.value);

    return NextResponse.json({
      message: 'Setting updated successfully',
      key,
      value: body.value,
    });
  } catch (error) {
    console.error(`Error updating setting ${params.key}:`, error);
    return NextResponse.json({ message: 'Failed to update setting' }, { status: 500 });
  }
}

// DELETE: Delete a specific setting
export async function DELETE(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    // Authenticate
    const currentUser = await authService.getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Check if user has permission to manage settings
    const canManageSettings = await usersService.hasPermission(currentUser.id, 'canManageSettings');

    if (!canManageSettings && currentUser.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized to manage settings' }, { status: 403 });
    }

    const key = params.key as SiteSettingsKey;
    await settingsService.deleteSetting(key);

    return NextResponse.json({
      message: 'Setting deleted successfully',
    });
  } catch (error) {
    console.error(`Error deleting setting ${params.key}:`, error);
    return NextResponse.json({ message: 'Failed to delete setting' }, { status: 500 });
  }
}
