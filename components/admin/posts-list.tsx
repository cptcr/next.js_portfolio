// components/admin/posts-list.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Edit, Trash2, FileText, Calendar, Tag, 
  Star, StarOff, RefreshCw, Loader2, AlertCircle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/helpers"

interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  category: string
  featured: boolean
}

export default function PostsList() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Fetch posts
  const fetchPosts = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch("/api/admin/posts", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`)
      }

      const data = await response.json()
      setPosts(data.posts || [])
    } catch (err) {
      console.error("Error fetching posts:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch posts")
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize
  useEffect(() => {
    fetchPosts()
  }, [])

  // Delete post handler
  const handleDeletePost = async (slug: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch(`/api/admin/posts/${slug}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.status}`)
      }

      // Refresh posts list
      fetchPosts()
      setDeleteConfirm(null)
    } catch (err) {
      console.error("Error deleting post:", err)
      setError(err instanceof Error ? err.message : "Failed to delete post")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-500 p-4 rounded-md flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Posts</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchPosts}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No posts found. Create your first post using the editor above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.slug}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center">
                      <Link 
                        href={`/blog/${post.slug}`} 
                        className="hover:text-primary transition-colors"
                        target="_blank"
                      >
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{post.excerpt}</CardDescription>
                  </div>
                  <div className="flex items-center">
                    {post.featured ? (
                      <Star className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span>{post.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{post.slug}.md</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {deleteConfirm === post.slug ? (
                  <>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeletePost(post.slug)}
                    >
                      Confirm
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      asChild
                    >
                      <Link href={`/admin/edit/${post.slug}`}>
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1 text-red-500 hover:text-red-700"
                      onClick={() => setDeleteConfirm(post.slug)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}