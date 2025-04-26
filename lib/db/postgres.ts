// lib/db/postgres.ts
import { databaseConfig } from './config';
import { Pool, Client, mockDrizzle, mockMigrate } from './pg-mock';

// Mock database implementation for development
const mockDb = mockDrizzle({});

// Export the mock db directly for import compatibility
export const db = mockDb;

// Only initialize the real database connection if explicitly requested
let pool: any = null;
let realDb: any = null;

// Get database instance (real or mock)
export const getDb = async () => {
  // If we're in mock mode, return the mock database
  if (!databaseConfig.enableDatabase) {
    return mockDb;
  }
  
  // If we already have a real database connection, return it
  if (realDb) {
    return realDb;
  }
  
  // Only attempt to load real database modules if explicitly enabled
  try {
    // Using dynamic import with a variable to trick webpack
    // This ensures these imports are completely eliminated from the client build
    const pgImport = 'pg';
    const drizzleImport = 'drizzle-orm/node-postgres';
    const { Pool: RealPool } = await import(pgImport);
    const { drizzle: realDrizzle } = await import(drizzleImport);
    
    // Get environment variables without importing the env module
    const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/your_database';
    const NODE_ENV = process.env.NODE_ENV || 'development';
    
    // Create a real database connection
    pool = new RealPool({
      connectionString: DATABASE_URL,
      ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
    });
    
    // Create the ORM instance
    realDb = realDrizzle(pool);
    
    // Register cleanup handler
    process.on('exit', () => {
      if (pool) pool.end();
    });
    
    console.log('Real database connection established');
    return realDb;
  } catch (error) {
    console.error('Error initializing database:', error);
    return mockDb;
  }
};

// Run migrations (in development mode)
export async function runMigrations() {
  if (!databaseConfig.enableDatabase) {
    console.log('Database disabled, skipping migrations');
    return;
  }
  
  try {
    // Use dynamic import with a variable to trick webpack
    const migratorImport = 'drizzle-orm/node-postgres/migrator';
    const { migrate } = await import(migratorImport);
    const db = await getDb();
    
    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

// Get a direct connection for raw queries if needed
export async function getConnection() {
  if (!databaseConfig.enableDatabase) {
    return {
      query: () => Promise.resolve({ rows: [] }),
      release: () => {},
    };
  }
  
  if (!pool) {
    await getDb();
  }
  
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error getting database connection:', error);
    return {
      query: () => Promise.resolve({ rows: [] }),
      release: () => {},
    };
  }
}