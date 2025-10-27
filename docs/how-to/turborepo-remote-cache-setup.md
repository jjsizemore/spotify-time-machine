# Turborepo Remote Cache Setup Guide

## Overview

This guide walks you through setting up Vercel Remote Cache for Turborepo, enabling shared caching across your team and CI/CD pipelines. Remote caching significantly speeds up builds by avoiding redundant work.

## Benefits

- **Faster CI/CD**: Cache hits from previous builds or other developers
- **Team Collaboration**: Share cache artifacts across your entire team
- **Cost Savings**: Reduced build times = lower CI/CD costs
- **Zero Configuration**: Works automatically once tokens are set up

## Prerequisites

- A Vercel account (free tier works)
- Repository access to GitHub Secrets and Variables
- Turborepo already configured (✅ Already done in this project)

## Setup Steps

### 1. Create Vercel Access Token

1. Go to [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Name it: `turborepo-remote-cache`
4. Set expiration (recommended: no expiration for CI)
5. Set scope: **Full Account** (or specific team)
6. Click **"Create"**
7. **Copy the token immediately** - you won't see it again!

### 2. Find Your Vercel Team Slug

Your team slug is the part after `vercel.com/` in your team URL.

**Example:**

- URL: `https://vercel.com/acme-corp`
- Team slug: `acme-corp`

For personal accounts, use your username.

### 3. Add GitHub Secrets and Variables

#### Add Secret (TURBO_TOKEN)

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Name: `TURBO_TOKEN`
5. Value: Paste the Vercel access token from Step 1
6. Click **"Add secret"**

#### Add Variable (TURBO_TEAM)

1. In the same section, click the **"Variables"** tab
2. Click **"New repository variable"**
3. Name: `TURBO_TEAM`
4. Value: Your team slug from Step 2
5. Click **"Add variable"**

> **Note:** We use a variable (not secret) for `TURBO_TEAM` so it appears in logs for debugging.

### 4. Update GitHub Actions Workflows

The workflows have been updated to include:

```yaml
jobs:
  build:
    name: Build and Test
    runs-on: ubuntu-latest
    env:
      TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
      TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

This enables remote caching for all jobs that run `turbo` commands.

### 5. Enable Remote Caching Locally (Optional)

To use remote caching on your local machine:

#### Login to Vercel

```bash
# Using global turbo
turbo login

# Or with pnpm
pnpm dlx turbo login
```

This opens a browser for authentication.

#### Link Repository

```bash
# Using global turbo
turbo link

# Or with pnpm
pnpm dlx turbo link
```

Follow the prompts to select your team and link the repository.

#### Verify Local Cache

```bash
# Clear local cache
rm -rf .turbo

# Run a cached task
pnpm build

# Run again - should hit remote cache
pnpm build
# Should see: cache hit, replaying logs
```

## Verification

### In GitHub Actions

After setup, check your workflow logs for:

```
• Running lint, fmt:check, type-check
• Remote caching enabled
lint: cache hit, replaying logs b6bfecdad66dede9
```

The `Remote caching enabled` message confirms it's working.

### Locally

After linking, you should see:

```
 Tasks:    3 successful, 3 total
Cached:    3 cached, 3 total
  Time:    0.342s >>> FULL TURBO
```

Cache hits will show where the cache came from:

- `MISS` - No cache found
- `HIT` - Local cache hit
- `REMOTE` - Remote cache hit

## Troubleshooting

### Remote caching not working in CI

**Check:**

1. Both `TURBO_TOKEN` and `TURBO_TEAM` are set correctly
2. Token has not expired
3. Token has correct permissions (Full Account or team-specific)
4. Workflow has `env:` section with both variables

**Debug in workflow:**

```yaml
- name: Debug Turbo
  run: |
    echo "TURBO_TEAM: ${{ vars.TURBO_TEAM }}"
    echo "TURBO_TOKEN set: ${{ secrets.TURBO_TOKEN != '' }}"
```

### Local caching not working

**Try:**

```bash
# Re-login
pnpm dlx turbo logout
pnpm dlx turbo login

# Re-link
pnpm dlx turbo unlink
pnpm dlx turbo link

# Verify configuration
cat .turbo/config.json
```

### Cache misses when expected hits

**Common causes:**

- Environment variables changed (included in cache key)
- Input files changed (even comments can affect hash)
- Different Node.js or dependency versions
- `package.json` or lock file changed

**Check cache key:**

```bash
# Verbose output shows cache keys
turbo run build --verbosity=2
```

### Token expired or invalid

**Symptoms:**

- `401 Unauthorized` errors
- `Remote caching disabled` in logs

**Solution:**

1. Create a new token in Vercel
2. Update `TURBO_TOKEN` secret in GitHub
3. Re-login locally with `turbo login`

## Security Considerations

### What gets cached?

- Task outputs (build artifacts, compiled files)
- Task logs (console output)
- File hashes (for cache invalidation)

### What does NOT get cached?

- Source code
- Secrets or environment variables
- Node modules

### Best Practices

1. **Use scoped tokens**: Create team-specific tokens, not personal
2. **Set expiration dates**: For personal tokens, use expiration
3. **Rotate tokens**: Periodically rotate access tokens
4. **Monitor usage**: Check Vercel dashboard for cache usage
5. **Audit logs**: Review Vercel audit logs for token usage

### Artifact Signing (Optional)

For additional security, enable artifact signing:

```json
{
  "remoteCache": {
    "signature": true
  }
}
```

Then set the signing key:

```bash
export TURBO_REMOTE_CACHE_SIGNATURE_KEY="your-secret-key"
```

Add to GitHub Secrets:

```yaml
env:
  TURBO_REMOTE_CACHE_SIGNATURE_KEY: ${{ secrets.TURBO_REMOTE_CACHE_SIGNATURE_KEY }}
```

## Monitoring & Metrics

### View Cache Usage

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your team
3. Navigate to **Settings → Usage**
4. View Turborepo cache statistics

### Metrics to Track

- **Cache hit rate**: Percentage of tasks served from cache
- **Cache size**: Total size of cached artifacts
- **API requests**: Number of cache read/write operations
- **Time saved**: Aggregate time saved across all builds

### Expected Results

**Without Remote Cache:**

- Each developer/CI run executes all tasks
- Total time: ~10-15s per run
- Wasted compute on identical work

**With Remote Cache:**

- First run: ~10-15s (cache miss)
- Subsequent runs: ~0.3-1s (cache hit)
- **90-95% time savings** on cache hits

## Advanced Configuration

### Custom Cache Server (Self-Hosted)

If you prefer self-hosting:

```bash
turbo login --manual
# Provide: API URL, team, token
```

See [Self-Hosting Guide](https://turbo.build/repo/docs/core-concepts/remote-caching#self-hosting) for details.

### CI-Specific Configuration

#### GitHub Actions Only

For CI-only remote caching (no local cache):

```yaml
env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}
  TURBO_REMOTE_ONLY: true # Skip local cache
```

#### Different tokens per environment

```yaml
env:
  TURBO_TOKEN: ${{ github.ref == 'refs/heads/main' && secrets.TURBO_TOKEN_PROD || secrets.TURBO_TOKEN_DEV }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

## Maintenance

### Regular Tasks

**Monthly:**

- Review cache usage and costs
- Check for expired tokens
- Verify cache hit rates

**Quarterly:**

- Rotate access tokens
- Audit team member access
- Review cache retention policies

**Annually:**

- Evaluate alternative caching solutions
- Review security posture
- Update documentation

### Cache Cleanup

Vercel automatically manages cache retention. To manually clear:

1. Go to Vercel Dashboard
2. Navigate to team settings
3. Find Turborepo cache section
4. Click **"Clear Cache"** (if available)

Or via CLI:

```bash
turbo prune  # Clear local and remote cache for current repo
```

## Resources

- [Turborepo Remote Caching Docs](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Vercel Remote Cache](https://vercel.com/docs/monorepos/remote-caching)
- [GitHub Actions Setup](https://turbo.build/repo/docs/guides/ci-vendors/github-actions)
- [OpenAPI Specification](https://turbo.build/repo/docs/openapi)

## Support

**Issues?**

- Check [Turborepo GitHub Issues](https://github.com/vercel/turborepo/issues)
- Visit [Vercel Community](https://community.vercel.com/tag/turborepo)
- Contact Vercel Support (for billing/account issues)

**Questions?**

- Open an issue in this repository
- Check the troubleshooting section above
- Review Turborepo documentation
