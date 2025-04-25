// components/admin/settings-panel.tsx
"use client"

import { useState, useEffect, JSX } from "react"
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
  discord: {
    enabled: boolean;
    webhookUrl: string;
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
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
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
    discord: {
      enabled: false,
      webhookUrl: ""
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
        
        // Get token for API call
        const token = localStorage.getItem("adminToken");
        if (!token) {
          throw new Error("Not authenticated");
        }
        
        // Fetch settings from API
        const response = await fetch("/api/admin/settings", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update state with fetched settings
        setSettings(prev => ({
          ...prev,
          blogName: data.settings.site_name || prev.blogName,
          tagline: data.settings.site_description || prev.tagline,
          about: data.settings.blog_description || prev.about,
          metaTitle: data.settings.seo_settings?.titleTemplate || prev.metaTitle,
          metaDescription: data.settings.seo_settings?.defaultDescription || prev.metaDescription,
          allowIndexing: data.settings.seo_settings?.robotsIndex !== false,
          canonicalLinks: data.settings.seo_settings?.generateCanonicalLinks !== false,
          socialLinks: data.settings.social_links || prev.socialLinks,
          display: {
            postsPerPage: data.settings.posts_per_page || prev.display.postsPerPage,
            defaultSort: data.settings.default_sort || prev.display.defaultSort,
            featuredSection: data.settings.show_featured_posts !== false,
            showAuthor: data.settings.show_author_info !== false,
            showDates: data.settings.show_dates !== false,
            showRelated: data.settings.show_related_posts !== false
          },
          theme: data.settings.site_theme || prev.theme,
          account: {
            ...prev.account,
            displayName: data.settings.author_name || prev.account.displayName,
            email: data.settings.contact_email || prev.account.email,
            bio: data.settings.author_bio || prev.account.bio,
            avatar: data.settings.author_avatar || prev.account.avatar
          },
          discord: {
            enabled: data.settings.discord_notifications_enabled || false,
            webhookUrl: data.settings.discord_webhook_url || ""
          },
          isDirty: false
        }));
        
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
        } else if (mainSection === 'discord') {
          updatedSettings.discord = {
            ...prev.discord,
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
      } else if (section === 'discord') {
        updatedSettings.discord = {
          ...prev.discord,
          [field]: value
        };
      }
      
      updatedSettings.isDirty = true;
      return updatedSettings;
    });
  };
  
  // Handle simple field changes (like top level fields)
  const handleSimpleChange = (field: keyof Omit<SettingsState, 'socialLinks' | 'display' | 'theme' | 'account' | 'security' | 'discord'>, value: any) => {
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
      
      // Get token for API call
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      // Format settings for API
      const apiSettings = {
        site_name: settings.blogName,
        site_description: settings.tagline,
        blog_description: settings.about,
        seo_settings: {
          titleTemplate: settings.metaTitle,
          defaultDescription: settings.metaDescription,
          robotsIndex: settings.allowIndexing,
          generateCanonicalLinks: settings.canonicalLinks
        },
        social_links: settings.socialLinks,
        posts_per_page: settings.display.postsPerPage,
        default_sort: settings.display.defaultSort,
        show_featured_posts: settings.display.featuredSection,
        show_author_info: settings.display.showAuthor,
        show_dates: settings.display.showDates,
        show_related_posts: settings.display.showRelated,
        site_theme: settings.theme,
        author_name: settings.account.displayName,
        contact_email: settings.account.email,
        author_bio: settings.account.bio,
        author_avatar: settings.account.avatar,
        discord_notifications_enabled: settings.discord.enabled,
        discord_webhook_url: settings.discord.webhookUrl
      };
      
      // Send to API
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(apiSettings)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to save settings: ${response.status}`);
      }
      
      // Success
      setSaveSuccess(true);
      setSettings(prev => ({ ...prev, isDirty: false }));
      
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings. Please try again.");
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle test Discord webhook
  const handleTestDiscordWebhook = async () => {
    try {
      setIsTestingWebhook(true);
      
      // Get token for API call
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      // Validate webhook URL
      if (!settings.discord.webhookUrl) {
        throw new Error("Discord webhook URL is required");
      }
      
      // Send test notification
      const response = await fetch("/api/admin/webhooks/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          url: settings.discord.webhookUrl,
          name: "Test Notification",
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to test webhook: ${response.status}`);
      }
      
      toast({
        title: "Test successful",
        description: "Test notification sent to Discord webhook",
      });
    } catch (err) {
      console.error("Error testing webhook:", err);
      
      toast({
        title: "Test failed",
        description: err instanceof Error ? err.message : "Failed to test Discord webhook",
        variant: "destructive",
      });
    } finally {
      setIsTestingWebhook(false);
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
        discord: {
          enabled: false,
          webhookUrl: ""
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
    } else if (resetType === "discord") {
      // Reset only Discord settings
      setSettings(prev => ({
        ...prev,
        discord: {
          enabled: false,
          webhookUrl: ""
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
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
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
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle className="text-center">Error Loading Settings</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
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
        <div className="flex items-center p-4 text-green-500 rounded-md bg-green-500/10">
          <Check className="w-5 h-5 mr-2" />
          <p>Settings saved successfully!</p>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="general">
            <Globe className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Paintbrush className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="display">
            <LayoutGrid className="w-4 h-4 mr-2" />
            Display
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-4 h-4 mr-2"
            >
              <path d="M15 5v14" />
              <path d="M5 19h14" />
              <circle cx="9" cy="9" r="4" />
              <circle cx="19" cy="5" r="2" />
              <circle cx="5" cy="19" r="2" />
            </svg>
            Integrations
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="w-4 h-4 mr-2" />
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <div className="relative">
                    <span className="absolute transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground">@</span>
                    <Input 
                      id="twitter" 
                      className="pl-8" 
                      placeholder="username" 
                      value={settings.socialLinks.twitter}
                      onChange={(e) => handleInputChange('socialLinks.twitter', '', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <div className="relative">
                    <span className="absolute transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground">github.com/</span>
                    <Input 
                      id="github" 
                      className="pl-24" 
                      placeholder="username" 
                      value={settings.socialLinks.github}
                      onChange={(e) => handleInputChange('socialLinks.github', '', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="relative">
                    <span className="absolute transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground">linkedin.com/in/</span>
                    <Input 
                      id="linkedin" 
                      className="pl-28" 
                      placeholder="username" 
                      value={settings.socialLinks.linkedin}
                      onChange={(e) => handleInputChange('socialLinks.linkedin', '', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative">
                    <span className="absolute transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground">@</span>
                    <Input 
                      id="instagram" 
                      className="pl-8" 
                      placeholder="username" 
                      value={settings.socialLinks.instagram}
                      onChange={(e) => handleInputChange('socialLinks.instagram', '', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label htmlFor="share-image">Default Share Image</Label>
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md border-border">
                  <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-md bg-muted">
                    <Image className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-sm font-medium">Drag and drop an image here or</p>
                    <Button variant="secondary" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">Recommended size: 1200 × 630 pixels (PNG, JPG, WebP)</p>
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
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      <SelectValue placeholder="Select sort option" />
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
                    setResetType("display");
                    setResetDialogOpen(true);
                  }}
                >
                  Reset Display Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discord Integration</CardTitle>
              <CardDescription>
                Configure Discord webhook notifications for new blog posts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="discord-enabled">Enable Discord Notifications</Label>
                  <p className="text-xs text-muted-foreground">Send notifications to Discord when new posts are published</p>
                </div>
                <Switch 
                  id="discord-enabled" 
                  checked={settings.discord.enabled}
                  onCheckedChange={(checked) => handleInputChange('discord', 'enabled', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discord-webhook-url">Discord Webhook URL</Label>
                <Input 
                  id="discord-webhook-url" 
                  type="url" 
                  placeholder="https://discord.com/api/webhooks/..." 
                  value={settings.discord.webhookUrl}
                  onChange={(e) => handleInputChange('discord', 'webhookUrl', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">The webhook URL from Discord to send notifications to</p>
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTestDiscordWebhook}
                  disabled={!settings.discord.webhookUrl || !settings.discord.enabled}
                >
                  {isTestingWebhook ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      Send Test Notification
                    </>
                  )}
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setResetType("discord");
                    setResetDialogOpen(true);
                  }}
                >
                  Reset Discord Settings
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Configure API access for external services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input 
                    id="api-key"
                    type="password" 
                    value="sk_live_xxxxxxxxxxxxxxxxxxxx" 
                    className="flex-1"
                    disabled 
                  />
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Used for external services to access your blog content</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="api-enabled">Enable API Access</Label>
                  <p className="text-xs text-muted-foreground">Allow external applications to access your blog via API</p>
                </div>
                <Switch id="api-enabled" defaultChecked />
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
                Update your profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 mb-6">
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-muted">
                  {settings.account.avatar ? (
                    <img 
                      src={settings.account.avatar} 
                      alt={settings.account.displayName} 
                      className="object-cover w-full h-full rounded-full"
                    />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground" />
                  )}
                  <Button size="icon" className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary" variant="default">
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us about yourself" 
                    className="min-h-[100px]"
                    value={settings.account.bio}
                    onChange={(e) => handleInputChange('account', 'bio', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">This information may be displayed on your author profile.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input 
                    id="display-name" 
                    placeholder="Your Name" 
                    value={settings.account.displayName}
                    onChange={(e) => handleInputChange('account', 'displayName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={settings.account.email}
                    onChange={(e) => handleInputChange('account', 'email', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Update your username and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  placeholder="username" 
                  value={settings.account.username}
                  onChange={(e) => handleInputChange('account', 'username', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Used for logging in. Changing this will require you to log in again.
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  value={settings.security.currentPassword}
                  onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={settings.security.newPassword}
                    onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={settings.security.confirmPassword}
                    onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={isChangingPassword}
                >
                  {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update Credentials
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Footer with save button */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            setResetType("all");
            setResetDialogOpen(true);
          }}
        >
          Reset All Settings
        </Button>
        <Button 
          disabled={!settings.isDirty || isSaving}
          onClick={handleSaveSettings}
          className={cn(
            "min-w-[120px]",
            saveSuccess && "bg-green-500 hover:bg-green-600"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
      
      {/* Reset Settings Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {resetType === "all" 
                ? "Reset All Settings"
                : resetType === "appearance" 
                  ? "Reset Theme Settings" 
                  : resetType === "display"
                    ? "Reset Display Settings"
                    : "Reset Discord Settings"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will reset {resetType === "all" ? "all" : resetType} settings to their default values.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetSettings} className="bg-red-500 hover:bg-red-600">
              Reset Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}