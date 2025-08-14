"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Share2, TrendingUp, Clock, Music, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

interface LyricMoment {
  id: string
  user: {
    name: string
    username: string
    avatar: string
  }
  song: {
    title: string
    artist: string
    image: string
    platforms: {
      spotify?: string
      appleMusic?: string
      youtubeMusic?: string
    }
  }
  highlight: {
    text: string
    note: string
  }
  stats: {
    likes: number
    comments: number
    shares: number
  }
  createdAt: string
  isLiked: boolean
  trending: boolean
}

export default function DiscoverPage() {
  const [moments, setMoments] = useState<LyricMoment[]>([])
  const [filter, setFilter] = useState<"trending" | "recent" | "popular">("trending")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockMoments: LyricMoment[] = [
      {
        id: "1",
        user: {
          name: "Sarah Chen",
          username: "@sarahc",
          avatar: "/diverse-woman-portrait.png",
        },
        song: {
          title: "Anti-Hero",
          artist: "Taylor Swift",
          image: "/anti-hero-album-cover.png",
          platforms: {
            spotify: "https://open.spotify.com/track/0V3wPSX9ygBnCm8psDIegu",
            appleMusic: "https://music.apple.com/us/album/anti-hero/1645817813?i=1645817824",
          },
        },
        highlight: {
          text: "It's me, hi, I'm the problem, it's me",
          note: "This hit different at 3am when you're overthinking everything 😭",
        },
        stats: { likes: 1247, comments: 89, shares: 156 },
        createdAt: "2h ago",
        isLiked: false,
        trending: true,
      },
      {
        id: "2",
        user: {
          name: "Marcus Johnson",
          username: "@marcusj",
          avatar: "/thoughtful-man.png",
        },
        song: {
          title: "Flowers",
          artist: "Miley Cyrus",
          image: "/generic-woman-floral-album.png",
          platforms: {
            spotify: "https://open.spotify.com/track/0yLdNVWF3Srea0uzk55zFn",
            youtubeMusic: "https://music.youtube.com/watch?v=G7KNmW9a75Y",
          },
        },
        highlight: {
          text: "I can buy myself flowers, write my name in the sand",
          note: "Self-love anthem! Sometimes you gotta be your own biggest fan 💪",
        },
        stats: { likes: 892, comments: 45, shares: 78 },
        createdAt: "5h ago",
        isLiked: true,
        trending: true,
      },
      {
        id: "3",
        user: {
          name: "Emma Rodriguez",
          username: "@emmar",
          avatar: "/confident-latina-woman.png",
        },
        song: {
          title: "As It Was",
          artist: "Harry Styles",
          image: "/harry-styles-as-it-was-inspired-cover.png",
          platforms: {
            spotify: "https://open.spotify.com/track/4Dvkj6JhhA12EX05fT7y2e",
            appleMusic: "https://music.apple.com/us/album/as-it-was/1615584999?i=1615585005",
          },
        },
        highlight: {
          text: "In this world, it's just us, you know it's not the same as it was",
          note: "Missing the way things used to be with someone special ❤️",
        },
        stats: { likes: 634, comments: 32, shares: 41 },
        createdAt: "1d ago",
        isLiked: false,
        trending: false,
      },
    ]

    setTimeout(() => {
      setMoments(mockMoments)
      setLoading(false)
    }, 1000)
  }, [])

  const handleLike = (momentId: string) => {
    setMoments((prev) =>
      prev.map((moment) =>
        moment.id === momentId
          ? {
              ...moment,
              isLiked: !moment.isLiked,
              stats: {
                ...moment.stats,
                likes: moment.isLiked ? moment.stats.likes - 1 : moment.stats.likes + 1,
              },
            }
          : moment,
      ),
    )
  }

  const handleShare = (moment: LyricMoment) => {
    const shareText = `"${moment.highlight.text}" - ${moment.song.artist}\n\n${moment.highlight.note}\n\nShared via SongDash`

    if (navigator.share) {
      navigator.share({
        title: `${moment.song.title} by ${moment.song.artist}`,
        text: shareText,
        url: process.env.NODE_ENV === 'production' ? 'https://songdash.io' : window.location.origin,
      })
    } else {
      navigator.clipboard.writeText(shareText)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="w-24 h-4 bg-muted rounded mb-1"></div>
                        <div className="w-16 h-3 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="w-full h-20 bg-muted rounded mb-4"></div>
                    <div className="flex gap-4">
                      <div className="w-16 h-8 bg-muted rounded"></div>
                      <div className="w-16 h-8 bg-muted rounded"></div>
                      <div className="w-16 h-8 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Discover</h1>
            <p className="text-muted-foreground">See what lyrics are resonating with people right now</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            {[
              { key: "trending", label: "Trending", icon: TrendingUp },
              { key: "recent", label: "Recent", icon: Clock },
              { key: "popular", label: "Popular", icon: Heart },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={filter === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(key as any)}
                className="flex-1 flex items-center gap-2"
                style={filter === key ? { backgroundColor: "var(--violet-accent)" } : {}}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* Moments Feed */}
          <div className="space-y-6">
            {moments.map((moment) => (
              <Card key={moment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={moment.user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {moment.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{moment.user.name}</p>
                        {moment.trending && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {moment.user.username} • {moment.createdAt}
                      </p>
                    </div>
                  </div>

                  {/* Song Info */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
                    <img
                      src={moment.song.image || "/placeholder.svg"}
                      alt={`${moment.song.title} by ${moment.song.artist}`}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{moment.song.title}</p>
                      <p className="text-sm text-muted-foreground">{moment.song.artist}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Music className="w-4 h-4 mr-1" />
                      Listen
                    </Button>
                  </div>

                  {/* Highlighted Lyric */}
                  <div className="mb-4 p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-200 dark:border-pink-800">
                    <blockquote className="text-lg italic text-pink-700 dark:text-pink-300 mb-3 border-l-4 border-pink-300 dark:border-pink-700 pl-4">
                      "{moment.highlight.text}"
                    </blockquote>
                    <p className="text-sm text-foreground">{moment.highlight.note}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(moment.id)}
                      className={`flex items-center gap-2 ${moment.isLiked ? "text-pink-600" : "text-muted-foreground"}`}
                    >
                      <Heart className={`w-4 h-4 ${moment.isLiked ? "fill-current" : ""}`} />
                      {moment.stats.likes}
                    </Button>



                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(moment)}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <Share2 className="w-4 h-4" />
                      {moment.stats.shares}
                    </Button>

                    <div className="ml-auto">
                      <Link
                        href={`/shared/${btoa(JSON.stringify({ song: moment.song, highlights: [{ ...moment.highlight, id: "1", startIndex: 0, endIndex: moment.highlight.text.length }] })).slice(0, 12)}`}
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" size="lg">
              Load More Moments
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
