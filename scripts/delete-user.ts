// scripts/delete-user.ts

// Load environment variables from .env.local (or .env)
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Or adjust path if needed

// Import Drizzle, Neon driver, and 'eq' operator
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm'; // Import 'eq' for where clauses
import { neon } from '@neondatabase/serverless';

// Import readline for user input
import readline from 'readline';

// Import schema definitions (adjust path as necessary)
// Ensure 'users' has an 'id' field and 'permissions' has a 'userId' field
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
const sql = neon(connectionString);
const db = drizzle(sql); // Drizzle ORM instance

console.log('🔌 Drizzle client initialized.');

/**
 * Lists all users from the database.
 */
async function listUsers() {
  try {
    console.log('\n--- Current Users ---');
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt, // Optional: show creation date
      })
      .from(users)
      .orderBy(users.id); // Order by ID for consistency

    if (allUsers.length === 0) {
      console.log('ℹ️ No users found in the database.');
      return false; // Indicate no users exist
    }

    allUsers.forEach((user) => {
      console.log(
        ` ID: ${user.id} | Username: ${user.username} | Email: ${user.email} | Role: ${user.role} | Created: ${user.createdAt?.toLocaleDateString() ?? 'N/A'}`,
      );
    });
    console.log('---------------------\n');
    return true; // Indicate users were found and listed
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    return false; // Indicate failure
  }
}

/**
 * Deletes a user and their associated permissions by ID.
 * @param {number} userId - The ID of the user to delete.
 */
async function deleteUserById(userId: number) {
  let deletedUsername: string | null = null;
  try {
    // Optional: Fetch username before deleting for better logging
    const userToDelete = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (userToDelete.length > 0) {
      deletedUsername = userToDelete[0].username;
    } else {
      console.warn(`⚠️ User with ID ${userId} not found. Skipping deletion.`);
      return; // Exit if user doesn't exist
    }

    // 1. Delete associated permissions first to avoid foreign key constraints
    //    (assuming permissions.userId references users.id)
    const deletedPermissions = await db
      .delete(permissions)
      .where(eq(permissions.userId, userId))
      .returning({ deletedUserId: permissions.userId }); // Check if any permissions were deleted

    if (deletedPermissions.length > 0) {
      console.log(`ℹ️ Deleted permissions for user ID: ${userId}.`);
    } else {
      console.log(`ℹ️ No permissions found or deleted for user ID: ${userId}.`);
    }

    // 2. Delete the user
    const deletedUsers = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({ deletedId: users.id }); // Ensure the user was actually deleted

    if (deletedUsers.length > 0) {
      console.log(`✅ Successfully deleted user '${deletedUsername}' (ID: ${userId}).`);
    } else {
      // This case should ideally be caught by the initial check, but added for safety
      console.warn(
        `❓ User with ID ${userId} could not be deleted (might have been deleted already or never existed).`,
      );
    }
  } catch (err: any) {
    console.error(`❌ Error deleting user ID ${userId}:`, err);
    // Provide more specific error feedback if possible
    if (err.message?.includes('foreign key constraint')) {
      console.error(
        'Hint: Ensure related data (e.g., posts) is handled or cascade delete is set up if this user created content.',
      );
    }
  }
}

/**
 * Prompts the user to select a user ID for deletion and confirms the action.
 */
async function promptAndDeleteUser() {
  try {
    // List users first
    const usersExist = await listUsers();

    if (!usersExist) {
      console.log('No users to delete.');
      return; // Exit if there are no users
    }

    // Prompt for user ID
    const userIdInput = await question('Enter the ID of the user to delete: ');
    const userId = parseInt(userIdInput, 10);

    // Validate input
    if (isNaN(userId)) {
      console.error('❌ Error: Invalid ID. Please enter a number.');
      return;
    }

    // Confirmation step (CRITICAL for destructive actions)
    const confirmation = await question(
      `🚨 Are you sure you want to delete user ID ${userId}? This action CANNOT be undone. (yes/no): `,
    );

    if (confirmation.toLowerCase() !== 'yes') {
      console.log('ℹ️ Deletion cancelled.');
      return;
    }

    // Call the deletion function
    await deleteUserById(userId);
  } catch (err) {
    console.error('❌ An error occurred during the deletion process:', err);
  } finally {
    // Close the readline interface
    rl.close();
    console.log('🔌 Script finished.');
  }
}

/**
 * Main execution function (IIFE)
 */
(async () => {
  try {
    await promptAndDeleteUser();
  } catch (err) {
    console.error('❌ An unexpected error occurred in the main execution:', err);
    rl.close(); // Ensure readline is closed on unexpected errors too
  }
})();
