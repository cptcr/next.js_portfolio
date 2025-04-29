// lib/services/apiKeys.ts

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db/postgres';
import { apiKeys, apiLogs, NewApiKey, ApiKey, NewApiLog } from '../db/schema';
import { randomBytes, createHash } from 'crypto';

// API key permissions types
export interface ApiKeyPermissions {
  readPosts?: boolean;
  readUsers?: boolean;
  writePosts?: boolean;
  writeUsers?: boolean;
  admin?: boolean;
}

// Default permissions (read-only)
const DEFAULT_PERMISSIONS: ApiKeyPermissions = {
  readPosts: true,
  readUsers: false,
  writePosts: false,
  writeUsers: false,
  admin: false,
};

// API keys service
export const apiKeysService = {
  // Generate a new API key
  generateApiKey(): { key: string; prefix: string; hashedKey: string } {
    // Generate a random key (32 bytes = 64 hex chars)
    const fullKey = randomBytes(32).toString('hex');

    // Get the prefix (first 8 chars)
    const prefix = fullKey.substring(0, 8);

    // Hash the key for storage (we'll only store the hashed version)
    const hashedKey = createHash('sha256').update(fullKey).digest('hex');

    return {
      key: fullKey,
      prefix,
      hashedKey,
    };
  },

  // Create a new API key
  async createApiKey(
    userId: number,
    name: string,
    permissions: ApiKeyPermissions = DEFAULT_PERMISSIONS,
    expiresAt?: Date,
  ): Promise<{ apiKey: ApiKey; plainTextKey: string }> {
    // Generate a new key
    const { key, prefix, hashedKey } = this.generateApiKey();

    // Create the API key record
    const [newApiKey] = await db
      .insert(apiKeys)
      .values({
        userId,
        name,
        key: hashedKey, // Store the hashed version
        prefix, // Store the prefix for display/lookup purposes
        permissions,
        expiresAt,
        enabled: true,
      })
      .returning();

    if (!newApiKey) {
      throw new Error('Failed to create API key');
    }

    // Return both the API key record and the plain text key
    // The plain text key will only be shown once to the user
    return {
      apiKey: newApiKey,
      plainTextKey: key,
    };
  },

  // Validate an API key
  async validateApiKey(
    key: string,
  ): Promise<{ valid: boolean; apiKey?: ApiKey; permissions?: ApiKeyPermissions }> {
    // Extract the prefix from the key
    const prefix = key.substring(0, 8);

    // Hash the full key for comparison
    const hashedKey = createHash('sha256').update(key).digest('hex');

    // Find the API key by prefix and hash
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(
        and(eq(apiKeys.prefix, prefix), eq(apiKeys.key, hashedKey), eq(apiKeys.enabled, true)),
      );

    if (!apiKey) {
      return { valid: false };
    }

    // Check if the key has expired
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return { valid: false };
    }

    // Update the last used timestamp
    await db.update(apiKeys).set({ lastUsed: new Date() }).where(eq(apiKeys.id, apiKey.id));

    return {
      valid: true,
      apiKey,
      permissions: apiKey.permissions as ApiKeyPermissions,
    };
  },

  // Get an API key by ID
  async getApiKeyById(id: number): Promise<ApiKey | null> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return apiKey || null;
  },

  // List API keys for a user
  async listApiKeys(userId: number): Promise<ApiKey[]> {
    return db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  },

  // Update an API key
  async updateApiKey(
    id: number,
    updates: {
      name?: string;
      permissions?: ApiKeyPermissions;
      enabled?: boolean;
      expiresAt?: Date | null;
    },
  ): Promise<ApiKey | null> {
    const [updated] = await db
      .update(apiKeys)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, id))
      .returning();

    return updated || null;
  },

  // Delete an API key
  async deleteApiKey(id: number): Promise<boolean> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
    return true;
  },

  // Revoke an API key (disable it)
  async revokeApiKey(id: number): Promise<ApiKey | null> {
    return this.updateApiKey(id, { enabled: false });
  },

  // Log API usage
  async logApiUsage(logData: {
    apiKeyId?: number;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    requestIp?: string;
    userAgent?: string;
  }): Promise<void> {
    await db.insert(apiLogs).values(logData);
  },

  // Get API usage logs
  async getApiLogs(
    options: {
      apiKeyId?: number;
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): Promise<any[]> {
    const { apiKeyId, limit = 100, offset = 0, startDate, endDate } = options;

    // Build where clause
    let whereClause: any = sql`1=1`;

    if (apiKeyId) {
      whereClause = and(whereClause, eq(apiLogs.apiKeyId, apiKeyId));
    }

    if (startDate) {
      whereClause = and(whereClause, sql`${apiLogs.createdAt} >= ${startDate}`);
    }

    if (endDate) {
      whereClause = and(whereClause, sql`${apiLogs.createdAt} <= ${endDate}`);
    }

    // Get logs with API key info
    const logs = await db
      .select({
        id: apiLogs.id,
        endpoint: apiLogs.endpoint,
        method: apiLogs.method,
        statusCode: apiLogs.statusCode,
        responseTime: apiLogs.responseTime,
        requestIp: apiLogs.requestIp,
        userAgent: apiLogs.userAgent,
        createdAt: apiLogs.createdAt,
        apiKeyId: apiLogs.apiKeyId,
        apiKeyName: apiKeys.name,
        apiKeyPrefix: apiKeys.prefix,
      })
      .from(apiLogs)
      .leftJoin(apiKeys, eq(apiLogs.apiKeyId, apiKeys.id))
      .where(whereClause)
      .orderBy(desc(apiLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return logs;
  },

  // Get API usage statistics
  async getApiUsageStats(
    options: {
      apiKeyId?: number;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): Promise<{
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    requestsByEndpoint: Record<string, number>;
  }> {
    const { apiKeyId, startDate, endDate } = options;

    // Build where clause
    let whereClause: any = sql`1=1`;

    if (apiKeyId) {
      whereClause = and(whereClause, eq(apiLogs.apiKeyId, apiKeyId));
    }

    if (startDate) {
      whereClause = and(whereClause, sql`${apiLogs.createdAt} >= ${startDate}`);
    }

    if (endDate) {
      whereClause = and(whereClause, sql`${apiLogs.createdAt} <= ${endDate}`);
    }

    // Get total requests
    const [totalResult] = await db
      .select({ count: sql`count(*)` })
      .from(apiLogs)
      .where(whereClause);

    const totalRequests = Number(totalResult?.count || 0);

    // Get success rate (status code < 400)
    const [successResult] = await db
      .select({ count: sql`count(*)` })
      .from(apiLogs)
      .where(and(whereClause, sql`${apiLogs.statusCode} < 400`));

    const successCount = Number(successResult?.count || 0);
    const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 0;

    // Get average response time
    const [avgTimeResult] = await db
      .select({ avg: sql`avg(${apiLogs.responseTime})` })
      .from(apiLogs)
      .where(whereClause);

    const avgResponseTime = Number(avgTimeResult?.avg || 0);

    // Get requests by endpoint
    const endpointResults = await db
      .select({
        endpoint: apiLogs.endpoint,
        count: sql`count(*)`,
      })
      .from(apiLogs)
      .where(whereClause)
      .groupBy(apiLogs.endpoint);

    const requestsByEndpoint: Record<string, number> = {};
    endpointResults.forEach((row: { endpoint: string | number; count: any }) => {
      requestsByEndpoint[row.endpoint] = Number(row.count);
    });

    return {
      totalRequests,
      successRate,
      avgResponseTime,
      requestsByEndpoint,
    };
  },
};
