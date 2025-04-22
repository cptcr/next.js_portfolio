"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { useToast } from "@/components/ui/use-toast"
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
  security: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  isDirty: boolean;
}

export default function SettingsPanel(): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetType, setResetType] = useState<string>("");
  
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
    security: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
    isDirty: false
  });
  
  // Simulate loading settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch from API
        // For now, we'll use a timeout to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // We're using the initial state as our "loaded" settings
        // In a real app, you would update state with the API response
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading settings:", err);
        setError("Failed to load settings. Please refresh the page.");
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => {
      // If field is nested (e.g., socialLinks.twitter)
      if (section.includes('.')) {
        const [mainSection, subField] = section.split('.');
        
        // Type assertion to help TypeScript
        const updatedSettings = { ...prev };
        if (mainSection === 'socialLinks') {
          updatedSettings.socialLinks = {
            ...prev.socialLinks,
            [subField]: value
          };
        }
        updatedSettings.isDirty = true;
        return updatedSettings;
      }
      
      // If field is in a section (e.g., display.postsPerPage)
      const updatedSettings = { ...prev };
      
      if (section === 'display') {
        updatedSettings.display = {
          ...prev.display,
          [field]: value
        };
      } else if (section === 'theme') {
        updatedSettings.theme = {
          ...prev.theme,
          [field]: value
        };
      } else if (section === 'account') {
        updatedSettings.account = {
          ...prev.account,
          [field]: value
        };
      }
      
      updatedSettings.isDirty = true;
      return updatedSettings;
    });
  };
  
  // Handle simple field changes (like top level fields)
  const handleSimpleChange = (field: keyof Omit<SettingsState, 'socialLinks' | 'display' | 'theme' | 'account' | 'security'>, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
      isDirty: true
    }));
  };
  
  // Handle security field changes
  const handleSecurityChange = (field: keyof typeof settings.security, value: string) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value
      },
      isDirty: true
    }));
  };
  
  // Handle save settings
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would send settings to API here
      // const response = await fetch('/api/admin/settings', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      //   },
      //   body: JSON.stringify(settings)
      // });
      
      // if (!response.ok) throw new Error('Failed to save settings');
      
      // Success
      setSaveSuccess(true);
      setSettings(prev => ({ ...prev, isDirty: false }));
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async () => {
    // Validate inputs
    if (!settings.security.currentPassword) {
      toast({
        title: "Current password required",
        description: "Please enter your current password",
        variant: "destructive",
      });
      return;
    }
    
    if (!settings.security.newPassword) {
      toast({
        title: "New password required",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }
    
    if (settings.security.newPassword !== settings.security.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }
    
    // Check password strength
    if (settings.security.newPassword.length < 8) {
      toast({
        title: "Password too weak",
        description: "Password should be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsChangingPassword(true);
      
      // Get the admin token
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      // Send password change request
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: settings.security.currentPassword,
          newPassword: settings.security.newPassword,
          newUsername: settings.account.username !== "admin" ? settings.account.username : undefined
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }
      
      // Success
      toast({
        title: "Success",
        description: "Your credentials have been updated successfully",
      });
      
      // Clear password fields
      setSettings(prev => ({
        ...prev,
        security: {
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }
      }));
      
      // If username changed, need to re-login
      if (data.usernameChanged) {
        toast({
          title: "Username changed",
          description: "Please log in again with your new credentials",
        });
        
        // Log out and redirect to login
        setTimeout(() => {
          localStorage.removeItem("adminToken");
          router.push("/admin");
        }, 2000);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
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
        security: {
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        },
        isDirty: true
      });
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
      }));
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
      }));
    }
    
    setResetDialogOpen(false);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
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
    );
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
                    setResetType("appearance");
                    setResetDialogOpen(true);
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