# Turborepo Remote Caching - Setup Checklist

## 🎯 Quick Setup (5 minutes)

Follow these steps to enable remote caching for this repository:

### ✅ Step 1: Create Vercel Access Token

1. Visit: https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Configure:
   - Name: `turborepo-remote-cache`
   - Expiration: No expiration (recommended for CI)
   - Scope: Full Account (or your team)
4. Click **"Create"**
5. **⚠️ IMPORTANT**: Copy the token immediately (you won't see it again!)

### ✅ Step 2: Get Your Vercel Team Slug

Your team slug is in your Vercel URL:

- Example: `vercel.com/acme-corp` → team slug is `acme-corp`
- For personal accounts: use your username

### ✅ Step 3: Add GitHub Secrets

1. Go to: https://github.com/jjsizemore/spotify-time-machine/settings/secrets/actions
2. Click **"New repository secret"**
3. Create secret:
   - Name: `TURBO_TOKEN`
   - Value: [paste the token from Step 1]
4. Click **"Add secret"**

### ✅ Step 4: Add GitHub Variable

1. In the same settings page, click **"Variables"** tab
2. Click **"New repository variable"**
3. Create variable:
   - Name: `TURBO_TEAM`
   - Value: [your team slug from Step 2]
4. Click **"Add variable"**

### ✅ Step 5: Verify Setup

The CI workflows are already configured! Just push a commit and check the logs:

```bash
# Make a small change
echo "# Testing remote cache" >> README.md
git add .
git commit -m "test: verify turborepo remote caching"
git push
```

Check the GitHub Actions logs for:

```
• Remote caching enabled
```

### 🎉 Done!

Remote caching is now enabled for:

- ✅ CI/CD workflows (automatic)
- ✅ All turbo tasks (lint, test, build, etc.)
- ⏳ Local development (optional - see below)

## 💻 Optional: Enable Local Remote Caching

To use the shared cache on your local machine:

```bash
# Login to Vercel
pnpm dlx turbo login

# Link this repository
pnpm dlx turbo link
```

Then run any task:

```bash
pnpm check:parallel
# First run: MISS
# Second run (or after CI): REMOTE HIT
```

## 📊 Expected Results

**Before:**

```
 Tasks:    3 successful, 3 total
Cached:    0 cached, 3 total
  Time:    10.639s
```

**After (cache hit):**

```
 Tasks:    3 successful, 3 total
Cached:    3 cached, 3 total
  Time:    0.342s >>> FULL TURBO
```

**That's 96% faster! 🚀**

## 📚 Resources

- [Complete Setup Guide](./turborepo-remote-cache-setup.md)
- [Troubleshooting](./turborepo-remote-cache-setup.md#troubleshooting)
- [Security Considerations](./turborepo-remote-cache-setup.md#security-considerations)

## ❓ Questions?

See the [full setup guide](./turborepo-remote-cache-setup.md) or open an issue.
