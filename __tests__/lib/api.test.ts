import { 
  getFeed, 
  getCurrentUser, 
  searchSongs, 
  createMoment, 
  likeMoment 
} from '@/lib/api'

// Mock the delay function to speed up tests
jest.mock('@/lib/api', () => {
  const originalModule = jest.requireActual('@/lib/api')
  return {
    ...originalModule,
    // Override delay to be instant in tests
    delay: jest.fn().mockResolvedValue(undefined)
  }
})

describe('API Functions', () => {
  describe('getFeed', () => {
    it('returns paginated feed data', async () => {
      const result = await getFeed(1, 2)
      
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.pagination).toEqual({
        page: 1,
        limit: 2,
        total: expect.any(Number),
        totalPages: expect.any(Number),
        hasNext: expect.any(Boolean),
        hasPrev: false
      })
    })

    it('handles pagination correctly', async () => {
      const page1 = await getFeed(1, 1)
      const page2 = await getFeed(2, 1)
      
      expect(page1.pagination.page).toBe(1)
      expect(page1.pagination.hasPrev).toBe(false)
      expect(page2.pagination.page).toBe(2)
      expect(page2.pagination.hasPrev).toBe(true)
    })
  })

  describe('getCurrentUser', () => {
    it('returns current user data', async () => {
      const result = await getCurrentUser()
      
      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('id', 'current-user')
      expect(result.data).toHaveProperty('name', 'You')
      expect(result.data).toHaveProperty('username', '@you')
    })
  })

  describe('searchSongs', () => {
    it('returns search results for valid query', async () => {
      const result = await searchSongs({ query: 'Blinding' })
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: expect.stringContaining('Blinding')
          })
        ])
      )
    })

    it('returns empty results for non-matching query', async () => {
      const result = await searchSongs({ query: 'NonExistentSong123' })
      
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(0)
    })

    it('handles limit parameter', async () => {
      const result = await searchSongs({ query: 'a', limit: 1 })
      
      expect(result.success).toBe(true)
      expect(result.data.length).toBeLessThanOrEqual(1)
    })
  })

  describe('createMoment', () => {
    it('creates a new moment successfully', async () => {
      const momentData = {
        songId: 'song-1',
        generalNote: 'Test note',
        highlights: [
          {
            text: 'Test lyric',
            note: 'Test highlight note',
            startIndex: 0,
            endIndex: 10
          }
        ],
        visibility: 'public' as const
      }
      
      const result = await createMoment(momentData)
      
      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('id')
      expect(result.data.generalNote).toBe('Test note')
      expect(result.data.highlights).toHaveLength(1)
      expect(result.data.highlights[0].text).toBe('Test lyric')
      expect(result.data.engagement.likes).toBe(0)
    })

    it('handles missing song', async () => {
      const momentData = {
        songId: 'non-existent-song',
        generalNote: 'Test note',
        highlights: [],
        visibility: 'public' as const
      }
      
      const result = await createMoment(momentData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Song or user not found')
    })

    it('creates moment without general note', async () => {
      const momentData = {
        songId: 'song-1',
        highlights: [
          {
            text: 'Test lyric',
            note: 'Test note',
            startIndex: 0,
            endIndex: 10
          }
        ],
        visibility: 'public' as const
      }
      
      const result = await createMoment(momentData)
      
      expect(result.success).toBe(true)
      expect(result.data.generalNote).toBeUndefined()
      expect(result.data.highlights).toHaveLength(1)
    })
  })

  describe('likeMoment', () => {
    it('likes an unliked moment', async () => {
      // First get a moment that's not liked
      const feed = await getFeed()
      const moment = feed.data.find(m => !m.engagement.isLikedByUser)
      
      if (moment) {
        const originalLikes = moment.engagement.likes
        const result = await likeMoment(moment.id)
        
        expect(result.success).toBe(true)
        expect(result.data.engagement.isLikedByUser).toBe(true)
        expect(result.data.engagement.likes).toBe(originalLikes + 1)
      }
    })

    it('unlikes a liked moment', async () => {
      // First get a moment that's liked
      const feed = await getFeed()
      const moment = feed.data.find(m => m.engagement.isLikedByUser)
      
      if (moment) {
        const originalLikes = moment.engagement.likes
        const result = await likeMoment(moment.id)
        
        expect(result.success).toBe(true)
        expect(result.data.engagement.isLikedByUser).toBe(false)
        expect(result.data.engagement.likes).toBe(originalLikes - 1)
      }
    })

    it('handles non-existent moment', async () => {
      const result = await likeMoment('non-existent-moment')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Moment not found')
    })
  })
})