# SongDash - Social Music Sharing App

A modern social platform for sharing song moments with highlighted lyrics and personal notes. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

🎵 **Social Music Sharing** - Share song moments with personal notes and highlighted lyrics  
📱 **Mobile-First Design** - Optimized for mobile devices with touch-friendly interactions  
💬 **Social Engagement** - Like, comment, and share functionality  
🔍 **Song Discovery** - Search for songs to create moments with  
✨ **Lyrics Highlighting** - Interactive text selection and note-taking  
👤 **User Profiles** - Personal profiles with stats and moment history  
🎨 **Polished UI** - Smooth animations and visual feedback  

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (optional - app works with mock data)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd songdash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### Mock Data Mode (Default)

The app runs with mock data by default. No additional setup required.

### Supabase Mode (Production)

1. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

2. **Update environment variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_API_MODE=supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run database migrations**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Initialize Supabase
   supabase init

   # Link to your project
   supabase link --project-ref your-project-ref

   # Run migrations
   supabase db push

   # Seed the database
   supabase db seed
   ```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page (social feed)
│   ├── create/            # Song search and selection
│   ├── song/[id]/         # Song detail and moment creation
│   └── profile/           # User profile
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── bottom-navigation.tsx
│   ├── moment-card.tsx
│   ├── social-feed.tsx
│   └── user-avatar.tsx
├── lib/                   # Utilities and API
│   ├── api.ts            # Main API interface
│   ├── mock-api.ts       # Mock data implementation
│   ├── supabase-api.ts   # Supabase implementation
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # TypeScript types
│   └── mock-data.ts      # Mock data
├── supabase/             # Database schema and migrations
│   ├── migrations/
│   └── seed.sql
└── __tests__/            # Test files
```

## API Modes

The app supports two API modes:

### Mock Mode (`NEXT_PUBLIC_API_MODE=mock`)
- Uses local mock data
- No database required
- Perfect for development and testing
- Data resets on page refresh

### Supabase Mode (`NEXT_PUBLIC_API_MODE=supabase`)
- Uses Supabase PostgreSQL database
- Persistent data storage
- Real-time features
- Production ready

## Database Schema

### Tables
- **users** - User profiles and authentication
- **songs** - Song metadata and lyrics
- **moments** - Shared song moments
- **highlights** - Highlighted lyric sections
- **likes** - User likes on moments
- **comments** - User comments on moments

### Key Features
- Row Level Security (RLS) enabled
- Full-text search on songs
- Optimized indexes for performance
- Automatic timestamp management

## Development

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format
```

### Building for Production
```bash
npm run build
npm start
```

## Features in Detail

### Social Feed
- Displays shared song moments from all users
- Real-time like and comment counts
- Expandable highlighted lyrics
- Infinite scroll pagination

### Song Search
- Real-time search across song titles, artists, and albums
- Popular songs displayed by default
- Smooth animations and loading states

### Moment Creation
- Interactive lyrics highlighting
- Personal note input
- Multiple highlights per song
- Save and share functionality

### User Profiles
- Personal stats (moments, followers, following)
- User's shared moments
- Profile customization

### Mobile Experience
- Touch-friendly interactions
- Bottom navigation
- Responsive design
- Native-like animations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Design inspired by modern social media platforms
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Database powered by [Supabase](https://supabase.com/)