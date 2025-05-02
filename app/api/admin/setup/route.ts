// app/api/admin/setup/route.ts
import { NextResponse } from 'next/server';
import { updateCredentials, verifyCredentials } from '@/lib/auth/credentials';
import { hasPermission, updateUser, getUserByUsername, createUser } from '@/lib/services/users';
import { settingsService } from '@/lib/services/settings';

// Setup endpoint for first-time setup
export async function POST(request: Request) {
  try {
    // Check if already set up with non-default credentials
    const isUsingDefault = await verifyCredentials('admin', 'password');
    if (!isUsingDefault) {
      return NextResponse.json({ message: 'Setup already completed' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { username, password } = body;

    // Validate inputs
    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 },
      );
    }

    // Update admin credentials in the credentials storage
    const updated = await updateCredentials(username, password);
    if (!updated) {
      throw new Error('Failed to update credentials');
    }

    try {
      // Initialize the database with root user if needed
      const adminUser = await getUserByUsername('admin');

      if (!adminUser) {
        // Create admin user in the database
        await createUser({
          username,
          email: 'admin@example.com', // Default email, can be changed later
          password,
          realName: 'Administrator',
          role: 'admin',
        });
      } else if (username !== 'admin') {
        // Update the username if it was changed
        await updateUser(adminUser.id, {
          username,
          password,
        });
      } else {
        // Just update the password
        await updateUser(adminUser.id, { password });
      }

      // Initialize default settings if needed
      await settingsService.initializeDefaultSettings();
    } catch (dbError) {
      console.error('Database initialization error:', dbError);
      // We don't fail the request here since the credentials were already updated
    }

    return NextResponse.json({
      message: 'Setup completed successfully',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ message: 'Setup failed', error: String(error) }, { status: 500 });
  }
}
