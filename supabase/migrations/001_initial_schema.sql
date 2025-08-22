-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE visibility_type AS ENUM ('public', 'followers', 'private');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar TEXT,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs table
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT NOT NULL,
  artwork TEXT,
  lyrics TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  youtube_music_url TEXT,
  duration INTEGER,
  release_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Moments table
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  general_note TEXT,
  visibility visibility_type DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Highlights table
CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  note TEXT,
  start_index INTEGER NOT NULL,
  end_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, moment_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced indexes for better performance
CREATE INDEX idx_moments_user_id ON moments(user_id);
CREATE INDEX idx_moments_song_id ON moments(song_id);
CREATE INDEX idx_moments_created_at ON moments(created_at DESC);
CREATE INDEX idx_moments_visibility ON moments(visibility);
CREATE INDEX idx_moments_user_visibility ON moments(user_id, visibility);
CREATE INDEX idx_highlights_moment_id ON highlights(moment_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_moment_id ON likes(moment_id);
CREATE INDEX idx_likes_user_moment ON likes(user_id, moment_id);
CREATE INDEX idx_comments_moment_id ON comments(moment_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_songs_title ON songs(title);
CREATE INDEX idx_songs_artist ON songs(artist);
CREATE INDEX idx_songs_album ON songs(album);
CREATE INDEX idx_songs_title_artist ON songs(title, artist);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Full text search indexes for songs
CREATE INDEX idx_songs_search ON songs USING gin(to_tsvector('english', title || ' ' || artist || ' ' || album));
CREATE INDEX idx_songs_title_search ON songs USING gin(to_tsvector('english', title));
CREATE INDEX idx_songs_artist_search ON songs USING gin(to_tsvector('english', artist));

-- Additional performance indexes
CREATE INDEX idx_songs_created_at ON songs(created_at DESC);
CREATE INDEX idx_highlights_text_search ON highlights USING gin(to_tsvector('english', text));

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Users can read all profiles, but only update their own
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Songs: Everyone can read songs, only authenticated users can create
CREATE POLICY "Anyone can view songs" ON songs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create songs" ON songs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Moments: Public moments visible to all, private/followers based on visibility
CREATE POLICY "Anyone can view public moments" ON moments FOR SELECT USING (visibility = 'public');
CREATE POLICY "Users can view own moments" ON moments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own moments" ON moments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own moments" ON moments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own moments" ON moments FOR DELETE USING (auth.uid() = user_id);

-- Highlights: Visible based on moment visibility
CREATE POLICY "Anyone can view highlights of public moments" ON highlights FOR SELECT 
  USING (EXISTS (SELECT 1 FROM moments WHERE moments.id = highlights.moment_id AND moments.visibility = 'public'));
CREATE POLICY "Users can view highlights of own moments" ON highlights FOR SELECT 
  USING (EXISTS (SELECT 1 FROM moments WHERE moments.id = highlights.moment_id AND moments.user_id = auth.uid()));
CREATE POLICY "Users can create highlights for own moments" ON highlights FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM moments WHERE moments.id = highlights.moment_id AND moments.user_id = auth.uid()));
CREATE POLICY "Users can update highlights of own moments" ON highlights FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM moments WHERE moments.id = highlights.moment_id AND moments.user_id = auth.uid()));
CREATE POLICY "Users can delete highlights of own moments" ON highlights FOR DELETE 
  USING (EXISTS (SELECT 1 FROM moments WHERE moments.id = highlights.moment_id AND moments.user_id = auth.uid()));

-- Likes: Users can like public moments
CREATE POLICY "Anyone can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can create own likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: Users can comment on public moments
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_moments_updated_at BEFORE UPDATE ON moments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();