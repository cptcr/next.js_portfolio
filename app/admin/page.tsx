// app/admin/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import PostEditor from "@/components/admin/post-editor"

interface LoginCredentials {
  username: string
  password: string
}

export default function AdminPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: ""
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)
    setError(null)

    try {
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

      // Set session cookie or token in localStorage
      localStorage.setItem("adminToken", data.token)
      setIsAuthenticated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
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
            } else {
              localStorage.removeItem("adminToken")
            }
          })
          .catch(() => {
            localStorage.removeItem("adminToken")
          })
      }
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container px-4">
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShieldAlert className="mr-2 h-5 w-5 text-primary" />
                  Admin Authentication
                </CardTitle>
                <CardDescription>
                  Login to access the blog admin portal
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium">
                      Username
                    </label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={credentials.username}
                      onChange={handleCredentialsChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={credentials.password}
                      onChange={handleCredentialsChange}
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="text-sm text-red-500 p-2 bg-red-500/10 rounded-md">
                      {error}
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
                      "Login"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return <PostEditor />
}