"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

import { Song } from "@/lib/types"
import { mockSongs } from "@/lib/mock-data"

// Client-side cache for search results
const searchCache = new Map<string, { data: Song[]; timestamp: number }>()
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

export default function CreatePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController | null>(null)

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      setError(null)
      return
    }

    const normalizedQuery = query.trim().toLowerCase()
    
    // Check cache first
    const cached = searchCache.get(normalizedQuery)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setSearchResults(cached.data)
      setIsSearching(false)
      setError(null)
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setIsSearching(true)
    setError(null)
    
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query.trim())}`,
        { 
          signal: abortControllerRef.current.signal,
          headers: {
            'Cache-Control': 'max-age=300' // 5 minutes browser cache
          }
        }
      )
      
      if (!response.ok) {
        if (response.status === 408) {
          throw new Error('Search timed out. Please try again.')
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment.')
        } else {
          throw new Error('Search failed. Please try again.')
        }
      }

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

      // Cache the results
      searchCache.set(normalizedQuery, {
        data: transformedResults,
        timestamp: Date.now()
      })

      setSearchResults(transformedResults)
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was cancelled, don't update state
        return
      }
      
      console.error('Search error:', error)
      setError(error instanceof Error ? error.message : 'Search failed')
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

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // If query is empty, clear results immediately
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      setError(null)
      return
    }

    // Set new timeout for debounced search
    debounceRef.current = setTimeout(() => {
      performSearch(query)
    }, 250) // Reduced debounce delay for better responsiveness
  }, [performSearch])

  // Cleanup timeout and abort controller on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Cleanup cache periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      for (const [key, value] of searchCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          searchCache.delete(key)
        }
      }
    }, 60 * 1000) // Cleanup every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-40">
        <h1 className="text-xl font-bold text-center">🎵 SongDash</h1>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Share a Song</h2>
          <p className="text-gray-600">Find a song to share with your friends</p>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search for a song..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 py-3 text-base bg-white border-gray-200 rounded-lg"
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={() => performSearch(searchQuery)}
              className="text-red-600 text-sm underline mt-1"
            >
              Try again
            </button>
          </div>
        )}

        {/* Search Results */}
        {isSearching && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
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

        {!isSearching && !error && searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map((song, index) => (
              <Link key={song.id} href={`/song/${song.id}`}>
                <div 
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.02] animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-110">
                      {song.artwork && song.artwork !== "/placeholder.svg" ? (
                        <img 
                          src={song.artwork} 
                          alt={`${song.title} artwork`}
                          className="w-12 h-12 rounded object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-lg">🎵</span>
                      )}
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
        )}

        {!isSearching && !error && searchQuery && searchResults.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No songs found</p>
            <p className="text-sm text-gray-400">Try different keywords or check spelling</p>
          </div>
        )}

        {/* Popular Songs - Show when no search query */}
        {!searchQuery && !isSearching && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Popular Songs</h3>
            <div className="space-y-3">
              {mockSongs.slice(0, 5).map((song, index) => (
                <Link key={song.id} href={`/song/${song.id}`}>
                  <div 
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.02] animate-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 100}ms` }}
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
      </div>

      <BottomNavigation />
    </div>
  )
}
