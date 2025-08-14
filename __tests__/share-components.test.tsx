/**
 * Unit tests for share components
 * 
 * Note: This project doesn't have a testing framework configured yet.
 * To run these tests, you would need to install and configure:
 * - vitest or jest
 * - @testing-library/react
 * - @testing-library/jest-dom
 * - jsdom (for vitest)
 * 
 * Example setup commands:
 * npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
 * 
 * Then add to package.json scripts:
 * "test": "vitest",
 * "test:ui": "vitest --ui"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ShareInstructions } from '../components/share-instructions'
import { ShareURL } from '../components/share-url'
import { GeneralNoteInput } from '../components/general-note-input'
import { SharePreview } from '../components/share-preview'
import { ShareSection } from '../components/share-section'

// Mock data
const mockSong = {
  id: '1',
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  image: '/test-image.jpg',
  platforms: {
    spotify: 'https://spotify.com/test',
    appleMusic: 'https://music.apple.com/test',
  }
}

const mockHighlight = {
  id: '1',
  text: 'Test lyric line',
  startIndex: 0,
  endIndex: 15,
  note: 'This is a test note'
}

const mockHighlightWithoutNote = {
  id: '2',
  text: 'Another lyric line',
  startIndex: 16,
  endIndex: 34,
}

describe('ShareInstructions', () => {
  it('shows first visit message when no highlights exist', () => {
    render(<ShareInstructions highlights={[]} />)
    
    expect(screen.getByText(/Select any lyrics to highlight them/)).toBeInTheDocument()
  })

  it('shows add notes message when highlights exist without notes', () => {
    render(<ShareInstructions highlights={[mockHighlightWithoutNote]} />)
    
    expect(screen.getByText(/Add notes to your highlights/)).toBeInTheDocument()
  })

  it('shows ready to share message when highlights with notes exist', () => {
    render(<ShareInstructions highlights={[mockHighlight]} />)
    
    expect(screen.getByText(/You have 1 highlight with notes ready to share/)).toBeInTheDocument()
  })

  it('shows correct plural form for multiple highlights', () => {
    render(<ShareInstructions highlights={[mockHighlight, { ...mockHighlight, id: '2' }]} />)
    
    expect(screen.getByText(/You have 2 highlights with notes ready to share/)).toBeInTheDocument()
  })
})

describe('ShareURL', () => {
  const mockProps = {
    shareUrl: 'https://example.com/shared/abc123',
    onCopyUrl: vi.fn(),
    isUrlCopied: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders share URL input field', () => {
    render(<ShareURL {...mockProps} />)
    
    const input = screen.getByDisplayValue(mockProps.shareUrl)
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('readonly')
  })

  it('shows copy button', () => {
    render(<ShareURL {...mockProps} />)
    
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
  })

  it('calls onCopyUrl when copy button is clicked', async () => {
    render(<ShareURL {...mockProps} />)
    
    const copyButton = screen.getByRole('button', { name: /copy/i })
    fireEvent.click(copyButton)
    
    await waitFor(() => {
      expect(mockProps.onCopyUrl).toHaveBeenCalledTimes(1)
    })
  })

  it('shows copied state when isUrlCopied is true', () => {
    render(<ShareURL {...mockProps} isUrlCopied={true} />)
    
    expect(screen.getByText('Copied!')).toBeInTheDocument()
  })

  it('shows loading state when isGenerating is true', () => {
    render(<ShareURL {...mockProps} isGenerating={true} />)
    
    expect(screen.getByText('Generating share link...')).toBeInTheDocument()
  })

  it('shows error state when error is provided', () => {
    const errorMessage = 'Failed to generate URL'
    render(<ShareURL {...mockProps} error={errorMessage} />)
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('disables copy button when no URL is provided', () => {
    render(<ShareURL {...mockProps} shareUrl="" />)
    
    const copyButton = screen.getByRole('button', { name: /copy/i })
    expect(copyButton).toBeDisabled()
  })
})

describe('GeneralNoteInput', () => {
  const mockProps = {
    value: '',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders textarea with placeholder', () => {
    render(<GeneralNoteInput {...mockProps} />)
    
    const textarea = screen.getByPlaceholderText(/Add a note about why you're sharing/i)
    expect(textarea).toBeInTheDocument()
  })

  it('shows character count', () => {
    render(<GeneralNoteInput {...mockProps} maxLength={500} />)
    
    expect(screen.getByText('500 remaining')).toBeInTheDocument()
  })

  it('updates character count as user types', () => {
    render(<GeneralNoteInput {...mockProps} value="Hello" maxLength={500} />)
    
    expect(screen.getByText('495 remaining')).toBeInTheDocument()
  })

  it('shows warning color when near character limit', () => {
    render(<GeneralNoteInput {...mockProps} value="a".repeat(460) maxLength={500} />)
    
    const remainingText = screen.getByText('40 remaining')
    expect(remainingText).toHaveClass('text-orange-500')
  })

  it('shows error color when over character limit', () => {
    render(<GeneralNoteInput {...mockProps} value="a".repeat(510) maxLength={500} />)
    
    const remainingText = screen.getByText('-10 remaining')
    expect(remainingText).toHaveClass('text-destructive')
  })

  it('calls onChange with debouncing', async () => {
    vi.useFakeTimers()
    render(<GeneralNoteInput {...mockProps} debounceMs={300} />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Test note' } })
    
    // Should not call onChange immediately
    expect(mockProps.onChange).not.toHaveBeenCalled()
    
    // Should call onChange after debounce delay
    vi.advanceTimersByTime(300)
    await waitFor(() => {
      expect(mockProps.onChange).toHaveBeenCalledWith('Test note')
    })
    
    vi.useRealTimers()
  })
})

describe('SharePreview', () => {
  it('shows empty state when no content to share', () => {
    render(<SharePreview song={mockSong} highlights={[]} generalNote="" />)
    
    expect(screen.getByText('Only song information will be shared')).toBeInTheDocument()
  })

  it('shows song information', () => {
    render(<SharePreview song={mockSong} highlights={[mockHighlight]} generalNote="" />)
    
    expect(screen.getByText(mockSong.title)).toBeInTheDocument()
    expect(screen.getByText(mockSong.artist)).toBeInTheDocument()
  })

  it('shows general note badge when general note exists', () => {
    render(<SharePreview song={mockSong} highlights={[]} generalNote="Great song!" />)
    
    expect(screen.getByText('General note')).toBeInTheDocument()
  })

  it('shows highlights badge when highlights with notes exist', () => {
    render(<SharePreview song={mockSong} highlights={[mockHighlight]} generalNote="" />)
    
    expect(screen.getByText('1 highlight with notes')).toBeInTheDocument()
  })

  it('shows correct plural form for multiple highlights', () => {
    const highlights = [mockHighlight, { ...mockHighlight, id: '2' }]
    render(<SharePreview song={mockSong} highlights={highlights} generalNote="" />)
    
    expect(screen.getByText('2 highlights with notes')).toBeInTheDocument()
  })

  it('shows preview of general note', () => {
    const longNote = "This is a very long note that should be truncated when displayed in the preview section"
    render(<SharePreview song={mockSong} highlights={[]} generalNote={longNote} />)
    
    expect(screen.getByText(/This is a very long note that should be truncated/)).toBeInTheDocument()
  })

  it('shows preview of first highlight', () => {
    render(<SharePreview song={mockSong} highlights={[mockHighlight]} generalNote="" />)
    
    expect(screen.getByText(`"${mockHighlight.text}"`)).toBeInTheDocument()
    expect(screen.getByText(/Your note: This is a test note/)).toBeInTheDocument()
  })
})

describe('ShareSection', () => {
  const mockProps = {
    song: mockSong,
    highlights: [mockHighlight],
    generalNote: 'Test general note',
    onGeneralNoteChange: vi.fn(),
    shareUrl: 'https://example.com/shared/abc123',
    onCopyUrl: vi.fn(),
    isUrlCopied: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all sub-components', () => {
    render(<ShareSection {...mockProps} />)
    
    // Should contain instructions
    expect(screen.getByText(/You have 1 highlight with notes ready to share/)).toBeInTheDocument()
    
    // Should contain general note input
    expect(screen.getByLabelText(/General Note/)).toBeInTheDocument()
    
    // Should contain share URL
    expect(screen.getByDisplayValue(mockProps.shareUrl)).toBeInTheDocument()
    
    // Should contain share preview
    expect(screen.getByText(mockSong.title)).toBeInTheDocument()
  })

  it('has proper ARIA labels for accessibility', () => {
    render(<ShareSection {...mockProps} />)
    
    const section = screen.getByRole('region', { name: 'Share song section' })
    expect(section).toBeInTheDocument()
  })

  it('passes props correctly to sub-components', () => {
    render(<ShareSection {...mockProps} />)
    
    // Check that general note value is passed
    const textarea = screen.getByDisplayValue(mockProps.generalNote)
    expect(textarea).toBeInTheDocument()
    
    // Check that share URL is passed
    const urlInput = screen.getByDisplayValue(mockProps.shareUrl)
    expect(urlInput).toBeInTheDocument()
  })
})

// Integration test for clipboard fallback
describe('ShareURL clipboard fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('falls back to document.execCommand when clipboard API is not available', async () => {
    // Mock environment without clipboard API
    Object.assign(navigator, { clipboard: undefined })
    
    // Mock document.execCommand
    const mockExecCommand = vi.fn().mockReturnValue(true)
    Object.assign(document, { execCommand: mockExecCommand })
    
    const mockProps = {
      shareUrl: 'https://example.com/shared/abc123',
      onCopyUrl: vi.fn(),
      isUrlCopied: false,
    }
    
    render(<ShareURL {...mockProps} />)
    
    const copyButton = screen.getByRole('button', { name: /copy/i })
    fireEvent.click(copyButton)
    
    await waitFor(() => {
      expect(mockExecCommand).toHaveBeenCalledWith('copy')
      expect(mockProps.onCopyUrl).toHaveBeenCalled()
    })
  })
})