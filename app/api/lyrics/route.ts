import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const artist = searchParams.get("artist")
  const title = searchParams.get("title")

  console.log(`🎵 Lyrics API called with artist: "${artist}", title: "${title}"`)

  if (!artist || !title) {
    console.log("❌ Missing required parameters")
    return NextResponse.json({ error: "Artist and title parameters are required" }, { status: 400 })
  }

  try {
    const geniusToken = process.env.GENIUS_ACCESS_TOKEN
    console.log(`🔑 Genius token available: ${geniusToken ? "YES" : "NO"}`)

    if (!geniusToken) {
      console.log("⚠️ No Genius API token found, returning sample lyrics")
      return NextResponse.json({
        lyrics: getSampleLyrics(artist, title),
        isSample: true,
        source: "sample",
        debug: "No Genius API token provided",
      })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log("⏰ Search request timed out after 15 seconds")
      controller.abort()
    }, 15000)

    // Search for the song on Genius
    const searchQuery = `${artist} ${title}`.replace(/[^\w\s]/gi, "").trim()
    console.log(`🔍 Searching Genius for: "${searchQuery}"`)

    const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(searchQuery)}`
    console.log(`📡 Making request to: ${searchUrl}`)

    const searchResponse = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${geniusToken}`,
        "User-Agent": "SongDash/1.0",
      },
    })

    clearTimeout(timeoutId)
    console.log(`📊 Search response status: ${searchResponse.status}`)

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.log(`❌ Genius search failed with status ${searchResponse.status}:`, errorText)
      throw new Error(`Genius search failed: ${searchResponse.status} - ${errorText}`)
    }

    const searchData = await searchResponse.json()
    console.log(`📋 Search results count: ${searchData.response?.hits?.length || 0}`)

    if (searchData.response?.hits?.length > 0) {
      console.log(
        `🎯 First result: "${searchData.response.hits[0].result.title}" by ${searchData.response.hits[0].result.primary_artist.name}`,
      )
    }

    const hits = searchData.response?.hits || []

    if (hits.length === 0) {
      console.log("🚫 No search results found, returning sample lyrics")
      return NextResponse.json({
        lyrics: getSampleLyrics(artist, title),
        isSample: true,
        source: "sample",
        debug: "No search results found on Genius",
      })
    }

    // Find the best match (first result is usually most relevant)
    const song = hits[0]?.result
    if (!song?.url) {
      console.log("❌ No song URL found in search results")
      return NextResponse.json({
        lyrics: getSampleLyrics(artist, title),
        isSample: true,
        source: "sample",
        debug: "No song URL in search results",
      })
    }

    console.log(`🎵 Found song: "${song.title}" by ${song.primary_artist.name}`)
    console.log(`🔗 Song URL: ${song.url}`)

    console.log("🎤 Attempting to fetch lyrics from lrclib.net...")

    // Try lrclib.net API
    try {
      console.log(`🔄 Trying lrclib.net API...`)

      const lrcController = new AbortController()
      const lrcTimeoutId = setTimeout(() => {
        console.log(`⏰ lrclib.net request timed out after 10 seconds`)
        lrcController.abort()
      }, 10000)

      // lrclib.net API endpoint
      const lrcUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(song.primary_artist.name)}&track_name=${encodeURIComponent(song.title)}`
      console.log(`📡 lrclib.net URL: ${lrcUrl}`)

      const lrcResponse = await fetch(lrcUrl, {
        signal: lrcController.signal,
        headers: {
          "User-Agent": "SongDash/1.0",
          Accept: "application/json",
        },
      })

      clearTimeout(lrcTimeoutId)
      console.log(`📊 lrclib.net response status: ${lrcResponse.status}`)

      if (lrcResponse.ok) {
        const lrcData = await lrcResponse.json()
        console.log(`📝 lrclib.net response keys:`, Object.keys(lrcData))

        // lrclib.net returns lyrics in 'plainLyrics' field
        const lyrics = lrcData.plainLyrics || lrcData.syncedLyrics

        if (lyrics && lyrics.trim()) {
          console.log(`✅ Successfully fetched lyrics from lrclib.net`)
          console.log(`📝 Lyrics length: ${lyrics.length} characters`)
          console.log(`📝 Lyrics preview:`, lyrics.substring(0, 200))

          return NextResponse.json({
            lyrics: lyrics.trim(),
            isSample: false,
            source: "lrclib.net",
            songInfo: {
              title: song.title,
              artist: song.primary_artist.name,
              album: song.album?.name || lrcData.albumName,
              year: song.release_date_for_display,
              duration: lrcData.duration,
            },
            debug: "Successfully fetched from lrclib.net",
          })
        } else {
          console.log(`⚠️ lrclib.net returned empty lyrics`)
          console.log(`📝 Response data:`, lrcData)
        }
      } else {
        const errorText = await lrcResponse.text()
        console.log(`❌ lrclib.net failed with status ${lrcResponse.status}`)
        console.log(`📝 Error response:`, errorText.substring(0, 300))
      }
    } catch (lrcError) {
      console.log(`❌ lrclib.net error:`, lrcError instanceof Error ? lrcError.message : lrcError)
    }

    try {
      console.log(`🔄 Trying backup lyrics.ovh API...`)

      const backupController = new AbortController()
      const backupTimeoutId = setTimeout(() => {
        console.log(`⏰ lyrics.ovh backup request timed out`)
        backupController.abort()
      }, 8000)

      const backupUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(song.primary_artist.name)}/${encodeURIComponent(song.title)}`
      console.log(`📡 Backup URL: ${backupUrl}`)

      const backupResponse = await fetch(backupUrl, {
        signal: backupController.signal,
        headers: {
          "User-Agent": "SongDash/1.0",
          Accept: "application/json",
        },
      })

      clearTimeout(backupTimeoutId)
      console.log(`📊 lyrics.ovh backup response status: ${backupResponse.status}`)

      if (backupResponse.ok) {
        const backupData = await backupResponse.json()
        const lyrics = backupData.lyrics

        if (lyrics && lyrics.trim() && !lyrics.includes("<!DOCTYPE html>")) {
          console.log(`✅ Successfully fetched lyrics from backup lyrics.ovh`)
          console.log(`📝 Lyrics length: ${lyrics.length} characters`)

          return NextResponse.json({
            lyrics: lyrics.trim(),
            isSample: false,
            source: "lyrics.ovh (backup)",
            songInfo: {
              title: song.title,
              artist: song.primary_artist.name,
              album: song.album?.name,
              year: song.release_date_for_display,
            },
            debug: "Fetched from backup lyrics.ovh after lrclib.net failed",
          })
        }
      }
    } catch (backupError) {
      console.log(`❌ Backup lyrics.ovh error:`, backupError instanceof Error ? backupError.message : backupError)
    }

    // If all lyrics sources fail, return enhanced sample lyrics with song info
    console.log("📝 All lyrics sources failed, returning enhanced sample lyrics with Genius metadata")
    return NextResponse.json({
      lyrics: getEnhancedSampleLyrics(song.title, song.primary_artist.name, song),
      isSample: true,
      source: "sample_with_metadata",
      songInfo: {
        title: song.title,
        artist: song.primary_artist.name,
        album: song.album?.name,
        year: song.release_date_for_display,
      },
      debug: "All lyrics sources failed, used Genius metadata with sample lyrics",
    })
  } catch (error) {
    console.error("💥 Lyrics API error:", error)

    if (error instanceof Error) {
      console.log("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack?.split("\n").slice(0, 5).join("\n"),
      })

      if (error.name === "AbortError") {
        console.log("⏰ Request was aborted due to timeout")
        return NextResponse.json({
          lyrics: getSampleLyrics(artist, title),
          isSample: true,
          source: "sample",
          debug: "Request timed out",
        })
      }
    }

    return NextResponse.json({
      lyrics: getSampleLyrics(artist, title),
      isSample: true,
      source: "sample",
      debug: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}

function getSampleLyrics(artist: string, title: string): string {
  return `[Sample lyrics for "${title}" by ${artist}]

Verse 1:
This is where the magic happens
When the music starts to play
Every word becomes a feeling
That can take your breath away

Chorus:
Share the moment, share the feeling
Let the lyrics speak your heart
Every song tells a story
Every word can be a start

Verse 2:
In the silence between the notes
There's a space for you and me
Where the music meets emotion
And we find our harmony

(Bridge)
Sometimes words aren't enough
But music fills the space
When you share a song with someone
You're sharing your embrace

[Note: These are sample lyrics. Real lyrics may not be available for this song.]`
}

function getEnhancedSampleLyrics(title: string, artist: string, songInfo: any): string {
  const year = songInfo.release_date_for_display ? ` (${songInfo.release_date_for_display})` : ""
  const album = songInfo.album?.name ? ` from "${songInfo.album.name}"` : ""

  return `[Sample lyrics for "${title}" by ${artist}${year}${album}]

Verse 1:
This is where the magic happens
When the music starts to play
Every word becomes a feeling
That can take your breath away

Chorus:
Share the moment, share the feeling
Let the lyrics speak your heart
Every song tells a story
Every word can be a start

Verse 2:
In the silence between the notes
There's a space for you and me
Where the music meets emotion
And we find our harmony

(Bridge)
Sometimes words aren't enough
But music fills the space
When you share a song with someone
You're sharing your embrace

[Note: These are sample lyrics generated for "${title}" by ${artist}. 
Real lyrics require additional API access.]`
}
