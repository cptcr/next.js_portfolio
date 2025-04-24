// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { runMigrations } from './lib/db/postgres';
import { usersService } from './lib/services/users';
import { settingsService } from './lib/services/settings';

// Initialize database once per app startup
let hasInitialized = false;

async function initializeDatabase() {
  if (hasInitialized) return;
  
  try {
    // Run database migrations
    await runMigrations();
    
    // Initialize root admin user if no users exist
    await usersService.initializeRootUser();
    
    // Initialize default settings
    await settingsService.initializeDefaultSettings();
    
    hasInitialized = true;
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export async function middleware(request: NextRequest) {
  // Skip initialization during static generation
  if (process.env.NODE_ENV !== 'production' && !hasInitialized) {
    await initializeDatabase();
  }
  
  // Continue with the request
  return NextResponse.next();
}

// This is a hack to ensure the middleware runs at least once during development
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};