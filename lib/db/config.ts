// lib/db/config.ts
/**
 * Database configuration options
 *
 * - enableDatabase: Set to false to disable real database connections during development
 * - useInMemoryStore: Use in-memory storage for development instead of real database
 */
export const databaseConfig = {
  // Set this to false to disable database connections during development
  enableDatabase: true,
  // Use an in-memory data store for development
  useInMemoryStore: true,
};
