// app/admin/dashboard/page.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Loader2, BarChart3, FileText, Settings, Users, 
  Calendar, LogOut, LayoutDashboard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import AnalyticsDashboard from "@/components/admin/analytics-dashboard"
import EditorialCalendar from "@/components/admin/editorial-calendar"
import PostEditor from "@/components/admin/post-editor"
import SettingsPanel from "@/components/admin/settings-panel"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>("analytics")
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/admin")
  }
  
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container px-4 max-w-6xl mx-auto">
        {/* Header with title and logout button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your blog content and settings</p>
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

        {/* Main tabs navigation */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
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
            <div className="flex flex-col gap-6">
              {/* Will be implemented with the PostsList component */}
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p>Loading posts...</p>
              </div>
            </div>
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