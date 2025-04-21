import { Metadata } from "next"
import Link from "next/link"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

// This would normally be fetched from a CMS or API
const BLOG_POSTS = [
  {
    slug: "building-scalable-apis-with-typescript",
    title: "Building Scalable APIs with TypeScript and Node.js",
    excerpt: "Learn how to create robust and scalable APIs using TypeScript and Node.js, with best practices for error handling, validation, and authentication.",
    date: "2023-12-10",
    readingTime: "8 min read",
    category: "Backend",
    content: `
# Building Scalable APIs with TypeScript and Node.js

When building modern web applications, robust and scalable APIs are essential. In this article, I'll share my approach to creating high-performance APIs using TypeScript and Node.js.

## Why TypeScript for APIs?

TypeScript offers several advantages when building APIs:

1. **Type Safety**: Catch errors at compile time, not runtime
2. **Better Documentation**: Types serve as documentation
3. **Enhanced IDE Support**: Autocomplete and intellisense improve productivity
4. **Maintainability**: Easier to refactor and understand the codebase

## Project Structure

A well-organized project structure is crucial for maintainability. Here's what I typically use:

\`\`\`
src/
├── controllers/   # Request handlers
├── services/      # Business logic
├── models/        # Data models and types
├── middleware/    # Express middleware
├── utils/         # Helper functions
├── config/        # Configuration files
└── routes/        # API route definitions
\`\`\`

## Error Handling

Proper error handling is essential for any API. I recommend creating a centralized error handling system:

\`\`\`typescript
// src/utils/errors.ts
export class APIError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestError extends APIError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}
\`\`\`

Then create middleware to handle these errors:

\`\`\`typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { APIError } from '../utils/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode
      }
    });
  }
  
  // For unhandled errors
  console.error(err);
  return res.status(500).json({
    error: {
      message: 'Internal server error',
      statusCode: 500
    }
  });
}
\`\`\`

## Request Validation

Always validate incoming requests. I use [zod](https://github.com/colinhacks/zod) for schema validation:

\`\`\`typescript
// src/models/user.ts
import { z } from 'zod';

export const UserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().positive().optional()
});

export type User = z.infer<typeof UserSchema>;
\`\`\`

Then create middleware to validate requests:

\`\`\`typescript
// src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { BadRequestError } from '../utils/errors';

export const validate = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      const zodError = error;
      return next(
        new BadRequestError(\`Validation error: \${zodError.errors.join(', ')}\`)
      );
    }
  };
\`\`\`

## Authentication and Authorization

Security is critical for APIs. I recommend using JWT for authentication:

\`\`\`typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { APIError } from '../utils/errors';

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new APIError('Authentication required', 401));
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new APIError('Invalid token', 401));
  }
}
\`\`\`

## Performance Optimization

For high-performance APIs, consider these optimizations:

1. **Caching**: Use Redis for frequent queries
2. **Pagination**: Limit result sets for large collections
3. **Indexing**: Create proper database indexes
4. **Compression**: Enable gzip/brotli compression
5. **Rate Limiting**: Implement API rate limiting

## Conclusion

Building scalable APIs with TypeScript and Node.js requires thoughtful architecture and attention to detail. By following these patterns and best practices, you can create robust, maintainable, and high-performance APIs that will serve your applications well.

In future articles, I'll dive deeper into specific aspects of API development, including database optimization, testing strategies, and deployment pipelines.
    `
  },
  {
    slug: "next-js-api-routes",
    title: "Leveraging Next.js API Routes for Backend Functionality",
    excerpt: "Explore how to use Next.js API routes to create powerful backend functionality within your frontend application, with real-world examples.",
    date: "2023-11-25",
    readingTime: "6 min read",
    category: "Next.js",
    content: `
# Leveraging Next.js API Routes for Backend Functionality

Next.js API routes provide a powerful way to build backend functionality directly within your Next.js application. In this article, I'll show you how to make the most of this feature.

## What Are API Routes?

API routes allow you to create API endpoints as part of your Next.js application. Any file inside the \`pages/api\` directory (or \`app/api\` in the App Router) is treated as an API endpoint instead of a page.

## Basic Example

Let's start with a simple API route:

\`\`\`typescript
// pages/api/hello.ts
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ message: 'Hello from Next.js!' })
}
\`\`\`

## Request Methods

API routes support all HTTP methods. You can handle different methods in a single file:

\`\`\`typescript
// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      // Handle GET request
      return res.status(200).json({ users: ['John', 'Jane'] })
    case 'POST':
      // Handle POST request
      return res.status(201).json({ message: 'User created' })
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(\`Method \${req.method} Not Allowed\`)
  }
}
\`\`\`

## Dynamic API Routes

You can create dynamic API routes using the same file naming pattern as dynamic pages:

\`\`\`typescript
// pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  res.status(200).json({ id, name: \`User \${id}\` })
}
\`\`\`

## Middleware for API Routes

You can create middleware functions to handle common tasks like authentication:

\`\`\`typescript
// middleware/withAuth.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Check for auth token
    const token = req.headers.authorization
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    
    // Call the original handler
    return handler(req, res)
  }
}
\`\`\`

Then use it in your API route:

\`\`\`typescript
// pages/api/protected.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../middleware/withAuth'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: 'Protected data' })
}

export default withAuth(handler)
\`\`\`

## Conclusion

Next.js API Routes are a powerful tool that allow you to build full-stack applications within a single Next.js project. By leveraging them effectively, you can create secure, efficient backend functionality that seamlessly integrates with your frontend.
    `
  }
]

interface Props {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = BLOG_POSTS.find(post => post.slug === params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }
  
  return {
    title: `${post.title} | Tony (cptcr)`,
    description: post.excerpt,
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = BLOG_POSTS.find(post => post.slug === params.slug)
  
  if (!post) {
    notFound()
  }
  
  return (
    <div className="min-h-screen pt-24">
      <article className="container px-4 max-w-3xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm">
            <Link href="/blog" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to all posts
            </Link>
          </Button>
        </div>
        
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
              {post.category}
            </span>
            
            <div className="inline-flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            
            <div className="inline-flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{post.readingTime}</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {post.title}
          </h1>
          
          <p className="text-xl text-muted-foreground">
            {post.excerpt}
          </p>
        </header>
        
        {/* Article Content */}
        <div className="prose prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }} />
        </div>
        
        {/* Article Footer */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to all posts
              </Link>
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Share this article:
              <div className="flex items-center gap-2 mt-2">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href="#" aria-label="Share on Twitter">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href="#" aria-label="Share on LinkedIn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

// Very simple markdown to HTML conversion
// In a real app, you'd use a library like marked or remark
function markdownToHtml(markdown: string): string {
  // Convert headers
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    
    // Convert lists
    .replace(/^\*\s(.*)$/gm, '<li>$1</li>')
    .replace(/<\/li>\n<li>/g, '</li><li>')
    .replace(/<li>(.*)<\/li>/g, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\n<ul>/g, '')
    
    // Convert numbered lists
    .replace(/^\d\.\s(.*)$/gm, '<li>$1</li>')
    .replace(/<\/li>\n<li>/g, '</li><li>')
    .replace(/<li>(.*)<\/li>/g, '<ol><li>$1</li></ol>')
    .replace(/<\/ol>\n<ol>/g, '')
    
    // Convert emphasis
    .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*)\*/g, '<em>$1</em>')
    
    // Convert code blocks
    .replace(/```(.*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    
    // Convert inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Convert paragraphs
    .replace(/^(?!<[a-z]).+$/gm, '<p>$&</p>')
    .replace(/<\/p>\n<p>/g, '</p><p>')

  return html
}