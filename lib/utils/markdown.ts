// lib/utils/markdown.ts

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

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
}

const postsDirectory = path.join(process.cwd(), 'posts');

/**
 * Get all blog posts metadata
 */
export function getAllPosts(): BlogPost[] {
  // Ensure the posts directory exists
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  // Get all markdown files
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Get slug from filename
      const slug = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

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
      };
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Get post slugs for static generation
 */
export function getAllPostSlugs() {
  // Ensure the posts directory exists
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      return {
        params: {
          slug: fileName.replace(/\.md$/, ''),
        },
      };
    });
}

/**
 * Get a specific post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  // Ensure the posts directory exists
  if (!fs.existsSync(postsDirectory)) {
    return null;
  }

  const fullPath = path.join(postsDirectory, `${slug}.md`);
  
  // Check if the post exists
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  // Read markdown file
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
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
  };
}