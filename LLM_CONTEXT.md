# Spotify Time Machine

## IMPORTANT INSTRUCTIONS
- Check TODO.md at the project root for a detailed feature implementation checklist
- The TODO.md file contains the current implementation status and priorities
- **Refer to "Key Architectural Patterns & Components" below for current development best practices and available tools within this project.**

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

- **Component-Driven UI:** The frontend is built with a strong emphasis on reusable React components located in `src/components/`. Key examples include:
    - `PageContainer.tsx`: Standard wrapper for page content, providing consistent layout and loading states.
    - `LayoutContent.tsx`: Manages the overall page structure within `RootLayout.tsx`, often including `Header.tsx` and `Footer.tsx`.
    - `ActionButton.tsx`: Versatile button component for primary and secondary actions.
    - `SpotifySignInButton.tsx`: Standardized Spotify sign-in button.
    - `FormField.tsx`: Consistent styling for form inputs.
    - `TrackItem.tsx`: Displays individual track information, used in lists.
    - `MonthlyTrackList.tsx`: Renders a list of tracks for a given month, with expansion and playlist creation features.
    - `FilterSelector.tsx`: UI for selecting multiple filter items (e.g., genres, artists).
    - `LoadingSpinner.tsx`, `ErrorDisplay.tsx`: Consistent feedback components for asynchronous operations.
    - `Navigation.tsx`: Main application navigation bar, including user profile dropdown and logout.
    - `FeatureCard.tsx`: Used on the dashboard to link to key application features.
    - `KeyboardShortcutInfo.tsx`, `KeyboardShortcuts.tsx`: Components for displaying and potentially managing keyboard shortcuts.
- **Global Styling:**
    - `src/app/globals.css`: Defines global styles, an extensive set of CSS variables for theming (Spotify-like colors: `--spotify-green`, `--spotify-black`, etc.), and base Tailwind configuration. All new UI should adhere to these variables.
    - Tailwind CSS: Used extensively for utility-first styling.
- **State Management & Hooks:**
    - `src/hooks/useSpotify.ts`: Central hook for interacting with the Spotify API via `spotify-web-api-node`. **Crucially, it now returns an `isReady` boolean flag that MUST be checked before attempting API calls that require authentication.**
    - `src/hooks/useUserStats.ts`: Fetches and manages user\'s top artists/tracks/genres for the dashboard.
    - `src/hooks/useLikedTracks.ts`: Manages fetching and pagination of user\'s liked tracks for the history page.
- **Utility Libraries:**
    - `src/lib/spotifyTrackUtils.ts`: Contains functions for fetching all liked tracks, processing/grouping tracks by month, and creating playlists (both monthly and custom).
    - `src/lib/genreUtils.ts`: Includes functions for extracting and processing genre information, primarily used for playlist filtering.
- **Authentication & Authorization:**
    - NextAuth.js: Manages the Spotify OAuth flow. Configuration in `src/app/api/auth/[...nextauth]/route.ts` (uses JWT strategy, custom cookie settings).
    - `src/middleware.ts`: Protects routes (pages and API endpoints defined in its `matcher` config) and implements API rate limiting. Unauthenticated users are redirected.
    - Automatic Sign-in: The `/auth/signin` page (`src/app/auth/signin/page.tsx`) attempts to initiate sign-in automatically and shows a loading state.
    - Session Clearing: Logout flow (initiated from `Navigation.tsx`) is comprehensive, involving client-side state clearing, an API call to `src/app/api/auth/clear-session/route.ts` to clear auth cookies, NextAuth\'s `signOut`, and redirection to `/thank-you`.
- **Routing:** Next.js App Router pattern is used (`src/app` directory for pages and layouts).
- **Configuration:**
    - `next.config.js`: Includes updated image remote patterns for Spotify images.
    - `postcss.config.js`: Standard PostCSS setup for Tailwind CSS and Autoprefixer (using CommonJS).

- **Dashboard Visualizations:**
    - **`ListeningTrends.tsx` (Your Listening Trends):**
        - **Purpose:** To display the number of tracks liked by the user each month over time.
        - **Appearance:** A bar chart where each bar represents a month.
            - X-axis: Month and year (e.g., "Jan 2023", "Feb 2023"). Rotated labels for readability if space is tight.
            - Y-axis (implied): Number of tracks liked.
            - Bars: Height proportional to the number of tracks liked in that month, normalized against the month with the highest count. Bars should have a minimum visible height (e.g., 4px) even for low counts.
            - Color: Uses `--spotify-green` for bars.
            - Interaction: Horizontal scrolling if the timeline exceeds viewport width.
        - **Data:** Derived from the `added_at` timestamp of liked tracks.
        - **Loading/Empty States:** Handled by `VisualizationContainer`. Shows total track count below the chart.
        - **Optimization:** Uses client-side chunked processing for large datasets to maintain UI responsiveness.
    - **`GenreTrendsVisualization.tsx` (Your Genre Evolution):**
        - **Purpose:** To show how the user's preferences for top genres have changed over time (quarterly or yearly).
        - **Appearance:** A series of stacked horizontal bars, where each row represents a time period (e.g., "2023-Q1" or "2023").
            - Rows: Labelled with the period.
            - Stacked Bars: Each row/period consists of a horizontal bar segmented by colors. Each segment represents a top genre, and its width is proportional to that genre's prevalence (count) within that period, relative to other top genres in the same period.
            - Legend: Displays the top N (e.g., 8) genres and their corresponding colors, taken from a predefined palette.
            - Filters: Allows users to select time range ("Past Year", "Past 2 Years", "All Time") and granularity for "All Time" view ("Quarterly", "Yearly").
        - **Data:** Derived from genres associated with artists of liked tracks, grouped by period.
        - **Loading/Empty States:** Handled by `VisualizationContainer`.

Create a comprehensive web application that integrates with Spotify's API to provide users with detailed insights into their listening history. The application should:

CORE FUNCTIONALITY:

1. Authentication:
   - Implemented Spotify OAuth 2.0 flow via NextAuth.js.
   - Sign-in page (`src/app/auth/signin/page.tsx`) features automatic sign-in initiation with loading and error states.
   - NextAuth configuration (`src/app/api/auth/[...nextauth]/route.ts`) uses JWT strategy with specific cookie settings for enhanced security.
   - A dedicated session clearing API endpoint (`src/app/api/auth/clear-session/route.ts`) ensures robust cookie removal.
   - Comprehensive logout flow accessible via user dropdown in `Navigation.tsx`, redirecting to a `/thank-you` page.

2. User Dashboard (`src/app/dashboard/page.tsx`):
   - Displays overall listening statistics upon login using `PageContainer`.
   - Shows top artists and genres fetched via `useUserStats` hook. Includes `GenreTrendsVisualization` and `ListeningTrends` components.
   - Provides navigation to other sections using `FeatureCard` components.
   - Main app navigation managed by `Navigation.tsx`.

3. Monthly Listening History (`src/app/history/page.tsx`):
   - Chronological timeline interface using `MonthlyTrackList` component for collapsible sections per month.
   - Each month displays liked tracks (using `TrackItem`), with track information (title, artist, album, cover art, date liked).
   - Track processing and grouping by month handled by `src/lib/spotifyTrackUtils.ts`.
   - Uses `useLikedTracks` hook for data fetching and pagination (load more functionality).
   - Play button for previews is a potential future enhancement (currently not implemented in `TrackItem`).

4. Playlist Generation (Monthly):
   - "Create Monthly Playlist" button integrated within each `MonthlyTrackList` section on the History page.
   - Clicking automatically creates a playlist in the user\'s Spotify account using logic from `src/lib/spotifyTrackUtils.ts`.
   - Shows a success confirmation.

5. Custom Playlist Generator (`src/app/playlist-generator/page.tsx`):
   - Dedicated interface using `PageContainer` and `FormField` components for date pickers (start/end dates) and playlist name.
   - **Enhanced with filtering by top genres and artists** using `FilterSelector` components. Genre data from `src/lib/genreUtils.ts`.
   - Playlist creation logic from `src/lib/spotifyTrackUtils.ts`.
   - **Keyboard shortcuts** (e.g., Ctrl/Cmd+Enter to submit) implemented, with visual cues via `KeyboardShortcutInfo`.
   - Success state includes a `SharePlaylistButton` (copies link/text for sharing).

TECHNICAL REQUIREMENTS:

1. Frontend:
   - Modern JavaScript framework: React with Next.js (App Router).
   - Responsive design for desktop and mobile, primarily achieved via Tailwind CSS.
   - Styling heavily relies on global CSS variables in `src/app/globals.css` and Tailwind utility classes.
   - Core reusable components are located in `src/components/` (see "Key Architectural Patterns & Components").
   - `react-icons` library added and used for iconography.
   - The `useSpotify` hook returns an `isReady` flag; **ensure this is true before making authenticated API calls.**
   - Smooth transitions between views are a general goal.

2. Backend:
   - NextAuth.js handles Spotify API authentication securely.
   - Middleware (`src/middleware.ts`) provides route protection for authenticated pages and API routes, plus basic API rate limiting.
   - Data caching to minimize API calls is generally advisable but not explicitly implemented globally yet (some hooks might have local caching/state).
   - Error handling for API limits and failures is implemented in UI components (`ErrorDisplay`) and hooks.

3. Data Management:
   - User preferences are not explicitly stored locally yet beyond session information.
   - Sensitive Spotify tokens are managed by NextAuth.js and are not directly stored insecurely by custom client-side code. The `useSpotify` hook abstracts token access.

USER EXPERIENCE:

1. Design a clean, intuitive interface with Spotify-inspired aesthetics. This is largely achieved through the new global styles, CSS variables, and consistent core components.
2. Show loading states (`LoadingSpinner`) during API calls and asynchronous operations.
3. Provide clear feedback for all user actions (e.g., playlist creation success/failure, logout). `ErrorDisplay` component used for errors.
4. Include helpful tooltips for features, e.g., `KeyboardShortcutInfo` for playlist generator shortcuts.
5. Implement robust error handling with user-friendly messages.

ADDITIONAL FEATURES (if time permits):

1. Audio previews directly in the application (currently not in `TrackItem`).
2. Sharing capabilities for playlists (basic implementation with `SharePlaylistButton` on custom playlist generator; could be expanded).
3. Listening trends and statistics visualization (initial version on dashboard with `GenreTrendsVisualization` and `ListeningTrends`).
4. Theme customization options (foundational CSS variables are in place, making this feasible).
