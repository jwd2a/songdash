/**
 * Utilities for handling song artwork with multiple fallback strategies
 */

interface SpotifyImage {
  url: string
  height: number
  width: number
}

export interface ArtworkSources {
  large: string    // 640x640 or larger
  medium: string   // 300x300
  small: string    // 64x64
  fallback: string // Generated or default fallback
}

/**
 * Extract the best artwork URLs from Spotify album images
 */
export function getOptimalArtwork(spotifyImages: SpotifyImage[] = []): ArtworkSources {
  // Sort images by size (largest first)
  const sortedImages = [...spotifyImages].sort((a, b) => b.width - a.width)
  
  const sources: ArtworkSources = {
    large: "/placeholder.svg",
    medium: "/placeholder.svg", 
    small: "/placeholder.svg",
    fallback: "/placeholder.svg"
  }

  // Find best image for each size
  for (const image of sortedImages) {
    if (image.width >= 600 && !sources.large.startsWith('http')) {
      sources.large = image.url
    }
    if (image.width >= 200 && image.width <= 400 && !sources.medium.startsWith('http')) {
      sources.medium = image.url
    }
    if (image.width <= 100 && !sources.small.startsWith('http')) {
      sources.small = image.url
    }
  }

  // Use largest available as fallback
  if (sortedImages.length > 0) {
    sources.fallback = sortedImages[0].url
    
    // Fill in missing sizes with available ones
    if (!sources.large.startsWith('http')) sources.large = sources.fallback
    if (!sources.medium.startsWith('http')) sources.medium = sources.fallback  
    if (!sources.small.startsWith('http')) sources.small = sources.fallback
  }

  return sources
}

/**
 * Generate a dynamic artwork URL using a service like Picsum or a gradient
 */
export function generateFallbackArtwork(songTitle: string, artistName: string): string {
  // Create a seed from song + artist for consistent artwork
  const seed = songTitle + artistName
  const hash = seed.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const artworkId = Math.abs(hash) % 1000
  
  // Use Picsum for consistent, beautiful placeholder images
  return `https://picsum.photos/seed/${artworkId}/640/640`
}

/**
 * Try multiple sources for artwork with fallbacks
 */
export async function fetchArtworkWithFallbacks(
  spotifyImages: SpotifyImage[] = [], 
  songTitle: string, 
  artistName: string
): Promise<ArtworkSources> {
  const artwork = getOptimalArtwork(spotifyImages)
  
  // If no Spotify images, generate fallback
  if (!artwork.large.startsWith('http')) {
    const generated = generateFallbackArtwork(songTitle, artistName)
    artwork.large = generated
    artwork.medium = generated  
    artwork.small = generated
    artwork.fallback = generated
  }

  return artwork
}

/**
 * Get appropriate artwork URL for a specific display size
 */
export function getArtworkForSize(sources: ArtworkSources, size: 'small' | 'medium' | 'large'): string {
  switch (size) {
    case 'small':
      return sources.small
    case 'medium': 
      return sources.medium
    case 'large':
      return sources.large
    default:
      return sources.fallback
  }
}

/**
 * Preload artwork to improve loading experience
 */
export function preloadArtwork(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject()
    img.src = url
  })
}

/**
 * Check if an artwork URL is valid and accessible
 */
export async function validateArtwork(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Enhanced artwork component props
 */
export interface ArtworkProps {
  sources: ArtworkSources
  alt: string
  className?: string
  size?: 'small' | 'medium' | 'large'
  loading?: 'lazy' | 'eager'
}
