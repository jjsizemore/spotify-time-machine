# Jermaine's Spotify Time Machine: Feature Implementation Checklist

## Core Features

### 1. Authentication

- [x] Implement Spotify OAuth 2.0 flow
- [ ] Implement PKCE (Proof Key for Code Exchange) for Spotify OAuth
  - [ ] Generate `code_verifier` (e.g., using `crypto.randomBytes`) and `code_challenge` (e.g., using `crypto.createHash('sha256')`) upon initiating authentication.
  - [ ] Store `code_verifier` securely (e.g., HttpOnly, SameSite=Lax, Secure cookie; investigate best practices for Next.js proxy/API routes).
  - [ ] Add `code_challenge` and `code_challenge_method='S256'` to the Spotify authorization request.
  - [ ] Retrieve `code_verifier` and include it in the body of the token exchange request to Spotify.
  - [ ] Update NextAuth.js configuration (`src/app/api/auth/[...nextauth]/route.ts`) and any relevant auth utility functions.
  - [ ] Test PKCE flow thoroughly across different browsers and incognito modes.
- [x] Secure token management
- [x] Handle authentication errors gracefully
- [x] Add session persistence

### 2. User Dashboard

- [x] Basic dashboard layout
- [x] Display overall listening statistics
- [x] Show top artists (fetch and display)
- [x] Show top genres (fetch and display)
- [x] Show recently played tracks (fetch and display)
- [x] Add loading states for all data fetching
- [x] Implement error handling for failed API requests

### 3. Monthly Listening History

- [x] Create chronological timeline interface
- [x] Implement collapsible sections for each month
- [x] For each month display:
  - [x] All tracks the user has "liked" during that period
  - [x] Track information (title, artist, album, cover art)
  - [x] Date when track was liked
  - [ ] Play button for previews (within `TrackItem.tsx`)
    - [ ] Implement UI for play/pause button in `TrackItem.tsx`.
    - [ ] Fetch track preview URL from Spotify API (if available).
    - [ ] Handle audio playback (e.g., using HTML5 `<audio>` element).
    - [ ] Manage playback state (playing, paused, loading, error).
- [x] Add infinite scrolling or pagination
- [x] Handle edge cases (no liked songs, API limits)

### 4. Playlist Generation

- [x] Add "Create Monthly Playlist" button to each month
- [x] Implement API call to create playlist in user's Spotify account
- [x] Include all liked songs from selected month
- [x] Show success confirmation with playlist link
- [x] Handle error cases (API limits, etc.)

### 5. Custom Playlist Generator

- [x] Create dedicated interface with:
  - [x] Date pickers for start and end dates
  - [x] Custom playlist naming field
  - [ ] Genre/artist filter options
- [x] Implement playlist creation logic
- [x] Add success/error feedback
- [x] Provide link to created playlist

## Technical Implementation

### Frontend

- [x] Use Next.js App Router pattern
- [x] Implement responsive design with Tailwind CSS
- [x] Add transitions between views
- [x] Create data visualizations for statistics
- [x] Optimize for mobile devices

### Backend

- [x] Create API routes for Spotify interaction
- [x] Implement caching to minimize API calls
- [ ] Add rate limiting protection
  - [x] Implement rate limiting for API routes in `src/proxy.ts` (Next.js 16 proxy pattern, replaces deprecated middleware).
  - [ ] Consider strategies like token bucket or fixed window counters.
  - [ ] Provide appropriate HTTP 429 responses.
- [x] Set up error handling middleware

### Data Management

- [ ] Store user preferences (e.g., preferred time ranges, UI settings) using `localStorage` or server-side storage if sensitive.
- [x] Implement secure token handling
- [x] Create data fetching hooks/utilities

## Optional Enhancements

### User Experience

- [ ] Add audio previews directly in the app (corresponds to 'Play button for previews' in `TrackItem.tsx`)
- [x] Implement sharing capabilities for playlists (basic version done; consider expanding, e.g., 'copy to clipboard' for playlist details, direct social media share options)
- [x] Create visualization for listening trends
  - [ ] **Listening Trends:** Implement as a monthly bar chart showing liked track counts. Ensure bars are visible and correctly scaled. X-axis: Month/Year. Y-axis (implied): Track count. Uses `--spotify-green`.
  - [ ] **Genre Evolution:** Implement as a series of stacked horizontal bars per period (quarter/year). Segments represent top genre prevalence. Includes legend and filters for time range/granularity.
- [ ] Add theme customization options
- [ ] Implement keyboard shortcuts (playlist generator has some; audit for other useful areas like navigation, modal dialogs)

### Performance

- [x] Add Suspense boundaries for loading states
- [ ] Implement SSR where beneficial (evaluate pages like dashboard or history for initial data)
- [ ] Add client-side caching for API responses (e.g., using `swr` or `react-query` for more advanced caching beyond component state, or custom caching layer for `spotify-web-api-node` calls if `useSpotify` hook can be enhanced).
- [x] Optimize image loading and rendering (Next.js `<Image>` component helps; ensure proper `sizes` and `priority` props where applicable).
- [ ] Investigate and implement server-side data aggregation for `ListeningTrends.tsx` and `GenreTrendsVisualization.tsx` to reduce client-side load.
  - [ ] Create new API endpoint(s) to pre-process track data for these visualizations.
  - [ ] Modify `useUserStats.ts` or create new hooks to fetch aggregated data from these endpoints.
- [ ] Explore using Web Workers to offload data processing for `ListeningTrends.tsx` and `GenreTrendsVisualization.tsx` if server-side aggregation is not fully sufficient or for specific client-side calculations.
- [ ] Implement progressive rendering/data chunking and user-controlled granularity (e.g., yearly vs. quarterly for "All Time") for `ListeningTrends.tsx` and `GenreTrendsVisualization.tsx` to improve perceived performance with large datasets (partially implemented with filters, can be enhanced).

## Testing Strategy

- [ ] **Unit Tests:**
  - [ ] Test utility functions in `src/lib/spotifyTrackUtils.ts` (e.g., track grouping, playlist creation logic).
  - [ ] Test utility functions in `src/lib/genreUtils.ts`.
  - [ ] Test business logic within custom hooks (e.g., `useLikedTracks.ts`, `useUserStats.ts`) using `@testing-library/react-hooks` or similar.
- [ ] **Component Tests:**
  - [ ] Test critical UI components in `src/components/` (e.g., `TrackItem.tsx`, `MonthlyTrackList.tsx`, `FilterSelector.tsx`, `PageContainer.tsx`) for rendering and basic interactions using `@testing-library/react`.
  - [ ] Test visualization components (`ListeningTrends.tsx`, `GenreTrendsVisualization.tsx`) with mock data.
- [ ] **Integration Tests:**
  - [ ] Test interaction between components (e.g., filter selection updating a list).
  - [ ] Test NextAuth.js integration points and authentication flow locally.
- [ ] **End-to-End (E2E) Tests:**
  - [ ] Implement E2E tests for core user flows using Playwright or Cypress:
    - [ ] User login and logout.
    - [ ] Navigating to the dashboard and viewing stats.
    - [ ] Navigating to the history page and viewing tracks.
    - [ ] Creating a monthly playlist.
    - [ ] Creating a custom playlist with filters.

## Accessibility (a11y)

- [ ] **Audit & Improvements:**
  - [ ] Perform an accessibility audit using browser developer tools (e.g., Lighthouse, Axe DevTools) and manual testing.
  - [ ] Ensure proper ARIA attributes are used for dynamic components and custom controls (e.g., `FilterSelector`, modals, custom dropdowns).
  - [ ] Verify keyboard navigability for all interactive elements.
  - [ ] Check color contrast ratios for text and UI elements against WCAG guidelines.
  - [ ] Ensure all images have appropriate `alt` text or are marked as decorative if applicable.
  - [ ] Add `aria-live` regions for dynamic content updates (e.g., loading states, error messages, playlist creation success).

## Code Quality & Developer Experience (DevEx)

- [ ] **Code Documentation:**
  - [ ] Add JSDoc comments for complex functions, hooks, and components, especially those in `src/lib/` and `src/hooks/`.
  - [ ] Review and improve existing comments for clarity.
- [ ] **Refactoring:**
  - [ ] Identify and refactor any overly complex components or functions.
  - [ ] Review `spotifyTrackUtils.ts` for potential optimizations or further modularization if it becomes too large.
- [ ] **Dependency Review:**
  - [ ] Periodically review and update dependencies to their latest stable versions.
  - [ ] Remove any unused dependencies.

## Implementation Notes

- Each feature should be implemented incrementally
- Follow Spotify design patterns for consistency
- Prioritize core functionality before enhancements
- Use established libraries for complex components
- Test thoroughly with different user accounts and edge cases
