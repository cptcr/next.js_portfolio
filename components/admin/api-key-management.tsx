// components/admin/api-keys-management.tsx
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Check,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Plus,
  RefreshCcw,
  Trash2,
} from 'lucide-react';

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

export default function ApiKeysManagement() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyVisible, setNewKeyVisible] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [createDialogState, setCreateDialogState] = useState({
    name: '',
    expiresAt: null as Date | null,
    permissions: {
      readPosts: true,
      readUsers: false,
      writePosts: false,
      writeUsers: false,
      admin: false,
    },
  });
  const [newApiKey, setNewApiKey] = useState({
    id: 0,
    name: '',
    prefix: '',
    fullKey: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch API keys on mount
  useEffect(() => {
    fetchApiKeys();
  }, []);

  // Fetch API keys
  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/api-keys', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch API keys: ${response.status}`);
      }

      const data = await response.json();
      setApiKeys(data.apiKeys || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API keys. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle create API key
  const handleCreateKey = async () => {
    try {
      if (!createDialogState.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'API key name is required',
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitting(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: createDialogState.name,
          permissions: createDialogState.permissions,
          expiresAt: createDialogState.expiresAt,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create API key');
      }

      const data = await response.json();

      // Set the new key details for display
      setNewApiKey({
        id: data.apiKey.id,
        name: data.apiKey.name,
        prefix: data.apiKey.prefix,
        fullKey: data.key,
      });

      // Show key and reset form
      setNewKeyVisible(true);
      setCreateDialogState({
        name: '',
        expiresAt: null,
        permissions: {
          readPosts: true,
          readUsers: false,
          writePosts: false,
          writeUsers: false,
          admin: false,
        },
      });

      // Refresh the list
      fetchApiKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create API key',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggle API key enabled/disabled
  const toggleApiKeyEnabled = async (apiKey: ApiKey, enabled: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/api-keys/${apiKey.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update API key: ${response.status}`);
      }

      // Update local state
      setApiKeys(apiKeys.map((key) => (key.id === apiKey.id ? { ...key, enabled } : key)));

      toast({
        title: enabled ? 'API Key Enabled' : 'API Key Disabled',
        description: `API key "${apiKey.name}" has been ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to update API key',
        variant: 'destructive',
      });
    }
  };

  // Handle delete API key
  const handleDeleteKey = async () => {
    if (!keyToDelete) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/api-keys/${keyToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete API key: ${response.status}`);
      }

      // Update local state
      setApiKeys(apiKeys.filter((key) => key.id !== keyToDelete.id));

      toast({
        title: 'API Key Deleted',
        description: `API key "${keyToDelete.name}" has been deleted`,
      });

      setDeleteDialogOpen(false);
      setKeyToDelete(null);
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle copy API key
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      },
    );
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'PPp');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">API Keys</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {/* API Keys List */}
      <div className="grid gap-4">
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Key className="w-16 h-16 mb-4 text-muted-foreground/30" />
              <h3 className="mb-2 text-lg font-medium">No API Keys</h3>
              <p className="mb-6 text-center text-muted-foreground">
                You haven't created any API keys yet. API keys are used to authenticate requests to
                your blog's API.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((apiKey) => (
            <Card key={apiKey.id} className={!apiKey.enabled ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <code className="px-1 py-0.5 bg-muted rounded text-xs">
                        {apiKey.prefix}••••••••••••••••
                      </code>
                      <Badge variant={apiKey.enabled ? 'default' : 'secondary'} className="ml-2">
                        {apiKey.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </CardDescription>
                  </div>
                  <Switch
                    checked={apiKey.enabled}
                    onCheckedChange={(checked) => toggleApiKeyEnabled(apiKey, checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Created</span>
                    <p className="text-sm">{formatDate(apiKey.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Last Used</span>
                    <p className="text-sm">{formatDate(apiKey.lastUsed)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Expires</span>
                    <p className="text-sm">
                      {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-xs text-muted-foreground">Permissions</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {apiKey.permissions?.readPosts && (
                      <Badge variant="outline" className="text-xs">
                        Read Posts
                      </Badge>
                    )}
                    {apiKey.permissions?.writePosts && (
                      <Badge variant="outline" className="text-xs">
                        Write Posts
                      </Badge>
                    )}
                    {apiKey.permissions?.readUsers && (
                      <Badge variant="outline" className="text-xs">
                        Read Users
                      </Badge>
                    )}
                    {apiKey.permissions?.writeUsers && (
                      <Badge variant="outline" className="text-xs">
                        Write Users
                      </Badge>
                    )}
                    {apiKey.permissions?.admin && <Badge className="text-xs">Admin</Badge>}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between pt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/admin/dashboard?tab=api-keys&key=${apiKey.id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    View Logs
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setKeyToDelete(apiKey);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Create API Key Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          {!newKeyVisible ? (
            <>
              <DialogHeader>
                <DialogTitle>Create API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key to authenticate requests to your blog's API.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">API Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., Mobile App, External Service"
                    value={createDialogState.name}
                    onChange={(e) =>
                      setCreateDialogState({
                        ...createDialogState,
                        name: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Give your API key a descriptive name to identify its use.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Expiration</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start w-full font-normal text-left"
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {createDialogState.expiresAt
                          ? format(createDialogState.expiresAt, 'PPP')
                          : 'No expiration'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={createDialogState.expiresAt ?? undefined}
                        onSelect={(date) =>
                          setCreateDialogState({
                            ...createDialogState,
                            expiresAt: date ?? null,
                          })
                        }
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                      <div className="flex items-center justify-center p-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setCreateDialogState({
                              ...createDialogState,
                              expiresAt: null,
                            })
                          }
                        >
                          Clear
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    Optional. If set, the key will expire on this date.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="p-4 space-y-2 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="permission-read-posts" className="text-sm">
                          Read Posts
                        </Label>
                        <p className="text-xs text-muted-foreground">Can read post data</p>
                      </div>
                      <Switch
                        id="permission-read-posts"
                        checked={createDialogState.permissions.readPosts}
                        onCheckedChange={(checked) =>
                          setCreateDialogState({
                            ...createDialogState,
                            permissions: {
                              ...createDialogState.permissions,
                              readPosts: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="permission-write-posts" className="text-sm">
                          Write Posts
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Can create, update, and delete posts
                        </p>
                      </div>
                      <Switch
                        id="permission-write-posts"
                        checked={createDialogState.permissions.writePosts}
                        onCheckedChange={(checked) =>
                          setCreateDialogState({
                            ...createDialogState,
                            permissions: {
                              ...createDialogState.permissions,
                              writePosts: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="permission-read-users" className="text-sm">
                          Read Users
                        </Label>
                        <p className="text-xs text-muted-foreground">Can read user data</p>
                      </div>
                      <Switch
                        id="permission-read-users"
                        checked={createDialogState.permissions.readUsers}
                        onCheckedChange={(checked) =>
                          setCreateDialogState({
                            ...createDialogState,
                            permissions: {
                              ...createDialogState.permissions,
                              readUsers: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="permission-write-users" className="text-sm">
                          Write Users
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Can create, update, and delete users
                        </p>
                      </div>
                      <Switch
                        id="permission-write-users"
                        checked={createDialogState.permissions.writeUsers}
                        onCheckedChange={(checked) =>
                          setCreateDialogState({
                            ...createDialogState,
                            permissions: {
                              ...createDialogState.permissions,
                              writeUsers: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="permission-admin" className="text-sm">
                          Admin Access
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Full admin access to all resources
                        </p>
                      </div>
                      <Switch
                        id="permission-admin"
                        checked={createDialogState.permissions.admin}
                        onCheckedChange={(checked) =>
                          setCreateDialogState({
                            ...createDialogState,
                            permissions: {
                              ...createDialogState.permissions,
                              admin: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setCreateDialogOpen(false)} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleCreateKey} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create API Key'
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>API Key Created</DialogTitle>
                <DialogDescription>
                  Your new API key has been created. Copy this key now as it won't be shown again.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-api-key">API Key - {newApiKey.name}</Label>
                  <div className="relative">
                    <Input
                      id="new-api-key"
                      value={newApiKey.fullKey}
                      readOnly
                      className="pr-10 font-mono"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-0 right-0 h-full px-3"
                      onClick={() => copyToClipboard(newApiKey.fullKey)}
                    >
                      {copiedKey ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Store this key securely. It will not be displayed again.
                  </p>
                </div>

                <div className="p-4 mt-4 border rounded-md bg-amber-500/10 border-amber-500/20">
                  <h4 className="flex items-center text-sm font-medium text-amber-500">
                    <Clock className="w-4 h-4 mr-2" />
                    Important
                  </h4>
                  <p className="mt-1 text-sm">
                    This API key gives access to your blog's data. Do not share it publicly or
                    commit it to source control. The key is stored as a secure hash and cannot be
                    retrieved if lost.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setNewKeyVisible(false);
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete API Key Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the API key "{keyToDelete?.name}"? This action cannot
              be undone and will immediately revoke access for any services using this key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteKey}
              className="bg-red-500 hover:bg-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete API Key'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
