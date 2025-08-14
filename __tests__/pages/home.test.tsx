import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import HomePage from '@/app/page'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

// Mock components
jest.mock('@/components/bottom-navigation', () => ({
  BottomNavigation: () => <div data-testid="bottom-navigation">Bottom Navigation</div>
}))

jest.mock('@/components/social-feed', () => ({
  SocialFeed: () => <div data-testid="social-feed">Social Feed</div>
}))

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('HomePage', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  it('renders the home page with header', () => {
    render(<HomePage />)
    
    expect(screen.getByText('🎵 SongDash')).toBeInTheDocument()
  })

  it('renders the social feed component', () => {
    render(<HomePage />)
    
    expect(screen.getByTestId('social-feed')).toBeInTheDocument()
  })

  it('renders the bottom navigation', () => {
    render(<HomePage />)
    
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument()
  })

  it('has proper page structure', () => {
    render(<HomePage />)
    
    const container = screen.getByText('🎵 SongDash').closest('div')
    expect(container).toHaveClass('bg-white', 'border-b', 'sticky', 'top-0')
  })

  it('has proper spacing for bottom navigation', () => {
    render(<HomePage />)
    
    const mainContainer = screen.getByText('🎵 SongDash').closest('.min-h-screen')
    expect(mainContainer).toHaveClass('pb-20') // Space for bottom nav
  })

  it('uses gray background', () => {
    render(<HomePage />)
    
    const mainContainer = screen.getByText('🎵 SongDash').closest('.min-h-screen')
    expect(mainContainer).toHaveClass('bg-gray-50')
  })
})