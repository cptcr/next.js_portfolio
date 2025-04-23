// lib/env.ts
import { z } from 'zod';

// Schema for environment variables
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string().min(1),
  
  // JWT Auth
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRY: z.string().default('1d'),
  
  // Admin Credentials (fallback)
  ADMIN_USERNAME: z.string().default('admin'),
  ADMIN_PASSWORD: z.string().default('password'),
  
  // Discord Integration
  DISCORD_WEBHOOK_URL: z.string().optional(),
  DISCORD_BOT_TOKEN: z.string().optional(),
  DISCORD_USER_ID: z.string().optional(),
  
  // Email
  EMAIL_ADDRESS: z.string().optional(),
  EMAIL_HOST: z.string().optional(),
  EMAIL_SMTP_PORT: z.string().optional(),
  EMAIL_AUTH_USERNAME: z.string().optional(),
  EMAIL_AUTH_PASSWORD: z.string().optional(),
  EMAIL_SECURE: z.string().optional(),
  
  // Site URL for absolute URLs
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  
  // GitHub Integration
  GITHUB_TOKEN: z.string().optional(),
});

// Parse environment variables or throw an error if required ones are missing
function getEnv() {
  // In Node.js environments
  if (typeof process !== 'undefined') {
    return envSchema.parse(process.env);
  }
  
  // In browser environments (should not expose sensitive env vars to browser)
  return {
    NODE_ENV: 'development',
    NEXT_PUBLIC_SITE_URL: '/',
  } as z.infer<typeof envSchema>;
}

// Export parsed environment variables
export const env = getEnv();