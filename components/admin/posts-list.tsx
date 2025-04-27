// components/admin/posts-list.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Edit,
  Trash2,
  FileText,
  Calendar,
  Tag,
  Star,
  StarOff,
  RefreshCw,
  Loader2,
  AlertCircle,
  Filter,
  Search,
  X,
  Check,
  Eye,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils/helpers';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  featured: boolean;
  author?: {
    id: number;
    username: string;
    realName: string | null;
  };
}

interface PostsListProps {
  userRole?: string;
  userPermissions?: any;
}

export default function PostsList({ userRole, userPermissions }: PostsListProps) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    category: 'all',
    searchTerm: '',
  });
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch posts
  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }

      const data = await response.json();
      setPosts(data.posts || []);

      // Extract categories
      const uniqueCategories = Array.from(
        new Set(data.posts.map((post: BlogPost) => post.category)),
      ).filter(Boolean) as string[];

      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');

      toast({
        title: 'Error loading posts',
        description: err instanceof Error ? err.message : 'Failed to load posts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter posts when filter or posts change
  useEffect(() => {
    let result = [...posts];

    // Filter by category
    if (filter.category !== 'all') {
      result = result.filter((post) => post.category === filter.category);
    }

    // Filter by search term
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(term) || post.excerpt.toLowerCase().includes(term),
      );
    }

    setFilteredPosts(result);
  }, [filter, posts]);

  // Initialize
  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle search
  const handleSearch = (value: string) => {
    setFilter((prev) => ({ ...prev, searchTerm: value }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilter({
      category: 'all',
      searchTerm: '',
    });
  };

  // Delete post handler
  const handleDeletePost = async (slug: string) => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/posts/${slug}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.status}`);
      }

      // Refresh posts list
      toast({
        title: 'Post deleted',
        description: 'The post has been successfully deleted',
      });

      fetchPosts();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete post');

      toast({
        title: 'Error deleting post',
        description: err instanceof Error ? err.message : 'Failed to delete post',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle featured status
  const toggleFeatured = async (post: BlogPost) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/posts/${post.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...post,
          featured: !post.featured,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update post: ${response.status}`);
      }

      // Update local state
      setPosts(posts.map((p) => (p.slug === post.slug ? { ...p, featured: !post.featured } : p)));

      toast({
        title: post.featured ? 'Removed from featured' : 'Added to featured',
        description: `"${post.title}" has been ${post.featured ? 'removed from' : 'added to'} featured posts`,
      });
    } catch (err) {
      console.error('Error updating featured status:', err);

      toast({
        title: 'Error updating post',
        description: err instanceof Error ? err.message : 'Failed to update post',
        variant: 'destructive',
      });
    }
  };

  // Check if user can edit post
  const canEditPost = (post: BlogPost) => {
    if (!userRole || !userPermissions) return false;

    // Admin can edit all posts
    if (userRole === 'admin') return true;

    // User can edit if they have permission to edit all posts
    if (userPermissions.canEditAllPosts) return true;

    // User can edit their own posts if they have permission
    if (
      userPermissions.canEditOwnPosts &&
      post.author &&
      post.author.id === userPermissions.userId
    ) {
      return true;
    }

    return false;
  };

  // Check if user can delete post
  const canDeletePost = (post: BlogPost) => {
    if (!userRole || !userPermissions) return false;

    // Admin can delete all posts
    if (userRole === 'admin') return true;

    // User can delete if they have permission to delete all posts
    if (userPermissions.canDeleteAllPosts) return true;

    // User can delete their own posts if they have permission
    if (
      userPermissions.canDeleteOwnPosts &&
      post.author &&
      post.author.id === userPermissions.userId
    ) {
      return true;
    }

    return false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !posts.length) {
    return (
      <div className="flex items-center p-4 text-red-500 rounded-md bg-red-500/10">
        <AlertCircle className="w-5 h-5 mr-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold">Manage Posts</h2>

        <div className="flex flex-wrap w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-2 top-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={filter.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-8"
            />
            {filter.searchTerm && (
              <button
                className="absolute transform -translate-y-1/2 right-2 top-1/2"
                onClick={() => setFilter((prev) => ({ ...prev, searchTerm: '' }))}
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={filter.category}
              onValueChange={(value) => setFilter((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={fetchPosts} className="h-10 gap-1">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {(filter.category !== 'all' || filter.searchTerm) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <p>
            Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
            {filter.category !== 'all' && ` in category "${filter.category}"`}
            {filter.searchTerm && ` containing "${filter.searchTerm}"`}
          </p>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="px-2 h-7">
            <X className="w-3 h-3 mr-1" />
            Clear Filters
          </Button>
        </div>
      )}

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              No posts found. Create your first post using the editor above.
            </p>
          </CardContent>
        </Card>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No posts match your current filters.</p>
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPosts.map((post) => (
            <Card key={post.slug}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition-colors hover:text-primary"
                        target="_blank"
                      >
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{post.excerpt}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => toggleFeatured(post)}
                    title={post.featured ? 'Remove from featured' : 'Add to featured'}
                    disabled={!canEditPost(post)}
                  >
                    {post.featured ? (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span>{post.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{post.slug}.md</span>
                  </div>
                  {post.author && (
                    <Badge variant="outline">
                      By {post.author.realName || post.author.username}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {deleteConfirm === post.slug ? (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePost(post.slug)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Confirm
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm(null)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </Button>

                    {canEditPost(post) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        asChild
                      >
                        <Link href={`/admin/dashboard?tab=create&slug=${post.slug}`}>
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>
                      </Button>
                    )}

                    {canDeletePost(post) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-red-500 hover:text-red-700"
                        onClick={() => setDeleteConfirm(post.slug)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Alert Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post and remove it from
              the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeletePost(deleteConfirm)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
