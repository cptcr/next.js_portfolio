// lib/db/postgres.ts
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { env } from '@/lib/env';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
});

// Create a Drizzle ORM instance
export const db = drizzle(pool);

// Run migrations (in development mode)
export async function runMigrations() {
  if (env.NODE_ENV !== 'production') {
    try {
      console.log('Running database migrations...');
      await migrate(db, { migrationsFolder: './drizzle' });
      console.log('Migrations completed successfully');
    } catch (error) {
      console.error('Error running migrations:', error);
      throw error;
    }
  }
}

// Get a direct connection for raw queries if needed
export async function getConnection() {
  const client = await pool.connect();
  try {
    return client;
  } catch (error) {
    client.release();
    throw error;
  }
}

// Ensure we clean up the pool when the application exits
process.on('exit', () => {
  pool.end();
});