import { Metadata } from "next"
import { getAllPosts } from "@/lib/utils/markdown"
import BlogList from "@/components/blog/blog-list"

export const metadata: Metadata = {
  title: "Blog | Tony (cptcr)",
  description: "Tony's blog about backend development, Next.js, TypeScript, and web technologies.",
}

export default function BlogPage() {
  let posts;
  posts = "Hello World" as any;

  (async () => {
    posts = await getAllPosts();
  })();
  
  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Blog
            </h1>
            <p className="text-xl text-muted-foreground">
              Thoughts, tutorials, and insights on backend development, TypeScript, 
              Next.js, and modern web technologies.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto">
            <BlogList posts={posts} />
          </div>
        </div>
      </section>
    </div>
  )
}