"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2, Save, Eye, EyeOff, FileText, Tag,
  Calendar as CalendarIcon, CheckCircle, AlertCircle
} from "lucide-react";
import {
  Button, Input, Textarea, Card, CardContent,
  CardDescription, CardFooter, CardHeader, CardTitle,
  Switch, Label, Tabs, TabsContent, TabsList,
  TabsTrigger, Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue, AlertDialog, AlertDialogAction,
  AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  Popover, PopoverContent, PopoverTrigger, Calendar
} from "@/components/ui";
import ReactMarkdown from 'react-markdown'
import { cn } from "@/lib/utils/helpers"
import { format, isValid } from "date-fns"

interface PostFormData {
  title: string
  excerpt: string
  category: string
  content: string
  featured: boolean
  date: string
  slug?: string
  isEdit?: boolean
}

const CATEGORIES = [
  "Next.js", "TypeScript", "React", "Backend", "Frontend",
  "API", "Database", "DevOps", "Tutorial", "Career", "Other"
]

export default function PostEditor() {
  const router = useRouter()

  const [previewMode, setPreviewMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message?: string }>({})
  const [customCategory, setCustomCategory] = useState("")
  const [showCustomCategory, setShowCustomCategory] = useState(false)

  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    excerpt: "",
    category: "",
    content: "# Write your post here\n\nStart writing your blog post using markdown syntax.",
    featured: false,
    date: new Date().toISOString(),
    isEdit: false
  })

  useEffect(() => {
    const isEditPath = window.location.pathname.match(/\/admin\/edit\/(.+)/)
    if (isEditPath) {
      const slug = isEditPath[1]

      const fetchPost = async () => {
        try {
          const token = localStorage.getItem("adminToken")
          if (!token) throw new Error("Not authenticated")

          const response = await fetch(`/api/admin/posts/${slug}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (!response.ok) throw new Error("Failed to fetch post")

          const post = await response.json()

          setFormData({
            title: post.title ?? "",
            excerpt: post.excerpt ?? "",
            category: post.category ?? "",
            content: post.content ?? "",
            featured: post.featured ?? false,
            date: post.date ?? new Date().toISOString(),
            slug,
            isEdit: true,
          })

          if (!CATEGORIES.includes(post.category)) {
            setCustomCategory(post.category)
            setShowCustomCategory(true)
          }
        } catch (error) {
          console.error("Error fetching post:", error)
          setSubmitStatus({ success: false, message: "Failed to load post for editing." })
        }
      }

      fetchPost()
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFeaturedChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, featured: checked }))
  }

  const handleCategoryChange = (value: string) => {
    if (value === "custom") {
      setShowCustomCategory(true)
      setFormData((prev) => ({ ...prev, category: customCategory }))
    } else {
      setShowCustomCategory(false)
      setCustomCategory("")
      setFormData((prev) => ({ ...prev, category: value }))
    }
  }

  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomCategory(value)
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      setFormData((prev) => ({ ...prev, date: date.toISOString() }))
    }
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) return showError("Title is required")
    if (!formData.excerpt.trim()) return showError("Short description is required")
    if (!formData.category.trim()) return showError("Category is required")
    if (!formData.content.trim()) return showError("Content is required")
    return true
  }

  const showError = (message: string) => {
    setSubmitStatus({ success: false, message })
    return false
  }

  const handleSubmit = async () => {
    setConfirmDialogOpen(false)
    setIsSubmitting(true)
    setSubmitStatus({})

    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem("adminToken")
      if (!token) throw new Error("Authentication required")

      const method = formData.isEdit ? "PUT" : "POST"
      const endpoint = formData.isEdit ? `/api/admin/posts/${formData.slug}` : "/api/admin/posts"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || `Failed to ${formData.isEdit ? "update" : "create"} post`)

      setSubmitStatus({
        success: true,
        message: `Post "${formData.title}" ${formData.isEdit ? "updated" : "created"} successfully!`,
      })

      if (!formData.isEdit) {
        setFormData({
          title: "",
          excerpt: "",
          category: "",
          content: "# Write your post here\n\nStart writing your blog post using markdown syntax.",
          featured: false,
          date: new Date().toISOString(),
          isEdit: false,
        })
        setCustomCategory("")
        setShowCustomCategory(false)
      }

      router.refresh()
    } catch (err) {
      setSubmitStatus({
        success: false,
        message: err instanceof Error ? err.message : "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscardChanges = () => {
    if (formData.isEdit) {
      router.push("/admin/dashboard?tab=posts")
    } else {
      setFormData({
        title: "",
        excerpt: "",
        category: "",
        content: "# Write your post here\n\nStart writing your blog post using markdown syntax.",
        featured: false,
        date: new Date().toISOString(),
        isEdit: false,
      })
      setCustomCategory("")
      setShowCustomCategory(false)
      setSubmitStatus({})
    }
  }

  return (
    <div>
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

      <form onSubmit={(e) => {
        e.preventDefault()
        setConfirmDialogOpen(true)
      }}>
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
                <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
                Category *
              </label>
              
              <Select
                value={CATEGORIES.includes(formData.category) ? formData.category : 'custom'}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Add Custom Category</SelectItem>
                </SelectContent>
              </Select>
              
              {showCustomCategory && (
                <div className="mt-2">
                  <Input
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={handleCustomCategoryChange}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                Publication Date
              </label>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(new Date(formData.date), 'PPP') : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date ? new Date(formData.date) : undefined}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
              
              <div className="mt-2 text-xs text-muted-foreground">
                <p>
                  This editor supports Markdown formatting:
                  <span className="font-mono ml-1">
                    # Heading, **bold**, *italic*, [link](url), `code`, etc.
                  </span>
                </p>
              </div>
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

        <div className="mt-6 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmDialogOpen(true)}
            disabled={isSubmitting}
          >
            {formData.isEdit ? "Discard Changes" : "Reset Form"}
          </Button>
          
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
                {formData.isEdit ? "Update Post" : "Save Post"}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog 
        open={confirmDialogOpen} 
        onOpenChange={setConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {formData.isEdit 
                ? "Update this post?" 
                : formData.title.trim() ? "Save this post?" : "Reset form?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {formData.isEdit 
                ? "Do you want to update this post with your changes?"
                : formData.title.trim() 
                  ? "Are you sure you want to save this post? This will publish it to your blog."
                  : "This will reset all form fields. Any unsaved changes will be lost."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={formData.title.trim() ? handleSubmit : handleDiscardChanges}
              disabled={isSubmitting}
              className={!formData.title.trim() ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {formData.isEdit 
                ? "Update Post" 
                : formData.title.trim() ? "Save Post" : "Reset Form"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}