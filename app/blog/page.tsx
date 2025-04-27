// app/blog/page.tsx
import { Metadata } from "next";
import { postsService } from "@/lib/services/posts";
import { settingsService } from "@/lib/services/settings";
import BlogList, { BlogPost } from "@/components/blog/blog-list";

export const metadata: Metadata = {
  title: "Blog | Tony (cptcr)",
  description: "Tony's blog about backend development, Next.js, TypeScript, and web technologies.",
};

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BlogPage() {
  // Fetch settings
  const siteSettings = await settingsService.getAllSettings();
  const postsPerPage = siteSettings.posts_per_page || 9;
  const showFeaturedPosts = siteSettings.show_featured_posts !== false;
  
  // Fetch all posts server-side using our posts service
  const posts = await postsService.listPosts({ 
    limit: postsPerPage,
    offset: 0
  });
  
  // Get all categories for filters
  const categories = await postsService.getAllCategories();
  
  // If showing featured posts is enabled, get them separately
  let featuredPosts: BlogPost[] = [];
  if (showFeaturedPosts) {
    const featuredData = await postsService.listPosts({
      limit: siteSettings.featured_post_limit || 3,
      featured: true
    });
    
    // Transform the featured posts to match the expected BlogPost type
    featuredPosts = featuredData.map(post => ({
      slug: post.slug,
      title: post.title,
      date: post.publishedAt.toISOString(),
      excerpt: post.excerpt || "",
      content: post.content,
      readingTime: postsService.calculateReadingTime(post.content),
      category: post.category || "Uncategorized",
      featured: post.featured || false,
      author: post.author ? {
        id: post.author.id,
        username: post.author.username,
        realName: post.author.realName,
        avatarUrl: post.author.avatarUrl
      } : undefined
    }));
  }
  
  // Add reading time to each post and format data to match the BlogPost type
  const processedPosts: BlogPost[] = posts.map(post => ({
    slug: post.slug,
    title: post.title,
    date: post.publishedAt.toISOString(),
    excerpt: post.excerpt || "",
    content: post.content,
    readingTime: postsService.calculateReadingTime(post.content),
    category: post.category || "Uncategorized",
    featured: post.featured || false,
    author: post.author ? {
      id: post.author.id,
      username: post.author.username,
      realName: post.author.realName,
      avatarUrl: post.author.avatarUrl
    } : undefined
  }));

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
              posts={processedPosts} 
              featuredPosts={featuredPosts}
              categories={categories}
              showAuthorInfo={siteSettings.show_author_info !== false}
            />
          </div>
        </div>
      </section>
    </div>
  );
}