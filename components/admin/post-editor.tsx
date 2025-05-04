'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsContent,
  Textarea,
  useToast,
} from '@/components/ui';
import { cn, slugify } from '@/lib/utils/helpers';
import { format, isValid, parseISO } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Tag,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface PostFormData {
  title: string;
  excerpt: string;
  category: string;
  content: string;
  featured: boolean;
  date: string;
  slug?: string;
  isEdit?: boolean;
}

const CATEGORIES = [
  'Next.js',
  'TypeScript',
  'React',
  'Backend',
  'Frontend',
  'API',
  'Database',
  'DevOps',
  'Tutorial',
  'Career',
  'Other',
  'Frontend Development',
  'Backend Development',
  'Full-Stack Development',
  'Mobile Development',
  'DevOps & Cloud Engineering',
  'Data Engineering & Machine Learning',
  'Programming Languages',
  'Testing & Quality Assurance',
  'Web Security',
  'Software Design & Architecture',
  'Career & Personal Development',
  'Life as a Developer',
  'Tools & Resources',
  'Open Source & Community',
  'Emerging Technologies',
  'Career Transitions',
  'Productivity & Workflow Automation',
];

export default function PostEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    excerpt: '',
    category: '',
    content: '# Write your post here\n\nStart writing your blog post using markdown syntax.',
    featured: false,
    date: new Date().toISOString(),
    isEdit: false,
  });

  // Check if we're in edit mode
  useEffect(() => {
    const slug = searchParams.get('slug');

    if (slug) {
      fetchPostForEditing(slug);
    }
  }, [searchParams]);

  // Fetch post data if in edit mode
  const fetchPostForEditing = async (slug: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/posts/${slug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }

      const post = await response.json();

      // Disable auto-slug in edit mode
      setAutoSlug(false);

      setFormData({
        title: post.title ?? '',
        excerpt: post.excerpt ?? '',
        category: post.category ?? '',
        content: post.content ?? '',
        featured: post.featured ?? false,
        date: post.date ?? new Date().toISOString(),
        slug,
        isEdit: true,
      });

      if (!CATEGORIES.includes(post.category)) {
        setCustomCategory(post.category);
        setShowCustomCategory(true);
      }

      toast({
        title: 'Post loaded',
        description: 'The post has been loaded for editing.',
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      setSubmitStatus({
        success: false,
        message: 'Failed to load post for editing.',
      });

      toast({
        title: 'Error loading post',
        description: 'Failed to load the post for editing. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Update slug when title changes if auto-slug is enabled
  useEffect(() => {
    if (autoSlug && formData.title) {
      const generatedSlug = slugify(formData.title);
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, autoSlug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeaturedChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, featured: checked }));
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomCategory(true);
      setFormData((prev) => ({ ...prev, category: customCategory }));
    } else {
      setShowCustomCategory(false);
      setCustomCategory('');
      setFormData((prev) => ({ ...prev, category: value }));
    }
  };

  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomCategory(value);
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      setFormData((prev) => ({ ...prev, date: date.toISOString() }));
    }
  };

  const toggleAutoSlug = (checked: boolean) => {
    setAutoSlug(checked);
    if (checked && formData.title) {
      // Regenerate slug from title
      const generatedSlug = slugify(formData.title);
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, slug: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) return showError('Title is required');
    if (!formData.excerpt.trim()) return showError('Short description is required');
    if (!formData.category.trim()) return showError('Category is required');
    if (!formData.content.trim()) return showError('Content is required');
    if (!formData.slug) return showError('URL slug is required');
    return true;
  };

  const showError = (message: string) => {
    setSubmitStatus({ success: false, message });
    toast({
      title: 'Validation Error',
      description: message,
      variant: 'destructive',
    });
    return false;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setConfirmDialogOpen(true);
  };

  const submitPost = async () => {
    setConfirmDialogOpen(false);
    setIsSubmitting(true);
    setSubmitStatus({});

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Authentication required');

      const method = formData.isEdit ? 'PUT' : 'POST';
      const endpoint = formData.isEdit ? `/api/admin/posts/${formData.slug}` : '/api/admin/posts';

      const postData = {
        ...formData,
        slug: formData.isEdit ? undefined : formData.slug, // Don't send slug in edit mode
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || `Failed to ${formData.isEdit ? 'update' : 'create'} post`);

      setSubmitStatus({
        success: true,
        message: `Post "${formData.title}" ${formData.isEdit ? 'updated' : 'created'} successfully!`,
      });

      toast({
        title: formData.isEdit ? 'Post updated' : 'Post created',
        description: `"${formData.title}" has been ${formData.isEdit ? 'updated' : 'created'} successfully!`,
      });

      if (!formData.isEdit) {
        setFormData({
          title: '',
          excerpt: '',
          category: '',
          content: '# Write your post here\n\nStart writing your blog post using markdown syntax.',
          featured: false,
          date: new Date().toISOString(),
          isEdit: false,
        });
        setCustomCategory('');
        setShowCustomCategory(false);
        setAutoSlug(true);
      }

      // Refresh to show updated data
      if (formData.isEdit) {
        setTimeout(() => {
          router.refresh();
          router.push('/admin/dashboard?tab=posts');
        }, 1500);
      }
    } catch (err) {
      setSubmitStatus({
        success: false,
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });

      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscardChanges = () => {
    setDiscardDialogOpen(false);

    if (formData.isEdit) {
      router.push('/admin/dashboard?tab=posts');
    } else {
      setFormData({
        title: '',
        excerpt: '',
        category: '',
        content: '# Write your post here\n\nStart writing your blog post using markdown syntax.',
        featured: false,
        date: new Date().toISOString(),
        isEdit: false,
      });
      setCustomCategory('');
      setShowCustomCategory(false);
      setAutoSlug(true);
      setSubmitStatus({});

      toast({
        title: 'Form reset',
        description: 'The form has been reset to its default state.',
      });
    }
  };

  return (
    <div>
      {/* Back button for edit mode */}
      {formData.isEdit && (
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/dashboard?tab=posts')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Posts
        </Button>
      )}

      {/* Title with edit/create mode indicator */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{formData.isEdit ? 'Edit Post' : 'Create New Post'}</h2>
        <p className="text-muted-foreground">
          {formData.isEdit
            ? 'Update your existing blog post'
            : 'Create a new blog post to share with your audience'}
        </p>
      </div>

      {submitStatus.message && (
        <div
          className={cn(
            'mb-6 p-4 rounded-md flex items-center',
            submitStatus.success
              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20',
          )}
        >
          {submitStatus.success ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          <p>{submitStatus.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>Basic information about the post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Post title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="slug"
                  className="flex items-center justify-between text-sm font-medium"
                >
                  <span>URL Slug *</span>
                  <div className="flex items-center">
                    <Switch
                      id="auto-slug"
                      checked={autoSlug}
                      onCheckedChange={toggleAutoSlug}
                      disabled={formData.isEdit}
                    />
                    <Label htmlFor="auto-slug" className="ml-2 text-xs">
                      Auto-generate
                    </Label>
                  </div>
                </Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">example.com/blog/</span>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug || ''}
                    onChange={handleSlugChange}
                    placeholder="url-slug"
                    className="flex-1"
                    disabled={autoSlug}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-sm font-medium">
                  Short Description *
                </Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="A brief description of the post"
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center text-sm font-medium">
                  <Tag className="w-4 h-4 mr-1 text-muted-foreground" />
                  Category *
                </Label>

                <Select
                  value={CATEGORIES.includes(formData.category) ? formData.category : 'custom'}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">+ Add Custom Category</SelectItem>
                  </SelectContent>
                </Select>

                {showCustomCategory && (
                  <div className="mt-2">
                    <Input
                      placeholder="Enter custom category"
                      value={customCategory}
                      onChange={handleCustomCategoryChange}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center text-sm font-medium">
                  <CalendarIcon className="w-4 h-4 mr-1 text-muted-foreground" />
                  Publication Date
                </Label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start w-full font-normal text-left"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formData.date ? format(new Date(formData.date), 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date ? parseISO(formData.date) : undefined}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={handleFeaturedChange}
                />
                <Label htmlFor="featured">Featured Post</Label>
                <span className="ml-auto text-xs text-muted-foreground">
                  Featured posts appear in highlighted sections
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Content</CardTitle>
                <CardDescription>Write your post content in Markdown format</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Edit Mode
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </>
                )}
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs defaultValue="edit" value={previewMode ? 'preview' : 'edit'}>
                <TabsContent value="edit" className="p-4 mt-0">
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your post content in markdown format"
                    className="min-h-[400px] font-mono"
                    required
                  />

                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>
                      This editor supports Markdown formatting:
                      <span className="ml-1 font-mono">
                        # Heading, **bold**, *italic*, [link](url), `code`, etc.
                      </span>
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <div className="border rounded-md p-6 min-h-[400px] prose prose-invert max-w-none">
                    <ReactMarkdown>{formData.content}</ReactMarkdown>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex justify-between p-4 pt-0 mt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDiscardDialogOpen(true)}
                disabled={isSubmitting}
              >
                {formData.isEdit ? 'Cancel' : 'Reset Form'}
              </Button>

              <Button type="submit" className="min-w-[150px]" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {formData.isEdit ? 'Update Post' : 'Save Post'}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {formData.isEdit ? 'Update this post?' : 'Publish this post?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {formData.isEdit
                ? 'Your changes will be published immediately.'
                : 'This post will be published and available on your blog.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitPost} disabled={isSubmitting}>
              {formData.isEdit ? 'Update Post' : 'Publish Post'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Changes Dialog */}
      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {formData.isEdit ? 'Discard all changes?' : 'Reset the form?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {formData.isEdit
                ? 'All changes will be lost. This cannot be undone.'
                : 'This will clear all fields and reset the form to its initial state.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="bg-red-500 hover:bg-red-600"
            >
              {formData.isEdit ? 'Discard Changes' : 'Reset Form'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
