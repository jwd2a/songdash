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

    setHighlights((prev) => [...prev, newHighlight])
    selection.removeAllRanges()

    setShowHighlightNotification(true)
    setTimeout(() => setShowHighlightNotification(false), 2000)
    setSelectedHighlight(newHighlight)
    setActivatedHighlight(newHighlight)
  }, [])

  const removeHighlight = (highlightId: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== highlightId))
    setSelectedHighlight(null)
    setActivatedHighlight(null)
    // Trigger share URL regeneration
    regenerateShareUrl()
  }

  const addNoteToHighlight = (highlightId: string, note: string) => {
    setHighlights((prev) => prev.map((h) => (h.id === highlightId ? { ...h, note } : h)))
    setSelectedHighlight((prev) => (prev ? { ...prev, note } : null))
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

  // Auto-focus textarea when a highlight without a note is selected
  useEffect(() => {
    if (selectedHighlight && !selectedHighlight.note && noteTextareaRef.current) {
      setTimeout(() => {
        noteTextareaRef.current?.focus()
      }, 100)
    }
  }, [selectedHighlight])

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



  const renderLyricsWithHighlights = () => {
    if (highlights.length === 0) {
      return lyrics.split("\n").map((line, index) => (
        <p key={index} className="mb-4 leading-relaxed">
          {line || "\u00A0"}
        </p>
      ))
    }

    // Sort highlights by start index
    const sortedHighlights = [...highlights].sort((a, b) => a.startIndex - b.startIndex)

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

      const handleHighlightClick = () => {
        setSelectedHighlight(highlight)
        setActivatedHighlight(highlight)
      }

      elements.push(
        <mark
          key={`highlight-${highlight.id}`}
          className={`
            px-3 py-2 cursor-pointer transition-all duration-300 ease-in-out relative
            ${isActivated 
              ? 'rounded-3xl shadow-lg transform -translate-y-1 z-10' 
              : 'rounded-2xl hover:shadow-md hover:-translate-y-0.5'
            }
            ${isActivated && hasNote
              ? 'bg-pink-600 text-white shadow-pink-200 dark:shadow-pink-900'
              : isActivated && !hasNote
              ? 'bg-violet-600 text-white shadow-violet-200 dark:shadow-violet-900'
              : hasNote
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
            <div className="mb-8 text-center">
              <p className="text-sm text-muted-foreground">
                Select any lyrics to highlight them and add your personal notes
              </p>
            </div>
            
            <div
              ref={lyricsRef}
              className="text-2xl leading-loose select-text cursor-text text-center max-w-none"
              onMouseUp={handleTextSelection}
              style={{ userSelect: "text", lineHeight: "2.8" }}
            >
              {renderLyricsWithHighlights()}
            </div>
          </div>
        )}
      </div>

      {showHighlightNotification && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-2 duration-300">
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

      {selectedHighlight && (
        <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom-2 duration-500 ease-out">
          <div className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-2xl rounded-t-3xl">
            <div className="max-w-4xl mx-auto p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                  ✨ Your Highlighted Lyrics
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedHighlight(null)
                    setActivatedHighlight(null)
                  }}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-lg italic text-foreground">"{selectedHighlight.text}"</p>
                </div>

              {selectedHighlight.note && !noteText ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Your note:</p>
                    <p className="text-base text-foreground bg-background p-4 rounded-lg border">
                      {selectedHighlight.note}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNoteText(selectedHighlight.note || "")
                        setTimeout(() => noteTextareaRef.current?.focus(), 100)
                      }}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Note
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => removeHighlight(selectedHighlight.id)}
                      className="text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Remove Highlight
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {selectedHighlight.note ? "Edit your note:" : "Add a personal note to this highlight:"}
                  </p>
                  <div className="space-y-3">
                    <Textarea
                      ref={noteTextareaRef}
                      placeholder="This makes me think of you! 💕"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={() => addNoteToHighlight(selectedHighlight.id, noteText)}
                        disabled={!noteText.trim()}
                        style={{ backgroundColor: "var(--violet-accent)" }}
                        className="text-white hover:opacity-90"
                      >
                        {selectedHighlight.note ? "Update Note" : "Save Note"}
                      </Button>
                      {selectedHighlight.note && (
                        <Button
                          variant="outline"
                          onClick={() => setNoteText("")}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => removeHighlight(selectedHighlight.id)}
                        className="text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        Remove Highlight
                      </Button>
                    </div>
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
