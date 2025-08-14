// API functions for the social music sharing app
// Uses either Supabase or mock data based on environment configuration

import { 
  User, 
  Song, 
  SharedMoment, 
  ApiResponse, 
  PaginatedResponse,
  CreateMomentRequest,
  UpdateMomentRequest,
  SearchSongsRequest
} from './types'

// Import both implementations
import * as mockApi from './mock-api'
import * as supabaseApi from './supabase-api'

// Determine which API to use based on environment
const useSupabase = process.env.NEXT_PUBLIC_API_MODE === 'supabase'

// Current user ID for development (in real app, this would come from auth)
const CURRENT_USER_ID = '550e8400-e29b-41d4-a716-446655440003'

// Feed API
export async function getFeed(page = 1, limit = 10): Promise<PaginatedResponse<SharedMoment>> {
  if (useSupabase) {
    return supabaseApi.getFeed(page, limit, CURRENT_USER_ID)
  } else {
    return mockApi.getFeed(page, limit)
  }
}

// User API
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  if (useSupabase) {
    return supabaseApi.getCurrentUser(CURRENT_USER_ID)
  } else {
    return mockApi.getCurrentUser()
  }
}

export async function getUserProfile(userId: string): Promise<ApiResponse<User>> {
  if (useSupabase) {
    return supabaseApi.getCurrentUser(userId)
  } else {
    return mockApi.getUserProfile(userId)
  }
}

export async function getUserMoments(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<SharedMoment>> {
  if (useSupabase) {
    return supabaseApi.getUserMoments(userId, page, limit, CURRENT_USER_ID)
  } else {
    return mockApi.getUserMoments(userId, page, limit)
  }
}

// Song API
export async function searchSongs({ query, limit = 10, offset = 0 }: SearchSongsRequest): Promise<ApiResponse<Song[]>> {
  if (useSupabase) {
    return supabaseApi.searchSongs({ query, limit, offset })
  } else {
    return mockApi.searchSongs({ query, limit, offset })
  }
}

export async function getSong(songId: string): Promise<ApiResponse<Song>> {
  if (useSupabase) {
    return supabaseApi.getSong(songId)
  } else {
    return mockApi.getSong(songId)
  }
}

// Moment API
export async function createMoment(request: CreateMomentRequest): Promise<ApiResponse<SharedMoment>> {
  if (useSupabase) {
    return supabaseApi.createMoment(request, CURRENT_USER_ID)
  } else {
    return mockApi.createMoment(request)
  }
}

export async function updateMoment(momentId: string, request: UpdateMomentRequest): Promise<ApiResponse<SharedMoment>> {
  // TODO: Implement Supabase version
  return mockApi.updateMoment(momentId, request)
}

export async function deleteMoment(momentId: string): Promise<ApiResponse<void>> {
  // TODO: Implement Supabase version
  return mockApi.deleteMoment(momentId)
}

// Engagement API
export async function likeMoment(momentId: string): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
  if (useSupabase) {
    return supabaseApi.likeMoment(momentId, CURRENT_USER_ID)
  } else {
    return mockApi.likeMoment(momentId)
  }
}

export async function bookmarkMoment(momentId: string): Promise<ApiResponse<SharedMoment>> {
  // TODO: Implement Supabase version
  return mockApi.bookmarkMoment(momentId)
}