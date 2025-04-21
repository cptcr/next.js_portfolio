import { NextResponse } from 'next/server'

// Cache discord status to avoid hitting rate limits
interface StatusCache {
  data: any
  timestamp: number
}

let discordStatusCache: StatusCache | null = null
const CACHE_DURATION = 30 * 1000 // 30 seconds cache

export async function GET() {
  try {
    // Return cached data if available and fresh
    if (
      discordStatusCache &&
      Date.now() - discordStatusCache.timestamp < CACHE_DURATION
    ) {
      return NextResponse.json(discordStatusCache.data)
    }

    // Get Discord user ID from environment variable
    const DISCORD_USER_ID = process.env.DISCORD_USER_ID || '931870926797160538'
    
    // Get Discord bot token from environment variable
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
    
    if (!DISCORD_BOT_TOKEN) {
      throw new Error('DISCORD_BOT_TOKEN is not configured in environment variables')
    }

    // Use Lanyard API as an alternative if configured
    const USE_LANYARD = process.env.USE_LANYARD === 'true'
    
    let data
    
    if (USE_LANYARD) {
      // Fetch from Lanyard API (https://github.com/Phineas/lanyard)
      // This is a public API that provides Discord presence data
      const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`)
      
      if (!response.ok) {
        throw new Error(`Lanyard API returned ${response.status}`)
      }
      
      const lanyardData = await response.json()
      
      if (!lanyardData.success) {
        throw new Error('Lanyard API returned unsuccessful response')
      }
      
      // Transform Lanyard data to our format
      data = {
        online: lanyardData.data.active_on_discord_desktop || 
                lanyardData.data.active_on_discord_mobile || 
                lanyardData.data.active_on_discord_web,
        status: lanyardData.data.discord_status,
        statusText: lanyardData.data.discord_user.username || undefined
      }
    } else {
      // Use Discord API directly
      const response = await fetch(`https://discord.com/api/v10/users/${DISCORD_USER_ID}`, {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      })
      
      if (!response.ok) {
        throw new Error(`Discord API returned ${response.status}`)
      }
      
      const userData = await response.json()
      
      // For getting real presence data, you would need to:
      // 1. Connect to Discord Gateway WebSocket
      // 2. Identify with your bot token
      // 3. Subscribe to PRESENCE_UPDATE events
      // This is complex and usually handled by a Discord bot library
      
      // Simplified approach - just return user data for now
      // In a real implementation, you'd need to extend this to get actual presence
      data = {
        online: true, // This is a placeholder since we can't get real presence this way
        status: "online", // Placeholder
        statusText: userData.username || undefined
      }
    }
    
    // Cache the result
    discordStatusCache = {
      data,
      timestamp: Date.now()
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching Discord status:', error)
    
    // Return a fallback status if the API call fails
    const fallbackStatus = {
      online: false,
      status: "offline",
      statusText: undefined
    }
    
    return NextResponse.json(fallbackStatus)
  }
}