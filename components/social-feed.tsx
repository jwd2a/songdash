"use client"

import { useState, useEffect } from "react"
import { MomentCard } from "./moment-card"

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

interface SocialFeedProps {
  moments?: SharedMoment[]
  onLike?: (momentId: string) => void
  onComment?: (momentId: string) => void
  onShare?: (momentId: string) => void
}

export function SocialFeed({ moments: propMoments, onLike, onComment, onShare }: SocialFeedProps) {
  const [moments, setMoments] = useState<SharedMoment[]>(propMoments || [])
  const [loading, setLoading] = useState(!propMoments || propMoments.length === 0)

  useEffect(() => {
    if (propMoments && propMoments.length > 0) {
      // Use provided moments
      setMoments(propMoments)
      setLoading(false)
    } else if (propMoments && propMoments.length === 0) {
      // Empty array provided - no moments
      setMoments([])
      setLoading(false)
    } else {
      // No moments provided - load mock data
      const mockMoments: SharedMoment[] = [
        {
          id: "1",
          user: {
            name: "Alex Chen",
            username: "@alexchen",
            avatar: "/placeholder.svg"
          },
          song: {
            title: "Blinding Lights",
            artist: "The Weeknd",
            album: "After Hours",
            artwork: "/placeholder.svg"
          },
          generalNote: "This song always gets me hyped! Perfect for morning runs 🏃",
          highlights: [
            {
              id: "h1",
              text: "I can see the sun light up the sky",
              note: "Love this uplifting line"
            }
          ],
          engagement: {
            likes: 23,
            comments: 5,
            isLikedByUser: false
          },
          createdAt: "1h ago"
        },
        {
          id: "2",
          user: {
            name: "Sarah Kim",
            username: "@sarahkim",
            avatar: "/placeholder.svg"
          },
          song: {
            title: "Good 4 U",
            artist: "Olivia Rodrigo",
            album: "SOUR",
            artwork: "/placeholder.svg"
          },
          generalNote: "When you need to feel your feelings 💜",
          highlights: [
            {
              id: "h2",
              text: "Good for you, you're doing great out there without me",
              note: "This hits different"
            },
            {
              id: "h3",
              text: "I guess that therapist I found for you, she really helped",
              note: "So relatable"
            }
          ],
          engagement: {
            likes: 41,
            comments: 12,
            isLikedByUser: true
          },
          createdAt: "2h ago"
        }
      ]

      setTimeout(() => {
        setMoments(mockMoments)
        setLoading(false)
      }, 1000)
    }
  }, [propMoments])

  const handleLike = async (momentId: string) => {
    // Optimistic update
    setMoments(prev => prev.map(moment => 
      moment.id === momentId 
        ? {
            ...moment,
            engagement: {
              ...moment.engagement,
              isLikedByUser: !moment.engagement.isLikedByUser,
              likes: moment.engagement.isLikedByUser 
                ? moment.engagement.likes - 1 
                : moment.engagement.likes + 1
            }
          }
        : moment
    ))
    
    // Call the API
    try {
      const { likeMoment } = await import('@/lib/api')
      const response = await likeMoment(momentId)
      
      if (response.success) {
        // Update with actual server response
        setMoments(prev => prev.map(moment => 
          moment.id === momentId 
            ? {
                ...moment,
                engagement: {
                  ...moment.engagement,
                  isLikedByUser: response.data.liked,
                  likes: response.data.likesCount
                }
              }
            : moment
        ))
      }
    } catch (error) {
      console.error('Error liking moment:', error)
      // Revert optimistic update on error
      setMoments(prev => prev.map(moment => 
        moment.id === momentId 
          ? {
              ...moment,
              engagement: {
                ...moment.engagement,
                isLikedByUser: !moment.engagement.isLikedByUser,
                likes: moment.engagement.isLikedByUser 
                  ? moment.engagement.likes + 1 
                  : moment.engagement.likes - 1
              }
            }
          : moment
      ))
    }
    
    onLike?.(momentId)
  }

  const handleComment = (momentId: string) => {
    // For now, just call the callback
    onComment?.(momentId)
  }

  const handleShare = (momentId: string) => {
    const moment = moments.find(m => m.id === momentId)
    if (moment) {
      const shareText = `"${moment.highlights[0]?.text || moment.song.title}" - ${moment.song.artist}\n\n${moment.generalNote || ''}\n\nShared via SongDash`
      
      if (navigator.share) {
        navigator.share({
          title: `${moment.song.title} by ${moment.song.artist}`,
          text: shareText,
          url: process.env.NODE_ENV === 'production' ? 'https://songdash.io' : window.location.origin
        })
      } else {
        navigator.clipboard.writeText(shareText)
      }
    }
    onShare?.(momentId)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 animate-pulse animate-in fade-in duration-500" style={{ animationDelay: `${i * 200}ms` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="w-24 h-4 bg-gray-200 rounded mb-1"></div>
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="w-full h-16 bg-gray-200 rounded mb-3"></div>
            <div className="flex gap-4">
              <div className="w-12 h-6 bg-gray-200 rounded"></div>
              <div className="w-12 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (moments.length === 0) {
    return (
      <div className="text-center py-12 animate-in fade-in duration-500">
        <div className="text-6xl mb-4 animate-bounce">🎵</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No moments yet</h3>
        <p className="text-gray-500 mb-4">Be the first to share a song moment!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {moments.map((moment, index) => (
        <div
          key={moment.id}
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <MomentCard
            moment={moment}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        </div>
      ))}
    </div>
  )
}