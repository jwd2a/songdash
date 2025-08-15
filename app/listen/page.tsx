"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ExternalLink, Music, Smartphone, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { musicPlatforms, detectPreferredPlatform, setPreferredPlatform, getPlatformById } from "@/lib/music-platforms"

interface Song {
  title: string
  artist: string
  platforms: {
    spotify?: string
    appleMusic?: string
    youtubeMusic?: string
  }
}

export default function ListenPage() {
  const searchParams = useSearchParams()
  const [song, setSong] = useState<Song | null>(null)
  const [preferredPlatform, setPreferredPlatformState] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      const songParam = searchParams.get("song")
      if (songParam) {
        const songData = JSON.parse(decodeURIComponent(songParam))
        setSong(songData)
        setPreferredPlatformState(detectPreferredPlatform())
      } else {
        setError(true)
      }
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  const handlePlatformSelect = (platformId: string) => {
    setPreferredPlatform(platformId)
    setPreferredPlatformState(platformId)
  }

  const openInApp = (platformId: string, url: string, useDeepLink = true) => {
    const platform = getPlatformById(platformId)
    if (!platform || !url) return

    if (useDeepLink && platform.deepLinkPrefix !== platform.webPrefix) {
      // Try deep link first, fallback to web
      const deepLink = url.replace(platform.webPrefix, platform.deepLinkPrefix)
      window.location.href = deepLink

      // Fallback to web after a short delay
      setTimeout(() => {
        window.open(url, "_blank")
      }, 1000)
    } else {
      window.open(url, "_blank")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading song...</p>
        </div>
      </div>
    )
  }

  if (error || !song) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Song not found</h1>
          <p className="text-muted-foreground mb-4">This song link doesn't exist or may be invalid.</p>
          <Link href="/create">
            <Button style={{ backgroundColor: "var(--violet-accent)" }} className="text-white hover:opacity-90">
              Explore SongDash
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const availablePlatforms = musicPlatforms.filter(
    (platform) => song.platforms[platform.id as keyof typeof song.platforms],
  )

  const preferredPlatformData = getPlatformById(preferredPlatform)
  const preferredUrl = preferredPlatformData ? song.platforms[preferredPlatform as keyof typeof song.platforms] : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/create">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to SongDash
              </Button>
            </Link>
          </div>

          {/* Song Info */}
          <Card>
            <CardHeader>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">{song.title}</h1>
                <p className="text-lg text-muted-foreground">{song.artist}</p>
                <Badge variant="secondary" className="mt-2">
                  Available on {availablePlatforms.length} platform{availablePlatforms.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Preferred Platform */}
          {preferredUrl && preferredPlatformData && (
            <Card className="border-2 border-violet-200 dark:border-violet-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-violet-600" />
                  <h3 className="text-lg font-semibold">Your preferred platform</h3>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  size="lg"
                  className="w-full h-14 text-white hover:opacity-90"
                  style={{ backgroundColor: preferredPlatformData.color }}
                  onClick={() => openInApp(preferredPlatform, preferredUrl, true)}
                >
                  <span className="text-2xl mr-3">{preferredPlatformData.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Open in {preferredPlatformData.name}</div>
                    <div className="text-sm opacity-90">Tap to open in app or web</div>
                  </div>
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* All Platforms */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Choose your platform</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {availablePlatforms.map((platform) => {
                const url = song.platforms[platform.id as keyof typeof song.platforms]
                const isPreferred = platform.id === preferredPlatform

                return (
                  <div key={platform.id} className="flex gap-3">
                    <Button
                      variant={isPreferred ? "default" : "outline"}
                      className="flex-1 h-12 justify-start"
                      style={isPreferred ? { backgroundColor: platform.color } : {}}
                      onClick={() => openInApp(platform.id, url!, false)}
                    >
                      <span className="text-xl mr-3">{platform.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{platform.name}</div>
                        <div className="text-xs opacity-70">Listen now</div>
                      </div>
                      <ExternalLink className="w-4 h-4" />
                    </Button>

                    {!isPreferred && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlatformSelect(platform.id)}
                        className="px-3"
                        title="Set as preferred"
                      >
                        Set Default
                      </Button>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Platform Detection Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center">
                We detected you might prefer <strong>{preferredPlatformData?.name || "Spotify"}</strong> based on your
                device. You can change this anytime by selecting "Set Default" above.
              </p>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20 border-violet-200 dark:border-violet-800">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Love this song?</h3>
              <p className="text-muted-foreground mb-4">Create your own lyric moments and share them with friends</p>
              <Link href="/create">
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
    </div>
  )
}
