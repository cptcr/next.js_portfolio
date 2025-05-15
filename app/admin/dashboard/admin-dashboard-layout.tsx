// app/admin/dashboard/admin-dashboard-layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Loader2,
  BarChart3,
  FileText,
  Settings,
  Users,
  Calendar,
  LogOut,
  LayoutDashboard,
  Hexagon,
  Menu,
  X,
  Key,
  Link,
  FileCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils/helpers';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  userRole: string;
  userPermissions: any;
}

export default function AdminDashboardLayout({
  children,
  userRole,
  userPermissions,
}: AdminDashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Use a media query hook to detect screen size
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Auto-close sidebar on navigation in mobile view
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [pathname, searchParams, isMobile]);

  // Check permissions
  const canAccessUsers = userRole === 'admin' || userPermissions?.canManageUsers;
  const canAccessSettings = userRole === 'admin' || userPermissions?.canManageSettings;
  const canAccessApiKeys =
    userRole === 'admin' || userPermissions?.canManageApiKeys || userPermissions?.canCreateApiKeys;

  // Get current tab from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (
      tabParam &&
      [
        'analytics',
        'posts',
        'create',
        'calendar',
        'settings',
        'users',
        'api-keys',
        'url-shortener',
        'snippets',
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Handle tab change with URL update
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSidebarOpen(false);

    // Update URL without refreshing the page
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.pushState({}, '', url.toString());

    // Also update the router (for Next.js)
    router.push(`/admin/dashboard?tab=${value}`);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  // Navigation items
  const navItems = [
    {
      name: 'Analytics',
      value: 'analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-blue-500',
      visible: true,
    },
    {
      name: 'Manage Posts',
      value: 'posts',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-green-500',
      visible: true,
    },
    {
      name: 'Create Post',
      value: 'create',
      icon: <LayoutDashboard className="w-5 h-5" />,
      color: 'text-purple-500',
      visible: true,
    },
    {
      name: 'Editorial Calendar',
      value: 'calendar',
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-orange-500',
      visible: true,
    },
    {
      name: 'URL Shortener',
      value: 'url-shortener',
      icon: <Link className="w-5 h-5" />,
      color: 'text-indigo-500',
      visible: true,
    },
    {
      name: 'Code Snippets',
      value: 'snippets',
      icon: <FileCode className="w-5 h-5" />,
      color: 'text-pink-500',
      visible: true,
    },
    {
      name: 'User Management',
      value: 'users',
      icon: <Users className="w-5 h-5" />,
      color: 'text-yellow-500',
      visible: canAccessUsers,
    },
    {
      name: 'API Keys',
      value: 'api-keys',
      icon: <Key className="w-5 h-5" />,
      color: 'text-red-500',
      visible: canAccessApiKeys,
    },
    {
      name: 'Settings',
      value: 'settings',
      icon: <Settings className="w-5 h-5" />,
      color: 'text-gray-500',
      visible: canAccessSettings,
    },
  ].filter((item) => item.visible);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Toggle - Fixed position in the header */}
      <div className="fixed z-50 top-4 left-4 md:hidden">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full shadow-md">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex items-center">
                  <Hexagon className="w-6 h-6 mr-2 text-primary" />
                  <h2 className="text-xl font-bold">Admin</h2>
                </div>
              </div>
              <nav className="flex-1 p-2 overflow-auto">
                {navItems.map((item) => (
                  <button
                    key={item.value}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md w-full text-left mb-1 transition-colors',
                      activeTab === item.value
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted',
                    )}
                    onClick={() => handleTabChange(item.value)}
                  >
                    <div className={`flex-shrink-0 ${item.color}`}>{item.icon}</div>
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t">
                <Button variant="outline" className="justify-start w-full" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - Fixed position */}
      <div className="fixed inset-y-0 left-0 z-10 hidden md:flex md:flex-col md:w-64 md:min-w-64 md:border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <Hexagon className="w-6 h-6 mr-2 text-primary" />
            <h2 className="text-xl font-bold">Admin</h2>
          </div>
        </div>
        <nav className="flex-1 p-2 overflow-auto">
          {navItems.map((item) => (
            <button
              key={item.value}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md w-full text-left mb-1 transition-colors',
                activeTab === item.value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted',
              )}
              onClick={() => handleTabChange(item.value)}
            >
              <div className={`flex-shrink-0 ${item.color}`}>{item.icon}</div>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="justify-start w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content - With padding to account for fixed sidebar */}
      <div className="flex-1 w-full min-h-screen md:ml-64">
        <div className="container max-w-6xl p-4 pt-16 pb-12 mx-auto md:pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl mt-9 md:mt-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your blog content and settings</p>
            </div>
          </div>

          {/* Content */}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}