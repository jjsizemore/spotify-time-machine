<!-- markdownlint-disable MD024 -->

# Environment Configuration Guide

This guide documents the modern environment variable validation setup for the Spotify Time Machine application.

## Overview

The application uses a comprehensive, type-safe environment configuration system built with:

- **Zod v4.1.12** - TypeScript-first schema validation library
- **dotenvx** - Secure, multi-environment .env solution with encryption support
- **Next.js best practices** - Production-ready configuration patterns

## Architecture

### File Structure

```
src/lib/
├── env.ts              # Zod schema definition (single source of truth)
├── envConfig.ts        # Environment variable getter functions
├── configUtils.ts      # Application initialization & validation
└── init.ts             # Startup initialization (imported in app)
```

## Files

### 1. `src/lib/env.ts`

**Purpose:** Defines the comprehensive Zod validation schema for all environment variables.

**Key Features:**

- Single source of truth for environment configuration
- Organized into semantic sections (Spotify, NextAuth, Analytics, Sentry)
- Type inference for fully typed access: `type Environment = z.infer<typeof envSchema>`
- Descriptive validation messages for debugging
- Support for optional and nullable fields

**Exported:**

- `envSchema` - The complete validation schema
- `Environment` - TypeScript type for validated environment
- `validateEnv(env)` - Function to validate raw environment object

**Example Usage:**

```typescript
import type { Environment } from './lib/env';

// Type-safe environment usage
const config: Environment = {...};
const id: string = config.SPOTIFY_CLIENT_ID;
```

### 2. `src/lib/envConfig.ts`

**Purpose:** Provides safe, convenient functions to access environment variables using dotenvx.

**Key Features:**

- Lazy initialization with caching
- Built-in dotenvx.get() integration for decryption support
- Multiple accessor functions for different use cases
- Clear error handling and recovery
- Follows dotenvx best practices

**Exported Functions:**

| Function                         | Purpose                                       |
| -------------------------------- | --------------------------------------------- |
| `getEnvVar(key)`                 | Get a single variable with dotenvx decryption |
| `getAllEnvVars()`                | Get all environment variables as object       |
| `getValidatedEnv()`              | Get validated singleton with caching          |
| `getEnvOrDefault(key, fallback)` | Get with fallback value                       |
| `requireEnvVar(key, feature?)`   | Require a variable or throw error             |

**Example Usage:**

```typescript
import { getValidatedEnv, getEnvVar, requireEnvVar } from './lib/envConfig';

// Get validated environment (recommended)
const env = getValidatedEnv();
console.log(env.SPOTIFY_CLIENT_ID); // Type-safe

// Get optional variable with dotenvx
const apiKey = getEnvVar('SENTRY_AUTH_TOKEN');

// Require a variable for a feature
const token = requireEnvVar('NEXTAUTH_SECRET', 'Authentication');

// Get with fallback
const host = getEnvOrDefault('POSTHOG_HOST', 'https://app.posthog.com');
```

### 3. `src/lib/configUtils.ts`

**Purpose:** Application initialization and validation at startup.

**Key Features:**

- Called during Next.js startup
- Exits process if validation fails (prevents running with bad config)
- Clear success/failure logging
- Proper error propagation with context

**Exported:**

- `validateConfig()` - Called on app startup

**Behavior:**

- ✓ Success: Logs environment type and exits cleanly
- ✗ Failure: Logs detailed error, exits with code 1

### 4. `src/lib/init.ts`

**Purpose:** Initialization entry point called by Next.js.

**Integration:**

- Calls `validateConfig()` on startup
- This file is imported to trigger validation before app starts

## Environment Variables

### Required Variables

| Variable                  | Description             | Format             | Example                 |
| ------------------------- | ----------------------- | ------------------ | ----------------------- |
| `SPOTIFY_CLIENT_ID`       | Spotify API ID          | String             | `abc123...`             |
| `SPOTIFY_CLIENT_SECRET`   | Spotify API Secret      | String (encrypted) | `xyz789...`             |
| `NEXTAUTH_SECRET`         | NextAuth encryption key | String, ≥32 chars  | Random 32+ char string  |
| `NEXTAUTH_URL`            | NextAuth callback URL   | URL                | `http://localhost:3000` |
| `NEXT_PUBLIC_GA_ID`       | Google Analytics ID     | `G-[A-Z0-9]+`      | `G-XXXXXXXXXX`          |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog API key         | String             | `phc_...`               |

### Optional Variables

| Variable                   | Description           | Default                   |
| -------------------------- | --------------------- | ------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`   | Sentry error tracking | -                         |
| `SENTRY_AUTH_TOKEN`        | Sentry authentication | -                         |
| `SENTRY_ORG`               | Sentry organization   | -                         |
| `SENTRY_PROJECT`           | Sentry project        | -                         |
| `NEXT_PUBLIC_BASE_URL`     | Application base URL  | -                         |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog instance URL  | `https://app.posthog.com` |

### Special Variables

| Variable            | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `NODE_ENV`          | Runtime environment (development/production/test)    |
| `DOTENV_PUBLIC_KEY` | Public key for encrypted .env files (set by dotenvx) |

## Setup Instructions

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Fill in Required Values

Edit `.env.local` with your actual credentials:

```bash
# Spotify API
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here

# NextAuth
NEXTAUTH_SECRET=your_secret_key_at_least_32_characters_long
NEXTAUTH_URL=http://localhost:3000

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key_here
```

### 3. (Optional) Encrypt Sensitive Variables

```bash
# Encrypt variables using dotenvx
dotenvx set SPOTIFY_CLIENT_SECRET "your_secret"
dotenvx set NEXTAUTH_SECRET "your_secret"

# The .env file will now contain encrypted values
```

### 4. Run Application

```bash
# Development
pnpm dev

# Production
pnpm build && pnpm start
```

The app will validate the environment on startup and fail fast with detailed errors if anything is misconfigured.

## Error Handling

### Validation Fails on Startup

```
✗ Environment configuration validation failed:
  - SPOTIFY_CLIENT_ID: Spotify Client ID is required
  - NEXTAUTH_SECRET: NextAuth Secret must be at least 32 characters
```

### Missing Required Variable at Runtime

```typescript
const token = requireEnvVar('MISSING_VAR', 'MyFeature');
// Error: Required environment variable 'MISSING_VAR' is not set for MyFeature
```

## Type Safety

The configuration provides full TypeScript support:

```typescript
import { getValidatedEnv } from './lib/envConfig';
import type { Environment } from './lib/env';

const env = getValidatedEnv(); // Type: Environment

// All properties are type-safe
const clientId: string = env.SPOTIFY_CLIENT_ID;
const nodeEnv: 'development' | 'production' | 'test' = env.NODE_ENV;

// TypeScript error: DOES_NOT_EXIST is not a property
// env.DOES_NOT_EXIST; // ❌ Error: Property does not exist
```

## Modern Best Practices

This setup follows current industry best practices:

### ✓ Single Source of Truth

- All configuration rules defined in one schema (`env.ts`)
- Easy to audit and maintain

### ✓ Schema Validation

- Zod provides runtime validation with excellent error messages
- Schema is also used for type inference (DRY principle)

### ✓ Secure Encryption

- dotenvx supports encrypted environment variables
- Never commit unencrypted secrets to version control

### ✓ Type Safety

- Full TypeScript inference from schema
- Catch configuration errors at build time

### ✓ Fail Fast

- Application exits immediately if configuration is invalid
- Prevents silent failures with partial configuration

### ✓ Clear Error Messages

- Validation errors list exactly what's missing/invalid
- Helps developers quickly fix issues

### ✓ Performance

- Environment validated once at startup
- Results cached for the lifetime of the application

### ✓ Documentation

- Schema descriptions appear in IDE intellisense
- Self-documenting configuration

## Integration with dotenvx

The setup integrates with dotenvx for secure variable management:

### Load from .env File

```typescript
// dotenvx.get() automatically:
// 1. Reads from .env/.env.local/.env.production etc.
// 2. Decrypts encrypted variables using DOTENV_PRIVATE_KEY
// 3. Returns the decrypted value

const secret = getEnvVar('NEXTAUTH_SECRET');
```

### Usage in Environment

When running with `dotenvx run`:

```bash
dotenvx run -- pnpm dev
# Environment variables are loaded and decrypted automatically
```

### Encryption Workflow

```bash
# Encrypt a variable
dotenvx set SECRET_NAME "secret_value"

# Environment file will contain encrypted version
# .env: SECRET_NAME=encrypted:ENCRYPTEDBLUFRBLURFBLURB...

# Verify decryption
dotenvx get SECRET_NAME  # Shows: secret_value

# Run with encrypted variables
DOTENV_PRIVATE_KEY=your_private_key dotenvx run -- npm start
```

## Documentation References

- **Zod v4 Documentation:** https://zod.dev
- **dotenvx Documentation:** https://dotenvx.com
- **Next.js Environment Variables:** https://nextjs.org/docs/basic-features/environment-variables
- **12-Factor App - Config:** https://12factor.net/config

## Migration from Old Setup

If migrating from the old `configUtils.ts`:

1. **Old:** Basic NODE_ENV, Spotify, NextAuth only
2. **New:** Comprehensive schema with analytics and Sentry support

### What Changed

- ✓ More variables validated (GA4, PostHog, Sentry)
- ✓ Better error messages with field-level detail
- ✓ Type-safe Environment type
- ✓ Multiple helper functions (getEnvOrDefault, requireEnvVar)
- ✓ dotenvx integration for encrypted variables

### Backward Compatibility

- All previously required variables are still required
- Old .env files continue to work
- No breaking changes to application behavior

## Troubleshooting

### "Required environment variable not set"

**Solution:** Check that the variable is in your `.env.local` or `.env` file:

```bash
# List all variables
dotenvx get --all

# Check specific variable
dotenvx get SPOTIFY_CLIENT_ID
```

### "URL is not valid"

**Solution:** Ensure URLs include protocol (http:// or https://):

```bash
# ❌ Wrong
NEXTAUTH_URL=localhost:3000

# ✓ Correct
NEXTAUTH_URL=http://localhost:3000
```

### "Secret must be at least 32 characters"

**Solution:** Generate a longer random string:

```bash
# Generate 32+ character secret
openssl rand -base64 32

# Or use dotenvx to set and auto-validate
dotenvx set NEXTAUTH_SECRET "$(openssl rand -base64 32)"
```

### Encrypted variables not decrypting

**Solution:** Ensure DOTENV_PRIVATE_KEY is set:

```bash
# Check if key is set
echo $DOTENV_PRIVATE_KEY

# If empty, export it
export DOTENV_PRIVATE_KEY="your_private_key"

# Then run with dotenvx
dotenvx run -- pnpm dev
```

## Future Enhancements

Possible improvements:

- [ ] Dynamic schema reloading (hot reload on .env change)
- [ ] Remote configuration loading (e.g., from AWS Secrets Manager)
- [ ] Environment-specific defaults (production vs. development)
- [ ] Configuration documentation generation from schema
- [ ] Audit logging of configuration access

## Support

For questions or issues:

1. Check this guide's Troubleshooting section
2. Review error messages carefully (they contain detailed information)
3. Check `.env.example` for required format
4. Consult Context7 documentation for library details
