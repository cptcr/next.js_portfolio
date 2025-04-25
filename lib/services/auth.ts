// lib/services/auth.ts
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { usersService } from './users';
import { env } from '../env';

// Types
export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
  exp?: number;
  iat?: number;
}

export interface AuthResult {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: number;
    username: string;
    role: string;
    realName?: string | null;
    avatarUrl?: string | null;
  };
}

// Cookie name for storing the auth token
const AUTH_COOKIE_NAME = 'auth_token';

// Auth service
export const authService = {
  // Generate JWT token
  generateToken(payload: Omit<JwtPayload, 'exp' | 'iat'>): string {
    // Fix JWT signing
    return sign(
      payload,
      env.JWT_SECRET || 'default-fallback-secret', // Provide fallback
      { expiresIn: env.JWT_EXPIRY || '1d' } // Provide fallback
    );
  },
  
  // Verify JWT token
  verifyToken(token: string): JwtPayload | null {
    try {
      // Fix JWT verification
      const decoded = verify(token, env.JWT_SECRET || 'default-fallback-secret') as JwtPayload;
      return decoded;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  },
  
  // Authenticate user and generate token
  async authenticateUser(username: string, password: string): Promise<AuthResult> {
    try {
      const user = await usersService.authenticateUser(username, password);
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password',
        };
      }
      
      // Generate token
      const token = this.generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });
      
      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          realName: user.realName || null,
          avatarUrl: user.avatarUrl || null,
        },
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        message: 'Authentication failed',
      };
    }
  },
  
  // Get current user from token (server-side)
  async getCurrentUser(): Promise<{
    id: number;
    username: string;
    role: string;
    realName?: string | null;
    avatarUrl?: string | null;
    permissions?: any;
  } | null> {
    // Fix cookies access
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    
    if (!token) {
      return null;
    }
    
    // Verify token
    const payload = this.verifyToken(token);
    if (!payload) {
      return null;
    }
    
    // Get user with permissions
    try {
      const user = await usersService.getUserWithPermissions(payload.userId);
      if (!user) {
        return null;
      }
      
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        realName: user.realName || null,
        avatarUrl: user.avatarUrl || null,
        permissions: user.permissions,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Set authentication cookie (server-side)
  setAuthCookie(token: string): void {
    // Fix cookies access
    const cookieStore = cookies();
    cookieStore.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      // Calculate expiry based on JWT_EXPIRY (default 1d)
      expires: new Date(Date.now() + this.parseExpiryToMs(env.JWT_EXPIRY || '1d')),
    });
  },
  
  // Clear authentication cookie (server-side)
  clearAuthCookie(): void {
    // Fix cookies access
    const cookieStore = cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
  },
  
  // Protect a route, redirecting to login if not authenticated (server-side)
  async protectRoute(
    redirectTo = '/admin/login',
    requiredRole?: string,
    requiredPermission?: string
  ): Promise<{
    id: number;
    username: string;
    role: string;
    realName?: string | null;
    avatarUrl?: string | null;
    permissions?: any;
  }> {
    const user = await this.getCurrentUser();
    
    if (!user) {
      redirect(redirectTo);
    }
    
    // Check role if required
    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
      redirect(redirectTo);
    }
    
    // Check permission if required
    if (requiredPermission && user.permissions) {
      const hasPermission = user.permissions[requiredPermission];
      if (!hasPermission && user.role !== 'admin') {
        redirect(redirectTo);
      }
    }
    
    return user;
  },
  
  // Helper to parse JWT expiry string to milliseconds
  parseExpiryToMs(expiry: string): number {
    const num = parseInt(expiry);
    if (isNaN(num)) {
      return 24 * 60 * 60 * 1000; // Default to 1 day
    }
    
    if (expiry.endsWith('s')) {
      return num * 1000;
    } else if (expiry.endsWith('m')) {
      return num * 60 * 1000;
    } else if (expiry.endsWith('h')) {
      return num * 60 * 60 * 1000;
    } else if (expiry.endsWith('d')) {
      return num * 24 * 60 * 60 * 1000;
    }
    
    return num * 1000; // Assume seconds if no unit
  },
};