import { NextResponse } from "next/server"

export interface ApiError {
  message: string
  code?: string
  statusCode: number
}

export function createErrorResponse(error: ApiError) {
  return NextResponse.json(
    { 
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }, 
    { status: error.statusCode }
  )
}

export function createSuccessResponse(data: any, statusCode: number = 200) {
  return NextResponse.json(
    {
      ...data,
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  )
}

export function validateMomentData(data: any): { isValid: boolean; error?: string } {
  if (!data.song) {
    return { isValid: false, error: "Song data is required" }
  }

  if (!data.song.id || !data.song.title || !data.song.artist) {
    return { isValid: false, error: "Song must have id, title, and artist" }
  }

  if (!Array.isArray(data.highlights)) {
    return { isValid: false, error: "Highlights must be an array" }
  }

  // Validate each highlight
  for (const highlight of data.highlights) {
    if (!highlight.id || !highlight.text) {
      return { isValid: false, error: "Each highlight must have id and text" }
    }
    
    if (typeof highlight.startIndex !== 'number' || typeof highlight.endIndex !== 'number') {
      return { isValid: false, error: "Highlight indices must be numbers" }
    }
    
    if (highlight.startIndex >= highlight.endIndex) {
      return { isValid: false, error: "Invalid highlight indices" }
    }
  }

  // Validate general note if provided
  if (data.generalNote && typeof data.generalNote !== 'string') {
    return { isValid: false, error: "General note must be a string" }
  }

  if (data.generalNote && data.generalNote.length > 1000) {
    return { isValid: false, error: "General note too long (max 1000 characters)" }
  }

  return { isValid: true }
}

export function sanitizeMomentData(data: any) {
  return {
    song: {
      id: data.song.id,
      title: data.song.title.trim(),
      artist: data.song.artist.trim(),
      album: data.song.album?.trim() || '',
      image: data.song.image || '',
      platforms: data.song.platforms || {}
    },
    highlights: data.highlights
      .filter((h: any) => h.note && h.note.trim()) // Only include highlights with notes
      .map((h: any) => ({
        id: h.id,
        text: h.text.trim(),
        startIndex: h.startIndex,
        endIndex: h.endIndex,
        note: h.note.trim()
      })),
    generalNote: data.generalNote?.trim() || undefined,
    createdAt: data.createdAt || new Date().toISOString()
  }
}

export function generateMomentId(): string {
  // Generate a more secure random ID
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>()
  
  constructor(
    private windowMs: number = 60 * 1000, // 1 minute
    private maxRequests: number = 30
  ) {}

  isAllowed(clientId: string): boolean {
    const now = Date.now()
    const clientData = this.requests.get(clientId)
    
    if (!clientData || now > clientData.resetTime) {
      this.requests.set(clientId, { count: 1, resetTime: now + this.windowMs })
      return true
    }
    
    if (clientData.count >= this.maxRequests) {
      return false
    }
    
    clientData.count++
    return true
  }

  cleanup(): void {
    const now = Date.now()
    for (const [clientId, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(clientId)
      }
    }
  }
}