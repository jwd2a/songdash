"use client"

import { useState } from "react"
import { ArtworkSources, getArtworkForSize } from "@/lib/artwork-utils"

interface EnhancedArtworkProps {
  sources?: ArtworkSources
  fallbackUrl?: string
  alt: string
  className?: string
  size?: 'small' | 'medium' | 'large'
  loading?: 'lazy' | 'eager'
}

export function EnhancedArtwork({
  sources,
  fallbackUrl = "/placeholder.svg",
  alt,
  className = "",
  size = 'medium',
  loading = 'lazy'
}: EnhancedArtworkProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Determine the best artwork URL
  let artworkUrl: string
  if (sources) {
    artworkUrl = getArtworkForSize(sources, size)
  } else {
    artworkUrl = fallbackUrl
  }

  // If there was an error loading, fall back to placeholder
  if (hasError) {
    artworkUrl = fallbackUrl
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading skeleton */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-2xl">🎵</span>
        </div>
      )}
      
      {/* Main artwork */}
      <img
        src={artworkUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
      />

      {/* Fallback when no artwork available */}
      {hasError && artworkUrl === fallbackUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          <span className="text-4xl">🎵</span>
        </div>
      )}
    </div>
  )
}
