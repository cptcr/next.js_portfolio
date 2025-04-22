"use client"

import { useState, useEffect } from "react"
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, 
  FileText, Edit, Check, Clock, Tag, Filter, AlertCircle,
  ArrowRight, ChevronDown, MoreHorizontal, Trash2, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { format, startOfToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth, parse } from "date-fns"

// Types
interface CalendarPost {
  id: string
  slug?: string
  title: string
  status: 'draft' | 'scheduled' | 'published'
  date?: string
  category: string
  excerpt?: string
}

interface PostDialogState {
  isOpen: boolean
  mode: 'create' | 'edit' | 'reschedule'
  post: CalendarPost | null
  selectedDate: Date | null
}

interface MonthData {
  days: Date[]
  firstDayOfMonth: Date
  firstDayOffset: number
}

// Color mapping for status badges
const STATUS_COLORS = {
  draft: "bg-gray-500",
  scheduled: "bg-yellow-500",
  published: "bg-green-500",
}

// Sample categories
const CATEGORIES = [
  "Next.js",
  "TypeScript",
  "React",
  "Backend",
  "Frontend",
  "API",
  "Database",
  "DevOps",
  "Tutorial",
  "Career",
  "Other"
]

export default function EditorialCalendar() {
  const today = startOfToday()
  const [currentMonth, setCurrentMonth] = useState<Date>(today)
  const [selectedDate, setSelectedDate] = useState<Date | null>(today)
  const [monthData, setMonthData] = useState<MonthData>({
    days: [],
    firstDayOfMonth: startOfMonth(today),
    firstDayOffset: getDay(startOfMonth(today))
  })
  
  const [posts, setPosts] = useState<CalendarPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<CalendarPost[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [dialogState, setDialogState] = useState<PostDialogState>({
    isOpen: false,
    mode: 'create',
    post: null,
    selectedDate: null
  })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)

  // Initialize month data
  useEffect(() => {
    updateMonthData(currentMonth)
  }, [currentMonth])

  // Fetch posts from the API
  useEffect(() => {
    fetchPosts()
  }, [])

  // Apply filters when filter settings or posts change
  useEffect(() => {
    applyFilters()
  }, [posts, filterStatus, filterCategory])

  // Update month data when current month changes
  const updateMonthData = (date: Date) => {
    const firstDay = startOfMonth(date)
    const lastDay = endOfMonth(date)
    const days = eachDayOfInterval({ start: firstDay, end: lastDay })
    const firstDayOffset = getDay(firstDay)
    
    setMonthData({
      days,
      firstDayOfMonth: firstDay,
      firstDayOffset
    })
  }

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
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
      
      // Map API response to CalendarPost format
      const fetchedPosts = data.posts.map((post: any): CalendarPost => ({
        id: post.slug,
        slug: post.slug,
        title: post.title,
        status: post.date ? (new Date(post.date) > new Date() ? 'scheduled' : 'published') : 'draft',
        date: post.date,
        category: post.category,
        excerpt: post.excerpt
      }))
      
      setPosts(fetchedPosts)
      setFilteredPosts(fetchedPosts)
    } catch (err) {
      console.error("Error fetching posts:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch posts")
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters to posts
  const applyFilters = () => {
    let filtered = [...posts]
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(post => post.status === filterStatus)
    }
    
    if (filterCategory !== "all") {
      filtered = filtered.filter(post => post.category === filterCategory)
    }
    
    setFilteredPosts(filtered)
  }

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Go to current month
  const goToToday = () => {
    setCurrentMonth(today)
    setSelectedDate(today)
  }

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  // Open dialog to add a new post
  const openAddPostDialog = (date: Date | null = null) => {
    // Generate a unique ID
    const id = Math.random().toString(36).substring(2, 11)
    
    setDialogState({
      isOpen: true,
      mode: 'create',
      post: {
        id,
        title: "",
        status: "draft",
        category: "",
        excerpt: ""
      },
      selectedDate: date
    })
  }

  // Open dialog to edit a post
  const openEditPostDialog = (post: CalendarPost) => {
    setDialogState({
      isOpen: true,
      mode: 'edit',
      post: { ...post },
      selectedDate: post.date ? new Date(post.date) : null
    })
  }

  // Open dialog to reschedule a post
  const openRescheduleDialog = (post: CalendarPost) => {
    setDialogState({
      isOpen: true,
      mode: 'reschedule',
      post: { ...post },
      selectedDate: post.date ? new Date(post.date) : null
    })
  }

  // Submit new/edited post
  const handleSubmitPost = async () => {
    if (!dialogState.post) return
    
    const newPost = dialogState.post
    
    // Set date if selected
    if (dialogState.selectedDate) {
      // Create date including time if one was already set
      if (newPost.date) {
        const existingDate = new Date(newPost.date)
        const newDate = new Date(dialogState.selectedDate)
        newDate.setHours(existingDate.getHours())
        newDate.setMinutes(existingDate.getMinutes())
        newPost.date = newDate.toISOString()
      } else {
        // Just use the selected date with default time (now)
        newPost.date = dialogState.selectedDate.toISOString()
      }
    }
    
    try {
      setIsSubmitting(true)
      
      // In a real implementation, we would save to the API here
      // For now, we'll just update the local state
      
      if (dialogState.mode === 'create') {
        // In a real app, call the API to create the post
        setPosts([...posts, newPost])
      } else {
        // For edit and reschedule modes, update the existing post
        setPosts(posts.map(post => 
          post.id === newPost.id ? newPost : post
        ))
      }
      
      // Close the dialog
      setDialogState({
        isOpen: false,
        mode: 'create',
        post: null,
        selectedDate: null
      })
    } catch (error) {
      console.error("Error saving post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle post deletion
  const handleDeletePost = () => {
    if (!postToDelete) return
    
    // Filter out the post to delete
    setPosts(posts.filter(post => post.id !== postToDelete))
    
    // Close the dialog
    setDeleteConfirmOpen(false)
    setPostToDelete(null)
  }

  // Update post field in dialog
  const updatePostField = (field: keyof CalendarPost, value: any) => {
    if (!dialogState.post) return
    
    setDialogState({
      ...dialogState,
      post: {
        ...dialogState.post,
        [field]: value
      }
    })
  }

  // Check if a post is scheduled for a specific date
  const isPostOnDate = (post: CalendarPost, date: Date): boolean => {
    if (!post.date) return false
    const postDate = new Date(post.date)
    return isSameDay(postDate, date)
  }

  // Get posts for a specific date
  const getPostsForDate = (date: Date) => {
    return filteredPosts.filter(post => isPostOnDate(post, date))
  }

  // Get all categories from posts
  const allCategories = Array.from(new Set(posts.map(post => post.category)))
    .filter(Boolean) as string[]

  // Render calendar days
  const renderCalendarDays = () => {
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < monthData.firstDayOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-border p-1 bg-muted/20"></div>)
    }

    // Add cells for each day of the month
    monthData.days.forEach(day => {
      const isToday = isSameDay(day, today)
      const isSelected = selectedDate && isSameDay(day, selectedDate)
      const postsForDay = getPostsForDate(day)
      
      days.push(
        <div 
          key={day.toString()} 
          className={`h-24 min-h-[6rem] border border-border p-1 transition-colors ${
            isToday ? 'bg-primary/5 border-primary/30' : ''
          } ${
            isSelected ? 'ring-2 ring-primary ring-offset-1' : ''
          } hover:bg-muted/30 cursor-pointer`}
          onClick={() => handleDateSelect(day)}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
              {format(day, 'd')}
            </span>
            {postsForDay.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {postsForDay.length}
              </Badge>
            )}
          </div>
          <div className="mt-1 space-y-1 max-h-16 overflow-hidden">
            {postsForDay.map(post => (
              <div 
                key={post.id}
                className={`text-xs truncate p-1 rounded ${
                  post.status === 'published' ? 'bg-green-500/10 text-green-500' : 
                  post.status === 'scheduled' ? 'bg-yellow-500/10 text-yellow-500' : 
                  'bg-gray-500/10 text-gray-500'
                }`}
                title={post.title}
                onClick={(e) => {
                  e.stopPropagation()
                  openEditPostDialog(post)
                }}
              >
                {post.title}
              </div>
            ))}
          </div>
        </div>
      )
    })

    return days
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Editorial Calendar</h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            Today
          </Button>
          
          <div className="flex items-center border border-border rounded-md">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-r-none" 
              onClick={prevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-2 font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-l-none" 
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          size="sm" 
          className="ml-auto"
          onClick={() => openAddPostDialog(selectedDate)}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Post
        </Button>
      </div>
      
      {/* Calendar */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-[calc(24px*6)] w-full" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Calendar</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={fetchPosts}>Retry</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-px mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium text-sm py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px">
              {renderCalendarDays()}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Post details for selected date */}
      {selectedDate && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openAddPostDialog(selectedDate)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Post
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {getPostsForDate(selectedDate).length > 0 ? (
              <div className="space-y-2">
                {getPostsForDate(selectedDate).map(post => (
                  <div 
                    key={post.id} 
                    className="p-3 bg-card rounded-md border border-border flex items-center justify-between hover:border-primary transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          post.status === 'published' ? 'bg-green-500' : 
                          post.status === 'scheduled' ? 'bg-yellow-500' : 
                          'bg-gray-500'
                        }`}
                      />
                      <span className="font-medium">{post.title}</span>
                      <Badge variant="outline" className="w-fit">
                        {post.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {post.date ? format(new Date(post.date), 'h:mm a') : 'No time set'}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditPostDialog(post)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Post
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRescheduleDialog(post)}>
                            <Clock className="h-4 w-4 mr-2" />
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-500"
                            onClick={() => {
                              setPostToDelete(post.id)
                              setDeleteConfirmOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">No Posts Scheduled</h3>
                <p className="text-muted-foreground mb-4">
                  There are no posts scheduled for this date. 
                </p>
                <Button 
                  variant="outline"
                  onClick={() => openAddPostDialog(selectedDate)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule a Post
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Post list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            All Posts ({filteredPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredPosts.length > 0 ? (
              filteredPosts.slice(0, 5).map(post => (
                <div 
                  key={post.id} 
                  className="p-3 bg-card rounded-md border border-border flex flex-col sm:flex-row sm:items-center justify-between hover:border-primary transition-colors cursor-pointer"
                  onClick={() => openEditPostDialog(post)}
                >
                  <div className="flex-1 mb-2 sm:mb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <span className="font-medium">{post.title}</span>
                      <Badge variant="outline" className="w-fit">
                        {post.category}
                      </Badge>
                      <Badge 
                        className={`w-fit ${
                          post.status === 'published' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 
                          post.status === 'scheduled' ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' : 
                          'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
                        }`}
                        variant="outline"
                      >
                        {post.status === 'published' ? 'Published' : 
                         post.status === 'scheduled' ? 'Scheduled' :
                         'Draft'}
                      </Badge>
                    </div>
                    
                    {post.date && (
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(post.date), 'PPp')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditPostDialog(post)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPostToDelete(post.id)
                        setDeleteConfirmOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">No Posts Found</h3>
                <p className="text-muted-foreground mb-4">
                  No posts match your current filter settings.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setFilterStatus("all");
                    setFilterCategory("all");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
            
            {filteredPosts.length > 5 && (
              <Button 
                variant="ghost" 
                className="w-full mt-2" 
                size="sm"
              >
                View All Posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Post Dialog */}
      <Dialog open={dialogState.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDialogState({...dialogState, isOpen: false})
        }
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {dialogState.mode === 'create' ? 'Schedule New Post' : 
               dialogState.mode === 'edit' ? 'Edit Post' : 'Reschedule Post'}
            </DialogTitle>
            <DialogDescription>
              {dialogState.selectedDate ? (
                <>
                  {dialogState.mode === 'create' ? 'Schedule a post for ' : 
                   dialogState.mode === 'edit' ? 'Edit post scheduled for ' : 
                   'Reschedule post to '}{format(dialogState.selectedDate, 'MMMM d, yyyy')}
                </>
              ) : (
                <>
                  {dialogState.mode === 'create' ? 'Create a new post' : 
                   dialogState.mode === 'edit' ? 'Edit your post' : 
                   'Reschedule your post'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            {dialogState.mode !== 'reschedule' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="post-title">Post Title</Label>
                  <Input 
                    id="post-title" 
                    placeholder="Enter post title"
                    value={dialogState.post?.title || ''}
                    onChange={(e) => updatePostField('title', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="post-category">Category</Label>
                    <Select 
                      value={dialogState.post?.category || ''} 
                      onValueChange={(value) => updatePostField('category', value)}
                    >
                      <SelectTrigger id="post-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                        <SelectItem value="custom">+ Add Custom Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="post-status">Status</Label>
                    <Select 
                      value={dialogState.post?.status || 'draft'}
                      onValueChange={(value: any) => updatePostField('status', value)}
                    >
                      <SelectTrigger id="post-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="post-excerpt">Excerpt</Label>
                  <Textarea 
                    id="post-excerpt" 
                    placeholder="Brief description of the post" 
                    className="min-h-[80px]"
                    value={dialogState.post?.excerpt || ''}
                    onChange={(e) => updatePostField('excerpt', e.target.value)}
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="post-date">Publication Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="post-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dialogState.selectedDate ? format(dialogState.selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dialogState.selectedDate || undefined}
                    onSelect={(date) => {
                      if (date) {
                        setDialogState({
                          ...dialogState,
                          selectedDate: date
                        })
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              {/* Time picker */}
              <div className="flex gap-2 mt-2">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="post-time">Time</Label>
                  <Input 
                    id="post-time" 
                    type="time"
                    defaultValue={dialogState.selectedDate ? 
                      format(dialogState.selectedDate, 'HH:mm') : '12:00'}
                    onChange={(e) => {
                      if (dialogState.selectedDate && e.target.value) {
                        const [hours, minutes] = e.target.value.split(':').map(Number)
                        const newDate = new Date(dialogState.selectedDate)
                        newDate.setHours(hours, minutes)
                        setDialogState({
                          ...dialogState,
                          selectedDate: newDate
                        })
                      }
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty for draft posts
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogState({...dialogState, isOpen: false})}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitPost}
              disabled={isSubmitting || (dialogState.mode !== 'reschedule' && !dialogState.post?.title)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                dialogState.mode === 'create' ? 'Schedule Post' : 
                dialogState.mode === 'edit' ? 'Update Post' : 
                'Reschedule Post'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}