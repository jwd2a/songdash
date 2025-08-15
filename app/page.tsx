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

  useEffect(() => {
    const fetchMoments = async () => {
      try {
        console.log('🔍 Fetching moments from API...')
        const response = await fetch('/api/moments')
        console.log('📡 API response status:', response.status)
        
        if (response.ok) {
          const apiMoments: ApiMoment[] = await response.json()
          console.log('📦 Raw API moments:', apiMoments)
          
          // Transform API moments to the format expected by SocialFeed
          const transformedMoments: SharedMoment[] = apiMoments.map((apiMoment, index) => ({
            id: apiMoment.id,
            user: {
              name: `User ${index + 1}`, // For now, use generic user names
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
              likes: Math.floor(Math.random() * 50) + 1, // Mock engagement data for now
              comments: Math.floor(Math.random() * 20), // Add comments count
              isLikedByUser: false
            },
            createdAt: new Date(apiMoment.created_at).toLocaleDateString()
          }))
          
          console.log('🔄 Transformed moments:', transformedMoments)
          setMoments(transformedMoments)
        } else {
          console.error('❌ Failed to fetch moments:', response.statusText)
        }
      } catch (error) {
        console.error('💥 Error fetching moments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMoments()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-16">
        <SocialFeed moments={moments} loading={loading} />
      </main>
      <BottomNavigation />
    </div>
  )
}
