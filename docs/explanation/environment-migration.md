# Explanation: Environment Configuration Migration

**Category:** Explanation  
**Last Updated:** October 24, 2025

## Overview

This document explains the migration from direct `process.env` access to a centralized, type-safe environment configuration system using Zod validation and dotenvx encryption.

## The Problem

### Before Migration

The codebase had **54+ direct `process.env` references** scattered across multiple files:

```typescript
// API routes
const clientId = process.env.SPOTIFY_CLIENT_ID; // No validation
const secret = process.env.NEXTAUTH_SECRET; // May be undefined

// Configuration
if (process.env.NODE_ENV === 'production') {
  // Repeated everywhere
  // ...
}
```

**Issues:**

- ❌ No type safety
- ❌ No validation
- ❌ Risk of typos
- ❌ Unclear requirements
- ❌ Hard to test
- ❌ No encryption support

### After Migration

Centralized configuration with validation:

```typescript
import { getValidatedEnv } from '@/lib/envConfig';

const env = getValidatedEnv(); // Validated once, cached
const clientId = env.SPOTIFY_CLIENT_ID; // Type-safe, guaranteed present
const secret = env.NEXTAUTH_SECRET; // Min 32 chars, validated
```

**Benefits:**

- ✅ Full type safety
- ✅ Startup validation
- ✅ Clear requirements
- ✅ Easy to test
- ✅ Encryption support
- ✅ Self-documenting

## Architecture

### System Components

```
.env.local
    ↓ (loaded by)
dotenvx
    ↓ (provides to)
src/lib/env.ts
    ↓ (validates with)
Zod Schema
    ↓ (accessed via)
src/lib/envConfig.ts
    ↓ (used by)
Application Code
```

### File Structure

```
src/
└── lib/
    ├── env.ts           # Zod schema definition
    ├── envConfig.ts     # Getter functions
    ├── configUtils.ts   # Validation logic
    └── init.ts          # Startup hook
```

## Design Decisions

### Why Zod?

**Chosen:** Zod v4 for schema validation

**Alternatives considered:**

- **Yup**: Less TypeScript support
- **Joi**: Heavier, backend-focused
- **Custom validation**: Reinventing the wheel

**Rationale:**

- Excellent TypeScript integration
- Runtime and compile-time validation
- Clear error messages
- Industry standard
- Active development

### Why dotenvx?

**Chosen:** dotenvx for environment management

**Alternatives considered:**

- **dotenv**: No encryption support
- **env-cmd**: Less flexible
- **cross-env**: Different use case

**Rationale:**

- Built-in encryption
- Backward compatible with dotenv
- Multi-environment support
- Easy secret rotation
- Good documentation

### Why Centralized Config?

**Pattern:** Single source of truth in `getValidatedEnv()`

**Alternatives considered:**

- Individual validators per file
- Direct env access with guards
- Runtime-only validation

**Rationale:**

- Validate once at startup
- Fail fast if misconfigured
- Easy to mock in tests
- Clear requirements
- Better performance (cached)

## Migration Strategy

### Phase 1: Setup (Day 1)

1. Created Zod schema in `src/lib/env.ts`
2. Implemented getter functions in `src/lib/envConfig.ts`
3. Added validation in `src/lib/configUtils.ts`
4. Set up startup hook in `src/lib/init.ts`

### Phase 2: API Routes (Day 1-2)

Migrated authentication-critical code first:

- NextAuth configuration
- Spotify API client
- Token refresh endpoint

**Priority:** Security-sensitive code

### Phase 3: Libraries (Day 2)

Migrated shared utilities:

- Analytics
- SEO helpers
- Cache utilities
- Proxy configuration

**Priority:** Widely-used code

### Phase 4: Components (Day 2-3)

Migrated React components:

- Server components
- Client components (with guards)
- Page files
- Layout files

**Priority:** User-facing code

### Phase 5: Configuration (Day 3)

Migrated build and runtime config:

- Sentry configuration
- Next.js config (partially)
- Test setup

**Priority:** Supporting infrastructure

## Key Implementation Details

### Schema Definition

```typescript
// src/lib/env.ts
export const envSchema = z.object({
  // Required with validation
  SPOTIFY_CLIENT_ID: z.string().min(1, 'Spotify Client ID is required'),

  // Required with format validation
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth Secret must be at least 32 characters'),

  // Required with URL validation
  NEXTAUTH_URL: z.string().url('NextAuth URL must be a valid URL'),

  // Optional with default
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Optional public variables
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});
```

**Design choices:**

- Explicit requirements (no ambiguity)
- Format validation (catch issues early)
- Sensible defaults (optional vars)
- Clear error messages (easy troubleshooting)

### Validation Timing

**When:** Application startup (before any route handling)

**Where:** `src/lib/init.ts` imported in `app/layout.tsx`

**Why:**

- Fail fast if misconfigured
- Prevent partial starts
- Clear error messages
- Exit with error code 1

### Caching Strategy

```typescript
let cachedEnv: ValidatedEnv | null = null;

export function getValidatedEnv(): ValidatedEnv {
  if (!cachedEnv) {
    cachedEnv = loadAndValidateEnv();
  }
  return cachedEnv;
}
```

**Rationale:**

- Validate only once
- Better performance
- Consistent values
- Easy to test (can reset cache)

### Error Handling

```typescript
try {
  const parsed = envSchema.parse(rawEnv);
  return parsed;
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.errors.forEach((err) => {
      console.error(`   - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1); // Fail fast
  }
  throw error;
}
```

**Features:**

- Clear error messages
- Lists all errors (not just first)
- Exits with error code
- Prevents partial startup

## Pattern Guide

### Server-Side Code

**Pattern:** Use `getValidatedEnv()` for full environment

```typescript
import { getValidatedEnv } from '@/lib/envConfig';

export function myServerFunction() {
  const env = getValidatedEnv();
  return {
    clientId: env.SPOTIFY_CLIENT_ID,
    isProduction: env.NODE_ENV === 'production',
  };
}
```

### Optional Values

**Pattern:** Use `getEnvOrDefault()` for optional variables

```typescript
import { getEnvOrDefault } from '@/lib/envConfig';

const baseUrl = getEnvOrDefault('NEXT_PUBLIC_BASE_URL', 'https://tm.jermainesizemore.com');
```

### Single Variable

**Pattern:** Use `getEnvVar()` for one-off access

```typescript
import { getEnvVar } from '@/lib/envConfig';

const dsn = getEnvVar('NEXT_PUBLIC_SENTRY_DSN');
if (dsn) {
  initializeSentry(dsn);
}
```

### Client Components

**Pattern:** Use `typeof process !== 'undefined'` guard

```typescript
'use client';

export function ClientComponent() {
  const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

  return isDev ? <DebugPanel /> : null;
}
```

**Why this works:**

- `process` undefined in browser
- `NODE_ENV` is build-time constant
- Safe for hydration
- No server-side dependency

## Migration Statistics

| Category              | Count | Notes                          |
| --------------------- | ----- | ------------------------------ |
| Total migrations      | 54+   | Direct process.env references  |
| Files modified        | 25+   | Across API, components, config |
| API routes updated    | 2     | Critical auth paths            |
| Components updated    | 12    | Server and client components   |
| Library files updated | 6     | Shared utilities               |
| Config files updated  | 4     | Build and runtime config       |
| Build-time preserved  | 7     | Intentional direct access      |
| Lines of code changed | 500+  | Including new config system    |
| Breaking changes      | 0     | Fully backward compatible      |

## Build-Time vs Runtime

### Build-Time Variables (Preserved)

Some variables must use direct `process.env` access:

```typescript
// next.config.ts
const isDev = process.env.NODE_ENV === 'development';
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;
```

**Why:** These run during build, before runtime validation

**Examples:**

- `ANALYZE` - Bundle analysis flag
- `VERCEL_GIT_COMMIT_SHA` - Deployment metadata
- `SENTRY_ORG` / `SENTRY_PROJECT` - Build tools config
- `CI` - CI/CD environment detection

### Runtime Variables (Migrated)

All runtime code uses validated environment:

```typescript
// Server components, API routes, utilities
const env = getValidatedEnv();
```

**Why:** Runtime has validated environment available

## Testing Strategy

### Test Isolation

Tests should NOT use production environment:

```typescript
// tests/setup/global-setup.ts
const testEnv = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  spotifyClientId: process.env.TEST_SPOTIFY_CLIENT_ID || 'test-client-id',
};
```

**Key principles:**

- Use explicit test defaults
- Don't call `getEnvOrDefault()` in tests
- Isolate from .env file
- Reproducible across environments

### Mocking

```typescript
import { vi } from 'vitest';

vi.mock('@/lib/envConfig', () => ({
  getValidatedEnv: () => ({
    SPOTIFY_CLIENT_ID: 'test-client-id',
    NEXTAUTH_SECRET: 'a'.repeat(32),
    NODE_ENV: 'test',
    // ...other required vars
  }),
}));
```

## Security Considerations

### Secret Management

**Local development:**

- Secrets in `.env.local` (gitignored)
- Never commit secrets
- Use different secrets than production

**Production:**

- Set in hosting platform (Vercel, AWS, etc.)
- Use encrypted secrets (dotenvx)
- Rotate regularly
- Monitor access

### Validation Benefits

```typescript
// Before: Silent failure, undefined errors later
const secret = process.env.NEXTAUTH_SECRET;
jwt.sign(payload, secret); // Fails at runtime

// After: Fail fast at startup
const env = getValidatedEnv(); // Validates min 32 chars
jwt.sign(payload, env.NEXTAUTH_SECRET); // Guaranteed valid
```

### Type Safety

```typescript
// Before: Any typo passes type checking
const id = process.env.SPOTIFY_CLIENT_ID; // Typo!

// After: Compiler catches typos
const env = getValidatedEnv();
const id = env.SPOTIFY_CLIENT_ID; // Type error!
```

## Performance Impact

### Validation Overhead

- **When:** Once at startup
- **Duration:** < 10ms
- **Frequency:** Single time (cached)
- **Impact:** Negligible

### Runtime Performance

```typescript
// Before: Repeated lookups
function handler() {
  const id = process.env.SPOTIFY_CLIENT_ID; // Lookup
  const secret = process.env.SPOTIFY_CLIENT_SECRET; // Lookup
}

// After: Cached access
const env = getValidatedEnv(); // Once
function handler() {
  const id = env.SPOTIFY_CLIENT_ID; // Memory access
  const secret = env.SPOTIFY_CLIENT_SECRET; // Memory access
}
```

**Result:** Faster due to caching

## Future Enhancements

### Planned Improvements

1. **Feature Flags**

   ```typescript
   features: {
     newPlaylistUI: getEnvOrDefault('FEATURE_NEW_PLAYLIST_UI', 'false') === 'true',
   }
   ```

2. **Environment-Specific Overrides**

   ```typescript
   const config = {
     ...baseConfig,
     ...(env.NODE_ENV === 'production' ? productionConfig : {}),
   };
   ```

3. **Auto-Generated Documentation**

   ```typescript
   // Generate docs/reference/environment-variables.md from schema
   ```

4. **Runtime Reloading**

   ```typescript
   // Hot reload environment in development
   if (env.NODE_ENV === 'development') {
     watchEnvFile();
   }
   ```

5. **Client Environment Provider**
   ```typescript
   // Context for client components
   <EnvProvider value={publicEnv}>{children}</EnvProvider>
   ```

## Related Documentation

- [How-To: Set Up Environment Variables](../how-to/environment-setup.md) - Setup guide
- [Reference: Environment Configuration](../reference/environment-configuration.md) - Complete variable reference
- [Explanation: Testing Environment](./test-environment-isolation.md) - Test isolation strategy

## External Resources

- [Zod Documentation](https://zod.dev)
- [dotenvx Documentation](https://dotenvx.com)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [12-Factor App: Config](https://12factor.net/config)
