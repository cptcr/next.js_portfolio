"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, Clock, ArrowRight, Search } from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { BlogPost } from "@/lib/utils/markdown"

interface BlogListProps {
  posts: BlogPost[]
}

export default function BlogList({ posts }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // Ensure posts is an array before processing
  const validPosts = Array.isArray(posts) ? posts : [];
  
  // Get all unique categories
  const ALL_CATEGORIES = Array.from(new Set(
    validPosts
      .map(post => post?.category)
      .filter(Boolean) as string[]
  ));
  
  // Filter posts based on search query and selected category
  const filteredPosts = validPosts.filter(post => {
    // Safe check for required properties
    if (!post || typeof post !== 'object') return false;
    
    const title = post.title || '';
    const excerpt = post.excerpt || '';
    const category = post.category || '';
    
    const matchesSearch = 
      title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || category === selectedCategory;
    
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
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          
          {ALL_CATEGORIES.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Featured Posts */}
      {searchQuery === "" && selectedCategory === null && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {validPosts
              .filter(post => post?.featured)
              .map((post, index) => (
                <motion.div
                  key={post.slug || index}
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
            <p className="text-muted-foreground">
              No articles found for your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.slug || index}
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
  )
}

function BlogPostCard({ post }: { post: BlogPost }) {
  if (!post || typeof post !== 'object') {
    return null;
  }
  
  const {
    slug = '',
    title = '',
    excerpt = '',
    date = '',
    readingTime = '',
    category = '',
    featured = false
  } = post;
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
            {category}
          </span>
          
          {featured && (
            <span className="text-xs font-medium bg-secondary/10 text-secondary px-2 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>
        
        <CardTitle className="text-xl">
          <Link href={`/blog/${slug}`} className="hover:text-primary transition-colors truncate">
            {title}
          </Link>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-4 flex-grow">
        <p className="text-muted-foreground text-sm">
          {excerpt}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-0">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{date ? new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : 'No date'}</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{readingTime}</span>
          </div>
        </div>
        
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link href={`/blog/${slug}`}>
            Read More <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}