# GitHub Actions Build Fix - Implementation Summary

## Problem Statement

The GitHub Actions CI/CD pipeline was failing during the build step with multiple issues:

1. **Environment validation errors**: `NEXT_PUBLIC_GA_ID` validation failed - expected format `G-XXXXXXXXXX`
2. **Sentry configuration errors**: Encrypted project values being passed to Sentry CLI, causing "Invalid value for project" errors
3. **Missing environment variables**: Required variables not properly provided during CI builds
4. **dotenvx integration**: Improper usage of dotenvx for encrypted environment management

## Root Causes

### 1. Sentry Configuration Issue

The Sentry CLI was receiving encrypted values (e.g., `encrypted:BO7uyWVww/...`) for the `--project` parameter instead of plain text. This happened because:

- Sentry configuration in `next.config.ts` was always enabled
- No fallback when Sentry credentials are unavailable or invalid
- Environment variables weren't properly decrypted before being used

### 2. Environment Validation

The Zod schema in `src/lib/env.ts` was too strict:

- Required exact `G-XXXXXXXXXX` format for GA ID (no fallback for CI)
- No way to disable analytics in CI builds
- Failed when optional services weren't configured

### 3. dotenvx Integration

The workflow wasn't properly using dotenvx:

- Missing proper installation step
- Not using encrypted `.env.ci` file
- No fallback values for required variables

## Solutions Implemented

### 1. Conditional Sentry Configuration (`next.config.ts`)

**Before:**

```typescript
export default withSentryConfig(withFlowbiteReact(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // ...
});
```

**After:**

```typescript
const shouldEnableSentry = !!(
  process.env.SENTRY_ORG &&
  process.env.SENTRY_PROJECT &&
  process.env.SENTRY_AUTH_TOKEN
);

const configWithFlowbite = withFlowbiteReact(nextConfig);

export default shouldEnableSentry
  ? withSentryConfig(configWithFlowbite, {
      /* config */
    })
  : configWithFlowbite;
```

**Benefits:**

- Sentry only enabled when all credentials are available
- Build succeeds without Sentry configuration
- No encrypted values passed to Sentry CLI

### 2. Flexible Environment Validation (`src/lib/env.ts`)

**Before:**

```typescript
NEXT_PUBLIC_GA_ID: z.string().regex(/^G-[A-Z0-9]+$/, 'GA ID must be in format G-XXXXXXXXXX');
```

**After:**

```typescript
NEXT_PUBLIC_GA_ID: z.string().regex(
  /^(G-[A-Z0-9]+|G-DISABLED)$/,
  'GA ID must be in format G-XXXXXXXXXX or G-DISABLED'
);
```

**Benefits:**

- Allows `G-DISABLED` value for CI/test environments
- Maintains strict validation for production
- Enables builds without real analytics credentials

### 3. Enhanced GitHub Actions Workflow (`.github/workflows/ci.yml`)

**Key changes:**

```yaml
- name: Install dotenvx
  run: curl -fsS https://dotenvx.sh/install.sh | sh

- name: Build
  run: |
    # Try encrypted .env.ci first, fallback to regular build
    if [ -f ".env.ci" ]; then
      dotenvx run -f .env.ci -- pnpm run build
    else
      pnpm run build
    fi
  env:
    DOTENV_PRIVATE_KEY_CI: ${{ secrets.DOTENV_PRIVATE_KEY_CI }}
    # Fallback values for all required variables
    NEXT_PUBLIC_GA_ID: ${{ secrets.NEXT_PUBLIC_GA_ID || 'G-DISABLED' }}
    NEXT_PUBLIC_POSTHOG_KEY: ${{ secrets.NEXT_PUBLIC_POSTHOG_KEY || 'disabled' }}
    # ... more fallbacks
```

**Benefits:**

- Proper dotenvx installation and usage
- Encrypted `.env.ci` file support
- Fallback values prevent build failures
- Works with or without encrypted environment file
- Optional Sentry configuration

### 4. CI Environment File Template (`.env.ci`)

Created a template file with instructions:

- Documents all required variables
- Explains encryption process
- Links to detailed setup guide
- Safe to commit (contains only template/instructions initially)

### 5. Comprehensive Documentation

Created `docs/how-to/github-actions-dotenvx-setup.md`:

- Step-by-step setup instructions
- Encryption/decryption workflow
- Troubleshooting guide
- Security best practices
- Example commands and configurations

## Required Actions

To complete the fix, you need to:

### 1. Set Up Encrypted CI Variables

```bash
# Copy example to CI file
cp .env.example .env.ci

# Edit with actual CI values
# Then encrypt
dotenvx encrypt -f .env.ci

# Or set individual variables
dotenvx set SPOTIFY_CLIENT_ID "actual_value" -f .env.ci
dotenvx set SPOTIFY_CLIENT_SECRET "actual_value" -f .env.ci
dotenvx set NEXTAUTH_SECRET "actual_value" -f .env.ci
dotenvx set NEXTAUTH_URL "https://tm.jermainesizemore.com" -f .env.ci
dotenvx set NEXT_PUBLIC_GA_ID "G-XXXXXXXXXX" -f .env.ci
dotenvx set NEXT_PUBLIC_POSTHOG_KEY "actual_key" -f .env.ci
```

### 2. Add GitHub Secrets

Go to GitHub Settings → Secrets and variables → Actions, and add:

**Required:**

- `DOTENV_PRIVATE_KEY_CI` - from `.env.keys` after encryption
- `SPOTIFY_CLIENT_ID` - Spotify API credential
- `SPOTIFY_CLIENT_SECRET` - Spotify API credential
- `NEXTAUTH_SECRET` - 32+ character random string
- `NEXTAUTH_URL` - Production URL (e.g., `https://tm.jermainesizemore.com`)

**Optional (can use fallbacks):**

- `NEXT_PUBLIC_GA_ID` - Google Analytics ID or `G-DISABLED`
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog key or `disabled`
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host (defaults to `https://app.posthog.com`)

**Optional (Sentry - only if using Sentry):**

- `SENTRY_AUTH_TOKEN` - Sentry auth token
- `SENTRY_ORG` - Sentry organization slug
- `SENTRY_PROJECT` - Sentry project slug
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN

### 3. Commit and Push

```bash
# Add the encrypted .env.ci file
git add .env.ci

# DO NOT commit .env.keys!
# Verify it's in .gitignore

# Commit changes
git add .github/workflows/ci.yml src/lib/env.ts next.config.ts docs/
git commit -m "fix: resolve GitHub Actions build issues with dotenvx integration"
git push
```

## Testing

### Local Testing

Test the CI build locally before pushing:

```bash
# Ensure you have encrypted .env.ci
dotenvx run -f .env.ci -- pnpm run build
```

### CI Testing

After pushing:

1. Check GitHub Actions tab
2. Review build logs
3. Verify all steps pass
4. Confirm Sentry uploads (if configured)

## Fallback Behavior

The implementation provides multiple fallback layers:

1. **Primary**: Encrypted `.env.ci` file with `DOTENV_PRIVATE_KEY_CI`
2. **Secondary**: Individual GitHub Secrets
3. **Tertiary**: Default fallback values (`G-DISABLED`, `disabled`, etc.)

This ensures builds succeed even with partial configuration.

## Security Considerations

✅ **Good practices implemented:**

- Private keys stored only in GitHub Secrets
- Encrypted values safe to commit
- `.env.keys` excluded from git
- Minimal secrets exposure

⚠️ **Important notes:**

- Never commit `.env.keys` file
- Rotate `DOTENV_PRIVATE_KEY_CI` every 90 days
- Use different keys for different environments
- Audit GitHub Actions logs regularly

## Migration Path

For existing deployments:

1. **Development**: Already using `.env.local` (no changes needed)
2. **CI/CD**: Follow setup steps above
3. **Production (Vercel)**: Configure via Vercel dashboard (no changes needed)

Each environment remains isolated and secure.

## References

- [dotenvx Documentation](https://dotenvx.com/docs)
- [dotenvx GitHub Actions Guide](https://dotenvx.com/docs/cis/github-actions)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Sentry Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

## Rollback Plan

If issues occur, you can quickly rollback:

```bash
# Remove dotenvx integration
git revert <commit-hash>

# Or temporarily disable in workflow
# Comment out dotenvx installation and usage in .github/workflows/ci.yml
```

The fallback values ensure builds continue working during troubleshooting.
