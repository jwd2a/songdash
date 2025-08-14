import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { BottomNavigation } from '@/components/bottom-navigation'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('BottomNavigation', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  it('renders all navigation tabs', () => {
    render(<BottomNavigation />)
    
    expect(screen.getByText('Feed')).toBeInTheDocument()
    expect(screen.getByText('Share')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('shows active state for feed tab when on home page', () => {
    mockUsePathname.mockReturnValue('/')
    render(<BottomNavigation />)
    
    const feedButton = screen.getByText('Feed').closest('button')
    expect(feedButton).toHaveClass('text-blue-600')
  })

  it('shows active state for share tab when on create page', () => {
    mockUsePathname.mockReturnValue('/create')
    render(<BottomNavigation />)
    
    const shareButton = screen.getByText('Share').closest('button')
    expect(shareButton).toHaveClass('text-blue-600')
  })

  it('shows active state for share tab when on song page', () => {
    mockUsePathname.mockReturnValue('/song/123')
    render(<BottomNavigation />)
    
    const shareButton = screen.getByText('Share').closest('button')
    expect(shareButton).toHaveClass('text-blue-600')
  })

  it('shows active state for profile tab when on profile page', () => {
    mockUsePathname.mockReturnValue('/profile')
    render(<BottomNavigation />)
    
    const profileButton = screen.getByText('Profile').closest('button')
    expect(profileButton).toHaveClass('text-blue-600')
  })

  it('has proper accessibility labels', () => {
    render(<BottomNavigation />)
    
    expect(screen.getByLabelText('Feed')).toBeInTheDocument()
    expect(screen.getByLabelText('Share')).toBeInTheDocument()
    expect(screen.getByLabelText('Profile')).toBeInTheDocument()
  })

  it('has proper link hrefs', () => {
    render(<BottomNavigation />)
    
    const feedLink = screen.getByText('Feed').closest('a')
    const shareLink = screen.getByText('Share').closest('a')
    const profileLink = screen.getByText('Profile').closest('a')
    
    expect(feedLink).toHaveAttribute('href', '/')
    expect(shareLink).toHaveAttribute('href', '/create')
    expect(profileLink).toHaveAttribute('href', '/profile')
  })

  it('applies inactive styles to non-active tabs', () => {
    mockUsePathname.mockReturnValue('/')
    render(<BottomNavigation />)
    
    const shareButton = screen.getByText('Share').closest('button')
    const profileButton = screen.getByText('Profile').closest('button')
    
    expect(shareButton).toHaveClass('text-gray-500')
    expect(profileButton).toHaveClass('text-gray-500')
  })

  it('has touch-friendly button sizes', () => {
    render(<BottomNavigation />)
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveClass('min-h-[44px]')
      expect(button).toHaveClass('touch-manipulation')
    })
  })
})