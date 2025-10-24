# Architecture

## System Architecture Overview

The Spotify Time Machine is a Next.js Progressive Web App that integrates with Spotify's Web API to provide music analytics and playlist generation. It follows a modern full-stack architecture with client-side rendering, server-side API routes, and sophisticated state management.

## Source Code Organization

- `src/app/`: Next.js App Router pages, layouts, and API routes
  - `api/auth/[...nextauth]/`: NextAuth.js authentication routes
  - `api/auth/refresh-token/`: Manual token refresh testing endpoint
  - `dashboard/`: Main dashboard page with stats and visualizations
  - `history/`: Monthly listening history timeline
  - `playlist-generator/`: Custom playlist creation interface
  - `feedback/`: User feedback collection system
  - `storage-monitor/`: Development storage monitoring tools
  - `thank-you/`: Post-interaction thank you pages
- `src/components/`: Reusable UI components organized by feature
  - `features/`: Feature-specific components (stats, playlist, visualization)
    - `controls/`: Data fetching and filtering controls (DataFetcherAndControlsWrapper, FilterSelector, GranularitySelector, TimeRangeSelector)
  - `layout/`: Layout and navigation components
  - `ui/`: Base UI components (buttons, forms, modals)
  - `analytics/`: Analytics and monitoring components (WebVitalsMonitor, StorageMonitor)
  - `auth/`: Authentication components (SpotifySignInButton, TokenStatus)
- `src/hooks/`: Custom React hooks for data fetching and business logic
  - `useIOSPWA.ts`: iOS PWA installation support
  - `useLikedArtists.ts`: Artist data fetching and management
  - `useLikedTracks.ts`: Track data fetching and management
  - `useSpotify.ts`: Core Spotify API integration with error handling
  - `useUserStats.ts`: User statistics and analytics
- `src/lib/`: Utility functions and API clients
  - `env.ts`: Zod schema for environment validation
  - `envConfig.ts`: Type-safe environment configuration getters
  - `configUtils.ts`: Configuration validation and initialization
  - `init.ts`: Application startup hooks
  - `tokenUtils.ts`: Token analysis and management utilities
  - `feedbackActions.ts`: User feedback collection actions
  - `spotify.ts`: Enhanced Spotify API client with request queuing
  - `analytics.ts`: Multi-platform analytics integration
- `src/types/`: TypeScript type definitions

## Key Technical Decisions

- **Next.js App Router**: Modern routing with server components and API routes
- **TanStack Query**: Advanced data fetching with caching, background updates, and error handling
- **NextAuth.js**: Authentication with Spotify OAuth provider
- **Tailwind CSS**: Utility-first styling with custom Spotify-themed design system
- **TypeScript**: Type safety throughout the application
- **PWA Features**: Service worker, manifest, and offline capabilities
- **Zod Validation**: Type-safe environment configuration and runtime validation
- **Multi-Platform Analytics**: Google Analytics 4, Vercel Analytics, PostHog, and Sentry integration
- **Request Queuing**: Enterprise-grade API reliability with retry mechanisms and rate limiting

## Design Patterns

- **Custom Hooks**: Encapsulate data fetching and business logic (useSpotify, useLikedTracks, useIOSPWA)
- **Compound Components**: Related components grouped together (StatsTabs, VisualizationContainer)
- **Error Boundaries**: Graceful error handling with retry mechanisms
- **Provider Pattern**: Context providers for global state (NextAuth, QueryClient, Analytics)
- **Analytics Integration**: Multi-platform monitoring with Sentry, PostHog, and Vercel Analytics

## Component Relationships

- **Data Flow**: Hooks → Components → UI, with TanStack Query managing server state
- **Authentication**: NextAuth session → useSpotify hook → API client → Spotify API
- **State Management**: Local component state for UI, TanStack Query for server state
- **Error Handling**: Consistent error display with retry options across components

## Critical Implementation Paths

- **Authentication Flow**: `/auth/signin` → NextAuth → Spotify OAuth → Dashboard
- **Data Fetching**: useSpotify hook → spotify.ts client → API routes → Spotify API
- **Playlist Creation**: User selection → API route → Spotify API → Success feedback
- **Visualization**: Raw data → Processing hooks → Chart components → Interactive UI
- **Analytics Integration**: Multi-platform monitoring with Sentry error tracking, PostHog analytics, and Vercel Speed Insights
- **Environment Configuration**: Startup validation → Zod schemas → Type-safe getters → Application initialization
- **Token Management**: Proactive refresh → Request queuing → Retry mechanisms → Error recovery
- **User Feedback**: Form submission → API processing → Thank you page → Analytics tracking
