# GitHub Actions Setup with dotenvx

This document explains how to configure GitHub Actions to use encrypted environment variables with dotenvx.

## Overview

The project uses [dotenvx](https://dotenvx.com) to securely manage environment variables in CI/CD pipelines. This approach encrypts sensitive values and allows them to be safely committed to the repository, while keeping the decryption key in GitHub Secrets.

## Prerequisites

- dotenvx CLI installed locally (`curl -fsS https://dotenvx.sh/install.sh | sh`)
- Access to GitHub repository secrets
- All required environment variable values

## Setup Steps

### 1. Create CI Environment File

Create a `.env.ci` file with all required variables:

```bash
# Copy template
cp .env.example .env.ci

# Edit with actual CI values
# Use production URLs and keys appropriate for CI builds
```

### 2. Encrypt Environment Variables

Use dotenvx to encrypt the CI environment variables:

```bash
# Encrypt all variables at once (recommended)
dotenvx encrypt -f .env.ci

# Or set individual variables
dotenvx set SPOTIFY_CLIENT_ID "your_value" -f .env.ci
dotenvx set SPOTIFY_CLIENT_SECRET "your_value" -f .env.ci
dotenvx set NEXTAUTH_SECRET "your_secret_32_chars_min" -f .env.ci
dotenvx set NEXTAUTH_URL "https://tm.jermainesizemore.com" -f .env.ci
dotenvx set NEXT_PUBLIC_GA_ID "G-XXXXXXXXXX" -f .env.ci
dotenvx set NEXT_PUBLIC_POSTHOG_KEY "your_key" -f .env.ci
dotenvx set NEXT_PUBLIC_POSTHOG_HOST "https://app.posthog.com" -f .env.ci

# Optional: Sentry configuration
dotenvx set SENTRY_AUTH_TOKEN "your_token" -f .env.ci
dotenvx set SENTRY_ORG "your_org" -f .env.ci
dotenvx set SENTRY_PROJECT "your_project" -f .env.ci
dotenvx set NEXT_PUBLIC_SENTRY_DSN "your_dsn" -f .env.ci
```

After encryption, your `.env.ci` file will contain encrypted values like:

```bash
SPOTIFY_CLIENT_ID="encrypted:BOg3hF8..."
SPOTIFY_CLIENT_SECRET="encrypted:BN2kd9..."
```

### 3. Get the Private Key

After encrypting, dotenvx creates a `.env.keys` file with private keys:

```bash
# View the keys
cat .env.keys

# Look for the CI key
# DOTENV_PRIVATE_KEY_CI="122...0b8"
```

**IMPORTANT:** Add `.env.keys` to `.gitignore` to prevent committing private keys!

### 4. Add Private Key to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `DOTENV_PRIVATE_KEY_CI`
5. Value: The private key from `.env.keys` (the long string after `DOTENV_PRIVATE_KEY_CI=`)
6. Click "Add secret"

### 5. Add Fallback Secrets (Optional)

For better flexibility, also add individual secrets as GitHub Secrets. The workflow will use these as fallbacks if the encrypted `.env.ci` file fails to decrypt:

Required secrets:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (defaults to https://tm.jermainesizemore.com if not set)

Optional analytics secrets (use fallback values if not set):

- `NEXT_PUBLIC_GA_ID` (defaults to 'G-DISABLED')
- `NEXT_PUBLIC_POSTHOG_KEY` (defaults to 'disabled')
- `NEXT_PUBLIC_POSTHOG_HOST` (defaults to 'https://app.posthog.com')

Optional Sentry secrets (Sentry disabled if not set):

- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `NEXT_PUBLIC_SENTRY_DSN`

### 6. Commit Encrypted File

The encrypted `.env.ci` file is safe to commit:

```bash
git add .env.ci
git commit -m "chore: add encrypted CI environment variables"
git push
```

**DO NOT commit `.env.keys` - it contains the private decryption keys!**

## How It Works in CI

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:

1. Installs dotenvx CLI
2. Decrypts `.env.ci` using `DOTENV_PRIVATE_KEY_CI` from GitHub Secrets
3. Runs the build with decrypted environment variables
4. Falls back to individual GitHub Secrets if decryption fails

```yaml
- name: Install dotenvx
  run: curl -fsS https://dotenvx.sh/install.sh | sh

- name: Build
  run: |
    if [ -f ".env.ci" ]; then
      dotenvx run -f .env.ci -- pnpm run build
    else
      pnpm run build
    fi
  env:
    DOTENV_PRIVATE_KEY_CI: ${{ secrets.DOTENV_PRIVATE_KEY_CI }}
    # Fallback values...
```

## Updating Environment Variables

To update an encrypted variable:

```bash
# Update a specific variable
dotenvx set VARIABLE_NAME "new_value" -f .env.ci

# Re-commit the file
git add .env.ci
git commit -m "chore: update CI environment variable"
git push
```

The private key remains the same, so no need to update GitHub Secrets.

## Troubleshooting

### Build fails with "MISSING_ENV_FILE"

The `.env.ci` file doesn't exist or isn't committed. Ensure it's tracked in git.

### Build fails with decryption error

The `DOTENV_PRIVATE_KEY_CI` secret in GitHub may be incorrect. Verify it matches the key in `.env.keys`.

### "Invalid value for project" error (Sentry)

This occurs when Sentry credentials are invalid or encrypted. Make sure:

1. Sentry secrets are added as plain text to GitHub Secrets (not encrypted)
2. Or disable Sentry by not setting the secrets - the build will work without it

### Analytics validation errors

If you see "GA ID must be in format G-XXXXXXXXXX":

- Add `NEXT_PUBLIC_GA_ID: G-DISABLED` to GitHub Secrets for testing
- Or encrypt a valid GA ID in `.env.ci`

## Security Best Practices

1. **Never commit `.env.keys`** - Add it to `.gitignore`
2. **Use different keys per environment** - `.env.ci`, `.env.production`, etc.
3. **Rotate keys periodically** - Re-encrypt with new keys every 90 days
4. **Audit secret access** - Review GitHub Actions logs regularly
5. **Use minimal permissions** - Only add secrets needed for CI

## Additional Resources

- [dotenvx Documentation](https://dotenvx.com/docs)
- [dotenvx GitHub Actions Guide](https://dotenvx.com/docs/cis/github-actions)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
