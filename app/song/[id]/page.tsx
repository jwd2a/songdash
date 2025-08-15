"use client"

import { useState, useEffect, useRef } from "react"
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
  const [activatedHighlight, setActivatedHighlight] = useState<HighlightedSection | null>(null)
  const [pendingHighlight, setPendingHighlight] = useState<HighlightedSection | null>(null)
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
          
          // Add demo highlights so you can see the visual improvements immediately
          if (data.lyrics) {
            const demoHighlights = [
              {
                id: "demo-1",
                text: "love",
                note: "This word always hits different in songs 💕",
                startIndex: data.lyrics.toLowerCase().indexOf("love"),
                endIndex: data.lyrics.toLowerCase().indexOf("love") + 4,
                createdAt: new Date().toISOString()
              },
              {
                id: "demo-2", 
                text: "heart",
                note: "The emotion in this line gives me chills ❤️",
                startIndex: data.lyrics.toLowerCase().indexOf("heart"),
                endIndex: data.lyrics.toLowerCase().indexOf("heart") + 5,
                createdAt: new Date().toISOString()
              }
            ].filter(highlight => highlight.startIndex !== -1) // Only add if the words exist

            if (demoHighlights.length > 0) {
              setHighlights(demoHighlights)
            }
          }
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

  // State for current text selection
  const [currentSelection, setCurrentSelection] = useState<string>("")
  const [showAddButton, setShowAddButton] = useState(false)

  // Simple selection change handler - show button when there's a valid selection
  const handleSelectionChange = () => {
    const selection = window.getSelection()
    
    // If no selection, hide button
    if (!selection || !selection.toString().trim()) {
      setCurrentSelection("")
      setShowAddButton(false)
      return
    }

    const selectedText = selection.toString().trim()
    if (selectedText.length < 3) {
      setCurrentSelection("")
      setShowAddButton(false)
      return
    }

    // Check if selection is within our lyrics
    const lyricsContainer = document.querySelector('[data-lyrics-container]')
    if (!lyricsContainer) {
      setCurrentSelection("")
      setShowAddButton(false)
      return
    }

    try {
      const range = selection.getRangeAt(0)
      if (!lyricsContainer.contains(range.commonAncestorContainer)) {
        setCurrentSelection("")
        setShowAddButton(false)
        return
      }

      // Valid selection within lyrics - show the button
      setCurrentSelection(selectedText)
      setShowAddButton(true)
    } catch (error) {
      // Invalid range - hide button
      setCurrentSelection("")
      setShowAddButton(false)
    }
  }

  // Create highlight from current selection
  const createHighlightFromSelection = () => {
    if (!currentSelection || !song?.lyrics) return

    const startIndex = song.lyrics.indexOf(currentSelection)
    if (startIndex !== -1) {
      const newPendingHighlight: HighlightedSection = {
        id: 'pending-highlight',
        text: currentSelection,
        startIndex,
        endIndex: startIndex + currentSelection.length,
        createdAt: new Date().toISOString()
      }
      
      // Clear browser selection and show our styled highlight + action sheet
      window.getSelection()?.removeAllRanges()
      setPendingHighlight(newPendingHighlight)
      setSelectedText(currentSelection)
      setCurrentSelection("")
      setShowAddButton(false)
    }
  }

  // Handle clicks on lyrics area
  const handleLyricsClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.tagName === 'MARK') {
      return
    }
    
    // Clear states when clicking elsewhere (but don't interfere with native selection)
    setSelectedText("")
    setActivatedHighlight(null)
    setPendingHighlight(null)
  }

  const addHighlight = (note: string) => {
    if (pendingHighlight && note.trim()) {
      const newHighlight = {
        id: Date.now().toString(),
        text: pendingHighlight.text,
        note: note.trim(),
        startIndex: pendingHighlight.startIndex,
        endIndex: pendingHighlight.endIndex,
        createdAt: new Date().toISOString()
      }
      setHighlights(prev => [...prev, newHighlight])
      setActivatedHighlight(newHighlight)
    }
    
    // Clear all states
    setSelectedText("")
    setPendingHighlight(null)
  }

  // Simple selection change listener - works on both desktop and mobile
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [])

  const renderLyricsWithHighlights = () => {
    if (!song?.lyrics) return null

    // Combine permanent highlights with pending highlight
    const allHighlights = [...highlights]
    if (pendingHighlight) {
      allHighlights.push(pendingHighlight)
    }

    if (allHighlights.length === 0) {
      return song.lyrics.split("\n").map((line, index) => (
        <p key={index} className="mb-4 leading-relaxed">
          {line || "\u00A0"}
        </p>
      ))
    }

    // Sort highlights by start index
    const sortedHighlights = [...allHighlights].sort((a, b) => a.startIndex - b.startIndex)

    let lastIndex = 0
    const elements: React.ReactNode[] = []
    let keyCounter = 0

    sortedHighlights.forEach((highlight) => {
      // Add text before highlight
      if (highlight.startIndex > lastIndex) {
        const beforeText = song.lyrics!.slice(lastIndex, highlight.startIndex)
        beforeText.split("\n").forEach((line, lineIndex) => {
          if (lineIndex > 0) elements.push(<br key={`br-${keyCounter++}`} />)
          if (line) elements.push(<span key={`text-${keyCounter++}`}>{line}</span>)
        })
      }

      const highlightedText = song.lyrics!.slice(highlight.startIndex, highlight.endIndex)
      const hasNote = !!highlight.note
      const isActivated = activatedHighlight?.id === highlight.id
      const isPendingHighlight = highlight.id === 'pending-highlight'

      const handleHighlightClick = () => {
        if (!isPendingHighlight) {
          setActivatedHighlight(highlight)
        }
      }

      elements.push(
        <mark
          key={`highlight-${highlight.id}`}
          className={`
            highlight-mark px-3 py-2 cursor-pointer transition-all duration-300 ease-in-out relative
            ${isActivated 
              ? 'rounded-3xl shadow-lg transform -translate-y-1 z-10' 
              : 'rounded-2xl hover:shadow-md hover:-translate-y-0.5'
            }
            ${isActivated && hasNote
              ? 'bg-pink-600 text-white shadow-pink-200'
              : isActivated && !hasNote
              ? 'bg-violet-600 text-white shadow-violet-200'
              : (hasNote || isPendingHighlight)
              ? 'bg-pink-200 hover:bg-pink-300 text-gray-800'
              : 'bg-violet-200 hover:bg-violet-300 text-gray-800'
            }
          `}
          onClick={handleHighlightClick}
          style={{
            transformOrigin: 'center',
          }}
        >
          {highlightedText}
        </mark>,
      )

      lastIndex = highlight.endIndex
    })

    // Add remaining text
    if (lastIndex < song.lyrics!.length) {
      const remainingText = song.lyrics!.slice(lastIndex)
      remainingText.split("\n").forEach((line, lineIndex) => {
        if (lineIndex > 0) elements.push(<br key={`br-final-${keyCounter++}`} />)
        if (line) elements.push(<span key={`text-final-${keyCounter++}`}>{line}</span>)
      })
    }

    return <div className="leading-relaxed">{elements}</div>
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



        {/* Lyrics */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-3 text-gray-900">Lyrics</h3>
          {song.lyrics ? (
            <div 
              className="text-gray-800 leading-relaxed lyrics-selectable cursor-text relative"
              onClick={handleLyricsClick}
              data-lyrics-container
              style={{ 
                lineHeight: "2.2"
              }}
            >
              {renderLyricsWithHighlights()}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-3xl mb-2">🎵</div>
              <p>Lyrics not available for this song</p>
              <p className="text-sm mt-1">You can still add notes and highlights!</p>
            </div>
          )}
        </div>

        {/* Add Note button - shows when there's a valid selection */}
        {showAddButton && currentSelection && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
            <Button
              onClick={createHighlightFromSelection}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl border border-blue-500 rounded-full px-6 py-3"
            >
              💭 Add Note to "{currentSelection.length > 20 ? currentSelection.substring(0, 20) + '...' : currentSelection}"
            </Button>
          </div>
        )}



        {/* Action Sheet for Highlights */}
        {(selectedText || activatedHighlight) && (
          <div className="fixed inset-x-0 bottom-0 z-[100] animate-in slide-in-from-bottom-2 duration-500 ease-out">
            <div className="bg-white/98 backdrop-blur-lg border-t border-gray-200 shadow-2xl rounded-t-3xl">
              <div className="max-w-4xl mx-auto">
                {activatedHighlight && activatedHighlight.note && !selectedText ? (
                  // Show existing note content
                  <div 
                    className="p-8 cursor-pointer"
                    onClick={() => setActivatedHighlight(null)}
                  >
                    <p className="text-lg text-foreground leading-relaxed">
                      {activatedHighlight.note}
                    </p>
                  </div>
                ) : (
                  // Show input for new highlight
                  <div className="p-6 space-y-3">
                    <Textarea
                      placeholder="Add a note about these lyrics"
                      className="resize-none"
                      rows={3}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          addHighlight(e.currentTarget.value)
                        }
                      }}
                    />
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1"
                        onClick={(e) => {
                          const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement
                          addHighlight(textarea?.value || "")
                        }}
                      >
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedText("")
                          setActivatedHighlight(null)
                          setPendingHighlight(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Highlights Summary */}
        {highlights.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-3">Your Highlights ({highlights.length})</h3>
            <div className="space-y-3">
              {highlights.map((highlight, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-gradient-to-r from-violet-50 to-pink-50 rounded-xl border border-violet-200 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setActivatedHighlight(highlight)}
                >
                  <blockquote className="text-sm italic text-violet-800 mb-1">
                    "{highlight.text}"
                  </blockquote>
                  <p className="text-xs text-gray-700 line-clamp-2">{highlight.note}</p>
                  <div className="text-xs text-violet-500 mt-1">Tap to view</div>
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