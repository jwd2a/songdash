"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SocialFeed } from "@/components/social-feed"

interface ApiMoment {
  id: string
  song_id: string
  song_title: string
  song_artist: string
  song_album: string
  song_artwork: string
  song_platforms: {
    spotify?: string
    appleMusic?: string
  }
  song_duration: string
  general_note?: string
  highlights: Array<{
    id: string
    text: string
    note: string
    startIndex: number
    endIndex: number
  }>
  views: number
  created_at: string
  last_updated: string
  last_accessed: string | null
}

interface SharedMoment {
  id: string
  user: {
    name: string
    username: string
    avatar: string
  }
  song: {
    title: string
    artist: string
    album: string
    artwork: string
  }
  generalNote?: string
  highlights: Array<{
    id: string
    text: string
    note?: string
  }>
  engagement: {
    likes: number
    comments: number
    isLikedByUser: boolean
  }
  createdAt: string
}

export default function HomePage() {
  const router = useRouter()
  const [moments, setMoments] = useState<SharedMoment[]>([])
  const [loading, setLoading] = useState(true)

  // One-time initial focus on Share tab per session
  useEffect(() => {
    try {
      const flagKey = "songdash.initialFocusSet"
      if (typeof window !== "undefined" && !sessionStorage.getItem(flagKey)) {
        sessionStorage.setItem(flagKey, "1")
        router.push('/create')
      }
    } catch {
      // Ignore sessionStorage errors and continue without redirect
    }
  }, [router])

  useEffect(() => {
    const fetchMoments = async () => {
      try {
        const response = await fetch('/api/moments')
        if (response.ok) {
          const apiMoments: ApiMoment[] = await response.json()
          const transformedMoments: SharedMoment[] = apiMoments.map((apiMoment, index) => ({
            id: apiMoment.id,
            user: {
              name: `User ${index + 1}`,
              username: `@user${index + 1}`,
              avatar: "/placeholder.svg"
            },
            song: {
              title: apiMoment.song_title,
              artist: apiMoment.song_artist,
              album: apiMoment.song_album,
              artwork: apiMoment.song_artwork
            },
            generalNote: apiMoment.general_note,
            highlights: apiMoment.highlights.map(h => ({
              id: h.id,
              text: h.text,
              note: h.note
            })),
            engagement: {
              likes: Math.floor(Math.random() * 50) + 1,
              comments: Math.floor(Math.random() * 20),
              isLikedByUser: false
            },
            createdAt: new Date(apiMoment.created_at).toLocaleDateString()
          }))
          setMoments(transformedMoments)
        } else {
          setMoments([])
          // eslint-disable-next-line no-console
          console.error('Failed to fetch moments:', response.statusText)
        }
      } catch (error) {
        setMoments([])
        // eslint-disable-next-line no-console
        console.error('Error fetching moments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMoments()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-40">
        <h1 className="text-xl font-bold text-center">🎵 SongDash</h1>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <SocialFeed />
        ) : (
          <SocialFeed moments={moments} />
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}
