// Mock data for development and testing

import { User, Song, SharedMoment, HighlightedSection } from './types'

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Alex Chen",
    username: "@alexchen",
    avatar: "/placeholder.svg",
    email: "alex@example.com",
    bio: "Music enthusiast sharing daily vibes ✨",
    stats: {
      moments: 45,
      followers: 234,
      following: 156
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "user-2", 
    name: "Sarah Kim",
    username: "@sarahkim",
    avatar: "/placeholder.svg",
    email: "sarah@example.com",
    bio: "Indie rock lover 🎸 Always discovering new artists",
    stats: {
      moments: 67,
      followers: 445,
      following: 203
    },
    createdAt: "2024-01-10T14:30:00Z",
    updatedAt: "2024-01-10T14:30:00Z"
  },
  {
    id: "current-user",
    name: "You",
    username: "@you",
    avatar: "/placeholder.svg", 
    email: "you@example.com",
    bio: "Music lover sharing moments that matter ✨",
    stats: {
      moments: 12,
      followers: 156,
      following: 89
    },
    createdAt: "2024-01-20T09:15:00Z",
    updatedAt: "2024-01-20T09:15:00Z"
  }
]

export const mockSongs: Song[] = [
  {
    id: "song-1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    artwork: "/placeholder.svg",
    lyrics: `Yeah, I've been trying to call
I've been on my own for long enough
Maybe you can show me how to love, maybe
I feel like I'm just missing something whenever you're gone

'Cause I wanna be in love (For real, for real)
I just wanna be in love (For real)
I'm running out of time
'Cause I can see the sun light up the sky
So I hit the road in overdrive, baby, oh

The city's cold and empty (Oh)
No one's around to judge me (Oh)
I can't see clearly when you're gone

I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch
I said, ooh, I'm drowning in the night
Oh, when I'm like this, you're the one I trust
I'm running out of time
'Cause I can see the sun light up the sky
So I hit the road in overdrive, baby, oh`,
    platforms: {
      spotify: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b",
      appleMusic: "https://music.apple.com/us/album/blinding-lights/1499378108?i=1499378116"
    },
    duration: 200,
    releaseDate: "2019-11-29"
  },
  {
    id: "song-2",
    title: "Good 4 U",
    artist: "Olivia Rodrigo", 
    album: "SOUR",
    artwork: "/placeholder.svg",
    lyrics: `Well, good for you, I guess you moved on really easily
You found a new girl and it only took a couple weeks
Remember when you said that you wanted to give me the world?
And good for you, I guess that you've been workin' on yourself
I guess that therapist I found for you, she really helped
Now you can be a better man for your brand new girl

Well, good for you, you look happy and healthy, not me
If you ever cared to ask
Good for you, you're doin' great out there without me, baby
God, I wish that I could do that

I've lost my mind, I've spent the night cryin' on the floor of my bathroom
But you're so unaffected, I really don't get it
But I guess good for you`,
    platforms: {
      spotify: "https://open.spotify.com/track/4ZtFanR9U6ndgddUvNcjcG",
      appleMusic: "https://music.apple.com/us/album/good-4-u/1560735219?i=1560735496"
    },
    duration: 178,
    releaseDate: "2021-05-14"
  },
  {
    id: "song-3",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia", 
    artwork: "/placeholder.svg",
    lyrics: `If you wanna run away with me, I know a galaxy
And I can take you for a ride
I had a premonition that we fell into a rhythm
Where the music don't stop for life
Glitter in the sky, glitter in my eyes
Shining just the way I like
If you're feeling like you need a little bit of company
You met me at the perfect time

You want me, I want you, baby
My sugarboo, I'm levitating
The Milky Way, we're renegading
Yeah, yeah, yeah, yeah, yeah

I got you, moonlight, you're my starlight
I need you all night, come on, dance with me
I'm levitating
You, moonlight, you're my starlight (You're the moonlight)
I need you all night, come on, dance with me
I'm levitating`,
    platforms: {
      spotify: "https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9",
      appleMusic: "https://music.apple.com/us/album/levitating/1499378108?i=1499378135"
    },
    duration: 203,
    releaseDate: "2020-03-27"
  }
]

export const mockHighlights: HighlightedSection[] = [
  {
    id: "highlight-1",
    text: "I can see the sun light up the sky",
    startIndex: 245,
    endIndex: 275,
    note: "Love this uplifting line",
    createdAt: "2024-01-22T15:30:00Z"
  },
  {
    id: "highlight-2", 
    text: "Good for you, you're doing great out there without me",
    startIndex: 156,
    endIndex: 208,
    note: "This hits different",
    createdAt: "2024-01-21T12:45:00Z"
  },
  {
    id: "highlight-3",
    text: "I guess that therapist I found for you, she really helped",
    startIndex: 89,
    endIndex: 144,
    note: "So relatable",
    createdAt: "2024-01-21T12:46:00Z"
  }
]

export const mockMoments: SharedMoment[] = [
  {
    id: "moment-1",
    user: mockUsers[0],
    song: mockSongs[0],
    generalNote: "This song always gets me hyped! Perfect for morning runs 🏃",
    highlights: [mockHighlights[0]],
    engagement: {
      likes: 23,
      comments: 5,
      shares: 3,
      isLikedByUser: false,
      isBookmarkedByUser: false
    },
    visibility: 'public',
    createdAt: "2024-01-22T15:30:00Z",
    updatedAt: "2024-01-22T15:30:00Z"
  },
  {
    id: "moment-2",
    user: mockUsers[1], 
    song: mockSongs[1],
    generalNote: "When you need to feel your feelings 💜",
    highlights: [mockHighlights[1], mockHighlights[2]],
    engagement: {
      likes: 41,
      comments: 12,
      shares: 7,
      isLikedByUser: true,
      isBookmarkedByUser: true
    },
    visibility: 'public',
    createdAt: "2024-01-21T12:45:00Z",
    updatedAt: "2024-01-21T12:45:00Z"
  }
]

// Helper functions for mock API calls
export const getMockUser = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id)
}

export const getMockSong = (id: string): Song | undefined => {
  return mockSongs.find(song => song.id === id)
}

export const getMockMoment = (id: string): SharedMoment | undefined => {
  return mockMoments.find(moment => moment.id === id)
}

export const searchMockSongs = (query: string): Song[] => {
  const lowercaseQuery = query.toLowerCase()
  return mockSongs.filter(song => 
    song.title.toLowerCase().includes(lowercaseQuery) ||
    song.artist.toLowerCase().includes(lowercaseQuery) ||
    song.album.toLowerCase().includes(lowercaseQuery)
  )
}

export const getMockUserMoments = (userId: string): SharedMoment[] => {
  return mockMoments.filter(moment => moment.user.id === userId)
}