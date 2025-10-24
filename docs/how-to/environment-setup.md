# How-To: Set Up Environment Variables

**Category:** How-To Guide  
**Last Updated:** October 24, 2025

## Quick Start

This guide shows you how to configure environment variables for the Spotify Time Machine project.

## Prerequisites

- Project cloned locally
- Node.js and pnpm installed
- Spotify developer account

## Step 1: Copy Environment Template

```bash
cp .env.example .env.local
```

## Step 2: Get Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **Create an App**
3. Fill in app details:
   - **App Name**: Spotify Time Machine (Local Dev)
   - **App Description**: Local development instance
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/spotify`
4. Click **Save**
5. Copy your **Client ID** and **Client Secret**

## Step 3: Generate NextAuth Secret

Generate a secure random string:

```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Step 4: Configure .env.local

Edit `.env.local` with your values:

```bash
# Spotify API
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here

# NextAuth
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000

# Analytics (optional for local dev)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Step 5: Verify Configuration

Run the app to trigger automatic validation:

```bash
pnpm dev
```

If configuration is valid, you'll see:

```
✓ Configuration validated successfully!
✓ Ready on http://localhost:3000
```

If there are errors:

```
❌ Environment validation failed:
   - SPOTIFY_CLIENT_ID: Spotify Client ID is required
   - NEXTAUTH_SECRET: NextAuth Secret must be at least 32 characters
```

## Using Environment Variables in Code

### Server Components (Recommended)

```typescript
import { getValidatedEnv } from '@/lib/envConfig';

const env = getValidatedEnv();
console.log(env.SPOTIFY_CLIENT_ID); // Type-safe, validated
```

### Optional Variables with Defaults

```typescript
import { getEnvOrDefault } from '@/lib/envConfig';

const baseUrl = getEnvOrDefault('NEXT_PUBLIC_BASE_URL', 'https://default.com');
```

### Single Variable Access

```typescript
import { getEnvVar } from '@/lib/envConfig';

const dsn = getEnvVar('NEXT_PUBLIC_SENTRY_DSN'); // May be undefined
```

### Client Components

```typescript
// Use environment check for client-side code
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Development mode');
}
```

## Environment Files

### .env.example

Template with all required variables (committed to git)

### .env.local

Your local configuration (never committed)

### .env.test

Test-specific values (can be committed, no real secrets)

### .env.production

Production values (never committed, set in hosting platform)

## Required Variables

| Variable                 | Required | Default                 | Description            |
| ------------------------ | -------- | ----------------------- | ---------------------- |
| SPOTIFY_CLIENT_ID        | Yes      | -                       | From Spotify Dashboard |
| SPOTIFY_CLIENT_SECRET    | Yes      | -                       | From Spotify Dashboard |
| NEXTAUTH_SECRET          | Yes      | -                       | Min 32 characters      |
| NEXTAUTH_URL             | Yes      | -                       | App URL with protocol  |
| NEXT_PUBLIC_GA_ID        | Yes      | -                       | Google Analytics ID    |
| NEXT_PUBLIC_POSTHOG_KEY  | Yes      | -                       | PostHog project key    |
| NEXT_PUBLIC_POSTHOG_HOST | No       | https://app.posthog.com | PostHog API endpoint   |
| NEXT_PUBLIC_SENTRY_DSN   | No       | -                       | Sentry error tracking  |
| NEXT_PUBLIC_DEBUG        | No       | false                   | Enable debug mode      |
| NEXT_PUBLIC_BASE_URL     | No       | (auto-detected)         | Public app URL         |
| NODE_ENV                 | No       | development             | Runtime environment    |

## Troubleshooting

### "Environment validation failed"

**Check that:**

1. `.env.local` exists in project root
2. All required variables are set
3. No typos in variable names
4. URLs include `http://` or `https://`

**Verify variables:**

```bash
# Check what's loaded (requires dotenvx)
dotenvx get --all

# Check specific variable
dotenvx get SPOTIFY_CLIENT_ID
```

### "NextAuth URL must be a valid URL"

Ensure URL includes protocol:

```bash
# ✗ Wrong
NEXTAUTH_URL=localhost:3000

# ✓ Correct
NEXTAUTH_URL=http://localhost:3000
```

### "Secret must be at least 32 characters"

Generate a new secret:

```bash
openssl rand -base64 32
```

Then update `.env.local`:

```bash
NEXTAUTH_SECRET=<paste-generated-secret-here>
```

### "Missing environment variable"

If a required variable is missing, the app will exit with a clear error:

```
❌ Configuration Error:
   Required environment variable missing: SPOTIFY_CLIENT_ID

   Action: Add SPOTIFY_CLIENT_ID to your .env.local file
```

## Encrypted Variables (Production)

For production, use dotenvx to encrypt sensitive values:

```bash
# Encrypt a variable
dotenvx set SPOTIFY_CLIENT_SECRET "actual-secret-value"

# Run with encrypted variables
DOTENV_PRIVATE_KEY=your-key dotenvx run -- npm start
```

## Testing Environment Setup

For tests, use explicit test values:

```bash
# tests/.env.test
TEST_BASE_URL=http://localhost:3000
TEST_SPOTIFY_CLIENT_ID=test-spotify-client-id
NODE_ENV=test
```

Tests should **NOT** use production credentials.

## Deployment Checklist

Before deploying:

- [ ] All required variables set in hosting platform
- [ ] Secrets properly encrypted/secured
- [ ] NEXTAUTH_URL points to production domain
- [ ] Analytics IDs updated for production
- [ ] Build succeeds: `pnpm build`
- [ ] Tests pass: `pnpm test`

## Related Documentation

- [Reference: Environment Configuration](../reference/environment-configuration.md) - Complete variable reference
- [Explanation: Environment Migration](../explanation/environment-migration.md) - Architecture and rationale
- [How-To: Deploy to Production](./deployment.md) - Deployment guide

## External Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [dotenvx Documentation](https://dotenvx.com)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Spotify API Setup](https://developer.spotify.com/documentation/general/guides/authorization/)
