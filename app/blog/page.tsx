// app/blog/page.tsx
import { Metadata } from "next"
import { postsService } from "@/lib/services/posts"
import { settingsService } from "@/lib/services/settings"
import BlogList from "@/components/blog/blog-list"

export const metadata: Metadata = {
  title: "Blog | Tony (cptcr)",
  description: "Tony's blog about backend development, Next.js, TypeScript, and web technologies.",
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  let featuredPosts = [];
  if (showFeaturedPosts) {
    featuredPosts = await postsService.listPosts({
      limit: siteSettings.featured_post_limit || 3,
      featured: true
    });
  }
  
  // Get all categories for filters
  const categories = await postsService.getAllCategories();
  
  // Add reading time to each post
  const postsWithReadingTime = posts.map(post => ({
    ...post,
    readingTime: postsService.calculateReadingTime(post.content)
  }));
  
  const featuredWithReadingTime = featuredPosts.map(post => ({
    ...post,
    readingTime: postsService.calculateReadingTime(post.content)
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
              posts={postsWithReadingTime} 
              featuredPosts={showFeaturedPosts ? featuredWithReadingTime : []}
              categories={categories}
              showAuthorInfo={siteSettings.show_author_info !== false}
            />
          </div>
        </div>
      </section>
    </div>
  )
}