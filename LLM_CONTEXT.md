# Jermaine's Spotify Time Machine

## IMPORTANT INSTRUCTIONS

- Check TODO.md at the project root for a detailed feature implementation checklist
- The TODO.md file contains the current implementation status and priorities
- **Refer to "Key Architectural Patterns & Components" below for current development best practices and available tools within this project.**

## Current Development Focus

### High Priority Features
1. **PKCE Implementation for Spotify OAuth**
   - Enhancing security of the authentication flow
   - Implementation in progress in `src/app/api/auth/[...nextauth]/route.ts`
   - Requires careful handling of code verifier/challenge

2. **Audio Preview Feature**
   - Implementation in `TrackItem.tsx`
   - Requires Spotify Web Playback SDK integration
   - Needs to handle audio state management

3. **Rate Limiting Protection**
   - Implementation in `src/middleware.ts`
   - Using token bucket algorithm
   - Protecting both API routes and authentication endpoints

4. **Server-Side Data Aggregation**
   - Optimizing visualization data processing
   - Moving heavy computations from client to server
   - Implementing new API endpoints for aggregated data

## Optimization Preferences

- Prioritize simplicity and speed of implementation while maintaining code quality
- Use established, well-documented libraries and frameworks (e.g., Next.js, Tailwind CSS, NextAuth.js, react-icons)
- Focus on core functionality first, then add additional features
- Leverage existing Spotify API features where possible
- Implement features incrementally with working code at each step
- Use pnpm for all package management and scripts
- Use the Next.js App Router pattern (src/app directory, server/client components, layouts, etc.)
- Use Tailwind CSS for all styling and utility classes
- Adhere to the color palette and theming defined in `src/app/globals.css` via CSS variables
- Follow modern React/Next.js best practices (e.g., file-based routing, server components, hooks, etc.)

## Key Architectural Patterns & Components

### Component Architecture
- **Component-Driven UI:** The frontend is built with a strong emphasis on reusable React components located in `src/components/`. Key examples include:
  - `PageContainer.tsx`: Standard wrapper for page content, providing consistent layout and loading states.
  - `LayoutContent.tsx`: Manages the overall page structure within `RootLayout.tsx`, often including `Header.tsx` and `Footer.tsx`.
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
  - Both hooks leverage `useSpotify` for API access

### State Management
- **Custom Hooks:**
  - `useSpotify.ts`: Central hook for Spotify API interaction
    - Returns `isReady` boolean flag (MUST be checked before API calls)
    - Handles token management and refresh
  - `useUserStats.ts`: Manages user's top artists/tracks/genres
  - `useLikedTracks.ts`: Handles liked tracks with caching
  - `useLikedArtists.ts`: Manages artist data with caching

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

### Data Processing
1. **Server-Side Aggregation:**
   - New API endpoints for pre-processed visualization data
   - Reduces client-side computation
   - Implements chunked data delivery

2. **Web Workers:**
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

## Testing Strategy

### Unit Tests
- Utility functions in `src/lib/`
- Custom hooks using `@testing-library/react-hooks`
- Business logic validation

### Component Tests
- UI components using `@testing-library/react`
- Visualization components with mock data
- Interaction testing

### Integration Tests
- Component interaction flows
- Authentication integration
- API route testing

### E2E Tests
- Core user flows using Playwright
- Authentication scenarios
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

## Code Quality & Developer Experience

### Tooling
- Trunk for unified development workflow and code quality
- Prettier for formatting
- ESLint for linting
- TypeScript for type safety
- VS Code configuration

### Documentation
- JSDoc comments
- Component documentation
- API documentation

### Development Workflow
- Feature branches
- Code review process
- Testing requirements
- Deployment pipeline

## Configuration

- `next.config.ts`: Image patterns and Flowbite plugin
- `postcss.config.mjs`: Tailwind and Autoprefixer
- `prettier.config.js`: Code formatting
- `tsconfig.json`: TypeScript configuration
- `.trunk/trunk.yaml`: Tool configuration
- `flowbite-react.config.js`: UI component theme
- `.vscode/`: Editor settings

## SEO and Metadata

- Page metadata
- Structured data
- Robots.txt
- Sitemap generation
- Social media cards

## Implementation Notes

- Each feature should be implemented incrementally
- Follow Spotify design patterns for consistency
- Prioritize core functionality before enhancements
- Use established libraries for complex components
- Test thoroughly with different user accounts and edge cases
