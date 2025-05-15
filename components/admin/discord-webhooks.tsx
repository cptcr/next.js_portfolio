// components/admin/discord-webhooks.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Check, Loader2, Plus, Trash2, Edit, Send, AlertCircle, X } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WebhookData {
  id: number;
  name: string;
  url: string;
  avatar?: string;
  enabled: boolean;
  categories: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export default function DiscordWebhooks() {
  const { toast } = useToast();

  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorySelectOpen, setCategorySelectOpen] = useState(false);

  const [selectedWebhook, setSelectedWebhook] = useState<WebhookData | null>(null);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    avatar: '',
    enabled: true,
    categories: [] as string[],
  });

  const [testMessage, setTestMessage] = useState('');

  // Fetch webhooks
  const fetchWebhooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/webhooks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch webhooks: ${response.status}`);

      const data = await response.json();
      setWebhooks(data.webhooks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load webhooks');
      toast({
        title: 'Error',
        description: 'Failed to load webhooks',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/posts?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status}`);

      const data = await response.json();
      const uniqueCategories = Array.from(
        new Set(data.posts.map((post: any) => post.category)),
      ).filter(Boolean) as string[];

      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchWebhooks();
    fetchCategories();
  }, []);

  // Set selected categories when editing a webhook
  useEffect(() => {
    if (selectedWebhook && selectedWebhook.categories) {
      setSelectedCategories(selectedWebhook.categories);
    } else {
      setSelectedCategories([]);
    }
  }, [selectedWebhook]);

  const handleCreateWebhook = async () => {
    if (!newWebhook.name.trim() || !newWebhook.url.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and URL are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      new URL(newWebhook.url);
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid Discord webhook URL',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');

      const webhookData = {
        ...newWebhook,
        // If no categories selected, treat it as "All Categories" (null)
        // Otherwise, send the array of selected categories
        categories: selectedCategories.length > 0 ? selectedCategories : null,
      };

      const response = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(webhookData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create webhook');
      }

      toast({
        title: 'Webhook Created',
        description: `Webhook "${newWebhook.name}" has been created`,
      });

      setNewWebhook({
        name: '',
        url: '',
        avatar: '',
        enabled: true,
        categories: [],
      });
      setSelectedCategories([]);
      setCreateDialogOpen(false);
      fetchWebhooks();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create webhook',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateWebhook = async () => {
    if (!selectedWebhook) return;

    if (!selectedWebhook.name.trim() || !selectedWebhook.url.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and URL are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      new URL(selectedWebhook.url);
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid Discord webhook URL',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');

      const webhookData = {
        name: selectedWebhook.name,
        url: selectedWebhook.url,
        avatar: selectedWebhook.avatar,
        enabled: selectedWebhook.enabled,
        // If no categories selected, treat it as "All Categories" (null)
        // Otherwise, send the array of selected categories
        categories: selectedCategories.length > 0 ? selectedCategories : null,
      };

      const response = await fetch(`/api/admin/webhooks/${selectedWebhook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(webhookData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update webhook');
      }

      toast({
        title: 'Webhook Updated',
        description: `Webhook "${selectedWebhook.name}" has been updated`,
      });

      setEditDialogOpen(false);
      fetchWebhooks();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update webhook',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWebhook = async () => {
    if (!selectedWebhook) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/webhooks/${selectedWebhook.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete webhook');
      }

      toast({
        title: 'Webhook Deleted',
        description: `Webhook "${selectedWebhook.name}" has been deleted`,
      });

      setDeleteDialogOpen(false);
      fetchWebhooks();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete webhook',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!selectedWebhook) return;

    setIsTesting(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');

      const content =
        testMessage.trim() ||
        "🔔 This is a test message from your blog's admin panel. If you're seeing this, your webhook is working properly!";

      const response = await fetch(`/api/admin/webhooks/${selectedWebhook.id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to test webhook');
      }

      toast({
        title: 'Test Successful',
        description: 'The test message was sent successfully',
      });

      setTestDialogOpen(false);
      setTestMessage('');
    } catch (err) {
      toast({
        title: 'Test Failed',
        description: err instanceof Error ? err.message : 'Failed to send test message',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const toggleWebhookEnabled = async (webhook: WebhookData, enabled: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/webhooks/${webhook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update webhook');
      }

      setWebhooks((prev) => prev.map((w) => (w.id === webhook.id ? { ...w, enabled } : w)));

      toast({
        title: enabled ? 'Webhook Enabled' : 'Webhook Disabled',
        description: `Webhook "${webhook.name}" has been ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update webhook',
        variant: 'destructive',
      });
      // Revert optimistic update on error
      setWebhooks((prev) =>
        prev.map((w) => (w.id === webhook.id ? { ...w, enabled: !enabled } : w)),
      );
    }
  };

  const handleEditWebhook = (webhook: WebhookData) => {
    setSelectedWebhook(webhook);
    // Set selected categories if they exist, otherwise empty array
    setSelectedCategories(webhook.categories || []);
    setEditDialogOpen(true);
  };

  // Handle selecting and removing categories
  const handleSelectCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleRemoveCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== category));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-10 h-10 mb-4 text-destructive" />
        <p className="font-semibold text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Discord Webhooks</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {webhooks.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-6 mb-4 rounded-full bg-muted">
                <AlertCircle className="w-12 h-12 text-muted-foreground/60" />
              </div>
              <h3 className="mb-2 text-xl font-bold">No Webhooks Found</h3>
              <p className="mb-6 text-center text-muted-foreground">
                You haven't created any Discord webhooks yet. Create your first webhook to receive
                notifications when new content is published.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </CardContent>
          </Card>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id} className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div>
                  <CardTitle className="text-lg">{webhook.name}</CardTitle>
                </div>
                <Switch
                  checked={webhook.enabled}
                  onCheckedChange={(checked) => toggleWebhookEnabled(webhook, checked)}
                />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm break-words text-muted-foreground">{webhook.url}</p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {webhook.categories && webhook.categories.length > 0 ? (
                    webhook.categories.map((cat) => (
                      <Badge key={cat} variant="outline">
                        {cat}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary">All Categories</Badge>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedWebhook(webhook);
                      setTestDialogOpen(true);
                    }}
                    title="Test webhook"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditWebhook(webhook)}
                    title="Edit webhook"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setSelectedWebhook(webhook);
                      setDeleteDialogOpen(true);
                    }}
                    title="Delete webhook"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Webhook Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Webhook</DialogTitle>
            <DialogDescription>
              Fill out the details below to create a new webhook.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="webhook-name">Name*</Label>
              <Input
                id="webhook-name"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                placeholder="Webhook Name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="webhook-url">Discord Webhook URL*</Label>
              <Input
                id="webhook-url"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://discord.com/api/webhooks/..."
              />
              <p className="text-xs text-muted-foreground">
                You can find this URL in your Discord server settings under Integrations &gt;
                Webhooks
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="webhook-avatar">Avatar URL (optional)</Label>
              <Input
                id="webhook-avatar"
                value={newWebhook.avatar}
                onChange={(e) => setNewWebhook({ ...newWebhook, avatar: e.target.value })}
                placeholder="https://cdn.discordapp.com/..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="webhook-categories">Category Filters (optional)</Label>
              <Popover open={categorySelectOpen} onOpenChange={setCategorySelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={categorySelectOpen}
                    className="justify-between w-full"
                  >
                    {selectedCategories.length > 0
                      ? `${selectedCategories.length} categories selected`
                      : "All categories"}
                    <X
                      className={`ml-2 h-4 w-4 shrink-0 opacity-50 ${
                        selectedCategories.length === 0 ? "hidden" : "inline-block"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategories([]);
                      }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandEmpty>No categories found.</CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-60">
                        {categories.map((category) => (
                          <CommandItem
                            key={category}
                            value={category}
                            onSelect={() => handleSelectCategory(category)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedCategories.includes(category) 
                                  ? "opacity-100" 
                                  : "opacity-0"
                              }`}
                            />
                            {category}
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                      <button
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveCategory(category)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                If no categories are selected, notifications will be sent for all post categories
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWebhook} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Webhook'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Webhook Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Webhook</DialogTitle>
          </DialogHeader>

          {selectedWebhook && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-webhook-name">Name*</Label>
                <Input
                  id="edit-webhook-name"
                  value={selectedWebhook.name}
                  onChange={(e) =>
                    setSelectedWebhook({
                      ...selectedWebhook,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-webhook-url">Discord Webhook URL*</Label>
                <Input
                  id="edit-webhook-url"
                  value={selectedWebhook.url}
                  onChange={(e) =>
                    setSelectedWebhook({
                      ...selectedWebhook,
                      url: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-webhook-avatar">Avatar URL (optional)</Label>
                <Input
                  id="edit-webhook-avatar"
                  value={selectedWebhook.avatar || ''}
                  onChange={(e) =>
                    setSelectedWebhook({
                      ...selectedWebhook,
                      avatar: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-webhook-categories">Category Filters (optional)</Label>
                <Popover open={categorySelectOpen} onOpenChange={setCategorySelectOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categorySelectOpen}
                      className="justify-between w-full"
                    >
                      {selectedCategories.length > 0
                        ? `${selectedCategories.length} categories selected`
                        : "All categories"}
                      <X
                        className={`ml-2 h-4 w-4 shrink-0 opacity-50 ${
                          selectedCategories.length === 0 ? "hidden" : "inline-block"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategories([]);
                        }}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandEmpty>No categories found.</CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-60">
                          {categories.map((category) => (
                            <CommandItem
                              key={category}
                              value={category}
                              onSelect={() => handleSelectCategory(category)}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedCategories.includes(category) 
                                    ? "opacity-100" 
                                    : "opacity-0"
                                }`}
                              />
                              {category}
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedCategories.map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                        <button
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemoveCategory(category)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  If no categories are selected, notifications will be sent for all post categories
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="webhook-enabled">Enabled</Label>
                <Switch
                  id="webhook-enabled"
                  checked={selectedWebhook.enabled}
                  onCheckedChange={(checked) =>
                    setSelectedWebhook({
                      ...selectedWebhook,
                      enabled: checked,
                    })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateWebhook} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Webhook Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the webhook "{selectedWebhook?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWebhook} disabled={isSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Test Webhook Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Test Message</DialogTitle>
            <DialogDescription>
              Test your webhook by sending a custom message to Discord.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Textarea
              placeholder="Enter test message (or leave empty for default)"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              If left empty, a default test message will be sent.
            </p>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTestWebhook} disabled={isTesting}>
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Test Message'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}