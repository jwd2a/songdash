import { render, screen } from '@testing-library/react'
import { usePathname, useRouter } from 'next/navigation'
import FeedPage from '@/app/feed/page'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn()
}))

// Mock components
jest.mock('@/components/bottom-navigation', () => ({
  BottomNavigation: () => <div data-testid="bottom-navigation">Bottom Navigation</div>
}))

jest.mock('@/components/social-feed', () => ({
  SocialFeed: () => <div data-testid="social-feed">Social Feed</div>
}))

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockPush = jest.fn()

describe('FeedPage', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/feed')
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    } as any)
  })

  it('renders the feed page with header', () => {
    render(<FeedPage />)
    
    expect(screen.getByText('🎵 SongDash')).toBeInTheDocument()
  })

  it('renders the social feed component', () => {
    render(<FeedPage />)
    
    expect(screen.getByTestId('social-feed')).toBeInTheDocument()
  })

  it('renders the bottom navigation', () => {
    render(<FeedPage />)
    
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument()
  })

  it('has proper page structure', () => {
    render(<FeedPage />)
    
    const container = screen.getByText('🎵 SongDash').closest('div')
    expect(container).toHaveClass('bg-white', 'border-b', 'sticky', 'top-0')
  })

  it('has proper spacing for bottom navigation', () => {
    render(<FeedPage />)
    
    const mainContainer = screen.getByText('🎵 SongDash').closest('.min-h-screen')
    expect(mainContainer).toHaveClass('pb-20') // Space for bottom nav
  })

  it('uses gray background', () => {
    render(<FeedPage />)
    
    const mainContainer = screen.getByText('🎵 SongDash').closest('.min-h-screen')
    expect(mainContainer).toHaveClass('bg-gray-50')
  })
})