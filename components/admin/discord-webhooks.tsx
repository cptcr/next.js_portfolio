// components/admin/discord-webhooks.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  Check,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Send,
  Bell,
  Settings,
  AlertCircle,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "../ui/textarea"

interface WebhookData {
  id: number
  name: string
  url: string
  avatar?: string
  enabled: boolean
  categories: string[] | null
  createdAt: string
  updatedAt: string
}

export default function DiscordWebhooks() {
  const { toast } = useToast()
  
  const [webhooks, setWebhooks] = useState<WebhookData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookData | null>(null)
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    avatar: "",
    enabled: true,
    categories: [] as string[]
  })
  
  const [testMessage, setTestMessage] = useState("")
  
  // Fetch webhooks
  const fetchWebhooks = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        throw new Error("Not authenticated")
      }
      
      const response = await fetch("/api/admin/webhooks", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch webhooks: ${response.status}`)
      }
      
      const data = await response.json()
      setWebhooks(data.webhooks || [])
    } catch (err) {
      console.error("Error fetching webhooks:", err)
      setError(err instanceof Error ? err.message : "Failed to load webhooks")
      
      toast({
        title: "Error",
        description: "Failed to load webhooks",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch post categories for webhook filtering
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        throw new Error("Not authenticated")
      }
      
      const response = await fetch("/api/admin/posts?limit=100", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.posts.map((post: any) => post.category))
      ).filter(Boolean) as string[]
      
      setCategories(uniqueCategories)
    } catch (err) {
      console.error("Error fetching categories:", err)
      // Don't show error toast since this is not critical
    }
  }
  
  // Fetch data on component mount
  useEffect(() => {
    fetchWebhooks()
    fetchCategories()
  }, [])
  
  // Handle webhook creation
  const handleCreateWebhook = async () => {
    // Validate inputs
    if (!newWebhook.name.trim() || !newWebhook.url.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and URL are required",
        variant: "destructive"
      })
      return
    }
    
    // Validate URL format
    try {
      new URL(newWebhook.url)
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Discord webhook URL",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        throw new Error("Not authenticated")
      }
      
      const response = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newWebhook,
          categories: newWebhook.categories.length > 0 ? newWebhook.categories : null
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to create webhook")
      }
      
      toast({
        title: "Webhook Created",
        description: `Webhook "${newWebhook.name}" has been created`
      })
      
      // Reset form and close dialog
      setNewWebhook({
        name: "",
        url: "",
        avatar: "",
        enabled: true,
        categories: []
      })
      setCreateDialogOpen(false)
      
      // Refresh webhooks list
      fetchWebhooks()
    } catch (err) {
      console.error("Error creating webhook:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create webhook",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle webhook update
  const handleUpdateWebhook = async () => {
    if (!selectedWebhook) return;
    
    // Validate inputs
    if (!selectedWebhook.name.trim() || !selectedWebhook.url.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and URL are required",
        variant: "destructive"
      });
      return;
    }
    
    // Validate URL format
    try {
      new URL(selectedWebhook.url);
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Discord webhook URL",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      const response = await fetch(`/api/admin/webhooks/${selectedWebhook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: selectedWebhook.name,
          url: selectedWebhook.url,
          avatar: selectedWebhook.avatar,
          enabled: selectedWebhook.enabled,
          categories: selectedWebhook.categories?.length > 0 ? selectedWebhook.categories : null
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update webhook");
      }
      
      toast({
        title: "Webhook Updated",
        description: `Webhook "${selectedWebhook.name}" has been updated`
      });
      
      // Close dialog
      setEditDialogOpen(false);
      
      // Refresh webhooks list
      fetchWebhooks();
    } catch (err) {
      console.error("Error updating webhook:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update webhook",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Discord Webhook Integration</h2>
        
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Webhook
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Discord Notifications</CardTitle>
          <CardDescription>
            Configure Discord webhooks to receive notifications when new blog posts are published.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center p-4 rounded-md bg-destructive/10 text-destructive">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          ) : webhooks.length === 0 ? (
            <div className="p-8 text-center rounded-md bg-muted">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium">No webhooks configured</h3>
              <p className="mb-4 text-muted-foreground">
                Add a Discord webhook to receive notifications when new blog posts are published.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Webhook
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <Collapsible key={webhook.id} className="border rounded-lg">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      {webhook.enabled ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
                      )}
                      
                      <div>
                        <h3 className="font-medium">{webhook.name}</h3>
                        <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {webhook.url}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={webhook.enabled}
                        onCheckedChange={(checked) => toggleWebhookEnabled(webhook, checked)}
                      />
                      
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronsUpDown className="w-4 h-4" />
                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  
                  <CollapsibleContent>
                    <div className="p-4 border-t bg-muted/50">
                      <div className="flex flex-col space-y-4">
                        <div>
                          <h4 className="mb-1 text-sm font-medium">Category Filters</h4>
                          <div className="flex flex-wrap gap-2">
                            {webhook.categories && webhook.categories.length > 0 ? (
                              webhook.categories.map((category) => (
                                <Badge key={category} variant="secondary">
                                  {category}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">All categories</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedWebhook(webhook);
                              setTestDialogOpen(true);
                            }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Test
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedWebhook(webhook);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedWebhook(webhook);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create Webhook Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[512px]">
          <DialogHeader>
            <DialogTitle>Add Discord Webhook</DialogTitle>
            <DialogDescription>
              Add a new Discord webhook to receive notifications when new blog posts are published.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-name">Name</Label>
              <Input 
                id="webhook-name"
                placeholder="Blog Notifications"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input 
                id="webhook-url"
                placeholder="https://discord.com/api/webhooks/..."
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                The webhook URL from Discord. You can create one by going to Server Settings &gt; Integrations &gt; Webhooks.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhook-avatar">Avatar URL (Optional)</Label>
              <Input 
                id="webhook-avatar"
                placeholder="https://example.com/avatar.png"
                value={newWebhook.avatar}
                onChange={(e) => setNewWebhook({...newWebhook, avatar: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category Filters (Optional)</Label>
              <div className="border rounded-md p-4 max-h-[150px] overflow-y-auto space-y-2">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        id={`category-${category}`}
                        checked={newWebhook.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook({
                              ...newWebhook,
                              categories: [...newWebhook.categories, category]
                            });
                          } else {
                            setNewWebhook({
                              ...newWebhook,
                              categories: newWebhook.categories.filter(c => c !== category)
                            });
                          }
                        }}
                        className="w-4 h-4 text-primary border-primary/50 focus:ring-primary"
                      />
                      <Label htmlFor={`category-${category}`} className="cursor-pointer">{category}</Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No categories found</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                If selected, notifications will only be sent for posts in these categories. If none are selected, notifications will be sent for all posts.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="webhook-enabled"
                checked={newWebhook.enabled}
                onCheckedChange={(checked) => setNewWebhook({...newWebhook, enabled: checked})}
              />
              <Label htmlFor="webhook-enabled">Enable webhook</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWebhook} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Webhook"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Webhook Dialog */}
      {selectedWebhook && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[512px]">
            <DialogHeader>
              <DialogTitle>Edit Discord Webhook</DialogTitle>
              <DialogDescription>
                Update your Discord webhook configuration.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-webhook-name">Name</Label>
                <Input 
                  id="edit-webhook-name"
                  placeholder="Blog Notifications"
                  value={selectedWebhook.name}
                  onChange={(e) => setSelectedWebhook({...selectedWebhook, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-webhook-url">Webhook URL</Label>
                <Input 
                  id="edit-webhook-url"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={selectedWebhook.url}
                  onChange={(e) => setSelectedWebhook({...selectedWebhook, url: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-webhook-avatar">Avatar URL (Optional)</Label>
                <Input 
                  id="edit-webhook-avatar"
                  placeholder="https://example.com/avatar.png"
                  value={selectedWebhook.avatar || ''}
                  onChange={(e) => setSelectedWebhook({...selectedWebhook, avatar: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category Filters (Optional)</Label>
                <div className="border rounded-md p-4 max-h-[150px] overflow-y-auto space-y-2">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          id={`edit-category-${category}`}
                          checked={(selectedWebhook.categories || []).includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedWebhook({
                                ...selectedWebhook,
                                categories: [...(selectedWebhook.categories || []), category]
                              });
                            } else {
                              setSelectedWebhook({
                                ...selectedWebhook,
                                categories: (selectedWebhook.categories || []).filter(c => c !== category)
                              });
                            }
                          }}
                          className="w-4 h-4 text-primary border-primary/50 focus:ring-primary"
                        />
                        <Label htmlFor={`edit-category-${category}`} className="cursor-pointer">{category}</Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No categories found</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-webhook-enabled"
                  checked={selectedWebhook.enabled}
                  onCheckedChange={(checked) => setSelectedWebhook({...selectedWebhook, enabled: checked})}
                />
                <Label htmlFor="edit-webhook-enabled">Enable webhook</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateWebhook} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Webhook"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Test Webhook Dialog */}
      {selectedWebhook && (
        <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
          <DialogContent className="sm:max-w-[512px]">
            <DialogHeader>
              <DialogTitle>Test Webhook</DialogTitle>
              <DialogDescription>
                Send a test message to your Discord webhook.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="p-4 rounded-md bg-muted">
                <p className="mb-1 text-sm">Webhook: <span className="font-medium">{selectedWebhook.name}</span></p>
                <p className="text-sm truncate">{selectedWebhook.url}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="test-message">Custom Message (Optional)</Label>
                <Textarea 
                  id="test-message"
                  placeholder="Enter a custom message or leave blank to use the default test message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTestDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleTestWebhook} disabled={isTesting}>
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Test Message
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Webhook Confirmation Dialog */}
      {selectedWebhook && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the webhook <span className="font-medium">{selectedWebhook.name}</span>?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteWebhook}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Webhook"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
  
  // Handle webhook deletion
  const handleDeleteWebhook = async () => {
    if (!selectedWebhook) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      const response = await fetch(`/api/admin/webhooks/${selectedWebhook.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete webhook");
      }
      
      toast({
        title: "Webhook Deleted",
        description: `Webhook "${selectedWebhook.name}" has been deleted`
      });
      
      // Close dialog
      setDeleteDialogOpen(false);
      
      // Refresh webhooks list
      fetchWebhooks();
    } catch (err) {
      console.error("Error deleting webhook:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete webhook",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle test webhook
  const handleTestWebhook = async () => {
    if (!selectedWebhook) return;
    
    setIsTesting(true);
    
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      // Prepare test message
      const content = testMessage || `🔔 This is a test message from your blog's admin panel. If you're seeing this, your webhook is working properly!`;
      
      const response = await fetch(`/api/admin/webhooks/${selectedWebhook.id}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: content })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to test webhook");
      }
      
      toast({
        title: "Test Successful",
        description: "The test message was sent successfully"
      });
      
      // Close dialog
      setTestDialogOpen(false);
      
      // Clear test message
      setTestMessage("");
    } catch (err) {
      console.error("Error testing webhook:", err);
      toast({
        title: "Test Failed",
        description: err instanceof Error ? err.message : "Failed to send test message",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  // Handle toggle webhook enabled state
  const toggleWebhookEnabled = async (webhook: WebhookData, enabled: boolean) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      const response = await fetch(`/api/admin/webhooks/${webhook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          enabled
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update webhook");
      }
      
      // Update local state
      setWebhooks(webhooks.map(w => 
        w.id === webhook.id ? { ...w, enabled } : w
      ));
      
      toast({
        title: enabled ? "Webhook Enabled" : "Webhook Disabled",
        description: `Webhook "${webhook.name}" has been ${enabled ? "enabled" : "disabled"}`
      });
    } catch (err) {
      console.error("Error updating webhook:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update webhook",
        variant: "destructive"
      });
      
      // Revert the change in UI
      setWebhooks(webhooks.map(w => 
        w.id === webhook.id ? { ...w, enabled: !enabled } : w
      ));
    }
  };