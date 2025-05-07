# Spotify Time Machine

## IMPORTANT INSTRUCTIONS
- Check TODO.md at the project root for a detailed feature implementation checklist
- The TODO.md file contains the current implementation status and priorities

## Optimization Preferences

- Prioritize simplicity and speed of implementation while maintaining code quality
- Use established, well-documented libraries and frameworks
- Focus on core functionality first, then add additional features
- Leverage existing Spotify API features where possible
- Implement features incrementally with working code at each step
- Use pnpm for all package management and scripts
- Use the Next.js App Router pattern (src/app directory, server/client components, layouts, etc.)
- Use Tailwind CSS for all styling and utility classes
- Follow modern React/Next.js best practices (e.g., file-based routing, server components, hooks, etc.)

Create a comprehensive web application that integrates with Spotify's API to provide users with detailed insights into their listening history. The application should:

CORE FUNCTIONALITY:

1. Authentication: Implement Spotify OAuth 2.0 flow to securely authenticate users and access their listening data.

2. User Dashboard:

   - Display overall listening statistics upon login
   - Show top artists, genres, and recently played tracks
   - Include a navigation menu to access different sections of the app

3. Monthly Listening History:

   - Create a chronological timeline interface with collapsible sections for each month
   - Each month should display:
     - All tracks the user has "liked" during that period
     - Basic track information (title, artist, album, cover art)
     - Date when the track was liked
     - Play button to preview songs
   - Implement infinite scrolling or pagination for months with many liked songs

4. Playlist Generation:

   - For each monthly section, include a prominent "Create Monthly Playlist" button
   - When clicked, automatically create a playlist in the user's Spotify account containing all liked songs from that month
   - Show a success confirmation with a link to open the playlist in Spotify

5. Custom Playlist Generator:
   - Add a dedicated interface for users to create playlists spanning custom date ranges
   - Include date pickers for start and end dates
   - Allow users to name their custom playlists
   - Provide options to filter by additional criteria (e.g., only certain genres)

TECHNICAL REQUIREMENTS:

1. Frontend:

   - Use a modern JavaScript framework (React or Vue recommended)
   - Implement responsive design for desktop and mobile
   - Create smooth transitions between views
   - Use data visualization for statistics (charts/graphs where appropriate)

2. Backend:

   - Handle Spotify API authentication securely
   - Cache data appropriately to minimize API calls
   - Implement error handling for API limits and failures

3. Data Management:
   - Store user preferences locally
   - Don't store sensitive Spotify tokens in insecure storage
   - Consider implementing a backend service for token management

USER EXPERIENCE:

1. Design a clean, intuitive interface with Spotify-inspired aesthetics
2. Show loading states during API calls
3. Provide clear feedback for all user actions
4. Include helpful tooltips for features
5. Implement robust error handling with user-friendly messages

ADDITIONAL FEATURES (if time permits):

1. Audio previews directly in the application
2. Sharing capabilities for playlists
3. Listening trends and statistics visualization
4. Theme customization options
