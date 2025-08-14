"use client"

import { useState, useEffect } from "react"
import { Heart, Share2, Music, Settings, Edit3, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UserProfile {
  name: string
  username: string
  avatar: string
  bio: string
  stats: {
    moments: number
    likes: number
    followers: number
    following: number
  }
  joinedDate: string
}

interface UserMoment {
  id: string
  song: {
    title: string
    artist: string
    image: string
  }
  highlight: {
    text: string
    note: string
  }
  stats: {
    likes: number
    shares: number
  }
  createdAt: string
  trending: boolean
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [moments, setMoments] = useState<UserMoment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockProfile: UserProfile = {
      name: "Alex Rivera",
      username: "@alexr",
      avatar: "/diverse-group.png",
      bio: "Music lover sharing the lyrics that move me ✨ Always finding new songs to obsess over",
      stats: {
        moments: 47,
        likes: 2834,
        followers: 892,
        following: 234,
      },
      joinedDate: "March 2024",
    }

    const mockMoments: UserMoment[] = [
      {
        id: "1",
        song: {
          title: "Anti-Hero",
          artist: "Taylor Swift",
          image: "/anti-hero-album-cover.png",
        },
        highlight: {
          text: "It's me, hi, I'm the problem, it's me",
          note: "This song perfectly captures my overthinking brain at 3am",
        },
        stats: { likes: 156, shares: 23 },
        createdAt: "2 days ago",
        trending: true,
      },
      {
        id: "2",
        song: {
          title: "Flowers",
          artist: "Miley Cyrus",
          image: "/generic-woman-floral-album.png",
        },
        highlight: {
          text: "I can buy myself flowers, write my name in the sand",
          note: "Self-love anthem! Learning to celebrate myself 💪",
        },
        stats: { likes: 89, shares: 12 },
        createdAt: "1 week ago",
        trending: false,
      },
      {
        id: "3",
        song: {
          title: "As It Was",
          artist: "Harry Styles",
          image: "/harry-styles-as-it-was-inspired-cover.png",
        },
        highlight: {
          text: "In this world, it's just us, you know it's not the same as it was",
          note: "Missing the simplicity of childhood friendships",
        },
        stats: { likes: 234, shares: 45 },
        createdAt: "2 weeks ago",
        trending: false,
      },
    ]

    setTimeout(() => {
      setProfile(mockProfile)
      setMoments(mockMoments)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="animate-pulse">
              <CardContent className="p-8">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="w-32 h-6 bg-muted rounded mb-2"></div>
                    <div className="w-24 h-4 bg-muted rounded mb-4"></div>
                    <div className="w-full h-4 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="text-center">
                      <div className="w-8 h-6 bg-muted rounded mx-auto mb-1"></div>
                      <div className="w-12 h-4 bg-muted rounded mx-auto"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-6 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
                    <Button variant="outline" size="sm">
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit Profile
                    </Button>
                  </div>
                  <p className="text-muted-foreground mb-3">{profile.username}</p>
                  <p className="text-foreground">{profile.bio}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Joined {profile.joinedDate}
                  </div>
                </div>

                <Button variant="outline">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">{profile.stats.moments}</p>
                  <p className="text-sm text-muted-foreground">Moments</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{profile.stats.likes.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Likes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{profile.stats.followers}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{profile.stats.following}</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="moments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="moments">My Moments</TabsTrigger>
              <TabsTrigger value="liked">Liked</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="moments" className="space-y-4">
              {moments.map((moment) => (
                <Card key={moment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={moment.song.image || "/placeholder.svg"}
                        alt={`${moment.song.title} by ${moment.song.artist}`}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{moment.song.title}</p>
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
                          {moment.song.artist} • {moment.createdAt}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-200 dark:border-pink-800">
                      <blockquote className="text-lg italic text-pink-700 dark:text-pink-300 mb-3 border-l-4 border-pink-300 dark:border-pink-700 pl-4">
                        "{moment.highlight.text}"
                      </blockquote>
                      <p className="text-sm text-foreground">{moment.highlight.note}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Heart className="w-4 h-4" />
                        {moment.stats.likes}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Share2 className="w-4 h-4" />
                        {moment.stats.shares}
                      </div>
                      <div className="ml-auto">
                        <Button variant="outline" size="sm">
                          <Music className="w-4 h-4 mr-1" />
                          Listen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="liked" className="space-y-4">
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No liked moments yet</h3>
                  <p className="text-muted-foreground">Start exploring and like moments that resonate with you</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Top Artists</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {["Taylor Swift", "Harry Styles", "Miley Cyrus"].map((artist, index) => (
                        <div key={artist} className="flex items-center justify-between">
                          <span className="text-foreground">
                            {index + 1}. {artist}
                          </span>
                          <Badge variant="secondary">{3 - index} moments</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Activity</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">This week</span>
                        <span className="text-foreground font-medium">3 moments</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">This month</span>
                        <span className="text-foreground font-medium">12 moments</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total likes received</span>
                        <span className="text-foreground font-medium">2,834</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
