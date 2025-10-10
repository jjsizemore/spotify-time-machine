# Quick Command Reference

## 🚀 Essential Commands

```bash
# Development
mise run dev              # Start dev server
mise run build            # Build for production
mise run start            # Start production server

# Code Quality
mise run check-all        # Lint + format + type-check
mise run lint             # Run linter only
mise run fmt              # Format code
mise run type-check       # TypeScript check

# Security (⚡ NEW!)
mise run security         # All security scans
mise run audit            # Full audit (security + quality)

# Quality (⚡ NEW!)
mise run spellcheck       # Check for typos (FAST!)
mise run shellcheck       # Lint shell scripts
mise run actionlint       # Lint GitHub workflows
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

- **typos** checks entire codebase in < 100ms
- **oxlint** is 50-100x faster than ESLint
- **turbo** caches tasks intelligently
- **mise** runs tasks in parallel

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
