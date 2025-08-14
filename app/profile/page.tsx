"use client"

import { useState, useEffect } from "react"
import { Settings, Edit3, Music } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { MomentCard } from "@/components/moment-card"

interface UserProfile {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  stats: {
    moments: number
    followers: number
    following: number
  }
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

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userMoments, setUserMoments] = useState<SharedMoment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { getCurrentUser, getUserMoments } = await import('@/lib/api')
        
        // Load user profile
        const userResponse = await getCurrentUser()
        if (userResponse.success) {
          const userData = userResponse.data
          setUser({
            id: userData.id,
            name: userData.name,
            username: userData.username,
            avatar: userData.avatar,
            bio: userData.bio || '',
            stats: userData.stats
          })
        }

        // Load user moments
        const momentsResponse = await getUserMoments(userResponse.data?.id || 'current-user')
        if (momentsResponse.success) {
          setUserMoments(momentsResponse.data)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b px-4 py-4">
          <h1 className="text-xl font-bold text-center">🎵 SongDash</h1>
        </div>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="w-32 h-6 bg-gray-200 rounded mb-2"></div>
                <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-48 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="flex gap-4 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center">
                  <div className="w-12 h-6 bg-gray-200 rounded mb-1"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">👤</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile not found</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">🎵 SongDash</h1>
          <Button variant="ghost" size="sm">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full bg-gray-200 object-cover"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600 mb-2">{user.username}</p>
              <p className="text-sm text-gray-700">{user.bio}</p>
            </div>
            <Button variant="outline" size="sm">
              <Edit3 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{user.stats.moments}</p>
              <p className="text-sm text-gray-600">Moments</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{user.stats.followers}</p>
              <p className="text-sm text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{user.stats.following}</p>
              <p className="text-sm text-gray-600">Following</p>
            </div>
          </div>
        </div>

        {/* User Moments */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Your Moments</h3>
          </div>

          {userMoments.length > 0 ? (
            <div className="space-y-4">
              {userMoments.map((moment) => (
                <MomentCard key={moment.id} moment={moment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No moments yet</h3>
              <p className="text-gray-500 mb-4">Share your first song moment!</p>
              <Button>Create Moment</Button>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}