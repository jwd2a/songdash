"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface ShareSectionProps {
  song: Song
  highlights: HighlightedSection[]
  generalNote: string
  onGeneralNoteChange: (note: string) => void
  shareUrl: string
  onCopyUrl: () => void
  isUrlCopied: boolean
  isGeneratingUrl?: boolean
  urlError?: string | null
}

export function ShareSection({
  song,
  highlights,
  generalNote,
  onGeneralNoteChange,
  shareUrl,
  onCopyUrl,
  isUrlCopied,
  isGeneratingUrl = false,
  urlError = null,
}: ShareSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localNote, setLocalNote] = useState(generalNote)
  
  // Sync local note with prop changes
  useEffect(() => {
    setLocalNote(generalNote)
  }, [generalNote])
  
  const handleSaveNote = () => {
    onGeneralNoteChange(localNote)
    setIsEditing(false)
  }
  
  const handleCancelEdit = () => {
    setLocalNote(generalNote)
    setIsEditing(false)
  }
  
  const handleCopyClick = async () => {
    if (!shareUrl) return
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl)
        onCopyUrl()
      } else {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          document.execCommand('copy')
          onCopyUrl()
        } catch (err) {
          console.error('Copy fallback failed:', err)
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }
  
  const handleTextClick = () => {
    if (!isEditing) {
      setIsEditing(true)
    }
  }

  return (
    <div className="text-center space-y-4 py-6 border-b border-muted/20">
      {/* Note text - embedded naturally in the page */}
      {isEditing ? (
        <div className="max-w-md mx-auto">
          <textarea
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            placeholder="Add a personal note that I'm attaching to this song"
            className="w-full bg-transparent border-none outline-none text-center text-muted-foreground placeholder:text-muted-foreground resize-none text-sm leading-relaxed"
            rows={3}
            maxLength={200}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) handleSaveNote()
              if (e.key === 'Escape') handleCancelEdit()
            }}
            onBlur={handleSaveNote}
          />
        </div>
      ) : (
        <div 
          onClick={handleTextClick}
          className="max-w-md mx-auto cursor-text"
        >
          <p className={`text-sm leading-relaxed ${
            generalNote.trim() 
              ? 'text-foreground' 
              : 'text-muted-foreground'
          }`}>
            {generalNote.trim() || "Add a personal note that I'm attaching to this song"}
          </p>
        </div>
      )}
      
      {/* Share URL - visible and copyable */}
      {shareUrl && (
        <div className="max-w-lg mx-auto">
          <div 
            onClick={handleCopyClick}
            className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Share URL</p>
              <p className="text-sm font-mono text-foreground truncate">
                {shareUrl}
              </p>
            </div>
            <div className="flex-shrink-0">
              {isGeneratingUrl ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : isUrlCopied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
          {isUrlCopied && (
            <p className="text-xs text-green-600 mt-1">Link copied to clipboard!</p>
          )}
        </div>
      )}
      
      {/* Share button - prominent and always visible */}
      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={handleCopyClick}
          disabled={!shareUrl || isGeneratingUrl}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
        >
          {isGeneratingUrl ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : isUrlCopied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Link copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Share song
            </>
          )}
        </Button>
      </div>
    </div>
  )
}