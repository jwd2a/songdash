import { type NextRequest, NextResponse } from "next/server"

interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
  }
  duration_ms: number
  external_urls: {
    spotify: string
  }
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
  }
}

// In-memory cache for search results (in production, use Redis)
const searchCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const REQUEST_TIMEOUT = 8000 // 8 seconds

// Cache for Spotify access tokens
let spotifyTokenCache: { token: string; expiresAt: number } | null = null

// Cleanup cache periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of searchCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        searchCache.delete(key)
      }
    }
  }, 60 * 1000) // Cleanup every minute
}

async function getSpotifyToken(): Promise<string> {
  // Check if we have a valid cached token
  if (spotifyTokenCache && Date.now() < spotifyTokenCache.expiresAt) {
    return spotifyTokenCache.token
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
      signal: controller.signal
    })

    if (!tokenResponse.ok) {
      throw new Error(`Spotify token request failed: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    
    // Cache the token (Spotify tokens typically last 1 hour)
    spotifyTokenCache = {
      token: tokenData.access_token,
      expiresAt: Date.now() + (tokenData.expires_in - 60) * 1000 // Subtract 1 minute for safety
    }

    return tokenData.access_token
  } finally {
    clearTimeout(timeoutId)
  }
}

async function getSongLinkData(spotifyUrl: string): Promise<any> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 3000) // Shorter timeout for song.link

  try {
    const songLinkResponse = await fetch(
      `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}`,
      {
        headers: {
          "User-Agent": "SongDash/1.0",
        },
        signal: controller.signal
      }
    )

    if (!songLinkResponse.ok) {
      return null
    }

    return await songLinkResponse.json()
  } catch (error) {
    // Silently fail for song.link API - it's not critical
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 })
  }

  const normalizedQuery = query.trim().toLowerCase()
  const cacheKey = `search:${normalizedQuery}`

  // Check cache first
  const cached = searchCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    // Get Spotify access token
    const accessToken = await getSpotifyToken()

    // Search for tracks
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=15&market=US`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal
      },
    )

    if (!searchResponse.ok) {
      throw new Error(`Spotify search failed: ${searchResponse.status}`)
    }

    const searchData: SpotifySearchResponse = await searchResponse.json()

    // Process tracks in parallel with limited concurrency
    const tracks = searchData.tracks.items.slice(0, 10) // Limit to 10 results
    const batchSize = 3 // Process 3 song.link requests at a time
    const results = []

    for (let i = 0; i < tracks.length; i += batchSize) {
      const batch = tracks.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (track: SpotifyTrack) => {
        // Default platform links
        let platforms = {
          spotify: track.external_urls.spotify,
          appleMusic: `https://music.apple.com/search?term=${encodeURIComponent(`${track.name} ${track.artists[0]?.name}`)}`,
          youtubeMusic: `https://music.youtube.com/search?q=${encodeURIComponent(`${track.name} ${track.artists[0]?.name}`)}`,
        }

        // Try to get better links from song.link API (non-blocking)
        const songLinkData = await getSongLinkData(track.external_urls.spotify)
        if (songLinkData?.linksByPlatform) {
          platforms = {
            spotify: songLinkData.linksByPlatform?.spotify?.url || platforms.spotify,
            appleMusic: songLinkData.linksByPlatform?.appleMusic?.url || platforms.appleMusic,
            youtubeMusic: songLinkData.linksByPlatform?.youtubeMusic?.url || platforms.youtubeMusic,
          }
        }

        return {
          id: track.id,
          title: track.name,
          artist: track.artists.map((a) => a.name).join(", "),
          album: track.album.name,
          duration: formatDuration(track.duration_ms),
          image: track.album.images[0]?.url || "/placeholder.svg",
          platforms,
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    const response = { results }

    // Cache the result
    searchCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error("Search error:", error)
    
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: "Search request timed out" }, { status: 408 })
    }
    
    return NextResponse.json({ error: "Failed to search music" }, { status: 500 })
  } finally {
    clearTimeout(timeoutId)
  }
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
