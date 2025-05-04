// app/admin/dashboard/admin-dashboard-client.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  Hexagon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Import admin components
import AdminDashboardLayout from './admin-dashboard-layout';
import AnalyticsDashboard from '@/components/admin/analytics-dashboard';
import EditorialCalendar from '@/components/admin/editorial-calendar';
import PostEditor from '@/components/admin/post-editor';
import SettingsPanel from '@/components/admin/settings-panel';
import PostsList from '@/components/admin/posts-list';
import UserManagement from '@/components/admin/user-management';
import ApiKeysManagement from '@/components/admin/api-key-management';
import ApiKeyLogs from '@/components/admin/api-key-logs';
import UrlShortenerAdmin from '@/components/admin/url-shortener';
import CodeSnippetsAdmin from '@/components/admin/code-snippets';

export default function AdminDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [firstTimeSetupOpen, setFirstTimeSetupOpen] = useState<boolean>(false);
  const [setupCredentials, setSetupCredentials] = useState({
    username: 'admin',
    password: '',
    confirmPassword: '',
  });
  const [isSubmittingSetup, setIsSubmittingSetup] = useState<boolean>(false);
  const [userPermissions, setUserPermissions] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');

  // Get URL search params to check for tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (
      tabParam &&
      ['analytics', 'posts', 'create', 'calendar', 'settings', 'users', 'api-keys', 'url-shortener', 'snippets'].includes(
        tabParam,
      )
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Verify authentication on component mount
  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await fetch('/api/admin/verify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Invalid token');
        }

        if (!isMounted) return;

        const data = await response.json();
        setIsAuthenticated(true);
        await fetchUserPermissions(data.username);
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('adminToken');
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Authentication failed');
          setIsLoading(false);
          router.push('/admin');
        }
      } finally {
        if (isMounted && (isAuthenticated || !error)) {
          setIsLoading(false);
        }
      }
    };

    // Check if we need to show first-time setup
    const checkFirstTimeSetup = async () => {
      try {
        const response = await fetch('/api/admin/check-setup');
        if (response.ok) {
          const data = await response.json();
          if (data.needsSetup && isMounted) {
            setFirstTimeSetupOpen(true);
          }
        }
      } catch (error) {
        console.error('Error checking setup:', error);
      }
    };

    verifyAuth();
    checkFirstTimeSetup();

    return () => {
      isMounted = false;
    };
  }, [router, isAuthenticated, error]);

  // Fetch user permissions
  const fetchUserPermissions = async (username: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch('/api/admin/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserPermissions(data.permissions || {});
        setUserRole(data.role || 'user');
      }
    } catch (err) {
      console.error('Error fetching user permissions:', err);
    }
  };

  // Handle setup form submission
  const handleSetupSubmit = async () => {
    if (setupCredentials.password !== setupCredentials.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: 'Please make sure both passwords match',
        variant: 'destructive',
      });
      return;
    }
    if (setupCredentials.password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingSetup(true);
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: setupCredentials.username,
          password: setupCredentials.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to setup admin account');
      }

      toast({
        title: 'Setup complete',
        description: 'Your admin account has been created. Please log in.',
      });
      setFirstTimeSetupOpen(false);
      router.push('/admin');
    } catch (err) {
      toast({
        title: 'Setup failed',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingSetup(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container max-w-6xl px-4 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="w-64 h-8" />
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 md:grid-cols-4">
            <Skeleton className="h-32" /> <Skeleton className="h-32" />
            <Skeleton className="h-32" /> <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Render null if redirecting
  if (!isAuthenticated && !isLoading && !error) {
    return null;
  }

  // Handle error state UI
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-24 pb-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle className="text-center">Authentication Error</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <div className="flex justify-center p-6">
            <Button onClick={() => router.push('/admin')}>Return to Login</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Main authenticated dashboard UI
  return (
    <>
      <AdminDashboardLayout userRole={userRole} userPermissions={userPermissions}>
        <Tabs value={activeTab} defaultValue="analytics">
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
          <TabsContent value="posts">
            <PostsList userRole={userRole} userPermissions={userPermissions} />
          </TabsContent>
          <TabsContent value="create">
            <PostEditor />
          </TabsContent>
          <TabsContent value="calendar">
            <EditorialCalendar />
          </TabsContent>
          <TabsContent value="url-shortener">
            <UrlShortenerAdmin />
          </TabsContent>
          <TabsContent value="snippets">
            <CodeSnippetsAdmin />
          </TabsContent>
          <TabsContent value="users">
            {userRole === 'admin' || userPermissions?.canManageUsers ? (
              <UserManagement />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Access Denied</CardTitle>
                  <CardDescription>
                    You do not have permission to access user management.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="api-keys">
            {userRole === 'admin' || 
             userPermissions?.canManageApiKeys || 
             userPermissions?.canCreateApiKeys ? (
              searchParams.get('key') ? (
                <ApiKeyLogs />
              ) : (
                <ApiKeysManagement />
              )
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Access Denied</CardTitle>
                  <CardDescription>
                    You do not have permission to access API key management.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="settings">
            {userRole === 'admin' || userPermissions?.canManageSettings ? (
              <SettingsPanel />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Access Denied</CardTitle>
                  <CardDescription>
                    You do not have permission to access settings.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </AdminDashboardLayout>

      {/* First Time Setup Dialog */}
      <AlertDialog open={firstTimeSetupOpen} onOpenChange={setFirstTimeSetupOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Initial Admin Setup</AlertDialogTitle>
            <AlertDialogDescription>
              Welcome! Please create your admin account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="setup-username">Admin Username</Label>
              <Input
                id="setup-username"
                value={setupCredentials.username}
                onChange={(e) =>
                  setSetupCredentials({ ...setupCredentials, username: e.target.value })
                }
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setup-password">Admin Password</Label>
              <Input
                id="setup-password"
                type="password"
                value={setupCredentials.password}
                onChange={(e) =>
                  setSetupCredentials({ ...setupCredentials, password: e.target.value })
                }
                placeholder="Enter a secure password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setup-confirm-password">Confirm Password</Label>
              <Input
                id="setup-confirm-password"
                type="password"
                value={setupCredentials.confirmPassword}
                onChange={(e) =>
                  setSetupCredentials({ ...setupCredentials, confirmPassword: e.target.value })
                }
                placeholder="Confirm your password"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleSetupSubmit}
              disabled={
                isSubmittingSetup || !setupCredentials.password || !setupCredentials.confirmPassword
              }
            >
              {isSubmittingSetup ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Complete Setup'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}