# Jermaine's Spotify Time Machine

A Next.js application that lets you explore your Spotify listening history, create playlists based on specific time periods, and visualize your music journey. Now featuring **enterprise-grade infrastructure** with advanced token management, request queuing, and comprehensive debugging tools.

## Development Status

This project is actively being developed. For detailed implementation status and priorities, see [TODO.md](./TODO.md).

## Features

### 🎵 Music Discovery & Analytics
- **Comprehensive Dashboard:**
  - View your top artists, tracks, genres, and recently played tracks
  - Interactive visualizations for listening trends and genre evolution
  - Enhanced data processing with server-side aggregation (in progress)
  - Progressive loading and caching for optimal performance

- **Monthly Listening History:**
  - Chronological timeline of liked tracks, grouped by month
  - Track details including title, artist, album, cover art, and date liked
  - Audio previews (coming soon)
  - Infinite scrolling with optimized data fetching

- **Playlist Generation:**
  - Create monthly playlists directly from your listening history
  - Custom playlist generator with date range selection
  - Filter by top genres and artists
  - Share functionality for created playlists

### 🚀 Enterprise-Grade Infrastructure

- **Advanced Token Management:**
  - ✅ Proactive token refresh with 5-minute buffer time
  - ✅ Direct fetch() calls with `cache: "no-cache"` to prevent stale responses
  - ✅ Automatic refresh token rotation handling
  - ✅ Comprehensive error recovery with retry mechanisms

- **Sophisticated Spotify API Client:**
  - ✅ Request queuing with priority system
  - ✅ Exponential backoff with jitter for retries
  - ✅ Rate limiting protection (100ms minimum interval)
  - ✅ Request deduplication with pending request map
  - ✅ 60-second request timeout handling

- **Developer Debugging Tools:**
  - ✅ Real-time TokenStatus component (development only)
  - ✅ Queue status monitoring (`getQueueStatus()`)
  - ✅ Manual token refresh endpoint (`/api/auth/refresh-token`)
  - ✅ Comprehensive console logging with emoji indicators

- **Modern Code Quality Pipeline:**
  - ✅ Biome 1.9.4 for primary formatting and linting
  - ✅ Prisma 6.9.0 for enhanced database reliability
  - ✅ React Query 5.80.5 for optimized data fetching
  - ✅ Automated security scanning and vulnerability detection

### 🔧 Technical Features
- **Enhanced Authentication:**
  - Secure Spotify OAuth 2.0 authentication with PKCE (in progress)
  - Automatic session management with error recovery
  - Development-only debugging tools for authentication flow

- **Performance & Reliability:**
  - Advanced caching system for API responses with TTL and size limits
  - Responsive design with Tailwind CSS and modern component architecture
  - Comprehensive error handling with user-friendly retry mechanisms
  - Production-ready infrastructure with zero-downtime deployment compatibility

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- A Spotify Developer account and application
- Environment variables set up (see below)

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### Installation

1. Clone the repository
2. Install dependencies using pnpm (recommended):

```bash
pnpm install
```

### Running the Development Server

Start the development server:

```bash
pnpm dev
```

### Development Features

In development mode, you'll have access to advanced debugging tools:

- **Real-time Token Status**: Monitor authentication state in the bottom-right corner
- **API Queue Monitoring**: Track request processing and rate limiting
- **Manual Token Refresh**: Test authentication endpoints directly
- **Enhanced Console Logging**: Emoji-coded status updates for easy debugging

## Project Structure

- `src/app`: Next.js app router components, pages, layouts, and API routes
- `src/components`: Reusable UI components (including new `TokenStatus.tsx`)
- `src/hooks`: Custom React hooks for data fetching and caching (enhanced with error handling)
- `src/lib`: Utility functions, API client setup, and token management utilities
- `src/styles`: CSS and styling files
- `src/types`: TypeScript type definitions

### Key Files

- `src/lib/spotify.ts`: **Enhanced** Spotify API client with enterprise-grade features
- `src/hooks/useSpotify.ts`: **Enhanced** authentication hook with error recovery
- `src/lib/tokenUtils.ts`: **NEW** Token management and monitoring utilities
- `src/components/TokenStatus.tsx`: **NEW** Real-time development debugging widget

## Enhanced Architecture

### Authentication & API Layer
The application now features a sophisticated authentication system:

```typescript
// Advanced Token Management
- Proactive refresh with 5-minute buffer time
- Direct fetch() calls with no-cache headers
- Automatic refresh token rotation
- Comprehensive error handling with session management

// Enterprise Spotify API Client
- Request queuing with priority system
- Exponential backoff with jitter for retries
- Rate limiting protection and request deduplication
- Development debugging with queue status monitoring
```

### Error Handling Patterns
Consistent error handling across the application:

```typescript
import { SpotifyApiError } from '@/lib/spotify';

const { spotifyApi, isReady, error, retry } = useSpotify();

if (!isReady) return <LoadingSpinner />;
if (error) return <ErrorDisplay message={error} onRetry={retry} />;
```

## Code Quality & Development Tools

The project uses modern tooling for enhanced development experience:

### Updated Package Ecosystem
- **@prisma/client**: `^6.9.0` (Database reliability - major upgrade)
- **@tanstack/react-query**: `^5.80.5` (Data fetching - major upgrade)
- **zod**: `^3.25.51` (Schema validation - updated)

### Enhanced Configuration
- **Modern Linting & Formatting**: Biome 1.9.4 (replacing Prettier and ESLint)
- **Security Scanning**: Automated secret detection and vulnerability scanning
- **Development Debugging**: Real-time monitoring and comprehensive logging

### Trunk Workflow
```yaml
# Enhanced .trunk/trunk.yaml configuration
lint:
  enabled:
    - biome@1.9.4          # Primary code formatter and linter (v2.0 beta available)
    - checkov@3.2.435      # Infrastructure security scanning
    - osv-scanner@2.0.2    # Vulnerability scanning
    - trufflehog@3.88.34   # Secret detection
```

## Styling System

The project uses Tailwind CSS for utility-first styling, combined with a custom Spotify-themed styling system:

- **Global Styles & Theming:** Base styles and CSS custom properties defined in `src/app/globals.css`
- **Tailwind CSS:** Utility-first styling approach with modern configuration
- **Reusable Component Classes:** Pre-defined classes for common elements
- **Responsive Design:** Mobile-first approach
- **Custom Scrollbar Styling:** Enhanced visual integration

## Authentication

Authentication is handled via NextAuth.js with enhanced Spotify provider:

- **Enterprise-Grade Security:** OAuth 2.0 flow with PKCE (in progress)
- **Advanced Token Management:** Proactive refresh with intelligent queuing
- **Session Persistence:** JWT-based with automatic error recovery
- **Development Debugging:** Real-time token monitoring and manual testing endpoints
- **Comprehensive Error Handling:** Automatic retry mechanisms and user feedback
- **Secure Logout Process:** Proper session cleanup and token invalidation

## Performance & Monitoring

### API Reliability Features
- **Request Queuing System:** Priority-based processing with automatic deduplication
- **Advanced Retry Logic:** Exponential backoff with jitter and smart error classification
- **Rate Limiting Protection:** Respects Spotify API limits with intelligent throttling
- **Memory Management:** Automatic cleanup of pending requests and cache optimization

### Development Testing
```bash
# Test token refresh endpoint (development only)
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

## Security Enhancements

### Enhanced Authentication Security
- **PKCE Implementation**: Server-side with client secret (in progress)
- **Token Rotation**: Proper refresh token handling with automatic updates
- **Environment Separation**: Development tools excluded from production builds
- **Request Validation**: Enhanced input sanitization and error message sanitization

### Automated Security Scanning
- **Secret Detection**: TruffleHog integration for automatic secret scanning
- **Vulnerability Scanning**: OSV scanner for dependency vulnerability detection
- **Security Linting**: Checkov static analysis for infrastructure security
- **Environment Isolation**: Development-only debugging features with proper isolation

## Production Deployment

The application is designed for zero-downtime deployment with:

- **Backward Compatibility**: All changes are additive and non-breaking
- **Progressive Enhancement**: New features activate seamlessly
- **Database Migrations**: Handled automatically by Prisma 6.x
- **Configuration Compatibility**: No environment variable changes required
- **Performance Optimizations**: Enhanced caching and request management

## Contributing

When contributing to this project:

1. **Use the enhanced `useSpotify` hook** for all Spotify API interactions
2. **Import `SpotifyApiError`** consistently across components
3. **Leverage development debugging tools** for testing and troubleshooting
4. **Follow modern configuration patterns** with Biome for linting and formatting
5. **Test thoroughly** with the comprehensive error handling and retry mechanisms

The codebase now features enterprise-grade infrastructure that ensures reliable, performant, and maintainable code! 🎵✨
