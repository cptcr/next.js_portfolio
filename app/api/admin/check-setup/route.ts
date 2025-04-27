// app/api/admin/check-setup/route.ts
import { NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/auth/credentials';

export async function GET() {
  try {
    // Check if default credentials are being used
    const isUsingDefault = await verifyCredentials('admin', 'password');

    // Need setup if using default credentials
    return NextResponse.json({
      needsSetup: isUsingDefault,
    });
  } catch (error) {
    console.error('Error checking setup status:', error);
    return NextResponse.json({ message: 'Error checking setup status' }, { status: 500 });
  }
}
