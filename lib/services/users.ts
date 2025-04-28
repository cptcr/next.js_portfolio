// lib/services/users.ts
import { eq, and, sql } from 'drizzle-orm';
import { databaseConfig } from '../db/config';
import { memoryStore } from '../db/memory-store';
import { getDb } from '../db/postgres';
import { users, permissions, User, NewUser, Permission, NewPermission } from '../db/schema';
import { hash, compare } from 'bcrypt';

// User services
export const usersService = {
  // Create a new user
  async createUser(userData: Omit<NewUser, 'password'> & { password: string }) {
    // Use in-memory store in development mode
    if (databaseConfig.useInMemoryStore && !databaseConfig.enableDatabase) {
      // Hash the password
      const hashedPassword = await hash(userData.password, 10);

      // Create a new user ID
      const id = Date.now();

      // Create the user in memory
      const newUser = await memoryStore.create('users', id, {
        ...userData,
        id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Add default permissions
      const isAdmin = userData.role === 'admin';

      await memoryStore.create('permissions', id, {
        id,
        userId: id,
        canCreatePosts: true,
        canEditOwnPosts: true,
        canDeleteOwnPosts: true,
        canEditAllPosts: isAdmin,
        canDeleteAllPosts: isAdmin,
        canManageUsers: isAdmin,
        canManageSettings: isAdmin,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return newUser;
    }

    // Real database mode
    // Hash the password
    const hashedPassword = await hash(userData.password, 10);

    const db = await getDb();

    // Create the user
    const newUser = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();

    if (!newUser || newUser.length === 0) {
      throw new Error('Failed to create user');
    }

    // Add default permissions
    const isAdmin = userData.role === 'admin';

    await db.insert(permissions).values({
      userId: newUser[0].id,
      canCreatePosts: true,
      canEditOwnPosts: true,
      canDeleteOwnPosts: true,
      canEditAllPosts: isAdmin,
      canDeleteAllPosts: isAdmin,
      canManageUsers: isAdmin,
      canManageSettings: isAdmin,
    });

    return newUser[0];
  },

  // Get a user by ID
  async getUserById(id: number) {
    // Use in-memory store in development mode
    if (databaseConfig.useInMemoryStore && !databaseConfig.enableDatabase) {
      return memoryStore.get('users', id);
    }

    // Real database mode
    const db = await getDb();
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  },

  // Get a user by username
  async getUserByUsername(username: string) {
    // Use in-memory store in development mode
    if (databaseConfig.useInMemoryStore && !databaseConfig.enableDatabase) {
      const allUsers = await memoryStore.list('users');
      return allUsers.find((user) => user.username === username) || null;
    }

    // Real database mode
    const db = await getDb();
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] || null;
  },

  // Get a user with permissions
  async getUserWithPermissions(id: number) {
    // Get the user first
    const user = await this.getUserById(id);
    if (!user) return null;

    // Use in-memory store in development mode
    if (databaseConfig.useInMemoryStore && !databaseConfig.enableDatabase) {
      const permissions = await memoryStore.get('permissions', id);
      return {
        ...user,
        permissions: permissions || null,
      };
    }

    // Real database mode
    const db = await getDb();
    const [userPermissions] = await db.select().from(permissions).where(eq(permissions.userId, id));

    return {
      ...user,
      permissions: userPermissions || null,
    };
  },

  // Authenticate a user
  async authenticateUser(username: string, password: string) {
    const user = await this.getUserByUsername(username);
    if (!user) return null;

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) return null;

    return user;
  },

  // Update a user
  async updateUser(
    id: number,
    userData: Partial<Omit<NewUser, 'password'> & { password?: string }>,
  ) {
    // Prepare updates
    const updates: Partial<NewUser> = { ...userData };

    // Hash the password if provided
    if (userData.password) {
      updates.password = await hash(userData.password, 10);
    }

    // Add updated timestamp
    updates.updatedAt = new Date();

    // Use in-memory store in development mode
    if (databaseConfig.useInMemoryStore && !databaseConfig.enableDatabase) {
      const updated = await memoryStore.update('users', id, updates);
      return updated;
    }

    // Real database mode
    const db = await getDb();
    const updated = await db.update(users).set(updates).where(eq(users.id, id)).returning();

    return updated[0] || null;
  },

  // Update user permissions
  async updatePermissions(userId: number, permData: Partial<NewPermission>) {
    // Use in-memory store in development mode
    if (databaseConfig.useInMemoryStore && !databaseConfig.enableDatabase) {
      // Check if permissions exist
      const existing = await memoryStore.get('permissions', userId);

      if (!existing) {
        // Create new permissions
        return memoryStore.create('permissions', userId, {
          id: userId,
          userId,
          ...permData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Update existing permissions
      return memoryStore.update('permissions', userId, {
        ...permData,
        updatedAt: new Date(),
      });
    }

    // Real database mode
    const db = await getDb();
    const [existing] = await db.select().from(permissions).where(eq(permissions.userId, userId));

    if (!existing) {
      // Create if not exists
      const [created] = await db
        .insert(permissions)
        .values({
          userId,
          ...permData,
        })
        .returning();

      return created;
    }

    // Update existing
    const [updated] = await db
      .update(permissions)
      .set({
        ...permData,
        updatedAt: new Date(),
      })
      .where(eq(permissions.userId, userId))
      .returning();

    return updated;
  },

  // Delete a user
  async deleteUser(id: number) {
    // Use in-memory store in development mode
    if (databaseConfig.useInMemoryStore && !databaseConfig.enableDatabase) {
      // Delete permissions first (no cascade in memory store)
      await memoryStore.delete('permissions', id);
      // Delete user
      return memoryStore.delete('users', id);
    }

    // Real database mode (permissions will be deleted via cascade)
    const db = await getDb();
    await db.delete(users).where(eq(users.id, id));
    return true;
  },

  // List all users
  async listUsers(limit = 20, offset = 0) {
    // Use in-memory store in development mode
    if (databaseConfig.useInMemoryStore && !databaseConfig.enableDatabase) {
      const allUsers = await memoryStore.list('users');
      return allUsers.slice(offset, offset + limit);
    }

    // Real database mode
    const db = await getDb();
    const usersList = await db.select().from(users).limit(limit).offset(offset);
    return usersList;
  },

  // Count total users
  async countUsers() {
    // Use in-memory store in development mode
    if (databaseConfig.useInMemoryStore && !databaseConfig.enableDatabase) {
      const allUsers = await memoryStore.list('users');
      return allUsers.length;
    }

    // Real database mode
    const db = await getDb();
    const result = await db.select({ count: sql`count(*)` }).from(users);
    return Number(result[0]?.count || 0);
  },

  // Check if a user has specific permissions
  async hasPermission(
    userId: number,
    permissionKey: keyof Omit<Permission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ) {
    // Get the user first
    const user = await this.getUserById(userId);
    if (!user) return false;

    // Admin users have all permissions
    if (user.role === 'admin') return true;

    // Use in-memory store in development mode
    if (databaseConfig.useInMemoryStore && !databaseConfig.enableDatabase) {
      const userPermissions = await memoryStore.get('permissions', userId);
      if (!userPermissions) return false;
      return !!userPermissions[permissionKey];
    }

    // Real database mode
    const db = await getDb();
    const [userPermissions] = await db
      .select()
      .from(permissions)
      .where(eq(permissions.userId, userId));

    if (!userPermissions) return false;

    return !!userPermissions[permissionKey];
  },

  // Initialize root admin user if no users exist
  async initializeRootUser() {
    try {
      const existingUsers = await this.listUsers(1);

      if (existingUsers.length === 0) {
        // Create root admin user
        await this.createUser({
          username: 'admin',
          email: 'admin@example.com',
          password: 'password', // Should be changed immediately
          realName: 'Administrator',
          role: 'admin',
        });

        console.log('Root admin user created');
      }
    } catch (error) {
      console.error('Failed to initialize root user:', error);
      // Continue even if this fails
    }
  },
};
