import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { 
  createErrorResponse, 
  createSuccessResponse, 
  validateMomentData, 
  sanitizeMomentData, 
  generateMomentId,
  RateLimiter 
} from "@/lib/api-utils"

// Rate limiter instance
const rateLimiter = new RateLimiter(60 * 1000, 30) // 30 requests per minute

// In-memory cache for moments (in production, use Redis)
const momentCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

// Cleanup rate limiter and cache every 5 minutes
setInterval(() => {
  rateLimiter.cleanup()
  
  // Cleanup moment cache
  const now = Date.now()
  for (const [key, value] of momentCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      momentCache.delete(key)
    }
  }
}, 5 * 60 * 1000)

export async function POST(request: NextRequest) {
  console.log('🎵 POST /api/moments called')
  
  try {
    // Get client identifier for rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'unknown'
    console.log('👤 Client ID:', clientId)
    
    // Check rate limit
    if (!rateLimiter.isAllowed(clientId)) {
      return createErrorResponse({
        message: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429
      })
    }

    const body = await request.json()
    console.log('📝 Request body:', JSON.stringify(body, null, 2))

    // Validate the moment data
    const validation = validateMomentData(body)
    console.log('✅ Validation result:', validation)
    
    if (!validation.isValid) {
      return createErrorResponse({
        message: validation.error || 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400
      })
    }

    // Sanitize the data
    const sanitizedData = sanitizeMomentData(body)
    console.log('🧹 Sanitized data:', JSON.stringify(sanitizedData, null, 2))

    // Generate a unique moment ID
    const momentId = generateMomentId()
    console.log('🆔 Generated moment ID:', momentId)

    // Prepare the moment data for storage
    const momentData = {
      id: momentId,
      song_id: sanitizedData.songId,
      song_title: sanitizedData.songTitle,
      song_artist: sanitizedData.songArtist,
      song_album: sanitizedData.songAlbum,
      song_artwork: sanitizedData.songArtwork,
      song_platforms: sanitizedData.songPlatforms,
      song_duration: sanitizedData.songDuration,
      general_note: sanitizedData.generalNote,
      highlights: sanitizedData.highlights,
      views: 0,
      created_at: sanitizedData.createdAt,
      last_updated: new Date().toISOString(),
      last_accessed: null
    }

    console.log('💾 Storing moment in Supabase:', JSON.stringify(momentData, null, 2))

    // Store in Supabase (using shared_moments table which has the highlights column)
    const { data, error } = await supabase
      .from('shared_moments')
      .insert(momentData)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase insert error:', error)
      throw new Error(`Create moment error: ${JSON.stringify(error)}`)
    }

    console.log('✅ Moment created successfully:', data)

    // Cache the new moment
    momentCache.set(momentId, {
      data: data,
      timestamp: Date.now()
    })

    // Generate share URL
    const shareUrl = `${request.nextUrl.origin}/shared/${momentId}`
    console.log('🔗 Generated share URL:', shareUrl)

    // Return success response
    const response = {
      id: momentId,
      shareUrl,
      hasGeneralNote: !!sanitizedData.generalNote,
      highlightCount: sanitizedData.highlights?.length || 0,
      timestamp: new Date().toISOString()
    }

    console.log('✅ Returning success response:', response)
    return createSuccessResponse(response, 201)

  } catch (error) {
    console.error('❌ Error creating moment:', error)
    return createErrorResponse({
      message: error instanceof Error ? error.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500
    })
  }
}

export async function GET(request: NextRequest) {
  console.log('🔍 GET /api/moments called')
  
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (id) {
      console.log('🆔 Requested moment ID:', id)
      
      // Check cache first
      const cached = momentCache.get(id)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('✅ Returning cached moment')
        
        // Still update view count asynchronously
        supabase
          .from('shared_moments')
          .update({ 
            views: (cached.data.views || 0) + 1,
            last_accessed: new Date().toISOString()
          })
          .eq('id', id)
          .then(() => {
            // Update cache with new view count
            cached.data.views = (cached.data.views || 0) + 1
          })
          .catch(error => console.error('Failed to update view count:', error))
        
        return NextResponse.json(cached.data)
      }
      
      // Fetch specific moment with optimized query
      const { data, error } = await supabase
        .from('shared_moments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Error fetching moment:', error)
        if (error.code === 'PGRST116') {
          return createErrorResponse({
            message: 'Moment not found',
            code: 'NOT_FOUND',
            statusCode: 404
          })
        }
        throw error
      }

      // Update view count asynchronously
      const updatePromise = supabase
        .from('shared_moments')
        .update({ 
          views: (data.views || 0) + 1,
          last_accessed: new Date().toISOString()
        })
        .eq('id', id)

      // Cache the moment
      const momentWithIncrementedViews = { ...data, views: (data.views || 0) + 1 }
      momentCache.set(id, {
        data: momentWithIncrementedViews,
        timestamp: Date.now()
      })

      // Don't wait for the view count update
      updatePromise.catch(error => console.error('Failed to update view count:', error))

      return NextResponse.json(momentWithIncrementedViews)
    }

    // Fetch all moments (for public feed) with pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Max 50 items
    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
      .from('shared_moments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Error fetching moments:', error)
      throw error
    }

    // Return paginated response
    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: offset + limit < (count || 0),
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('❌ Error in GET /api/moments:', error)
    return createErrorResponse({
      message: error instanceof Error ? error.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500
    })
  }
}

// Add a new endpoint for bulk operations or health checks
export async function HEAD(request: NextRequest) {
  // Simple health check endpoint
  return new NextResponse(null, { status: 200 })
}
