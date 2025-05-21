# Jermaine's Spotify Time Machine

A Next.js application that lets you explore your Spotify listening history, create playlists based on specific time periods, and visualize your music journey.

## Features

- View your top artists, tracks, genres, and recently played tracks.
- **Comprehensive Dashboard:** Access overall listening statistics, top artists & genres, and visualizations for listening trends (monthly track counts) and genre evolution over time.
- **Monthly Listening History:** Explore a chronological timeline of your liked tracks, grouped by month, with track details (title, artist, album, cover art, date liked).
- **Generate Monthly Playlists:** Easily create Spotify playlists from your listening history for any given month directly from the history page.
- **Custom Playlist Generator:** Craft playlists based on custom date ranges, with options to filter by your top genres and artists. Includes keyboard shortcuts for efficiency and a button to share your created playlist.
- **Spotify Authentication:** Secure sign-in using Spotify OAuth 2.0, managed by NextAuth.js, including automatic token refresh and session persistence.
- **Responsive Design:** Enjoy a consistent experience across desktop and mobile devices.

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
2. Install dependencies:

```bash
npm install
# or
pnpm install
```

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
pnpm dev
```

## Project Structure

- `src/app`: Next.js app router components, pages, layouts, and API routes (e.g., `api/auth/...`).
- `src/components`: Reusable UI components
- `src/hooks`: Custom React hooks for data fetching
- `src/lib`: Utility functions and API client setup
- `src/styles`: CSS and styling files
- `src/types`: TypeScript type definitions

## Styling System

The project uses Tailwind CSS for utility-first styling, combined with a custom Spotify-themed styling system:

- **Global Styles & Theming:** Base styles, CSS custom properties (variables) for colors (e.g., `--spotify-green`, `--spotify-black`), and typography are defined in `src/app/globals.css`, ensuring a consistent Spotify-like look and feel.
- **Tailwind CSS:** Leveraged extensively for applying styles directly in components and for responsive design.
- **Reusable Component Classes:** Pre-defined classes for common elements like `.spotify-button` (though utility classes are preferred).
- **Responsive Design:** Ensures adaptability across all device sizes.
- Custom scrollbar styling for a more integrated appearance.

## Authentication

Authentication is handled via NextAuth.js with the Spotify provider, incorporating best practices:

- Secure OAuth 2.0 flow.
- JWT (JSON Web Tokens) are used for session management.
- Automatic token refresh to maintain active sessions.
- Session persistence across browser sessions.
- Robust error handling for authentication failures.
- Comprehensive logout process, including server-side session clearing.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
