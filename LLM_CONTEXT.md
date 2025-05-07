# Spotify Time Machine

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
   - Consider implementating a backend service for token management

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
