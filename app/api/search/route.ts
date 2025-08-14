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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    // Get Spotify access token
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to get Spotify token")
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Search for tracks
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!searchResponse.ok) {
      throw new Error("Failed to search Spotify")
    }

    const searchData: SpotifySearchResponse = await searchResponse.json()

    // Transform Spotify data to our format
    const results = await Promise.all(
      searchData.tracks.items.map(async (track: SpotifyTrack) => {
        // Try to get universal links from song.link API
        let platforms = {
          spotify: track.external_urls.spotify,
          appleMusic: `https://music.apple.com/search?term=${encodeURIComponent(`${track.name} ${track.artists[0]?.name}`)}`,
          youtubeMusic: `https://music.youtube.com/search?q=${encodeURIComponent(`${track.name} ${track.artists[0]?.name}`)}`,
        }

        try {
          // Try to get better links from song.link API
          const songLinkResponse = await fetch(
            `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(track.external_urls.spotify)}`,
            {
              headers: {
                "User-Agent": "LyricLoop/1.0",
              },
            },
          )

          if (songLinkResponse.ok) {
            const songLinkData = await songLinkResponse.json()

            platforms = {
              spotify: songLinkData.linksByPlatform?.spotify?.url || track.external_urls.spotify,
              appleMusic: songLinkData.linksByPlatform?.appleMusic?.url || platforms.appleMusic,
              youtubeMusic: songLinkData.linksByPlatform?.youtubeMusic?.url || platforms.youtubeMusic,
            }
          }
        } catch (error) {
          console.log("Song.link API unavailable, using fallback links")
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
      }),
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to search music" }, { status: 500 })
  }
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
