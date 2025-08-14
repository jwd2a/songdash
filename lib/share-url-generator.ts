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

interface ShareMoment {
  song: Song
  highlights: HighlightedSection[]
  generalNote?: string
  createdAt: string
}

export interface ShareURLGeneratorOptions {
  debounceMs?: number
  maxRetries?: number
  retryDelayMs?: number
}

export class ShareURLGenerator {
  private debounceTimer: NodeJS.Timeout | null = null
  private lastGeneratedContent: string | null = null
  private options: Required<ShareURLGeneratorOptions>

  constructor(options: ShareURLGeneratorOptions = {}) {
    this.options = {
      debounceMs: 500,
      maxRetries: 3,
      retryDelayMs: 1000,
      ...options
    }
  }

  /**
   * Generate a share URL with debouncing to prevent excessive API calls
   */
  async generateShareURL(
    song: Song,
    highlights: HighlightedSection[],
    generalNote: string,
    onSuccess: (url: string) => void,
    onError: (error: string) => void,
    onLoading: (loading: boolean) => void
  ): Promise<void> {
    // Create content hash to avoid regenerating identical content
    const contentHash = this.createContentHash(song, highlights, generalNote)
    
    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    // If content hasn't changed, don't regenerate
    if (contentHash === this.lastGeneratedContent) {
      return
    }

    // Set loading state
    onLoading(true)

    // Debounce the actual generation
    this.debounceTimer = setTimeout(async () => {
      try {
        const url = await this.performGeneration(song, highlights, generalNote)
        this.lastGeneratedContent = contentHash
        onSuccess(url)
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Failed to generate share URL')
      } finally {
        onLoading(false)
      }
    }, this.options.debounceMs)
  }

  /**
   * Perform the actual URL generation with retry logic
   */
  private async performGeneration(
    song: Song,
    highlights: HighlightedSection[],
    generalNote: string,
    attempt: number = 1
  ): Promise<string> {
    try {
      // Try API first
      const url = await this.generateViaAPI(song, highlights, generalNote)
      return url
    } catch (error) {
      console.warn(`Share URL generation attempt ${attempt} failed:`, error)
      
      if (attempt < this.options.maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.options.retryDelayMs))
        return this.performGeneration(song, highlights, generalNote, attempt + 1)
      }
      
      // Fall back to client-side generation
      console.log('Falling back to client-side URL generation')
      return this.generateClientSide(song, highlights, generalNote)
    }
  }

  /**
   * Generate URL via API
   */
  private async generateViaAPI(
    song: Song,
    highlights: HighlightedSection[],
    generalNote: string
  ): Promise<string> {
    const highlightsWithNotes = highlights.filter(h => h.note)
    
    const response = await fetch('/api/moments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        song,
        highlights: highlightsWithNotes,
        generalNote: generalNote.trim() || undefined,
        createdAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.shareUrl
  }

  /**
   * Generate URL client-side as fallback
   */
  private generateClientSide(
    song: Song,
    highlights: HighlightedSection[],
    generalNote: string
  ): string {
    const moment: ShareMoment = {
      song,
      highlights: highlights.filter(h => h.note),
      generalNote: generalNote.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    // Create a base64 encoded ID from the moment data
    const momentData = JSON.stringify(moment)
    const momentId = btoa(momentData).slice(0, 12)
    
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://songdash.io' : window.location.origin
    return `${baseUrl}/shared/${momentId}`
  }

  /**
   * Create a hash of the content to detect changes
   */
  private createContentHash(
    song: Song,
    highlights: HighlightedSection[],
    generalNote: string
  ): string {
    const content = {
      songId: song.id,
      highlights: highlights.filter(h => h.note).map(h => ({ id: h.id, note: h.note })),
      generalNote: generalNote.trim()
    }
    return JSON.stringify(content)
  }

  /**
   * Cancel any pending generation
   */
  cancel(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  /**
   * Reset the generator state
   */
  reset(): void {
    this.cancel()
    this.lastGeneratedContent = null
  }
}