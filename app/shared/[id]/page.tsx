import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SharedMomentClient from './shared-moment-client'

interface SharedMoment {
  id: string
  song_id: string
  song_title: string
  song_artist: string
  song_album: string
  song_artwork: string
  song_platforms: {
    spotify?: string
    appleMusic?: string
    youtubeMusic?: string
  }
  song_duration: string
  general_note?: string
  highlights: Array<{
    id: string
    text: string
    note: string | null
    startIndex: number
    endIndex: number
  }>
  created_at: string
  views: number
}

async function getMoment(id: string): Promise<SharedMoment | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    (process.env.NODE_ENV === 'production' ? 'https://songdash.io' : 'http://localhost:3000')

    const response = await fetch(`${baseUrl}/api/moments?id=${id}`, {
      cache: 'no-store' // Always fetch fresh data for view count
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching moment:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const moment = await getMoment(params.id)

  if (!moment) {
    return {
      title: 'Moment not found - SongDash',
      description: 'This shared moment could not be found.'
    }
  }

  // Build description with song info and user's comment
  const description = moment.general_note
    ? `"${moment.general_note}" - ${moment.song_title} by ${moment.song_artist}`
    : `Check out "${moment.song_title}" by ${moment.song_artist} on SongDash`

  // Get the first highlighted lyric if available
  const firstLyric = moment.highlights?.length > 0 ? moment.highlights[0].text : ''

  // Build OG image URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                  (process.env.NODE_ENV === 'production' ? 'https://songdash.io' : 'http://localhost:3000')

  const ogImageUrl = new URL(`${baseUrl}/api/og`)
  ogImageUrl.searchParams.set('title', moment.song_title)
  ogImageUrl.searchParams.set('artist', moment.song_artist)
  ogImageUrl.searchParams.set('lyrics', firstLyric)
  ogImageUrl.searchParams.set('note', moment.general_note || '')

  return {
    title: `${moment.song_title} by ${moment.song_artist} - SongDash`,
    description,
    openGraph: {
      title: `${moment.song_title} by ${moment.song_artist}`,
      description,
      type: 'website',
      siteName: 'SongDash',
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: `${moment.song_title} by ${moment.song_artist}`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${moment.song_title} by ${moment.song_artist}`,
      description,
      images: [ogImageUrl.toString()],
    },
  }
}

export default async function SharedMomentPage({ params }: { params: { id: string } }) {
  const moment = await getMoment(params.id)

  if (!moment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6 px-6">
          <div className="text-6xl">🎵</div>
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-gray-900">
              Moment not found
            </h3>
            <p className="text-gray-600">
              This shared moment may have been removed or the link is invalid.
            </p>
          </div>
          <Link href="/create" className="inline-block">
            <span className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Create your own moment →
            </span>
          </Link>
        </div>
      </div>
    )
  }

  return <SharedMomentClient initialMoment={moment} />
}
