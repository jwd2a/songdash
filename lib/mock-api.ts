// Mock API implementation for development
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
import { 
  mockUsers, 
  mockSongs, 
  mockMoments,
  getMockUser,
  getMockSong,
  getMockMoment,
  searchMockSongs,
  getMockUserMoments
} from './mock-data'

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Feed API
export async function getFeed(page = 1, limit = 10): Promise<PaginatedResponse<SharedMoment>> {
  await delay(500)
  
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedMoments = mockMoments.slice(startIndex, endIndex)
  
  return {
    data: paginatedMoments,
    pagination: {
      page,
      limit,
      total: mockMoments.length,
      totalPages: Math.ceil(mockMoments.length / limit),
      hasNext: endIndex < mockMoments.length,
      hasPrev: page > 1
    },
    success: true
  }
}

// User API
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  await delay(300)
  
  const currentUser = getMockUser('current-user')
  if (!currentUser) {
    return {
      data: {} as User,
      success: false,
      error: 'User not found'
    }
  }
  
  return {
    data: currentUser,
    success: true
  }
}

export async function getUserProfile(userId: string): Promise<ApiResponse<User>> {
  await delay(300)
  
  const user = getMockUser(userId)
  if (!user) {
    return {
      data: {} as User,
      success: false,
      error: 'User not found'
    }
  }
  
  return {
    data: user,
    success: true
  }
}

export async function getUserMoments(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<SharedMoment>> {
  await delay(400)
  
  const userMoments = getMockUserMoments(userId)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedMoments = userMoments.slice(startIndex, endIndex)
  
  return {
    data: paginatedMoments,
    pagination: {
      page,
      limit,
      total: userMoments.length,
      totalPages: Math.ceil(userMoments.length / limit),
      hasNext: endIndex < userMoments.length,
      hasPrev: page > 1
    },
    success: true
  }
}

// Song API
export async function searchSongs({ query, limit = 10, offset = 0 }: SearchSongsRequest): Promise<ApiResponse<Song[]>> {
  await delay(400)
  
  const results = searchMockSongs(query)
  const paginatedResults = results.slice(offset, offset + limit)
  
  return {
    data: paginatedResults,
    success: true
  }
}

export async function getSong(songId: string): Promise<ApiResponse<Song>> {
  await delay(300)
  
  const song = getMockSong(songId)
  if (!song) {
    return {
      data: {} as Song,
      success: false,
      error: 'Song not found'
    }
  }
  
  return {
    data: song,
    success: true
  }
}

// Moment API
export async function createMoment(request: CreateMomentRequest): Promise<ApiResponse<SharedMoment>> {
  await delay(600)
  
  const song = getMockSong(request.songId)
  const user = getMockUser('current-user')
  
  if (!song || !user) {
    return {
      data: {} as SharedMoment,
      success: false,
      error: 'Song or user not found'
    }
  }
  
  const newMoment: SharedMoment = {
    id: `moment-${Date.now()}`,
    user,
    song,
    generalNote: request.generalNote,
    highlights: request.highlights.map((highlight, index) => ({
      ...highlight,
      id: `highlight-${Date.now()}-${index}`,
      createdAt: new Date().toISOString()
    })),
    engagement: {
      likes: 0,
      comments: 0,
      shares: 0,
      isLikedByUser: false,
      isBookmarkedByUser: false
    },
    visibility: request.visibility,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Add to mock data (in real app, this would be saved to database)
  mockMoments.unshift(newMoment)
  
  return {
    data: newMoment,
    success: true,
    message: 'Moment created successfully'
  }
}

export async function updateMoment(momentId: string, request: UpdateMomentRequest): Promise<ApiResponse<SharedMoment>> {
  await delay(500)
  
  const momentIndex = mockMoments.findIndex(m => m.id === momentId)
  if (momentIndex === -1) {
    return {
      data: {} as SharedMoment,
      success: false,
      error: 'Moment not found'
    }
  }
  
  const updatedMoment = {
    ...mockMoments[momentIndex],
    ...request,
    updatedAt: new Date().toISOString()
  }
  
  mockMoments[momentIndex] = updatedMoment
  
  return {
    data: updatedMoment,
    success: true,
    message: 'Moment updated successfully'
  }
}

export async function deleteMoment(momentId: string): Promise<ApiResponse<void>> {
  await delay(400)
  
  const momentIndex = mockMoments.findIndex(m => m.id === momentId)
  if (momentIndex === -1) {
    return {
      data: undefined,
      success: false,
      error: 'Moment not found'
    }
  }
  
  mockMoments.splice(momentIndex, 1)
  
  return {
    data: undefined,
    success: true,
    message: 'Moment deleted successfully'
  }
}

// Engagement API
export async function likeMoment(momentId: string): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
  await delay(200)
  
  const momentIndex = mockMoments.findIndex(m => m.id === momentId)
  if (momentIndex === -1) {
    return {
      data: { liked: false, likesCount: 0 },
      success: false,
      error: 'Moment not found'
    }
  }
  
  const moment = mockMoments[momentIndex]
  const wasLiked = moment.engagement.isLikedByUser
  
  mockMoments[momentIndex] = {
    ...moment,
    engagement: {
      ...moment.engagement,
      isLikedByUser: !wasLiked,
      likes: wasLiked ? moment.engagement.likes - 1 : moment.engagement.likes + 1
    },
    updatedAt: new Date().toISOString()
  }
  
  return {
    data: { 
      liked: !wasLiked, 
      likesCount: mockMoments[momentIndex].engagement.likes 
    },
    success: true
  }
}

export async function bookmarkMoment(momentId: string): Promise<ApiResponse<SharedMoment>> {
  await delay(200)
  
  const momentIndex = mockMoments.findIndex(m => m.id === momentId)
  if (momentIndex === -1) {
    return {
      data: {} as SharedMoment,
      success: false,
      error: 'Moment not found'
    }
  }
  
  const moment = mockMoments[momentIndex]
  
  mockMoments[momentIndex] = {
    ...moment,
    engagement: {
      ...moment.engagement,
      isBookmarkedByUser: !moment.engagement.isBookmarkedByUser
    },
    updatedAt: new Date().toISOString()
  }
  
  return {
    data: mockMoments[momentIndex],
    success: true
  }
}