// Music platform utilities for cross-platform linking

export interface MusicPlatform {
  id: string
  name: string
  color: string
  icon: string
  deepLinkPrefix: string
  webPrefix: string
  detectUserAgent: () => boolean
}

export const musicPlatforms: MusicPlatform[] = [
  {
    id: "spotify",
    name: "Spotify",
    color: "#1DB954",
    icon: "🎵",
    deepLinkPrefix: "spotify:track:",
    webPrefix: "https://open.spotify.com/track/",
    detectUserAgent: () => /spotify/i.test(navigator.userAgent),
  },
  {
    id: "appleMusic",
    name: "Apple Music",
    color: "#FA243C",
    icon: "🍎",
    deepLinkPrefix: "music://music.apple.com/song/",
    webPrefix: "https://music.apple.com/",
    detectUserAgent: () => /iPhone|iPad|iPod|Mac/i.test(navigator.userAgent),
  },
  {
    id: "youtubeMusic",
    name: "YouTube Music",
    color: "#FF0000",
    icon: "📺",
    deepLinkPrefix: "https://music.youtube.com/watch?v=",
    webPrefix: "https://music.youtube.com/watch?v=",
    detectUserAgent: () => /Android/i.test(navigator.userAgent),
  },
]

export function detectPreferredPlatform(): string {
  // Check localStorage first
  const stored = localStorage.getItem("preferredMusicPlatform")
  if (stored) return stored

  // Detect based on user agent
  for (const platform of musicPlatforms) {
    if (platform.detectUserAgent()) {
      return platform.id
    }
  }

  // Default to Spotify
  return "spotify"
}

export function setPreferredPlatform(platformId: string) {
  localStorage.setItem("preferredMusicPlatform", platformId)
}

export function getPlatformById(id: string): MusicPlatform | undefined {
  return musicPlatforms.find((p) => p.id === id)
}

export async function generateUniversalLink(song: any): Promise<string> {
  // Try to use song.link for universal linking
  if (song.platforms?.spotify) {
    try {
      const response = await fetch(
        `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(song.platforms.spotify)}`,
        {
          headers: {
            "User-Agent": "SongDash/1.0",
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        return (
          data.pageUrl ||
          `${process.env.NODE_ENV === 'production' ? 'https://songdash.io' : window.location.origin}/listen?song=${encodeURIComponent(
            JSON.stringify({
              title: song.title,
              artist: song.artist,
              platforms: song.platforms,
            }),
          )}`
        )
      }
    } catch (error) {
      console.log("Song.link API unavailable, using fallback")
    }
  }

  // Fallback to our custom listen page
  const songData = encodeURIComponent(
    JSON.stringify({
      title: song.title,
      artist: song.artist,
      platforms: song.platforms,
    }),
  )
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://songdash.io' : window.location.origin
  return `${baseUrl}/listen?song=${songData}`
}

export function extractTrackId(url: string, platform: string): string | null {
  try {
    switch (platform) {
      case "spotify":
        const spotifyMatch = url.match(/track\/([a-zA-Z0-9]+)/)
        return spotifyMatch ? spotifyMatch[1] : null
      case "appleMusic":
        const appleMatch = url.match(/i=(\d+)/)
        return appleMatch ? appleMatch[1] : null
      case "youtubeMusic":
        const youtubeMatch = url.match(/v=([a-zA-Z0-9_-]+)/)
        return youtubeMatch ? youtubeMatch[1] : null
      default:
        return null
    }
  } catch {
    return null
  }
}
