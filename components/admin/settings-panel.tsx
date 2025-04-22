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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils/helpers"
import {
    AlertCircle,
    Camera,
    Check,
    Globe,
    Image,
    LayoutGrid,
    Loader2,
    Paintbrush,
    RefreshCw,
    Save,
    User
} from "lucide-react"
import { useEffect, useState } from "react"

// Types
interface SettingsState {
  blogName: string;
  tagline: string;
  about: string;
  metaTitle: string;
  metaDescription: string;
  allowIndexing: boolean;
  canonicalLinks: boolean;
  socialLinks: {
    twitter: string;
    github: string;
    linkedin: string;
    instagram: string;
  };
  display: {
    postsPerPage: number;
    defaultSort: string;
    featuredSection: boolean;
    showAuthor: boolean;
    showDates: boolean;
    showRelated: boolean;
  };
  theme: {
    primaryColor: string;
    fontFamily: string;
    headingStyle: string;
    spacing: string;
    darkMode: boolean;
    showToggle: boolean;
  };
  account: {
    displayName: string;
    username: string;
    email: string;
    bio: string;
    avatar?: string;
  };
  isDirty: boolean;
}

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetType, setResetType] = useState<string>("")
  
  // Settings state
  const [settings, setSettings] = useState<SettingsState>({
    blogName: "Tony's Development Blog",
    tagline: "Backend development insights and tutorials",
    about: "A blog about backend development, APIs, TypeScript, and modern web technologies by Tony, a 17-year-old developer from Stuttgart, Germany.",
    metaTitle: "Tony's Dev Blog | Backend Development Insights",
    metaDescription: "Insights and tutorials on backend development, TypeScript, APIs, and modern web technologies from a young developer in Germany.",
    allowIndexing: true,
    canonicalLinks: true,
    socialLinks: {
      twitter: "cptcrr",
      github: "cptcr",
      linkedin: "",
      instagram: ""
    },
    display: {
      postsPerPage: 9,
      defaultSort: "newest",
      featuredSection: true,
      showAuthor: true,
      showDates: true,
      showRelated: true
    },
    theme: {
      primaryColor: "#3498db",
      fontFamily: "inter",
      headingStyle: "large",
      spacing: "normal",
      darkMode: true,
      showToggle: true
    },
    account: {
      displayName: "Tony",
      username: "admin",
      email: "contact@cptcr.dev",
      bio: "17-year-old backend developer from Stuttgart, Germany. Specializing in Next.js, TypeScript, and building robust APIs."
    },
    isDirty: false
  })
  
  // Simulate loading settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        // In a real app, you would fetch from API
        // For now, we'll use a timeout to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // We're using the initial state as our "loaded" settings
        // In a real app, you would update state with the API response
        
        setIsLoading(false)
      } catch (err) {
        console.error("Error loading settings:", err)
        setError("Failed to load settings. Please refresh the page.")
        setIsLoading(false)
      }
    }
    
    loadSettings()
  }, [])
  
  // Handle form input changes
  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => {
      // If field is nested (e.g., socialLinks.twitter)
      if (section.includes('.')) {
        const [mainSection, subField] = section.split('.')
        return {
          ...prev,
          [mainSection]: {
            ...prev[mainSection as keyof SettingsState],
            [subField]: value
          },
          isDirty: true
        }
      }
      
      // If field is in a section (e.g., display.postsPerPage)
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof SettingsState],
          [field]: value
        },
        isDirty: true
      }
    })
  }
  
  // Handle simple field changes (like top level fields)
  const handleSimpleChange = (field: keyof SettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
      isDirty: true
    }))
  }
  
  // Handle save settings
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      setSaveSuccess(false)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In a real app, you would send settings to API here
      // const response = await fetch('/api/admin/settings', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      //   },
      //   body: JSON.stringify(settings)
      // })
      
      // if (!response.ok) throw new Error('Failed to save settings')
      
      // Success
      setSaveSuccess(true)
      setSettings(prev => ({ ...prev, isDirty: false }))
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error("Error saving settings:", err)
      setError("Failed to save settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }
  
  // Handle settings reset
  const handleResetSettings = () => {
    if (resetType === "all") {
      // Reset all settings
      setSettings({
        blogName: "My Blog",
        tagline: "Just another blog",
        about: "This is my blog about various topics.",
        metaTitle: "My Blog | Tagline",
        metaDescription: "A brief description of my blog",
        allowIndexing: true,
        canonicalLinks: true,
        socialLinks: {
          twitter: "",
          github: "",
          linkedin: "",
          instagram: ""
        },
        display: {
          postsPerPage: 10,
          defaultSort: "newest",
          featuredSection: true,
          showAuthor: true,
          showDates: true,
          showRelated: true
        },
        theme: {
          primaryColor: "#3498db",
          fontFamily: "inter",
          headingStyle: "large",
          spacing: "normal",
          darkMode: true,
          showToggle: true
        },
        account: {
          displayName: "Admin",
          username: "admin",
          email: "admin@example.com",
          bio: "Blog administrator"
        },
        isDirty: true
      })
    } else if (resetType === "appearance") {
      // Reset only appearance settings
      setSettings(prev => ({
        ...prev,
        theme: {
          primaryColor: "#3498db",
          fontFamily: "inter",
          headingStyle: "large",
          spacing: "normal",
          darkMode: true,
          showToggle: true
        },
        isDirty: true
      }))
    } else if (resetType === "display") {
      // Reset only display settings
      setSettings(prev => ({
        ...prev,
        display: {
          postsPerPage: 10,
          defaultSort: "newest",
          featuredSection: true,
          showAuthor: true,
          showDates: true,
          showRelated: true
        },
        isDirty: true
      }))
    }
    
    setResetDialogOpen(false)
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-center">Error Loading Settings</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Show success message */}
      {saveSuccess && (
        <div className="bg-green-500/10 text-green-500 p-4 rounded-md flex items-center">
          <Check className="h-5 w-5 mr-2" />
          <p>Settings saved successfully!</p>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Paintbrush className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="display">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Display
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Information</CardTitle>
              <CardDescription>
                Configure the basic information about your blog
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blog-name">Blog Name</Label>
                  <Input 
                    id="blog-name" 
                    placeholder="My Tech Blog" 
                    value={settings.blogName}
                    onChange={(e) => handleSimpleChange('blogName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-description">Tagline</Label>
                  <Input 
                    id="blog-description" 
                    placeholder="A short description of your blog" 
                    value={settings.tagline}
                    onChange={(e) => handleSimpleChange('tagline', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="blog-about">About</Label>
                <Textarea 
                  id="blog-about" 
                  placeholder="Tell readers about your blog" 
                  className="min-h-[100px]"
                  value={settings.about}
                  onChange={(e) => handleSimpleChange('about', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">This information may be displayed on your about page and in search engine results.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your blog for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title">Default Meta Title</Label>
                <Input 
                  id="meta-title" 
                  placeholder="Your blog name | Tagline" 
                  value={settings.metaTitle}
                  onChange={(e) => handleSimpleChange('metaTitle', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Used as the title in search engine results when no specific title is available.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="meta-description">Default Meta Description</Label>
                <Textarea 
                  id="meta-description" 
                  placeholder="A brief description of your blog" 
                  className="min-h-[80px]"
                  value={settings.metaDescription}
                  onChange={(e) => handleSimpleChange('metaDescription', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Limit to 150-160 characters for best results in search engines.</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="robots-index">Allow Search Indexing</Label>
                  <p className="text-xs text-muted-foreground">Let search engines discover and index your blog</p>
                </div>
                <Switch 
                  id="robots-index" 
                  checked={settings.allowIndexing}
                  onCheckedChange={(checked) => handleSimpleChange('allowIndexing', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="canonical-links">Canonical Links</Label>
                  <p className="text-xs text-muted-foreground">Generate canonical links to prevent duplicate content issues</p>
                </div>
                <Switch 
                  id="canonical-links" 
                  checked={settings.canonicalLinks}
                  onCheckedChange={(checked) => handleSimpleChange('canonicalLinks', checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>
                Configure your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">@</span>
                    <Input 
                      id="twitter" 
                      className="pl-8" 
                      placeholder="username" 
                      value={settings.socialLinks.twitter}
                      onChange={(e) => handleInputChange('socialLinks', 'twitter', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">github.com/</span>
                    <Input 
                      id="github" 
                      className="pl-24" 
                      placeholder="username" 
                      value={settings.socialLinks.github}
                      onChange={(e) => handleInputChange('socialLinks', 'github', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">linkedin.com/in/</span>
                    <Input 
                      id="linkedin" 
                      className="pl-28" 
                      placeholder="username" 
                      value={settings.socialLinks.linkedin}
                      onChange={(e) => handleInputChange('socialLinks', 'linkedin', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">@</span>
                    <Input 
                      id="instagram" 
                      className="pl-8" 
                      placeholder="username" 
                      value={settings.socialLinks.instagram}
                      onChange={(e) => handleInputChange('socialLinks', 'instagram', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label htmlFor="share-image">Default Share Image</Label>
                <div className="border-2 border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center mb-4">
                    <Image className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium">Drag and drop an image here or</p>
                    <Button variant="secondary" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Recommended size: 1200 × 630 pixels (PNG, JPG, WebP)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
              <CardDescription>
                Customize the appearance of your blog
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-md" 
                    style={{ backgroundColor: settings.theme.primaryColor }}
                  ></div>
                  <Input 
                    id="primary-color" 
                    type="text" 
                    value={settings.theme.primaryColor}
                    onChange={(e) => handleInputChange('theme', 'primaryColor', e.target.value)}
                    className="w-32"
                  />
                  <Input
                    type="color"
                    value={settings.theme.primaryColor}
                    onChange={(e) => handleInputChange('theme', 'primaryColor', e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground">This color will be used for buttons, links, and accents throughout your site.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fonts">Font Style</Label>
                <Select 
                  value={settings.theme.fontFamily}
                  onValueChange={(value) => handleInputChange('theme', 'fontFamily', value)}
                >
                  <SelectTrigger id="fonts">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter (Modern Sans-Serif)</SelectItem>
                    <SelectItem value="merriweather">Merriweather (Elegant Serif)</SelectItem>
                    <SelectItem value="jetbrains">JetBrains Mono (Monospace)</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">The primary font used throughout your blog</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heading-style">Heading Style</Label>
                  <Select 
                    value={settings.theme.headingStyle}
                    onValueChange={(value) => handleInputChange('theme', 'headingStyle', value)}
                  >
                    <SelectTrigger id="heading-style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="large">Large & Bold</SelectItem>
                      <SelectItem value="medium">Medium & Regular</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="spacing">Content Spacing</Label>
                  <Select 
                    value={settings.theme.spacing}
                    onValueChange={(value) => handleInputChange('theme', 'spacing', value)}
                  >
                    <SelectTrigger id="spacing">
                      <SelectValue placeholder="Select spacing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Default to Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Use dark mode by default for all visitors</p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={settings.theme.darkMode}
                  onCheckedChange={(checked) => handleInputChange('theme', 'darkMode', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme-toggle">Show Theme Toggle</Label>
                  <p className="text-xs text-muted-foreground">Allow visitors to switch between light and dark mode</p>
                </div>
                <Switch 
                  id="theme-toggle" 
                  checked={settings.theme.showToggle}
                  onCheckedChange={(checked) => handleInputChange('theme', 'showToggle', checked)}
                />
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setResetType("appearance")
                    setResetDialogOpen(true)
                  }}
                >
                  Reset Theme Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Display Settings */}
        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
              <CardDescription>
                Configure how your blog content is displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="posts-per-page">Posts Per Page</Label>
                  <Select 
                    value={settings.display.postsPerPage.toString()}
                    onValueChange={(value) => handleInputChange('display', 'postsPerPage', parseInt(value))}
                  >
                    <SelectTrigger id="posts-per-page">
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 posts</SelectItem>
                      <SelectItem value="9">9 posts</SelectItem>
                      <SelectItem value="12">12 posts</SelectItem>
                      <SelectItem value="15">15 posts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-sort">Default Post Sorting</Label>
                  <Select 
                    value={settings.display.defaultSort}
                    onValueChange={(value) => handleInputChange('display', 'defaultSort', value)}
                  >
                    <SelectTrigger id="default-sort">
                      <SelectValue placeholder="Select sort order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="featured-section">Featured Posts Section</Label>
                  <p className="text-xs text-muted-foreground">Show featured posts section on the homepage</p>
                </div>
                <Switch 
                  id="featured-section" 
                  checked={settings.display.featuredSection}
                  onCheckedChange={(checked) => handleInputChange('display', 'featuredSection', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-author">Show Author Information</Label>
                  <p className="text-xs text-muted-foreground">Display author details on posts</p>
                </div>
                <Switch 
                  id="show-author" 
                  checked={settings.display.showAuthor}
                  onCheckedChange={(checked) => handleInputChange('display', 'showAuthor', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-dates">Show Publish Dates</Label>
                  <p className="text-xs text-muted-foreground">Display when posts were published or updated</p>
                </div>
                <Switch 
                  id="show-dates" 
                  checked={settings.display.showDates}
                  onCheckedChange={(checked) => handleInputChange('display', 'showDates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-related">Show Related Posts</Label>
                  <p className="text-xs text-muted-foreground">Display related posts at the end of articles</p>
                </div>
                <Switch 
                  id="show-related" 
                  checked={settings.display.showRelated}
                  onCheckedChange={(checked) => handleInputChange('display', 'showRelated', checked)}
                />
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setResetType("display")
                    setResetDialogOpen(true)
                  }}
                >
                  Reset Display Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your administrator profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Change Avatar
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input 
                    id="display-name" 
                    value={settings.account.displayName}
                    onChange={(e) => handleInputChange('account', 'displayName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={settings.account.username}
                    onChange={(e) => handleInputChange('account', 'username', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={settings.account.email}
                    onChange={(e) => handleInputChange('account', 'email', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input 
                    id="role" 
                    value="Administrator" 
                    disabled
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  className="min-h-[100px]"
                  value={settings.account.bio}
                  onChange={(e) => handleInputChange('account', 'bio', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Brief description about yourself that may appear with your articles</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Update your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password"
                  placeholder="••••••••••" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    placeholder="••••••••••" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    placeholder="••••••••••" 
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">Password should be at least 10 characters and include a mix of letters, numbers, and symbols</p>
              
              <div className="flex items-center justify-between mt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border pt-6">
              <Button className="ml-auto">
                Update Security Settings
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible account actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium">Reset All Settings</h3>
                  <p className="text-xs text-muted-foreground">Reset all admin settings to default values</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                  onClick={() => {
                    setResetType("all")
                    setResetDialogOpen(true)
                  }}
                >
                  Reset Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Reset Settings Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Settings</AlertDialogTitle>
            <AlertDialogDescription>
              {resetType === "all" 
                ? "This will reset all settings to their default values."
                : resetType === "appearance"
                ? "This will reset all appearance and theme settings to their default values."
                : "This will reset all display settings to their default values."
              } Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetSettings}
              className="bg-red-500 hover:bg-red-600"
            >
              Reset Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Fixed save button */}
      <div className="sticky bottom-6 flex justify-end">
        <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border shadow-lg">
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving || !settings.isDirty}
            className={cn({
              "opacity-50 cursor-not-allowed": !settings.isDirty && !isSaving
            })}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}