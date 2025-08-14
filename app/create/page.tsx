"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

import { Song } from "@/lib/types"
import { mockSongs } from "@/lib/mock-data"

export default function CreatePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

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

        {/* Search Results */}
        {isSearching && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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

        {!isSearching && searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map((song, index) => (
              <Link key={song.id} href={`/song/${song.id}`}>
                <div 
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.02] animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-110">
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
        )}

        {!isSearching && searchQuery && searchResults.length === 0 && (
          <div className="text-center py-12 animate-in fade-in duration-500">
            <div className="text-4xl mb-4 animate-pulse">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No songs found</h3>
            <p className="text-gray-500">Try searching with different keywords</p>
          </div>
        )}

        {!searchQuery && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Popular Songs</h3>
            {mockSongs.map((song) => (
              <Link key={song.id} href={`/song/${song.id}`}>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
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
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}
