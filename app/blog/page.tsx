// app/blog/page.tsx
import { Metadata } from "next";
import { postsService } from "@/lib/services/posts";
import { settingsService } from "@/lib/services/settings";
import BlogList from "@/components/blog/blog-list";
import { BlogPost as MarkdownBlogPost } from "@/lib/utils/markdown";

export const metadata: Metadata = {
  title: "Blog | Tony (cptcr)",
  description: "Tony's blog about backend development, Next.js, TypeScript, and web technologies.",
};

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Create a new interface that matches the actual data structure
interface PostWithAuthor {
  id: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string | null;
  content: string;
  readingTime: string;
  category: string | null;
  featured: boolean | null;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId: number;
  author: {
    id: number;
    username: string;
    realName: string | null;
    avatarUrl: string | null;
  };
}

// Create a type conversion function to make TypeScript happy
function convertToMarkdownBlogPost(post: PostWithAuthor): MarkdownBlogPost {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt || "",  // Convert null to empty string
    content: post.content,
    readingTime: post.readingTime,
    category: post.category || "Uncategorized",  // Convert null to default
    featured: post.featured || false,  // Convert null to false
    author: post.author
  };
}

export default async function BlogPage() {
  // Fetch settings
  const siteSettings = await settingsService.getAllSettings();
  const postsPerPage = siteSettings.posts_per_page || 9;
  const showFeaturedPosts = siteSettings.show_featured_posts !== false;
  
  // Fetch all posts server-side using our posts service
  // Since we're using force-dynamic, this will fetch fresh data on each request
  const posts = await postsService.listPosts({ 
    limit: postsPerPage,
    offset: 0
  });
  
  // If showing featured posts is enabled, get them separately
  let featuredPostsData: PostWithAuthor[] = [];
  if (showFeaturedPosts) {
    const featuredPosts = await postsService.listPosts({
      limit: siteSettings.featured_post_limit || 3,
      featured: true
    });
    
    // Transform to include date property
    featuredPostsData = featuredPosts.map(post => ({
      ...post,
      date: post.publishedAt.toISOString(),
      readingTime: postsService.calculateReadingTime(post.content)
    }));
  }
  
  // Get all categories for filters
  const categories = await postsService.getAllCategories();
  
  // Add reading time to each post and format date
  const postsWithReadingTime = posts.map(post => ({
    ...post,
    date: post.publishedAt.toISOString(),
    readingTime: postsService.calculateReadingTime(post.content)
  }));

  // Convert the posts to the correct type for the BlogList component
  const convertedPosts = postsWithReadingTime.map(convertToMarkdownBlogPost);
  const convertedFeaturedPosts = featuredPostsData.map(convertToMarkdownBlogPost);

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              {siteSettings.blog_title || "Blog"}
            </h1>
            <p className="text-xl text-muted-foreground">
              {siteSettings.blog_description || 
                "Thoughts, tutorials, and insights on backend development, TypeScript, Next.js, and modern web technologies."}
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto">
            <BlogList 
              posts={convertedPosts} 
              featuredPosts={showFeaturedPosts ? convertedFeaturedPosts : []}
              categories={categories}
              showAuthorInfo={siteSettings.show_author_info !== false}
            />
          </div>
        </div>
      </section>
    </div>
  );
}