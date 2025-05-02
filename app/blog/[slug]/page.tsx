// app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPostSlugs } from '@/lib/utils/markdown';
import { headers } from 'next/headers';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  readingTime: string;
  category: string;
  featured: boolean;
  url?: string;
  author?: {
    id: number;
    username: string;
    realName: string | null;
    avatarUrl: string | null;
  } | null;
}

interface Props {
  params: {
    slug: string;
  };
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const headersList = headers();
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | ${post.author?.realName || post.author?.username}`,
    description: post.excerpt,
  };
}

// Generate static paths for initial build
// With dynamic rendering, these will be updated at runtime
export async function generateStaticParams() {
  const paths = await getAllPostSlugs();
  return paths;
}

export default async function BlogPostPage({ params }: Props) {
  const headersList = headers();
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-24">
      <article className="container max-w-3xl px-4 mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm">
            <Link href="/blog" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
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
              <Calendar className="w-4 h-4 mr-1" />
              <span>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="inline-flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              <span>{post.readingTime}</span>
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">{post.title}</h1>

          <p className="text-xl text-muted-foreground">{post.excerpt}</p>

          {/* Author information */}
          {post.author && (
            <div className="flex items-center pt-6 mt-6 border-t border-border">
              <div className="mr-4">
                {post.author.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.realName || post.author.username}
                    className="object-cover w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium">{post.author.realName || post.author.username}</div>
                <div className="text-sm text-muted-foreground">@{post.author.username}</div>
              </div>
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Article Footer */}
        <div className="pt-8 mt-12 border-t border-border">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to all posts
              </Link>
            </Button>

            <div className="text-sm text-muted-foreground">
              Share this article:
              <div className="flex items-center gap-2 mt-2">
                <Button asChild variant="ghost" size="icon" className="w-8 h-8">
                  <Link href="#" aria-label="Share on Twitter">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </Link>
                </Button>

                <Button asChild variant="ghost" size="icon" className="w-8 h-8">
                  <Link href="#" aria-label="Share on LinkedIn">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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
  );
}
