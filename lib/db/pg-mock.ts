// lib/db/pg-mock.ts
/**
 * This file provides mock implementations of the pg module
 * It's used to avoid loading the actual pg module during development
 */

// Mock Pool class
export class Pool {
  constructor(options: any) {
    console.log('Mock PG Pool initialized');
  }
  
  async connect() {
    return {
      query: async () => ({ rows: [] }),
      release: () => {}
    };
  }
  
  async query() {
    return { rows: [] };
  }
  
  end() {
    return Promise.resolve();
  }
}

// Mock Client class
export class Client {
  constructor(options: any) {}
  
  async connect() {
    return Promise.resolve();
  }
  
  async query() {
    return { rows: [] };
  }
  
  end() {
    return Promise.resolve();
  }
}

// Export a mock drizzle function
export const mockDrizzle = (client: any) => {
  return {
    select: () => mockDrizzle(client),
    from: () => mockDrizzle(client),
    where: () => mockDrizzle(client),
    limit: () => mockDrizzle(client),
    offset: () => mockDrizzle(client),
    orderBy: () => mockDrizzle(client),
    insert: () => mockDrizzle(client),
    values: () => mockDrizzle(client),
    returning: () => Promise.resolve([]),
    update: () => mockDrizzle(client),
    set: () => mockDrizzle(client),
    delete: () => mockDrizzle(client),
    count: () => Promise.resolve({ count: 0 }),
    execute: () => Promise.resolve([]),
  };
};

// Mock migration function
export const mockMigrate = async () => {
  console.log('Mock migration function called');
  return Promise.resolve();
};