'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertCircle,
  Camera,
  Check,
  Globe,
  Image,
  Loader2,
  Paintbrush,
  RefreshCw,
  Save,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import DiscordWebhooks from './discord-webhooks';
import SettingsIntegrations from './settings-integrations';
import UserProfileEditor from './user-profile-editor';

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

export default function SettingsPanel() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetType, setResetType] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Settings state
  const [settings, setSettings] = useState<SettingsState>({
    blogName: "Tony's Development Blog",
    tagline: 'Backend development insights and tutorials',
    about:
      'A blog about backend development, APIs, TypeScript, and modern web technologies by Tony, a 17-year-old developer from Stuttgart, Germany.',
    metaTitle: "Tony's Dev Blog | Backend Development Insights",
    metaDescription:
      'Insights and tutorials on backend development, TypeScript, APIs, and modern web technologies from a young developer in Germany.',
    allowIndexing: true,
    canonicalLinks: true,
    socialLinks: {
      twitter: 'cptcrr',
      github: 'cptcr',
      linkedin: '',
      instagram: '',
    },
    display: {
      postsPerPage: 9,
      defaultSort: 'newest',
      featuredSection: true,
      showAuthor: true,
      showDates: true,
      showRelated: true,
    },
    theme: {
      primaryColor: '#3498db',
      fontFamily: 'inter',
      headingStyle: 'large',
      spacing: 'normal',
      darkMode: true,
      showToggle: true,
    },
    account: {
      displayName: 'Tony',
      username: 'admin',
      email: 'contact@cptcr.dev',
      bio: '17-year-old backend developer from Stuttgart, Germany. Specializing in Next.js, TypeScript, and building robust APIs.',
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    discord: {
      enabled: false,
      webhookUrl: '',
    },
    isDirty: false,
  });

  // Fetch the current user for profile editing
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch('/api/admin/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);

        // Get token for API call
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('Not authenticated');
        }

        // Fetch settings from API
        const response = await fetch('/api/admin/settings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.status}`);
        }

        const data = await response.json();

        // Update state with fetched settings
        setSettings((prev) => ({
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
            showRelated: data.settings.show_related_posts !== false,
          },
          theme: data.settings.site_theme || prev.theme,
          account: {
            ...prev.account,
            displayName: data.settings.author_name || prev.account.displayName,
            email: data.settings.contact_email || prev.account.email,
            bio: data.settings.author_bio || prev.account.bio,
            avatar: data.settings.author_avatar || prev.account.avatar,
          },
          discord: {
            enabled: data.settings.discord_notifications_enabled || false,
            webhookUrl: data.settings.discord_webhook_url || '',
          },
          isDirty: false,
        }));
      } catch (err) {
        console.error('Error loading settings:', err);
        toast({
          title: 'Error loading settings',
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  // Handle form input changes
  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings((prev) => {
      // If field is nested (e.g., socialLinks.twitter)
      if (section.includes('.')) {
        const [mainSection, subField] = section.split('.');

        // Type assertion to help TypeScript
        const updatedSettings = { ...prev };
        if (mainSection === 'socialLinks') {
          updatedSettings.socialLinks = {
            ...prev.socialLinks,
            [subField]: value,
          };
        } else if (mainSection === 'discord') {
          updatedSettings.discord = {
            ...prev.discord,
            [subField]: value,
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
          [field]: value,
        };
      } else if (section === 'theme') {
        updatedSettings.theme = {
          ...prev.theme,
          [field]: value,
        };
      } else if (section === 'account') {
        updatedSettings.account = {
          ...prev.account,
          [field]: value,
        };
      } else if (section === 'discord') {
        updatedSettings.discord = {
          ...prev.discord,
          [field]: value,
        };
      }

      updatedSettings.isDirty = true;
      return updatedSettings;
    });
  };

  // Handle simple field changes (like top level fields)
  const handleSimpleChange = (
    field: keyof Omit<
      SettingsState,
      'socialLinks' | 'display' | 'theme' | 'account' | 'security' | 'discord' | 'isDirty'
    >,
    value: any,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
      isDirty: true,
    }));
  };

  // Handle security field changes
  const handleSecurityChange = (field: keyof typeof settings.security, value: string) => {
    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value,
      },
      isDirty: true,
    }));
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);

      // Get token for API call
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated');
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
          generateCanonicalLinks: settings.canonicalLinks,
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
        discord_webhook_url: settings.discord.webhookUrl,
      };

      // Send to API
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiSettings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to save settings: ${response.status}`);
      }

      // Success
      setSaveSuccess(true);
      setSettings((prev) => ({ ...prev, isDirty: false }));

      toast({
        title: 'Settings saved',
        description: 'Your settings have been saved successfully.',
      });

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');

      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    try {
      setIsChangingPassword(true);

      // Validate inputs
      if (!settings.security.currentPassword) {
        toast({
          title: 'Current password required',
          description: 'Please enter your current password',
          variant: 'destructive',
        });
        setIsChangingPassword(false);
        return;
      }

      if (!settings.security.newPassword) {
        toast({
          title: 'New password required',
          description: 'Please enter a new password',
          variant: 'destructive',
        });
        setIsChangingPassword(false);
        return;
      }

      if (settings.security.newPassword.length < 8) {
        toast({
          title: 'Password too weak',
          description: 'Password should be at least 8 characters long',
          variant: 'destructive',
        });
        setIsChangingPassword(false);
        return;
      }

      if (settings.security.newPassword !== settings.security.confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: 'New password and confirmation password do not match',
          variant: 'destructive',
        });
        setIsChangingPassword(false);
        return;
      }

      // Get token for API call
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Send password change request
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: settings.security.currentPassword,
          newPassword: settings.security.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to change password');
      }

      // Reset password fields
      setSettings((prev) => ({
        ...prev,
        security: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
      }));

      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully',
      });
    } catch (err) {
      console.error('Error changing password:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle reset settings
  const handleResetSettings = () => {
    if (resetType === 'settings') {
      // Reset all settings to default
      setSettings({
        blogName: "Tony's Development Blog",
        tagline: 'Backend development insights and tutorials',
        about:
          'A blog about backend development, APIs, TypeScript, and modern web technologies by Tony, a 17-year-old developer from Stuttgart, Germany.',
        metaTitle: "Tony's Dev Blog | Backend Development Insights",
        metaDescription:
          'Insights and tutorials on backend development, TypeScript, APIs, and modern web technologies from a young developer in Germany.',
        allowIndexing: true,
        canonicalLinks: true,
        socialLinks: {
          twitter: 'cptcrr',
          github: 'cptcr',
          linkedin: '',
          instagram: '',
        },
        display: {
          postsPerPage: 9,
          defaultSort: 'newest',
          featuredSection: true,
          showAuthor: true,
          showDates: true,
          showRelated: true,
        },
        theme: {
          primaryColor: '#3498db',
          fontFamily: 'inter',
          headingStyle: 'large',
          spacing: 'normal',
          darkMode: true,
          showToggle: true,
        },
        account: {
          displayName: 'Tony',
          username: 'admin',
          email: 'contact@cptcr.dev',
          bio: '17-year-old backend developer from Stuttgart, Germany. Specializing in Next.js, TypeScript, and building robust APIs.',
        },
        security: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
        discord: {
          enabled: false,
          webhookUrl: '',
        },
        isDirty: true,
      });

      toast({
        title: 'Settings reset',
        description: 'All settings have been reset to default values.',
      });
    }

    setResetDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Information</CardTitle>
              <CardDescription>Configure the basic information about your blog</CardDescription>
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
                <p className="text-xs text-muted-foreground">
                  This information may be displayed on your about page and in search engine results.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize your blog for search engines</CardDescription>
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
                <p className="text-xs text-muted-foreground">
                  Used as the title in search engine results when no specific title is available.
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Limit to 150-160 characters for best results in search engines.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="robots-index">Allow Search Indexing</Label>
                  <p className="text-xs text-muted-foreground">
                    Let search engines discover and index your blog
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    Generate canonical links to prevent duplicate content issues
                  </p>
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
              <CardDescription>Configure your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <div className="relative">
                    <span className="absolute transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground">
                      @
                    </span>
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
                    <span className="absolute transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground">
                      github.com/
                    </span>
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
                    <span className="absolute transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground">
                      linkedin.com/in/
                    </span>
                    <Input
                      id="linkedin"
                      className="pl-28"
                      placeholder="username"
                      value={settings.socialLinks.linkedin}
                      onChange={(e) =>
                        handleInputChange('socialLinks.linkedin', '', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative">
                    <span className="absolute transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground">
                      @
                    </span>
                    <Input
                      id="instagram"
                      className="pl-8"
                      placeholder="username"
                      value={settings.socialLinks.instagram}
                      onChange={(e) =>
                        handleInputChange('socialLinks.instagram', '', e.target.value)
                      }
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
                  <p className="mt-4 text-xs text-muted-foreground">
                    Recommended size: 1200 × 630 pixels (PNG, JPG, WebP)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
              <CardDescription>Configure how your blog content is displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="posts-per-page">Posts Per Page</Label>
                  <Select
                    value={settings.display.postsPerPage.toString()}
                    onValueChange={(value) =>
                      handleInputChange('display', 'postsPerPage', parseInt(value))
                    }
                  >
                    <SelectTrigger id="posts-per-page">
                      <SelectValue placeholder="Select" />
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
                      <SelectValue placeholder="Select" />
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
                  <p className="text-xs text-muted-foreground">
                    Show featured posts section on the homepage
                  </p>
                </div>
                <Switch
                  id="featured-section"
                  checked={settings.display.featuredSection}
                  onCheckedChange={(checked) =>
                    handleInputChange('display', 'featuredSection', checked)
                  }
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
                  <p className="text-xs text-muted-foreground">
                    Display when posts were published or updated
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    Display related posts at the end of articles
                  </p>
                </div>
                <Switch
                  id="show-related"
                  checked={settings.display.showRelated}
                  onCheckedChange={(checked) =>
                    handleInputChange('display', 'showRelated', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
              <CardDescription>Customize the appearance of your blog</CardDescription>
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
                </div>
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
                <p className="text-xs text-muted-foreground">
                  The primary font used throughout your blog
                </p>
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
                  <p className="text-xs text-muted-foreground">
                    Use dark mode by default for all visitors
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    Allow visitors to switch between light and dark mode
                  </p>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={settings.theme.showToggle}
                  onCheckedChange={(checked) => handleInputChange('theme', 'showToggle', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-6">
          <SettingsIntegrations />
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          {currentUser ? (
            <>
              <UserProfileEditor
                currentUser={currentUser}
                isCurrentUserAdmin={currentUser.role === 'admin'}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={settings.security.currentPassword}
                      onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={settings.security.newPassword}
                        onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={settings.security.confirmPassword}
                        onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Your password should be at least 8 characters and include a mix of letters,
                    numbers and symbols
                  </p>
                </CardContent>

                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                    variant="outline"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>Change Password</>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-red-500">Danger Zone</CardTitle>
                  <CardDescription>Irreversible account actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg border-red-500/20">
                    <div>
                      <h3 className="text-sm font-medium">Reset Admin Settings</h3>
                      <p className="text-xs text-muted-foreground">
                        Reset all admin settings to default values
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                      onClick={() => {
                        setResetType('settings');
                        setResetDialogOpen(true);
                      }}
                    >
                      Reset Settings
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg border-red-500/20">
                    <div>
                      <h3 className="text-sm font-medium">Delete All Content</h3>
                      <p className="text-xs text-muted-foreground">
                        Delete all blog posts, images, and files
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                      onClick={() => {
                        setResetType('content');
                        setResetDialogOpen(true);
                      }}
                    >
                      Delete Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Fixed save button */}
      <div className="sticky flex justify-end bottom-6">
        <div className="p-4 border rounded-lg shadow-lg bg-background/80 backdrop-blur-sm border-border">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving || !settings.isDirty}
            className="relative"
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
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Reset Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {resetType === 'settings' ? 'Reset settings to default?' : 'Delete all content?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {resetType === 'settings'
                ? 'This will reset all your settings to their default values. This action cannot be undone.'
                : 'This will permanently delete all blog posts, images, and files. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetSettings}
              className="bg-red-500 hover:bg-red-600"
            >
              {resetType === 'settings' ? 'Reset Settings' : 'Delete Everything'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
