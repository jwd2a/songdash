"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { ArrowLeft, Share2, Plus, Edit3, Copy, Check, Loader2, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [noteText, setNoteText] = useState("")
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [generalNote, setGeneralNote] = useState("")
  const [lyrics, setLyrics] = useState<string>("")
  const [lyricsLoading, setLyricsLoading] = useState(true)
  const [lyricsError, setLyricsError] = useState<string | null>(null)
  const [shareLoading, setShareLoading] = useState(false)
  const lyricsRef = useRef<HTMLDivElement>(null)
  const [showHighlightNotification, setShowHighlightNotification] = useState(false)

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
  }, [])

  const removeHighlight = (highlightId: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== highlightId))
    setSelectedHighlight(null)
  }

  const addNoteToHighlight = (highlightId: string, note: string) => {
    setHighlights((prev) => prev.map((h) => (h.id === highlightId ? { ...h, note } : h)))
    setSelectedHighlight((prev) => (prev ? { ...prev, note } : null))
    setNoteText("")
  }

  // Auto-focus textarea when a highlight without a note is selected
  useEffect(() => {
    if (selectedHighlight && !selectedHighlight.note && noteTextareaRef.current) {
      setTimeout(() => {
        noteTextareaRef.current?.focus()
      }, 100)
    }
  }, [selectedHighlight])

  const generateShareUrl = async () => {
    setShareLoading(true)

    try {
      const highlightsWithNotes = highlights.filter((h) => h.note)

      const response = await fetch("/api/moments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          song,
          highlights: highlightsWithNotes,
          generalNote: generalNote.trim() || undefined,
          createdAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create share link")
      }

      const data = await response.json()
      setShareUrl(data.shareUrl)
      setShareDialogOpen(true)
    } catch (err) {
      console.error("Share error:", err)
      // Fallback to client-side generation if API fails
      const moment = {
        song,
        highlights: highlights.filter((h) => h.note),
        generalNote: generalNote.trim() || undefined,
        createdAt: new Date().toISOString(),
      }
      const momentId = btoa(JSON.stringify(moment)).slice(0, 12)
      const url = `${window.location.origin}/shared/${momentId}`
      setShareUrl(url)
      setShareDialogOpen(true)
    } finally {
      setShareLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

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

      elements.push(
        <mark
          key={`highlight-${highlight.id}`}
          className={`px-2 py-1 rounded-lg cursor-pointer transition-all hover:shadow-md relative ${
            hasNote
              ? "bg-pink-200 dark:bg-pink-900/50 hover:bg-pink-300 dark:hover:bg-pink-900/70"
              : "bg-violet-200 dark:bg-violet-900/50 hover:bg-violet-300 dark:hover:bg-violet-900/70"
          }`}
          onClick={() => setSelectedHighlight(highlight)}
        >
          {highlightedText}
          {hasNote && <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></span>}
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
          <Button
            onClick={generateShareUrl}
            disabled={shareLoading}
            size="sm"
            style={{ backgroundColor: "var(--violet-accent)" }}
            className="text-white hover:opacity-90 disabled:opacity-50"
          >
            {shareLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
            Share
          </Button>
        </div>
      </div>

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
            <div className="mb-12 text-center">
              <p className="text-lg text-muted-foreground">
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
        <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="max-w-4xl mx-auto p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">Highlighted Lyrics</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedHighlight(null)}>
                  <X className="w-4 h-4" />
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
                        className="text-destructive hover:text-destructive"
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
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => removeHighlight(selectedHighlight.id)}
                          className="text-destructive hover:text-destructive"
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
        </div>
      )}



      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share this song</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="general-note">Add a note about this song (optional):</Label>
                <Textarea
                  id="general-note"
                  placeholder="This song reminds me of summer nights..."
                  value={generalNote}
                  onChange={(e) => setGeneralNote(e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>

              {highlightsWithNotes.length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Also sharing:</p>
                  <p className="text-sm text-muted-foreground">
                    {highlightsWithNotes.length} highlighted lyric{highlightsWithNotes.length !== 1 ? "s" : ""} with
                    personal notes
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button onClick={copyToClipboard} variant="outline">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={copyToClipboard}
                style={{ backgroundColor: "var(--violet-accent)" }}
                className="text-white hover:opacity-90"
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
