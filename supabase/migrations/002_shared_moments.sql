-- Create shared_moments table for storing shared song moments
CREATE TABLE shared_moments (
    id TEXT PRIMARY KEY,
    song_id TEXT NOT NULL,
    song_title TEXT NOT NULL,
    song_artist TEXT NOT NULL,
    song_album TEXT,
    song_artwork TEXT,
    song_platforms JSONB DEFAULT '{}',
    song_duration TEXT,
    general_note TEXT,
    highlights JSONB DEFAULT '[]',
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_shared_moments_song_id ON shared_moments(song_id);
CREATE INDEX idx_shared_moments_created_at ON shared_moments(created_at);
CREATE INDEX idx_shared_moments_views ON shared_moments(views);

-- Add RLS (Row Level Security) policies
ALTER TABLE shared_moments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read shared moments (they're meant to be public)
CREATE POLICY "Anyone can read shared moments" ON shared_moments
    FOR SELECT USING (true);

-- Allow anyone to create shared moments (for now - could be restricted later)
CREATE POLICY "Anyone can create shared moments" ON shared_moments
    FOR INSERT WITH CHECK (true);

-- Allow updating view counts and last accessed time
CREATE POLICY "Anyone can update view counts" ON shared_moments
    FOR UPDATE USING (true)
    WITH CHECK (true);