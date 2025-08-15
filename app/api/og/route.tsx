import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Song Moment'
    const artist = searchParams.get('artist') || 'Artist'
    const lyrics = searchParams.get('lyrics') || ''
    const note = searchParams.get('note') || ''

    // Truncate lyrics if too long
    const maxLyricsLength = 200
    const displayLyrics = lyrics.length > maxLyricsLength 
      ? lyrics.substring(0, maxLyricsLength) + '...' 
      : lyrics

    // Truncate note if too long
    const maxNoteLength = 150
    const displayNote = note.length > maxNoteLength 
      ? note.substring(0, maxNoteLength) + '...' 
      : note

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(45deg, #f8fafc 0%, #e2e8f0 100%)',
          }}
        >
          {/* Main content container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '900px',
              padding: '60px',
              textAlign: 'center',
            }}
          >
            {/* Song title and artist */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              <h1
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: '0 0 10px 0',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  fontSize: '32px',
                  color: '#6b7280',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                by {artist}
              </p>
            </div>

            {/* Lyrics section */}
            {displayLyrics && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '40px',
                  padding: '30px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '16px',
                  border: '2px solid #e5e7eb',
                  maxWidth: '100%',
                }}
              >
                <p
                  style={{
                    fontSize: '24px',
                    color: '#374151',
                    margin: '0',
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    textAlign: 'center',
                  }}
                >
                  "{displayLyrics}"
                </p>
              </div>
            )}

            {/* Personal note */}
            {displayNote && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '40px',
                  padding: '20px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid #93c5fd',
                  maxWidth: '100%',
                }}
              >
                <p
                  style={{
                    fontSize: '20px',
                    color: '#1e40af',
                    margin: '0',
                    lineHeight: 1.5,
                    textAlign: 'center',
                  }}
                >
                  {displayNote}
                </p>
              </div>
            )}
          </div>

          {/* Footer branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              right: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '25px',
              color: 'white',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🎵</span>
              <span>Created at songdash.io</span>
            </div>
          </div>

          {/* Decorative elements */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              fontSize: '32px',
              opacity: 0.3,
            }}
          >
            🎵
          </div>
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              fontSize: '24px',
              opacity: 0.3,
            }}
          >
            ♪
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '100px',
              left: '30px',
              fontSize: '28px',
              opacity: 0.2,
            }}
          >
            ♫
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
