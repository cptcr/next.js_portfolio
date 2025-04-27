// lib/db/memory-store.ts
/**
 * A simple in-memory database for development purposes
 * This allows the app to function without requiring PostgreSQL during development
 */
export class MemoryStore {
  private store: Map<string, Map<string, any>> = new Map();

  // Get or create a collection
  collection(name: string) {
    if (!this.store.has(name)) {
      this.store.set(name, new Map());
    }
    return this.store.get(name)!;
  }

  // Create a record
  async create(collection: string, id: string | number, data: any) {
    const idStr = String(id);
    const record = { ...data, id: idStr };
    this.collection(collection).set(idStr, record);
    return record;
  }

  // Read a record
  async get(collection: string, id: string | number) {
    return this.collection(collection).get(String(id));
  }

  // Update a record
  async update(collection: string, id: string | number, data: any) {
    const idStr = String(id);
    const existing = this.collection(collection).get(idStr);
    if (!existing) return null;

    const updated = { ...existing, ...data, id: idStr };
    this.collection(collection).set(idStr, updated);
    return updated;
  }

  // Delete a record
  async delete(collection: string, id: string | number) {
    return this.collection(collection).delete(String(id));
  }

  // List all records in a collection
  async list(collection: string, options?: { limit?: number; offset?: number }) {
    const records = Array.from(this.collection(collection).values());

    if (!options) return records;

    const { limit, offset = 0 } = options;
    return limit ? records.slice(offset, offset + limit) : records.slice(offset);
  }

  // Count records in a collection
  async count(collection: string) {
    return this.collection(collection).size;
  }

  // Find records in a collection matching a filter
  async find(collection: string, filter: (item: any) => boolean) {
    const records = Array.from(this.collection(collection).values());
    return records.filter(filter);
  }

  // Clear all data (useful for testing)
  async clear() {
    this.store.clear();
  }

  // Clear a specific collection
  async clearCollection(collection: string) {
    this.collection(collection).clear();
  }
}

// Export a singleton instance
export const memoryStore = new MemoryStore();
