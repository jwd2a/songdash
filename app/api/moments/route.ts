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

// Cleanup rate limiter every 5 minutes
setInterval(() => {
  rateLimiter.cleanup()
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

    // Store in Supabase
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
      
      // Fetch specific moment
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

      // Update view count
      await supabase
        .from('shared_moments')
        .update({ 
          views: (data.views || 0) + 1,
          last_accessed: new Date().toISOString()
        })
        .eq('id', id)

      return NextResponse.json(data)
    }

    // Fetch all moments (for public feed)
    const { data, error } = await supabase
      .from('shared_moments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('❌ Error fetching moments:', error)
      throw error
    }

    return NextResponse.json(data || [])

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
