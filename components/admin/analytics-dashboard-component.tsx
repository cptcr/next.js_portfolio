// components/admin/analytics-dashboard-component.tsx
// This is the actual implementation of the analytics dashboard

import { StatCard } from '@/components/admin/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Download,
  FileText,
  Loader2,
  PieChartIcon,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Types
interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  category: string;
  featured: boolean;
  url: string;
  createdAt: string;
  size: number;
}

interface AnalyticsOverview {
  totalPosts: number;
  newPosts: number;
  averagePostSize: number;
  categoryCounts: Record<string, number>;
  categories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

interface TimelineData {
  date: string;
  count: number;
}

// Category colors for charts
const CATEGORY_COLORS = [
  '#3498db',
  '#e74c3c',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#d35400',
  '#34495e',
  '#7f8c8d',
  '#16a085',
  '#27ae60',
  '#2980b9',
  '#8e44ad',
  '#f1c40f',
  '#e67e22',
];

export default function AnalyticsDashboard() {
  const { toast } = useToast();

  // State
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('month');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [overviewData, setOverviewData] = useState<AnalyticsOverview | null>(null);
  const [postsData, setPostsData] = useState<PostMetadata[] | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineData[] | null>(null);
  const [featuredPosts, setFeaturedPosts] = useState<PostMetadata[] | null>(null);

  // Fetch all analytics data
  const fetchAllAnalytics = async (shouldRefresh = false) => {
    if (shouldRefresh) {
      setIsRefreshing(true);
      toast({
        title: 'Refreshing data',
        description: 'Fetching the latest analytics data...',
      });
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Fetch all analytics data in parallel
      const [overviewResult, postsResult, timelineResult, featuredResult] = await Promise.all([
        fetchAnalyticsData('overview', token),
        fetchAnalyticsData('posts', token),
        fetchAnalyticsData('timeline', token),
        fetchAnalyticsData('featured', token),
      ]);

      setOverviewData(overviewResult);
      setPostsData(postsResult);
      setTimelineData(timelineResult);
      setFeaturedPosts(featuredResult);

      if (shouldRefresh) {
        toast({
          title: 'Data refreshed',
          description: 'Analytics data has been updated successfully.',
        });
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');

      toast({
        title: 'Error loading data',
        description: err instanceof Error ? err.message : 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Helper function to fetch specific analytics data
  const fetchAnalyticsData = async (type: string, token: string) => {
    const response = await fetch(`/api/admin/analytics?type=${type}&period=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch ${type} analytics`);
    }

    const result = await response.json();
    return result.data;
  };

  // Fetch data on mount and when time range changes
  useEffect(() => {
    fetchAllAnalytics();
  }, [timeRange]);

  // Format bytes to human-readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Export analytics data as CSV
  const exportAnalytics = () => {
    if (!overviewData || !postsData) {
      toast({
        title: 'Export failed',
        description: 'No data available to export',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Generate CSV string
      let csvContent = 'data:text/csv;charset=utf-8,';

      // Overview section
      csvContent += 'Analytics Overview\r\n';
      csvContent += `Time Range,${timeRange === 'day' ? 'Last 24 hours' : timeRange === 'week' ? 'Last 7 days' : 'Last 30 days'}\r\n`;
      csvContent += `Total Posts,${overviewData.totalPosts}\r\n`;
      csvContent += `New Posts,${overviewData.newPosts}\r\n`;
      csvContent += `Average Post Size,${formatBytes(overviewData.averagePostSize)}\r\n\r\n`;

      // Categories section
      csvContent += 'Categories\r\n';
      csvContent += 'Name,Count,Percentage\r\n';
      overviewData.categories.forEach((category) => {
        csvContent += `${category.name},${category.count},${category.percentage}%\r\n`;
      });
      csvContent += '\r\n';

      // Posts section
      csvContent += 'Posts\r\n';
      csvContent += 'Title,Slug,Category,Date,Size,Featured\r\n';
      postsData.forEach((post) => {
        csvContent += `"${post.title}",${post.slug},${post.category},${post.date},${formatBytes(post.size)},${post.featured}\r\n`;
      });

      // Create a download link and trigger it
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `blog-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export successful',
        description: 'Analytics data has been exported to CSV',
      });
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export analytics data',
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-lg">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !overviewData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="p-6 rounded-lg bg-red-500/10">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="mb-2 text-xl font-bold">Error Loading Analytics</h2>
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button onClick={() => fetchAllAnalytics()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If data hasn't loaded yet, don't render anything
  if (!overviewData || !postsData || !timelineData) {
    return null;
  }

  // Calculate the period description for display
  const periodDescription =
    timeRange === 'day' ? 'last 24 hours' : timeRange === 'week' ? 'last 7 days' : 'last 30 days';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Blog Analytics</h2>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            onClick={() => fetchAllAnalytics(true)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>

          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={exportAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Posts"
          value={overviewData.totalPosts.toString()}
          icon={<FileText className="w-5 h-5 text-blue-500" />}
          isLoading={isRefreshing}
        />

        <StatCard
          title={`New Posts (${periodDescription})`}
          value={overviewData.newPosts.toString()}
          icon={<BarChart3 className="w-5 h-5 text-green-500" />}
          isLoading={isRefreshing}
        />

        <StatCard
          title="Average Post Size"
          value={formatBytes(overviewData.averagePostSize)}
          icon={<FileText className="w-5 h-5 text-purple-500" />}
          isLoading={isRefreshing}
        />

        <StatCard
          title="Categories"
          value={overviewData.categories.length.toString()}
          icon={<PieChartIcon className="w-5 h-5 text-yellow-500" />}
          isLoading={isRefreshing}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Post Creation Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Post Creation Timeline</CardTitle>
              <CardDescription>New blog posts created over {periodDescription}</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timelineData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3498db" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3498db" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey={(entry) => {
                        const date = new Date(entry.date);
                        if (timeRange === 'day') {
                          return date.toLocaleTimeString([], {
                            hour: '2-digit',
                          });
                        } else if (timeRange === 'week') {
                          return date.toLocaleDateString([], {
                            weekday: 'short',
                          });
                        } else {
                          return date.toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          });
                        }
                      }}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17,17,17,0.8)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        borderRadius: '4px',
                      }}
                      formatter={(value) => [value.toString(), 'Posts Created']}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3498db"
                      fillOpacity={1}
                      fill="url(#colorPosts)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Distribution of your blog posts by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overviewData.categories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {overviewData.categories.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(17,17,17,0.8)',
                          borderColor: 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          borderRadius: '4px',
                        }}
                        formatter={(value, name, props) => {
                          return [`${value} posts (${props.payload.percentage}%)`, name];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {overviewData.categories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 transition-colors rounded-md hover:bg-muted/20"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                          }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{category.count} posts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Posts */}
          {featuredPosts && featuredPosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Featured Posts</CardTitle>
                <CardDescription>Your highlighted blog posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {featuredPosts.slice(0, 5).map((post, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-2 p-3 transition-colors border rounded-md bg-card border-border sm:flex-row sm:items-center sm:justify-between hover:border-primary"
                    >
                      <div>
                        <h3 className="text-sm font-medium">{post.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs whitespace-nowrap"
                        asChild
                      >
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          View Post
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Posts</CardTitle>
              <CardDescription>Complete list of your blog posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 font-medium text-left">Title</th>
                        <th className="px-4 py-3 font-medium text-left">Category</th>
                        <th className="px-4 py-3 font-medium text-left">Date</th>
                        <th className="px-4 py-3 font-medium text-left">Size</th>
                        <th className="px-4 py-3 font-medium text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {postsData.map((post, index) => (
                        <tr key={index} className="border-b hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {post.title}
                            </a>
                          </td>
                          <td className="px-4 py-3">{post.category}</td>
                          <td className="px-4 py-3">{new Date(post.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3">{formatBytes(post.size)}</td>
                          <td className="px-4 py-3">
                            <Badge variant={post.featured ? 'default' : 'outline'}>
                              {post.featured ? 'Featured' : 'Regular'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing {postsData.length} of {overviewData.totalPosts} posts
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
              <CardDescription>Detailed breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {overviewData.categories.map((category, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-2 bg-muted/30">
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                            }}
                          />
                          {category.name}
                        </CardTitle>
                        <Badge>{category.count} posts</Badge>
                      </div>
                      <CardDescription>{category.percentage}% of total posts</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {postsData
                          .filter((post) => post.category === category.name)
                          .slice(0, 3)
                          .map((post, idx) => (
                            <div key={idx} className="text-sm truncate hover:text-primary">
                              <a
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {post.title}
                              </a>
                            </div>
                          ))}

                        {postsData.filter((post) => post.category === category.name).length > 3 && (
                          <Button variant="ghost" size="sm" className="mt-1 text-xs h-7">
                            View all{' '}
                            {postsData.filter((post) => post.category === category.name).length}{' '}
                            posts
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Comparison</CardTitle>
              <CardDescription>Post counts by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={overviewData.categories}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17,17,17,0.8)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        borderRadius: '4px',
                      }}
                      formatter={(value) => [`${value} posts`, 'Count']}
                    />
                    <Bar dataKey="count" name="Posts" fill="#3498db" radius={[4, 4, 0, 0]}>
                      {overviewData.categories.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Data Summary */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-blue-500">Real-time Blog Insights</CardTitle>
          <CardDescription>Analytics based on your actual Vercel Blob Storage data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 border rounded-md bg-background/50 border-border">
              <h3 className="mb-1 text-sm font-medium">Content Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Your blog currently has {overviewData.totalPosts} posts across{' '}
                {overviewData.categories.length} categories, with an average post size of{' '}
                {formatBytes(overviewData.averagePostSize)}.
              </p>
            </div>

            {overviewData.categories.length > 0 && (
              <div className="p-3 border rounded-md bg-background/50 border-border">
                <h3 className="mb-1 text-sm font-medium">Category Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Your most popular category is "{overviewData.categories[0].name}" with{' '}
                  {overviewData.categories[0].count} posts ({overviewData.categories[0].percentage}%
                  of your content).
                </p>
              </div>
            )}

            {featuredPosts && featuredPosts.length > 0 && (
              <div className="p-3 border rounded-md bg-background/50 border-border">
                <h3 className="mb-1 text-sm font-medium">Featured Content</h3>
                <p className="text-sm text-muted-foreground">
                  You have {featuredPosts.length} featured posts (
                  {Math.round((featuredPosts.length / overviewData.totalPosts) * 100)}% of your
                  content). Your latest featured post is "{featuredPosts[0].title}".
                </p>
              </div>
            )}

            {overviewData.newPosts > 0 && (
              <div className="p-3 border rounded-md bg-background/50 border-border">
                <h3 className="mb-1 text-sm font-medium">Recent Activity</h3>
                <p className="text-sm text-muted-foreground">
                  You've published {overviewData.newPosts} new posts in the {periodDescription}.
                  {overviewData.newPosts > 1 ? ' Keep up the good work!' : ' Great job!'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
