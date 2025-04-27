'use client';

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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Image, Loader2, RefreshCw, Save, User } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPanel() {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
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
                    defaultValue="Tony's Development Blog"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-description">Tagline</Label>
                  <Input
                    id="blog-description"
                    placeholder="A short description of your blog"
                    defaultValue="Backend development insights and tutorials"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blog-about">About</Label>
                <Textarea
                  id="blog-about"
                  placeholder="Tell readers about your blog"
                  className="min-h-[100px]"
                  defaultValue="A blog about backend development, APIs, TypeScript, and modern web technologies by Tony, a 17-year-old developer from Stuttgart, Germany."
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
                  defaultValue="Tony's Dev Blog | Backend Development Insights"
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
                  defaultValue="Insights and tutorials on backend development, TypeScript, APIs, and modern web technologies from a young developer in Germany."
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
                <Switch id="robots-index" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="canonical-links">Canonical Links</Label>
                  <p className="text-xs text-muted-foreground">
                    Generate canonical links to prevent duplicate content issues
                  </p>
                </div>
                <Switch id="canonical-links" defaultChecked />
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
                      defaultValue="cptcrr"
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
                      defaultValue="cptcr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="relative">
                    <span className="absolute transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground">
                      linkedin.com/in/
                    </span>
                    <Input id="linkedin" className="pl-28" placeholder="username" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative">
                    <span className="absolute transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground">
                      @
                    </span>
                    <Input id="instagram" className="pl-8" placeholder="username" />
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
                  <select
                    id="posts-per-page"
                    className="w-full h-10 px-3 py-2 text-sm border rounded-md border-input bg-background"
                  >
                    <option value="6">6 posts</option>
                    <option value="9" selected>
                      9 posts
                    </option>
                    <option value="12">12 posts</option>
                    <option value="15">15 posts</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-sort">Default Post Sorting</Label>
                  <select
                    id="default-sort"
                    className="w-full h-10 px-3 py-2 text-sm border rounded-md border-input bg-background"
                  >
                    <option value="newest" selected>
                      Newest First
                    </option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="featured-section">Featured Posts Section</Label>
                  <p className="text-xs text-muted-foreground">
                    Show featured posts section on the homepage
                  </p>
                </div>
                <Switch id="featured-section" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-author">Show Author Information</Label>
                  <p className="text-xs text-muted-foreground">Display author details on posts</p>
                </div>
                <Switch id="show-author" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-dates">Show Publish Dates</Label>
                  <p className="text-xs text-muted-foreground">
                    Display when posts were published or updated
                  </p>
                </div>
                <Switch id="show-dates" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-related">Show Related Posts</Label>
                  <p className="text-xs text-muted-foreground">
                    Display related posts at the end of articles
                  </p>
                </div>
                <Switch id="show-related" defaultChecked />
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
                  <div className="w-10 h-10 rounded-md bg-primary"></div>
                  <Input id="primary-color" type="text" value="#3498db" className="w-32" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fonts">Font Style</Label>
                <select
                  id="fonts"
                  className="w-full h-10 px-3 py-2 text-sm border rounded-md border-input bg-background"
                >
                  <option value="inter" selected>
                    Inter (Modern Sans-Serif)
                  </option>
                  <option value="merriweather">Merriweather (Elegant Serif)</option>
                  <option value="jetbrains">JetBrains Mono (Monospace)</option>
                  <option value="system">System Default</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  The primary font used throughout your blog
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="heading-style">Heading Style</Label>
                  <select
                    id="heading-style"
                    className="w-full h-10 px-3 py-2 text-sm border rounded-md border-input bg-background"
                  >
                    <option value="large" selected>
                      Large & Bold
                    </option>
                    <option value="medium">Medium & Regular</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spacing">Content Spacing</Label>
                  <select
                    id="spacing"
                    className="w-full h-10 px-3 py-2 text-sm border rounded-md border-input bg-background"
                  >
                    <option value="compact">Compact</option>
                    <option value="normal" selected>
                      Normal
                    </option>
                    <option value="relaxed">Relaxed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Default to Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Use dark mode by default for all visitors
                  </p>
                </div>
                <Switch id="dark-mode" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme-toggle">Show Theme Toggle</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow visitors to switch between light and dark mode
                  </p>
                </div>
                <Switch id="theme-toggle" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>Configure API access for external services</CardDescription>
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
                <p className="text-xs text-muted-foreground">
                  Used for external services to access your blog content
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input id="webhook-url" type="url" placeholder="https://example.com/webhook" />
                <p className="text-xs text-muted-foreground">
                  Receive notifications when new content is published
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="api-enabled">Enable API Access</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow external applications to access your blog via API
                  </p>
                </div>
                <Switch id="api-enabled" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
              <CardDescription>Connect your blog with external services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 border rounded-lg border-border">
                <div className="p-2 rounded-md bg-blue-500/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-500"
                  >
                    <path d="M21 12c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9 9-4.03 9-9Z" />
                    <path d="M10 8.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z" />
                    <path d="M18 12c0 3.31-2.669 6-6 6s-6-2.69-6-6c0-2 1-3.5 2.5-5" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-medium">Google Analytics</h3>
                  <p className="text-xs text-muted-foreground">
                    Track visitor analytics and user behavior
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg border-border">
                <div className="p-2 rounded-md bg-red-500/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <path d="m15 5-4 4-4-4" />
                    <path d="M7 9h9.5a3.5 3.5 0 0 1 0 7H2" />
                    <path d="m15 19-4-4-4 4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-medium">Mailchimp</h3>
                  <p className="text-xs text-muted-foreground">Email newsletter integration</p>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg border-border">
                <div className="p-2 rounded-md bg-purple-500/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-purple-500"
                  >
                    <path d="M21 8c-1.5 1.5-3 2-5 2s-3.5-.5-5-2-2-3-2-5h12c0 2-.5 3.5-2 5z" />
                    <path d="M8 16.5c1.5.5 3 .5 4.5.5s3.5-.5 5-2c1.5-1.5 2-3 2-5H3c0 2 .5 3.5 2 5 .5.5 1 1 1.5 1.5" />
                    <path d="M7.5 19.5c1.5-1.5 2-3 2-5" />
                    <path d="M16.5 19.5c-1.5-1.5-2-3-2-5" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-medium">Discord</h3>
                  <p className="text-xs text-muted-foreground">
                    Post notifications to Discord channels
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-500">Connected</span>
                  <Button variant="ghost" size="sm">
                    Configure
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg border-border">
                <div className="p-2 rounded-md bg-blue-500/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-500"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-medium">Sendgrid</h3>
                  <p className="text-xs text-muted-foreground">Transactional email service</p>
                </div>
                <Button variant="outline" size="sm">
                  Connect
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
              <CardDescription>Update your administrator profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Change Avatar
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input id="display-name" defaultValue="Tony" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="admin" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="contact@cptcr.dev" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue="Administrator" disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  className="min-h-[100px]"
                  defaultValue="17-year-old backend developer from Stuttgart, Germany. Specializing in Next.js, TypeScript, and building robust APIs."
                />
                <p className="text-xs text-muted-foreground">
                  Brief description about yourself that may appear with your articles
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Update your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" placeholder="••••••••••" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="••••••••••" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" placeholder="••••••••••" />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Password should be at least 10 characters and include a mix of letters, numbers, and
                symbols
              </p>

              <div className="flex items-center justify-between mt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
            <CardFooter className="pt-6 border-t border-border">
              <Button className="ml-auto">Update Security Settings</Button>
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
                >
                  Delete Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fixed save button */}
      <div className="sticky flex justify-end bottom-6">
        <div className="p-4 border rounded-lg shadow-lg bg-background/80 backdrop-blur-sm border-border">
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
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
    </div>
  );
}
