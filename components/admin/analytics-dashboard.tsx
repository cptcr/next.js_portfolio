"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, LineChart as LineChartIcon, PieChartIcon, 
  Users, ArrowUp, ArrowDown, ArrowRight,
  Filter, Download, RefreshCw, Loader2, AlertCircle, FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

// Types
interface PostMetadata {
  slug: string
  title: string
  date: string
  category: string
  featured: boolean
  url: string
  createdAt: string
  size: number
}

interface AnalyticsOverview {
  totalPosts: number
  newPosts: number
  averagePostSize: number
  categoryCounts: Record<string, number>
  categories: Array<{
    name: string
    count: number
    percentage: number
  }>
}

interface TimelineData {
  date: string
  count: number
}

// Category colors for charts
const CATEGORY_COLORS = [
  "#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6", 
  "#1abc9c", "#d35400", "#34495e", "#7f8c8d", "#16a085",
  "#27ae60", "#2980b9", "#8e44ad", "#f1c40f", "#e67e22"
];

export default function AnalyticsDashboard() {
  // State
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("month")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Data state
  const [overviewData, setOverviewData] = useState<AnalyticsOverview | null>(null)
  const [postsData, setPostsData] = useState<PostMetadata[] | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineData[] | null>(null)
  const [featuredPosts, setFeaturedPosts] = useState<PostMetadata[] | null>(null)
  
  // Fetch all analytics data
  const fetchAllAnalytics = async (shouldRefresh = false) => {
    if (shouldRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    
    setError(null)
    
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        throw new Error("Authentication required")
      }
      
      // Fetch all analytics data in parallel
      const [overviewResult, postsResult, timelineResult, featuredResult] = await Promise.all([
        fetchAnalyticsData('overview', token),
        fetchAnalyticsData('posts', token),
        fetchAnalyticsData('timeline', token),
        fetchAnalyticsData('featured', token)
      ])
      
      setOverviewData(overviewResult)
      setPostsData(postsResult)
      setTimelineData(timelineResult)
      setFeaturedPosts(featuredResult)
      
    } catch (err) {
      console.error("Failed to fetch analytics:", err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }
  
  // Helper function to fetch specific analytics data
  const fetchAnalyticsData = async (type: string, token: string) => {
    const response = await fetch(`/api/admin/analytics?type=${type}&period=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch ${type} analytics`)
    }
    
    const result = await response.json()
    return result.data
  }
  
  // Fetch data on mount and when time range changes
  useEffect(() => {
    fetchAllAnalytics()
  }, [timeRange])
  
  // Format bytes to human-readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Loading analytics data...</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error && !overviewData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-500/10 p-6 rounded-lg">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Analytics</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button 
              onClick={() => fetchAllAnalytics()} 
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  // If data hasn't loaded yet, don't render anything
  if (!overviewData || !postsData || !timelineData) {
    return null
  }
  
  // Calculate the period description for display
  const periodDescription = timeRange === 'day' ? 'last 24 hours' : 
                          timeRange === 'week' ? 'last 7 days' : 
                          'last 30 days'
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Analytics</h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
            onClick={() => fetchAllAnalytics(true)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Posts" 
          value={overviewData.totalPosts.toString()} 
          icon={<FileText className="h-5 w-5 text-blue-500" />}
          isLoading={isRefreshing}
        />
        
        <StatCard 
          title={`New Posts (${periodDescription})`}
          value={overviewData.newPosts.toString()} 
          icon={<BarChart3 className="h-5 w-5 text-green-500" />}
          isLoading={isRefreshing}
        />
        
        <StatCard 
          title="Average Post Size" 
          value={formatBytes(overviewData.averagePostSize)} 
          icon={<FileText className="h-5 w-5 text-purple-500" />}
          isLoading={isRefreshing}
        />
        
        <StatCard 
          title="Categories" 
          value={overviewData.categories.length.toString()} 
          icon={<PieChartIcon className="h-5 w-5 text-yellow-500" />}
          isLoading={isRefreshing}
        />
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Post Creation Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Post Creation Timeline</CardTitle>
              <CardDescription>
                New blog posts created over {periodDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timelineData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3498db" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey={(entry) => {
                        const date = new Date(entry.date);
                        if (timeRange === 'day') {
                          return date.toLocaleTimeString([], { hour: '2-digit' });
                        } else if (timeRange === 'week') {
                          return date.toLocaleDateString([], { weekday: 'short' });
                        } else {
                          return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                        }
                      }}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17,17,17,0.8)', 
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        borderRadius: '4px'
                      }}
                      formatter={(value) => [value.toString(), 'Posts Created']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3498db" 
                      fillOpacity={1} 
                      fill="url(#colorPosts)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>
                Distribution of your blog posts by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overviewData.categories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {overviewData.categories.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17,17,17,0.8)', 
                          borderColor: 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          borderRadius: '4px'
                        }}
                        formatter={(value, name, props) => {
                          return [`${value} posts (${props.payload.percentage}%)`, name];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-2">
                  {overviewData.categories.map((category, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 hover:bg-muted/20 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{category.count} posts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Featured Posts */}
          {featuredPosts && featuredPosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Featured Posts</CardTitle>
                <CardDescription>
                  Your highlighted blog posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {featuredPosts.slice(0, 5).map((post, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-card rounded-md border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:border-primary transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-sm">{post.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="whitespace-nowrap text-xs h-8"
                        asChild
                      >
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          View Post
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Posts</CardTitle>
              <CardDescription>
                Complete list of your blog posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Title</th>
                      <th className="py-3 px-4 text-left font-medium">Category</th>
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                      <th className="py-3 px-4 text-left font-medium">Size</th>
                      <th className="py-3 px-4 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postsData.map((post, index) => (
                      <tr key={index} className="border-b hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <a 
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {post.title}
                          </a>
                        </td>
                        <td className="py-3 px-4">{post.category}</td>
                        <td className="py-3 px-4">{new Date(post.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{formatBytes(post.size)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={post.featured ? "default" : "outline"}>
                            {post.featured ? "Featured" : "Regular"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing {postsData.length} of {overviewData.totalPosts} posts
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overviewData.categories.map((category, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                          />
                          {category.name}
                        </CardTitle>
                        <Badge>
                          {category.count} posts
                        </Badge>
                      </div>
                      <CardDescription>
                        {category.percentage}% of total posts
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {postsData
                          .filter(post => post.category === category.name)
                          .slice(0, 3)
                          .map((post, idx) => (
                            <div key={idx} className="text-sm truncate hover:text-primary">
                              <a 
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {post.title}
                              </a>
                            </div>
                          ))}
                        
                        {postsData.filter(post => post.category === category.name).length > 3 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-7 mt-1"
                          >
                            View all {postsData.filter(post => post.category === category.name).length} posts
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Category Comparison</CardTitle>
              <CardDescription>
                Post counts by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={overviewData.categories}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17,17,17,0.8)', 
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        borderRadius: '4px'
                      }}
                      formatter={(value) => [`${value} posts`, 'Count']}
                    />
                    <Bar 
                      dataKey="count" 
                      name="Posts" 
                      fill="#3498db"
                      radius={[4, 4, 0, 0]}
                    >
                      {overviewData.categories.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Real-time Data Summary */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-blue-500">Real-time Blog Insights</CardTitle>
          <CardDescription>
            Analytics based on your actual Vercel Blob Storage data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-background/50 rounded-md border border-border">
              <h3 className="text-sm font-medium mb-1">Content Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Your blog currently has {overviewData.totalPosts} posts across {overviewData.categories.length} categories, 
                with an average post size of {formatBytes(overviewData.averagePostSize)}.
              </p>
            </div>
            
            {overviewData.categories.length > 0 && (
              <div className="p-3 bg-background/50 rounded-md border border-border">
                <h3 className="text-sm font-medium mb-1">Category Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Your most popular category is "{overviewData.categories[0].name}" with {overviewData.categories[0].count} posts 
                  ({overviewData.categories[0].percentage}% of your content).
                </p>
              </div>
            )}
            
            {featuredPosts && featuredPosts.length > 0 && (
              <div className="p-3 bg-background/50 rounded-md border border-border">
                <h3 className="text-sm font-medium mb-1">Featured Content</h3>
                <p className="text-sm text-muted-foreground">
                  You have {featuredPosts.length} featured posts ({Math.round((featuredPosts.length / overviewData.totalPosts) * 100)}% of your content).
                  Your latest featured post is "{featuredPosts[0].title}".
                </p>
              </div>
            )}
            
            {overviewData.newPosts > 0 && (
              <div className="p-3 bg-background/50 rounded-md border border-border">
                <h3 className="text-sm font-medium mb-1">Recent Activity</h3>
                <p className="text-sm text-muted-foreground">
                  You've published {overviewData.newPosts} new posts in the {periodDescription}.
                  {overviewData.newPosts > 1 ? " Keep up the good work!" : " Great job!"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  change?: number
  isPositiveChangeGood?: boolean
  isLoading?: boolean
}

function StatCard({ 
  title, 
  value, 
  icon, 
  change, 
  isPositiveChangeGood = true,
  isLoading = false 
}: StatCardProps) {
  // Determine if change is positive or negative
  const isPositive = change ? change > 0 : false
  
  // Determine if the change is "good" based on context
  const isGoodChange = isPositiveChangeGood ? isPositive : !isPositive
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : (
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold">{value}</h3>
                {change !== undefined && (
                  <div className={`flex items-center text-xs font-medium ${isGoodChange ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(change).toFixed(1)}%
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-primary/10 p-2 rounded-md">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}