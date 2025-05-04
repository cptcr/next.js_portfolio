// components/admin/code-snippets.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  Code,
  Copy,
  RefreshCcw,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
} from 'lucide-react';

// Types
interface CodeSnippet {
  id: number;
  snippetId: string;
  title: string;
  code: string;
  language: string | null;
  userId: number | null;
  createdAt: string;
  expiresAt: string | null;
  isPublic: boolean;
  viewCount: number;
  lastViewedAt: string | null;
}

interface NewCodeSnippet {
  title: string;
  code: string;
  language?: string;
  expiresIn?: string | null; // Allow null for API handling
  isPublic: boolean;
  customId?: string;
}

// Language options (consider moving to a constants file if shared)
const languageOptions = [
  { value: 'text', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' }, // Use full name or common alias
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'React JSX' },
  { value: 'tsx', label: 'React TSX' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' }, // Ensure consistency (csharp vs cs)
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' }, // Ensure consistency (bash vs shell)
  { value: 'powershell', label: 'PowerShell' },
];

export default function CodeSnippetsAdmin() {
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [includeExpired, setIncludeExpired] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  // State for new snippet form
  const [newSnippet, setNewSnippet] = useState<NewCodeSnippet>({
    title: '',
    code: '',
    language: 'text', // Default language
    expiresIn: '7d', // Default expiration
    isPublic: false,
    customId: '',
  });
  const [creating, setCreating] = useState(false);

  // Load snippets on component mount and when includeExpired changes
  useEffect(() => {
    fetchSnippets();
  }, [includeExpired]);

  // Fetch snippets from the API
  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/snippets?includeExpired=${includeExpired}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Failed to fetch snippets' }));
        throw new Error(errorData.message || 'Failed to fetch snippets');
      }

      const data = await response.json();
      setSnippets(data.snippets || []); // Ensure snippets is always an array
    } catch (error) {
      console.error('Error fetching snippets:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load code snippets.',
        variant: 'destructive',
      });
      setSnippets([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Refresh the snippets list
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSnippets();
    setRefreshing(false);
  };

  // Create a new code snippet
  const handleCreate = async () => {
    try {
      setCreating(true);

      // Validate input
      if (!newSnippet.title.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a title.',
          variant: 'destructive',
        });
        setCreating(false);
        return;
      }

      if (!newSnippet.code.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Please enter some code.',
          variant: 'destructive',
        });
        setCreating(false);
        return;
      }

      // Prepare the payload, potentially modifying expiresIn
      // Use Partial to allow deleting keys
      const payload: Partial<NewCodeSnippet> = {
        ...newSnippet,
        // Trim values before sending
        title: newSnippet.title.trim(),
        code: newSnippet.code, // Keep original code whitespace
        customId: newSnippet.customId?.trim() || undefined, // Send undefined if empty after trim
      };

      // *** FIX: Handle 'never' expiration before sending to API ***
      // Assuming the API expects the key to be absent or null for 'never'
      if (payload.expiresIn === 'never' || payload.expiresIn === '') {
        delete payload.expiresIn; // Remove the key if API expects absence
        // Alternatively, set to null if API expects null:
        // payload.expiresIn = null;
      }

      // Remove empty customId if API expects it to be absent rather than empty string
      if (!payload.customId) {
        delete payload.customId;
      }

      // Make API request
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/snippets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload), // Send the modified payload
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create code snippet');
      }

      // Close dialog and refresh snippets
      const data = await response.json();

      toast({
        title: 'Success',
        description: 'Code snippet created successfully.',
      });

      setCreateDialogOpen(false);
      // Reset form state
      setNewSnippet({
        title: '',
        code: '',
        language: 'text',
        expiresIn: '7d',
        isPublic: false,
        customId: '',
      });

      // Add new snippet to the list (optimistic update) or refresh
      // fetchSnippets(); // Or refresh the whole list
      setSnippets((prev) => [data.snippet, ...prev]); // If API returns the created snippet object
    } catch (error) {
      console.error('Error creating code snippet:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create code snippet',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  // Delete a code snippet
  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);

      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/snippets', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete code snippet');
      }

      // Remove deleted snippet from the list
      setSnippets((prev) => prev.filter((snippet) => snippet.id !== id));

      toast({
        title: 'Success',
        description: 'Code snippet deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting code snippet:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete code snippet',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  // Copy snippet URL to clipboard
  const copyToClipboard = (snippetId: string) => {
    // Ensure this runs only in the browser
    if (typeof window === 'undefined') return;

    const baseUrl = window.location.origin;
    // Adjust path if your snippets are served differently
    const snippetUrl = `${baseUrl}/s/${snippetId}`; // Example path, adjust if needed

    navigator.clipboard.writeText(snippetUrl).then(
      () => {
        toast({
          title: 'Copied',
          description: 'Snippet URL copied to clipboard.',
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: 'Error',
          description: 'Failed to copy to clipboard.',
          variant: 'destructive',
        });
      },
    );
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Check if snippet is expired
  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    try {
      const expireDate = new Date(expiresAt);
      if (isNaN(expireDate.getTime())) return false;
      return expireDate < new Date();
    } catch (e) {
      return false;
    }
  };

  // Get language label from value
  const getLanguageLabel = (value: string | null) => {
    if (!value) return 'Plain Text'; // Default label if language is null/undefined
    const language = languageOptions.find((opt) => opt.value === value);
    return language ? language.label : value; // Fallback to value if label not found
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Code Snippets</h2>
          <p className="text-muted-foreground">Create and manage code snippets</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>

          <Button variant="default" size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Snippet
          </Button>
        </div>
      </div>

      {/* Options */}
      <div className="flex items-center space-x-2">
        <Switch
          id="include-expired-snippets"
          checked={includeExpired}
          onCheckedChange={setIncludeExpired}
        />
        <Label htmlFor="include-expired-snippets">Include expired snippets</Label>
      </div>

      {/* Snippets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Code Snippets</CardTitle>
          <CardDescription>Manage all your saved code snippets</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-4 space-x-4 border rounded-md">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-3/5 h-4" />
                    <Skeleton className="w-4/5 h-4" />
                  </div>
                  <Skeleton className="w-1/5 h-4" />
                  <Skeleton className="w-1/5 h-4" />
                </div>
              ))}
            </div>
          ) : snippets.length === 0 ? (
            // Empty state
            <div className="py-8 text-center">
              <Code className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No code snippets yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven't created any code snippets. Create one to get started.
              </p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                Create Snippet
              </Button>
            </div>
          ) : (
            // Snippets table
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title / ID</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snippets.map((snippet) => (
                    <TableRow key={snippet.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold" title={snippet.title}>
                            {snippet.title}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">{snippet.snippetId}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-6 h-6 p-0"
                              onClick={() => copyToClipboard(snippet.snippetId)}
                              title="Copy Snippet URL"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getLanguageLabel(snippet.language)}</TableCell>
                      <TableCell>{formatDate(snippet.createdAt)}</TableCell>
                      <TableCell>
                        {snippet.expiresAt ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="flex-shrink-0 w-4 h-4 text-muted-foreground" />
                            {formatDate(snippet.expiresAt)}
                          </div>
                        ) : (
                          'Never'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{snippet.viewCount}</Badge>
                      </TableCell>
                      <TableCell>
                        {snippet.expiresAt && isExpired(snippet.expiresAt) ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-green-800 border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
                          >
                            Active
                          </Badge>
                        )}
                        {snippet.isPublic && (
                          <Badge variant="outline" className="ml-2">
                            Public
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon" // Use icon size for single icon buttons
                            className="w-8 h-8" // Explicit size for consistency
                            onClick={() => window.open(`/s/${snippet.snippetId}`, '_blank')} // Adjust path if needed
                            title="View Snippet"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon" // Use icon size
                            className="w-8 h-8" // Explicit size
                            onClick={() => handleDelete(snippet.id)}
                            disabled={deleting === snippet.id}
                            title="Delete Snippet"
                          >
                            {deleting === snippet.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Snippet Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        {/* Increase max width for better code viewing */}
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Code Snippet</DialogTitle>
            <DialogDescription>
              Enter a title, code, and customize options for your snippet.
            </DialogDescription>
          </DialogHeader>

          {/* Use form element for better structure/accessibility, though not strictly needed here */}
          {/* <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}> */}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., React Fetch Hook"
                  value={newSnippet.title}
                  onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
                  required // Add basic HTML validation
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  // Use default language 'text' if language state is empty
                  value={newSnippet.language || 'text'}
                  onValueChange={(value) => setNewSnippet({ ...newSnippet, language: value })}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Textarea
                id="code"
                placeholder="console.log('Hello, World!');"
                className="font-mono min-h-[200px] max-h-[400px] text-sm" // Adjust size/font
                value={newSnippet.code}
                onChange={(e) => setNewSnippet({ ...newSnippet, code: e.target.value })}
                required // Add basic HTML validation
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="custom-id">Custom ID (Optional)</Label>
                <Input
                  id="custom-id"
                  placeholder="my-cool-snippet"
                  value={newSnippet.customId || ''}
                  onChange={(e) => setNewSnippet({ ...newSnippet, customId: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Use letters, numbers, underscores, hyphens. Leave blank for random.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires-in">Expires After</Label>
                <Select
                  // Use 'never' if state is empty/null/undefined for display
                  value={newSnippet.expiresIn || 'never'}
                  onValueChange={(value) => setNewSnippet({ ...newSnippet, expiresIn: value })}
                >
                  <SelectTrigger id="expires-in">
                    <SelectValue placeholder="Select expiration time" />
                  </SelectTrigger>
                  {/* *** FIX: Use non-empty value for "Never" *** */}
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="12h">12 Hours</SelectItem>
                    <SelectItem value="1d">1 Day</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem> {/* Added option */}
                    <SelectItem value="90d">90 Days</SelectItem> {/* Added option */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center pt-2 space-x-2">
              <Switch
                id="is-public"
                checked={newSnippet.isPublic}
                onCheckedChange={(checked) => setNewSnippet({ ...newSnippet, isPublic: checked })}
              />
              <Label htmlFor="is-public">Public Snippet</Label>
            </div>
            <p className="-mt-1 text-xs text-muted-foreground">
              Public snippets may be listed and have different expiration rules.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={creating} // Disable cancel if creating
            >
              Cancel
            </Button>
            <Button
              type="submit" // Works nicely if wrapped in <form>
              onClick={handleCreate} // Still needed if not using form onSubmit
              disabled={creating || !newSnippet.title.trim() || !newSnippet.code.trim()} // Disable if invalid or creating
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>Create Snippet</>
              )}
            </Button>
          </DialogFooter>
          {/* </form> */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
