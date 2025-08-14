import { type NextRequest, NextResponse } from "next/server"
import { 
  createErrorResponse, 
  createSuccessResponse, 
  validateMomentData, 
  sanitizeMomentData, 
  generateMomentId,
  RateLimiter 
} from "@/lib/api-utils"

// In-memory storage for demo (use a real database in production)
const moments = new Map<string, any>()

// Rate limiter instance
const rateLimiter = new RateLimiter(60 * 1000, 30) // 30 requests per minute

// Cleanup rate limiter every 5 minutes
setInterval(() => {
  rateLimiter.cleanup()
}, 5 * 60 * 1000)

export async function POST(request: NextRequest) {
  try {
    // Get client identifier for rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    request.headers.get('cf-connecting-ip') ||
                    'unknown'
    
    // Check rate limit
    if (!rateLimiter.isAllowed(clientId)) {
      return createErrorResponse({
        message: "Too many requests. Please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
        statusCode: 429
      })
    }

    const body = await request.json()
    
    // Validate the moment data
    const validation = validateMomentData(body)
    if (!validation.isValid) {
      return createErrorResponse({
        message: validation.error!,
        code: "VALIDATION_ERROR",
        statusCode: 400
      })
    }

    // Sanitize and prepare the data
    const sanitizedData = sanitizeMomentData(body)
    
    // Check if there's actually content to share
    if (sanitizedData.highlights.length === 0 && !sanitizedData.generalNote) {
      return createErrorResponse({
        message: "No content to share. Add highlights with notes or a general note.",
        code: "NO_CONTENT",
        statusCode: 400
      })
    }

    // Generate a unique ID
    const momentId = generateMomentId()

    // Store the moment with enhanced structure
    const moment = {
      id: momentId,
      ...sanitizedData,
      views: 0,
      lastUpdated: new Date().toISOString(),
      lastAccessed: null,
    }

    moments.set(momentId, moment)

    // Generate the share URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (request.headers.get('host') ? 
                    `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}` : 
                    'http://localhost:3000')

    return createSuccessResponse({
      id: momentId,
      shareUrl: `${baseUrl}/shared/${momentId}`,
      hasGeneralNote: !!moment.generalNote,
      highlightCount: moment.highlights.length,
    }, 201)
    
  } catch (error) {
    console.error("Create moment error:", error)
    
    // Provide more specific error messages
    if (error instanceof SyntaxError) {
      return createErrorResponse({
        message: "Invalid JSON in request body",
        code: "INVALID_JSON",
        statusCode: 400
      })
    }
    
    return createErrorResponse({
      message: "Failed to create moment",
      code: "INTERNAL_ERROR",
      statusCode: 500
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return createErrorResponse({
        message: "Moment ID is required",
        code: "MISSING_ID",
        statusCode: 400
      })
    }

    // Validate ID format (basic security check)
    if (!/^[a-zA-Z0-9]{8,20}$/.test(id)) {
      return createErrorResponse({
        message: "Invalid moment ID format",
        code: "INVALID_ID_FORMAT",
        statusCode: 400
      })
    }

    const moment = moments.get(id)

    if (!moment) {
      return createErrorResponse({
        message: "Moment not found",
        code: "MOMENT_NOT_FOUND",
        statusCode: 404
      })
    }

    // Increment view count and update last accessed time
    moment.views += 1
    moment.lastAccessed = new Date().toISOString()
    moments.set(id, moment)

    // Return the moment with additional metadata
    return createSuccessResponse({
      ...moment,
      hasGeneralNote: !!moment.generalNote,
      highlightCount: moment.highlights?.length || 0,
    })
    
  } catch (error) {
    console.error("Get moment error:", error)
    return createErrorResponse({
      message: "Failed to retrieve moment",
      code: "INTERNAL_ERROR",
      statusCode: 500
    })
  }
}

// Add a new endpoint for bulk operations or health checks
export async function HEAD(request: NextRequest) {
  // Simple health check endpoint
  return new NextResponse(null, { status: 200 })
}
