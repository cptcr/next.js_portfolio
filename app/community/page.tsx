"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar } from "lucide-react"

// Availability status is determined based on current time and day in Germany
function getAvailabilityStatus(): {
  available: boolean
  message: string
} {
  // Get current time in Germany (CET/CEST)
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Europe/Berlin",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    weekday: "long",
  }
  
  const formatter = new Intl.DateTimeFormat("en-US", options)
  const formatted = formatter.formatToParts(now)
  
  // Extract weekday, hour, minute from formatted date
  const weekday = formatted.find(part => part.type === "weekday")?.value || ""
  const hour = parseInt(formatted.find(part => part.type === "hour")?.value || "0")
  
  // Check if it's a weekend
  const isWeekend = weekday === "Saturday" || weekday === "Sunday"
  
  // Check if it's outside working hours (9 AM - 7 PM)
  const isWorkingHours = hour >= 9 && hour < 19
  
  // Determine availability based on day and time
  if (isWeekend) {
    return {
      available: false,
      message: "I'm typically less responsive on weekends. I'll get back to you next week."
    }
  } else if (!isWorkingHours) {
    return {
      available: false,
      message: "I'm currently offline. I'll respond during my working hours (9 AM - 7 PM CET)."
    }
  } else {
    return {
      available: true,
      message: "I'm currently online and usually respond within a few hours."
    }
  }
}

export default function AvailabilityStatus() {
  const [status, setStatus] = useState(() => getAvailabilityStatus())
  const [currentTime, setCurrentTime] = useState("")
  
  // Update the status every minute
  useEffect(() => {
    // Set initial time
    updateCurrentTime()
    
    // Update time every minute
    const intervalId = setInterval(() => {
      updateCurrentTime()
      setStatus(getAvailabilityStatus())
    }, 60000)
    
    return () => clearInterval(intervalId)
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${status.available ? "bg-green-500" : "bg-yellow-500"}`}></div>
            <span className="font-medium">
              {status.available ? "Available Now" : "Currently Away"}
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>Updated just now</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{status.message}</p>
        
        <div className="flex items-center text-sm text-muted-foreground border-t border-border pt-4 mt-4">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Local time: {currentTime} (CET)</span>
        </div>
      </CardContent>
    </Card>
  )
}