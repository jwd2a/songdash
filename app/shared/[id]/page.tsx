"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Heart, Share2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams } from "next/navigation"

interface SharedMoment {
  id: string
  song_id: string
  song_title: string
  song_artist: string
  song_album: string
  song_artwork: string
  song_platforms: {
    spotify?: string
    appleMusic?: string
    youtubeMusic?: string
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
  created_at: string
  views: number
}

export default function SharedMomentPage() {
  const params = useParams()
  const [moment, setMoment] = useState<SharedMoment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMoment = async () => {
      try {
        const response = await fetch(`/api/moments?id=${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setMoment(data)
        } else if (response.status === 404) {
          setError("This shared moment could not be found.")
        } else {
          setError("Failed to load shared moment.")
        }
      } catch (error) {
        console.error('Error loading moment:', error)
        setError("Failed to load shared moment.")
      } finally {
        setLoading(false)
      }
    }

    loadMoment()
  }, [params.id])

  const handleShare = () => {
    const shareUrl = window.location.href
    if (navigator.share) {
      navigator.share({
        title: `${moment?.song_title} by ${moment?.song_artist}`,
        text: moment?.general_note || `Check out this song moment!`,
        url: shareUrl
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      // Could add a toast notification here
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <h1 className="text-xl font-bold text-center flex-1">🎵 SongDash</h1>
          </div>
        </div>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="w-full h-20 bg-gray-200 rounded mb-4"></div>
            <div className="w-full h-32 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-full h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !moment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-4xl mb-4">🎵</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error || "Moment not found"}
          </h3>
          <p className="text-gray-600 mb-4">
            This shared moment may have been removed or the link is invalid.
          </p>
          <Link href="/create">
            <Button>Create Your Own</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/create">
            <Button variant="ghost" size="sm" className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-center flex-1">🎵 Shared Moment</h1>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Song Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            {moment.song_artwork ? (
              <img 
                src={moment.song_artwork} 
                alt={`${moment.song_title} by ${moment.song_artist}`}
                className="w-16 h-16 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎵</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-gray-900 truncate">{moment.song_title}</h2>
              <p className="text-gray-600 truncate">{moment.song_artist}</p>
              <p className="text-sm text-gray-500 truncate">{moment.song_album}</p>
            </div>
          </div>

          {/* Platform Links */}
          <div className="flex gap-2 flex-wrap">
            {moment.song_platforms.spotify && (
              <a href={moment.song_platforms.spotify} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Spotify
                </Button>
              </a>
            )}
            {moment.song_platforms.appleMusic && (
              <a href={moment.song_platforms.appleMusic} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Apple Music
                </Button>
              </a>
            )}
            {moment.song_platforms.youtubeMusic && (
              <a href={moment.song_platforms.youtubeMusic} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  YouTube Music
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* General Note */}
        {moment.general_note && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-2 text-gray-900">Note</h3>
            <p className="text-gray-800 leading-relaxed">{moment.general_note}</p>
          </div>
        )}

        {/* Highlights */}
        {moment.highlights.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-3 text-gray-900">
              Highlighted Lyrics ({moment.highlights.length})
            </h3>
            <div className="space-y-3">
              {moment.highlights.map((highlight) => (
                <div key={highlight.id} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                  <blockquote className="text-sm italic text-blue-800 mb-1">
                    "{highlight.text}"
                  </blockquote>
                  <p className="text-xs text-gray-700">{highlight.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share This Moment
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                // TODO: Add like functionality
                console.log('Like moment')
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Create Your Own */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 mb-2">
            Want to share your own song moments?
          </p>
          <Link href="/create">
            <Button variant="outline">
              Create Your Own Moment
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="text-center text-xs text-gray-500">
          Viewed {moment.views} times
        </div>
      </div>
    </div>
  )
}