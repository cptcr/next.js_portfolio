// components/admin/post-editor.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save, Eye, EyeOff, FileText, TagIcon, CheckCircle, AlertCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReactMarkdown from 'react-markdown'
import { cn } from "@/lib/utils/helpers"
import PostsList from "@/components/admin/posts-list"

interface PostFormData {
  title: string
  excerpt: string
  category: string
  content: string
  featured: boolean
}

export default function PostEditor() {
  const router = useRouter()
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    excerpt: "",
    category: "",
    content: "# Write your post here\n\nStart writing your blog post using markdown syntax.",
    featured: false
  })
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({})
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFeaturedChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      featured: checked
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({})

    try {
      // Validate form
      if (!formData.title.trim()) throw new Error("Title is required")
      if (!formData.excerpt.trim()) throw new Error("Short description is required")
      if (!formData.category.trim()) throw new Error("Category is required")
      if (!formData.content.trim()) throw new Error("Content is required")

      // Get token from localStorage
      const token = localStorage.getItem("adminToken")
      if (!token) {
        throw new Error("Authentication required")
      }

      // Submit the post
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          date: new Date().toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create post")
      }

      // Show success message
      setSubmitStatus({
        success: true,
        message: `Post "${formData.title}" created successfully!`
      })

      // Reset form after success
      setFormData({
        title: "",
        excerpt: "",
        category: "",
        content: "# Write your post here\n\nStart writing your blog post using markdown syntax.",
        featured: false
      })

      // Refresh blog posts list
      router.refresh()
    } catch (err) {
      setSubmitStatus({
        success: false,
        message: err instanceof Error ? err.message : "An unexpected error occurred"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("adminToken")
      setIsAuthenticated(false)
      router.push("/admin")
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center">
              <FileText className="mr-2 h-6 w-6 text-primary" />
              Blog Admin Panel
            </h1>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <Tabs defaultValue="create" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create New Post</TabsTrigger>
              <TabsTrigger value="manage">Manage Posts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="mt-6">
              {submitStatus.message && (
                <div className={cn(
                  "mb-6 p-4 rounded-md flex items-center",
                  submitStatus.success 
                    ? "bg-green-500/10 text-green-500" 
                    : "bg-red-500/10 text-red-500"
                )}>
                  {submitStatus.success ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2" />
                  )}
                  <p>{submitStatus.message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Title *
                      </label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Post title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="excerpt" className="text-sm font-medium">
                        Short Description *
                      </label>
                      <Textarea
                        id="excerpt"
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleInputChange}
                        placeholder="A brief description of the post"
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium flex items-center">
                        <TagIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                        Category *
                      </label>
                      <Input
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="e.g. Next.js, TypeScript, etc."
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="featured"
                          checked={formData.featured}
                          onCheckedChange={handleFeaturedChange}
                        />
                        <Label htmlFor="featured">
                          Featured Post
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Featured posts appear in the highlighted section of the blog
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="content" className="text-sm font-medium">
                      Content *
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      {previewMode ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Edit Mode
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </>
                      )}
                    </Button>
                  </div>

                  <Tabs defaultValue="edit" value={previewMode ? "preview" : "edit"}>
                    <TabsContent value="edit" className="mt-0">
                      <Textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="Write your post content in markdown format"
                        className="min-h-[400px] font-mono"
                        required
                      />
                    </TabsContent>
                    <TabsContent value="preview" className="mt-0">
                      <div className="border rounded-md p-4 min-h-[400px] prose prose-invert max-w-none">
                        <ReactMarkdown>
                          {formData.content}
                        </ReactMarkdown>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    type="submit"
                    className="min-w-[120px]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Post
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="manage" className="mt-6">
              <PostsList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}