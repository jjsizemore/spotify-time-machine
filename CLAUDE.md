# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application called "Jermaine's Spotify Time Machine" that allows users to explore their Spotify listening history, create playlists based on specific time periods, and visualize their music journey. The application uses enterprise-grade infrastructure with advanced token management, request queuing, and comprehensive error handling.

## Development Commands

### Primary Development Commands

- `pnpm dev` - Start development server with Turbopack at 127.0.0.1:3000
- `pnpm build` - Build production version
- `pnpm start` - Start production server
- `pnpm lint` - Run Oxlint
- `pnpm fmt` - Format code with Prettier
- `pnpm debug` - Clean, install, build, and run dev server

### Other Commands

- `pnpm clean` - Remove .next directory

### Testing Commands

- Linting: `trunk check` or `trunk check --all`
- Formatting: `trunk fmt`
- Manual token refresh testing: `curl -X POST http://localhost:3000/api/auth/refresh-token`

## High-Level Architecture

### Core Framework Stack

- **Next.js 15.3.3** with App Router (`src/app/` directory structure)
- **React 19.1.0** with concurrent features
- **TypeScript 5.8.3** with strict type checking
- **Tailwind CSS 4.1.10** for styling (note: uses CSS-based config, not tailwind.config.ts)
- **NextAuth.js 4.24.11** for Spotify OAuth authentication

### Authentication Architecture

The application uses a sophisticated OAuth flow with enhanced security:

- **PKCE (Proof Key for Code Exchange)** implementation with server-side client secret
- **Proactive token refresh** with 5-minute buffer time before expiration
- **Automatic token rotation** with comprehensive error recovery
- **Session management** using JWT strategy with 1-hour sessions
- **Development debugging** with real-time token monitoring

Key files:

- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `src/hooks/useSpotify.ts` - Central authentication hook
- `src/lib/tokenUtils.ts` - Token management utilities

### Spotify API Client Architecture

The application features an enterprise-grade Spotify API client with:

- **Request queuing system** with priority-based processing
- **Rate limiting protection** with 100ms minimum interval between requests
- **Exponential backoff with jitter** for retry logic (max 3 retries)
- **Request deduplication** to prevent duplicate API calls
- **60-second timeout protection** for pending requests
- **Comprehensive error handling** with SpotifyApiError class

Key files:

- `src/lib/spotify.ts` - Main Spotify API client class
- `src/hooks/useSpotify.ts` - React integration hook

### Data Management & Caching

Advanced caching system with:

- **Progressive loading** with multiple cache keys
- **TTL (Time To Live)** for cache entries
- **Maximum cache size limits** with automatic cleanup
- **Robust error handling** with detailed error categorization
- **React Query 5.80.7** for server state management

Key files:

- `src/lib/cacheUtils.ts` - Cache management utilities
- `src/hooks/useLikedTracks.ts` - Liked tracks data fetching
- `src/hooks/useLikedArtists.ts` - Artist data fetching
- `src/hooks/useUserStats.ts` - User statistics

### Component Architecture

The UI is built with reusable React components:

**Core Layout Components:**

- `src/app/layout.tsx` - Root layout with providers
- `src/components/LayoutContent.tsx` - Main page structure
- `src/components/PageContainer.tsx` - Standard page wrapper
- `src/components/Navigation.tsx` - Main navigation bar

**Data Visualization Components:**

- `src/components/DataFetcherAndControlsWrapper.tsx` - Standardizes data fetching with controls
- `src/components/VisualizationContainer.tsx` - Wrapper for visualizations with loading/error states
- `src/components/ListeningTrends.tsx` - Monthly listening trends chart
- `src/components/GenreTrendsVisualization.tsx` - Genre evolution over time

**Feature Components:**

- `src/components/MonthlyTrackList.tsx` - Monthly track listings with playlist creation
- `src/components/TrackItem.tsx` - Individual track display
- `src/components/FilterSelector.tsx` - Multi-select filter UI
- `src/components/TokenStatus.tsx` - Development-only token monitoring

## Development Tools & Code Quality

### Linting and Formatting

- **Oxlint** for primary linting
- **Prettier** for styling
- **Stylelint** configured for Tailwind CSS v4 compatibility

### Security & Quality Scanning

- **TruffleHog** for secret detection
- **OSV Scanner** for vulnerability scanning
- **Checkov** for infrastructure security
- **Automatic pre-commit hooks** for code quality

### Development Debugging

- **TokenStatus widget** (development only) - Real-time token monitoring
- **Queue status monitoring** via `getQueueStatus()` function
- **Manual token refresh endpoint** at `/api/auth/refresh-token`
- **Comprehensive console logging** with emoji indicators

## Critical Development Patterns

### 1. Authentication Hook Usage

Always use the enhanced `useSpotify` hook for Spotify API interactions:

```typescript
const { spotifyApi, isReady, error, retry } = useSpotify();

// Always check isReady before API calls
if (!isReady) return <LoadingSpinner />;
if (error) return <ErrorDisplay message={error} onRetry={retry} />;

// Now safe to use spotifyApi
```

### 2. Error Handling Pattern

Import and use `SpotifyApiError` consistently:

```typescript
import { SpotifyApiError } from '@/lib/spotify';

try {
  const result = await spotifyApi.getSomeData();
  return result.body;
} catch (error) {
  if (error instanceof SpotifyApiError) {
    console.error(`Spotify API Error ${error.status}:`, error.message);
    throw new Error(`Spotify API Error: ${error.message}`);
  }
  throw error;
}
```

### 3. Component Development

- Use `DataFetcherAndControlsWrapper` for data-driven visualizations
- Implement loading states with `LoadingSpinner`
- Use `ErrorDisplay` with retry functionality for error handling
- Follow the established component patterns in existing files

## Environment Setup

### Required Environment Variables

Create `.env.local` with:

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXTAUTH_URL=http://127.0.0.1:3000
NEXTAUTH_SECRET=your_nextauth_secret
DATABASE_URL=your_postgresql_connection_string
```

### Development Server Configuration

- Uses Turbopack for faster builds
- Runs on 127.0.0.1:3000 (not localhost) for OAuth compatibility
- Flowbite React applies patches automatically

## Common Workflows

### Adding New Features

1. Check `TODO.md` for current implementation priorities
2. Use established patterns from existing components
3. Implement error handling with `SpotifyApiError`
4. Add loading states and user feedback
5. Test with development debugging tools
6. Run `trunk check` for code quality

### API Integration

1. Use the `spotifyApi` instance from `useSpotify` hook
2. Implement proper error handling with retry logic
3. Leverage the request queuing system for reliability
4. Use appropriate priority levels for different endpoints
5. Monitor queue status during development

### Database Changes

1. Modify `backend/src/database/`
2. Database uses PostgreSQL with NextAuth.js adapter

## Performance Considerations

### Spotify API Optimization

- The API client implements sophisticated rate limiting and queuing
- Requests are automatically deduped to prevent redundant calls
- Priority system ensures critical requests are processed first
- Exponential backoff prevents overwhelming the API during issues

### Caching Strategy

- Implement TTL-based caching for frequently accessed data
- Use cache size limits to prevent memory issues
- Leverage React Query for server state management
- Consider server-side data aggregation for complex visualizations

### SEO & Performance

- Implements Core Web Vitals monitoring
- Uses Next.js 15 performance optimizations
- PWA capabilities with service worker caching
- Comprehensive structured data for search engines

## Security Notes

- Never commit secrets to the repository
- Development debugging tools are automatically excluded from production builds
- PKCE implementation enhances OAuth security
- Request validation and error message sanitization prevent information leakage
- Automated security scanning runs on all commits
