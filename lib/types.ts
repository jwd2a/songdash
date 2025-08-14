// Core data models for the social music sharing app

export interface User {
  id: string
  name: string
  username: string
  avatar: string
  email: string
  bio?: string
  stats: {
    moments: number
    followers: number
    following: number
  }
  createdAt: string
  updatedAt: string
}

export interface Song {
  id: string
  title: string
  artist: string
  album: string
  artwork: string
  lyrics?: string
  platforms: {
    spotify?: string
    appleMusic?: string
    youtubeMusic?: string
  }
  duration?: number
  releaseDate?: string
}

export interface HighlightedSection {
  id: string
  text: string
  startIndex: number
  endIndex: number
  note?: string
  createdAt: string
}

export interface SharedMoment {
  id: string
  user: User
  song: Song
  generalNote?: string
  highlights: HighlightedSection[]
  engagement: {
    likes: number
    shares: number
    isLikedByUser: boolean
    isBookmarkedByUser: boolean
  }
  visibility: 'public' | 'followers' | 'private'
  createdAt: string
  updatedAt: string
}



export interface Like {
  id: string
  user: User
  momentId: string
  createdAt: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  success: boolean
  message?: string
}

// Form types
export interface CreateMomentRequest {
  songId: string
  generalNote?: string
  highlights: Omit<HighlightedSection, 'id' | 'createdAt'>[]
  visibility: 'public' | 'followers' | 'private'
}

export interface UpdateMomentRequest {
  generalNote?: string
  highlights?: Omit<HighlightedSection, 'id' | 'createdAt'>[]
  visibility?: 'public' | 'followers' | 'private'
}

export interface SearchSongsRequest {
  query: string
  limit?: number
  offset?: number
}

// UI State types
export interface FeedState {
  moments: SharedMoment[]
  loading: boolean
  error: string | null
  hasMore: boolean
  page: number
}

export interface ProfileState {
  user: User | null
  moments: SharedMoment[]
  loading: boolean
  error: string | null
}

export interface SearchState {
  query: string
  results: Song[]
  loading: boolean
  error: string | null
}