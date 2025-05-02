'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Camera, Check, Loader2, UploadCloud, User, X } from 'lucide-react';

interface UserProfileEditorProps {
  currentUser: {
    id: number;
    username: string;
    email: string;
    realName?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
  };
  isCurrentUserAdmin?: boolean;
}

export default function UserProfileEditor({
  currentUser,
  isCurrentUserAdmin = false,
}: UserProfileEditorProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [userData, setUserData] = useState({
    displayName: currentUser.realName || '',
    username: currentUser.username || '',
    email: currentUser.email || '',
    bio: currentUser.bio || '',
    avatarUrl: currentUser.avatarUrl || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser.avatarUrl || null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Handle profile data changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle password data changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle avatar file selection
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 2MB',
          variant: 'destructive',
        });
        return;
      }

      setAvatarFile(file);

      // Generate preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear avatar selection
  const clearAvatarSelection = () => {
    setAvatarFile(null);
    setAvatarPreview(currentUser.avatarUrl || null);
  };

  // Upload avatar image
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return currentUser.avatarUrl || null;

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/users/${currentUser.id}/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to upload avatar');
      }

      const data = await response.json();
      return data.avatarUrl || null;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  };

  // Save profile changes
  const saveProfileChanges = async () => {
    try {
      setIsSubmitting(true);

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        toast({
          title: 'Invalid email format',
          description: 'Please enter a valid email address',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Upload avatar if changed
      let avatarUrl = currentUser.avatarUrl;
      if (avatarFile) {
        try {
          avatarUrl = await uploadAvatar();
        } catch (error) {
          toast({
            title: 'Avatar upload failed',
            description: error instanceof Error ? error.message : 'Failed to upload avatar image',
            variant: 'destructive',
          });
          // Continue with other updates even if avatar upload fails
        }
      }

      // Get admin token
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');

      // Update user profile
      const response = await fetch(`/api/admin/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          realName: userData.displayName,
          bio: userData.bio,
          avatarUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });

      // Reset avatar file state
      setAvatarFile(null);

      // Refresh the page to show updated profile
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Change password
  const changePassword = async () => {
    try {
      setIsChangingPassword(true);

      // Validate password fields
      if (!passwordData.currentPassword) {
        toast({
          title: 'Current password required',
          description: 'Please enter your current password',
          variant: 'destructive',
        });
        setIsChangingPassword(false);
        return;
      }

      if (!passwordData.newPassword) {
        toast({
          title: 'New password required',
          description: 'Please enter a new password',
          variant: 'destructive',
        });
        setIsChangingPassword(false);
        return;
      }

      if (passwordData.newPassword.length < 8) {
        toast({
          title: 'Password too short',
          description: 'Password must be at least 8 characters long',
          variant: 'destructive',
        });
        setIsChangingPassword(false);
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "New password and confirmation password don't match",
          variant: 'destructive',
        });
        setIsChangingPassword(false);
        return;
      }

      // Get admin token
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Not authenticated');

      // Send password change request
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          newUsername: userData.username !== currentUser.username ? userData.username : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to change password');
      }

      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully',
      });

      // Check if username was changed
      const data = await response.json();
      if (data.usernameChanged) {
        toast({
          title: 'Username changed',
          description: 'You will be redirected to login with your new username',
        });

        // Logout user if username was changed
        setTimeout(() => {
          localStorage.removeItem('adminToken');
          router.push('/admin');
        }, 2000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Password change failed',
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information and profile settings</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-6 mb-6 sm:flex-row sm:items-start">
            <div className="relative">
              <div className="w-24 h-24 overflow-hidden rounded-full bg-muted">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <User className="w-12 h-12 text-muted-foreground/60" />
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 right-0 flex space-x-1">
                <label
                  htmlFor="avatar-upload"
                  className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer bg-primary"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                  />
                </label>

                {avatarFile && (
                  <button
                    type="button"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive"
                    onClick={clearAvatarSelection}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={userData.bio}
                onChange={handleProfileChange}
                placeholder="Tell us about yourself"
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                This information will be displayed on your profile and in any articles you publish
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                value={userData.displayName}
                onChange={handleProfileChange}
                placeholder="Your display name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={userData.username}
                onChange={handleProfileChange}
                placeholder="Your username"
              />
              <p className="text-xs text-muted-foreground">
                Changing your username will require you to login again
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleProfileChange}
                placeholder="Your email address"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button onClick={() => setConfirmDialogOpen(true)} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>Save Changes</>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Profile Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update your profile information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={saveProfileChanges}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
