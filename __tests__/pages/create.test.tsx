import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import CreatePage from '@/app/create/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock the API
jest.mock('@/lib/api', () => ({
  searchSongs: jest.fn()
}))

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('CreatePage', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    })
  })

  it('renders the create page with header and search', () => {
    render(<CreatePage />)
    
    expect(screen.getByText('🎵 SongDash')).toBeInTheDocument()
    expect(screen.getByText('Share a Song')).toBeInTheDocument()
    expect(screen.getByText('Find a song to share with your friends')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search for a song...')).toBeInTheDocument()
  })

  it('shows popular songs by default', () => {
    render(<CreatePage />)
    
    expect(screen.getByText('Popular Songs')).toBeInTheDocument()
    expect(screen.getByText('Blinding Lights')).toBeInTheDocument()
    expect(screen.getByText('Good 4 U')).toBeInTheDocument()
    expect(screen.getByText('Levitating')).toBeInTheDocument()
  })

  it('handles search input', async () => {
    const { searchSongs } = require('@/lib/api')
    searchSongs.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'search-result-1',
          title: 'Search Result Song',
          artist: 'Search Artist',
          album: 'Search Album',
          artwork: '/search-artwork.jpg'
        }
      ]
    })

    render(<CreatePage />)
    
    const searchInput = screen.getByPlaceholderText('Search for a song...')
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getAllByRole('generic')).toHaveLength(3) // Loading skeletons
    })
    
    // Should show search results
    await waitFor(() => {
      expect(screen.getByText('Search Result Song')).toBeInTheDocument()
      expect(screen.getByText('Search Artist')).toBeInTheDocument()
    })
    
    expect(searchSongs).toHaveBeenCalledWith({ query: 'test search' })
  })

  it('shows no results message when search returns empty', async () => {
    const { searchSongs } = require('@/lib/api')
    searchSongs.mockResolvedValue({
      success: true,
      data: []
    })

    render(<CreatePage />)
    
    const searchInput = screen.getByPlaceholderText('Search for a song...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent song' } })
    
    await waitFor(() => {
      expect(screen.getByText('No songs found')).toBeInTheDocument()
      expect(screen.getByText('Try searching with different keywords')).toBeInTheDocument()
    })
  })

  it('handles search API error gracefully', async () => {
    const { searchSongs } = require('@/lib/api')
    searchSongs.mockRejectedValue(new Error('API Error'))

    render(<CreatePage />)
    
    const searchInput = screen.getByPlaceholderText('Search for a song...')
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    // Should not crash and should show no results
    await waitFor(() => {
      expect(screen.getByText('No songs found')).toBeInTheDocument()
    })
  })

  it('clears search results when search input is cleared', async () => {
    const { searchSongs } = require('@/lib/api')
    searchSongs.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'search-result-1',
          title: 'Search Result Song',
          artist: 'Search Artist',
          album: 'Search Album',
          artwork: '/search-artwork.jpg'
        }
      ]
    })

    render(<CreatePage />)
    
    const searchInput = screen.getByPlaceholderText('Search for a song...')
    
    // Search for something
    fireEvent.change(searchInput, { target: { value: 'test' } })
    await waitFor(() => {
      expect(screen.getByText('Search Result Song')).toBeInTheDocument()
    })
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } })
    
    // Should show popular songs again
    expect(screen.getByText('Popular Songs')).toBeInTheDocument()
    expect(screen.queryByText('Search Result Song')).not.toBeInTheDocument()
  })

  it('has clickable song links', () => {
    render(<CreatePage />)
    
    const songLinks = screen.getAllByRole('link')
    const blindingLightsLink = songLinks.find(link => 
      link.textContent?.includes('Blinding Lights')
    )
    
    expect(blindingLightsLink).toHaveAttribute('href', '/song/song-1')
  })

  it('shows loading state during search', async () => {
    const { searchSongs } = require('@/lib/api')
    // Make the API call hang to test loading state
    searchSongs.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ success: true, data: [] }), 1000)
    }))

    render(<CreatePage />)
    
    const searchInput = screen.getByPlaceholderText('Search for a song...')
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    // Should show loading skeletons
    expect(screen.getAllByRole('generic')).toHaveLength(3)
  })
})