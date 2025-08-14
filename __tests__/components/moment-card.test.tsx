import { render, screen, fireEvent } from '@testing-library/react'
import { MomentCard } from '@/components/moment-card'
import { SharedMoment } from '@/lib/types'

const mockMoment: SharedMoment = {
  id: 'test-moment-1',
  user: {
    id: 'user-1',
    name: 'Test User',
    username: '@testuser',
    avatar: '/test-avatar.jpg',
    email: 'test@example.com',
    bio: 'Test bio',
    stats: { moments: 5, followers: 10, following: 8 },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  song: {
    id: 'song-1',
    title: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    artwork: '/test-artwork.jpg',
    platforms: {}
  },
  generalNote: 'This is a test note',
  highlights: [
    {
      id: 'highlight-1',
      text: 'Test lyric line',
      note: 'Test highlight note',
      startIndex: 0,
      endIndex: 15,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ],
  engagement: {
    likes: 5,
    comments: 2,
    shares: 1,
    isLikedByUser: false,
    isBookmarkedByUser: false
  },
  visibility: 'public',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

describe('MomentCard', () => {
  it('renders moment card with user info', () => {
    render(<MomentCard moment={mockMoment} />)
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('This is a test note')).toBeInTheDocument()
    expect(screen.getByText('Test Song')).toBeInTheDocument()
    expect(screen.getByText('Test Artist')).toBeInTheDocument()
  })

  it('shows like count and handles like interaction', () => {
    const onLike = jest.fn()
    render(<MomentCard moment={mockMoment} onLike={onLike} />)
    
    const likeButton = screen.getByLabelText('Like this moment')
    expect(screen.getByText('5')).toBeInTheDocument()
    
    fireEvent.click(likeButton)
    expect(onLike).toHaveBeenCalledWith('test-moment-1')
  })

  it('shows comment count and handles comment interaction', () => {
    const onComment = jest.fn()
    render(<MomentCard moment={mockMoment} onComment={onComment} />)
    
    const commentButton = screen.getByLabelText('Comment on this moment')
    expect(screen.getByText('2')).toBeInTheDocument()
    
    fireEvent.click(commentButton)
    expect(onComment).toHaveBeenCalledWith('test-moment-1')
  })

  it('toggles highlighted lyrics visibility', () => {
    render(<MomentCard moment={mockMoment} />)
    
    const toggleButton = screen.getByText('Show highlighted lyrics (1)')
    expect(screen.queryByText('Test lyric line')).not.toBeInTheDocument()
    
    fireEvent.click(toggleButton)
    expect(screen.getByText('Test lyric line')).toBeInTheDocument()
    expect(screen.getByText('Test highlight note')).toBeInTheDocument()
  })

  it('handles share interaction', () => {
    const onShare = jest.fn()
    render(<MomentCard moment={mockMoment} onShare={onShare} />)
    
    const shareButton = screen.getByLabelText('Share this moment')
    fireEvent.click(shareButton)
    expect(onShare).toHaveBeenCalledWith('test-moment-1')
  })

  it('displays liked state correctly', () => {
    const likedMoment = {
      ...mockMoment,
      engagement: {
        ...mockMoment.engagement,
        isLikedByUser: true,
        likes: 6
      }
    }
    
    render(<MomentCard moment={likedMoment} />)
    
    const likeButton = screen.getByLabelText('Unlike this moment')
    expect(likeButton).toHaveClass('text-red-500')
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('renders without highlights', () => {
    const momentWithoutHighlights = {
      ...mockMoment,
      highlights: []
    }
    
    render(<MomentCard moment={momentWithoutHighlights} />)
    
    expect(screen.queryByText('Show highlighted lyrics')).not.toBeInTheDocument()
  })

  it('renders without general note', () => {
    const momentWithoutNote = {
      ...mockMoment,
      generalNote: undefined
    }
    
    render(<MomentCard moment={momentWithoutNote} />)
    
    expect(screen.queryByText('This is a test note')).not.toBeInTheDocument()
    expect(screen.getByText('Test Song')).toBeInTheDocument()
  })
})