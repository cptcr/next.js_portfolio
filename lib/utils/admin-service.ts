// lib/utils/admin-service.ts
import { verify, sign } from 'jsonwebtoken';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';

/**
 * Verify authentication token from request headers
 * @param authHeader The Authorization header string
 * @returns Authentication verification result
 */
export async function verifyAuthToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing or invalid authorization header',
    };
  }

  const token = authHeader.substring(7);

  try {
    const payload = verify(token, JWT_SECRET) as any;
    return {
      authenticated: true,
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };
  } catch (error) {
    return {
      authenticated: false,
      error: 'Invalid or expired token',
    };
  }
}

/**
 * Generate a JWT token for a user
 * @param payload The data to encode in the token
 * @returns A signed JWT token
 */
export function generateToken(payload: any, expiresIn: string = '24h') {
  return sign(payload as any, JWT_SECRET as any, { expiresIn } as any);
}
