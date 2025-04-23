import { NextResponse } from 'next/server'

// Function to fetch the real-time Discord user status using Discord API
export async function GET() {
  try {
    // Get Discord user ID from environment variable
    const DISCORD_USER_ID = process.env.DISCORD_USER_ID || '931870926797160538'

    // Get Discord bot token from environment variable
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
    
    if (!DISCORD_BOT_TOKEN) {
      throw new Error('DISCORD_BOT_TOKEN is not configured in environment variables')
    }

    // Fetch user data from Discord API to check if they are online
    const response = await fetch(`https://discord.com/api/v10/users/${DISCORD_USER_ID}`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`Discord API returned ${response.status}`)
    }

    const userData = await response.json()

    // Use presence data from the Discord API directly if possible
    const presenceResponse = await fetch(`https://discord.com/api/v10/users/${DISCORD_USER_ID}/presence`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      }
    });

    let presenceStatus = 'offline';
    let isOnline = false;

    if (presenceResponse.ok) {
      const presenceData = await presenceResponse.json();
      if (presenceData?.status === 'online') {
        isOnline = true;
        presenceStatus = 'online';
      } else if (presenceData?.status === 'idle') {
        presenceStatus = 'idle';
      } else if (presenceData?.status === 'dnd') {
        presenceStatus = 'dnd';
      }
    }

    // Return real-time presence and status info
    const data = {
      online: isOnline,
      status: presenceStatus,
      username: userData.username || undefined
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
