// lib/utils/markdown.ts

import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { list } from '@vercel/blob';

// Types for blog posts
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  readingTime: string;
  category: string;
  featured: boolean;
  url?: string; // URL to the blob
}

/**
 * Get all blog posts metadata
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    // List all blobs with the posts/ prefix
    const { blobs } = await list({ prefix: 'posts/' });
    
    if (blobs.length === 0) {
      return [];
    }

    // Process each blob to extract metadata
    const allPostsData = await Promise.all(
      blobs.map(async (blob) => {
        try {
          // Extract slug from the pathname
          const slug = blob.pathname.replace(/^posts\/|\.md$/g, '');
          
          // Fetch the markdown content
          const response = await fetch(blob.url);
          const fileContents = await response.text();

          // Parse metadata with gray-matter
          const { data, content } = matter(fileContents);

          // Calculate reading time (average reading speed: 200 words per minute)
          const wordCount = content.trim().split(/\s+/).length;
          const readingTimeMinutes = Math.ceil(wordCount / 200);
          
          // Format the post data
          return {
            slug,
            title: data.title,
            date: data.date,
            excerpt: data.excerpt || '',
            content: '', // We'll add content only when needed
            readingTime: `${readingTimeMinutes} min read`,
            category: data.category || 'Uncategorized',
            featured: data.featured || false,
            url: blob.url
          };
        } catch (error) {
          console.error(`Error processing post ${blob.url}:`, error);
          return null;
        }
      })
    );

    // Filter out any posts that failed to process and sort by date
    const validPosts = allPostsData.filter(Boolean) as BlogPost[];
    
    return validPosts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error("Error fetching all posts:", error);
    return [];
  }
}

/**
 * Get post slugs for static generation
 */
export async function getAllPostSlugs() {
  try {
    // List all blobs with the posts/ prefix
    const { blobs } = await list({ prefix: 'posts/' });
    
    return blobs.map(blob => {
      const slug = blob.pathname.replace(/^posts\/|\.md$/g, '');
      return {
        params: {
          slug,
        },
      };
    });
  } catch (error) {
    console.error("Error fetching post slugs:", error);
    return [];
  }
}

/**
 * Get a specific post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    // Find the specific post by listing with prefix
    const { blobs } = await list({ prefix: `posts/${slug}.md` });
    
    if (blobs.length === 0) {
      return null;
    }
    
    // Fetch the markdown content
    const response = await fetch(blobs[0].url);
    const fileContents = await response.text();
    
    // Parse metadata with gray-matter
    const { data, content } = matter(fileContents);
    
    // Process markdown content to HTML
    const processedContent = await remark()
      .use(html)
      .process(content);
    
    const contentHtml = processedContent.toString();
    
    // Calculate reading time
    const wordCount = content.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    
    // Return formatted post
    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt || '',
      content: contentHtml,
      readingTime: `${readingTimeMinutes} min read`,
      category: data.category || 'Uncategorized',
      featured: data.featured || false,
      url: blobs[0].url
    };
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}