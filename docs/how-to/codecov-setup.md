# Codecov Quick Reference

## Essential Commands

### Generate Coverage Locally

```bash
# Full coverage report (all projects)
pnpm test:coverage

# Specific test project
pnpm test:unit --coverage
pnpm test:integration --coverage
pnpm test:browser --coverage

# View HTML report
open coverage/index.html
```

### Check Coverage Status

```bash
# Terminal report (immediate)
pnpm test:coverage

# JSON summary
cat coverage/coverage-summary.json
```

## Files Overview

| File                         | Purpose                                                 |
| ---------------------------- | ------------------------------------------------------- |
| `codecov.yml`                | Codecov configuration (targets, thresholds, exclusions) |
| `.github/workflows/test.yml` | CI workflow with Codecov upload step                    |
| `vitest.config.ts`           | Vitest coverage settings (v8 provider, LCOV reporter)   |
| `coverage/lcov.info`         | Coverage data sent to Codecov                           |
| `coverage/index.html`        | Interactive coverage report                             |
| `README.md`                  | Badge showing live coverage status                      |

## GitHub Actions Flow

```
1. Push to branch/PR
   ↓
2. Sharded tests run (4 parallel)
   ↓
3. Reports merged
   ↓
4. LCOV file generated
   ↓
5. Codecov action uploads
   ↓
6. Codecov posts PR comment (if enabled)
   ↓
7. Coverage badge updates
```

## Configuration Highlights

### Coverage Targets (`codecov.yml`)

- **Project**: 70% overall
- **Patch**: 70% on changes
- **Threshold**: 5% drop allowed
- **Branches**: main, develop

### Included in Coverage

- `src/**/*.{js,jsx,ts,tsx}`

### Excluded from Coverage

- Tests and test utils
- Next.js framework files (pages, layouts, loading, error)
- Configuration files (`*.config.*`)
- Build artifacts (.next, dist)

## Troubleshooting Steps

### Upload Not Appearing

1. Check `CODECOV_TOKEN` is set: **Settings → Secrets**
2. Verify `coverage/lcov.info` exists after tests
3. Enable verbose logging in GitHub Actions
4. Check Codecov dashboard for upload history

### Coverage Looks Wrong

1. Verify excluded patterns in `codecov.yml`
2. Check `vitest.config.ts` include/exclude match
3. Run `pnpm test:coverage` locally to compare
4. Check if tests are actually being run (empty coverage = no tests)

### Tests Pass But Coverage Fails

1. Check thresholds in `codecov.yml` (currently 70%)
2. Run `pnpm test:coverage` to get exact percentage
3. If threshold is too high, update in `codecov.yml` or improve tests

## Useful Links

- **Codecov Dashboard**: https://app.codecov.io/github/jjsizemore/spotify-time-machine
- **PR Comments**: Auto-posted by Codecov bot on coverage changes
- **Status Checks**: Green/red checks on PR based on thresholds
- **Coverage Badge**: [![codecov](https://codecov.io/github/jjsizemore/spotify-time-machine/branch/main/graph/badge.svg)](https://codecov.io/github/jjsizemore/spotify-time-machine)

## Quick Settings Review

```yaml
# What's being measured
coverage:
  target: 70%  ← Overall target

# What counts
include: src/**  ← Source code only
exclude: ← Not counted
  - tests
  - .next
  - *.config.*

# How to report
reporter: lcov  ← Sends to Codecov
```

## One-Time Setup

```bash
# 1. GitHub Secret - CODECOV_TOKEN
#    Go to: Settings → Secrets → New secret
#    Name: CODECOV_TOKEN
#    Value: (from app.codecov.io repo settings)

# 2. Connect Codecov
#    Visit: https://app.codecov.io
#    GitHub sign-in → Add this repo

# 3. First push triggers workflow
#    All workflow steps run automatically
```

---

For detailed information, see [codecov-integration.md](./codecov-integration.md)
