// lib/utils/mock-services.ts
import { memoryStore } from '@/lib/db/memory-store';
import { databaseConfig } from '@/lib/db/config';

/**
 * Helper class to create mock service implementations
 * This allows the application to run without a database during development
 */
export class MockService<T> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Create a new record
  async create(data: any): Promise<T> {
    const id = data.id || Date.now().toString();
    return memoryStore.create(this.collectionName, id, data);
  }

  // Get a record by ID
  async getById(id: string | number): Promise<T | null> {
    return memoryStore.get(this.collectionName, id);
  }

  // Update a record
  async update(id: string | number, data: Partial<T>): Promise<T | null> {
    return memoryStore.update(this.collectionName, id, data);
  }

  // Delete a record
  async delete(id: string | number): Promise<boolean> {
    return memoryStore.delete(this.collectionName, id);
  }

  // List records with pagination
  async list(options?: { limit?: number; offset?: number }): Promise<T[]> {
    return memoryStore.list(this.collectionName, options);
  }

  // Count total records
  async count(): Promise<number> {
    return memoryStore.count(this.collectionName);
  }

  // Find records by filter
  async find(filter: (item: T) => boolean): Promise<T[]> {
    return memoryStore.find(this.collectionName, filter);
  }
}

/**
 * Creates either a real or mock service implementation based on configuration
 * @param realServiceFactory Function that creates the real service
 * @param mockServiceFactory Function that creates the mock service
 * @returns Either the real or mock service based on configuration
 */
export function createServiceFactory<T>(
  realServiceFactory: () => T,
  mockServiceFactory: () => T,
): () => T {
  return () => {
    if (databaseConfig.enableDatabase) {
      return realServiceFactory();
    }
    return mockServiceFactory();
  };
}
