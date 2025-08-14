import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          username: string
          avatar: string | null
          email: string
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          username: string
          avatar?: string | null
          email: string
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          username?: string
          avatar?: string | null
          email?: string
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      songs: {
        Row: {
          id: string
          title: string
          artist: string
          album: string
          artwork: string | null
          lyrics: string | null
          spotify_url: string | null
          apple_music_url: string | null
          youtube_music_url: string | null
          duration: number | null
          release_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist: string
          album: string
          artwork?: string | null
          lyrics?: string | null
          spotify_url?: string | null
          apple_music_url?: string | null
          youtube_music_url?: string | null
          duration?: number | null
          release_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist?: string
          album?: string
          artwork?: string | null
          lyrics?: string | null
          spotify_url?: string | null
          apple_music_url?: string | null
          youtube_music_url?: string | null
          duration?: number | null
          release_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      moments: {
        Row: {
          id: string
          user_id: string
          song_id: string
          general_note: string | null
          visibility: 'public' | 'followers' | 'private'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          song_id: string
          general_note?: string | null
          visibility?: 'public' | 'followers' | 'private'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          song_id?: string
          general_note?: string | null
          visibility?: 'public' | 'followers' | 'private'
          created_at?: string
          updated_at?: string
        }
      }
      highlights: {
        Row: {
          id: string
          moment_id: string
          text: string
          note: string | null
          start_index: number
          end_index: number
          created_at: string
        }
        Insert: {
          id?: string
          moment_id: string
          text: string
          note?: string | null
          start_index: number
          end_index: number
          created_at?: string
        }
        Update: {
          id?: string
          moment_id?: string
          text?: string
          note?: string | null
          start_index?: number
          end_index?: number
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          moment_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          moment_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          moment_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          moment_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          moment_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          moment_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      visibility_type: 'public' | 'followers' | 'private'
    }
  }
}