"use client"

import { useState } from "react"
import { Copy, Check, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface BottomSharePanelProps {
  isVisible: boolean
  shareUrl: string | null
  title: string
  artist: string
  onCreateShare?: () => void
  isCreating?: boolean
  className?: string
}

export function BottomSharePanel({
  isVisible,
  shareUrl,
  title,
  artist,
  onCreateShare,
  isCreating = false,
  className = ""
}: BottomSharePanelProps) {
  const [comment, setComment] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopyUrl = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handleNativeShare = () => {
    if (!shareUrl) return
    if (navigator.share) {
      navigator.share({
        title: `${title} by ${artist}`,
        text: comment || `Check out "${title}" by ${artist}!`,
        url: shareUrl
      })
    } else {
      handleCopyUrl()
    }
  }

  const handleShare = () => {
    if (onCreateShare) {
      onCreateShare(comment)
    }
  }

  if (!isVisible) return null

  return (
    <div className={`fixed inset-x-0 bottom-0 z-[1000] ${className}`}>
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {/* Comment textbox */}
          <div>
            <Textarea
              placeholder={`What do you love about "${title}"?`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full resize-none border-gray-200 rounded-lg text-sm"
              rows={2}
              maxLength={200}
            />
          </div>

          {shareUrl ? (
            /* After sharing: Show URL with copy/share buttons */
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-gray-700 truncate">
                    {shareUrl}
                  </p>
                </div>
                <Button
                  onClick={handleCopyUrl}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  {copySuccess ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={handleNativeShare}
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            /* Before sharing: Show share button */
            <Button
              onClick={handleShare}
              disabled={isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Share Link...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Song
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
