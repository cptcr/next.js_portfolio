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