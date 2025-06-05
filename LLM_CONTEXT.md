# Jermaine's Spotify Time Machine

## IMPORTANT INSTRUCTIONS

- Check TODO.md at the project root for a detailed feature implementation checklist
- The TODO.md file contains the current implementation status and priorities
- **Refer to "Key Architectural Patterns & Components" below for current development best practices and available tools within this project.**

## Current Development Focus

### Completed High-Priority Infrastructure ✅
1. **Enhanced Token Management System**
   - ✅ Proactive token refresh with 5-minute buffer time
   - ✅ Direct fetch() calls with `cache: "no-cache"` to prevent stale responses
   - ✅ Automatic refresh token rotation handling
   - ✅ Comprehensive error recovery with retry mechanisms

2. **Advanced Spotify API Client**
   - ✅ Request queuing with priority system
   - ✅ Exponential backoff with jitter for retries
   - ✅ Rate limiting protection (100ms minimum interval)
   - ✅ Request deduplication with pending request map
   - ✅ 60-second request timeout handling

3. **Developer Debugging Infrastructure**
   - ✅ Real-time TokenStatus component (development only)
   - ✅ Queue status monitoring (`getQueueStatus()`)
   - ✅ Manual token refresh endpoint (`/api/auth/refresh-token`)
   - ✅ Comprehensive console logging with emoji indicators

4. **Modern Tooling & Code Quality**
   - ✅ Biome 1.9.4 for primary formatting and linting
   - ✅ Prisma 6.9.0 for enhanced database reliability
   - ✅ React Query 5.80.5 for optimized data fetching
   - ✅ Trunk configuration optimized for development workflow

### Remaining High Priority Features
1. **PKCE Implementation for Spotify OAuth**
   - Enhancing security of the authentication flow
   - Implementation in progress in `src/app/api/auth/[...nextauth]/route.ts`
   - Requires careful handling of code verifier/challenge

2. **Audio Preview Feature**
   - Implementation in `TrackItem.tsx`
   - Requires Spotify Web Playbook SDK integration
   - Needs to handle audio state management

3. **Server-Side Data Aggregation**
   - Optimizing visualization data processing
   - Moving heavy computations from client to server
   - Implementing new API endpoints for aggregated data

## Optimization Preferences

- **Enterprise-Grade Reliability**: The codebase now features production-ready infrastructure with sophisticated error handling, request queuing, and automatic token management
- Use established, well-documented libraries and frameworks (e.g., Next.js, Tailwind CSS, NextAuth.js, react-icons)
- Focus on core functionality first, then add additional features
- Leverage the enhanced Spotify API client for all API interactions
- Implement features incrementally with working code at each step
- Use pnpm for all package management and scripts
- Use the Next.js App Router pattern (src/app directory, server/client components, layouts, etc.)
- Use Tailwind CSS for all styling and utility classes
- Follow the enhanced error handling patterns with `SpotifyApiError`
- Adhere to the color palette and theming defined in `src/app/globals.css` via CSS variables

## Key Architectural Patterns & Components

### Enhanced Authentication & API Layer
- **Advanced Token Management** (`src/app/api/auth/[...nextauth]/route.ts`):
  - Proactive refresh with 5-minute buffer time
  - Direct fetch() calls with no-cache headers
  - Automatic refresh token rotation
  - Comprehensive error handling with session management

- **Enterprise Spotify API Client** (`src/lib/spotify.ts`):
  ```typescript
  class SpotifyApi {
    // Request queuing with priority system
    private requestQueue: QueuedRequest[] = [];
    private pendingRequests = new Map<string, Promise<any>>();

    // Rate limiting and retry logic
    private readonly minRequestInterval = 100; // 100ms between requests
    private readonly maxRetries = 3;
    private calculateBackoffDelay(retryCount: number, baseDelay = 1000): number

    // Development debugging
    getQueueStatus() // Returns queue metrics for debugging
  }
  ```

- **Enhanced useSpotify Hook** (`src/hooks/useSpotify.ts`):
  - Automatic error recovery with retry mechanisms
  - Session error handling (`RefreshAccessTokenError`)
  - Development debugging with `getQueueStatus()`
  - Manual retry functionality

### Component Architecture
- **Component-Driven UI:** The frontend is built with a strong emphasis on reusable React components located in `src/components/`. Key examples include:
  - `PageContainer.tsx`: Standard wrapper for page content, providing consistent layout and loading states.
  - `LayoutContent.tsx`: Manages the overall page structure within `RootLayout.tsx`, often including `Header.tsx` and `Footer.tsx`.
  - `TokenStatus.tsx`: **NEW** Real-time token monitoring widget (development only)
  - `ActionButton.tsx`: Versatile button component for primary and secondary actions with updated hover effects.
  - `SpotifySignInButton.tsx`: Standardized Spotify sign-in button.
  - `FormField.tsx`: Consistent styling for form inputs.
  - `TrackItem.tsx`: Displays individual track information, used in lists (play button for previews currently **not implemented**).
  - `MonthlyTrackList.tsx`: Renders a list of tracks for a given month, with expansion and playlist creation features.
  - `FilterSelector.tsx`: UI for selecting multiple filter items (e.g., genres, artists).
  - `LoadingSpinner.tsx`, `ErrorDisplay.tsx`: Consistent feedback components for asynchronous operations.
  - `Navigation.tsx`: Main application navigation bar, including user profile dropdown, logout, and personalized "Jermaine's" branding.
  - `FeatureCard.tsx`: Used on the dashboard to link to key application features.
  - `FeatureShowcaseItem.tsx`: Component for displaying feature details with title, description, image, and optional reversed layout.
  - `VisualizationContainer.tsx`: A wrapper for data visualizations, managing title, loading, processing, error, and empty states.
  - `DataFetcherAndControlsWrapper.tsx`: A key component that standardizes data fetching and UI controls (e.g., time range selectors, granularity controls) for visualizations. It wraps `VisualizationContainer` and manages the presentation of loading states related to specific data ranges.

### Enhanced Error Handling Patterns

**Consistent Error Import Pattern** (Required for all Spotify-related files):
```typescript
import { SpotifyApiError } from '@/lib/spotify';

// Standard error handling pattern
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

**useSpotify Hook Error Handling:**
```typescript
const { spotifyApi, isReady, error, retry, session, getQueueStatus } = useSpotify();

// Always check isReady before API calls
if (!isReady) {
  return <LoadingSpinner />;
}

// Handle errors with retry functionality
if (error) {
  return (
    <ErrorDisplay
      message={error}
      onRetry={retry}
    />
  );
}
```

### Data Management & Caching
- **Advanced Caching System:**
  - `useLikedTracks` hook implements:
    - Progressive loading with multiple cache keys
    - TTL (Time To Live) for cache entries
    - Maximum cache size limits
    - Compact track representation for trends
  - `useLikedArtists` hook provides:
    - Cached artist details for liked tracks
    - Progressive loading strategy
    - Cache management with TTL and size limits
  - Both hooks leverage enhanced `useSpotify` for API access with automatic retry

### State Management
- **Enhanced Custom Hooks:**
  - `useSpotify.ts`: **ENHANCED** Central hook for Spotify API interaction
    - Returns `isReady` boolean flag (MUST be checked before API calls)
    - Handles token management and refresh automatically
    - Provides `error` state and `retry` function for error recovery
    - Includes `getQueueStatus()` for development debugging
  - `useUserStats.ts`: **ENHANCED** with SpotifyApiError handling
  - `useLikedTracks.ts`: **ENHANCED** with SpotifyApiError handling
  - `useLikedArtists.ts`: **ENHANCED** with SpotifyApiError handling

### Development Debugging Tools

- **TokenStatus Widget** (`src/components/TokenStatus.tsx`):
  - Real-time token monitoring (development only)
  - Visual indicators: 🟢 Valid, 🟡 Expiring, 🔴 Error/expired
  - Token expiry countdown and detailed status
  - Automatically excluded from production builds

- **Token Utilities** (`src/lib/tokenUtils.ts`):
  ```typescript
  // Available utility functions
  analyzeTokenStatus(expiresAt?: number) // Detailed token analysis
  shouldRefreshToken(expiresAt?: number, bufferMinutes = 5) // Smart refresh timing
  formatTokenExpiry(expiresAt?: number) // Human-readable display
  ```

- **Manual Testing Endpoint** (`/api/auth/refresh-token`):
  - Development-only endpoint for testing refresh logic
  - Accepts refresh token via POST request
  - Returns refreshed token data or error details

- **Queue Status Monitoring**:
  ```typescript
  const { getQueueStatus } = useSpotify();
  const queueStatus = getQueueStatus(); // Development debugging
  ```

### Visualization Components
- **`ListeningTrends.tsx`:**
  - Monthly bar chart for liked track counts
  - Uses `--spotify-green` for bars
  - Implements horizontal scrolling for long timelines
  - Leverages `DataFetcherAndControlsWrapper` for controls

- **`GenreTrendsVisualization.tsx`:**
  - Stacked horizontal bars for genre evolution
  - Supports quarterly/yearly views
  - Includes interactive legend
  - Uses predefined color palette

## Performance Optimization

### Enhanced API Reliability
1. **Request Queuing System:**
   - Priority-based request processing
   - Automatic request deduplication
   - 60-second timeout protection
   - Memory management with automatic cleanup

2. **Advanced Retry Logic:**
   - Exponential backoff with jitter
   - Maximum 3 retry attempts
   - Smart error classification
   - Rate limiting respect (429 handling)

3. **Proactive Token Management:**
   - 5-minute buffer before expiration
   - Automatic token refresh
   - Queue pausing during refresh
   - Session error recovery

### Data Processing
1. **Server-Side Aggregation:** (In Progress)
   - New API endpoints for pre-processed visualization data
   - Reduces client-side computation
   - Implements chunked data delivery

2. **Web Workers:** (Planned)
   - Offloads heavy data processing
   - Improves UI responsiveness
   - Used for visualization calculations

3. **Progressive Rendering:**
   - Implements data chunking
   - User-controlled granularity
   - Optimized for large datasets

### Caching Strategy
1. **API Response Caching:**
   - TTL-based cache invalidation
   - Size-limited cache storage
   - Progressive loading patterns

2. **Client-Side State:**
   - Optimized re-renders
   - Memoized computations
   - Efficient data structures

## Modern Tooling & Code Quality

### Updated Package Ecosystem
```json
{
  "dependencies": {
    "@prisma/client": "^6.9.0",          // Database reliability (major upgrade)
    "@tanstack/react-query": "^5.80.5",  // Data fetching (major upgrade)
    "zod": "^3.25.51"                     // Schema validation (updated)
  },
}
```

### Enhanced Configuration

**Trunk Configuration** (`.trunk/trunk.yaml`):
```yaml
lint:
  disabled:
    - eslint    # Disabled in favor of Biome
    - prettier  # Disabled in favor of Biome
  enabled:
    - biome@1.9.4          # Primary code formatter and linter (v2.0 beta available)
    - checkov@3.2.435      # Infrastructure security scanning
    - osv-scanner@2.0.2    # Vulnerability scanning
    - trufflehog@3.88.34   # Secret detection
```

**NextAuth Enhanced Configuration:**
```typescript
session: {
  strategy: 'jwt',
  maxAge: 30 * 60, // Reduced to 30 minutes for more frequent refresh
},
debug: process.env.NODE_ENV === 'development',
```

### Development Workflow
- **Modern Linting & Formatting**: Biome 1.9.4 instead of Prettier & ESLint
- **Security Scanning**: Automated secret detection and vulnerability scanning
- **Development Debugging**: Real-time token monitoring and queue status
- **Type Safety**: Enhanced with latest TypeScript patterns

## Testing Strategy

### Enhanced Testing Capabilities
1. **Development Testing:**
   - TokenStatus widget for real-time monitoring
   - Console logging with emoji indicators
   - Queue status debugging via `getQueueStatus()`
   - Manual retry buttons for error scenarios

2. **Manual API Testing:**
   ```bash
   # Test refresh endpoint (development only)
   curl -X POST http://localhost:3000/api/auth/refresh-token \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
   ```

### Unit Tests
- Utility functions in `src/lib/`
- Custom hooks using `@testing-library/react-hooks`
- Business logic validation
- Token management utilities

### Component Tests
- UI components using `@testing-library/react`
- Visualization components with mock data
- Interaction testing
- Error handling scenarios

### Integration Tests
- Component interaction flows
- Authentication integration with retry mechanisms
- API route testing with queue system

### E2E Tests
- Core user flows using Playwright
- Authentication scenarios with error recovery
- Playlist creation workflows

## Accessibility (a11y)

### Current Focus
1. **ARIA Implementation:**
   - Dynamic components
   - Custom controls
   - Live regions

2. **Keyboard Navigation:**
   - Focus management
   - Shortcut support
   - Navigation patterns

3. **Visual Accessibility:**
   - Color contrast
   - Text alternatives
   - Responsive design

## Security Enhancements

### Enhanced Authentication Security
- **PKCE Implementation**: Server-side with client secret (in progress)
- **Token Rotation**: Proper refresh token handling
- **Environment Separation**: Development tools excluded from production
- **Request Validation**: Enhanced input sanitization
- **Error Information**: Sanitized error messages for security

### Development Security
- **Secret Scanning**: Automated with TruffleHog
- **Vulnerability Scanning**: OSV scanner integration
- **Security Linting**: Checkov static analysis
- **Environment Isolation**: Development-only debugging features

## Configuration

- `next.config.ts`: Image patterns and Flowbite plugin
- `postcss.config.mjs`: Tailwind and Autoprefixer
- `prettier.config.js`: Code formatting (legacy, removed in favor of Biome)
- `tsconfig.json`: TypeScript configuration
- `.trunk/trunk.yaml`: **UPDATED** Modern tool configuration with Biome
- `flowbite-react.config.js`: UI component theme
- `.vscode/`: Editor settings

## SEO and Metadata

- Page metadata
- Structured data
- Robots.txt
- Sitemap generation
- Social media cards

## Implementation Notes

### Critical Development Patterns

1. **Always use the enhanced `useSpotify` hook:**
   ```typescript
   const { spotifyApi, isReady, error, retry } = useSpotify();

   if (!isReady) return <LoadingSpinner />;
   if (error) return <ErrorDisplay message={error} onRetry={retry} />;
   ```

2. **Import and use `SpotifyApiError` consistently:**
   ```typescript
   import { SpotifyApiError } from '@/lib/spotify';
   ```

3. **Leverage development debugging tools:**
   - TokenStatus widget shows real-time token state
   - `getQueueStatus()` provides API queue insights
   - Console logs use emoji indicators for easy identification

4. **Follow modern configuration patterns:**
   - Use Biome for linting and formatting instead of ESLint and Prettier
   - Use updated package versions with enhanced features

- Each feature should be implemented incrementally
- Follow Spotify design patterns for consistency
- Prioritize core functionality before enhancements
- Use the enhanced API client for all Spotify interactions
- Test thoroughly with different user accounts and edge cases
- Leverage the comprehensive error handling and retry mechanisms
