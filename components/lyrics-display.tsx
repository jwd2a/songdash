"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { ArrowLeft, Edit3, Loader2, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShareSection } from "./share-section"
import { ShareURLGenerator } from "@/lib/share-url-generator"

interface Song {
  id: string
  title: string
  artist: string
  album: string
  image: string
  platforms: {
    spotify?: string
    appleMusic?: string
    youtubeMusic?: string
  }
}

interface HighlightedSection {
  id: string
  text: string
  startIndex: number
  endIndex: number
  note?: string
}

interface LyricsDisplayProps {
  song: Song
  onBack: () => void
}

export function LyricsDisplay({ song, onBack }: LyricsDisplayProps) {
  const [highlights, setHighlights] = useState<HighlightedSection[]>([])
  const [selectedHighlight, setSelectedHighlight] = useState<HighlightedSection | null>(null)
  const [activatedHighlight, setActivatedHighlight] = useState<HighlightedSection | null>(null)
  const [pendingHighlight, setPendingHighlight] = useState<HighlightedSection | null>(null)
  const [noteText, setNoteText] = useState("")
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null)
  const [shareUrl, setShareUrl] = useState("")
  const [generalNote, setGeneralNote] = useState("")
  const [lyrics, setLyrics] = useState<string>("")
  const [lyricsLoading, setLyricsLoading] = useState(true)
  const [lyricsError, setLyricsError] = useState<string | null>(null)

  const lyricsRef = useRef<HTMLDivElement>(null)
  const [showHighlightNotification, setShowHighlightNotification] = useState(false)
  
  // New state for prominent share functionality
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isUrlCopied, setIsUrlCopied] = useState(false)
  const shareUrlGeneratorRef = useRef<ShareURLGenerator>(new ShareURLGenerator())

  useEffect(() => {
    const fetchLyrics = async () => {
      setLyricsLoading(true)
      setLyricsError(null)

      try {
        const response = await fetch(
          `/api/lyrics?artist=${encodeURIComponent(song.artist)}&title=${encodeURIComponent(song.title)}`,
        )

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Lyrics not found for this song")
          }
          throw new Error("Failed to fetch lyrics")
        }

        const data = await response.json()
        setLyrics(data.lyrics || "Lyrics not available for this song.")
      } catch (err) {
        console.error("Lyrics error:", err)
        setLyricsError(err instanceof Error ? err.message : "Failed to load lyrics")
        setLyrics("")
      } finally {
        setLyricsLoading(false)
      }
    }

    fetchLyrics()
  }, [song.artist, song.title])

  // Add demo highlights when lyrics load so you can see the visual improvements
  useEffect(() => {
    if (lyrics && highlights.length === 0) {
      const demoHighlights = [
        {
          id: "demo-1",
          text: "love",
          note: "This word always hits different in songs 💕",
          startIndex: lyrics.toLowerCase().indexOf("love"),
          endIndex: lyrics.toLowerCase().indexOf("love") + 4,
          createdAt: new Date().toISOString()
        },
        {
          id: "demo-2", 
          text: "heart",
          note: "The emotion in this line gives me chills ❤️",  
          startIndex: lyrics.toLowerCase().indexOf("heart"),
          endIndex: lyrics.toLowerCase().indexOf("heart") + 5,
          createdAt: new Date().toISOString()
        },
        {
          id: "demo-3",
          text: "dream",
          note: "Dreams are what music is made of ✨",
          startIndex: lyrics.toLowerCase().indexOf("dream"),
          endIndex: lyrics.toLowerCase().indexOf("dream") + 5,
          createdAt: new Date().toISOString()
        }
      ].filter(highlight => highlight.startIndex !== -1) // Only add if the words exist

      if (demoHighlights.length > 0) {
        setHighlights(demoHighlights)
      }
    }
  }, [lyrics, highlights.length])

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const selectedText = selection.toString().trim()
    if (!selectedText) return

    const range = selection.getRangeAt(0)
    const lyricsElement = lyricsRef.current
    if (!lyricsElement || !lyricsElement.contains(range.commonAncestorContainer)) return

    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(lyricsElement)
    preCaretRange.setEnd(range.startContainer, range.startOffset)
    const startIndex = preCaretRange.toString().length

    const newHighlight: HighlightedSection = {
      id: Date.now().toString(),
      text: selectedText,
      startIndex,
      endIndex: startIndex + selectedText.length,
    }

    selection.removeAllRanges()
    setSelectedHighlight(newHighlight)
    // Don't add to highlights yet - wait for user to add note
  }, [])

  // State for managing selection flow
  const [isSelectionStable, setIsSelectionStable] = useState(false)
  const [stableSelection, setStableSelection] = useState<{text: string, range: Range} | null>(null)
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle stable text selection (after user finishes adjusting)
  const handleStableSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || !selection.toString().trim() || !lyrics) return

    const selectedText = selection.toString().trim()
    if (selectedText.length < 3) return

    // Check if selection is within lyrics
    if (!lyricsRef.current) return
    const range = selection.getRangeAt(0)
    if (!lyricsRef.current.contains(range.commonAncestorContainer)) return

    // Store stable selection info
    setStableSelection({
      text: selectedText,
      range: range.cloneRange()
    })
    setIsSelectionStable(true)
  }, [lyrics])

  // Track if we're likely on a touch device
  const isTouchDevice = useRef(false)

  // Debounced selection change handler (primarily for mobile)
  const handleSelectionChange = useCallback(() => {
    // Clear any existing timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current)
    }

    const selection = window.getSelection()
    
    // If no selection, clear states
    if (!selection || !selection.toString().trim()) {
      setIsSelectionStable(false)
      setStableSelection(null)
      return
    }

    // Reset stable state while selection is changing
    setIsSelectionStable(false)
    
    // Only use long timeout for touch devices (mobile gets the stable selection flow)
    // Desktop users get immediate response via mouse events
    if (isTouchDevice.current) {
      selectionTimeoutRef.current = setTimeout(() => {
        handleStableSelection()
      }, 1500) // 1.5 seconds for natural mobile selection adjustment
    }
  }, [handleStableSelection])

  // Create highlight from stable selection
  const createHighlightFromSelection = useCallback(() => {
    if (!stableSelection || !lyrics) return

    const startIndex = lyrics.indexOf(stableSelection.text)
    if (startIndex !== -1) {
      const newPendingHighlight: HighlightedSection = {
        id: 'pending-highlight',
        text: stableSelection.text,
        startIndex,
        endIndex: startIndex + stableSelection.text.length,
      }
      
      // Clear browser selection and show our styled highlight + action sheet
      window.getSelection()?.removeAllRanges()
      setPendingHighlight(newPendingHighlight)
      setSelectedHighlight(newPendingHighlight)
      setIsSelectionStable(false)
      setStableSelection(null)
    }
  }, [stableSelection, lyrics])

  // Desktop mouse selection handler (immediate response)
  const handleMouseSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || !selection.toString().trim() || !lyrics) return

    const selectedText = selection.toString().trim()
    if (selectedText.length < 3) return

    // Check if selection is within lyrics
    if (!lyricsRef.current) return
    const range = selection.getRangeAt(0)
    if (!lyricsRef.current.contains(range.commonAncestorContainer)) return

    // Find the text in lyrics and create pending highlight immediately (desktop)
    const startIndex = lyrics.indexOf(selectedText)
    if (startIndex !== -1) {
      const newPendingHighlight: HighlightedSection = {
        id: 'pending-highlight',
        text: selectedText,
        startIndex,
        endIndex: startIndex + selectedText.length,
      }
      
      // Clear browser selection and show our styled highlight + action sheet
      selection.removeAllRanges()
      setPendingHighlight(newPendingHighlight)
      setSelectedHighlight(newPendingHighlight)
      setIsSelectionStable(false)
      setStableSelection(null)
    }
  }, [lyrics])

  // Mouse event handler for desktop
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Don't interfere with existing highlights
    if (e.target instanceof HTMLElement && e.target.tagName === 'MARK') {
      return
    }

    // Short delay for desktop to ensure selection is complete
    setTimeout(() => {
      handleMouseSelection()
    }, 50)
  }, [handleMouseSelection])

  // Touch detection for mobile vs desktop behavior
  const handleTouchStart = useCallback(() => {
    isTouchDevice.current = true
  }, [])

  // Simple click handler for existing highlights
  const handleLyricsInteraction = useCallback((e: React.MouseEvent) => {
    // If clicking on an existing highlight, let that handler deal with it
    if (e.target instanceof HTMLElement && e.target.tagName === 'MARK') {
      return
    }
    
    // Clear pending states when clicking elsewhere
    setSelectedHighlight(null)
    setActivatedHighlight(null)
    setPendingHighlight(null)
    setNoteText("")
    setIsSelectionStable(false)
    setStableSelection(null)
  }, [])

  const handleLyricsClick = useCallback((e: React.MouseEvent) => {
    // If clicking on a highlight, let the highlight handler deal with it
    if (e.target instanceof HTMLElement && e.target.tagName === 'MARK') {
      return
    }
    
    // Clear states when clicking elsewhere
    setSelectedHighlight(null)
    setActivatedHighlight(null)
    setPendingHighlight(null)
    setNoteText("")
  }, [])

  const removeHighlight = (highlightId: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== highlightId))
    setSelectedHighlight(null)
    setActivatedHighlight(null)
    // Trigger share URL regeneration
    regenerateShareUrl()
  }

  const addNoteToHighlight = (highlightId: string, note: string) => {
    if (highlightId === 'pending-highlight' && pendingHighlight && note.trim()) {
      // Convert pending highlight to permanent highlight with note
      const newHighlight = {
        ...pendingHighlight,
        id: Date.now().toString(),
        note: note.trim(),
        createdAt: new Date().toISOString()
      }
      setHighlights((prev) => [...prev, newHighlight])
      setShowHighlightNotification(true)
      setTimeout(() => setShowHighlightNotification(false), 2000)
      setActivatedHighlight(newHighlight)
    } else {
      // Update existing highlight
      setHighlights((prev) => prev.map((h) => (h.id === highlightId ? { ...h, note } : h)))
      setActivatedHighlight((prev) => (prev ? { ...prev, note } : null))
    }
    
    // Clear all states
    setSelectedHighlight(null)
    setPendingHighlight(null)
    setNoteText("")
    // Trigger share URL regeneration
    regenerateShareUrl()
  }

  // Handle general note changes
  const handleGeneralNoteChange = useCallback((note: string) => {
    setGeneralNote(note)
    regenerateShareUrl()
  }, [])

  // Handle URL copying
  const handleCopyUrl = useCallback(() => {
    setIsUrlCopied(true)
    setTimeout(() => setIsUrlCopied(false), 2000)
  }, [])

  // Regenerate share URL when content changes
  const regenerateShareUrl = useCallback(() => {
    const generator = shareUrlGeneratorRef.current
    generator.generateShareURL(
      song,
      highlights,
      generalNote,
      (url) => {
        setShareUrl(url)
        setUrlError(null)
      },
      (error) => {
        setUrlError(error)
        setShareUrl("")
      },
      (loading) => {
        setIsGeneratingUrl(loading)
      }
    )
  }, [song, highlights, generalNote])

  // Auto-focus textarea when a new highlight is selected or editing existing one
  useEffect(() => {
    if ((selectedHighlight && !activatedHighlight) || (activatedHighlight && noteText !== "")) {
      setTimeout(() => {
        noteTextareaRef.current?.focus()
      }, 500) // Wait for slide-in animation
    }
  }, [selectedHighlight, activatedHighlight, noteText])

  // Generate initial share URL and regenerate when content changes
  useEffect(() => {
    regenerateShareUrl()
  }, [regenerateShareUrl])

  // Cleanup share URL generator on unmount
  useEffect(() => {
    return () => {
      shareUrlGeneratorRef.current.cancel()
    }
  }, [])

  // Selection change listener for natural mobile selection
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      // Clean up any pending timeout
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current)
      }
    }
  }, [handleSelectionChange])

  // Close panel when clicking outside lyrics area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((selectedHighlight || activatedHighlight || pendingHighlight) && lyricsRef.current && !lyricsRef.current.contains(event.target as Node)) {
        setSelectedHighlight(null)
        setActivatedHighlight(null)
        setPendingHighlight(null)
        setNoteText("")
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedHighlight, activatedHighlight, pendingHighlight])



  const renderLyricsWithHighlights = () => {
    // Combine permanent highlights with pending highlight
    const allHighlights = [...highlights]
    if (pendingHighlight) {
      allHighlights.push(pendingHighlight)
    }

    if (allHighlights.length === 0) {
      return lyrics.split("\n").map((line, index) => (
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
        const beforeText = lyrics.slice(lastIndex, highlight.startIndex)
        beforeText.split("\n").forEach((line, lineIndex) => {
          if (lineIndex > 0) elements.push(<br key={`br-${keyCounter++}`} />)
          if (line) elements.push(<span key={`text-${keyCounter++}`}>{line}</span>)
        })
      }

      const highlightedText = lyrics.slice(highlight.startIndex, highlight.endIndex)
      const hasNote = !!highlight.note
      const isActivated = activatedHighlight?.id === highlight.id
      const isPendingHighlight = highlight.id === 'pending-highlight'

      const handleHighlightClick = () => {
        if (!isPendingHighlight) {
          setSelectedHighlight(highlight)
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
              ? 'bg-pink-600 text-white shadow-pink-200 dark:shadow-pink-900'
              : isActivated && !hasNote
              ? 'bg-violet-600 text-white shadow-violet-200 dark:shadow-violet-900'
              : (hasNote || isPendingHighlight)
              ? 'bg-pink-200 dark:bg-pink-900/50 hover:bg-pink-300 dark:hover:bg-pink-900/70 text-gray-800 dark:text-pink-100'
              : 'bg-violet-200 dark:bg-violet-900/50 hover:bg-violet-300 dark:hover:bg-violet-900/70 text-gray-800 dark:text-violet-100'
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
    if (lastIndex < lyrics.length) {
      const remainingText = lyrics.slice(lastIndex)
      remainingText.split("\n").forEach((line, lineIndex) => {
        if (lineIndex > 0) elements.push(<br key={`br-final-${keyCounter++}`} />)
        if (line) elements.push(<span key={`text-final-${keyCounter++}`}>{line}</span>)
      })
    }

    return <div className="leading-relaxed">{elements}</div>
  }

  const highlightsWithNotes = highlights.filter((h) => h.note)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <img
                src={song.image || "/placeholder.svg"}
                alt={`${song.title} by ${song.artist}`}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="font-semibold text-foreground">{song.title}</h1>
                <p className="text-sm text-muted-foreground">{song.artist}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Share Section - Outside of lyrics container */}
      {!lyricsLoading && !lyricsError && (
        <div className="max-w-4xl mx-auto px-6">
          <ShareSection
            song={song}
            highlights={highlights}
            generalNote={generalNote}
            onGeneralNoteChange={handleGeneralNoteChange}
            shareUrl={shareUrl}
            onCopyUrl={handleCopyUrl}
            isUrlCopied={isUrlCopied}
            isGeneratingUrl={isGeneratingUrl}
            urlError={urlError}
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">
        {lyricsLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            <span className="ml-4 text-lg text-muted-foreground">Loading lyrics...</span>
          </div>
        ) : lyricsError ? (
          <Alert variant="destructive" className="my-12">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">{lyricsError}</AlertDescription>
          </Alert>
        ) : (
          <div>

            
            <div
              ref={lyricsRef}
              className="text-2xl leading-loose lyrics-selectable cursor-text text-center max-w-none relative"
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onClick={handleLyricsInteraction}
              style={{ 
                lineHeight: "2.8"
              }}
            >
              {renderLyricsWithHighlights()}
              
              {/* Add Note button for stable selections */}
              {isSelectionStable && stableSelection && (
                <div className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                  <Button
                    onClick={createHighlightFromSelection}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg border border-blue-500"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -120px)',
                      zIndex: 9999
                    }}
                  >
                    💭 Add Note
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showHighlightNotification && (
        <div className="fixed top-20 right-6 z-[80] animate-in slide-in-from-top-2 duration-300">
          <Card className="bg-violet-100 dark:bg-violet-900 border-violet-300 dark:border-violet-700 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                Highlight added! Click to edit.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {(selectedHighlight || activatedHighlight) && (
        <div className="fixed inset-x-0 bottom-0 z-[100] animate-in slide-in-from-bottom-2 duration-500 ease-out">
          <div className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-2xl rounded-t-3xl">
            <div className="max-w-4xl mx-auto">
              {activatedHighlight && activatedHighlight.note && !noteText ? (
                // Show existing note content
                <div 
                  className="p-8 cursor-pointer" 
                  onClick={() => {
                    setSelectedHighlight(null)
                    setActivatedHighlight(null)
                  }}
                >
                  <p className="text-lg text-foreground leading-relaxed">
                    {activatedHighlight.note}
                  </p>
                </div>
              ) : (
                // Show input for new highlight or editing
                <div className="p-6 space-y-3">
                  <Textarea
                    ref={noteTextareaRef}
                    placeholder="Add a note about these lyrics"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                    className="resize-none"
                    autoFocus={!!selectedHighlight && !activatedHighlight}
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        const targetHighlight = selectedHighlight || activatedHighlight
                        if (targetHighlight) {
                          addNoteToHighlight(targetHighlight.id, noteText)
                        }
                      }}
                      disabled={!noteText.trim()}
                      className="flex-1"
                    >
                      {(activatedHighlight?.note || selectedHighlight?.note) ? "Update" : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedHighlight(null)
                        setActivatedHighlight(null)
                        setNoteText("")
                      }}
                      className="flex-1"
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




    </div>
  )
}
