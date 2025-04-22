"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Loader2, BarChart3, FileText, Settings, Users, 
  Calendar, LogOut, LayoutDashboard, Hexagon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import AnalyticsDashboard from "@/components/admin/analytics-dashboard"
import EditorialCalendar from "@/components/admin/editorial-calendar"
import PostEditor from "@/components/admin/post-editor"
import SettingsPanel from "@/components/admin/settings-panel"
import PostsList from "@/components/admin/posts-list"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("analytics")
  
  // Get URL search params to check for tab parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const tabParam = searchParams.get('tab')
      
      if (tabParam && ['analytics', 'posts', 'create', 'calendar', 'settings'].includes(tabParam)) {
        setActiveTab(tabParam)
      }
    }
  }, [])
  
  // Verify authentication on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem("adminToken")
        
        if (!token) {
          throw new Error("No token found")
        }

        const response = await fetch("/api/admin/verify", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error("Invalid token")
        }
        
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Auth error:", error)
        localStorage.removeItem("adminToken")
        setError(error instanceof Error ? error.message : "Authentication failed")
        router.push("/admin")
      } finally {
        setIsLoading(false)
      }
    }
    
    verifyAuth()
  }, [router])
  
  // Handle tab change with URL update
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    // Update URL without refreshing the page
    const url = new URL(window.location.href)
    url.searchParams.set('tab', value)
    window.history.pushState({}, '', url.toString())
  }
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/admin")
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-28" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && !isLoading) {
    return null // Router will handle the redirect
  }
  
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container px-4 max-w-6xl mx-auto">
        {/* Header with title and logout button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Hexagon className="h-7 w-7 text-primary mr-2" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your blog content and settings
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${activeTab === 'analytics' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => handleTabChange("analytics")}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Analytics</p>
                  <p className="text-2xl font-semibold">View Data</p>
                </div>
                <div className={`p-2 rounded-md ${activeTab === 'analytics' ? 'bg-primary/20' : 'bg-muted'}`}>
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${activeTab === 'posts' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => handleTabChange("posts")}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Posts</p>
                  <p className="text-2xl font-semibold">Manage Content</p>
                </div>
                <div className={`p-2 rounded-md ${activeTab === 'posts' ? 'bg-primary/20' : 'bg-muted'}`}>
                  <FileText className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${activeTab === 'create' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => handleTabChange("create")}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">New Post</p>
                  <p className="text-2xl font-semibold">Create Content</p>
                </div>
                <div className={`p-2 rounded-md ${activeTab === 'create' ? 'bg-primary/20' : 'bg-muted'}`}>
                  <LayoutDashboard className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${activeTab === 'calendar' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => handleTabChange("calendar")}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Editorial Calendar</p>
                  <p className="text-2xl font-semibold">Plan Content</p>
                </div>
                <div className={`p-2 rounded-md ${activeTab === 'calendar' ? 'bg-primary/20' : 'bg-muted'}`}>
                  <Calendar className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main tabs navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <div className="border-b border-border mb-4 overflow-x-auto">
            <TabsList className="flex justify-start bg-transparent p-0">
              <TabsTrigger 
                value="analytics" 
                className="px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="posts" 
                className="px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <FileText className="h-4 w-4 mr-2" />
                Manage Posts
              </TabsTrigger>
              <TabsTrigger 
                value="create" 
                className="px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Create Post
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Editorial Calendar
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab Contents */}
          <TabsContent value="analytics" className="mt-0">
            <AnalyticsDashboard />
          </TabsContent>
          
          <TabsContent value="posts" className="mt-0">
            <PostsList />
          </TabsContent>
          
          <TabsContent value="create" className="mt-0">
            <PostEditor />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-0">
            <EditorialCalendar />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}