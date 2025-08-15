import { type NextRequest, NextResponse } from "next/server"
import { getOptimalArtwork, generateFallbackArtwork } from "@/lib/artwork-utils"

// Mock song data with enhanced artwork
const mockSongs = {
  "song-1": {
    id: "song-1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    artwork: generateFallbackArtwork("Blinding Lights", "The Weeknd"),
    lyrics: `Yeah, I've been trying to call
I've been on my own for long enough
Maybe you can show me how to love, maybe
I feel like I'm just missing something whenever you're gone

'Cause I wanna be in love (For real, for real)
I just wanna be in love (For real)
I'm running out of time
'Cause I can see the sun light up the sky
So I hit the road in overdrive, baby, oh

The city's cold and empty (Oh)
No one's around to judge me (Oh)
I can't see clearly when you're gone

I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch
I said, ooh, I'm drowning in the night
Oh, when I'm like this, you're the one I trust

Hey, hey, hey

I'm running out of time
'Cause I can see the sun light up the sky
So I hit the road in overdrive, baby, oh

The city's cold and empty (Oh)
No one's around to judge me (Oh)
I can't see clearly when you're gone

I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch
I said, ooh, I'm drowning in the night
Oh, when I'm like this, you're the one I trust

I'm just calling back to let you know (Back to let you know)
I could never say it on the phone (Say it on the phone)
Will never let you go this time (Ooh)

I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch
I said, ooh, I'm drowning in the night
Oh, when I'm like this, you're the one I trust

I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch
I said, ooh, I'm drowning in the night
Oh, when I'm like this, you're the one I trust

Hey, hey, hey

I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch
I said, ooh, I'm drowning in the night
Oh, when I'm like this, you're the one I trust

I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch
I said, ooh, I'm drowning in the night
Oh, when I'm like this, you're the one I trust

Hey, hey, hey`,
    platforms: {
      spotify: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b",
      appleMusic: "https://music.apple.com/us/album/blinding-lights/1499378108?i=1499378116"
    },
    duration: "3:20"
  },
  "song-2": {
    id: "song-2",
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    album: "SOUR",
    artwork: "/placeholder.svg",
    lyrics: `Well, good for you, I guess you moved on really easily
You found a new girl and it only took a couple weeks
Remember when you said that you wanted to give me the world?
And good for you, I guess that you've been working on yourself
I guess that therapist I found for you, she really helped
Now you can be a better man for your brand new girl

Well, good for you, I guess you moved on really easily
You found a new girl and it only took a couple weeks
Remember when you said that you wanted to give me the world?
And good for you, I guess that you've been working on yourself
I guess that therapist I found for you, she really helped
Now you can be a better man for your brand new girl

Well, good for you, I guess you moved on really easily
You found a new girl and it only took a couple weeks
Remember when you said that you wanted to give me the world?
And good for you, I guess that you've been working on yourself
I guess that therapist I found for you, she really helped
Now you can be a better man for your brand new girl

Well, good for you, I guess you moved on really easily
You found a new girl and it only took a couple weeks
Remember when you said that you wanted to give me the world?
And good for you, I guess that you've been working on yourself
I guess that therapist I found for you, she really helped
Now you can be a better man for your brand new girl`,
    platforms: {
      spotify: "https://open.spotify.com/track/4ZtFanR9U6ndgddUvNcjcG",
      appleMusic: "https://music.apple.com/us/album/good-4-u/1558137289?i=1558137290"
    },
    duration: "2:58"
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: songId } = await params

  try {
    // Check if we're in mock mode
    const useMock = process.env.NEXT_PUBLIC_API_MODE !== 'supabase'

    if (useMock) {
      // Return mock data for mock song IDs
      const mockSong = mockSongs[songId as keyof typeof mockSongs]
      if (mockSong) {
        return NextResponse.json(mockSong)
      }
      
      // If not a mock song ID, try to fetch from Spotify
      return await fetchFromSpotify(songId)
    }

    // For Supabase mode, try to fetch from Spotify for real track IDs
    if (songId.startsWith('song-')) {
      // This is a mock song ID, return mock data
      const mockSong = mockSongs[songId as keyof typeof mockSongs]
      if (!mockSong) {
        return NextResponse.json({ error: "Song not found" }, { status: 404 })
      }
      return NextResponse.json(mockSong)
    }

    // Try to fetch from Spotify API for real track IDs
    return await fetchFromSpotify(songId)

  } catch (error) {
    console.error('Error fetching song:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function fetchFromSpotify(songId: string) {
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
      console.error('Failed to get Spotify token:', tokenResponse.statusText)
      return NextResponse.json({ error: "Spotify service unavailable" }, { status: 503 })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Fetch track details from Spotify
    const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${songId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!trackResponse.ok) {
      console.error('Spotify track not found:', trackResponse.statusText)
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    const track = await trackResponse.json()
    
    // Get universal links from song.link API
    let platforms = {
      spotify: track.external_urls.spotify,
      appleMusic: `https://music.apple.com/search?term=${encodeURIComponent(`${track.name} ${track.artists[0]?.name}`)}`,
      youtubeMusic: `https://music.youtube.com/search?q=${encodeURIComponent(`${track.name} ${track.artists[0]?.name}`)}`,
    }

    try {
      const songLinkResponse = await fetch(
        `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(track.external_urls.spotify)}`,
        {
          headers: {
            "User-Agent": "SongDash/1.0",
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

    // Fetch lyrics from LRCLib
    let lyrics = await fetchLyricsFromLRCLib(track.name, track.artists[0]?.name)
    
    // Get optimized artwork with fallbacks
    const artworkSources = getOptimalArtwork(track.album.images || [])
    
    // If no Spotify artwork, generate a fallback
    let primaryArtwork = artworkSources.large
    if (!primaryArtwork.startsWith('http')) {
      primaryArtwork = generateFallbackArtwork(track.name, track.artists[0]?.name || 'Unknown Artist')
    }

    return NextResponse.json({
      id: track.id,
      title: track.name,
      artist: track.artists[0]?.name,
      album: track.album.name,
      artwork: primaryArtwork,
      artworkSources, // Provide multiple sizes
      platforms,
      duration: Math.floor(track.duration_ms / 60000) + ":" + 
                String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0'),
      lyrics: lyrics
    })

  } catch (error) {
    console.error('Error fetching from Spotify:', error)
    return NextResponse.json({ error: "Failed to fetch song details" }, { status: 500 })
  }
}

async function fetchLyricsFromLRCLib(songTitle: string, artistName: string): Promise<string> {
  try {
    console.log(`Fetching lyrics for "${songTitle}" by ${artistName} using LRCLib`)

    // LRCLib API endpoint for searching lyrics
    const searchUrl = `https://lrclib.net/api/search?track_name=${encodeURIComponent(songTitle)}&artist_name=${encodeURIComponent(artistName)}`
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'SongDash/1.0'
      }
    })

    if (!searchResponse.ok) {
      console.error(`LRCLib search failed: ${searchResponse.status} ${searchResponse.statusText}`)
      return getPlaceholderLyrics(songTitle, artistName)
    }

    const searchResults = await searchResponse.json()

    if (!Array.isArray(searchResults) || searchResults.length === 0) {
      console.log("No lyrics found on LRCLib")
      return getPlaceholderLyrics(songTitle, artistName)
    }

    // Get the best match (first result is usually most relevant)
    const bestMatch = searchResults[0]
    
    if (!bestMatch.plainLyrics && !bestMatch.syncedLyrics) {
      console.log("No lyrics content available for this song")
      return getPlaceholderLyrics(songTitle, artistName)
    }

    console.log(`Successfully found lyrics on LRCLib for "${bestMatch.trackName}" by ${bestMatch.artistName}`)

    // Use plain lyrics if available, otherwise fall back to synced lyrics without timestamps
    let lyrics = bestMatch.plainLyrics
    
    if (!lyrics && bestMatch.syncedLyrics) {
      // Parse synced lyrics to extract just the text (remove timestamps)
      lyrics = bestMatch.syncedLyrics
        .split('\n')
        .map((line: string) => {
          // Remove LRC timestamp format [mm:ss.xx]
          return line.replace(/^\[\d{2}:\d{2}\.\d{2}\]/, '').trim()
        })
        .filter((line: string) => line.length > 0) // Remove empty lines
        .join('\n')
    }

    if (!lyrics || lyrics.trim().length === 0) {
      console.log("Lyrics content is empty")
      return getPlaceholderLyrics(songTitle, artistName)
    }

    // Add header with song info
    let lyricsContent = `🎵 "${bestMatch.trackName}" by ${bestMatch.artistName}\n`
    
    if (bestMatch.albumName) {
      lyricsContent += `Album: ${bestMatch.albumName}\n`
    }
    if (bestMatch.duration) {
      const minutes = Math.floor(bestMatch.duration / 60)
      const seconds = bestMatch.duration % 60
      lyricsContent += `Duration: ${minutes}:${seconds.toString().padStart(2, '0')}\n`
    }
    
    lyricsContent += `\n${lyrics.trim()}\n\n`
    lyricsContent += `📖 Lyrics provided by LRCLib.net`

    return lyricsContent

  } catch (error) {
    console.error('Error fetching from LRCLib:', error)
    return getPlaceholderLyrics(songTitle, artistName)
  }
}



function getPlaceholderLyrics(songTitle: string, artistName: string): string {
  return `[Lyrics for "${songTitle}" by ${artistName}]

This is a placeholder for the lyrics.
We're working on integrating with a lyrics service to provide the full lyrics.

For now, you can still add notes and highlights to share your thoughts about this song!`
}