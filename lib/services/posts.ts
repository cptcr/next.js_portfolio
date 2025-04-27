// lib/services/posts.ts
import { eq, like, desc, sql, and, or, inArray } from 'drizzle-orm';
import { db } from '../db/postgres';
import { posts, users, Post, NewPost } from '../db/schema';
import { usersService } from './users';
import { discordService } from './discord';
import { settingsService } from './settings';
import { slugify } from '../utils/helpers';

// Posts services
export const postsService = {
  // Create a new post
  async createPost(
    postData: Omit<NewPost, 'slug' | 'createdAt' | 'updatedAt'>,
    shouldNotify = true,
  ) {
    // Generate slug
    let slug = slugify(postData.title);

    // Check if slug already exists
    const existing = await db.select({ slug: posts.slug }).from(posts).where(eq(posts.slug, slug));

    // If slug exists, add a unique suffix
    if (existing.length > 0) {
      slug = `${slug}-${Date.now().toString().slice(-6)}`;
    }

    // Create the post
    const [newPost] = await db
      .insert(posts)
      .values({
        ...postData,
        slug,
      })
      .returning();

    if (!newPost) {
      throw new Error('Failed to create post');
    }

    // Notify Discord if enabled
    if (shouldNotify) {
      try {
        // Get site settings to check if Discord notifications are enabled
        const discordNotificationsEnabled = await settingsService.getSetting(
          'discord_notifications_enabled',
        );

        // Only send notification if enabled in settings
        if (discordNotificationsEnabled) {
          const author = await usersService.getUserById(postData.authorId);
          if (author) {
            await discordService.notifyNewPost(newPost, author);
          }
        }
      } catch (error) {
        console.error('Failed to send Discord notification:', error);
        // Don't fail the post creation if notification fails
      }
    }

    return newPost;
  },

  // Get a post by slug
  async getPostBySlug(slug: string) {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));

    if (!post) return null;

    // Get author information
    const author = await usersService.getUserById(post.authorId);

    return {
      ...post,
      author: author
        ? {
            id: author.id,
            username: author.username,
            realName: author.realName || null,
            avatarUrl: author.avatarUrl || null,
          }
        : null,
    };
  },

  // Get a post by ID
  async getPostById(id: number) {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));

    if (!post) return null;

    // Get author information
    const author = await usersService.getUserById(post.authorId);

    return {
      ...post,
      author: author
        ? {
            id: author.id,
            username: author.username,
            realName: author.realName || null,
            avatarUrl: author.avatarUrl || null,
          }
        : null,
    };
  },

  // Update a post
  async updatePost(
    id: number,
    postData: Partial<Omit<NewPost, 'slug' | 'createdAt' | 'updatedAt'>>,
    userId: number,
  ) {
    // Check if user can edit this post
    const existingPost = await this.getPostById(id);
    if (!existingPost) {
      throw new Error('Post not found');
    }

    // Check permissions - user can edit if they're the author or have edit all permission
    const canEditOwn = await usersService.hasPermission(userId, 'canEditOwnPosts');
    const canEditAll = await usersService.hasPermission(userId, 'canEditAllPosts');
    const isAuthor = existingPost.authorId === userId;

    if ((!isAuthor || !canEditOwn) && !canEditAll) {
      throw new Error('Not authorized to edit this post');
    }

    // Regenerate slug if title changed
    let updates: Partial<NewPost> = { ...postData };
    if (postData.title && postData.title !== existingPost.title) {
      const slug = slugify(postData.title);

      // Check if new slug already exists (excluding current post)
      const existingSlug = await db
        .select({ slug: posts.slug })
        .from(posts)
        .where(and(eq(posts.slug, slug), sql`${posts.id} != ${id}`));

      // If slug exists, add a unique suffix
      if (existingSlug.length > 0) {
        updates.slug = `${slug}-${Date.now().toString().slice(-6)}`;
      } else {
        updates.slug = slug;
      }
    }

    // Update the post
    const [updated] = await db
      .update(posts)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    return updated;
  },

  // Delete a post
  async deletePost(id: number, userId: number) {
    // Check if user can delete this post
    const existingPost = await this.getPostById(id);
    if (!existingPost) {
      throw new Error('Post not found');
    }

    // Check permissions - user can delete if they're the author or have delete all permission
    const canDeleteOwn = await usersService.hasPermission(userId, 'canDeleteOwnPosts');
    const canDeleteAll = await usersService.hasPermission(userId, 'canDeleteAllPosts');
    const isAuthor = existingPost.authorId === userId;

    if ((!isAuthor || !canDeleteOwn) && !canDeleteAll) {
      throw new Error('Not authorized to delete this post');
    }

    await db.delete(posts).where(eq(posts.id, id));
    return true;
  },

  // List all posts with author information
  async listPosts(
    options: {
      limit?: number;
      offset?: number;
      category?: string;
      authorId?: number;
      featured?: boolean;
      searchTerm?: string;
    } = {},
  ) {
    const { limit = 10, offset = 0, category, authorId, featured, searchTerm } = options;

    // Build the where clause
    let whereClause: any = sql`1=1`;

    if (category) {
      whereClause = and(whereClause, eq(posts.category, category));
    }

    if (authorId !== undefined) {
      whereClause = and(whereClause, eq(posts.authorId, authorId));
    }

    if (featured !== undefined) {
      whereClause = and(whereClause, eq(posts.featured, featured));
    }

    if (searchTerm) {
      whereClause = and(
        whereClause,
        or(
          like(posts.title, `%${searchTerm}%`),
          like(posts.excerpt, `%${searchTerm}%`),
          like(posts.content, `%${searchTerm}%`),
        ),
      );
    }

    // Get posts with basic author info
    const results = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        excerpt: posts.excerpt,
        content: posts.content,
        category: posts.category,
        featured: posts.featured,
        publishedAt: posts.publishedAt,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        authorId: posts.authorId,
        authorUsername: users.username,
        authorRealName: users.realName,
        authorAvatarUrl: users.avatarUrl,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(whereClause)
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset(offset);

    // Transform results to include author info
    return results.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      featured: post.featured,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: post.authorId,
      author: {
        id: post.authorId,
        username: post.authorUsername,
        realName: post.authorRealName || null,
        avatarUrl: post.authorAvatarUrl || null,
      },
    }));
  },

  // Count total posts
  async countPosts(
    options: {
      category?: string;
      authorId?: number;
      featured?: boolean;
      searchTerm?: string;
    } = {},
  ) {
    const { category, authorId, featured, searchTerm } = options;

    // Build the where clause
    let whereClause: any = sql`1=1`;

    if (category) {
      whereClause = and(whereClause, eq(posts.category, category));
    }

    if (authorId !== undefined) {
      whereClause = and(whereClause, eq(posts.authorId, authorId));
    }

    if (featured !== undefined) {
      whereClause = and(whereClause, eq(posts.featured, featured));
    }

    if (searchTerm) {
      whereClause = and(
        whereClause,
        or(
          like(posts.title, `%${searchTerm}%`),
          like(posts.excerpt, `%${searchTerm}%`),
          like(posts.content, `%${searchTerm}%`),
        ),
      );
    }

    const result = await db
      .select({ count: sql`count(*)` })
      .from(posts)
      .where(whereClause);

    return Number(result[0]?.count || 0);
  },

  // Get all post categories
  async getAllCategories() {
    const results = await db
      .select({ category: posts.category })
      .from(posts)
      .groupBy(posts.category);

    return results.map((row) => row.category).filter(Boolean) as string[];
  },

  // Calculate reading time for a post
  calculateReadingTime(content: string): string {
    // Average reading speed: 200 words per minute
    const wordCount = content.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    return `${readingTimeMinutes} min read`;
  },
};
