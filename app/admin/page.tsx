// app/admin/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ShieldAlert, Lock, User, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface LoginCredentials {
  username: string
  password: string
}

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: ""
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    // Clear error when user types
    if (error) setError(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Validate inputs
      if (!credentials.username.trim() || !credentials.password.trim()) {
        throw new Error("Username and password are required")
      }

      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed")
      }

      // Set token in localStorage
      localStorage.setItem("adminToken", data.token)
      setIsAuthenticated(true)
      setSuccessMessage("Authentication successful! Redirecting to dashboard...")
      
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      })
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/admin/dashboard")
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
      
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Authentication failed",
        variant: "destructive",
      })
    } finally {
      setIsAuthenticating(false)
    }
  }

  // Check if token exists on component mount
  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("adminToken")
      if (token) {
        // Validate token with backend
        fetch("/api/admin/verify", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then(res => {
            if (res.ok) {
              setIsAuthenticated(true)
              router.push("/admin/dashboard")
            } else {
              localStorage.removeItem("adminToken")
              toast({
                title: "Session expired",
                description: "Please log in again",
                variant: "destructive",
              })
            }
          })
          .catch(() => {
            localStorage.removeItem("adminToken")
          })
      }
    }
  }, [router, toast])

  if (isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container px-4">
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-center">Redirecting...</CardTitle>
                <CardDescription className="text-center">
                  You are already logged in. Taking you to the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          </div>
        </div>
        <Toaster />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container px-4">
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
              <CardDescription className="text-center">
                Login to access the blog admin dashboard
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={credentials.username}
                      onChange={handleCredentialsChange}
                      className="pl-10"
                      placeholder="Enter your username"
                      required
                      disabled={isAuthenticating}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={credentials.password}
                      onChange={handleCredentialsChange}
                      className="pl-10"
                      placeholder="Enter your password"
                      required
                      disabled={isAuthenticating}
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="flex items-center space-x-2 text-sm text-red-500 p-2 bg-red-500/10 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
                
                {successMessage && (
                  <div className="flex items-center space-x-2 text-sm text-green-500 p-2 bg-green-500/10 rounded-md">
                    <CheckCircle className="h-4 w-4" />
                    <span>{successMessage}</span>
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Login to Dashboard
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  )
}