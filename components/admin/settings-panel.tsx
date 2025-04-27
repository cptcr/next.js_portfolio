// components/admin/settings-panel.tsx
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
import { cn } from '@/lib/utils/helpers';
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
  User,
} from 'lucide-react';
import UserProfileEditor from './user-profile-editor';
import DiscordWebhooks from './discord-webhooks';

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
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
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

  // Simulate loading settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch from API
        // For now, we'll use a timeout to simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

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

  // Handle test Discord webhook
  const handleTestDiscordWebhook = async () => {
    try {
      setIsTestingWebhook(true);

      // Get token for API call
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Validate webhook URL
      if (!settings.discord.webhookUrl) {
        throw new Error('Discord webhook URL is required');
      }

      // Send test notification
      const response = await fetch('/api/admin/webhooks/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: settings.discord.webhookUrl,
          name: 'Test Notification',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to test webhook: ${response.status}`);
      }

      toast({
        title: 'Test successful',
        description: 'Test notification sent to Discord webhook',
      });
    } catch (err) {
      console.error('Error testing webhook:', err);

      toast({
        title: 'Test failed',
        description: err instanceof Error ? err.message : 'Failed to test Discord webhook',
        variant: 'destructive',
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
        title: 'Current password required',
        description: 'Please enter your current password',
        variant: 'destructive',
      });
      return;
    }

    if (!settings.security.newPassword) {
      toast({
        title: 'New password required',
        description: 'Please enter a new password',
        variant: 'destructive',
      });
      return;
    }

    if (settings.security.newPassword !== settings.security.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: 'New password and confirmation must match',
        variant: 'destructive',
      });
      return;
    }

    // Check password strength
    if (settings.security.newPassword.length < 8) {
      toast({
        title: 'Password too weak',
        description: 'Password should be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsChangingPassword(true);

      // Get the admin token
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
          newUsername:
            settings.account.username !== 'admin' ? settings.account.username : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      // Success
      toast({
        title: 'Success',
        description: 'Your credentials have been updated successfully',
      });

      // Clear password fields
      setSettings((prev) => ({
        ...prev,
        security: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
      }));

      // If username changed, need to re-login
      if (data.usernameChanged) {
        toast({
          title: 'Username changed',
          description: 'Please log in again with your new credentials',
        });

        // Log out and redirect to login
        setTimeout(() => {
          localStorage.removeItem('adminToken');
          router.push('/admin');
        }, 2000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle settings reset
  const handleResetSettings = () => {
    if (resetType === 'all') {
      // Reset all settings
      setSettings({
        blogName: 'My Blog',
        tagline: 'Just another blog',
        about: 'This is my blog about various topics.',
        metaTitle: 'My Blog | Tagline',
        metaDescription: 'A brief description of my blog',
        allowIndexing: true,
        canonicalLinks: true,
        socialLinks: {
          twitter: '',
          github: '',
          linkedin: '',
          instagram: '',
        },
        display: {
          postsPerPage: 10,
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
          displayName: 'Admin',
          username: 'admin',
          email: 'admin@example.com',
          bio: 'Blog administrator',
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
    } else if (resetType === 'appearance') {
      // Reset only appearance settings
      setSettings((prev) => ({
        ...prev,
        theme: {
          primaryColor: '#3498db',
          fontFamily: 'inter',
          headingStyle: 'large',
          spacing: 'normal',
          darkMode: true,
          showToggle: true,
        },
        isDirty: true,
      }));
    } else if (resetType === 'display') {
      // Reset only display settings
      setSettings((prev) => ({
        ...prev,
        display: {
          postsPerPage: 10,
          defaultSort: 'newest',
          featuredSection: true,
          showAuthor: true,
          showDates: true,
          showRelated: true,
        },
        isDirty: true,
      }));
    } else if (resetType === 'discord') {
      // Reset only Discord settings
      setSettings((prev) => ({
        ...prev,
        discord: {
          enabled: false,
          webhookUrl: '',
        },
        isDirty: true,
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
            <CardDescription className="text-center">{error}</CardDescription>
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

        {/* General Tab */}
        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          {/* Blog Information */}
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
                    value={settings.blogName}
                    onChange={(e) => handleSimpleChange('blogName', e.target.value)}
                    placeholder="My Tech Blog"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={settings.tagline}
                    onChange={(e) => handleSimpleChange('tagline', e.target.value)}
                    placeholder="A brief description of your blog"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  value={settings.about}
                  onChange={(e) => handleSimpleChange('about', e.target.value)}
                  placeholder="Tell readers about your blog"
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  This information will be displayed on your about page and in search engine
                  results.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
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
                  value={settings.metaTitle}
                  onChange={(e) => handleSimpleChange('metaTitle', e.target.value)}
                  placeholder="Your blog name | Tagline"
                />
                <p className="text-xs text-muted-foreground">
                  Used as the title in search engine results when no specific title is set.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Default Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={settings.metaDescription}
                  onChange={(e) => handleSimpleChange('metaDescription', e.target.value)}
                  placeholder="A brief description of your blog"
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  Aim for 150-160 characters for optimal search engine display.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-indexing">Allow Search Indexing</Label>
                  <p className="text-xs text-muted-foreground">
                    Let search engines discover and index your blog
                  </p>
                </div>
                <Switch
                  id="allow-indexing"
                  checked={settings.allowIndexing}
                  onCheckedChange={(checked) => handleSimpleChange('allowIndexing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="canonical-links">Generate Canonical Links</Label>
                  <p className="text-xs text-muted-foreground">
                    Help prevent duplicate content issues
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

          {/* Social Media Links */}
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
                    <span className="absolute -translate-y-1/2 left-3 top-1/2 text-muted-foreground">
                      @
                    </span>
                    <Input
                      id="twitter"
                      className="pl-8"
                      value={settings.socialLinks.twitter}
                      onChange={(e) => handleInputChange('socialLinks.twitter', '', e.target.value)}
                      placeholder="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <div className="relative">
                    <span className="absolute -translate-y-1/2 left-3 top-1/2 text-muted-foreground">
                      github.com/
                    </span>
                    <Input
                      id="github"
                      className="pl-24"
                      value={settings.socialLinks.github}
                      onChange={(e) => handleInputChange('socialLinks.github', '', e.target.value)}
                      placeholder="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="relative">
                    <span className="absolute -translate-y-1/2 left-3 top-1/2 text-muted-foreground">
                      linkedin.com/in/
                    </span>
                    <Input
                      id="linkedin"
                      className="pl-28"
                      value={settings.socialLinks.linkedin}
                      onChange={(e) =>
                        handleInputChange('socialLinks.linkedin', '', e.target.value)
                      }
                      placeholder="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative">
                    <span className="absolute -translate-y-1/2 left-3 top-1/2 text-muted-foreground">
                      @
                    </span>
                    <Input
                      id="instagram"
                      className="pl-8"
                      value={settings.socialLinks.instagram}
                      onChange={(e) =>
                        handleInputChange('socialLinks.instagram', '', e.target.value)
                      }
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
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
                  />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <Select
                  value={settings.theme.fontFamily}
                  onValueChange={(value) => handleInputChange('theme', 'fontFamily', value)}
                >
                  <SelectTrigger id="font-family">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter (Modern Sans-Serif)</SelectItem>
                    <SelectItem value="merriweather">Merriweather (Elegant Serif)</SelectItem>
                    <SelectItem value="jetbrains">JetBrains Mono (Monospace)</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Theme toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">Use dark mode by default</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={settings.theme.darkMode}
                    onCheckedChange={(checked) => handleInputChange('theme', 'darkMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display" className="space-y-6">
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
                    <SelectTrigger>
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
                  <Label htmlFor="default-sort">Default Sort</Label>
                  <Select
                    value={settings.display.defaultSort}
                    onValueChange={(value) => handleInputChange('display', 'defaultSort', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sort option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-author">Show Author</Label>
                    <p className="text-xs text-muted-foreground">Display author info on posts</p>
                  </div>
                  <Switch
                    id="show-author"
                    checked={settings.display.showAuthor}
                    onCheckedChange={(checked) =>
                      handleInputChange('display', 'showAuthor', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discord Integration</CardTitle>
              <CardDescription>Configure Discord webhook notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="discord-enabled">Enable Discord Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Send notifications when new posts are published
                  </p>
                </div>
                <Switch
                  id="discord-enabled"
                  checked={settings.discord.enabled}
                  onCheckedChange={(checked) => handleInputChange('discord', 'enabled', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discord-webhook">Webhook URL</Label>
                <Input
                  id="discord-webhook"
                  value={settings.discord.webhookUrl}
                  onChange={(e) => handleInputChange('discord', 'webhookUrl', e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  type="url"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleTestDiscordWebhook}
                disabled={
                  !settings.discord.webhookUrl || !settings.discord.enabled || isTestingWebhook
                }
              >
                {isTestingWebhook ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Webhook'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your administrator profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 overflow-hidden rounded-full bg-muted">
                    {settings.account.avatar ? (
                      <img
                        src={settings.account.avatar}
                        alt={settings.account.displayName}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <User className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Button size="icon" className="absolute bottom-0 right-0 w-8 h-8 rounded-full">
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1 space-y-2">
                  <Label>Biography</Label>
                  <Textarea
                    value={settings.account.bio}
                    onChange={(e) => handleInputChange('account', 'bio', e.target.value)}
                    placeholder="Tell us about yourself"
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={settings.account.displayName}
                    onChange={(e) => handleInputChange('account', 'displayName', e.target.value)}
                    placeholder="Your display name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-email">Email</Label>
                  <Input
                    id="account-email"
                    type="email"
                    value={settings.account.email}
                    onChange={(e) => handleInputChange('account', 'email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-username">Username</Label>
                  <Input
                    id="account-username"
                    value={settings.account.username}
                    onChange={(e) => handleInputChange('account', 'username', e.target.value)}
                    placeholder="username"
                  />
                  <p className="text-xs text-muted-foreground">
                    Changing your username will require you to login again
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={settings.security.confirmPassword}
                    onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handlePasswordChange} disabled={isChangingPassword} className="mt-2">
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer with save buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => {
            setResetType('all');
            setResetDialogOpen(true);
          }}
        >
          Reset All Settings
        </Button>
        <Button disabled={!settings.isDirty || isSaving} onClick={handleSaveSettings}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
