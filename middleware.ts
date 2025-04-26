// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { databaseConfig } from './lib/db/config';

// Initialization flag
let hasInitialized = false;

export async function middleware(request: NextRequest) {
  // Skip database initialization if disabled
  if (!databaseConfig.enableDatabase) {
    return NextResponse.next();
  }
  
  // Only initialize once per app instance
  if (!hasInitialized) {
    try {
      // Dynamic imports to avoid loading database modules when not needed
      const { runMigrations } = await import('./lib/db/postgres');
      const { usersService } = await import('./lib/services/users');
      const { settingsService } = await import('./lib/services/settings');
      
      // Run database setup asynchronously, but don't wait for it
      Promise.resolve().then(async () => {
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
          console.error('Error during database initialization:', error);
        }
      });
    } catch (error) {
      console.error('Failed to import database modules:', error);
    }
  }
  
  // Continue with the request immediately
  return NextResponse.next();
}

// Match all request paths except for static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};