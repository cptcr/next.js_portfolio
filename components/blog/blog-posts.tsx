'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  category: string;
  featured: boolean;
}

// This would normally be fetched from a CMS or API
const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'building-scalable-apis-with-typescript',
    title: 'Building Scalable APIs with TypeScript and Node.js',
    excerpt:
      'Learn how to create robust and scalable APIs using TypeScript and Node.js, with best practices for error handling, validation, and authentication.',
    date: '2023-12-10',
    readingTime: '8 min read',
    category: 'Backend',
    featured: true,
  },
  {
    id: '2',
    slug: 'next-js-api-routes',
    title: 'Leveraging Next.js API Routes for Backend Functionality',
    excerpt:
      'Explore how to use Next.js API routes to create powerful backend functionality within your frontend application, with real-world examples.',
    date: '2023-11-25',
    readingTime: '6 min read',
    category: 'Next.js',
    featured: true,
  },
  {
    id: '3',
    slug: 'tailwind-css-best-practices',
    title: 'TailwindCSS Best Practices for Clean and Maintainable Code',
    excerpt:
      'Discover techniques for keeping your TailwindCSS codebase clean, organized, and maintainable as your project grows.',
    date: '2023-10-18',
    readingTime: '5 min read',
    category: 'CSS',
    featured: false,
  },
  {
    id: '4',
    slug: 'type-safety-in-react-applications',
    title: 'Achieving Complete Type Safety in React Applications',
    excerpt:
      'Learn how to leverage TypeScript to create fully type-safe React applications, from props and state to API responses and form handling.',
    date: '2023-09-30',
    readingTime: '7 min read',
    category: 'TypeScript',
    featured: false,
  },
  {
    id: '5',
    slug: 'optimizing-database-queries',
    title: 'Optimizing Database Queries for Better Performance',
    excerpt:
      'Practical tips and strategies for optimizing database queries in web applications to improve response times and reduce server load.',
    date: '2023-08-22',
    readingTime: '9 min read',
    category: 'Database',
    featured: true,
  },
  {
    id: '6',
    slug: 'authentication-strategies',
    title: 'Modern Authentication Strategies for Web Applications',
    excerpt:
      'An in-depth look at different authentication strategies for web applications, including JWT, OAuth, and session-based authentication.',
    date: '2023-07-15',
    readingTime: '10 min read',
    category: 'Security',
    featured: false,
  },
];

// All unique categories from blog posts
const ALL_CATEGORIES = Array.from(new Set(BLOG_POSTS.map((post) => post.category)));

export default function BlogPosts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter posts based on search query and selected category
  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search articles..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>

          {ALL_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Posts */}
      {searchQuery === '' && selectedCategory === null && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <BlogPostCard post={post} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Posts or Filtered Posts */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          {searchQuery || selectedCategory ? 'Search Results' : 'All Articles'}
        </h2>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found for your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <BlogPostCard post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
            {post.category}
          </span>

          {post.featured && (
            <span className="text-xs font-medium bg-secondary/10 text-secondary px-2 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>

        <CardTitle className="text-xl">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-primary transition-colors truncate"
          >
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4 flex-grow">
        <p className="text-muted-foreground text-sm">{post.excerpt}</p>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-0">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{post.readingTime}</span>
          </div>
        </div>

        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link href={`/blog/${post.slug}`}>
            Read More <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
