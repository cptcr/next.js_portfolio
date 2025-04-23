// lib/types/auth.ts

/**
 * Credentials for the admin user
 */
export interface Credentials {
  username: string;
  password: string; // Will be hashed in storage
}

/**
 * JWT payload structure
 */
export interface JwtPayload {
  username: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

/**
 * Auth verification result
 */
export interface AuthVerification {
  authenticated: boolean;
  username?: string;
  error?: string;
}

/**
 * Password change request 
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  newUsername?: string;
}

/**
 * Password change response
 */
export interface PasswordChangeResponse {
  message: string;
  usernameChanged: boolean;
}