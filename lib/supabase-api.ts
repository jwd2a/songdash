// Real API functions using Supabase
import { supabase } from './supabase'
import { 
  User, 
  Song, 
  SharedMoment, 
  HighlightedSection,
  ApiResponse, 
  PaginatedResponse,
  CreateMomentRequest,
  UpdateMomentRequest,
  SearchSongsRequest
} from './types'

// Helper function to transform database rows to app types
function transformMomentFromDB(momentRow: any, userRow: any, songRow: any, highlights: any[], likesCount: number, isLikedByUser: boolean): SharedMoment {
  return {
    id: momentRow.id,
    user: {
      id: userRow.id,
      name: userRow.name,
      username: userRow.username,
      avatar: userRow.avatar || '/placeholder.svg',
      email: userRow.email,
      bio: userRow.bio || '',
      stats: { moments: 0, followers: 0, following: 0 }, // TODO: Calculate these
      createdAt: userRow.created_at,
      updatedAt: userRow.updated_at
    },
    song: {
      id: songRow.id,
      title: songRow.title,
      artist: songRow.artist,
      album: songRow.album,
      artwork: songRow.artwork || '/placeholder.svg',
      lyrics: songRow.lyrics || '',
      platforms: {
        spotify: songRow.spotify_url,
        appleMusic: songRow.apple_music_url,
        youtubeMusic: songRow.youtube_music_url
      },
      duration: songRow.duration,
      releaseDate: songRow.release_date
    },
    generalNote: momentRow.general_note,
    highlights: highlights.map(h => ({
      id: h.id,
      text: h.text,
      note: h.note,
      startIndex: h.start_index,
      endIndex: h.end_index,
      createdAt: h.created_at
    })),
    engagement: {
      likes: likesCount,
      shares: 0, // TODO: Implement shares
      isLikedByUser,
      isBookmarkedByUser: false // TODO: Implement bookmarks
    },
    visibility: momentRow.visibility,
    createdAt: momentRow.created_at,
    updatedAt: momentRow.updated_at
  }
}

// Feed API
export async function getFeed(page = 1, limit = 10, currentUserId?: string): Promise<PaginatedResponse<SharedMoment>> {
  try {
    const offset = (page - 1) * limit

    // Get moments with user and song data
    const { data: moments, error: momentsError, count } = await supabase
      .from('moments')
      .select(`
        *,
        users!inner(*),
        songs!inner(*),
        highlights(*),
        likes(count)
      `, { count: 'exact' })
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (momentsError) throw momentsError

    // Get like status for current user if provided
    const momentIds = moments?.map(m => m.id) || []
    let userLikes: string[] = []
    
    if (currentUserId && momentIds.length > 0) {
      const { data: likes } = await supabase
        .from('likes')
        .select('moment_id')
        .eq('user_id', currentUserId)
        .in('moment_id', momentIds)
      
      userLikes = likes?.map(l => l.moment_id) || []
    }

    const transformedMoments = moments?.map(moment => 
      transformMomentFromDB(
        moment,
        moment.users,
        moment.songs,
        moment.highlights || [],
        moment.likes?.[0]?.count || 0,

        userLikes.includes(moment.id)
      )
    ) || []

    return {
      data: transformedMoments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: offset + limit < (count || 0),
        hasPrev: page > 1
      },
      success: true
    }
  } catch (error) {
    console.error('Error fetching feed:', error)
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      },
      success: false,
      error: 'Failed to fetch feed'
    }
  }
}

// Song API
export async function searchSongs({ query, limit = 10, offset = 0 }: SearchSongsRequest): Promise<ApiResponse<Song[]>> {
  try {
    const { data: songs, error } = await supabase
      .from('songs')
      .select('*')
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%,album.ilike.%${query}%`)
      .range(offset, offset + limit - 1)

    if (error) throw error

    const transformedSongs = songs?.map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      artwork: song.artwork || '/placeholder.svg',
      lyrics: song.lyrics || '',
      platforms: {
        spotify: song.spotify_url,
        appleMusic: song.apple_music_url,
        youtubeMusic: song.youtube_music_url
      },
      duration: song.duration,
      releaseDate: song.release_date
    })) || []

    return {
      data: transformedSongs,
      success: true
    }
  } catch (error) {
    console.error('Error searching songs:', error)
    return {
      data: [],
      success: false,
      error: 'Failed to search songs'
    }
  }
}

export async function getSong(songId: string): Promise<ApiResponse<Song>> {
  try {
    const { data: song, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', songId)
      .single()

    if (error) throw error

    const transformedSong: Song = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      artwork: song.artwork || '/placeholder.svg',
      lyrics: song.lyrics || '',
      platforms: {
        spotify: song.spotify_url,
        appleMusic: song.apple_music_url,
        youtubeMusic: song.youtube_music_url
      },
      duration: song.duration,
      releaseDate: song.release_date
    }

    return {
      data: transformedSong,
      success: true
    }
  } catch (error) {
    console.error('Error fetching song:', error)
    return {
      data: {} as Song,
      success: false,
      error: 'Song not found'
    }
  }
}

// Moment API
export async function createMoment(request: CreateMomentRequest, userId: string): Promise<ApiResponse<SharedMoment>> {
  try {
    // Create the moment
    const { data: moment, error: momentError } = await supabase
      .from('moments')
      .insert({
        user_id: userId,
        song_id: request.songId,
        general_note: request.generalNote,
        visibility: request.visibility
      })
      .select()
      .single()

    if (momentError) throw momentError

    // Create highlights if any
    if (request.highlights.length > 0) {
      const highlightsToInsert = request.highlights.map(highlight => ({
        moment_id: moment.id,
        text: highlight.text,
        note: highlight.note,
        start_index: highlight.startIndex,
        end_index: highlight.endIndex
      }))

      const { error: highlightsError } = await supabase
        .from('highlights')
        .insert(highlightsToInsert)

      if (highlightsError) throw highlightsError
    }

    // Fetch the complete moment with related data
    const { data: completeMoment, error: fetchError } = await supabase
      .from('moments')
      .select(`
        *,
        users!inner(*),
        songs!inner(*),
        highlights(*)
      `)
      .eq('id', moment.id)
      .single()

    if (fetchError) throw fetchError

    const transformedMoment = transformMomentFromDB(
      completeMoment,
      completeMoment.users,
      completeMoment.songs,
      completeMoment.highlights || [],
      0, // New moment has 0 likes
      0, // New moment has 0 comments
      false // User hasn't liked their own moment
    )

    return {
      data: transformedMoment,
      success: true,
      message: 'Moment created successfully'
    }
  } catch (error) {
    console.error('Error creating moment:', error)
    return {
      data: {} as SharedMoment,
      success: false,
      error: 'Failed to create moment'
    }
  }
}

// Engagement API
export async function likeMoment(momentId: string, userId: string): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('moment_id', momentId)
      .single()

    let liked = false
    
    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('moment_id', momentId)
      
      if (error) throw error
      liked = false
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: userId, moment_id: momentId })
      
      if (error) throw error
      liked = true
    }

    // Get updated likes count
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('moment_id', momentId)

    return {
      data: { liked, likesCount: count || 0 },
      success: true
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return {
      data: { liked: false, likesCount: 0 },
      success: false,
      error: 'Failed to toggle like'
    }
  }
}

// User API
export async function getCurrentUser(userId: string): Promise<ApiResponse<User>> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error

    // Get user stats
    const { count: momentsCount } = await supabase
      .from('moments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const transformedUser: User = {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar || '/placeholder.svg',
      email: user.email,
      bio: user.bio || '',
      stats: {
        moments: momentsCount || 0,
        followers: 0, // TODO: Implement followers
        following: 0  // TODO: Implement following
      },
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }

    return {
      data: transformedUser,
      success: true
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return {
      data: {} as User,
      success: false,
      error: 'User not found'
    }
  }
}

export async function getUserMoments(userId: string, page = 1, limit = 10, currentUserId?: string): Promise<PaginatedResponse<SharedMoment>> {
  try {
    const offset = (page - 1) * limit

    const { data: moments, error: momentsError, count } = await supabase
      .from('moments')
      .select(`
        *,
        users!inner(*),
        songs!inner(*),
        highlights(*),
        likes(count)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (momentsError) throw momentsError

    // Get like status for current user if provided
    const momentIds = moments?.map(m => m.id) || []
    let userLikes: string[] = []
    
    if (currentUserId && momentIds.length > 0) {
      const { data: likes } = await supabase
        .from('likes')
        .select('moment_id')
        .eq('user_id', currentUserId)
        .in('moment_id', momentIds)
      
      userLikes = likes?.map(l => l.moment_id) || []
    }

    const transformedMoments = moments?.map(moment => 
      transformMomentFromDB(
        moment,
        moment.users,
        moment.songs,
        moment.highlights || [],
        moment.likes?.[0]?.count || 0,

        userLikes.includes(moment.id)
      )
    ) || []

    return {
      data: transformedMoments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: offset + limit < (count || 0),
        hasPrev: page > 1
      },
      success: true
    }
  } catch (error) {
    console.error('Error fetching user moments:', error)
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      },
      success: false,
      error: 'Failed to fetch user moments'
    }
  }
}