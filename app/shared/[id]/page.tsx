"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Music, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { generateUniversalLink, detectPreferredPlatform, getPlatformById } from "@/lib/music-platforms"

interface Song {
  id: string
  title: string
  artist: string
  album: string
  image: string
  platforms: {
    spotify?: string
    appleMusic?: string
    youtubeMusic?: string
  }
}

interface HighlightedSection {
  id: string
  text: string
  startIndex: number
  endIndex: number
  note?: string
}

interface SharedMoment {
  song: Song
  highlights: HighlightedSection[]
  createdAt: string
}

export default function SharedMomentPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [moment, setMoment] = useState<SharedMoment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [preferredPlatform, setPreferredPlatform] = useState<string>("")
  const [lyrics, setLyrics] = useState<string>("")
  const [lyricsLoading, setLyricsLoading] = useState(false)
  const [lyricsError, setLyricsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(false)

      // Try to interpret the id as a base64-encoded payload first
      try {
        const decoded = atob(id)
        const momentData = JSON.parse(decoded) as SharedMoment
        if (!cancelled) {
          setMoment(momentData)
          setPreferredPlatform(detectPreferredPlatform())
          setLoading(false)
        }
        return
      } catch (err) {
        // Fall through to fetch by ID
      }

      // Fallback: fetch the moment by ID from the API
      try {
        const res = await fetch(`/api/moments?id=${encodeURIComponent(id)}`)
        if (!res.ok) {
          throw new Error("Failed to load shared moment")
        }
        const data = (await res.json()) as SharedMoment
        if (!cancelled) {
          setMoment(data)
          setPreferredPlatform(detectPreferredPlatform())
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    const fetchLyrics = async () => {
      if (!moment) return

      setLyricsLoading(true)
      setLyricsError(null)

      try {
        const response = await fetch(
          `/api/lyrics?artist=${encodeURIComponent(moment.song.artist)}&title=${encodeURIComponent(moment.song.title)}`,
        )

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Lyrics not found for this song")
          }
          throw new Error("Failed to fetch lyrics")
        }

        const data = await response.json()
        setLyrics(data.lyrics || "Lyrics not available for this song.")
      } catch (err) {
        console.error("Lyrics error:", err)
        setLyricsError(err instanceof Error ? err.message : "Failed to load lyrics")
        setLyrics("")
      } finally {
        setLyricsLoading(false)
      }
    }

    fetchLyrics()
  }, [moment])

  const renderLyricsWithHighlights = () => {
    if (!lyrics || moment.highlights.length === 0) {
      return lyrics.split("\n").map((line, index) => (
        <p key={index} className="mb-4 leading-relaxed">
          {line || "\u00A0"}
        </p>
      ))
    }

    const sortedHighlights = [...moment.highlights].sort((a, b) => a.startIndex - b.startIndex)

    let lastIndex = 0
    const elements: React.ReactNode[] = []
    let keyCounter = 0

    sortedHighlights.forEach((highlight) => {
      if (highlight.startIndex > lastIndex) {
        const beforeText = lyrics.slice(lastIndex, highlight.startIndex)
        beforeText.split("\n").forEach((line, lineIndex) => {
          if (lineIndex > 0) elements.push(<br key={`br-${keyCounter++}`} />)
          if (line) elements.push(<span key={`text-${keyCounter++}`}>{line}</span>)
        })
      }

      const highlightedText = lyrics.slice(highlight.startIndex, highlight.endIndex)

      elements.push(
        <mark
          key={`highlight-${highlight.id}`}
          className="px-2 py-1 rounded-lg bg-pink-200 dark:bg-pink-900/50 relative"
          title={highlight.note ? `Note: ${highlight.note}` : "Highlighted by sender"}
        >
          {highlightedText}
          {highlight.note && <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></span>}
        </mark>,
      )

      lastIndex = highlight.endIndex
    })

    if (lastIndex < lyrics.length) {
      const remainingText = lyrics.slice(lastIndex)
      remainingText.split("\n").forEach((line, lineIndex) => {
        if (lineIndex > 0) elements.push(<br key={`br-final-${keyCounter++}`} />)
        if (line) elements.push(<span key={`text-final-${keyCounter++}`}>{line}</span>)
      })
    }

    return <div className="leading-relaxed">{elements}</div>
  }

  const handleListenNow = async () => {
    const universalLink = await generateUniversalLink(moment.song)
    window.open(universalLink, "_blank")
  }

  const handlePlatformClick = (platform: string) => {
    const url = moment.song.platforms[platform as keyof typeof moment.song.platforms]
    if (url) {
      window.open(url, "_blank")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading lyric moment...</p>
        </div>
      </div>
    )
  }

  if (error || !moment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Moment not found</h1>
          <p className="text-muted-foreground mb-4">This lyric moment doesn't exist or the link may be invalid.</p>
          <Link href="/">
            <Button style={{ backgroundColor: "var(--violet-accent)" }} className="text-white hover:opacity-90">
              Explore SongDash
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const preferredPlatformData = getPlatformById(preferredPlatform)
  const preferredUrl = preferredPlatformData
    ? moment.song.platforms[preferredPlatform as keyof typeof moment.song.platforms]
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Explore SongDash
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img
                src={moment.song.image || "/placeholder.svg"}
                alt={`${moment.song.title} by ${moment.song.artist}`}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="font-semibold text-foreground">{moment.song.title}</h1>
                <p className="text-sm text-muted-foreground">{moment.song.artist}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleListenNow}
              size="sm"
              style={{ backgroundColor: "var(--violet-accent)" }}
              className="text-white hover:opacity-90"
            >
              <Music className="w-4 h-4 mr-2" />
              Listen Now
            </Button>

            <div className="flex gap-1">
              {moment.song.platforms.spotify && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePlatformClick("spotify")}
                  className="text-xs px-2"
                  style={{ borderColor: "#1DB954", color: "#1DB954" }}
                >
                  Spotify
                </Button>
              )}
              {moment.song.platforms.appleMusic && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePlatformClick("appleMusic")}
                  className="text-xs px-2"
                  style={{ borderColor: "#FA243C", color: "#FA243C" }}
                >
                  Apple
                </Button>
              )}
              {moment.song.platforms.youtubeMusic && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePlatformClick("youtubeMusic")}
                  className="text-xs px-2"
                  style={{ borderColor: "#FF0000", color: "#FF0000" }}
                >
                  YouTube
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
            Someone shared a lyric moment with you
          </h2>
          <p className="text-lg text-muted-foreground">See their highlighted lyrics and personal notes below</p>
        </div>

        {lyricsLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            <span className="ml-4 text-lg text-muted-foreground">Loading lyrics...</span>
          </div>
        ) : lyricsError ? (
          <Alert variant="destructive" className="my-12">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">{lyricsError}</AlertDescription>
          </Alert>
        ) : (
          <div className="mb-12">
            <div className="text-2xl leading-loose text-center max-w-none" style={{ lineHeight: "2.8" }}>
              {renderLyricsWithHighlights()}
            </div>
          </div>
        )}

        {moment.highlights.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-6 text-center">Personal Notes ({moment.highlights.length})</h3>
            <div className="space-y-4">
              {moment.highlights
                .filter((h) => h.note)
                .map((highlight) => (
                  <Card
                    key={highlight.id}
                    className="bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800"
                  >
                    <CardContent className="p-4">
                      <blockquote className="text-lg italic text-pink-700 dark:text-pink-300 mb-3 border-l-4 border-pink-300 dark:border-pink-700 pl-4">
                        "{highlight.text}"
                      </blockquote>
                      <div className="p-3 bg-background rounded border">
                        <p className="text-sm text-muted-foreground">{highlight.note}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        <Card className="bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20 border-violet-200 dark:border-violet-800">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Create your own lyric moments</h3>
            <p className="text-muted-foreground mb-4">
              Highlight lyrics that speak to you and share them with the people you care about
            </p>
            <Link href="/">
              <Button
                size="lg"
                style={{ backgroundColor: "var(--violet-accent)" }}
                className="text-white hover:opacity-90"
              >
                Start Creating
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
