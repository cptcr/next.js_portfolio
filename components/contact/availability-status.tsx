"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MessageSquare, Calendar } from "lucide-react"

interface DiscordStatus {
  online: boolean
  status: "online" | "idle" | "dnd" | "offline"
  statusText?: string
  lastUpdated: Date
}

export default function AvailabilityStatus() {
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus>({
    online: false,
    status: "offline",
    lastUpdated: new Date()
  })
  const [currentTime, setCurrentTime] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch Discord status and update time
  useEffect(() => {
    // Function to fetch Discord status
    async function fetchDiscordStatus() {
      try {
        setLoading(true)
        
        const response = await fetch('/api/discord/status')
        
        if (!response.ok) {
          throw new Error(`Error fetching Discord status: ${response.status}`)
        }
        
        const data = await response.json()
        
        setDiscordStatus({
          online: data.online,
          status: data.status,
          statusText: data.statusText,
          lastUpdated: new Date()
        })
        
        setError(null)
      } catch (err) {
        console.error("Error fetching Discord status:", err)
        setError("Could not load Discord status")
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchDiscordStatus()
    updateCurrentTime()
    
    // Set up intervals for periodic updates (every 10 seconds for real-time updates)
    const statusInterval = setInterval(fetchDiscordStatus, 10000) // Every 10 seconds for faster updates
    const timeInterval = setInterval(updateCurrentTime, 60000) // Time updates every minute
    
    return () => {
      clearInterval(statusInterval)
      clearInterval(timeInterval)
    }
  }, [])
  
  // Format the time in German timezone
  function updateCurrentTime() {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Europe/Berlin",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
      weekday: "short",
      day: "numeric",
      month: "short",
    }
    
    setCurrentTime(new Intl.DateTimeFormat("en-US", options).format(now))
  }
  
  // Get status message based on Discord status
  function getStatusMessage(status: DiscordStatus): string {
    if (status.statusText) {
      return status.statusText
    }
    
    switch (status.status) {
      case "online":
        return "I'm currently online and available for a chat!"
      case "idle":
        return "I'm online but might be away from my computer."
      case "dnd":
        return "I'm currently busy. I'll respond when I'm available."
      case "offline":
      default:
        return "I'm currently offline. Please leave a message and I'll get back to you."
    }
  }
  
  // Get status display name
  function getStatusDisplayName(status: string): string {
    switch (status) {
      case "online": return "Available Now"
      case "idle": return "Away"
      case "dnd": return "Do Not Disturb"
      case "offline": return "Offline"
      default: return "Offline"
    }
  }
  
  // Get color based on Discord status
  function getStatusColor(status: string): string {
    switch (status) {
      case "online": return "bg-green-500"
      case "idle": return "bg-yellow-500" 
      case "dnd": return "bg-red-500"
      case "offline": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }
  
  // Format time since last update
  function getTimeSinceUpdate(): string {
    const now = new Date()
    const diff = now.getTime() - discordStatus.lastUpdated.getTime()
    
    // If less than a minute, show "just now"
    if (diff < 60000) {
      return "just now"
    }
    
    // If less than an hour, show minutes
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    }
    
    // Otherwise, show hours
    const hours = Math.floor(diff / 3600000)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Discord Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !error ? (
          <div className="flex items-center justify-center py-2">
            <div className="w-5 h-5 border-2 rounded-full border-primary border-t-transparent animate-spin"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading status...</span>
          </div>
        ) : error ? (
          <div className="text-sm text-muted-foreground">
            Unable to fetch Discord status. Showing time-based availability instead.
            <div className={`h-3 w-3 rounded-full mt-2 inline-block mr-2 ${new Date().getHours() >= 9 && new Date().getHours() < 19 ? "bg-green-500" : "bg-yellow-500"}`}></div>
            <span className="font-medium">
              {new Date().getHours() >= 9 && new Date().getHours() < 19 ? "Likely Available" : "Probably Away"}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${getStatusColor(discordStatus.status)}`}></div>
                <span className="font-medium">
                  {getStatusDisplayName(discordStatus.status)}
                </span>
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                <span>Updated {getTimeSinceUpdate()}</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">{getStatusMessage(discordStatus)}</p>
          </>
        )}
        
        <div className="flex items-center pt-4 mt-4 text-sm border-t text-muted-foreground border-border">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Local time: {currentTime} (CET)</span>
        </div>
      </CardContent>
    </Card>
  )
}
