// app/blog/page.tsx
import { Metadata } from "next";
import { getAllPosts } from "@/lib/utils/markdown";
import { settingsService } from "@/lib/services/settings";
import BlogList, { BlogPost } from "@/components/blog/blog-list";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Blog | Tony (cptcr)",
  description: "Tony's blog about backend development, Next.js, TypeScript, and web technologies.",
};

// Force dynamic rendering for all blog pages to ensure new posts are always visible
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching to always show the latest posts

export default async function BlogPage() {
  // Set no-cache headers to ensure fresh content
  const headersList = headers();
  
  // Fetch settings
  const siteSettings = await settingsService.getAllSettings();
  const postsPerPage = siteSettings.posts_per_page || 9;
  const showFeaturedPosts = siteSettings.show_featured_posts !== false;
  
  // Fetch all posts using the markdown utility
  // This will fetch directly from the blob storage without caching
  const allPosts = await getAllPosts();
  
  // Filter posts for pagination
  const posts = allPosts.slice(0, postsPerPage);
  
  // Get all categories for filters
  const categories = Array.from(new Set(allPosts.map(post => post.category)));
  
  // If showing featured posts is enabled, get them separately
  let featuredPosts: BlogPost[] = [];
  if (showFeaturedPosts) {
    featuredPosts = allPosts
      .filter(post => post.featured)
      .slice(0, siteSettings.featured_post_limit || 3);
  }

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
              posts={posts} 
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
