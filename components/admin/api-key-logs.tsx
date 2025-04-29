// components/admin/api-key-logs.tsx
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays } from 'date-fns';
import {
  CalendarIcon,
  DownloadIcon,
  FileIcon,
  FilterIcon,
  LayersIcon,
  Loader2,
  BarChart,
  BarChart2,
  XCircle,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ApiKey {
  id: number;
  name: string;
  prefix: string;
  permissions: {
    readPosts?: boolean;
    readUsers?: boolean;
    writePosts?: boolean;
    writeUsers?: boolean;
    admin?: boolean;
  };
  expiresAt: string | null;
  lastUsed: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiLog {
  id: number;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestIp: string;
  userAgent: string;
  createdAt: string;
  apiKeyId: number;
  apiKeyName: string;
  apiKeyPrefix: string;
}

interface ApiUsageStats {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  requestsByEndpoint: Record<string, number>;
}

const COLORS = [
  '#3498db', // blue
  '#2ecc71', // green
  '#e74c3c', // red
  '#f39c12', // orange
  '#9b59b6', // purple
  '#1abc9c', // teal
  '#34495e', // dark blue
];

export default function ApiKeyLogs() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const keyId = searchParams.get('key');
  
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [stats, setStats] = useState<ApiUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  });
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    hasMore: false,
  });
  const [endpointFilter, setEndpointFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch API key details and logs on mount
  useEffect(() => {
    if (keyId) {
      fetchApiKey(parseInt(keyId));
      fetchApiLogs(parseInt(keyId));
    }
  }, [keyId, dateRange]);

  // Fetch API key details
  const fetchApiKey = async (id: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/api-keys/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch API key: ${response.status}`);
      }

      const data = await response.json();
      setApiKey(data.apiKey);
    } catch (error) {
      console.error('Error fetching API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API key details',
        variant: 'destructive',
      });
    }
  };

  // Fetch API logs
  const fetchApiLogs = async (id: number, loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const { startDate, endDate } = dateRange;
      let url = `/api/admin/api-keys/${id}/logs?limit=${pagination.limit}`;
      
      if (loadMore) {
        url += `&offset=${pagination.offset + pagination.limit}`;
      } else {
        url += '&offset=0';
      }
      
      if (startDate) {
        url += `&startDate=${startDate.toISOString()}`;
      }
      
      if (endDate) {
        url += `&endDate=${endDate.toISOString()}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch API logs: ${response.status}`);
      }

      const data = await response.json();
      
      if (loadMore) {
        setLogs([...logs, ...data.logs]);
      } else {
        setLogs(data.logs);
      }
      
      setStats(data.stats);
      setPagination({
        ...pagination,
        offset: loadMore ? pagination.offset + pagination.limit : 0,
        hasMore: data.pagination.hasMore,
      });
    } catch (error) {
      console.error('Error fetching API logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API usage logs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Filter logs based on selected filters
  const getFilteredLogs = () => {
    return logs.filter((log) => {
      if (endpointFilter !== 'all' && !log.endpoint.includes(endpointFilter)) {
        return false;
      }
      
      if (statusFilter === 'success' && log.statusCode >= 400) {
        return false;
      }
      
      if (statusFilter === 'error' && log.statusCode < 400) {
        return false;
      }
      
      return true;
    });
  };

  // Transform stats data for charts
  const getEndpointChartData = () => {
    if (!stats) return [];
    
    return Object.entries(stats.requestsByEndpoint).map(([endpoint, count], index) => ({
      name: endpoint.split('/').slice(-2).join('/'),
      value: count,
      fullEndpoint: endpoint,
    }));
  };

  // Format endpoint for display
  const formatEndpoint = (endpoint: string) => {
    const parts = endpoint.split('/');
    if (parts.length <= 3) return endpoint;
    return `.../${parts.slice(-2).join('/')}`;
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'PPp');
  };

  // Reset filters
  const resetFilters = () => {
    setEndpointFilter('all');
    setStatusFilter('all');
  };

  // Handle load more
  const handleLoadMore = () => {
    if (keyId && pagination.hasMore) {
      fetchApiLogs(parseInt(keyId), true);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (
    range: 'today' | 'week' | 'month' | 'custom',
    date?: Date
  ) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    switch (range) {
      case 'today':
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        setDateRange({
          startDate: startOfToday,
          endDate: today,
        });
        break;
      case 'week':
        setDateRange({
          startDate: subDays(today, 7),
          endDate: today,
        });
        break;
      case 'month':
        setDateRange({
          startDate: subDays(today, 30),
          endDate: today,
        });
        break;
      case 'custom':
        if (date) {
          setDateRange({
            ...dateRange,
            startDate: date,
          });
        }
        break;
    }
  };

  // Get unique endpoints for filtering
  const getUniqueEndpoints = () => {
    const endpoints = logs.map(log => log.endpoint);
    return Array.from(new Set(endpoints));
  };

  if (isLoading && !apiKey) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Skeleton className="w-40 h-8" />
        </div>
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!apiKey) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <XCircle className="w-16 h-16 mb-4 text-muted-foreground/30" />
          <h3 className="mb-2 text-lg font-medium">API Key Not Found</h3>
          <p className="mb-6 text-center text-muted-foreground">
            The API key you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button variant="outline" asChild>
            <a href="/admin/dashboard?tab=api-keys">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to API Keys
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const filteredLogs = getFilteredLogs();
  const endpointChartData = getEndpointChartData();
  const uniqueEndpoints = getUniqueEndpoints();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-2">
            <a href="/admin/dashboard?tab=api-keys">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to API Keys
            </a>
          </Button>
          <h2 className="text-2xl font-bold">API Key: {apiKey.name}</h2>
          <p className="text-muted-foreground">
            Prefix: <code className="p-1 text-xs rounded bg-muted">{apiKey.prefix}</code> • 
            {apiKey.enabled ? (
              <Badge className="ml-2">Active</Badge>
            ) : (
              <Badge variant="secondary" className="ml-2">Disabled</Badge>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {dateRange.startDate ? format(dateRange.startDate, 'PP') : 'Start date'} - 
                {dateRange.endDate ? format(dateRange.endDate, 'PP') : 'End date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.startDate || undefined,
                  to: dateRange.endDate || undefined,
                }}
                onSelect={(range) =>
                  setDateRange({
                    startDate: range?.from || null,
                    endDate: range?.to || null,
                  })
                }
                initialFocus
              />
              <div className="flex items-center justify-between p-3 border-t">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateRangeChange('today')}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateRangeChange('week')}
                  >
                    Last Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateRangeChange('month')}
                  >
                    Last Month
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (keyId) {
                fetchApiLogs(parseInt(keyId));
              }
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Request Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Stats cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? stats.totalRequests.toLocaleString() : '-'}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  In the selected time period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? `${stats.successRate.toFixed(1)}%` : '-'}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Requests with status code &lt; 400
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? `${stats.avgResponseTime.toFixed(0)}ms` : '-'}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Average response time in milliseconds
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Endpoint distribution chart */}
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Distribution</CardTitle>
              <CardDescription>
                Request distribution by endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              {endpointChartData.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={endpointChartData}
                        nameKey="name"
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {endpointChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any, props: any) => {
                          return [`${value} requests`, props.payload.fullEndpoint];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  No data available for the selected time period.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent logs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>
                Recent API requests made with this key
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Response Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.slice(0, 5).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {formatDate(log.createdAt)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {formatEndpoint(log.endpoint)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              log.method === 'GET' ? 'bg-blue-500/10 text-blue-500' :
                              log.method === 'POST' ? 'bg-green-500/10 text-green-500' :
                              log.method === 'PUT' ? 'bg-amber-500/10 text-amber-500' :
                              log.method === 'DELETE' ? 'bg-red-500/10 text-red-500' :
                              ''
                            }
                          >
                            {log.method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={log.statusCode < 400 ? 'default' : 'destructive'}
                          >
                            {log.statusCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {log.responseTime}ms
                        </TableCell>
                      </TableRow>
                    ))}
                    {logs.length > 5 && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('logs')}
                  >
                    View All Logs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Request Logs</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={endpointFilter}
                    onValueChange={setEndpointFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by endpoint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All endpoints</SelectItem>
                      {uniqueEndpoints.map((endpoint) => (
                        <SelectItem key={endpoint} value={endpoint}>
                          {formatEndpoint(endpoint)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="success">Success (2xx/3xx)</SelectItem>
                      <SelectItem value="error">Error (4xx/5xx)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={resetFilters}
                    className="h-9"
                  >
                    Reset
                  </Button>
                </div>
              </div>
              <CardDescription>
                Showing {filteredLogs.length} of {logs.length} logs in selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead className="text-right">Response Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {formatDate(log.createdAt)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={log.endpoint}>
                          {formatEndpoint(log.endpoint)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              log.method === 'GET' ? 'bg-blue-500/10 text-blue-500' :
                              log.method === 'POST' ? 'bg-green-500/10 text-green-500' :
                              log.method === 'PUT' ? 'bg-amber-500/10 text-amber-500' :
                              log.method === 'DELETE' ? 'bg-red-500/10 text-red-500' :
                              ''
                            }
                          >
                            {log.method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={log.statusCode < 400 ? 'default' : 'destructive'}
                          >
                            {log.statusCode}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.requestIp}
                        </TableCell>
                        <TableCell className="text-right">
                          {log.responseTime}ms
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No matching logs found. Try adjusting your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {pagination.hasMore && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}