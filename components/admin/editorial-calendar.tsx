// components/admin/editorial-calendar.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, 
  FileText, Edit, Check, Clock, Tag, Filter, AlertCircle,
  ArrowRight, ChevronDown, MoreHorizontal, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatDate } from "@/lib/utils/helpers"

// Types
interface CalendarPost {
  id: string
  title: string
  status: 'draft' | 'scheduled' | 'published'
  date?: string
  category: string
  excerpt?: string
}

// Helper functions for dates
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// Mock data for the calendar
const MOCK_POSTS: CalendarPost[] = [
  {
    id: "1",
    title: "Getting Started with Next.js and Vercel Blob Storage",
    status: "published",
    date: "2025-04-05T10:30:00.000Z",
    category: "Next.js",
    excerpt: "Learn how to integrate Vercel Blob Storage with your Next.js application for efficient file storage."
  },
  {
    id: "2",
    title: "TypeScript Best Practices for 2025",
    status: "published",
    date: "2025-04-12T09:15:00.000Z",
    category: "TypeScript",
    excerpt: "Discover the latest TypeScript patterns and practices for more maintainable code in 2025."
  },
  {
    id: "3",
    title: "Building a Blog Admin Dashboard with Next.js",
    status: "scheduled",
    date: "2025-04-25T12:00:00.000Z",
    category: "Next.js",
    excerpt: "Step-by-step guide to creating a powerful admin dashboard for your blog using Next.js and React."
  },
  {
    id: "4",
    title: "Performance Optimization Techniques for React Applications",
    status: "draft",
    category: "React",
    excerpt: "Learn how to identify and fix performance bottlenecks in your React applications."
  },
  {
    id: "5",
    title: "Using Tailwind CSS with Next.js",
    status: "scheduled",
    date: "2025-05-03T14:30:00.000Z",
    category: "CSS",
    excerpt: "A comprehensive guide to setting up and using Tailwind CSS in your Next.js projects."
  },
  {
    id: "6",
    title: "Advanced TypeScript Patterns for API Development",
    status: "draft",
    category: "TypeScript",
    excerpt: "Explore advanced TypeScript patterns for building type-safe and robust APIs."
  }
];

// Color mapping for status badges
const STATUS_COLORS = {
  draft: "bg-gray-500",
  scheduled: "bg-yellow-500",
  published: "bg-green-500",
};

export default function EditorialCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [posts, setPosts] = useState<CalendarPost[]>(MOCK_POSTS);
  const [isAddingPost, setIsAddingPost] = useState<boolean>(false);
  const [newPost, setNewPost] = useState<Partial<CalendarPost>>({
    title: "",
    category: "",
    status: "draft",
    excerpt: ""
  });
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Get all unique categories from posts
  const categories = Array.from(new Set(posts.map(post => post.category)));

  // Navigate to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Go to current month
  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };

  // Handle date selection
  const handleDateSelect = (date: number) => {
    const selectedDate = new Date(currentYear, currentMonth, date);
    setSelectedDate(selectedDate);
  };

  // Add a new post
  const handleAddPost = () => {
    if (!newPost.title) return;

    const id = Math.random().toString(36).substr(2, 9);
    const createdPost: CalendarPost = {
      id,
      title: newPost.title!,
      status: newPost.status as 'draft' | 'scheduled' | 'published',
      category: newPost.category || "Uncategorized",
      excerpt: newPost.excerpt,
      date: selectedDate ? selectedDate.toISOString() : undefined
    };

    setPosts([...posts, createdPost]);
    setNewPost({
      title: "",
      category: "",
      status: "draft",
      excerpt: ""
    });
    setIsAddingPost(false);
  };

  // Apply filters to posts
  const filteredPosts = posts.filter(post => {
    const matchesStatus = filterStatus === "all" || post.status === filterStatus;
    const matchesCategory = filterCategory === "all" || post.category === filterCategory;
    return matchesStatus && matchesCategory;
  });

  // Get posts for a specific date
  const getPostsForDate = (date: number) => {
    const targetDate = new Date(currentYear, currentMonth, date);
    return filteredPosts.filter(post => {
      if (!post.date) return false;
      const postDate = new Date(post.date);
      return (
        postDate.getDate() === targetDate.getDate() &&
        postDate.getMonth() === targetDate.getMonth() &&
        postDate.getFullYear() === targetDate.getFullYear()
      );
    });
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-border p-1 bg-muted/20"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = 
        day === today.getDate() && 
        currentMonth === today.getMonth() && 
        currentYear === today.getFullYear();
        
      const isSelected = 
        selectedDate && 
        day === selectedDate.getDate() && 
        currentMonth === selectedDate.getMonth() && 
        currentYear === selectedDate.getFullYear();
        
      const postsForDay = getPostsForDate(day);
      
      days.push(
        <div 
          key={day} 
          className={`h-24 min-h-[6rem] border border-border p-1 transition-colors ${
            isToday ? 'bg-primary/5 border-primary/30' : ''
          } ${
            isSelected ? 'ring-2 ring-primary ring-offset-1' : ''
          } hover:bg-muted/30 cursor-pointer`}
          onClick={() => handleDateSelect(day)}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
              {day}
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
              >
                {post.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

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
              {new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
          <Select defaultValue={filterStatus} onValueChange={setFilterStatus}>
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
          <Select defaultValue={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          size="sm" 
          className="ml-auto"
          onClick={() => setIsAddingPost(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Post
        </Button>
      </div>
      
      {/* Calendar */}
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
      
      {/* Post details for selected date */}
      {selectedDate && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </CardTitle>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingPost(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Post
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPosts.filter(post => {
              if (!post.date) return false;
              const postDate = new Date(post.date);
              return (
                postDate.getDate() === selectedDate.getDate() &&
                postDate.getMonth() === selectedDate.getMonth() &&
                postDate.getFullYear() === selectedDate.getFullYear()
              );
            }).length > 0 ? (
              <div className="space-y-2">
                {filteredPosts.filter(post => {
                  if (!post.date) return false;
                  const postDate = new Date(post.date);
                  return (
                    postDate.getDate() === selectedDate.getDate() &&
                    postDate.getMonth() === selectedDate.getMonth() &&
                    postDate.getFullYear() === selectedDate.getFullYear()
                  );
                }).map(post => (
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
                        {new Date(post.date!).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Post
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Clock className="h-4 w-4 mr-2" />
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">
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
                  onClick={() => setIsAddingPost(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule a Post
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Add new post dialog */}
      <Dialog open={isAddingPost} onOpenChange={setIsAddingPost}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Schedule New Post</DialogTitle>
            <DialogDescription>
              {selectedDate ? (
                <>Schedule a post for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</>
              ) : (
                <>Create a new post</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <div className="space-y-2">
              <Label htmlFor="post-title">Post Title</Label>
              <Input 
                id="post-title" 
                placeholder="Enter post title"
                value={newPost.title}
                onChange={e => setNewPost({...newPost, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="post-category">Category</Label>
                <Select 
                  value={newPost.category || ""} 
                  onValueChange={(value: any) => setNewPost({...newPost, category: value})}
                >
                  <SelectTrigger id="post-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                    <SelectItem value="new">+ Add New Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="post-status">Status</Label>
                <Select 
                  value={newPost.status || "draft"}
                  onValueChange={(value: any) => setNewPost({...newPost, status: value as any})}
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
                value={newPost.excerpt || ""}
                onChange={e => setNewPost({...newPost, excerpt: e.target.value})}
              />
            </div>
            
            {!selectedDate && (
              <div className="space-y-2">
                <Label htmlFor="post-date">Publication Date</Label>
                <Input 
                  id="post-date" 
                  type="datetime-local"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for draft posts
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddingPost(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddPost}
              disabled={!newPost.title}
            >
              {selectedDate ? 'Schedule Post' : 'Create Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
                  className="p-3 bg-card rounded-md border border-border flex items-center justify-between hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="flex-1">
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
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
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
    </div>
  )
}