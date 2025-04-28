// lib/services/auth.ts
import { sign, verify, Secret, SignOptions } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { usersService } from './users';
import { env } from '../env'; // Assuming env loads process.env correctly

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
    const secret = env.JWT_SECRET || 'default-fallback-secret';
    // Ensure expiry is parsed correctly, provide default
    const expiresInMs = this.parseExpiryToMs(env.JWT_EXPIRY || '1d');
    const options: SignOptions = { expiresIn: `${expiresInMs / 1000}s` }; // jwt expects seconds or string like '1d'

    try {
      console.log(
        `[generateToken] Generating token with payload:`,
        payload,
        ` Secret exists: ${!!secret}`,
      );
      const token = sign(payload, secret, options);
      console.log(`[generateToken] Token generated successfully.`);
      return token;
    } catch (error) {
      console.error('[generateToken] Error signing JWT token:', error);
      return ''; // Return empty string on failure
    }
  },

  // Verify JWT token
  verifyToken(token: string): JwtPayload | null {
    try {
      const secret = env.JWT_SECRET || 'default-fallback-secret';
      console.log(`[verifyToken] Verifying token. Secret exists: ${!!secret}`);
      // Explicitly type the decoded payload
      const decoded = verify(token, secret) as JwtPayload;
      // Basic check for expected properties
      if (typeof decoded !== 'object' || !decoded.userId || !decoded.username || !decoded.role) {
        console.error('[verifyToken] Decoded token payload is invalid or missing required fields.');
        return null;
      }
      console.log(`[verifyToken] Token verified successfully. Payload:`, decoded);
      return decoded;
    } catch (error: any) {
      // Log specific JWT errors
      if (error.name === 'TokenExpiredError') {
        console.error(
          '[verifyToken] Token verification failed: Token expired at',
          new Date(error.expiredAt * 1000),
        );
      } else if (error.name === 'JsonWebTokenError') {
        console.error('[verifyToken] Token verification failed: Invalid token -', error.message);
      } else if (error.name === 'NotBeforeError') {
        console.error(
          '[verifyToken] Token verification failed: Token not active yet -',
          error.message,
        );
      } else {
        console.error('[verifyToken] Error verifying token:', error);
      }
      return null;
    }
  },

  // Authenticate user and generate token
  async authenticateUser(username: string, password: string): Promise<AuthResult> {
    try {
      // Note: usersService.authenticateUser should internally use verifyCredentials
      const user = await usersService.authenticateUser(username, password);

      if (!user) {
        console.log(`[authenticateUser] Authentication failed for user: ${username}`);
        return {
          success: false,
          message: 'Invalid username or password',
        };
      }
      console.log(`[authenticateUser] User authenticated: ${username}`);

      // Generate token
      const tokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
      };
      const token = this.generateToken(tokenPayload);

      if (!token) {
        // Error logged in generateToken
        throw new Error('Failed to generate JWT token');
      }

      console.log(`[authenticateUser] Token generated for user: ${username}`);
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
      console.error('[authenticateUser] Authentication error:', error);
      return {
        success: false,
        message: 'Authentication failed due to an internal error',
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
    permissions?: any; // Consider defining a Permissions type
  } | null> {
    const cookieStore = cookies();
    // Corrected: cookies() is synchronous
    const token = (await cookieStore).get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      console.log('[getCurrentUser] No auth token cookie found.'); // Log missing token
      return null;
    }
    console.log('[getCurrentUser] Auth token cookie found.'); // Log token found

    // Verify token
    const payload = this.verifyToken(token);
    if (!payload) {
      // Error logged in verifyToken
      console.log('[getCurrentUser] Token verification failed or payload invalid.');
      return null;
    }
    // Payload already logged in verifyToken if successful

    // Get user with permissions
    try {
      console.log(`[getCurrentUser] Fetching user with ID: ${payload.userId}`); // Log user ID being fetched
      const user = await usersService.getUserWithPermissions(payload.userId);
      if (!user) {
        console.log(`[getCurrentUser] User not found in DB for ID: ${payload.userId}`); // Log user not found
        // Attempt to clear the invalid cookie if user doesn't exist for the token ID
        await this.clearAuthCookie();
        console.log(
          `[getCurrentUser] Cleared invalid auth cookie for non-existent user ID: ${payload.userId}`,
        );
        return null;
      }
      console.log(`[getCurrentUser] User found in DB: ${user.username}`); // Log user found

      return {
        id: user.id,
        username: user.username,
        role: user.role,
        realName: user.realName || null,
        avatarUrl: user.avatarUrl || null,
        permissions: user.permissions, // Assuming getUserWithPermissions returns this
      };
    } catch (error) {
      console.error(
        `[getCurrentUser] Error fetching user from DB for ID ${payload.userId}:`,
        error,
      ); // Log DB error
      return null;
    }
  },

  // Set authentication cookie (server-side)
  async setAuthCookie(token: string): Promise<void> {
    try {
      const cookieStore = cookies();
      const expires = new Date(Date.now() + this.parseExpiryToMs(env.JWT_EXPIRY || '1d'));
      console.log(
        `[setAuthCookie] Setting cookie '${AUTH_COOKIE_NAME}'. Expires: ${expires.toISOString()}`,
      );
      (await cookieStore).set({
        // Removed await here
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        expires: expires,
        sameSite: 'lax', // Added SameSite attribute for security
      });
    } catch (error) {
      console.error(`[setAuthCookie] Failed to set auth cookie:`, error);
    }
  },

  // Clear authentication cookie (server-side)
  async clearAuthCookie(): Promise<void> {
    try {
      const cookieStore = cookies();
      console.log(`[clearAuthCookie] Deleting cookie '${AUTH_COOKIE_NAME}'.`);
      (await cookieStore).delete(AUTH_COOKIE_NAME); // Removed await here
    } catch (error) {
      console.error(`[clearAuthCookie] Failed to delete auth cookie:`, error);
    }
  },

  // Protect a route, redirecting to login if not authenticated (server-side)
  async protectRoute(
    redirectTo = '/admin/login',
    requiredRole?: string,
    requiredPermission?: string, // Consider defining a specific permission key type
  ): Promise<{
    id: number;
    username: string;
    role: string;
    realName?: string | null;
    avatarUrl?: string | null;
    permissions?: any; // Consider defining a Permissions type
  }> {
    const user = await this.getCurrentUser();

    if (!user) {
      console.log(`[protectRoute] User not authenticated. Redirecting to ${redirectTo}.`);
      redirect(redirectTo);
    }

    // Check role if required (Allow admin to bypass role check)
    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
      console.log(
        `[protectRoute] User role '${user.role}' does not match required role '${requiredRole}'. Redirecting.`,
      );
      redirect(redirectTo);
    }

    // Check permission if required (Allow admin to bypass permission check)
    // Ensure permissions object exists and the key is valid
    if (requiredPermission && user.role !== 'admin') {
      const hasPermission = user.permissions && user.permissions[requiredPermission];
      if (!hasPermission) {
        console.log(
          `[protectRoute] User '${user.username}' lacks required permission '${requiredPermission}'. Redirecting.`,
        );
        redirect(redirectTo);
      }
    }

    console.log(`[protectRoute] User '${user.username}' authorized.`);
    return user;
  },

  // Helper to parse JWT expiry string to milliseconds
  parseExpiryToMs(expiry: string): number {
    const num = parseInt(expiry);
    const unit = expiry.slice(-1);

    if (isNaN(num)) {
      return 24 * 60 * 60 * 1000; // Default to 1 day
    }

    switch (unit) {
      case 's':
        return num * 1000;
      case 'm':
        return num * 60 * 1000;
      case 'h':
        return num * 60 * 60 * 1000;
      case 'd':
        return num * 24 * 60 * 60 * 1000;
      default:
        return num * 1000; // Assume seconds if no unit or invalid unit
    }
  },
};
