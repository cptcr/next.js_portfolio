// scripts/create-user.ts

// Load environment variables from .env.local (or .env)
// Make sure dotenv is installed: npm install dotenv
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Or adjust path if needed

// Import Drizzle and Neon driver
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Import bcrypt for password hashing
import bcrypt from 'bcrypt';

// Import readline for user input
import readline from 'readline';

// Import schema definitions (adjust path as necessary)
import { users, permissions } from '../lib/db/schema'; // Assuming schema is in lib/db/schema.ts

// Use readline promises for cleaner async/await prompting
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const question = (query: string): Promise<string> =>
  new Promise((resolve) => rl.question(query, resolve));

// --- Database Client Configuration ---
// Use the DATABASE_URL environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  process.exit(1); // Exit if connection string is missing
}

// Initialize the Neon query function and the Drizzle client
// This setup mirrors a typical Drizzle/Neon configuration
const sql = neon(connectionString);
const db = drizzle(sql); // Drizzle ORM instance

console.log('🔌 Drizzle client initialized.');

/**
 * Creates a new user and assigns default permissions using Drizzle ORM.
 * @param {string} username - The username for the new user.
 * @param {string} email - The email address for the new user.
 * @param {string} password - The plain text password to be hashed.
 * @param {string} [role='user'] - The role for the new user (defaults to 'user').
 */
async function createUser(
  username: string,
  email: string,
  password: string,
  role: 'admin' | 'user' = 'user',
) {
  try {
    // Hash the password using bcrypt (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user using Drizzle ORM
    const insertedUsers = await db
      .insert(users)
      .values({
        username: username,
        email: email,
        password: hashedPassword,
        role: role,
        // Other fields like realName, avatarUrl, bio can be added here if needed
        // createdAt and updatedAt should be handled by database defaults
      })
      .returning({ insertedId: users.id }); // Get the ID of the inserted user

    if (!insertedUsers || insertedUsers.length === 0) {
      throw new Error('User insertion failed, no ID returned.');
    }
    const userId = insertedUsers[0].insertedId;

    console.log(`✅ User '${username}' created successfully with ID: ${userId}`);

    // Insert default permissions for the new user using Drizzle ORM
    // Adjust these defaults based on your application's needs
    await db.insert(permissions).values({
      userId: userId,
      canCreatePosts: false,
      canEditOwnPosts: true,
      canEditAllPosts: false,
      canDeleteOwnPosts: true,
      canDeleteAllPosts: false,
      canManageUsers: role === 'admin', // Grant admin rights based on role
      canManageSettings: role === 'admin', // Grant admin rights based on role
      // createdAt and updatedAt should be handled by database defaults
    });

    console.log(`✅ Default permissions assigned to user ID: ${userId} (Role: ${role})`);
  } catch (err: any) {
    // Log specific errors if possible (e.g., unique constraint violation)
    // Drizzle might wrap the original error, check err.message or specific error types if needed
    if (err.message?.includes('duplicate key value violates unique constraint')) {
      // Check common unique constraint error text
      console.error(
        `❌ Error: Failed to create user. Username or email '${username}'/'${email}' likely already exists.`,
      );
    } else {
      console.error('❌ Error during user creation process:', err);
    }
  }
}

/**
 * Prompts the user for details and initiates user creation.
 */
async function promptAndCreateUser() {
  try {
    console.log('\n--- Create New User ---');
    const username = await question('Enter username: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password: ');
    let roleInput = await question('Enter role (admin/user, default: user): ');

    // Validate inputs (basic example)
    if (!username || !email || !password) {
      console.error('❌ Error: Username, email, and password cannot be empty.');
      return; // Stop execution if inputs are invalid
    }

    let role: 'admin' | 'user' = 'user'; // Default role
    if (roleInput && ['admin', 'user'].includes(roleInput.toLowerCase())) {
      role = roleInput.toLowerCase() as 'admin' | 'user';
    } else if (roleInput) {
      console.log(`🟡 Invalid role entered. Defaulting to 'user'.`);
    }

    // Call the function to create the user in the database
    await createUser(username, email, password, role);
  } catch (err) {
    console.error('❌ An error occurred during the prompting process:', err);
  } finally {
    // Close the readline interface
    rl.close();
  }
}

/**
 * Main execution function (IIFE - Immediately Invoked Function Expression)
 */
(async () => {
  try {
    // Connection is implicitly handled by Drizzle/Neon driver on first query.
    // No explicit connect() or end() needed for simple script execution.

    // Start the user creation prompt process
    await promptAndCreateUser();
  } catch (err) {
    console.error('❌ An unexpected error occurred:', err);
    rl.close(); // Ensure readline is closed on error too
  }
})();
