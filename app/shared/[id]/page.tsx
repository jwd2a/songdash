"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Heart, Share2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EnhancedShareSection } from "@/components/enhanced-share-section"
import { IntegratedLyricsDisplay } from "@/components/integrated-lyrics-display"
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
    note: string | null
    startIndex: number
    endIndex: number
  }>
  created_at: string
  views: number
}

interface Song {
  id: string
  title: string
  artist: string
  album: string
  artwork: string
  lyrics?: string
  platforms: {
    spotify?: string
    appleMusic?: string
    youtubeMusic?: string
  }
  duration: string
}

export default function SharedMomentPage() {
  const params = useParams()
  const [moment, setMoment] = useState<SharedMoment | null>(null)
  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load moment data
        const momentResponse = await fetch(`/api/moments?id=${params.id}`)
        if (!momentResponse.ok) {
          if (momentResponse.status === 404) {
            setError("This shared moment could not be found.")
          } else {
            setError("Failed to load shared moment.")
          }
          return
        }

        const momentData = await momentResponse.json()
        setMoment(momentData)

        // Load song data with lyrics
        const songResponse = await fetch(`/api/songs/${momentData.song_id}`)
        if (songResponse.ok) {
          const songData = await songResponse.json()
          setSong(songData)
        }
        
        // Update document metadata dynamically
        document.title = `${momentData.song_title} by ${momentData.song_artist} - songdash.io`
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]')
        const description = momentData.general_note 
          ? `"${momentData.general_note}" - Check out this song moment on songdash.io`
          : `Check out "${momentData.song_title}" by ${momentData.song_artist} on songdash.io`
        
        if (metaDescription) {
          metaDescription.setAttribute('content', description)
        } else {
          const meta = document.createElement('meta')
          meta.name = 'description'
          meta.content = description
          document.head.appendChild(meta)
        }

        // Update OG tags
        const baseUrl = process.env.NODE_ENV === 'production' ? 'https://songdash.io' : window.location.origin
        const lyrics = momentData.highlights?.length > 0 ? momentData.highlights[0].text : ''
        
        const ogImageUrl = new URL(`${baseUrl}/api/og`)
        ogImageUrl.searchParams.set('title', momentData.song_title)
        ogImageUrl.searchParams.set('artist', momentData.song_artist)
        ogImageUrl.searchParams.set('lyrics', lyrics)
        ogImageUrl.searchParams.set('note', momentData.general_note || '')

        // Update or create OG meta tags
        const updateOrCreateMeta = (property: string, content: string) => {
          let meta = document.querySelector(`meta[property="${property}"]`)
          if (meta) {
            meta.setAttribute('content', content)
          } else {
            meta = document.createElement('meta')
            meta.setAttribute('property', property)
            meta.setAttribute('content', content)
            document.head.appendChild(meta)
          }
        }

        updateOrCreateMeta('og:title', `${momentData.song_title} by ${momentData.song_artist} - songdash.io`)
        updateOrCreateMeta('og:description', description)
        updateOrCreateMeta('og:image', ogImageUrl.toString())
        updateOrCreateMeta('og:url', window.location.href)
        updateOrCreateMeta('og:type', 'website')
        updateOrCreateMeta('og:site_name', 'songdash.io')
        
        // Update Twitter Card meta tags
        const updateOrCreateTwitterMeta = (name: string, content: string) => {
          let meta = document.querySelector(`meta[name="${name}"]`)
          if (meta) {
            meta.setAttribute('content', content)
          } else {
            meta = document.createElement('meta')
            meta.setAttribute('name', name)
            meta.setAttribute('content', content)
            document.head.appendChild(meta)
          }
        }

        updateOrCreateTwitterMeta('twitter:card', 'summary_large_image')
        updateOrCreateTwitterMeta('twitter:title', `${momentData.song_title} by ${momentData.song_artist} - songdash.io`)
        updateOrCreateTwitterMeta('twitter:description', description)
        updateOrCreateTwitterMeta('twitter:image', ogImageUrl.toString())
        updateOrCreateTwitterMeta('twitter:site', '@songdashio')
        
      } catch (error) {
        console.error('Error loading data:', error)
        setError("Failed to load shared moment.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
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
      <div className="min-h-screen bg-white">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 bg-gray-100 rounded-full animate-pulse"></div>
            <div className="w-9 h-9 bg-gray-100 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
          <div className="text-center space-y-4">
            <div className="w-32 h-32 bg-gray-100 rounded-xl mx-auto animate-pulse"></div>
            <div className="space-y-2">
              <div className="w-48 h-6 bg-gray-100 rounded mx-auto animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-100 rounded mx-auto animate-pulse"></div>
              <div className="w-40 h-3 bg-gray-100 rounded mx-auto animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-11 h-11 bg-gray-100 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !moment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6 px-6">
          <div className="text-6xl">🎵</div>
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-gray-900">
              {error || "Moment not found"}
            </h3>
            <p className="text-gray-600">
              This shared moment may have been removed or the link is invalid.
            </p>
          </div>
          <Link href="/create" className="inline-block">
            <span className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Create your own moment →
            </span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Link href="/create">
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <button 
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Song Info - Clean and centered */}
        <div className="text-center space-y-4">
          {moment.song_artwork ? (
            <img 
              src={moment.song_artwork} 
              alt={`${moment.song_title} by ${moment.song_artist}`}
              className="w-32 h-32 rounded-xl mx-auto object-cover shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-100 rounded-xl mx-auto flex items-center justify-center shadow-lg">
              <span className="text-4xl">🎵</span>
            </div>
          )}
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{moment.song_title}</h1>
            <p className="text-lg text-gray-600 mb-2">{moment.song_artist}</p>
            <p className="text-sm text-gray-500">{moment.song_album}</p>
          </div>

          {/* Platform Links - Minimal */}
          <div className="flex justify-center gap-3 flex-wrap">
            {moment.song_platforms.spotify && (
              <a href={moment.song_platforms.spotify} target="_blank" rel="noopener noreferrer"
                 className="px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                Spotify
              </a>
            )}
            {moment.song_platforms.appleMusic && (
              <a href={moment.song_platforms.appleMusic} target="_blank" rel="noopener noreferrer"
                 className="px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                Apple Music
              </a>
            )}
            {moment.song_platforms.youtubeMusic && (
              <a href={moment.song_platforms.youtubeMusic} target="_blank" rel="noopener noreferrer"
                 className="px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                YouTube Music
              </a>
            )}
          </div>
        </div>

        {/* Share Section - Minimal and centered */}
        <EnhancedShareSection
          title={moment.song_title}
          artist={moment.song_artist}
          url={window.location.href}
          description={moment.general_note || `Check out "${moment.song_title}" by ${moment.song_artist} - a song moment I discovered!`}
        />

        {/* General Note - Clean typography */}
        {moment.general_note && (
          <div className="text-center">
            <p className="text-gray-800 text-lg leading-relaxed italic">
              "{moment.general_note}"
            </p>
          </div>
        )}

        {/* Integrated Lyrics with Highlights */}
        {song?.lyrics && (
          <IntegratedLyricsDisplay
            lyrics={song.lyrics}
            highlights={moment.highlights}
            className="py-4"
          />
        )}

        {/* Fallback for when lyrics aren't available */}
        {!song?.lyrics && moment.highlights.length > 0 && (
          <div className="space-y-6">
            <p className="text-center text-sm text-gray-500 mb-4">
              Highlighted sections:
            </p>
            {moment.highlights.map((highlight) => (
              <div key={highlight.id} className="text-center space-y-2">
                <blockquote className="text-gray-900 text-lg leading-relaxed font-medium">
                  "{highlight.text}"
                </blockquote>
                {highlight.note && (
                  <p className="text-sm text-gray-600">{highlight.note}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Like Button - Minimal */}
        <div className="text-center pt-4">
          <button 
            onClick={() => {
              // TODO: Add like functionality
              console.log('Like moment')
            }}
            className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-105"
            title="Like This Moment"
          >
            <Heart className="w-6 h-6" />
          </button>
        </div>

        {/* Footer - Minimal */}
        <div className="text-center pt-8 border-t border-gray-100 space-y-3">
          <Link href="/create" className="inline-block">
            <span className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Create your own moment →
            </span>
          </Link>
          <p className="text-xs text-gray-400">
            Viewed {moment.views} times
          </p>
        </div>
      </div>
    </div>
  )
}