# Vercel Deployment Fixes

## Critical Issues Fixed

### 1. Content Security Policy - Vercel Scripts Blocked ✅

**Issue**: CSP was blocking Vercel's live feedback and analytics scripts.

**Fix Applied**: Added `https://vercel.live` to CSP directives in `next.config.ts`:

```typescript
script-src 'self' 'unsafe-eval' 'unsafe-inline'
  https://www.googletagmanager.com
  https://va.vercel-scripts.com
  https://*.vercel-scripts.com
  https://vercel.live;  // ← Added
connect-src 'self'
  https://www.google-analytics.com
  https://analytics.google.com
  https://vitals.vercel-analytics.com
  https://*.vercel-analytics.com
  https://vercel.live;  // ← Added
```

### 2. NextAuth 500 Errors - Environment Variables ⚠️

**Issue**: NextAuth endpoints returning 500 errors and HTML instead of JSON responses.

**Root Cause**: Missing or invalid environment variables in Vercel production environment.

**Required Actions in Vercel Dashboard**:

#### Step 1: Verify Required Environment Variables

Go to your Vercel project → Settings → Environment Variables and ensure ALL of these are set for **Production**:

| Variable                | Value                             | Notes                                                   |
| ----------------------- | --------------------------------- | ------------------------------------------------------- |
| `NEXTAUTH_URL`          | `https://tm.jermainesizemore.com` | **CRITICAL**: Must match your production domain exactly |
| `NEXTAUTH_SECRET`       | (your 32+ char secret)            | Generate with: `openssl rand -base64 32`                |
| `SPOTIFY_CLIENT_ID`     | (from Spotify Dashboard)          | Must be the same as dev                                 |
| `SPOTIFY_CLIENT_SECRET` | (from Spotify Dashboard)          | Must be the same as dev                                 |
| `NEXT_PUBLIC_GA_ID`     | `G-XXXXXXXXXX` or `G-DISABLED`    | Google Analytics ID (optional)                          |

#### Step 2: Verify Spotify OAuth Redirect URIs

In your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard):

1. Go to your app settings
2. Under "Redirect URIs", ensure you have:
   ```
   https://tm.jermainesizemore.com/api/auth/callback/spotify
   ```
3. Save changes

#### Step 3: Redeploy After Changes

After updating environment variables in Vercel:

```bash
# Trigger a new deployment
git commit --allow-empty -m "chore: trigger redeployment with env fixes"
git push origin main
```

Or use the Vercel dashboard: Deployments → [...] → Redeploy

### 3. Ad Blocker Warnings (Non-Critical)

**Issue**: Browser extensions blocking Vercel Analytics scripts.

```
/_vercel/insights/script.js: ERR_BLOCKED_BY_CLIENT
/_vercel/speed-insights/script.js: ERR_BLOCKED_BY_CLIENT
```

**Status**: These are client-side blocks from browser extensions (uBlock Origin, AdBlock, etc.). This is expected behavior and doesn't affect functionality. The scripts fail gracefully.

## Verification Steps

After deploying the fixes:

### 1. Check CSP Headers

```bash
curl -I https://tm.jermainesizemore.com | grep -i content-security-policy
```

Should include `vercel.live` in both `script-src` and `connect-src`.

### 2. Test Auth Endpoints

```bash
# Should return JSON, not HTML
curl https://tm.jermainesizemore.com/api/auth/session
# Expected: {"user":null} or session data

curl https://tm.jermainesizemore.com/api/auth/providers
# Expected: JSON with Spotify provider config
```

### 3. Browser Console Check

Open DevTools Console and verify:

- ✅ No CSP violations for `vercel.live`
- ✅ No NextAuth JSON parse errors
- ⚠️ Ad blocker warnings are acceptable (non-functional)

## Debugging Production Issues

### Enable NextAuth Debug Logging

If issues persist, temporarily enable debug mode:

1. In Vercel dashboard, add environment variable:
   ```
   NEXTAUTH_DEBUG=true
   ```
2. Redeploy
3. Check Vercel Function Logs for detailed auth flow

### Check Function Logs

```bash
vercel logs --follow
```

Or in Vercel dashboard: Deployments → [latest] → Functions → View Logs

### Common Errors & Solutions

| Error                     | Cause                 | Fix                            |
| ------------------------- | --------------------- | ------------------------------ |
| `NEXTAUTH_URL` not found  | Missing env var       | Add in Vercel settings         |
| Redirect URI mismatch     | Spotify config wrong  | Update Spotify Dashboard       |
| `RefreshAccessTokenError` | Invalid client secret | Verify `SPOTIFY_CLIENT_SECRET` |
| Cookie domain issues      | Wrong `NEXTAUTH_URL`  | Must match exact domain        |

## Related Documentation

- [Vercel Auth Deployment Guide](./vercel-auth-deployment.md)
- [Environment Setup](./environment-setup.md)
- [NextAuth Configuration](../explanation/token-management.md)

## Status

- ✅ CSP fix applied (commit pending)
- ⏳ Environment variables need verification in Vercel
- ⏳ Awaiting redeployment and testing
