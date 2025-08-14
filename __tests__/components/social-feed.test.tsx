import { render, screen, waitFor } from '@testing-library/react'
import { SocialFeed } from '@/components/social-feed'
import { SharedMoment } from '@/lib/types'

const mockMoments: SharedMoment[] = [
  {
    id: 'moment-1',
    user: {
      id: 'user-1',
      name: 'User One',
      username: '@userone',
      avatar: '/avatar1.jpg',
      email: 'user1@example.com',
      bio: 'Bio 1',
      stats: { moments: 5, followers: 10, following: 8 },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    song: {
      id: 'song-1',
      title: 'Song One',
      artist: 'Artist One',
      album: 'Album One',
      artwork: '/artwork1.jpg',
      platforms: {}
    },
    generalNote: 'Great song!',
    highlights: [],
    engagement: {
      likes: 10,
      comments: 3,
      shares: 2,
      isLikedByUser: false,
      isBookmarkedByUser: false
    },
    visibility: 'public',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'moment-2',
    user: {
      id: 'user-2',
      name: 'User Two',
      username: '@usertwo',
      avatar: '/avatar2.jpg',
      email: 'user2@example.com',
      bio: 'Bio 2',
      stats: { moments: 3, followers: 15, following: 12 },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    song: {
      id: 'song-2',
      title: 'Song Two',
      artist: 'Artist Two',
      album: 'Album Two',
      artwork: '/artwork2.jpg',
      platforms: {}
    },
    generalNote: 'Love this track!',
    highlights: [
      {
        id: 'highlight-1',
        text: 'Amazing lyrics',
        note: 'So meaningful',
        startIndex: 0,
        endIndex: 13,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ],
    engagement: {
      likes: 25,
      comments: 8,
      shares: 5,
      isLikedByUser: true,
      isBookmarkedByUser: false
    },
    visibility: 'public',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

describe('SocialFeed', () => {
  it('renders loading state initially', () => {
    render(<SocialFeed />)
    
    // Should show loading skeletons
    expect(screen.getAllByRole('generic')).toHaveLength(3) // 3 skeleton cards
  })

  it('renders provided moments', () => {
    render(<SocialFeed moments={mockMoments} />)
    
    expect(screen.getByText('User One')).toBeInTheDocument()
    expect(screen.getByText('User Two')).toBeInTheDocument()
    expect(screen.getByText('Song One')).toBeInTheDocument()
    expect(screen.getByText('Song Two')).toBeInTheDocument()
    expect(screen.getByText('Great song!')).toBeInTheDocument()
    expect(screen.getByText('Love this track!')).toBeInTheDocument()
  })

  it('renders empty state when no moments', () => {
    render(<SocialFeed moments={[]} />)
    
    expect(screen.getByText('No moments yet')).toBeInTheDocument()
    expect(screen.getByText('Be the first to share a song moment!')).toBeInTheDocument()
  })

  it('loads mock data when no moments provided', async () => {
    render(<SocialFeed />)
    
    // Wait for mock data to load
    await waitFor(() => {
      expect(screen.getByText('Alex Chen')).toBeInTheDocument()
    }, { timeout: 2000 })
    
    expect(screen.getByText('Sarah Kim')).toBeInTheDocument()
  })

  it('handles like interaction', async () => {
    const onLike = jest.fn()
    render(<SocialFeed moments={mockMoments} onLike={onLike} />)
    
    const likeButtons = screen.getAllByLabelText(/Like this moment|Unlike this moment/)
    expect(likeButtons).toHaveLength(2)
    
    // Click first like button
    likeButtons[0].click()
    expect(onLike).toHaveBeenCalledWith('moment-1')
  })

  it('handles comment interaction', () => {
    const onComment = jest.fn()
    render(<SocialFeed moments={mockMoments} onComment={onComment} />)
    
    const commentButtons = screen.getAllByLabelText('Comment on this moment')
    expect(commentButtons).toHaveLength(2)
    
    commentButtons[0].click()
    expect(onComment).toHaveBeenCalledWith('moment-1')
  })

  it('handles share interaction', () => {
    const onShare = jest.fn()
    
    // Mock navigator.share
    Object.assign(navigator, {
      share: jest.fn().mockResolvedValue(undefined)
    })
    
    render(<SocialFeed moments={mockMoments} onShare={onShare} />)
    
    const shareButtons = screen.getAllByLabelText('Share this moment')
    expect(shareButtons).toHaveLength(2)
    
    shareButtons[0].click()
    expect(onShare).toHaveBeenCalledWith('moment-1')
  })

  it('updates like count when liking a moment', () => {
    render(<SocialFeed moments={mockMoments} />)
    
    // Find the first moment's like button and count
    const likeButton = screen.getAllByLabelText('Like this moment')[0]
    expect(screen.getByText('10')).toBeInTheDocument() // Initial like count
    
    // Click like button
    likeButton.click()
    
    // Should update to 11 and change to unlike
    expect(screen.getByText('11')).toBeInTheDocument()
    expect(screen.getByLabelText('Unlike this moment')).toBeInTheDocument()
  })

  it('handles share fallback when navigator.share not available', () => {
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      },
      share: undefined
    })
    
    render(<SocialFeed moments={mockMoments} />)
    
    const shareButton = screen.getAllByLabelText('Share this moment')[0]
    shareButton.click()
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })
})