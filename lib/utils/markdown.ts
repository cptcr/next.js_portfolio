// lib/utils/markdown.ts

import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { postsService } from '@/lib/services/posts';

/**
 * Get all blog posts metadata from the database
 */
export async function getAllPosts() {
  try {
    // Get posts from database service
    const posts = await postsService.listPosts({
      limit: 100, // Adjust as needed
    });

    // Process posts for display
    return posts.map(
      (post: {
        id: any;
        slug: any;
        title: any;
        publishedAt: { toISOString: () => any };
        excerpt: any;
        content: string;
        category: any;
        featured: any;
        author: any;
      }) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        date: post.publishedAt.toISOString(),
        excerpt: post.excerpt,
        content: post.content,
        readingTime: postsService.calculateReadingTime(post.content),
        category: post.category,
        featured: post.featured,
        author: post.author,
      }),
    );
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }
}

/**
 * Get post slugs for static generation
 */
export async function getAllPostSlugs() {
  try {
    // Get posts from database service
    const posts = await postsService.listPosts({
      limit: 100, // Adjust as needed
    });

    // Map posts to slug params format
    return posts.map((post: { slug: any }) => ({
      params: {
        slug: post.slug,
      },
    }));
  } catch (error) {
    console.error('Error fetching post slugs:', error);
    return [];
  }
}

/**
 * Get a specific post by slug
 */
export async function getPostBySlug(slug: string) {
  try {
    // Get post from database service
    const post = await postsService.getPostBySlug(slug);

    if (!post) {
      return null;
    }

    // Process post content if it's in markdown format
    let contentHtml = post.content;

    // Check if content might be markdown (not already HTML)
    if (!post.content.trim().startsWith('<')) {
      // Process markdown content to HTML
      const processedContent = await remark().use(html).process(post.content);

      contentHtml = processedContent.toString();
    }

    // Return processed post
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      date: post.publishedAt.toISOString(),
      excerpt: post.excerpt,
      content: contentHtml,
      readingTime: postsService.calculateReadingTime(post.content),
      category: post.category,
      featured: post.featured,
      author: post.author,
    };
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}
