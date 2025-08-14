"use client"

import type React from "react"
import { useState } from "react"
import { Search, Music, ExternalLink, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LyricsDisplay } from "./lyrics-display"

interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  image: string
  platforms: {
    spotify?: string
    appleMusic?: string
    youtubeMusic?: string
  }
}

export function MusicSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [showLyrics, setShowLyrics] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error("Failed to search music")
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      console.error("Search error:", err)
      setError("Failed to search music. Please try again.")
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song)
    setShowLyrics(true)
  }

  const handleBackToSearch = () => {
    setShowLyrics(false)
    setSelectedSong(null)
  }

  if (showLyrics && selectedSong) {
    return <LyricsDisplay song={selectedSong} onBack={handleBackToSearch} />
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search for songs, artists, or albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          style={{ backgroundColor: "var(--violet-accent)" }}
          className="text-white hover:opacity-90"
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Search Results</h3>
          {results.map((song) => (
            <SongCard key={song.id} song={song} onSelect={handleSelectSong} />
          ))}
        </div>
      )}

      {query && results.length === 0 && !isLoading && !error && (
        <div className="text-center py-8">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No songs found for "{query}"</p>
        </div>
      )}
    </div>
  )
}

function SongCard({ song, onSelect }: { song: Song; onSelect: (song: Song) => void }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <img
            src={song.image || "/placeholder.svg"}
            alt={`${song.title} by ${song.artist}`}
            className="w-16 h-16 rounded-lg object-cover"
          />

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">{song.title}</h4>
            <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
            <p className="text-xs text-muted-foreground truncate">
              {song.album} • {song.duration}
            </p>

            <div className="flex gap-2 mt-2">
              {song.platforms.spotify && (
                <Badge variant="secondary" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Spotify
                </Badge>
              )}
              {song.platforms.appleMusic && (
                <Badge variant="secondary" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Apple Music
                </Badge>
              )}
              {song.platforms.youtubeMusic && (
                <Badge variant="secondary" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  YouTube Music
                </Badge>
              )}
            </div>
          </div>

          <Button
            size="sm"
            style={{ backgroundColor: "var(--violet-accent)" }}
            className="text-white hover:opacity-90"
            onClick={() => onSelect(song)}
          >
            Select Song
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
