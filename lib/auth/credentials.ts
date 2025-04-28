// lib/auth/credentials.ts

import { compare, hash } from 'bcrypt';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { users } from '@/lib/db/schema';

// Database connection setup
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is not set.');
}

const sql = connectionString ? neon(connectionString) : null;
const db = sql ? drizzle(sql) : null;

/**
 * Verify user credentials in the database
 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  if (!db) {
    console.error('Database client is not initialized. Check DATABASE_URL.');
    return false;
  }

  console.log(`Attempting to verify credentials for username: ${username}`);

  try {
    // Find the user in the database by username
    const foundUsers = await db
      .select({
        id: users.id,
        username: users.username,
        passwordHash: users.password, // Select the stored password hash
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    // Check if user was found
    if (!foundUsers || foundUsers.length === 0) {
      console.log(`User not found: ${username}`);
      return false;
    }

    const user = foundUsers[0];
    console.log(`User found: ${username}. Comparing password.`);

    // Compare the provided password with the stored hash using bcrypt
    const isMatch = await compare(password, user.passwordHash);

    console.log(`Password comparison result for ${username}: ${isMatch}`);
    return isMatch;
  } catch (error) {
    console.error(`Error verifying credentials for ${username}:`, error);
    return false;
  }
}

/**
 * Update user credentials in the database
 */
export async function updateCredentials(username: string, password: string): Promise<boolean> {
  if (!db) {
    console.error('Database client is not initialized. Check DATABASE_URL.');
    return false;
  }

  try {
    // Hash the new password
    const passwordHash = await hash(password, 10);

    // Find the admin user
    const adminUsers = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);

    const adminExists = adminUsers.length > 0;

    if (adminExists) {
      // Update existing admin user
      await db
        .update(users)
        .set({
          username: username,
          password: passwordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, adminUsers[0].id));

      console.log(`Admin user updated to username: ${username}`);
    } else {
      // Create new admin user
      await db.insert(users).values({
        username: username,
        password: passwordHash,
        email: 'admin@example.com',
        role: 'admin',
      });

      console.log(`New admin user created with username: ${username}`);
    }

    return true;
  } catch (error) {
    console.error(`Error updating credentials:`, error);
    return false;
  }
}
