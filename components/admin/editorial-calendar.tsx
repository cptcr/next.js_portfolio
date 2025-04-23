"use client"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isSameDay, startOfMonth, startOfToday, subMonths } from "date-fns"
import {
    AlertCircle,
    ArrowRight,
    Calendar as CalendarIcon,
    ChevronLeft, ChevronRight,
    Clock,
    Edit,
    FileText,
    Filter,
    Loader2,
    MoreHorizontal,
    Plus,
    Tag,
    Trash2
} from "lucide-react"
import { useEffect, useState } from "react"

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
      days.push(<div key={`empty-${i}`} className="h-24 p-1 border border-border bg-muted/20"></div>)
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
          <div className="flex items-start justify-between">
            <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
              {format(day, 'd')}
            </span>
            {postsForDay.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {postsForDay.length}
              </Badge>
            )}
          </div>
          <div className="mt-1 space-y-1 overflow-hidden max-h-16">
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Editorial Calendar</h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
          >
            <CalendarIcon className="w-4 h-4 mr-1" />
            Today
          </Button>
          
          <div className="flex items-center border rounded-md border-border">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 rounded-r-none" 
              onClick={prevMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-2 font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 rounded-l-none" 
              onClick={nextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
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
          <Tag className="w-4 h-4 text-muted-foreground" />
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
          <Plus className="w-4 h-4 mr-1" />
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
            <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
            <h3 className="mb-2 text-lg font-medium">Error Loading Calendar</h3>
            <p className="mb-4 text-center text-muted-foreground">{error}</p>
            <Button onClick={fetchPosts}>Retry</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-px mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2 text-sm font-medium text-center">
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openAddPostDialog(selectedDate)}
              >
                <Plus className="w-4 h-4 mr-1" />
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
                    className="flex items-center justify-between p-3 transition-colors border rounded-md cursor-pointer bg-card border-border hover:border-primary"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
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
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditPostDialog(post)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Post
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRescheduleDialog(post)}>
                            <Clock className="w-4 h-4 mr-2" />
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-500"
                            onClick={() => {
                              setPostToDelete(post.id)
                              setDeleteConfirmOpen(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                <h3 className="mb-2 text-lg font-medium">No Posts Scheduled</h3>
                <p className="mb-4 text-muted-foreground">
                  There are no posts scheduled for this date. 
                </p>
                <Button 
                  variant="outline"
                  onClick={() => openAddPostDialog(selectedDate)}
                >
                  <Plus className="w-4 h-4 mr-2" />
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
          <CardTitle className="flex items-center text-lg">
            <FileText className="w-5 h-5 mr-2 text-primary" />
            All Posts ({filteredPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredPosts.length > 0 ? (
              filteredPosts.slice(0, 5).map(post => (
                <div 
                  key={post.id} 
                  className="flex flex-col justify-between p-3 transition-colors border rounded-md cursor-pointer bg-card border-border sm:flex-row sm:items-center hover:border-primary"
                  onClick={() => openEditPostDialog(post)}
                >
                  <div className="flex-1 mb-2 sm:mb-0">
                    <div className="flex flex-col gap-2 mb-1 sm:flex-row sm:items-center">
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
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(post.date), 'PPp')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditPostDialog(post)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPostToDelete(post.id)
                        setDeleteConfirmOpen(true)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                <h3 className="mb-2 text-lg font-medium">No Posts Found</h3>
                <p className="mb-4 text-muted-foreground">
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
                <ArrowRight className="w-4 h-4 ml-2" />
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
          
          <div className="my-2 space-y-4">
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
                    className="justify-start w-full font-normal text-left"
                    id="post-date"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
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
                <div className="flex-1 space-y-2">
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
              <p className="mt-1 text-xs text-muted-foreground">
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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