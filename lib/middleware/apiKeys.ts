// lib/services/apiKeys.ts

import { db } from '@/lib/db/postgres';
import { apiKeys, apiLogs, users } from '@/lib/db/schema';
import { eq, and, gte, lte, count, gt, sql, desc } from 'drizzle-orm';
import { hash, compare } from 'bcryptjs';
import { createServiceFactory, MockService } from '@/lib/db/mock-service';
import crypto from 'crypto';

export interface ApiKeyPermissions {
  readPosts?: boolean;
  writePosts?: boolean;
  readUsers?: boolean;
  writeUsers?: boolean;
  admin?: boolean;
}

interface ApiKey {
  id: number;
  userId: number;
  name: string;
  key: string;
  prefix: string;
  permissions: ApiKeyPermissions;
  expiresAt: Date | null;
  lastUsed: Date | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiKeyWithoutHash {
  id: number;
  userId: number;
  name: string;
  prefix: string;
  permissions: ApiKeyPermissions;
  expiresAt: Date | null;
  lastUsed: Date | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiKeyCreationResult {
  apiKey: ApiKeyWithoutHash;
  plainTextKey: string;
}

interface ApiKeyValidationResult {
  valid: boolean;
  apiKey?: ApiKey;
  permissions?: ApiKeyPermissions;
  message?: string;
}

interface ApiUsageLogEntry {
  apiKeyId?: number;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestIp: string;
  userAgent?: string;
}

interface ApiLogFilters {
  apiKeyId: number;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

interface ApiUsageStatsOptions {
  apiKeyId: number;
  startDate?: Date;
  endDate?: Date;
}

interface ApiUsageStats {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  requestsByEndpoint: Record<string, number>;
}

// API Key service implementation using the database
class ApiKeyService {
  // Create a new API key
  async createApiKey(
    userId: number,
    name: string,
    permissions: ApiKeyPermissions = { readPosts: true },
    expiresAt?: Date
  ): Promise<ApiKeyCreationResult> {
    // Generate random API key
    const plainTextKey = crypto.randomBytes(32).toString('hex');
    const prefix = plainTextKey.substring(0, 8);
    
    // Hash the API key for storage
    const hashedKey = await hash(plainTextKey, 10);
    
    // Insert the API key into the database
    const [apiKey] = await db
      .insert(apiKeys)
      .values({
        userId,
        name,
        key: hashedKey,
        prefix,
        permissions,
        expiresAt,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    // Return the API key without the hash
    const { key, ...apiKeyWithoutHash } = apiKey;
    
    return {
      apiKey: apiKeyWithoutHash,
      plainTextKey,
    };
  }
  
  // Get an API key by ID
  async getApiKeyById(id: number): Promise<ApiKey | null> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.id, id));
    
    return apiKey || null;
  }
  
  // List API keys for a user
  async listApiKeys(userId: number): Promise<ApiKeyWithoutHash[]> {
    const results = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));
    
    // Remove hashed keys from the results
    return results.map((result: ApiKey) => {
      const { key, ...rest } = result;
      return rest;
    });
  }
  
  // Update an API key
  async updateApiKey(
    id: number,
    updates: {
      name?: string;
      permissions?: ApiKeyPermissions;
      expiresAt?: Date | null;
      enabled?: boolean;
    }
  ): Promise<ApiKeyWithoutHash | null> {
    const [updatedApiKey] = await db
      .update(apiKeys)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, id))
      .returning();
    
    if (!updatedApiKey) {
      return null;
    }
    
    // Remove hashed key from the result
    const { key, ...apiKeyWithoutHash } = updatedApiKey;
    return apiKeyWithoutHash;
  }
  
  // Delete an API key
  async deleteApiKey(id: number): Promise<boolean> {
    const result = await db
      .delete(apiKeys)
      .where(eq(apiKeys.id, id))
      .returning({ id: apiKeys.id });
    
    return result.length > 0;
  }
  
  // Validate an API key
  async validateApiKey(apiKeyString: string): Promise<ApiKeyValidationResult> {
    try {
      if (!apiKeyString || apiKeyString.length < 8) {
        return { valid: false, message: 'Invalid API key format' };
      }
      
      // Get the prefix (first 8 characters)
      const prefix = apiKeyString.substring(0, 8);
      
      // Find the API key in the database
      const [apiKey] = await db
        .select()
        .from(apiKeys)
        .where(
          and(
            eq(apiKeys.prefix, prefix),
            eq(apiKeys.enabled, true)
          )
        );
      
      if (!apiKey) {
        return { valid: false, message: 'Invalid API key' };
      }
      
      // Verify the API key
      const isValid = await compare(apiKeyString, apiKey.key);
      
      if (!isValid) {
        return { valid: false, message: 'Invalid API key' };
      }
      
      // Check if the API key is expired
      if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
        return { valid: false, message: 'API key has expired' };
      }
      
      // Update last used timestamp
      await db
        .update(apiKeys)
        .set({ lastUsed: new Date() })
        .where(eq(apiKeys.id, apiKey.id));
      
      return {
        valid: true,
        apiKey,
        permissions: apiKey.permissions,
      };
    } catch (error) {
      console.error('Error validating API key:', error);
      return { valid: false, message: 'Error validating API key' };
    }
  }
  
  // Log API usage
  async logApiUsage(logEntry: ApiUsageLogEntry): Promise<void> {
    try {
      if (!logEntry.apiKeyId) {
        // Skip logging if no API key ID is provided
        return;
      }
      
      await db.insert(apiLogs).values({
        apiKeyId: logEntry.apiKeyId,
        endpoint: logEntry.endpoint,
        method: logEntry.method,
        statusCode: logEntry.statusCode,
        responseTime: logEntry.responseTime,
        requestIp: logEntry.requestIp,
        userAgent: logEntry.userAgent || null,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error logging API usage:', error);
    }
  }
  
  // Get API logs
  async getApiLogs(filters: ApiLogFilters): Promise<any[]> {
    let query = db
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
      .where(eq(apiLogs.apiKeyId, filters.apiKeyId))
      .orderBy(desc(apiLogs.createdAt));
    
    // Apply date filters if provided
    if (filters.startDate) {
      query = query.where(gte(apiLogs.createdAt, filters.startDate));
    }
    
    if (filters.endDate) {
      query = query.where(lte(apiLogs.createdAt, filters.endDate));
    }
    
    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.offset(filters.offset);
    }
    
    return query;
  }
  
  // Get API usage statistics
  async getApiUsageStats(options: ApiUsageStatsOptions): Promise<ApiUsageStats> {
    // Base query conditions
    const conditions = [eq(apiLogs.apiKeyId, options.apiKeyId)];
    
    // Add date filters if provided
    if (options.startDate) {
      conditions.push(gte(apiLogs.createdAt, options.startDate));
    }
    
    if (options.endDate) {
      conditions.push(lte(apiLogs.createdAt, options.endDate));
    }
    
    // Get total requests
    const [totalResult] = await db
      .select({ count: count() })
      .from(apiLogs)
      .where(and(...conditions));
    
    const totalRequests = totalResult?.count || 0;
    
    // Get success rate (status code < 400)
    const [successResult] = await db
      .select({ count: count() })
      .from(apiLogs)
      .where(and(...conditions, lt(apiLogs.statusCode, 400)));
    
    const successCount = successResult?.count || 0;
    const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 0;
    
    // Get average response time
    const [avgResult] = await db
      .select({
        avg: sql<number>`avg(${apiLogs.responseTime})`,
      })
      .from(apiLogs)
      .where(and(...conditions));
    
    const avgResponseTime = avgResult?.avg || 0;
    
    // Get requests by endpoint
    const endpointStats = await db
      .select({
        endpoint: apiLogs.endpoint,
        count: count(),
      })
      .from(apiLogs)
      .where(and(...conditions))
      .groupBy(apiLogs.endpoint);
    
    const requestsByEndpoint: Record<string, number> = {};
    
    endpointStats.forEach((stat: { endpoint: string | number; count: number; }) => {
      requestsByEndpoint[stat.endpoint] = stat.count;
    });
    
    return {
      totalRequests,
      successRate,
      avgResponseTime,
      requestsByEndpoint,
    };
  }
}

// Mock implementation for development
class MockApiKeyService {
  private mockService = new MockService<ApiKey>('apiKeys');
  private mockLogsService = new MockService<any>('apiLogs');
  
  async createApiKey(
    userId: number,
    name: string,
    permissions: ApiKeyPermissions = { readPosts: true },
    expiresAt?: Date
  ): Promise<ApiKeyCreationResult> {
    const plainTextKey = crypto.randomBytes(32).toString('hex');
    const prefix = plainTextKey.substring(0, 8);
    
    const apiKey = await this.mockService.create({
      id: Date.now(),
      userId,
      name,
      key: `mock_hashed_${plainTextKey}`,
      prefix,
      permissions,
      expiresAt,
      lastUsed: null,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    const { key, ...apiKeyWithoutHash } = apiKey;
    
    return {
      apiKey: apiKeyWithoutHash,
      plainTextKey,
    };
  }
  
  async getApiKeyById(id: number): Promise<ApiKey | null> {
    return this.mockService.getById(id);
  }
  
  async listApiKeys(userId: number): Promise<ApiKeyWithoutHash[]> {
    const keys = await this.mockService.find((key) => key.userId === userId);
    return keys.map(({ key, ...rest }) => rest);
  }
  
  async updateApiKey(
    id: number,
    updates: any
  ): Promise<ApiKeyWithoutHash | null> {
    const apiKey = await this.mockService.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
    
    if (!apiKey) return null;
    
    const { key, ...apiKeyWithoutHash } = apiKey;
    return apiKeyWithoutHash;
  }
  
  async deleteApiKey(id: number): Promise<boolean> {
    return this.mockService.delete(id);
  }
  
  async validateApiKey(apiKeyString: string): Promise<ApiKeyValidationResult> {
    // In mock mode, accept any key that starts with 'test_'
    if (apiKeyString.startsWith('test_')) {
      const mockApiKey = await this.mockService.find((key) => key.enabled);
      
      if (mockApiKey.length === 0) {
        // Create a mock API key if none exists
        const { apiKey } = await this.createApiKey(1, 'Mock API Key', {
          readPosts: true,
          writePosts: true,
          readUsers: true,
          writeUsers: true,
          admin: true,
        });
        
        return {
          valid: true,
          apiKey: {
            ...apiKey,
            key: `mock_hashed_${apiKeyString}`,
          },
          permissions: {
            readPosts: true,
            writePosts: true,
            readUsers: true,
            writeUsers: true,
            admin: true,
          },
        };
      }
      
      return {
        valid: true,
        apiKey: mockApiKey[0],
        permissions: mockApiKey[0].permissions,
      };
    }
    
    return { valid: false, message: 'Invalid API key' };
  }
  
  async logApiUsage(logEntry: ApiUsageLogEntry): Promise<void> {
    await this.mockLogsService.create({
      id: Date.now(),
      ...logEntry,
      createdAt: new Date(),
    });
  }
  
  async getApiLogs(filters: ApiLogFilters): Promise<any[]> {
    const logs = await this.mockLogsService.find(
      (log) => log.apiKeyId === filters.apiKeyId
    );
    
    // Apply date filters if provided
    let filteredLogs = logs;
    
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.createdAt) >= filters.startDate!
      );
    }
    
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.createdAt) <= filters.endDate!
      );
    }
    
    // Sort by createdAt desc
    filteredLogs.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Apply pagination
    if (filters.offset) {
      filteredLogs = filteredLogs.slice(filters.offset);
    }
    
    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }
    
    return filteredLogs;
  }
  
  async getApiUsageStats(options: ApiUsageStatsOptions): Promise<ApiUsageStats> {
    const logs = await this.mockLogsService.find(
      (log) => log.apiKeyId === options.apiKeyId
    );
    
    // Apply date filters if provided
    let filteredLogs = logs;
    
    if (options.startDate) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.createdAt) >= options.startDate!
      );
    }
    
    if (options.endDate) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.createdAt) <= options.endDate!
      );
    }
    
    const totalRequests = filteredLogs.length;
    
    // Count successful requests (status code < 400)
    const successfulRequests = filteredLogs.filter(
      (log) => log.statusCode < 400
    ).length;
    
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    
    // Calculate average response time
    const totalResponseTime = filteredLogs.reduce(
      (sum, log) => sum + (log.responseTime || 0),
      0
    );
    
    const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
    
    // Group requests by endpoint
    const requestsByEndpoint: Record<string, number> = {};
    
    filteredLogs.forEach((log) => {
      const endpoint = log.endpoint || 'unknown';
      requestsByEndpoint[endpoint] = (requestsByEndpoint[endpoint] || 0) + 1;
    });
    
    return {
      totalRequests,
      successRate,
      avgResponseTime,
      requestsByEndpoint,
    };
  }
}

// Helper functions
function lt(column: any, value: any) {
  return sql`${column} < ${value}`;
}

// Create service factory
export const apiKeysService = createServiceFactory(
  () => new ApiKeyService(),
  () => new MockApiKeyService()
)();