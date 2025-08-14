# Design Document

## Overview

This design transforms the SongDash app into a comprehensive social music sharing platform with a mobile-first approach. The new design features three main sections: a social feed for discovering shared moments, a song search and selection interface for creating new moments, and a detailed song view for highlighting lyrics and adding personal notes. The design emphasizes clean typography, intuitive navigation, and engaging social interactions.

## Architecture

### Application Structure

The redesigned app follows a three-tab structure with distinct user flows:

```
SongDash App
├── Feed Tab (Home)
│   ├── Social Feed
│   ├── Moment Cards
│   └── Engagement Actions
├── Share Tab
│   ├── Song Search
│   ├── Song Selection
│   └── Moment Creation
└── Profile Tab
    ├── User Profile
    ├── User's Moments
    └── Settings
```

### Page Hierarchy

1. **Feed Page** - Social feed showing shared moments from all users
2. **Share Page** - Song search and selection interface
3. **Song Detail Page** - Lyrics display with highlighting and note-taking
4. **Profile Page** - User profile and personal moments

## Components and Interfaces

### SocialFeed Component

**Purpose**: Main feed displaying shared song moments from all users
**Location**: Feed tab home page

**Visual Design**:
- Vertical scrolling list of moment cards
- Clean white background with subtle shadows
- User profile integration with avatars and names
- Engagement metrics prominently displayed

**Props Interface**:
```typescript
interface SocialFeedProps {
  moments: SharedMoment[]
  onLike: (momentId: string) => void
  onComment: (momentId: string, comment: string) => void
  onShare: (momentId: string) => void
}
```

### MomentCard Component

**Purpose**: Individual card displaying a shared song moment

**Features**:
- User profile information with avatar and timestamp
- Song information with album artwork
- Personal note from the user
- Highlighted lyrics display (collapsible)
- Engagement actions (like, comment, share)

**Visual Design**:
- Card-based layout with rounded corners
- User info at the top with profile picture
- Song artwork and metadata
- Highlighted lyrics in a distinct style
- Action buttons at the bottom

### SongSearch Component

**Purpose**: Search interface for finding songs to create moments with

**Features**:
- Search input with placeholder text
- Real-time search results
- Song cards with artwork, title, artist, and album
- Selection functionality

**Visual Design**:
- Centered search bar at the top
- Grid or list layout for search results
- Consistent song card design
- Clear selection states

### SongDetail Component

**Purpose**: Detailed view for creating moments with lyrics and notes

**Features**:
- Song header with title, artist, and change button
- Note input area for general song thoughts
- Full lyrics display with text selection
- Highlighting functionality
- Instructions for interaction

**Visual Design**:
- Song info prominently displayed at top
- Note input with placeholder text
- Lyrics in readable typography
- Clear highlighting visual feedback
- Instructional text for guidance

### BottomNavigation Component

**Purpose**: Main navigation between app sections

**Features**:
- Three tabs: Feed, Share, Profile
- Active state indication
- Icon and label for each tab

**Visual Design**:
- Fixed bottom position
- Clean tab design with icons
- Active state highlighting
- Consistent with mobile app patterns

## Data Models

### SharedMoment Interface

```typescript
interface SharedMoment {
  id: string
  user: {
    id: string
    name: string
    username: string
    avatar: string
  }
  song: {
    id: string
    title: string
    artist: string
    album: string
    artwork: string
  }
  generalNote?: string
  highlights: HighlightedSection[]
  engagement: {
    likes: number
    comments: number
    isLikedByUser: boolean
  }
  createdAt: string
  updatedAt: string
}
```

### HighlightedSection Interface

```typescript
interface HighlightedSection {
  id: string
  text: string
  startIndex: number
  endIndex: number
  note?: string
  createdAt: string
}
```

### User Interface

```typescript
interface User {
  id: string
  name: string
  username: string
  avatar: string
  email: string
  createdAt: string
}
```

### Song Interface

```typescript
interface Song {
  id: string
  title: string
  artist: string
  album: string
  artwork: string
  lyrics?: string
  platforms: {
    spotify?: string
    appleMusic?: string
    youtubeMusic?: string
  }
}
```

## Error Handling

### URL Generation Failures
- **Fallback Strategy**: Client-side base64 encoding if API fails
- **User Feedback**: Show error message with retry option
- **Graceful Degradation**: Allow manual URL sharing if all else fails

### Copy to Clipboard Failures
- **Fallback Strategy**: Select text for manual copying
- **User Feedback**: Show instructions for manual copying
- **Browser Compatibility**: Handle older browsers without clipboard API

### Real-time Updates
- **Debouncing**: Prevent excessive URL regeneration during rapid changes
- **Error Recovery**: Retry failed updates automatically
- **State Consistency**: Ensure UI reflects actual share state

## Testing Strategy

### Unit Tests
- ShareSection component rendering with different states
- URL generation and copying functionality
- General note input validation and auto-save
- Share preview content accuracy

### Integration Tests
- Full share flow from highlighting to URL generation
- Real-time URL updates when content changes
- Copy functionality across different browsers
- Mobile responsiveness and touch interactions

### User Experience Tests
- First-time user guidance effectiveness
- Share URL discoverability and usability
- Performance impact of always-visible sharing
- Accessibility compliance for screen readers

## Implementation Considerations

### Performance
- **Debounced URL Generation**: Prevent excessive API calls during rapid changes
- **Memoization**: Cache share URLs to avoid regeneration
- **Lazy Loading**: Load share functionality only when needed

### Accessibility
- **Screen Reader Support**: Proper ARIA labels for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility for all share functions
- **Focus Management**: Logical tab order through share elements
- **High Contrast**: Ensure share elements work with high contrast modes

### Mobile Optimization
- **Touch Targets**: Ensure buttons are appropriately sized for touch
- **Responsive Layout**: Share section adapts to different screen sizes
- **Native Share**: Integrate with native sharing on mobile devices
- **Clipboard Handling**: Handle mobile clipboard limitations

### Real-time Updates
- **State Management**: Efficient updates when highlights or notes change
- **URL Regeneration**: Smart regeneration only when content actually changes
- **User Feedback**: Clear indication when share content is updating

## Visual Design Specifications

### Color Scheme
- **Primary Brand**: SongDash branding with clean, modern aesthetic
- **Backgrounds**: Clean white backgrounds with subtle shadows for cards
- **Accents**: Blue accent color for primary actions and highlights
- **Text**: High contrast black text on white backgrounds
- **Muted Elements**: Gray text for secondary information and placeholders

### Typography
- **Headers**: Bold, clean sans-serif for song titles and user names
- **Body Text**: Regular weight for lyrics and notes
- **Metadata**: Smaller, muted text for timestamps and secondary info
- **Interactive Elements**: Clear, readable text for buttons and links

### Layout Principles
- **Mobile-First**: Optimized for mobile devices with touch-friendly interactions
- **Single Column**: Vertical layout for easy scrolling and reading
- **Card-Based**: Individual moments displayed in distinct cards
- **Consistent Spacing**: Uniform padding and margins throughout

### Interactive Elements
- **Touch Targets**: Appropriately sized for mobile interaction
- **Visual Feedback**: Clear states for likes, selections, and interactions
- **Navigation**: Bottom tab bar following mobile app conventions
- **Accessibility**: High contrast and screen reader friendly

### Component Styling
- **Moment Cards**: White background, subtle shadow, rounded corners
- **User Profiles**: Circular avatars, clear name hierarchy
- **Song Information**: Prominent display with artwork integration
- **Engagement Actions**: Clear iconography with counts
- **Search Interface**: Clean input design with clear results display