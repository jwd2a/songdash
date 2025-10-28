"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SocialFeed } from "@/components/social-feed"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Song } from "@/lib/types"

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

export default function FeedPage() {
  const [moments, setMoments] = useState<SharedMoment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

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
              comments: Math.floor(Math.random() * 20) + 1,
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

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
      if (response.ok) {
        const data = await response.json()
        // Transform Spotify API response to match our Song type
        const transformedResults: Song[] = data.results.map((result: any) => ({
          id: result.id,
          title: result.title,
          artist: result.artist,
          album: result.album,
          artwork: result.image,
          lyrics: '', // Will be fetched later if needed
          platforms: result.platforms,
          duration: result.duration,
          releaseDate: '' // Not provided by Spotify search
        }))
        setSearchResults(transformedResults)
      } else {
        console.error('Search failed:', response.statusText)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // If query is empty, clear results immediately
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    // Set new timeout for debounced search
    debounceRef.current = setTimeout(() => {
      performSearch(query)
    }, 300) // 300ms debounce delay
  }, [performSearch])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-40">
        <h1 className="text-xl font-bold text-center">🎵 SongDash</h1>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Search Container */}
        <div className="relative mb-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <Input
              type="text"
              placeholder="Search for a song to share..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 py-3 text-base bg-white border-gray-200 rounded-lg relative z-10"
            />
          </div>

          {/* Search Results Overlay */}
          {(isSearching || searchResults.length > 0 || (searchQuery && searchResults.length === 0)) && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50">
              <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-h-[60vh] overflow-y-auto">
                {/* Loading State */}
                {isSearching && (
                  <div className="space-y-3 p-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-lg p-4 animate-pulse border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="w-24 h-3 bg-gray-200 rounded mb-1"></div>
                            <div className="w-28 h-3 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search Results */}
                {!isSearching && searchResults.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 px-2">Search Results</h3>
                    <div className="space-y-2">
                      {searchResults.map((song, index) => (
                        <Link key={song.id} href={`/song/${song.id}`}>
                          <div
                            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200 cursor-pointer animate-in slide-in-from-top-2"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                <span className="text-lg">🎵</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{song.title}</p>
                                <p className="text-sm text-gray-600 truncate">{song.artist}</p>
                                <p className="text-xs text-gray-500 truncate">{song.album}</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {!isSearching && searchQuery && searchResults.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No songs found</h3>
                    <p className="text-gray-500">Try searching with different keywords</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Feed Section */}
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Shares</h2>
            <p className="text-gray-600">Discover what your friends are listening to</p>
          </div>

          <SocialFeed moments={moments} />
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}