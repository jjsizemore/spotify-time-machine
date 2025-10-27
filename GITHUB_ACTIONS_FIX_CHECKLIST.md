# GitHub Actions Fix - Action Checklist

## ✅ Completed (Automated Changes)

- [x] Updated `.github/workflows/ci.yml` with proper dotenvx integration
- [x] Made Sentry configuration conditional in `next.config.ts`
- [x] Relaxed environment validation in `src/lib/env.ts` to allow fallback values
- [x] Simplified to use existing encrypted `.env` file (no separate .env.ci needed)
- [x] Created comprehensive setup documentation
- [x] Updated quick reference guide
- [x] Verified `.env.keys` is in `.gitignore`

## 🔲 Manual Steps Required

### Step 1: Get Your Private Key (1 minute)

Your `.env` file is already encrypted! Just get the private key:

```bash
# View the private key for your encrypted .env file
cat .env.keys
# Copy the DOTENV_PRIVATE_KEY value (the long string after DOTENV_PRIVATE_KEY=)
```

### Step 2: Add GitHub Secrets (5 minutes)

1. Go to: https://github.com/jjsizemore/spotify-time-machine/settings/secrets/actions

2. Click "New repository secret" for each:

**Required Secrets:**

- Name: `DOTENV_PRIVATE_KEY_CI`
  Value: [From `.env.keys` file - the value after `DOTENV_PRIVATE_KEY_CI=`]

- Name: `SPOTIFY_CLIENT_ID`
  Value: [Your Spotify Client ID]

- Name: `SPOTIFY_CLIENT_SECRET`
  Value: [Your Spotify Client Secret]

- Name: `NEXTAUTH_SECRET`
  Value: [Your NextAuth secret - 32+ chars]

- Name: `NEXTAUTH_URL`
  Value: `https://tm.jermainesizemore.com`

**Optional Secrets (Recommended):**

- Name: `NEXT_PUBLIC_GA_ID`
  Value: [Your GA4 ID like `G-XXXXXXXXXX` or use `G-DISABLED` for now]

- Name: `NEXT_PUBLIC_POSTHOG_KEY`
  Value: [Your PostHog key or use `disabled` for now]

- Name: `NEXT_PUBLIC_POSTHOG_HOST`
  Value: `https://app.posthog.com`

**Optional Secrets (Only if using Sentry):**

- Name: `SENTRY_AUTH_TOKEN`
  Value: [Your Sentry auth token]

- Name: `SENTRY_ORG`
  Value: [Your Sentry org slug - NOT encrypted!]

- Name: `SENTRY_PROJECT`
  Value: [Your Sentry project slug - NOT encrypted!]

- Name: `NEXT_PUBLIC_SENTRY_DSN`
  Value: [Your Sentry DSN]

### Step 3: Test Locally (Optional - 2 minutes)

```bash
# Test that your local .env file works with dotenvx
dotenvx run -- pnpm run build

# If it builds successfully, CI will work too!
```

### Step 4: Commit and Push (1 minute)

```bash
# Check git status
git status

# Add the changes (no .env changes needed - already encrypted and committed)
git add .github/ src/lib/ next.config.ts docs/

# Verify .env.keys is NOT staged
git status | grep -i "env.keys" && echo "❌ STOP! .env.keys should not be committed!" || echo "✅ Good to go!"

# Commit
git commit -m "fix: resolve GitHub Actions build issues with dotenvx

- Add conditional Sentry configuration
- Relax environment validation for CI
- Use encrypted .env file in CI workflow
- Add comprehensive documentation"

# Push to trigger CI
git push
```

### Step 5: Verify CI Build (5 minutes)

1. Go to: https://github.com/jjsizemore/spotify-time-machine/actions

2. Watch the latest workflow run

3. Check that:
   - ✅ Quality checks pass
   - ✅ Build completes successfully
   - ✅ No Sentry errors (if Sentry is configured)
   - ✅ No environment validation errors

## 🆘 Troubleshooting

### Build fails with decryption error

- Check `DOTENV_PRIVATE_KEY` in GitHub Secrets matches `.env.keys`
- Copy the FULL key including any special characters
- No quotes needed in GitHub Secrets
- Make sure you copied from `DOTENV_PRIVATE_KEY=` line (not `DOTENV_PUBLIC_KEY`)

### "Invalid value for project" (Sentry)

- Ensure Sentry secrets are PLAIN TEXT (not encrypted)
- Or remove Sentry secrets entirely - build will work without them
- Sentry is now optional!

### Environment validation errors

- Check that fallback values are provided in workflow
- Verify GitHub Secrets are named correctly (case-sensitive!)
- Use `G-DISABLED` for GA_ID if not ready to add real value

## 📚 Additional Resources

- **Detailed Setup**: `docs/how-to/github-actions-dotenvx-setup.md`
- **Implementation Details**: `docs/explanation/github-actions-fix.md`
- **Quick Reference**: `docs/reference/quick-reference.md`
- **dotenvx Docs**: https://dotenvx.com/docs/cis/github-actions

## ⏱️ Estimated Total Time

- **Get private key & add to GitHub**: ~3 minutes
- **Test & commit**: ~5 minutes
- **Total**: ~8 minutes (much simpler!)

- **Get private key & add to GitHub**: ~3 minutes
- **Test & commit**: ~5 minutes
- **Total**: ~8 minutes (much simpler!)

## 🎉 Success Criteria

- ✅ GitHub Actions build completes without errors
- ✅ All quality checks pass
- ✅ Environment variables properly loaded
- ✅ Sentry uploads succeed (if configured) or are skipped gracefully
- ✅ No encrypted values passed to external services
- ✅ `.env.keys` remains untracked by git

---

**Next Steps After Success:**

1. Monitor the next few CI runs to ensure stability
2. Consider rotating `DOTENV_PRIVATE_KEY_CI` every 90 days
3. Document any additional secrets added for your team
4. Set up similar encryption for staging/production environments if needed
