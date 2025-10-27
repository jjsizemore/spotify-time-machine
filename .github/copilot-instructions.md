# Copilot Instructions: Spotify Time Machine

## Project Overview

Next.js 16 music analytics app using Spotify API with enterprise-grade authentication, token management, and comprehensive analytics. Built with App Router, React 19, TypeScript, and Tailwind CSS v4.

## Critical Architecture Patterns

### Authentication & API Access

**ALWAYS use the `useSpotify` hook for Spotify API access:**

```typescript
import { useSpotify } from '@/hooks/useSpotify';
import { SpotifyApiError } from '@/lib/spotify';

const { spotifyApi, isReady, error, retry } = useSpotify();

// MUST check isReady before making API calls
if (!isReady) return <LoadingSpinner />;
if (error) return <ErrorDisplay message={error} onRetry={retry} />;

// API calls MUST handle SpotifyApiError
try {
  const data = await spotifyApi.getUserTopTracks();
} catch (err) {
  if (err instanceof SpotifyApiError) {
    // Handle API errors with status codes
  }
}
```

**Token Management Rules:**

- NextAuth handles ALL token operations server-side
- NEVER expose refresh tokens to client
- Tokens auto-refresh 5 minutes before expiry
- Request queue prevents rate limiting (100ms min interval)
- Failed refreshes trigger re-authentication automatically

### Component Architecture

**Import paths use semantic aliases:**

```typescript
import ActionButton from '@/ui/ActionButton'; // UI primitives
import Header from '@/layout/Header'; // Layout components
import TopTracks from '@/features/stats/TopTracks'; // Feature-specific
import WebVitalsMonitor from '@/analytics/WebVitalsMonitor'; // Analytics
import TokenStatus from '@/auth/TokenStatus'; // Auth components
import { NextAuthProvider } from '@/providers/NextAuthProvider'; // Providers
```

**Component Organization:**

- `src/components/ui/` - Reusable UI primitives (buttons, spinners, toasts)
- `src/components/layout/` - Layout structure (Header, Footer, Navigation)
- `src/components/features/` - Feature domains (stats, visualization, controls, playlist)
- `src/components/analytics/` - Monitoring components
- `src/components/auth/` - Authentication components
- `src/components/providers/` - React context providers

### Data Management & Caching

**Cache System uses localStorage with compression:**

```typescript
import { getCache, setCache, clearAllCache } from '@/lib/cacheUtils';

// All cache operations are async (native gzip compression)
const cached = await getCache<TracksData>('liked_tracks');
await setCache('liked_tracks', data, 3600000); // TTL in ms
```

**Cache Features:**

- Real gzip compression (not base64) with native `CompressionStream` API
- Automatic fallback to `fflate` for older browsers
- TTL-based expiration with automatic cleanup
- Structured error handling with detailed logging
- Handles Unicode characters properly

**Data Hooks Pattern:**

```typescript
import { useLikedTracks } from '@/hooks/useLikedTracks';

// Hooks handle progressive loading, caching, and error states
const { tracks, isLoading, error } = useLikedTracks();
```

## Development Workflows

### Essential Commands

```bash
pnpm dev              # Dev server (uses dotenvx for env vars)
pnpm build            # Production build (runs type-check first via Turborepo)
pnpm test             # Run all tests (Vitest with projects: unit, integration, browser)
pnpm check:parallel   # Run lint, format, type-check in parallel ⚡
pnpm lint             # Oxlint (fast) + ESLint
pnpm fmt:fix          # Prettier format
pnpm check:all        # All quality checks + tests (via Turborepo)
pnpm security         # Run all security scans (secrets, deps, SAST)
```

### Turborepo Task Optimization

**This project uses Turborepo for intelligent task caching and parallelization:**

- Tasks cache based on inputs - only re-run when relevant files change
- Independent tasks (lint, fmt:check, type-check) run in parallel
- Precise input patterns minimize cache misses
- Cache hits show as `>>> FULL TURBO` in terminal output

**Key optimizations:**

- `check:parallel` runs validation tasks concurrently
- Test tasks cache based on specific test file changes
- Build depends on type-check to ensure type safety
- Environment files included in build cache inputs

See [Turborepo Optimization Guide](../docs/explanation/turborepo-optimization.md) for details.

### Testing Strategy

**Vitest v4 with project-based organization:**

- `unit` - Component/utility tests (happy-dom)
- `integration` - API/hook integration (happy-dom with MSW)
- `browser` - Real browser tests (Playwright)

**Test files location:**

- `src/**/*.test.ts` - Unit tests colocated with source
- `tests/unit/**` - Unit test suites
- `tests/integration/**` - Integration tests
- `tests/browser/**` - Browser/E2E tests

**Key testing patterns:**

- Mock Next.js router/navigation in `tests/setup/setup-files.ts`
- Use `@testing-library/react` for component tests
- Custom matcher: `toBeValidSpotifyId()` for Spotify ID validation
- Global cleanup runs automatically after each test

### Git Hooks (Lefthook)

**Pre-commit (parallel):**

- Oxlint + ESLint (auto-fix staged files)
- Prettier (format code & config files)
- Typos (spell check with auto-fix)
- Semgrep (SAST on staged files)
- Type-check (all TypeScript files)

**Pre-push:**

- Full security scan (secrets, deps, SAST)

**Commit-msg:**

- Commitlint (conventional commits)

## Project-Specific Conventions

### Styling & Theming

**Tailwind CSS v4 with CSS-based config:**

- Configuration in `src/app/globals.css` NOT `tailwind.config.ts`
- Uses `@import "tailwindcss"` instead of `@tailwind` directives
- Spotify colors via CSS custom properties: `--spotify-green`, `--spotify-black`, etc.
- Flowbite React integration via `@plugin "flowbite/plugin"`

**Color palette usage:**

```css
/* Use semantic Spotify colors */
bg-spotify-green     /* #1db954 - primary brand */
bg-spotify-black     /* #191414 - backgrounds */
text-spotify-white   /* #ffffff - primary text */
```

### Error Handling Patterns

**Always import and check for SpotifyApiError:**

```typescript
import { SpotifyApiError } from '@/lib/spotify';

try {
  const result = await spotifyApi.getPlaylist(id);
} catch (error) {
  if (error instanceof SpotifyApiError) {
    // Has .status property for HTTP status codes
    console.error(`API Error ${error.status}:`, error.message);
  }
  throw error;
}
```

**Enhanced cache error handling:**

- Errors categorized: `QUOTA_EXCEEDED`, `PARSE_ERROR`, `STORAGE_ACCESS`, `CORRUPTED_DATA`
- Automatic cleanup of oldest entries on quota errors
- Detailed logging with operation context

### Analytics & Monitoring

**Multiple platforms integrated:**

- Google Analytics 4 (Core Web Vitals + page analytics)
- Vercel Analytics (performance monitoring)
- PostHog (product analytics, session replay)
- Sentry (error tracking, performance monitoring)

**All platforms receive Web Vitals data (CLS, INP, LCP, FCP, TTFB)**

**Development indicators:**

- TokenStatus widget shows real-time token state (dev only)
- Console logs use emoji prefixes (🔑 auth, 📊 analytics, ⚠️ warnings)
- PostHog debug mode enabled in development

### SEO Implementation

**Use enhanced metadata helpers:**

```typescript
import { generateEnhancedMetadata } from '@/lib/seo';

export const metadata = generateEnhancedMetadata({
  title: 'Page Title',
  description: 'Page description',
  path: '/page-path',
  tags: ['music', 'analytics'],
});
```

**Structured data generators available:**

- `generateWebApplicationSchema()` - Main app schema
- `generateBreadcrumbSchema()` - Navigation breadcrumbs
- `generateOrganizationSchema()` - Organization info
- `generateFAQSchema()` - FAQ pages

## Critical Integration Points

### Environment Variables

**Validation with Zod schema in `src/lib/envConfig.ts`:**

- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` - OAuth credentials
- `NEXTAUTH_URL` - MUST be `http://127.0.0.1:3000` for dev (cookie domain requirements)
- `NEXTAUTH_SECRET` - Session encryption key
- All env vars validated at startup via `src/lib/init.ts`

### Next.js Configuration

**Modern Next.js 16 features enabled:**

- `reactCompiler: true` - Automatic memoization
- `cacheComponents: true` - Component caching
- Turbopack dev server with filesystem caching
- Optimized package imports for major libraries

**Security headers configured** - CSP, referrer policy, frame options

### Turborepo Task Pipeline

**Build dependencies configured in `turbo.json`:**

- `build` depends on `type-check`
- `check:all` runs `lint`, `fmt`, `type-check`, `test` in order
- Caching configured with input/output specs
- Development tasks marked non-cacheable

## Common Pitfalls

1. **DON'T bypass `useSpotify` hook** - Direct `spotifyApi` imports skip token management
2. **DON'T use relative imports** - Use semantic path aliases (`@/ui/`, `@/features/`, etc.)
3. **DON'T expose refresh tokens client-side** - All token operations via NextAuth server-side
4. **DON'T use `tailwind.config.ts`** - Tailwind v4 uses CSS-based config in `globals.css`
5. **DON'T forget to await cache operations** - `getCache`/`setCache` are async (compression)
6. **DON'T import from `.cursor/rules/`** - These are AI assistant configs, not code

## File Navigation

**Key architectural files:**

- `src/lib/spotify.ts` - Enhanced Spotify API client with queuing
- `src/hooks/useSpotify.ts` - Primary hook for API access
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration with PKCE
- `src/lib/cacheUtils.ts` - Cache management with compression
- `vitest.config.ts` - Test configuration with projects
- `turbo.json` - Build pipeline configuration

**Documentation:**

- `docs/reference/llm-context.md` - Comprehensive project context
- `docs/reference/quick-reference.md` - Common commands
- `docs/reference/todo.md` - Current roadmap
- `docs/explanation/*.md` - Architecture decisions and migrations
