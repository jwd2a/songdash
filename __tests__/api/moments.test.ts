import { describe, it, expect, beforeEach } from '@jest/globals'

// Mock the Next.js request/response
const mockRequest = (method: string, body?: any, searchParams?: URLSearchParams) => {
  const url = searchParams 
    ? `http://localhost:3000/api/moments?${searchParams.toString()}`
    : 'http://localhost:3000/api/moments'
    
  return {
    method,
    url,
    headers: new Map([
      ['content-type', 'application/json'],
      ['host', 'localhost:3000']
    ]),
    json: async () => body,
    get: function(key: string) { return this.headers.get(key) }
  } as any
}

// Import the API handlers
import { POST, GET } from '../../app/api/moments/route'

describe('/api/moments', () => {
  beforeEach(() => {
    // Clear any existing moments before each test
    // Note: This assumes the moments Map is accessible for testing
    // In a real implementation, you'd want to use a test database
  })

  describe('POST /api/moments', () => {
    it('should create a moment with general note only', async () => {
      const requestBody = {
        songId: 'test-song-123',
        songTitle: 'Test Song',
        songArtist: 'Test Artist',
        songAlbum: 'Test Album',
        songArtwork: 'https://example.com/artwork.jpg',
        songPlatforms: {
          spotify: 'https://open.spotify.com/track/123',
          appleMusic: 'https://music.apple.com/track/123'
        },
        songDuration: '3:45',
        generalNote: 'This song reminds me of summer!',
        highlights: [],
        visibility: 'public'
      }

      const request = mockRequest('POST', requestBody)
      const response = await POST(request)
      
      expect(response.status).toBe(201)
      
      const data = await response.json()
      expect(data.id).toBeDefined()
      expect(data.shareUrl).toContain('/shared/')
      expect(data.hasGeneralNote).toBe(true)
      expect(data.highlightCount).toBe(0)
    })

    it('should create a moment with highlights only', async () => {
      const requestBody = {
        songId: 'test-song-456',
        songTitle: 'Another Test Song',
        songArtist: 'Another Artist',
        songAlbum: 'Another Album',
        songArtwork: 'https://example.com/artwork2.jpg',
        songPlatforms: {
          spotify: 'https://open.spotify.com/track/456'
        },
        songDuration: '4:20',
        generalNote: '',
        highlights: [
          {
            text: 'Amazing lyrics here',
            note: 'This part gives me chills',
            startIndex: 0,
            endIndex: 18
          },
          {
            text: 'Another great line',
            note: 'So relatable!',
            startIndex: 50,
            endIndex: 68
          }
        ],
        visibility: 'public'
      }

      const request = mockRequest('POST', requestBody)
      const response = await POST(request)
      
      expect(response.status).toBe(201)
      
      const data = await response.json()
      expect(data.id).toBeDefined()
      expect(data.shareUrl).toContain('/shared/')
      expect(data.hasGeneralNote).toBe(false)
      expect(data.highlightCount).toBe(2)
    })

    it('should create a moment with both note and highlights', async () => {
      const requestBody = {
        songId: 'test-song-789',
        songTitle: 'Full Test Song',
        songArtist: 'Full Artist',
        songAlbum: 'Full Album',
        songArtwork: 'https://example.com/artwork3.jpg',
        songPlatforms: {
          spotify: 'https://open.spotify.com/track/789',
          appleMusic: 'https://music.apple.com/track/789',
          youtubeMusic: 'https://music.youtube.com/watch?v=789'
        },
        songDuration: '5:12',
        generalNote: 'Perfect song for road trips!',
        highlights: [
          {
            text: 'Highway to nowhere',
            note: 'Love this metaphor',
            startIndex: 10,
            endIndex: 27
          }
        ],
        visibility: 'public'
      }

      const request = mockRequest('POST', requestBody)
      const response = await POST(request)
      
      expect(response.status).toBe(201)
      
      const data = await response.json()
      expect(data.id).toBeDefined()
      expect(data.shareUrl).toContain('/shared/')
      expect(data.hasGeneralNote).toBe(true)
      expect(data.highlightCount).toBe(1)
    })

    it('should reject moment with no content', async () => {
      const requestBody = {
        songId: 'test-song-empty',
        songTitle: 'Empty Song',
        songArtist: 'Empty Artist',
        songAlbum: 'Empty Album',
        songArtwork: '',
        songPlatforms: {},
        songDuration: '0:00',
        generalNote: '',
        highlights: [],
        visibility: 'public'
      }

      const request = mockRequest('POST', requestBody)
      const response = await POST(request)
      
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toContain('No content to share')
      expect(data.code).toBe('NO_CONTENT')
    })

    it('should reject moment with invalid song data', async () => {
      const requestBody = {
        songId: '',
        songTitle: '',
        songArtist: '',
        generalNote: 'This should fail',
        highlights: [],
        visibility: 'public'
      }

      const request = mockRequest('POST', requestBody)
      const response = await POST(request)
      
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toContain('Song must have id, title, and artist')
      expect(data.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/moments', () => {
    it('should retrieve a created moment', async () => {
      // First create a moment
      const createBody = {
        songId: 'retrieve-test-123',
        songTitle: 'Retrieve Test Song',
        songArtist: 'Retrieve Artist',
        songAlbum: 'Retrieve Album',
        songArtwork: 'https://example.com/retrieve.jpg',
        songPlatforms: {
          spotify: 'https://open.spotify.com/track/retrieve123'
        },
        songDuration: '3:30',
        generalNote: 'Test note for retrieval',
        highlights: [
          {
            text: 'Test highlight',
            note: 'Test highlight note',
            startIndex: 0,
            endIndex: 14
          }
        ],
        visibility: 'public'
      }

      const createRequest = mockRequest('POST', createBody)
      const createResponse = await POST(createRequest)
      const createData = await createResponse.json()
      
      expect(createResponse.status).toBe(201)
      expect(createData.id).toBeDefined()

      // Now retrieve the moment
      const searchParams = new URLSearchParams({ id: createData.id })
      const getRequest = mockRequest('GET', undefined, searchParams)
      const getResponse = await GET(getRequest)
      
      expect(getResponse.status).toBe(200)
      
      const getData = await getResponse.json()
      expect(getData.id).toBe(createData.id)
      expect(getData.songTitle).toBe('Retrieve Test Song')
      expect(getData.songArtist).toBe('Retrieve Artist')
      expect(getData.generalNote).toBe('Test note for retrieval')
      expect(getData.highlights).toHaveLength(1)
      expect(getData.highlights[0].text).toBe('Test highlight')
      expect(getData.views).toBe(1) // Should increment view count
    })

    it('should return 404 for non-existent moment', async () => {
      const searchParams = new URLSearchParams({ id: 'nonexistent123' })
      const request = mockRequest('GET', undefined, searchParams)
      const response = await GET(request)
      
      expect(response.status).toBe(404)
      
      const data = await response.json()
      expect(data.error).toBe('Moment not found')
      expect(data.code).toBe('MOMENT_NOT_FOUND')
    })

    it('should return 400 for invalid ID format', async () => {
      const searchParams = new URLSearchParams({ id: 'invalid-id-with-special-chars!' })
      const request = mockRequest('GET', undefined, searchParams)
      const response = await GET(request)
      
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Invalid moment ID format')
      expect(data.code).toBe('INVALID_ID_FORMAT')
    })

    it('should return 400 when no ID provided', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Moment ID is required')
      expect(data.code).toBe('MISSING_ID')
    })
  })

  describe('End-to-End Flow', () => {
    it('should complete full create and share flow', async () => {
      // Step 1: Create a moment
      const momentData = {
        songId: 'e2e-test-song',
        songTitle: 'End to End Test',
        songArtist: 'E2E Artist',
        songAlbum: 'E2E Album',
        songArtwork: 'https://example.com/e2e.jpg',
        songPlatforms: {
          spotify: 'https://open.spotify.com/track/e2e',
          appleMusic: 'https://music.apple.com/track/e2e'
        },
        songDuration: '4:00',
        generalNote: 'End-to-end test moment',
        highlights: [
          {
            text: 'E2E test lyrics',
            note: 'Testing the full flow',
            startIndex: 0,
            endIndex: 15
          }
        ],
        visibility: 'public'
      }

      const createRequest = mockRequest('POST', momentData)
      const createResponse = await POST(createRequest)
      
      expect(createResponse.status).toBe(201)
      
      const createData = await createResponse.json()
      expect(createData.id).toBeDefined()
      expect(createData.shareUrl).toMatch(/^http:\/\/localhost:3000\/shared\/[a-zA-Z0-9]+$/)
      
      // Step 2: Retrieve the moment using the ID
      const momentId = createData.id
      const searchParams = new URLSearchParams({ id: momentId })
      const getRequest = mockRequest('GET', undefined, searchParams)
      const getResponse = await GET(getRequest)
      
      expect(getResponse.status).toBe(200)
      
      const retrievedData = await getResponse.json()
      expect(retrievedData.id).toBe(momentId)
      expect(retrievedData.songTitle).toBe(momentData.songTitle)
      expect(retrievedData.songArtist).toBe(momentData.songArtist)
      expect(retrievedData.generalNote).toBe(momentData.generalNote)
      expect(retrievedData.highlights).toHaveLength(1)
      expect(retrievedData.song.id).toBe(momentData.songId)
      expect(retrievedData.song.platforms.spotify).toBe(momentData.songPlatforms.spotify)
      
      // Step 3: Verify view count incremented
      expect(retrievedData.views).toBe(1)
      
      // Step 4: Retrieve again to test view increment
      const getRequest2 = mockRequest('GET', undefined, searchParams)
      const getResponse2 = await GET(getRequest2)
      const retrievedData2 = await getResponse2.json()
      
      expect(retrievedData2.views).toBe(2)
    })
  })
})