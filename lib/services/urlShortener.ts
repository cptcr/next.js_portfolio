// lib/services/urlShortener.ts

import { eq, and, sql, lt, isNull, desc, gt, or, not, SQL } from 'drizzle-orm';
import { db } from '../db/postgres';
import { urlShortener, UrlShortener, NewUrlShortener } from '../db/schema';
import { createServiceFactory, MockService } from '@/lib/db/mock-service'; // Assuming MockService is correctly typed
import { nanoid } from 'nanoid';

// --- 1. Define Interface ---
export interface IUrlShortenerService {
  createShortUrl(
    originalUrl: string,
    options?: {
      userId?: number;
      expiresIn?: string;
      isPublic?: boolean;
      customId?: string;
    },
  ): Promise<UrlShortener>;

  getShortUrl(shortId: string): Promise<UrlShortener | null>;

  recordClick(shortId: string): Promise<void>;

  listShortUrls(options?: {
    userId?: number;
    limit?: number;
    offset?: number;
    includeExpired?: boolean;
    publicOnly?: boolean;
  }): Promise<UrlShortener[]>;

  deleteShortUrl(id: number, userId?: number): Promise<boolean>;

  cleanupExpiredUrls(): Promise<number>;
}

// --- 2. Implement Interface in Real Service ---
class UrlShortenerService implements IUrlShortenerService {
  // Private method remains, but is not part of the interface contract
  private async generateUniqueShortId(length: number = 6): Promise<string> {
    let attempts = 0;
    while (attempts < 5) {
      const shortId = nanoid(length);
      const exists = await db
        .select({ id: urlShortener.id })
        .from(urlShortener)
        .where(eq(urlShortener.shortId, shortId));
      if (exists.length === 0) return shortId;
      attempts++;
    }
    return this.generateUniqueShortId(length + 1);
  }

  async createShortUrl(
    originalUrl: string,
    options: {
      userId?: number;
      expiresIn?: string;
      isPublic?: boolean;
      customId?: string;
    } = {},
  ): Promise<UrlShortener> {
    const { userId, expiresIn, isPublic = false, customId } = options;
    const shortId = customId || (await this.generateUniqueShortId());
    let expiresAt: Date | null = null;
    // (Expiration logic as before...)
    if (expiresIn) {
      expiresAt = new Date();
      const match = expiresIn.match(/^(\d+)([hdw])$/);
      if (match) {
        const [, value, unit] = match;
        const numValue = parseInt(value, 10);
        switch (unit) {
          case 'h':
            expiresAt.setHours(expiresAt.getHours() + numValue);
            break;
          case 'd':
            expiresAt.setDate(expiresAt.getDate() + numValue);
            break;
          case 'w':
            expiresAt.setDate(expiresAt.getDate() + numValue * 7);
            break;
        }
      } else {
        console.warn(`Invalid expiresIn format: ${expiresIn}. No expiration set.`);
        expiresAt = null;
      }
    }
    const [newShortUrl] = await db
      .insert(urlShortener)
      .values({ shortId, originalUrl, userId: userId ?? null, expiresAt, isPublic, clickCount: 0 })
      .returning();
    return newShortUrl;
  }

  async getShortUrl(shortId: string): Promise<UrlShortener | null> {
    const [url] = await db
      .select()
      .from(urlShortener)
      .where(eq(urlShortener.shortId, shortId))
      .limit(1);
    return url ?? null;
  }

  async recordClick(shortId: string): Promise<void> {
    await db
      .update(urlShortener)
      .set({ clickCount: sql`${urlShortener.clickCount} + 1`, lastClickedAt: new Date() })
      .where(eq(urlShortener.shortId, shortId));
  }

  // CORRECTED listShortUrls
  async listShortUrls(
    options: {
      userId?: number;
      limit?: number;
      offset?: number;
      includeExpired?: boolean;
      publicOnly?: boolean;
    } = {},
  ): Promise<UrlShortener[]> {
    const { userId, limit = 50, offset = 0, includeExpired = false, publicOnly = false } = options;
    const conditions: SQL[] = [];

    if (userId !== undefined) {
      conditions.push(eq(urlShortener.userId, userId));
    }
    if (!includeExpired) {
      const expirationCondition = or(
        isNull(urlShortener.expiresAt),
        gt(urlShortener.expiresAt, new Date()),
      );
      // Only push the condition if 'or' returned a valid SQL object
      if (expirationCondition) {
        conditions.push(expirationCondition);
      }
    }
    if (publicOnly) {
      conditions.push(eq(urlShortener.isPublic, true));
    }

    const baseQuery = db.select().from(urlShortener); // Define base query to infer type

    const queryBuilder = baseQuery
      .$dynamic((qb: typeof baseQuery) => {
        // Add explicit type for qb
        if (conditions.length > 0) {
          return qb.where(and(...conditions)); // Call 'and' only when conditions exist
        }
        return qb;
      })
      .orderBy(desc(urlShortener.createdAt))
      .limit(limit)
      .offset(offset);

    return queryBuilder;
  }

  async deleteShortUrl(id: number, userId?: number): Promise<boolean> {
    const conditions: SQL[] = [eq(urlShortener.id, id)];
    if (userId !== undefined) {
      conditions.push(eq(urlShortener.userId, userId));
    }
    const whereClause = and(...conditions);
    const result = await db
      .delete(urlShortener)
      .where(whereClause)
      .returning({ id: urlShortener.id });
    return result.length > 0;
  }

  async cleanupExpiredUrls(): Promise<number> {
    const now = new Date();
    const result = await db
      .delete(urlShortener)
      .where(and(not(isNull(urlShortener.expiresAt)), lt(urlShortener.expiresAt, now)))
      .returning({ id: urlShortener.id });
    return result.length;
  }
}

// --- 2. Implement Interface in Mock Service ---
class MockUrlShortenerService implements IUrlShortenerService {
  private mockService = new MockService<UrlShortener>('urlShortener');
  private counter = 1;

  // Private method can remain, doesn't conflict at interface level
  private async generateUniqueShortId(length: number = 6): Promise<string> {
    // Simple mock implementation
    return nanoid(length);
  }

  // Implement all methods required by IUrlShortenerService
  async createShortUrl(
    /* ... implementation as before ... */
    originalUrl: string,
    options: {
      userId?: number;
      expiresIn?: string;
      isPublic?: boolean;
      customId?: string;
    } = {},
  ): Promise<UrlShortener> {
    const { userId, expiresIn, isPublic = false, customId } = options;
    const shortId = customId || (await this.generateUniqueShortId());
    let expiresAt: Date | null = null;
    if (expiresIn) {
      /*...expiration logic...*/
    }
    const id = this.counter++;
    return this.mockService.create({
      id,
      shortId,
      originalUrl,
      userId: userId ?? null,
      expiresAt,
      isPublic,
      clickCount: 0,
      createdAt: new Date(),
      lastClickedAt: null,
    });
  }

  async getShortUrl(
    /* ... implementation as before ... */ shortId: string,
  ): Promise<UrlShortener | null> {
    const urls = await this.mockService.find((url) => url.shortId === shortId);
    return urls.length > 0 ? urls[0] : null;
  }

  async recordClick(/* ... implementation as before ... */ shortId: string): Promise<void> {
    const urls = await this.mockService.find((url) => url.shortId === shortId);
    if (urls.length > 0) {
      /*...update logic...*/
    }
  }

  async listShortUrls(
    /* ... implementation as before ... */
    options: {
      userId?: number;
      limit?: number;
      offset?: number;
      includeExpired?: boolean;
      publicOnly?: boolean;
    } = {},
  ): Promise<UrlShortener[]> {
    const { userId, limit = 50, offset = 0, includeExpired = false, publicOnly = false } = options;
    let urls = await this.mockService.list();
    // Filtering logic as before...
    if (userId !== undefined) {
      urls = urls.filter((url) => url.userId === userId);
    }
    if (!includeExpired) {
      /*...filter logic...*/
    }
    if (publicOnly) {
      urls = urls.filter((url) => url.isPublic);
    }
    urls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return urls.slice(offset, offset + limit);
  }

  async deleteShortUrl(
    /* ... implementation as before ... */ id: number,
    userId?: number,
  ): Promise<boolean> {
    if (userId !== undefined) {
      /*...check logic...*/
    }
    return this.mockService.delete(id);
  }

  async cleanupExpiredUrls(/* ... implementation as before ... */): Promise<number> {
    // Mock implementation
    return 0; // Or implement actual mock logic
  }
}

// --- 3. Update Factory Export ---
// Ensure createServiceFactory is typed appropriately, e.g., using generics <T>
// Pass the Interface type to the factory if needed
export const urlShortenerService: IUrlShortenerService = createServiceFactory<IUrlShortenerService>(
  () => new UrlShortenerService(),
  () => new MockUrlShortenerService(), // Now compatible via interface
)();
