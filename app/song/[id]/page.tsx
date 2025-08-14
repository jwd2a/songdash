"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

import { Song, HighlightedSection } from "@/lib/types"

export default function SongDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [song, setSong] = useState<Song | null>(null)
  const [generalNote, setGeneralNote] = useState("")
  const [selectedText, setSelectedText] = useState("")
  const [highlights, setHighlights] = useState<Omit<HighlightedSection, 'id' | 'createdAt'>[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadSong = async () => {
      try {
        const response = await fetch(`/api/songs/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setSong(data) // The API returns the song data directly
        } else {
          console.error('Failed to load song:', response.statusText)
        }
      } catch (error) {
        console.error('Error loading song:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSong()
  }, [params.id])

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
    }
  }

  const addHighlight = (note: string) => {
    if (selectedText && note.trim()) {
      const newHighlight = {
        text: selectedText,
        note: note.trim(),
        startIndex: 0, // In a real app, you'd calculate this based on selection
        endIndex: selectedText.length
      }
      setHighlights(prev => [...prev, newHighlight])
      setSelectedText("")
    }
  }

  const handleSaveMoment = async () => {
    if (!song || (!generalNote.trim() && highlights.length === 0)) {
      console.log('❌ Cannot save: missing song or content')
      return
    }

    console.log('🎵 Starting to save moment...')
    console.log('Song:', song)
    console.log('General note:', generalNote)
    console.log('Highlights:', highlights)

    setSaving(true)
    try {
      const requestBody = {
        songId: song.id,
        songTitle: song.title,
        songArtist: song.artist,
        songAlbum: song.album,
        songArtwork: song.artwork,
        songPlatforms: song.platforms,
        songDuration: song.duration,
        generalNote: generalNote.trim() || undefined,
        highlights,
        visibility: 'public'
      }

      console.log('📤 Sending request body:', requestBody)

      // Use the direct API route instead of the library function
      const response = await fetch('/api/moments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Success response:', data)
        setSaved(true)
        setShareUrl(data.shareUrl)
        // Don't auto-redirect, let user share first
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to save moment:', errorData)
        alert(`Failed to save moment: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('💥 Error saving moment:', error)
      alert(`Error saving moment: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
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
        <BottomNavigation />
      </div>
    )
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎵</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Song not found</h3>
          <Link href="/create">
            <Button>Back to Search</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/create">
            <Button variant="ghost" size="sm" className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-center flex-1">🎵 SongNote</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Song Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            {song.artwork ? (
              <img 
                src={song.artwork} 
                alt={`${song.title} by ${song.artist}`}
                className="w-16 h-16 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎵</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-gray-900 truncate">{song.title}</h2>
              <p className="text-gray-600 truncate">{song.artist}</p>
              <p className="text-sm text-gray-500 truncate">{song.album}</p>
            </div>
            <Button variant="outline" size="sm">
              Change
            </Button>
          </div>
        </div>

        {/* Note Input */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add a note (optional)
          </label>
          <Textarea
            placeholder="What do you love about this song?"
            value={generalNote}
            onChange={(e) => setGeneralNote(e.target.value)}
            className="min-h-[80px] resize-none border-gray-200"
          />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            Select text to highlight and add notes ✨
          </p>
        </div>

        {/* Lyrics */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-3 text-gray-900">Lyrics</h3>
          {song.lyrics ? (
            <div 
              className="whitespace-pre-line text-gray-800 leading-relaxed select-text"
              onMouseUp={handleTextSelection}
              onTouchEnd={handleTextSelection}
            >
              {song.lyrics}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-3xl mb-2">🎵</div>
              <p>Lyrics not available for this song</p>
              <p className="text-sm mt-1">You can still add notes and highlights!</p>
            </div>
          )}
        </div>

        {/* Selected Text Popup */}
        {selectedText && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-4 max-w-sm w-full">
              <h3 className="font-semibold mb-2">Add note to highlight</h3>
              <p className="text-sm text-gray-600 mb-3 italic">"{selectedText}"</p>
              <Textarea
                placeholder="Add your note..."
                className="mb-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    addHighlight(e.currentTarget.value)
                  }
                }}
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement
                    addHighlight(textarea?.value || "")
                  }}
                >
                  Add Highlight
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedText("")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-3">Your Highlights ({highlights.length})</h3>
            <div className="space-y-3">
              {highlights.map((highlight, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                  <blockquote className="text-sm italic text-blue-800 mb-1">
                    "{highlight.text}"
                  </blockquote>
                  <p className="text-xs text-gray-700">{highlight.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        {!saved && (
          <div className="pt-4">
            <Button 
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              disabled={(!generalNote.trim() && highlights.length === 0) || saving}
              onClick={handleSaveMoment}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Share Link...
                </>
              ) : (
                "Create Share Link"
              )}
            </Button>
          </div>
        )}

        {/* Share Interface */}
        {saved && shareUrl && (
          <div className="pt-4 space-y-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Share Link Created!</h3>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-green-200 mb-3">
                <p className="text-sm text-gray-600 mb-2">Share this link with friends:</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={shareUrl} 
                    readOnly 
                    className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 font-mono"
                  />
                  <Button 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl)
                      // Could add a toast notification here
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${song.title} by ${song.artist}`,
                        text: generalNote || `Check out this song moment I shared!`,
                        url: shareUrl
                      })
                    } else {
                      // Fallback for browsers without Web Share API
                      navigator.clipboard.writeText(shareUrl)
                    }
                  }}
                >
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => router.push('/')}
                >
                  Back to Feed
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Want to add this to the main feed too?
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  // TODO: Add to main feed functionality
                  console.log('Add to main feed')
                }}
              >
                Add to Public Feed
              </Button>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}