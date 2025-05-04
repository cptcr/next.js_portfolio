// lib/services/urlShortener.ts

import { eq, and, sql, lt, isNull, desc, gt } from 'drizzle-orm';
import { db } from '../db/postgres';
import { urlShortener, UrlShortener, NewUrlShortener } from '../db/schema';
import { createServiceFactory, MockService } from '@/lib/db/mock-service';
import { nanoid } from 'nanoid';

// URL Shortener service
class UrlShortenerService {
  // Generate a unique short ID
  private async generateUniqueShortId(length: number = 6): Promise<string> {
    // Keep trying until we get a unique ID
    let attempts = 0;
    while (attempts < 5) {
      // Generate a random ID
      const shortId = nanoid(length);
      
      // Check if it exists
      const exists = await db
        .select({ id: urlShortener.id })
        .from(urlShortener)
        .where(eq(urlShortener.shortId, shortId));
        
      if (exists.length === 0) {
        return shortId;
      }
      
      attempts++;
    }
    
    // If we failed to generate a unique ID after 5 attempts, try with a longer length
    return this.generateUniqueShortId(length + 1);
  }

  // Create a new short URL
  async createShortUrl(
    originalUrl: string,
    options: {
      userId?: number;
      expiresIn?: string; // e.g., '1h', '1d', '7d'
      isPublic?: boolean;
      customId?: string;
    } = {}
  ): Promise<UrlShortener> {
    const { userId, expiresIn, isPublic = false, customId } = options;
    
    // Generate or use custom short ID
    const shortId = customId || await this.generateUniqueShortId();
    
    // Calculate expiration date if provided
    let expiresAt: Date | null = null;
    if (expiresIn) {
      expiresAt = new Date();
      const match = expiresIn.match(/^(\d+)([hdw])$/);
      
      if (match) {
        const [, value, unit] = match;
        const numValue = parseInt(value, 10);
        
        switch (unit) {
          case 'h': // hours
            expiresAt.setHours(expiresAt.getHours() + numValue);
            break;
          case 'd': // days
            expiresAt.setDate(expiresAt.getDate() + numValue);
            break;
          case 'w': // weeks
            expiresAt.setDate(expiresAt.getDate() + (numValue * 7));
            break;
        }
      }
    }
    
    // Create the short URL
    const [newShortUrl] = await db
      .insert(urlShortener)
      .values({
        shortId,
        originalUrl,
        userId: userId || null,
        expiresAt,
        isPublic,
        clickCount: 0,
      })
      .returning();
      
    return newShortUrl;
  }
  
  // Get a short URL by ID
  async getShortUrl(shortId: string): Promise<UrlShortener | null> {
    const [url] = await db
      .select()
      .from(urlShortener)
      .where(eq(urlShortener.shortId, shortId));
      
    return url || null;
  }
  
  // Record a click on a short URL
  async recordClick(shortId: string): Promise<void> {
    await db
      .update(urlShortener)
      .set({
        clickCount: sql`${urlShortener.clickCount} + 1`,
        lastClickedAt: new Date()
      })
      .where(eq(urlShortener.shortId, shortId));
  }
  
  // Get all short URLs (for admin)
  async listShortUrls(
    options: {
      userId?: number;
      limit?: number;
      offset?: number;
      includeExpired?: boolean;
      publicOnly?: boolean;
    } = {}
  ): Promise<UrlShortener[]> {
    const { userId, limit = 50, offset = 0, includeExpired = false, publicOnly = false } = options;
    
    // Build where clause
    let whereClause: any = true;
    
    // Filter by user ID if provided
    if (userId) {
      whereClause = and(whereClause, eq(urlShortener.userId, userId));
    }
    
    // Filter by expiration
    if (!includeExpired) {
      whereClause = and(
        whereClause,
        or(
          isNull(urlShortener.expiresAt),
          gt(urlShortener.expiresAt, new Date())
        )
      );
    }
    
    // Filter by public status
    if (publicOnly) {
      whereClause = and(whereClause, eq(urlShortener.isPublic, true));
    }
    
    // Get URLs
    return db
      .select()
      .from(urlShortener)
      .where(whereClause)
      .orderBy(desc(urlShortener.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  // Delete a short URL
  async deleteShortUrl(id: number, userId?: number): Promise<boolean> {
    // If userId is provided, only allow deletion if the URL belongs to the user
    let whereClause: any = eq(urlShortener.id, id);
    
    if (userId) {
      whereClause = and(whereClause, eq(urlShortener.userId, userId));
    }
    
    const result = await db
      .delete(urlShortener)
      .where(whereClause)
      .returning({ id: urlShortener.id });
      
    return result.length > 0;
  }
  
  // Clean up expired URLs
  async cleanupExpiredUrls(): Promise<number> {
    const now = new Date();
    
    const result = await db
      .delete(urlShortener)
      .where(
        and(
          not(isNull(urlShortener.expiresAt)),
          lt(urlShortener.expiresAt, now)
        )
      )
      .returning({ id: urlShortener.id });
      
    return result.length;
  }
}

// Mock implementation for development
class MockUrlShortenerService {
  private mockService = new MockService<UrlShortener>('urlShortener');
  private counter = 1;

  private async generateUniqueShortId(length: number = 6): Promise<string> {
    return nanoid(length);
  }

  async createShortUrl(
    originalUrl: string,
    options: {
      userId?: number;
      expiresIn?: string;
      isPublic?: boolean;
      customId?: string;
    } = {}
  ): Promise<UrlShortener> {
    const { userId, expiresIn, isPublic = false, customId } = options;
    
    // Generate or use custom short ID
    const shortId = customId || await this.generateUniqueShortId();
    
    // Calculate expiration date if provided
    let expiresAt: Date | null = null;
    if (expiresIn) {
      expiresAt = new Date();
      const match = expiresIn.match(/^(\d+)([hdw])$/);
      
      if (match) {
        const [, value, unit] = match;
        const numValue = parseInt(value, 10);
        
        switch (unit) {
          case 'h': // hours
            expiresAt.setHours(expiresAt.getHours() + numValue);
            break;
          case 'd': // days
            expiresAt.setDate(expiresAt.getDate() + numValue);
            break;
          case 'w': // weeks
            expiresAt.setDate(expiresAt.getDate() + (numValue * 7));
            break;
        }
      }
    }
    
    const id = this.counter++;
    
    return this.mockService.create({
      id,
      shortId,
      originalUrl,
      userId: userId || null,
      expiresAt,
      isPublic,
      clickCount: 0,
      createdAt: new Date(),
      lastClickedAt: null,
    });
  }
  
  async getShortUrl(shortId: string): Promise<UrlShortener | null> {
    const urls = await this.mockService.find((url) => url.shortId === shortId);
    return urls.length > 0 ? urls[0] : null;
  }
  
  async recordClick(shortId: string): Promise<void> {
    const urls = await this.mockService.find((url) => url.shortId === shortId);
    
    if (urls.length > 0) {
      const url = urls[0];
      await this.mockService.update(url.id, {
        clickCount: url.clickCount + 1,
        lastClickedAt: new Date(),
      });
    }
  }
  
  async listShortUrls(
    options: {
      userId?: number;
      limit?: number;
      offset?: number;
      includeExpired?: boolean;
      publicOnly?: boolean;
    } = {}
  ): Promise<UrlShortener[]> {
    const { userId, limit = 50, offset = 0, includeExpired = false, publicOnly = false } = options;
    
    let urls = await this.mockService.list();
    
    // Filter by user ID if provided
    if (userId) {
      urls = urls.filter((url) => url.userId === userId);
    }
    
    // Filter by expiration
    if (!includeExpired) {
      const now = new Date();
      urls = urls.filter((url) => !url.expiresAt || new Date(url.expiresAt) > now);
    }
    
    // Filter by public status
    if (publicOnly) {
      urls = urls.filter((url) => url.isPublic);
    }
    
    // Sort by creation date (newest first)
    urls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Apply pagination
    return urls.slice(offset, offset + limit);
  }
  
  async deleteShortUrl(id: number, userId?: number): Promise<boolean> {
    if (userId) {
      const url = await this.mockService.getById(id);
      if (!url || url.userId !== userId) {
        return false;
      }
    }
    
    return this.mockService.delete(id);
  }
  
  async cleanupExpiredUrls(): Promise<number> {
    const now = new Date();
    let count = 0;
    
    const allUrls = await this.mockService.list();
    
    for (const url of allUrls) {
      if (url.expiresAt && new Date(url.expiresAt) < now) {
        await this.mockService.delete(url.id);
        count++;
      }
    }
    
    return count;
  }
}

// Helper function for Drizzle ORM
function or(...conditions: any[]): any {
  return sql`(${conditions.map(c => `(${c})`).join(' OR ')})`;
}

function not(condition: any): any {
  return sql`NOT (${condition})`;
}

// Export the service factory
export const urlShortenerService = createServiceFactory(
  () => new UrlShortenerService(),
  () => new MockUrlShortenerService()
)();