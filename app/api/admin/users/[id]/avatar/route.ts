// app/api/admin/users/[id]/avatar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { hasPermission, getUserById, updateUser } from '@/lib/services/users';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'avatars');

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

// POST: Upload user avatar
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    // Verify authentication
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Check if user is authorized to upload avatar
    // Users can upload avatars for themselves, or admins can upload for anyone
    if (
      auth.userId !== id &&
      auth.role !== 'admin' &&
      !(await hasPermission(auth.userId, 'canManageUsers'))
    ) {
      return NextResponse.json(
        {
          message: 'You do not have permission to upload an avatar for this user',
        },
        { status: 403 },
      );
    }

    // Check if user exists
    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const avatarFile = formData.get('avatar') as File;

    if (!avatarFile) {
      return NextResponse.json({ message: 'No avatar file provided' }, { status: 400 });
    }

    // Validate file type
    if (!avatarFile.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Invalid file type. Only images are allowed.' },
        { status: 400 },
      );
    }

    // Validate file size (2MB max)
    if (avatarFile.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File too large. Maximum size is 2MB.' },
        { status: 400 },
      );
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = avatarFile.name.split('.').pop() || 'jpg';
    const fileName = `avatar_${id}_${Date.now()}.${fileExtension}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Save the file
    const fileBuffer = Buffer.from(await avatarFile.arrayBuffer());
    await writeFile(filePath, fileBuffer);

    // Generate public URL for the avatar
    const avatarUrl = `/uploads/avatars/${fileName}`;

    // Update user record with new avatar URL
    await updateUser(id, { avatarUrl });

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      avatarUrl,
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { message: 'Failed to upload avatar', error: String(error) },
      { status: 500 },
    );
  }
}
