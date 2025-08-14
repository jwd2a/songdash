"use client"

import { useState } from "react"
import { Heart, Share2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MomentCardProps {
  moment: {
    id: string
    user: {
      name: string
      username: string
      avatar: string
    }
    song: {
      title: string
      artist: string
      album: string
      artwork: string
    }
    generalNote?: string
    highlights: Array<{
      id: string
      text: string
      note?: string
    }>
    engagement: {
      likes: number
      isLikedByUser: boolean
    }
    createdAt: string
  }
  onLike?: (momentId: string) => void

  onShare?: (momentId: string) => void
}

export function MomentCard({ moment, onLike, onShare }: MomentCardProps) {
  const [showHighlights, setShowHighlights] = useState(false)

  const handleLike = async () => {
    onLike?.(moment.id)
  }



  const handleShare = () => {
    onShare?.(moment.id)
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 touch-manipulation hover:shadow-md transition-all duration-300 animate-in slide-in-from-bottom-4">
      {/* User Info */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={moment.user.avatar}
          alt={moment.user.name}
          className="w-10 h-10 rounded-full bg-gray-200 object-cover flex-shrink-0 transition-transform duration-200 hover:scale-105"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{moment.user.name}</p>
          <p className="text-xs text-gray-500">{moment.createdAt}</p>
        </div>
      </div>

      {/* General Note */}
      {moment.generalNote && (
        <p className="text-sm text-gray-800 mb-3 leading-relaxed">{moment.generalNote}</p>
      )}

      {/* Song Info */}
      <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
          <span className="text-lg">▶️</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{moment.song.title}</p>
          <p className="text-xs text-gray-600 truncate">{moment.song.artist}</p>
          <p className="text-xs text-gray-500 truncate">{moment.song.album}</p>
        </div>
      </div>

      {/* Highlighted Lyrics */}
      {moment.highlights.length > 0 && (
        <div className="mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHighlights(!showHighlights)}
            className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto font-normal"
          >
            Show highlighted lyrics ({moment.highlights.length})
            {showHighlights ? (
              <ChevronUp className="w-3 h-3 ml-1" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-1" />
            )}
          </Button>
          
          {showHighlights && (
            <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-300">
              {moment.highlights.map((highlight, index) => (
                <div 
                  key={highlight.id} 
                  className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200 animate-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <blockquote className="text-sm italic text-blue-800 mb-1">
                    "{highlight.text}"
                  </blockquote>
                  {highlight.note && (
                    <p className="text-xs text-gray-700">{highlight.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Engagement Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`flex items-center gap-1 text-sm p-2 h-auto min-h-[44px] touch-manipulation transition-all duration-200 ${
            moment.engagement.isLikedByUser 
              ? 'text-red-500 hover:text-red-600 scale-105' 
              : 'text-gray-500 hover:text-gray-700 hover:scale-105'
          }`}
          aria-label={`${moment.engagement.isLikedByUser ? 'Unlike' : 'Like'} this moment`}
        >
          <Heart className={`w-4 h-4 transition-all duration-200 ${
            moment.engagement.isLikedByUser 
              ? 'fill-current animate-pulse' 
              : 'hover:scale-110'
          }`} />
          <span className="transition-all duration-200">{moment.engagement.likes}</span>
        </Button>
        

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="ml-auto text-sm text-gray-500 hover:text-gray-700 p-2 h-auto min-h-[44px] touch-manipulation"
          aria-label="Share this moment"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}