"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertCircle,
  Check,
  Edit,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  User,
  UserPlus,
  Users
} from "lucide-react"

interface UserData {
  id: number
  username: string
  email: string
  realName?: string
  avatarUrl?: string
  role: string
  createdAt: string
}

interface UserPermissions {
  userId: number
  canCreatePosts: boolean
  canEditOwnPosts: boolean
  canEditAllPosts: boolean
  canDeleteOwnPosts: boolean
  canDeleteAllPosts: boolean
  canManageUsers: boolean
  canManageSettings: boolean
}

export default function UserManagement() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserData[]>([])
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<UserPermissions | null>(null)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false)
  
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    realName: "",
    password: "",
    confirmPassword: "",
    role: "user"
  })
  
  const [editUser, setEditUser] = useState({
    id: 0,
    username: "",
    email: "",
    realName: "",
    password: "",
    confirmPassword: "",
    role: "user"
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Fetch current user information
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("adminToken")
        if (!token) {
          router.push("/admin")
          return
        }
        
        const response = await fetch("/api/admin/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data)
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }
    
    fetchCurrentUser()
  }, [router])
  
  // Fetch all users
  useEffect(() => {
    fetchUsers()
  }, [])
  
  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        throw new Error("Not authenticated")
      }
      
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`)
      }
      
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Failed to load users")
      
      toast({
        title: "Error loading users",
        description: err instanceof Error ? err.message : "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch user permissions
  const fetchUserPermissions = async (userId: number) => {
    try {
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        throw new Error("Not authenticated")
      }
      
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user permissions: ${response.status}`)
      }
      
      const data = await response.json()
      setSelectedUserPermissions(data.permissions || {
        userId,
        canCreatePosts: false,
        canEditOwnPosts: false,
        canEditAllPosts: false,
        canDeleteOwnPosts: false,
        canDeleteAllPosts: false,
        canManageUsers: false,
        canManageSettings: false
      })
    } catch (err) {
      console.error("Error fetching user permissions:", err)
      toast({
        title: "Error",
        description: "Failed to load user permissions",
        variant: "destructive",
      })
    }
  }
  
  // Create new user
  const handleCreateUser = async () => {
    if (newUser.password !== newUser.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match",
        variant: "destructive"
      })
      return
    }
    
    if (newUser.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        throw new Error("Not authenticated")
      }
      
      // Validate inputs
      if (!newUser.username || !newUser.email || !newUser.password) {
        toast({
          title: "Validation Error",
          description: "Username, email, and password are required",
          variant: "destructive",
        })
        return
      }
      
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUser.username,
          email: newUser.email,
          realName: newUser.realName,
          password: newUser.password,
          role: newUser.role
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `Failed to create user: ${response.status}`)
      }
      
      const data = await response.json()
      
      toast({
        title: "User Created",
        description: `User ${data.user.username} has been created successfully`,
      })
      
      // Clear form and close dialog
      setNewUser({
        username: "",
        email: "",
        realName: "",
        password: "",
        confirmPassword: "",
        role: "user"
      })
      setCreateDialogOpen(false)
      
      // Refresh users list
      fetchUsers()
    } catch (err) {
      console.error("Error creating user:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Update user
  const handleUpdateUser = async () => {
    if (editUser.password && editUser.password !== editUser.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match",
        variant: "destructive"
      })
      return
    }
    
    if (editUser.password && editUser.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        throw new Error("Not authenticated")
      }
      
      // Validate inputs
      if (!editUser.username || !editUser.email) {
        toast({
          title: "Validation Error",
          description: "Username and email are required",
          variant: "destructive",
        })
        return
      }
      
      const userData: any = {
        username: editUser.username,
        email: editUser.email,
        realName: editUser.realName,
        role: editUser.role
      }
      
      // Only include password if it was changed
      if (editUser.password) {
        userData.password = editUser.password
      }
      
      const response = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `Failed to update user: ${response.status}`)
      }
      
      toast({
        title: "User Updated",
        description: `User ${editUser.username} has been updated successfully`,
      })
      
      // Close dialog
      setEditUserDialogOpen(false)
      
      // Refresh users list
      fetchUsers()
      
      // If selected user was updated, refresh the selection
      if (selectedUser && selectedUser.id === editUser.id) {
        const updatedUser = { ...selectedUser, ...userData }
        setSelectedUser(updatedUser as UserData)
      }
    } catch (err) {
      console.error("Error updating user:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Update user permissions
  const handleUpdatePermissions = async () => {
    try {
      if (!selectedUser || !selectedUserPermissions) return
      
      setIsSubmitting(true)
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        throw new Error("Not authenticated")
      }
      
      const response = await fetch(`/api/admin/users/${selectedUser.id}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(selectedUserPermissions),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `Failed to update permissions: ${response.status}`)
      }
      
      toast({
        title: "Permissions Updated",
        description: `Permissions for ${selectedUser.username} have been updated successfully`,
      })
    } catch (err) {
      console.error("Error updating permissions:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update permissions",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Delete user
  const handleDeleteUser = async () => {
    try {
      if (!selectedUser) return
      
      setIsSubmitting(true)
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        throw new Error("Not authenticated")
      }
      
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `Failed to delete user: ${response.status}`)
      }
      
      toast({
        title: "User Deleted",
        description: `User ${selectedUser.username} has been deleted successfully`,
      })
      
      // Close dialog and deselect user
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      setSelectedUserPermissions(null)
      
      // Refresh users list
      fetchUsers()
    } catch (err) {
      console.error("Error deleting user:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Select user and fetch permissions
  const handleSelectUser = (user: UserData) => {
    setSelectedUser(user)
    fetchUserPermissions(user.id)
  }
  
  // Handle permission toggle
  const handlePermissionChange = (permission: keyof Omit<UserPermissions, "userId">, value: boolean) => {
    if (!selectedUserPermissions) return
    
    setSelectedUserPermissions({
      ...selectedUserPermissions,
      [permission]: value
    })
  }
  
  // Check if user can be edited or deleted
  const canModifyUser = (user: UserData) => {
    if (!currentUser) return false
    
    // Root user can do anything
    if (currentUser.role === "admin" && currentUser.username === "admin") return true
    
    // Admin cannot modify root user or other admins
    if (user.role === "admin") return false
    
    // Admin can modify regular users
    return currentUser.role === "admin"
  }
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-40 h-8" />
          <Skeleton className="w-32 h-10" />
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px] md:col-span-2" />
        </div>
      </div>
    )
  }
  
  if (error && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="mb-2 text-lg font-medium">Error Loading Users</h3>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <Button onClick={fetchUsers}>Retry</Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Users</CardTitle>
            <CardDescription>
              {users.length} {users.length === 1 ? 'user' : 'users'} in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No users found. Create your first user to get started.
                </p>
              ) : (
                users.map(user => (
                  <div
                    key={user.id}
                    className={`flex items-center p-3 rounded-md cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedUser?.id === user.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="mr-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="object-cover w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {user.role}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* User Details & Permissions */}
        <Card className="md:col-span-2">
          {selectedUser ? (
            <>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    {selectedUser.realName || selectedUser.username}
                    {selectedUser.role === 'admin' && (
                      <Badge className="ml-2 bg-primary">Admin</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    @{selectedUser.username} • {selectedUser.email}
                  </CardDescription>
                </div>
                
                <div className="flex gap-2">
                  {canModifyUser(selectedUser) && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditUser({
                            id: selectedUser.id,
                            username: selectedUser.username,
                            email: selectedUser.email,
                            realName: selectedUser.realName || '',
                            password: '',
                            confirmPassword: '',
                            role: selectedUser.role
                          })
                          setEditUserDialogOpen(true)
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="permissions">
                  <TabsList className="mb-4">
                    <TabsTrigger value="permissions">
                      <Shield className="w-4 h-4 mr-1" />
                      Permissions
                    </TabsTrigger>
                    <TabsTrigger value="details">
                      <User className="w-4 h-4 mr-1" />
                      Details
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="permissions">
                    {selectedUserPermissions ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="p-4 border rounded-md">
                            <h3 className="mb-3 font-medium">Post Management</h3>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="canCreatePosts">Create Posts</Label>
                                <Switch
                                  id="canCreatePosts"
                                  checked={selectedUserPermissions.canCreatePosts}
                                  onCheckedChange={(checked) => handlePermissionChange('canCreatePosts', checked)}
                                  disabled={!canModifyUser(selectedUser) || isSubmitting}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="canEditOwnPosts">Edit Own Posts</Label>
                                <Switch
                                  id="canEditOwnPosts"
                                  checked={selectedUserPermissions.canEditOwnPosts}
                                  onCheckedChange={(checked) => handlePermissionChange('canEditOwnPosts', checked)}
                                  disabled={!canModifyUser(selectedUser) || isSubmitting}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="canEditAllPosts">Edit All Posts</Label>
                                <Switch
                                  id="canEditAllPosts"
                                  checked={selectedUserPermissions.canEditAllPosts}
                                  onCheckedChange={(checked) => handlePermissionChange('canEditAllPosts', checked)}
                                  disabled={!canModifyUser(selectedUser) || isSubmitting}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="canDeleteOwnPosts">Delete Own Posts</Label>
                                <Switch
                                  id="canDeleteOwnPosts"
                                  checked={selectedUserPermissions.canDeleteOwnPosts}
                                  onCheckedChange={(checked) => handlePermissionChange('canDeleteOwnPosts', checked)}
                                  disabled={!canModifyUser(selectedUser) || isSubmitting}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="canDeleteAllPosts">Delete All Posts</Label>
                                <Switch
                                  id="canDeleteAllPosts"
                                  checked={selectedUserPermissions.canDeleteAllPosts}
                                  onCheckedChange={(checked) => handlePermissionChange('canDeleteAllPosts', checked)}
                                  disabled={!canModifyUser(selectedUser) || isSubmitting}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-md">
                            <h3 className="mb-3 font-medium">Admin Access</h3>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="canManageUsers">Manage Users</Label>
                                <Switch
                                  id="canManageUsers"
                                  checked={selectedUserPermissions.canManageUsers}
                                  onCheckedChange={(checked) => handlePermissionChange('canManageUsers', checked)}
                                  disabled={!canModifyUser(selectedUser) || isSubmitting}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="canManageSettings">Manage Settings</Label>
                                <Switch
                                  id="canManageSettings"
                                  checked={selectedUserPermissions.canManageSettings}
                                  onCheckedChange={(checked) => handlePermissionChange('canManageSettings', checked)}
                                  disabled={!canModifyUser(selectedUser) || isSubmitting}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {canModifyUser(selectedUser) && (
                          <div className="flex justify-end">
                            <Button 
                              onClick={handleUpdatePermissions}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save Permissions"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="details">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-sm font-medium">Username</Label>
                          <div className="p-2 mt-1 border rounded-md bg-muted/40">
                            {selectedUser.username}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Email</Label>
                          <div className="p-2 mt-1 border rounded-md bg-muted/40">
                            {selectedUser.email}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Real Name</Label>
                          <div className="p-2 mt-1 border rounded-md bg-muted/40">
                            {selectedUser.realName || 'Not set'}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Role</Label>
                          <div className="p-2 mt-1 border rounded-md bg-muted/40">
                            {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Created At</Label>
                        <div className="p-2 mt-1 border rounded-md bg-muted/40">
                          {new Date(selectedUser.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="w-16 h-16 mb-4 text-muted-foreground/30" />
              <h3 className="mb-2 text-lg font-medium">No User Selected</h3>
              <p className="max-w-md mb-6 text-center text-muted-foreground">
                Select a user from the list to view and manage their details and permissions.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add New User
              </Button>
            </div>
          )}
        </Card>
      </div>
      
      {/* Create User Dialog */}
      <AlertDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Create New User</AlertDialogTitle>
            <AlertDialogDescription>
              Add a new user to the system. They will be able to log in with the provided credentials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-username">Username*</Label>
              <Input
                id="new-username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-email">Email*</Label>
              <Input
                id="new-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">Password*</Label>
              <Input
                id="new-password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-confirm-password">Confirm Password*</Label>
              <Input
                id="new-confirm-password"
                type="password"
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                placeholder="Confirm password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-realname">Real Name</Label>
              <Input
                id="new-realname"
                value={newUser.realName}
                onChange={(e) => setNewUser({ ...newUser, realName: e.target.value })}
                placeholder="Enter real name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-role">Role</Label>
              <select
                id="new-role"
                className="w-full px-3 py-2 border rounded-md border-input bg-background"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCreateUser}
              disabled={isSubmitting || !newUser.username || !newUser.email || !newUser.password || !newUser.confirmPassword}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit User Dialog */}
      <AlertDialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit User</AlertDialogTitle>
            <AlertDialogDescription>
              Update user information. You can change their name, email, and role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username*</Label>
              <Input
                id="edit-username"
                value={editUser.username}
                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email*</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editUser.password}
                onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-confirm-password">Confirm Password</Label>
              <Input
                id="edit-confirm-password"
                type="password"
                value={editUser.confirmPassword}
                onChange={(e) => setEditUser({ ...editUser, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-realname">Real Name</Label>
              <Input
                id="edit-realname"
                value={editUser.realName}
                onChange={(e) => setEditUser({ ...editUser, realName: e.target.value })}
                placeholder="Enter real name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <select
                id="edit-role"
                className="w-full px-3 py-2 border rounded-md border-input bg-background"
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUpdateUser}
              disabled={isSubmitting || !editUser.username || !editUser.email}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.username}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-500 hover:bg-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}