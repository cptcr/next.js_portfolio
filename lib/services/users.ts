// lib/services/users.ts
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db/postgres';
import { users, permissions, User, NewUser, Permission, NewPermission } from '../db/schema';
import { hash, compare } from 'bcryptjs';

// User services
export const usersService = {
  // Create a new user
  async createUser(userData: Omit<NewUser, 'password'> & { password: string }) {
    // Hash the password
    const hashedPassword = await hash(userData.password, 10);
    
    // Create the user
    const newUser = await db.insert(users)
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
    
    await db.insert(permissions)
      .values({
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
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  },
  
  // Get a user by username
  async getUserByUsername(username: string) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] || null;
  },
  
  // Get a user with permissions
  async getUserWithPermissions(id: number) {
    const user = await this.getUserById(id);
    if (!user) return null;
    
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
  async updateUser(id: number, userData: Partial<Omit<NewUser, 'password'> & { password?: string }>) {
    const updates: Partial<NewUser> = { ...userData };
    
    // Hash the password if provided
    if (userData.password) {
      updates.password = await hash(userData.password, 10);
    }
    
    // Update the user
    const updated = await db.update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    return updated[0] || null;
  },
  
  // Update user permissions
  async updatePermissions(userId: number, permData: Partial<NewPermission>) {
    const [existing] = await db.select().from(permissions).where(eq(permissions.userId, userId));
    
    if (!existing) {
      // Create if not exists
      const [created] = await db.insert(permissions)
        .values({
          userId,
          ...permData,
        })
        .returning();
      
      return created;
    }
    
    // Update existing
    const [updated] = await db.update(permissions)
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
    // This will also delete related permissions due to cascade
    await db.delete(users).where(eq(users.id, id));
    return true;
  },
  
  // List all users
  async listUsers(limit = 20, offset = 0) {
    const usersList = await db.select().from(users).limit(limit).offset(offset);
    return usersList;
  },
  
  // Count total users
  async countUsers() {
    const result = await db.select({ count: sql`count(*)` }).from(users);
    return Number(result[0]?.count || 0);
  },
  
  // Check if a user has specific permissions
  async hasPermission(userId: number, permissionKey: keyof Omit<Permission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return false;
    
    // Admin users have all permissions
    if (user.role === 'admin') return true;
    
    // Check specific permission
    const [userPermissions] = await db.select()
      .from(permissions)
      .where(eq(permissions.userId, userId));
    
    if (!userPermissions) return false;
    
    return !!userPermissions[permissionKey];
  },
  
  // Initialize root admin user if no users exist
  async initializeRootUser() {
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
  },
};