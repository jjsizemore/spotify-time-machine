# Spotify Time Machine

A Next.js application that lets you explore your Spotify listening history, create playlists based on specific time periods, and visualize your music journey.

## Features

- View your top artists, tracks, and genres
- Generate monthly playlists from your listening history
- Create custom playlists based on date ranges
- Visualize your listening trends over time
- Spotify authentication integration

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

### Building CSS Styles

This project uses Tailwind CSS for styling with custom components. To ensure styles are properly built:

1. Make sure tailwind.config.js is properly configured with content paths
2. Build the CSS files using the following command:

```bash
npx tailwindcss -i ./src/styles/main.css -o ./src/app/spotify.css --watch
```

3. This will generate the necessary Spotify-themed styles and keep watching for changes

## Project Structure

- `src/app`: Next.js app router components and routes
- `src/components`: Reusable UI components
- `src/hooks`: Custom React hooks for data fetching
- `src/lib`: Utility functions and API client setup
- `src/styles`: CSS and styling files
- `src/types`: TypeScript type definitions

## Styling System

The project uses a custom Spotify-themed styling system with:

- Custom color palette matching Spotify's branding
- Reusable component classes like `.spotify-button`
- Responsive design for all device sizes
- Custom scrollbar styling

## Authentication

Authentication is handled via NextAuth.js with the Spotify provider. The system includes:

- Secure token management with automatic refresh
- Session persistence
- Error handling for authentication failures

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
