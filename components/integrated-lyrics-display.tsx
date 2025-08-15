"use client"

import { useState } from "react"

interface Highlight {
  id: string
  text: string
  note: string | null
  startIndex: number
  endIndex: number
}

interface IntegratedLyricsDisplayProps {
  lyrics: string
  highlights: Highlight[]
  className?: string
}

export function IntegratedLyricsDisplay({ 
  lyrics, 
  highlights, 
  className = "" 
}: IntegratedLyricsDisplayProps) {
  const [activatedHighlight, setActivatedHighlight] = useState<Highlight | null>(null)

  if (!lyrics || !lyrics.trim()) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500 italic">Lyrics not available for this song</p>
      </div>
    )
  }

  const renderLyricsWithHighlights = () => {
    if (highlights.length === 0) {
      return lyrics.split("\n").map((line, index) => (
        <p key={index} className="mb-3 leading-relaxed text-gray-900">
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
          if (line) {
            elements.push(
              <span key={`text-${keyCounter++}`} className="text-gray-900">
                {line}
              </span>
            )
          }
        })
      }

      const highlightedText = lyrics.slice(highlight.startIndex, highlight.endIndex)
      const isActivated = activatedHighlight?.id === highlight.id

      // Handle multi-line highlights
      const highlightLines = highlightedText.split('\n')
      
      if (highlightLines.length > 1) {
        highlightLines.forEach((line, lineIndex) => {
          if (lineIndex > 0) elements.push(<br key={`br-${keyCounter++}`} />)
          if (line.trim()) {
            elements.push(
              <span
                key={`highlight-${highlight.id}-${lineIndex}`}
                className={`
                  bg-blue-100 text-blue-900 px-1 py-0.5 rounded cursor-pointer 
                  transition-all duration-200 hover:bg-blue-200 hover:shadow-sm
                  ${isActivated ? 'bg-blue-200 shadow-md' : ''}
                `}
                onClick={() => setActivatedHighlight(highlight)}
                title={highlight.note ? "Click to see note" : "Highlighted lyric"}
              >
                {line}
              </span>
            )
          }
        })
      } else {
        elements.push(
          <span
            key={`highlight-${highlight.id}`}
            className={`
              bg-blue-100 text-blue-900 px-1 py-0.5 rounded cursor-pointer 
              transition-all duration-200 hover:bg-blue-200 hover:shadow-sm
              ${isActivated ? 'bg-blue-200 shadow-md' : ''}
            `}
            onClick={() => setActivatedHighlight(highlight)}
            title={highlight.note ? "Click to see note" : "Highlighted lyric"}
          >
            {highlightedText}
          </span>
        )
      }

      lastIndex = highlight.endIndex
    })

    // Add remaining text after last highlight
    if (lastIndex < lyrics.length) {
      const remainingText = lyrics.slice(lastIndex)
      remainingText.split("\n").forEach((line, lineIndex) => {
        if (lineIndex > 0) elements.push(<br key={`br-${keyCounter++}`} />)
        if (line) {
          elements.push(
            <span key={`text-${keyCounter++}`} className="text-gray-900">
              {line}
            </span>
          )
        }
      })
    }

    return elements
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Lyrics with embedded highlights */}
        <div className="text-lg leading-relaxed font-medium text-center max-w-2xl mx-auto">
          {renderLyricsWithHighlights()}
        </div>

        {/* Highlight count indicator */}
        {highlights.length > 0 && (
          <p className="text-center text-sm text-gray-500 mt-6">
            {highlights.length} highlighted {highlights.length === 1 ? 'section' : 'sections'}
            {highlights.some(h => h.note) && ' • Tap highlights to see notes'}
          </p>
        )}
      </div>

      {/* Action Sheet for Highlight Notes - matches creation flow exactly */}
      {activatedHighlight && activatedHighlight.note && (
        <div 
          className="fixed inset-0 z-[100] animate-in fade-in-0 duration-300"
          onClick={() => setActivatedHighlight(null)}
        >
          <div className="fixed inset-x-0 bottom-0 animate-in slide-in-from-bottom-2 duration-500 ease-out">
            <div className="bg-white/98 backdrop-blur-lg border-t border-gray-200 shadow-2xl rounded-t-3xl">
              <div className="max-w-4xl mx-auto">
                <div 
                  className="p-8 cursor-pointer"
                  onClick={() => setActivatedHighlight(null)}
                >
                  <p className="text-lg text-gray-900 leading-relaxed">
                    {activatedHighlight.note}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
