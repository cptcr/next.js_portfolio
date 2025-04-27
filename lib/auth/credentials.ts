// lib/auth/credentials.ts

// Import bcrypt for password comparison
import { compare } from 'bcrypt';
// Import Drizzle and Neon driver components
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
// Import Drizzle utility for querying (e.g., eq for equals)
import { eq } from 'drizzle-orm';
// Import schema definitions (adjust path as necessary)
import { users } from '@/lib/db/schema'; // Assuming schema is in lib/db/schema.ts

// --- Database Client Configuration ---
// Use the DATABASE_URL environment variable
// Ensure it's set in your .env.local or environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // In a real app, you might want more robust error handling or logging here
  // Forcing an error during startup if DB URL is missing is often a good idea.
  console.error('FATAL ERROR: DATABASE_URL environment variable is not set.');
  // Depending on where this module is imported, process.exit might be too harsh.
  // Consider throwing an error that gets caught higher up during app initialization.
  // throw new Error('DATABASE_URL environment variable is not set.');
}

// Initialize the Neon query function and the Drizzle client
// Only initialize if connectionString is available
const sql = connectionString ? neon(connectionString) : null;
const db = sql ? drizzle(sql) : null; // Drizzle ORM instance

/**
 * Verify user credentials against the database.
 * @param username - Username to verify.
 * @param password - Password to verify (plain text).
 * @returns {Promise<boolean>} - True if credentials are valid, false otherwise.
 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  // Check if the database client was initialized successfully
  if (!db) {
    console.error('Database client is not initialized. Check DATABASE_URL.');
    return false;
  }

  console.log(`Attempting to verify credentials for username: ${username}`); // Added logging

  try {
    // Find the user in the database by username
    const foundUsers = await db.select({
        id: users.id,
        username: users.username,
        passwordHash: users.password // Select the stored password hash
      })
      .from(users)
      .where(eq(users.username, username)) // Use eq() for type-safe comparison
      .limit(1); // We only expect one user

    // Check if user was found
    if (!foundUsers || foundUsers.length === 0) {
      console.log(`User not found: ${username}`); // Added logging
      return false; // User does not exist
    }

    const user = foundUsers[0];
    console.log(`User found: ${username}. Comparing password.`); // Added logging

    // Compare the provided password with the stored hash using bcrypt
    const isMatch = await compare(password, user.passwordHash);

    console.log(`Password comparison result for ${username}: ${isMatch}`); // Added logging
    return isMatch; // Return true if passwords match, false otherwise

  } catch (error) {
    console.error(`Error verifying credentials for ${username}:`, error);
    return false; // Return false in case of any database or comparison error
  }
}