// lib/db/schema.ts
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  json,
  integer,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

// Users Table
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 100 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    realName: varchar('real_name', { length: 255 }),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    role: varchar('role', { length: 50 }).notNull().default('user'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      usernameIdx: uniqueIndex('username_idx').on(table.username),
      emailIdx: uniqueIndex('email_idx').on(table.email),
    };
  },
);

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  canCreatePosts: boolean('can_create_posts').notNull().default(false),
  canEditOwnPosts: boolean('can_edit_own_posts').notNull().default(false),
  canEditAllPosts: boolean('can_edit_all_posts').notNull().default(false),
  canDeleteOwnPosts: boolean('can_delete_own_posts').notNull().default(false),
  canDeleteAllPosts: boolean('can_delete_all_posts').notNull().default(false),
  canManageUsers: boolean('can_manage_users').notNull().default(false),
  canManageSettings: boolean('can_manage_settings').notNull().default(false),
  // New API Key permissions
  canCreateApiKeys: boolean('can_create_api_keys').notNull().default(false),
  canManageApiKeys: boolean('can_manage_api_keys').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Posts Table
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id),
  category: varchar('category', { length: 100 }),
  featured: boolean('featured').default(false),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Site Settings Table
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: json('value'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Discord Webhook Configurations
export const discordWebhooks = pgTable('discord_webhooks', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  url: text('url').notNull(),
  avatar: text('avatar'),
  enabled: boolean('enabled').default(true),
  categories: json('categories'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
  permissions: one(permissions, {
    fields: [users.id],
    references: [permissions.userId],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export const permissionsRelations = relations(permissions, ({ one }) => ({
  user: one(users, {
    fields: [permissions.userId],
    references: [users.id],
  }),
}));

// Export types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Permission = InferSelectModel<typeof permissions>;
export type NewPermission = InferInsertModel<typeof permissions>;

export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

export type SiteSetting = InferSelectModel<typeof siteSettings>;
export type NewSiteSetting = InferInsertModel<typeof siteSettings>;

export type DiscordWebhook = InferSelectModel<typeof discordWebhooks>;
export type NewDiscordWebhook = InferInsertModel<typeof discordWebhooks>;

export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  key: varchar('key', { length: 64 }).notNull().unique(),
  prefix: varchar('prefix', { length: 8 }).notNull(),
  permissions: json('permissions'),
  expiresAt: timestamp('expires_at'),
  lastUsed: timestamp('last_used'),
  enabled: boolean('enabled').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// API Usage Logs Table
export const apiLogs = pgTable('api_logs', {
  id: serial('id').primaryKey(),
  apiKeyId: integer('api_key_id').references(() => apiKeys.id, { onDelete: 'set null' }),
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  statusCode: integer('status_code'),
  responseTime: integer('response_time'),
  requestIp: varchar('request_ip', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
  logs: many(apiLogs),
}));

export const apiLogsRelations = relations(apiLogs, ({ one }) => ({
  apiKey: one(apiKeys, {
    fields: [apiLogs.apiKeyId],
    references: [apiKeys.id],
  }),
}));

// Export types
export type ApiKey = InferSelectModel<typeof apiKeys>;
export type NewApiKey = InferInsertModel<typeof apiKeys>;

export type ApiLog = InferSelectModel<typeof apiLogs>;
export type NewApiLog = InferInsertModel<typeof apiLogs>;

// URL Shortener Table
export const urlShortener = pgTable('url_shortener', {
  id: serial('id').primaryKey(),
  shortId: varchar('short_id', { length: 10 }).notNull().unique(),
  originalUrl: text('original_url').notNull(),
  userId: integer('user_id').references(() => users.id), // Creator (null if anonymous)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // null means no expiration
  isPublic: boolean('is_public').default(false).notNull(),
  clickCount: integer('click_count').default(0).notNull(),
  lastClickedAt: timestamp('last_clicked_at'),
});

// Relations
export const urlShortenerRelations = relations(urlShortener, ({ one }) => ({
  user: one(users, {
    fields: [urlShortener.userId],
    references: [users.id],
  }),
}));

// Export types
export type UrlShortener = InferSelectModel<typeof urlShortener>;
export type NewUrlShortener = InferInsertModel<typeof urlShortener>;

export const codeSnippets = pgTable('code_snippets', {
  id: serial('id').primaryKey(),
  snippetId: varchar('snippet_id', { length: 10 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  code: text('code').notNull(),
  language: varchar('language', { length: 50 }),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  isPublic: boolean('is_public').default(false).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  lastViewedAt: timestamp('last_viewed_at'),
});

// Relations
export const codeSnippetsRelations = relations(codeSnippets, ({ one }) => ({
  user: one(users, {
    fields: [codeSnippets.userId],
    references: [users.id],
  }),
}));

// Export types
export type CodeSnippet = InferSelectModel<typeof codeSnippets>;
export type NewCodeSnippet = InferInsertModel<typeof codeSnippets>;
