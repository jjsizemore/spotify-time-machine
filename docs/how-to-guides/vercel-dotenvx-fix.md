# Fixing dotenvx Integration with Vercel Deployment

## Problem

The deployment is failing because Vercel is trying to use encrypted environment variables from the `.env` file, but doesn't have the `DOTENV_PRIVATE_KEY` needed to decrypt them. This causes NextAuth API routes to fail with 500 errors.

## Root Cause

1. The project uses dotenvx to encrypt environment variables locally
2. The `.env` file contains encrypted values like:
   ```bash
   NEXTAUTH_URL=encrypted:BIK8f3nZto677Ui3...
   SPOTIFY_CLIENT_ID=encrypted:BBwSeFWo9WFRAawf...
   ```
3. Vercel runs `pnpm build` which executes `dotenvx run -- next build`
4. dotenvx tries to decrypt these values but `DOTENV_PRIVATE_KEY` is not set in Vercel
5. Environment validation fails → NextAuth crashes → 500 errors

## Solution: Use Vercel's Environment Variables

According to [dotenvx Vercel documentation](https://github.com/dotenvx/dotenvx#vercel-platform-integration-shell), production platforms like Vercel should use their native environment variable management, not encrypted .env files.

### Step 1: Update Build Script

Modify `package.json` to skip dotenvx on Vercel:

```json
{
  "scripts": {
    "build": "next build",
    "build:local": "dotenvx run -- next build",
    "build:ci": "dotenvx run -f .env -- next build"
  }
}
```

**Explanation:**

- `build` - Plain Next.js build for Vercel (uses Vercel's env vars)
- `build:local` - Local build with dotenvx for development
- `build:ci` - CI build with dotenvx for GitHub Actions

### Step 2: Add Decrypted Values to Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these **decrypted** values for **Production** environment:

#### Required Variables

| Variable                | Value                             | How to Get                                                             |
| ----------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| `NEXTAUTH_URL`          | `https://tm.jermainesizemore.com` | Your production domain                                                 |
| `NEXTAUTH_SECRET`       | (32+ characters)                  | Generate: `openssl rand -base64 32`                                    |
| `SPOTIFY_CLIENT_ID`     | (from Spotify Dashboard)          | [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) |
| `SPOTIFY_CLIENT_SECRET` | (from Spotify Dashboard)          | Same as above                                                          |
| `NEXT_PUBLIC_GA_ID`     | `G-XXXXXXXXXX` or `G-DISABLED`    | Google Analytics (optional)                                            |

#### Optional Variables

| Variable                 | Value                             |
| ------------------------ | --------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN` | Your Sentry DSN                   |
| `SENTRY_AUTH_TOKEN`      | Sentry auth token                 |
| `SENTRY_ORG`             | Your Sentry org slug              |
| `SENTRY_PROJECT`         | Your Sentry project slug          |
| `NEXT_PUBLIC_BASE_URL`   | `https://tm.jermainesizemore.com` |

### Step 3: Decrypt Local Values

To get the decrypted values from your `.env` file:

```bash
# View all decrypted values
dotenvx get --all --pretty-print

# Or get individual values
dotenvx get NEXTAUTH_SECRET
dotenvx get SPOTIFY_CLIENT_ID
dotenvx get SPOTIFY_CLIENT_SECRET
```

**Note:** You need the `DOTENV_PRIVATE_KEY` from `.env.keys` in your environment:

```bash
# Load the private key
export DOTENV_PRIVATE_KEY="<key from .env.keys>"

# Then run the get commands
dotenvx get NEXTAUTH_SECRET
```

### Step 4: Update Vercel Build Command (Optional)

If you want to be explicit, update your Vercel project settings:

1. Go to Vercel Dashboard → Your Project → Settings → General
2. Under "Build & Development Settings"
3. Set Build Command to: `pnpm build` (no dotenvx)
4. Leave other settings as default

### Step 5: Redeploy

After adding all environment variables:

```bash
git commit --allow-empty -m "fix: update build script for Vercel deployment"
git push origin main
```

Or trigger a manual redeploy from Vercel Dashboard.

## Alternative: Use DOTENV_PRIVATE_KEY in Vercel (Not Recommended)

If you really want to use encrypted .env files on Vercel:

1. Add `DOTENV_PRIVATE_KEY` to Vercel environment variables
2. Use the key from `.env.keys` file
3. Keep the build script as `dotenvx run -- next build`

**However, this is NOT recommended because:**

- Vercel's native env vars are more secure (encrypted at rest)
- No need to manage private keys
- Simpler deployment process
- Better integration with Vercel's platform

## Verification

After deployment, verify the fix:

```bash
# 1. Check NextAuth endpoints return JSON
curl https://tm.jermainesizemore.com/api/auth/session
# Expected: {"user":null} or session data, NOT HTML

# 2. Check providers endpoint
curl https://tm.jermainesizemore.com/api/auth/providers
# Expected: JSON with Spotify provider config

# 3. Test authentication flow
# Visit https://tm.jermainesizemore.com and try signing in
```

## Environment Precedence

Understanding how environment variables are loaded:

### Local Development

```
.env.local (highest priority)
  ↓
.env.development
  ↓
.env (encrypted, decrypted by dotenvx)
```

### Vercel Production

```
Vercel Environment Variables (highest priority)
  ↓
.env.production (if exists)
  ↓
.env (encrypted values ignored without DOTENV_PRIVATE_KEY)
```

## Security Considerations

### ✅ Recommended Approach (Vercel Native)

- Environment variables stored in Vercel's encrypted system
- No private keys to manage
- Automatic encryption at rest and in transit
- Audit logs in Vercel dashboard
- Team member access control

### ⚠️ Alternative Approach (dotenvx on Vercel)

- Requires exposing `DOTENV_PRIVATE_KEY` to Vercel
- Additional complexity in deployment
- Potential for key leakage
- Harder to rotate keys

## Related Documentation

- [Vercel Deployment Fixes](./vercel-deployment-fixes.md)
- [Environment Setup](./environment-setup.md)
- [dotenvx Vercel Integration](https://github.com/dotenvx/dotenvx#vercel-platform-integration-shell)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Troubleshooting

### Issue: Still getting 500 errors after adding env vars

**Solution:**

1. Double-check all required variables are set in Vercel
2. Ensure `NEXTAUTH_URL` matches your exact production domain
3. Verify Spotify redirect URIs include your production domain
4. Check Vercel Function Logs for specific error messages

### Issue: "Environment validation failed" in build logs

**Solution:**

1. Check which variables are missing from error message
2. Add them to Vercel environment variables
3. Ensure no typos in variable names
4. For `NEXT_PUBLIC_*` vars, they must be set at build time

### Issue: Build succeeds but app crashes at runtime

**Solution:**

1. Check Vercel Function Logs for runtime errors
2. Verify all `NEXT_PUBLIC_*` variables are set (they're embedded at build time)
3. Check that `NEXTAUTH_SECRET` is set and at least 32 characters
4. Ensure `NODE_ENV=production` in Vercel

## Summary

The fix involves two main changes:

1. **Build Script:** Use plain `next build` for Vercel (no dotenvx)
2. **Environment Variables:** Add decrypted values directly to Vercel Dashboard

This aligns with Vercel's best practices and dotenvx's recommended deployment strategy for cloud platforms.
