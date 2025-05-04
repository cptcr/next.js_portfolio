// lib/services/codeSnippets.ts
import { eq, and, desc, sql, lt, isNull, gt, or } from 'drizzle-orm';
import { db } from '../db/postgres';
import { codeSnippets, CodeSnippet, NewCodeSnippet } from '../db/schema';
import { createServiceFactory, MockService } from '@/lib/db/mock-service';
import { nanoid } from 'nanoid';

// Code Snippets service
class CodeSnippetsService {
  // Generate a unique snippet ID
  private async generateUniqueSnippetId(length: number = 8): Promise<string> {
    // Keep trying until we get a unique ID
    let attempts = 0;
    while (attempts < 5) {
      // Generate a random ID
      const snippetId = nanoid(length);

      // Check if it exists
      const exists = await db
        .select({ id: codeSnippets.id })
        .from(codeSnippets)
        .where(eq(codeSnippets.snippetId, snippetId));

      if (exists.length === 0) {
        return snippetId;
      }

      attempts++;
    }

    // If we failed to generate a unique ID after 5 attempts, try with a longer length
    return this.generateUniqueSnippetId(length + 1);
  }

  // Create a new code snippet
  async createCodeSnippet(
    title: string,
    code: string,
    options: {
      language?: string;
      userId?: number;
      expiresIn?: string; // e.g., '1h', '1d', '7d'
      isPublic?: boolean;
      customId?: string;
    } = {},
  ): Promise<CodeSnippet> {
    const { language, userId, expiresIn, isPublic = false, customId } = options;

    // Generate or use custom snippet ID
    const snippetId = customId || (await this.generateUniqueSnippetId());

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
            expiresAt.setDate(expiresAt.getDate() + numValue * 7);
            break;
        }
      }
    }

    // Create the code snippet
    const [newCodeSnippet] = await db
      .insert(codeSnippets)
      .values({
        snippetId,
        title,
        code,
        language: language || null,
        userId: userId || null,
        expiresAt,
        isPublic,
        viewCount: 0,
      })
      .returning();

    return newCodeSnippet;
  }

  // Get a code snippet by ID
  async getCodeSnippet(snippetId: string): Promise<CodeSnippet | null> {
    const [snippet] = await db
      .select()
      .from(codeSnippets)
      .where(eq(codeSnippets.snippetId, snippetId));

    return snippet || null;
  }

  // Record a view on a code snippet
  async recordView(snippetId: string): Promise<void> {
    await db
      .update(codeSnippets)
      .set({
        viewCount: sql`${codeSnippets.viewCount} + 1`,
        lastViewedAt: new Date(),
      })
      .where(eq(codeSnippets.snippetId, snippetId));
  }

  // Get all code snippets (for admin)
  async listCodeSnippets(
    options: {
      userId?: number;
      limit?: number;
      offset?: number;
      includeExpired?: boolean;
      publicOnly?: boolean;
    } = {},
  ): Promise<CodeSnippet[]> {
    const { userId, limit = 50, offset = 0, includeExpired = false, publicOnly = false } = options;

    // Build where clause
    let whereClause: any = sql`1=1`;

    // Filter by user ID if provided
    if (userId) {
      whereClause = and(whereClause, eq(codeSnippets.userId, userId));
    }

    // Filter by expiration
    if (!includeExpired) {
      whereClause = and(
        whereClause,
        or(isNull(codeSnippets.expiresAt), gt(codeSnippets.expiresAt, new Date())),
      );
    }

    // Filter by public status
    if (publicOnly) {
      whereClause = and(whereClause, eq(codeSnippets.isPublic, true));
    }

    // Get snippets
    return db
      .select()
      .from(codeSnippets)
      .where(whereClause)
      .orderBy(desc(codeSnippets.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Delete a code snippet
  async deleteCodeSnippet(id: number, userId?: number): Promise<boolean> {
    // If userId is provided, only allow deletion if the snippet belongs to the user
    let whereClause: any = eq(codeSnippets.id, id);

    if (userId) {
      whereClause = and(whereClause, eq(codeSnippets.userId, userId));
    }

    const result = await db
      .delete(codeSnippets)
      .where(whereClause)
      .returning({ id: codeSnippets.id });

    return result.length > 0;
  }

  // Clean up expired snippets
  async cleanupExpiredSnippets(): Promise<number> {
    const now = new Date();

    const result = await db
      .delete(codeSnippets)
      .where(and(not(isNull(codeSnippets.expiresAt)), lt(codeSnippets.expiresAt, now)))
      .returning({ id: codeSnippets.id });

    return result.length;
  }
}

// Mock implementation for development
class MockCodeSnippetsService {
  private mockService = new MockService<CodeSnippet>('codeSnippets');
  private counter = 1;

  private async generateUniqueSnippetId(length: number = 8): Promise<string> {
    return nanoid(length);
  }

  async createCodeSnippet(
    title: string,
    code: string,
    options: {
      language?: string;
      userId?: number;
      expiresIn?: string;
      isPublic?: boolean;
      customId?: string;
    } = {},
  ): Promise<CodeSnippet> {
    const { language, userId, expiresIn, isPublic = false, customId } = options;

    // Generate or use custom snippet ID
    const snippetId = customId || (await this.generateUniqueSnippetId());

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
            expiresAt.setDate(expiresAt.getDate() + numValue * 7);
            break;
        }
      }
    }

    const id = this.counter++;

    return this.mockService.create({
      id,
      snippetId,
      title,
      code,
      language: language || null,
      userId: userId || null,
      expiresAt,
      isPublic,
      viewCount: 0,
      createdAt: new Date(),
      lastViewedAt: null,
    });
  }

  async getCodeSnippet(snippetId: string): Promise<CodeSnippet | null> {
    const snippets = await this.mockService.find((snippet) => snippet.snippetId === snippetId);
    return snippets.length > 0 ? snippets[0] : null;
  }

  async recordView(snippetId: string): Promise<void> {
    const snippets = await this.mockService.find((snippet) => snippet.snippetId === snippetId);

    if (snippets.length > 0) {
      const snippet = snippets[0];
      await this.mockService.update(snippet.id, {
        viewCount: snippet.viewCount + 1,
        lastViewedAt: new Date(),
      });
    }
  }

  async listCodeSnippets(
    options: {
      userId?: number;
      limit?: number;
      offset?: number;
      includeExpired?: boolean;
      publicOnly?: boolean;
    } = {},
  ): Promise<CodeSnippet[]> {
    const { userId, limit = 50, offset = 0, includeExpired = false, publicOnly = false } = options;

    let snippets = await this.mockService.list();

    // Filter by user ID if provided
    if (userId) {
      snippets = snippets.filter((snippet) => snippet.userId === userId);
    }

    // Filter by expiration
    if (!includeExpired) {
      const now = new Date();
      snippets = snippets.filter(
        (snippet) => !snippet.expiresAt || new Date(snippet.expiresAt) > now,
      );
    }

    // Filter by public status
    if (publicOnly) {
      snippets = snippets.filter((snippet) => snippet.isPublic);
    }

    // Sort by creation date (newest first)
    snippets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    return snippets.slice(offset, offset + limit);
  }

  async deleteCodeSnippet(id: number, userId?: number): Promise<boolean> {
    if (userId) {
      const snippet = await this.mockService.getById(id);
      if (!snippet || snippet.userId !== userId) {
        return false;
      }
    }

    return this.mockService.delete(id);
  }

  async cleanupExpiredSnippets(): Promise<number> {
    const now = new Date();
    let count = 0;

    const allSnippets = await this.mockService.list();

    for (const snippet of allSnippets) {
      if (snippet.expiresAt && new Date(snippet.expiresAt) < now) {
        await this.mockService.delete(snippet.id);
        count++;
      }
    }

    return count;
  }
}

// Helper function for Drizzle ORM
function not(condition: any): any {
  return sql`NOT (${condition})`;
}

// Export the service factory
export const codeSnippetsService = createServiceFactory(
  () => new CodeSnippetsService(),
  () => new CodeSnippetsService(),
)();
