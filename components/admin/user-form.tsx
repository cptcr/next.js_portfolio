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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserFormProps {
  user?: {
    id?: number;
    username?: string;
    email?: string;
    realName?: string;
    role?: string;
    bio?: string;
  };
  onSubmit: (userData: UserFormData) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

export interface UserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  realName: string;
  role: string;
  bio?: string;
}

export default function UserForm({
  user,
  onSubmit,
  submitLabel = 'Create User',
  isSubmitting = false,
  isEditMode = false,
}: UserFormProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState<UserFormData>({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    realName: user?.realName || '',
    role: user?.role || 'user',
    bio: user?.bio || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.username.trim()) {
      toast({
        title: 'Username is required',
        description: 'Please enter a username',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: 'Email is required',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: 'Invalid email format',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    // Password is required for new users
    if (!isEditMode && !formData.password) {
      toast({
        title: 'Password is required',
        description: 'Please enter a password',
        variant: 'destructive',
      });
      return;
    }

    // Validate password if provided
    if (formData.password) {
      if (formData.password.length < 8) {
        toast({
          title: 'Password too short',
          description: 'Password must be at least 8 characters long',
          variant: 'destructive',
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: 'The password and confirmation password do not match',
          variant: 'destructive',
        });
        return;
      }
    }

    // Submit the form
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit User' : 'Create New User'}</CardTitle>
          <CardDescription>
            {isEditMode
              ? 'Update user information and permissions'
              : 'Add a new user to the system'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter username"
                required
              />
              <p className="text-xs text-muted-foreground">Used for login and identification</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{isEditMode ? 'New Password' : 'Password *'}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={isEditMode ? 'Leave blank to keep current' : 'Enter password'}
                required={!isEditMode}
              />
              {isEditMode && (
                <p className="text-xs text-muted-foreground">
                  Leave blank to keep current password
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm password"
                required={!isEditMode || !!formData.password}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="realName">Real Name</Label>
              <Input
                id="realName"
                name="realName"
                value={formData.realName}
                onChange={handleInputChange}
                placeholder="Enter real name"
              />
              <p className="text-xs text-muted-foreground">Display name shown to users</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Determines user permissions</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio || ''}
              onChange={handleInputChange}
              placeholder="Enter user bio"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Shown on author profile and posts</p>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
