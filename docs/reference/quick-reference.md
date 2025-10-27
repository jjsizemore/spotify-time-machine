# Quick Command Reference

## 🚀 Essential Commands

```bash
# Development
pnpm dev                  # Start dev server
pnpm build                # Build for production
pnpm start                # Start production server

# Code Quality (Turborepo Optimized ⚡)
pnpm check:parallel       # Lint + format + type-check in parallel
pnpm check:all            # All quality checks + tests
pnpm lint                 # Run linter only
pnpm fmt:check            # Check formatting
pnpm type-check           # TypeScript check

# Security
pnpm security             # All security scans
pnpm audit                # Full audit (security + quality)

# Quality
pnpm spellcheck           # Check for typos (FAST!)
```

## 📦 Tool Installation

```bash
mise install              # Install all tools
mise upgrade              # Update all tools
mise ls                   # List installed tools
```

## 🔒 Security Deep Dive

```bash
# Individual security scans
mise run security-trufflehog  # Find leaked secrets
mise run security-snyk        # Check vulnerabilities
mise run security-semgrep     # SAST analysis
mise run security-dotenv      # Lint .env files
```

## 🚀 CI/CD & GitHub Actions

```bash
# Your .env file is already encrypted!
# Just get the private key and add to GitHub Secrets
cat .env.keys                                 # View DOTENV_PRIVATE_KEY

# Test CI build locally
dotenvx run -- pnpm run build                 # Test with encrypted .env

# GitHub Secrets required:
# - DOTENV_PRIVATE_KEY (from .env.keys)
# - Optional fallbacks: NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_POSTHOG_KEY
```

See [GitHub Actions dotenvx Setup](../how-to/github-actions-dotenvx-setup.md) for complete instructions.

## 🧹 Maintenance

```bash
# Cleaning
mise run clean            # Clean build artifacts
mise run clean-cache      # Clear caches
mise run clean-all        # Nuclear clean + reinstall

# Analysis
mise run analyze          # Bundle size analysis
```

## ⚡ Performance Tips

- **Turborepo** caches tasks intelligently and runs tasks in parallel
- **typos** checks entire codebase in < 100ms
- **oxlint** is 50-100x faster than ESLint
- Use `pnpm check:parallel` for fastest local feedback
- Cache hits show as `>>> FULL TURBO` in output

## 🔄 Pre-commit Flow

```bash
# Automatic (via git hooks)
git commit -m "feat: ..."

# Manual check before commit
mise run check-all
mise run spellcheck
```

## 🎯 Common Workflows

### Before Committing

```bash
mise run check-all && mise run spellcheck
```

### Before Pushing

```bash
mise run audit
```

### Full Health Check

```bash
mise run clean:cache
mise run security
mise run check-all
mise run build
```

## 📚 More Info

See `DEV_TOOLS.md` for complete documentation.
