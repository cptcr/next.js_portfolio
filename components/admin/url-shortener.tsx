// components/admin/url-shortener.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { 
  Link, 
  Copy, 
  RefreshCcw, 
  Trash2, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Plus,
  Loader2
} from 'lucide-react';

// Types
interface ShortUrl {
  id: number;
  shortId: string;
  originalUrl: string;
  userId: number | null;
  createdAt: string;
  expiresAt: string | null;
  isPublic: boolean;
  clickCount: number;
  lastClickedAt: string | null;
}

interface NewShortUrl {
  originalUrl: string;
  expiresIn?: string;
  isPublic: boolean;
  customId?: string;
}

export default function UrlShortenerAdmin() {
  const { toast } = useToast();
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [includeExpired, setIncludeExpired] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  
  // State for new URL form
  const [newUrl, setNewUrl] = useState<NewShortUrl>({
    originalUrl: '',
    expiresIn: '7d',
    isPublic: false,
    customId: '',
  });
  const [creating, setCreating] = useState(false);
  
  // Load URLs on component mount and when includeExpired changes
  useEffect(() => {
    fetchUrls();
  }, [includeExpired]);
  
  // Fetch URLs from the API
  const fetchUrls = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/admin/url?includeExpired=${includeExpired}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch URLs');
      
      const data = await response.json();
      setUrls(data.urls);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load short URLs.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh the URLs list
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUrls();
    setRefreshing(false);
  };
  
  // Create a new short URL
  const handleCreate = async () => {
    try {
      setCreating(true);
      
      // Validate input
      if (!newUrl.originalUrl) {
        toast({
          title: 'Error',
          description: 'Please enter a URL to shorten.',
          variant: 'destructive',
        });
        return;
      }
      
      // Try to add protocol if missing
      if (!newUrl.originalUrl.startsWith('http://') && !newUrl.originalUrl.startsWith('https://')) {
        newUrl.originalUrl = 'https://' + newUrl.originalUrl;
      }
      
      // Make API request
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch('/api/admin/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUrl),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create short URL');
      }
      
      // Close dialog and refresh URLs
      const data = await response.json();
      
      toast({
        title: 'Success',
        description: 'Short URL created successfully.',
      });
      
      setCreateDialogOpen(false);
      setNewUrl({
        originalUrl: '',
        expiresIn: '7d',
        isPublic: false,
        customId: '',
      });
      
      // Add new URL to the list (optimistic update)
      setUrls((prev) => [data.url, ...prev]);
    } catch (error) {
      console.error('Error creating short URL:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create short URL',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };
  
  // Delete a short URL
  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);
      
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch('/api/admin/url', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete short URL');
      }
      
      // Remove deleted URL from the list
      setUrls((prev) => prev.filter((url) => url.id !== id));
      
      toast({
        title: 'Success',
        description: 'Short URL deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting short URL:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete short URL',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };
  
  // Copy short URL to clipboard
  const copyToClipboard = (shortId: string) => {
    const baseUrl = window.location.origin;
    const shortUrl = `${baseUrl}/${shortId}`;
    
    navigator.clipboard.writeText(shortUrl).then(
      () => {
        toast({
          title: 'Copied',
          description: 'Short URL copied to clipboard.',
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: 'Error',
          description: 'Failed to copy to clipboard.',
          variant: 'destructive',
        });
      }
    );
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Check if URL is expired
  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    
    const expireDate = new Date(expiresAt);
    return expireDate < new Date();
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">URL Shortener</h2>
          <p className="text-muted-foreground">
            Create and manage short URLs for your website
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Short URL
          </Button>
        </div>
      </div>
      
      {/* Options */}
      <div className="flex items-center space-x-2">
        <Switch
          id="include-expired"
          checked={includeExpired}
          onCheckedChange={setIncludeExpired}
        />
        <Label htmlFor="include-expired">Include expired URLs</Label>
      </div>
      
      {/* URLs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Short URLs</CardTitle>
          <CardDescription>
            Manage all your shortened URLs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="w-40 h-4" />
                    <Skeleton className="h-4 w-60" />
                  </div>
                </div>
              ))}
            </div>
          ) : urls.length === 0 ? (
            // Empty state
            <div className="py-8 text-center">
              <Link className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No short URLs yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven't created any short URLs yet. Create one to get started.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Short URL
              </Button>
            </div>
          ) : (
            // URLs table
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Short URL</TableHead>
                    <TableHead>Original URL</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urls.map((url) => (
                    <TableRow key={url.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{url.shortId}</span>
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => copyToClipboard(url.shortId)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{url.originalUrl}</span>
                          <a
                            href={url.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(url.createdAt)}</TableCell>
                      <TableCell>
                        {url.expiresAt ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {formatDate(url.expiresAt)}
                          </div>
                        ) : (
                          'Never'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{url.clickCount}</Badge>
                      </TableCell>
                      <TableCell>
                        {url.expiresAt && isExpired(url.expiresAt) ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-800 bg-green-100 dark:bg-green-800 dark:text-green-100">
                            Active
                          </Badge>
                        )}
                        {url.isPublic && (
                          <Badge variant="secondary" className="ml-2">Public</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(url.id)}
                          disabled={deleting === url.id}
                        >
                          {deleting === url.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create Short URL Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Short URL</DialogTitle>
            <DialogDescription>
              Enter a URL to shorten and customize the options.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="original-url">URL to Shorten</Label>
              <Input
                id="original-url"
                placeholder="https://example.com/long/url/to/shorten"
                value={newUrl.originalUrl}
                onChange={(e) => setNewUrl({ ...newUrl, originalUrl: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="custom-id">Custom ID (Optional)</Label>
              <Input
                id="custom-id"
                placeholder="custom-id"
                value={newUrl.customId || ''}
                onChange={(e) => setNewUrl({ ...newUrl, customId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to generate a random ID.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expires-in">Expires After</Label>
              <Select
                value={newUrl.expiresIn || ''}
                onValueChange={(value) => setNewUrl({ ...newUrl, expiresIn: value })}
              >
                <SelectTrigger id="expires-in">
                  <SelectValue placeholder="Select expiration time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Never</SelectItem>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="12h">12 Hours</SelectItem>
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is-public"
                checked={newUrl.isPublic}
                onCheckedChange={(checked) => setNewUrl({ ...newUrl, isPublic: checked })}
              />
              <Label htmlFor="is-public">Public URL</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Public URLs can be created by anyone through the public API. They will be automatically deleted after expiration.
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleCreate}
              disabled={creating || !newUrl.originalUrl}
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>Create</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}