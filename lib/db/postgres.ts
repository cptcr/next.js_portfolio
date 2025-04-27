import { databaseConfig } from './config';
import { drizzle as drizzleNeon, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { neon, Pool } from '@neondatabase/serverless'; // Use Pool for potential pooling benefits

// Define types for clarity
type DrizzleDb = NeonHttpDatabase<Record<string, never>>; // Adjust schema type if known

// Mock database implementation (using neon-http structure)
// You might need a slightly different mock setup if strict typing is needed, 
// but often a simple object mock suffices for checking if DB is enabled.
const mockDb = { isMock: true } as any; // Simpler mock marker

let dbInstance: DrizzleDb | null = null;

// Get database instance (real or mock)
export const getDb = (): DrizzleDb | typeof mockDb => {
    // If we're in mock mode, return the mock database
    if (!databaseConfig.enableDatabase) {
        // console.log('Database disabled, returning mock DB.');
        return mockDb;
    }

    // If we already have a real database connection, return it (Singleton pattern)
    if (dbInstance) {
        return dbInstance;
    }

    try {
        console.log('Initializing Neon database connection...');
        // Neon uses DATABASE_URL implicitly if not passed to neon() or Pool()
        // Ensure DATABASE_URL is set in your environment (.env.local, deployment vars)
        // It should be the pooled connection string (wss:// or https:// depending on driver/usage)
        // from your Neon console if using pooling.
        const sql = neon(process.env.DATABASE_URL!); 
        
        // Or use Pool for connection pooling (recommended for serverless)
        // const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
        // dbInstance = drizzleNeon(pool); 
        
        dbInstance = drizzleNeon(sql);

        console.log('Database connection established.');
        return dbInstance;

    } catch (error) {
        console.error('Error initializing database:', error);
        console.warn('Returning mock database due to initialization error.');
        return mockDb; // Return mock database in case of error
    }
};

// Function to check if the returned DB is the mock instance
export const isMockDb = (db: DrizzleDb | typeof mockDb): db is typeof mockDb => {
    return (db as any)?.isMock === true;
}


// --- Migrations ---
// Migrations MUST be run in a separate Node.js script, not from here.
// Create a script like `scripts/migrate.ts`

/* // Example scripts/migrate.ts (Run with tsx, ts-node, or similar)
import { drizzle } from 'drizzle-orm/node-postgres'; // Use NODE adapter for migrations
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import 'dotenv/config'; // Load .env file

const run = async () => {
  if (!process.env.DATABASE_URL_NON_POOLING) { // Use direct DB connection URL for migrations
     throw new Error("DATABASE_URL_NON_POOLING environment variable is not set.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL_NON_POOLING });
  const db = drizzle(pool);

  console.log('Running database migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations completed successfully.');
  
  await pool.end(); // Close the connection pool
  process.exit(0);
};

run().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
*/

// --- Raw Connection (Less Common with Neon Serverless Driver) ---
// Getting a raw client like with node-postgres is not the typical pattern
// with the HTTP-based Neon driver. Execute queries directly via the drizzle instance.
// If you absolutely need it, consult @neondatabase/serverless docs, 
// but it's generally not required.

// Export the main function to get the DB instance
export const db = getDb();