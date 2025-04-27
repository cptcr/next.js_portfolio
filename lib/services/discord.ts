// lib/services/discord.ts
import { eq } from 'drizzle-orm';
import { db } from '../db/postgres';
import { discordWebhooks, NewDiscordWebhook, DiscordWebhook, Post, User } from '../db/schema';
import { env } from '../env';

// Discord webhook service
export const discordService = {
  // Create a new webhook configuration
  async createWebhook(webhookData: Omit<NewDiscordWebhook, 'id' | 'createdAt' | 'updatedAt'>) {
    const [newWebhook] = await db.insert(discordWebhooks).values(webhookData).returning();

    return newWebhook || null;
  },

  // Get a webhook by ID
  async getWebhookById(id: number) {
    const [webhook] = await db.select().from(discordWebhooks).where(eq(discordWebhooks.id, id));
    return webhook || null;
  },

  // Update a webhook
  async updateWebhook(
    id: number,
    webhookData: Partial<Omit<NewDiscordWebhook, 'id' | 'createdAt' | 'updatedAt'>>,
  ) {
    const [updated] = await db
      .update(discordWebhooks)
      .set({
        ...webhookData,
        updatedAt: new Date(),
      })
      .where(eq(discordWebhooks.id, id))
      .returning();

    return updated || null;
  },

  // Delete a webhook
  async deleteWebhook(id: number) {
    await db.delete(discordWebhooks).where(eq(discordWebhooks.id, id));
    return true;
  },

  // List all webhooks
  async listWebhooks() {
    return await db.select().from(discordWebhooks);
  },

  // Send a notification to a webhook
  async sendWebhookNotification(
    webhookUrl: string,
    content: string,
    embeds: any[] = [],
    username?: string,
    avatarUrl?: string,
  ) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          embeds,
          username,
          avatar_url: avatarUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook error: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error sending Discord webhook:', error);
      throw error;
    }
  },

  // Notify about a new post via all enabled webhooks
  async notifyNewPost(post: Post, author: User) {
    // Get all enabled webhooks
    const webhooks = await db
      .select()
      .from(discordWebhooks)
      .where(eq(discordWebhooks.enabled, true));

    if (webhooks.length === 0) {
      // Check if we have a default webhook from environment variable
      if (!env.DISCORD_WEBHOOK_URL) {
        return false;
      }

      // Use default webhook
      return this.sendNewPostNotification(env.DISCORD_WEBHOOK_URL, post, author);
    }

    // Send to all matching webhooks
    const results = await Promise.allSettled(
      webhooks.map(async (webhook) => {
        // Check if webhook should be used for this category
        const categories = webhook.categories as string[] | null;
        if (
          categories &&
          Array.isArray(categories) &&
          categories.length > 0 &&
          post.category &&
          !categories.includes(post.category)
        ) {
          // Skip this webhook, category doesn't match
          return false;
        }

        return this.sendNewPostNotification(
          webhook.url,
          post,
          author,
          webhook.name || undefined,
          webhook.avatar || undefined,
        );
      }),
    );

    // Return true if at least one webhook succeeded
    return results.some((r) => r.status === 'fulfilled' && r.value);
  },

  // Send a notification about a new post to a specific webhook
  async sendNewPostNotification(
    webhookUrl: string,
    post: Post,
    author: User,
    username?: string,
    avatarUrl?: string,
  ) {
    // Format date
    const publishDate = post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Just now';

    // Create site URL for the post
    const siteUrl = env.NEXT_PUBLIC_SITE_URL || 'https://cptcr.dev';
    const postUrl = `${siteUrl}/blog/${post.slug}`;

    // Create embed
    const embed = {
      title: post.title,
      description: post.excerpt || '',
      url: postUrl,
      color: 0x3498db, // Blue
      fields: [
        {
          name: 'Category',
          value: post.category || 'Uncategorized',
          inline: true,
        },
        {
          name: 'Published',
          value: publishDate,
          inline: true,
        },
      ],
      author: {
        name: author.realName || author.username,
        icon_url: author.avatarUrl || undefined,
      },
      footer: {
        text: 'View the full post on our website',
      },
      timestamp: post.publishedAt || new Date().toISOString(),
    };

    // Create content message
    const content = `📝 **New Blog Post Published!** 📝\n${author.realName || author.username} just published a new post: "${post.title}"\n${postUrl}`;

    // Send notification
    return this.sendWebhookNotification(
      webhookUrl,
      content,
      [embed],
      username || 'Blog Notification',
      avatarUrl,
    );
  },
};
