/**
 * Unit tests for ShareURLGenerator
 * 
 * Note: This project doesn't have a testing framework configured yet.
 * To run these tests, you would need to install and configure vitest.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ShareURLGenerator } from '../lib/share-url-generator'

// Mock fetch globally
global.fetch = vi.fn()

const mockSong = {
  id: '1',
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  image: '/test-image.jpg',
  platforms: {
    spotify: 'https://spotify.com/test',
  }
}

const mockHighlight = {
  id: '1',
  text: 'Test lyric line',
  startIndex: 0,
  endIndex: 15,
  note: 'This is a test note'
}

describe('ShareURLGenerator', () => {
  let generator: ShareURLGenerator
  let mockOnSuccess: ReturnType<typeof vi.fn>
  let mockOnError: ReturnType<typeof vi.fn>
  let mockOnLoading: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    generator = new ShareURLGenerator({ debounceMs: 100 })
    mockOnSuccess = vi.fn()
    mockOnError = vi.fn()
    mockOnLoading = vi.fn()
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://example.com' },
      writable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    generator.cancel()
  })

  describe('generateShareURL', () => {
    it('debounces multiple rapid calls', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ shareUrl: 'https://example.com/shared/abc123' }),
      } as Response)

      // Make multiple rapid calls
      generator.generateShareURL(mockSong, [mockHighlight], 'Test note', mockOnSuccess, mockOnError, mockOnLoading)
      generator.generateShareURL(mockSong, [mockHighlight], 'Test note', mockOnSuccess, mockOnError, mockOnLoading)
      generator.generateShareURL(mockSong, [mockHighlight], 'Test note', mockOnSuccess, mockOnError, mockOnLoading)

      // Should only call loading once initially
      expect(mockOnLoading).toHaveBeenCalledTimes(1)
      expect(mockOnLoading).toHaveBeenCalledWith(true)

      // Fast-forward past debounce delay
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()

      // Should only make one API call
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
      expect(mockOnSuccess).toHaveBeenCalledWith('https://example.com/shared/abc123')
    })

    it('does not regenerate URL for identical content', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ shareUrl: 'https://example.com/shared/abc123' }),
      } as Response)

      // First call
      generator.generateShareURL(mockSong, [mockHighlight], 'Test note', mockOnSuccess, mockOnError, mockOnLoading)
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)

      vi.clearAllMocks()

      // Second call with identical content
      generator.generateShareURL(mockSong, [mockHighlight], 'Test note', mockOnSuccess, mockOnError, mockOnLoading)
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()

      // Should not make another API call
      expect(mockFetch).not.toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
      expect(mockOnLoading).not.toHaveBeenCalled()
    })

    it('regenerates URL when content changes', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ shareUrl: 'https://example.com/shared/abc123' }),
      } as Response)

      // First call
      generator.generateShareURL(mockSong, [mockHighlight], 'Test note', mockOnSuccess, mockOnError, mockOnLoading)
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()

      expect(mockFetch).toHaveBeenCalledTimes(1)

      vi.clearAllMocks()

      // Second call with different content
      generator.generateShareURL(mockSong, [mockHighlight], 'Different note', mockOnSuccess, mockOnError, mockOnLoading)
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()

      // Should make another API call
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })

    it('falls back to client-side generation when API fails', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockRejectedValue(new Error('API Error'))

      generator.generateShareURL(mockSong, [mockHighlight], 'Test note', mockOnSuccess, mockOnError, mockOnLoading)
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()

      // Should call success with client-side generated URL
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
      expect(mockOnSuccess).toHaveBeenCalledWith('https://example.com/shared/eyJzb25nIjp7Im')
    })

    it('retries failed API calls before falling back', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockRejectedValue(new Error('API Error'))

      const generatorWithRetries = new ShareURLGenerator({ 
        debounceMs: 100, 
        maxRetries: 2,
        retryDelayMs: 50 
      })

      generatorWithRetries.generateShareURL(mockSong, [mockHighlight], 'Test note', mockOnSuccess, mockOnError, mockOnLoading)
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()

      // Should have tried API call twice (initial + 1 retry) before fallback
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })

    it('calls onError when both API and fallback fail', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockRejectedValue(new Error('API Error'))

      // Mock btoa to fail (simulate client-side generation failure)
      const originalBtoa = global.btoa
      global.btoa = vi.fn().mockImplementation(() => {
        throw new Error('btoa failed')
      })

      generator.generateShareURL(mockSong, [mockHighlight], 'Test note', mockOnSuccess, mockOnError, mockOnLoading)
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()

      expect(mockOnError).toHaveBeenCalledTimes(1)
      expect(mockOnError).toHaveBeenCalledWith('btoa failed')

      // Restore btoa
      global.btoa = originalBtoa
    })

    it('filters out highlights without notes', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ shareUrl: 'https://example.com/shared/abc123' }),
      } as Response)

      const highlightWithoutNote = {
        id: '2',
        text: 'Another line',
        startIndex: 16,
        endIndex: 28,
      }

      generator.generateShareURL(
        mockSong, 
        [mockHighlight, highlightWithoutNote], 
        'Test note', 
        mockOnSuccess, 
        mockOnError, 
        mockOnLoading
      )
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()

      expect(mockFetch).toHaveBeenCalledWith('/api/moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          song: mockSong,
          highlights: [mockHighlight], // Should only include highlight with note
          generalNote: 'Test note',
          createdAt: expect.any(String),
        }),
      })
    })

    it('omits empty general note from API call', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ shareUrl: 'https://example.com/shared/abc123' }),
      } as Response)

      generator.generateShareURL(mockSong, [mockHighlight], '   ', mockOnSuccess, mockOnError, mockOnLoading)
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()

      expect(mockFetch).toHaveBeenCalledWith('/api/moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          song: mockSong,
          highlights: [mockHighlight],
          generalNote: undefined, // Should be undefined for empty/whitespace-only note
          createdAt: expect.any(String),
        }),
      })
    })
  })

  describe('cancel', () => {
    it('cancels pending generation', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ shareUrl: 'https://example.com/shared/abc123' }),
      } as Response)

      generator.generateShareURL(mockSong, [mockHighlight], 'Test note', mockOnSuccess, mockOnError, mockOnLoading)
      
      // Cancel before debounce completes
      generator.cancel()
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()

      // Should not make API call
      expect(mockFetch).not.toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })
  })

  describe('reset', () => {
    it('resets generator state', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ shareUrl: 'https://example.com/shared/abc123' }),
      } as Response)

      // First generation
      generator.generateShareURL(mockSong, [mockHighlight], 'Test note', mockOnSuccess, mockOnError, mockOnLoading)
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()

      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Reset and generate again with same content
      generator.reset()
      vi.clearAllMocks()

      generator.generateShareURL(mockSong, [mockHighlight], 'Test note', mockOnSuccess, mockOnError, mockOnLoading)
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()

      // Should make API call again since state was reset
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })
})