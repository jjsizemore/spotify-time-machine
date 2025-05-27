# Jermaine's Spotify Time Machine

A Next.js application that lets you explore your Spotify listening history, create playlists based on specific time periods, and visualize your music journey.

## Development Status

This project is actively being developed. For detailed implementation status and priorities, see [TODO.md](./TODO.md).

## Features

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

- **Technical Features:**
  - Secure Spotify OAuth 2.0 authentication with PKCE (in progress)
  - Advanced caching system for API responses
  - Responsive design with Tailwind CSS
  - Comprehensive error handling and loading states

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

## Project Structure

- `src/app`: Next.js app router components, pages, layouts, and API routes
- `src/components`: Reusable UI components
- `src/hooks`: Custom React hooks for data fetching and caching
- `src/lib`: Utility functions and API client setup
- `src/styles`: CSS and styling files
- `src/types`: TypeScript type definitions

## Code Quality & Development Tools

The project uses several tools to maintain code quality:

- **Trunk:** Unified development workflow and code quality tool
- **TypeScript:** Static type checking
- **Tailwind CSS:** Utility-first styling
- **Next.js:** React framework with App Router
- **pnpm:** Fast, disk space efficient package manager

## Styling System

The project uses Tailwind CSS for utility-first styling, combined with a custom Spotify-themed styling system:

- **Global Styles & Theming:** Base styles and CSS custom properties defined in `src/app/globals.css`
- **Tailwind CSS:** Utility-first styling approach
- **Reusable Component Classes:** Pre-defined classes for common elements
- **Responsive Design:** Mobile-first approach
- **Custom Scrollbar Styling:** Enhanced visual integration

## Authentication

Authentication is handled via NextAuth.js with the Spotify provider:

- Secure OAuth 2.0 flow with PKCE (in progress)
- JWT-based session management
- Automatic token refresh
- Session persistence
- Comprehensive error handling
- Secure logout process
