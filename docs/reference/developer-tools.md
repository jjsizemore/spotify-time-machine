# Developer Experience & DevSecOps Tools

This document describes all the tools and commands available in this project for improved developer experience and security.

## Tool Management (mise)

We use [mise](https://mise.jdx.dev/) for managing development tools. All tools are automatically installed and versioned.

### Available Tools

- **Node.js** - JavaScript runtime (latest)
- **pnpm** - Fast, disk space efficient package manager (latest)
- **prettier** - Code formatter (latest)
- **oxlint** - Fast JavaScript/TypeScript linter (latest)
- **typos** - Fast spell checker for code (latest)
- **dotenv-linter** - Linter for .env files (latest)
- **trufflehog** - Secret scanner (latest)
- **snyk** - Vulnerability scanner (latest)
- **semgrep** - SAST security scanner (latest)
- **shellcheck** - Shell script linter (latest)
- **actionlint** - GitHub Actions workflow linter (latest)
- **lefthook** - Fast git hooks manager (latest)

### Installing Tools

```bash
# Install all tools defined in mise.toml
mise install

# Install specific tool
mise install prettier

# Update all tools
mise upgrade
```

## Development Commands

### Quick Start

```bash
# Start development server
mise run dev
# or
pnpm dev

# Build for production
mise run build
# or
pnpm build

# Start production server
mise run start
# or
pnpm start
```

### Code Quality

```bash
# Run linter
mise run lint
pnpm lint

# Format code
mise run fmt
pnpm fmt

# Check formatting without changes
mise run fmt-check
pnpm fmt:check

# Type check
mise run type-check
pnpm type-check

# Run all checks (lint + type-check)
mise run check
pnpm check

# Run all checks (lint + fmt + type-check)
mise run check-all
pnpm check:all
```

### Security Commands

```bash
# Run all security checks
mise run security
pnpm security

# Individual security scans:

# Scan for secrets/credentials
mise run security-trufflehog
pnpm security:secrets

# Check for dependency vulnerabilities
mise run security-snyk
pnpm security:deps

# Static Application Security Testing
mise run security-semgrep
pnpm security:sast

# Lint .env files
mise run security-dotenv
pnpm security:env
```

### Quality Commands

```bash
# Spell check code and docs
mise run spellcheck
pnpm spellcheck

# Lint shell scripts
mise run shellcheck

# Lint GitHub Actions workflows
mise run actionlint

# Run comprehensive audit (security + quality)
mise run audit
pnpm audit
```

### Build & Analysis

```bash
# Analyze bundle size
mise run analyze
pnpm analyze

# Clean build artifacts and cache
mise run clean
pnpm clean

# Clean cache only
mise run clean-cache
pnpm clean:cache

# Clean everything (including node_modules)
mise run clean-all
pnpm clean:all
```

### Git Hooks

We use lefthook by default, a faster alternative to husky.

```bash
# Install lefthook hooks
mise run hooks-install

# Run pre-commit hooks manually
mise run hooks-run
```

To switch to lefthook:

1. Uncomment the hooks in `lefthook.yml`
2. Run `mise run hooks-install`
3. Remove husky from package.json prepare script

## CI/CD Integration

All mise tasks can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Install mise
  run: curl https://mise.run | sh

- name: Setup tools
  run: mise install

- name: Run security checks
  run: mise run security

- name: Run quality checks
  run: mise run check-all

- name: Build
  run: mise run build
```

## Configuration Files

- `mise.toml` - Tool versions and task definitions
- `turbo.json` - Turborepo task configuration
- `_typos.toml` - Spell checker configuration
- `.trufflehog-exclude.txt` - Secret scanner exclusions
- `lefthook.yml` - Git hooks configuration
- `semgrep.yml` - SAST security rules

## Best Practices

1. **Before Committing:**

   ```bash
   mise run check-all
   mise run security
   ```

2. **Before Pushing:**

   ```bash
   mise run audit
   ```

3. **Regular Maintenance:**

   ```bash
   # Update tools
   mise upgrade

   # Update dependencies
   pnpm update --latest

   # Check for vulnerabilities
   pnpm security:deps
   ```

4. **Performance:**
   - Use `mise run` for task orchestration (parallel execution)
   - Use `turbo` for build caching
   - Use `pnpm` for fast installs

## Troubleshooting

### Tool not found

```bash
# Reinstall all tools
mise install

# Check tool status
mise ls
```

### Hook issues

```bash
# Reinstall husky
pnpm run prepare

# Or use lefthook
mise run hooks-install
```

### Cache issues

```bash
# Clear all caches
pnpm clean:cache

# Or clear everything
pnpm clean:all
pnpm install
```

## Additional Resources

- [mise Documentation](https://mise.jdx.dev/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Lefthook Documentation](https://github.com/evilmartians/lefthook)
