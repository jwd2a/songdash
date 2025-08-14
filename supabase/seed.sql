-- Insert sample users
INSERT INTO users (id, name, username, email, bio) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Alex Chen', '@alexchen', 'alex@example.com', 'Music enthusiast sharing daily vibes ✨'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sarah Kim', '@sarahkim', 'sarah@example.com', 'Indie rock lover 🎸 Always discovering new artists'),
  ('550e8400-e29b-41d4-a716-446655440003', 'You', '@you', 'you@example.com', 'Music lover sharing moments that matter ✨');

-- Insert sample songs
INSERT INTO songs (id, title, artist, album, lyrics, spotify_url, apple_music_url) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Blinding Lights', 'The Weeknd', 'After Hours', 
   'Yeah, I''ve been trying to call
I''ve been on my own for long enough
Maybe you can show me how to love, maybe
I feel like I''m just missing something whenever you''re gone

''Cause I wanna be in love (For real, for real)
I just wanna be in love (For real)
I''m running out of time
''Cause I can see the sun light up the sky
So I hit the road in overdrive, baby, oh

The city''s cold and empty (Oh)
No one''s around to judge me (Oh)
I can''t see clearly when you''re gone

I said, ooh, I''m blinded by the lights
No, I can''t sleep until I feel your touch
I said, ooh, I''m drowning in the night
Oh, when I''m like this, you''re the one I trust
I''m running out of time
''Cause I can see the sun light up the sky
So I hit the road in overdrive, baby, oh',
   'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
   'https://music.apple.com/us/album/blinding-lights/1499378108?i=1499378116'),
   
  ('660e8400-e29b-41d4-a716-446655440002', 'Good 4 U', 'Olivia Rodrigo', 'SOUR',
   'Well, good for you, I guess you moved on really easily
You found a new girl and it only took a couple weeks
Remember when you said that you wanted to give me the world?
And good for you, I guess that you''ve been workin'' on yourself
I guess that therapist I found for you, she really helped
Now you can be a better man for your brand new girl

Well, good for you, you look happy and healthy, not me
If you ever cared to ask
Good for you, you''re doin'' great out there without me, baby
God, I wish that I could do that

I''ve lost my mind, I''ve spent the night cryin'' on the floor of my bathroom
But you''re so unaffected, I really don''t get it
But I guess good for you',
   'https://open.spotify.com/track/4ZtFanR9U6ndgddUvNcjcG',
   'https://music.apple.com/us/album/good-4-u/1560735219?i=1560735496'),
   
  ('660e8400-e29b-41d4-a716-446655440003', 'Levitating', 'Dua Lipa', 'Future Nostalgia',
   'If you wanna run away with me, I know a galaxy
And I can take you for a ride
I had a premonition that we fell into a rhythm
Where the music don''t stop for life
Glitter in the sky, glitter in my eyes
Shining just the way I like
If you''re feeling like you need a little bit of company
You met me at the perfect time

You want me, I want you, baby
My sugarboo, I''m levitating
The Milky Way, we''re renegading
Yeah, yeah, yeah, yeah, yeah

I got you, moonlight, you''re my starlight
I need you all night, come on, dance with me
I''m levitating
You, moonlight, you''re my starlight (You''re the moonlight)
I need you all night, come on, dance with me
I''m levitating',
   'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9',
   'https://music.apple.com/us/album/levitating/1499378108?i=1499378135');

-- Insert sample moments
INSERT INTO moments (id, user_id, song_id, general_note, visibility) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'This song always gets me hyped! Perfect for morning runs 🏃', 'public'),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'When you need to feel your feelings 💜', 'public');

-- Insert sample highlights
INSERT INTO highlights (moment_id, text, note, start_index, end_index) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'I can see the sun light up the sky', 'Love this uplifting line', 245, 275),
  ('770e8400-e29b-41d4-a716-446655440002', 'Good for you, you''re doing great out there without me', 'This hits different', 156, 208),
  ('770e8400-e29b-41d4-a716-446655440002', 'I guess that therapist I found for you, she really helped', 'So relatable', 89, 144);

-- Insert sample likes
INSERT INTO likes (user_id, moment_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002');

-- Insert sample comments
INSERT INTO comments (user_id, moment_id, content) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'Totally agree! This song is perfect for workouts'),
  ('550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'Adding this to my running playlist right now'),
  ('550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'Olivia really knows how to capture those feelings');