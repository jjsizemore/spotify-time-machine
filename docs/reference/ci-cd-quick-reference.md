# CI/CD Quick Reference

Quick commands and tips for working with the optimized CI/CD system.

## 🚀 Quick Commands

### Run Tests Locally

```bash
# All tests
pnpm test

# Specific test types
pnpm test:unit
pnpm test:integration
pnpm test:browser

# With coverage
pnpm test:coverage

# Watch mode
pnpm test:watch

# UI mode
pnpm test:ui
```

### Test Sharding (Local)

```bash
# Run shard 1 of 4
pnpm test:shard --shard=1/4

# Run shard 2 of 4
pnpm test:shard --shard=2/4
```

### Quality Checks

```bash
# Lint
pnpm run lint
pnpm run lint:fix

# Format
pnpm run fmt
pnpm run fmt:fix

# Type check
pnpm run type-check

# Spell check
pnpm run spellcheck

# All checks
pnpm run check:all
```

### Security Scans

```bash
# All security checks
pnpm run security

# Specific checks
pnpm run security:secrets
pnpm run security:deps
pnpm run security:sast
pnpm run security:env
```

### Build

```bash
# Development
pnpm run dev

# Production build
pnpm run build

# Analyze bundle
pnpm run analyze
```

## 📊 Workflow Status

### Check Workflow Runs

```bash
# List recent runs
gh run list

# View specific run
gh run view <run-id>

# Watch live run
gh run watch
```

### Workflow Triggers

```bash
# Trigger CI workflow
gh workflow run ci.yml

# Trigger test workflow
gh workflow run test.yml

# Trigger cache cleanup
gh workflow run cache-cleanup.yml

# Trigger CodeQL scan
gh workflow run codeql.yml
```

## 🗑️ Cache Management

### View Caches

```bash
# List all caches
gh cache list

# List caches for specific branch
gh cache list --ref refs/heads/feature-branch

# Show cache details
gh cache list --json key,size,createdAt
```

### Delete Caches

```bash
# Delete specific cache
gh cache delete <cache-key>

# Delete all caches (use with caution)
for cache in $(gh cache list --json id --jq '.[].id'); do
  gh cache delete $cache
done

# Trigger automated cleanup
gh workflow run cache-cleanup.yml
```

## 🔒 Security

### CodeQL

```bash
# View security alerts
gh code-scanning view

# List all alerts
gh code-scanning list

# Dismiss false positive
gh code-scanning dismiss <alert-id> --reason "false-positive"
```

### Dependabot

```bash
# List Dependabot alerts
gh dependabot list

# View specific alert
gh dependabot view <alert-number>
```

## 📦 Artifacts

### Download Artifacts

```bash
# List artifacts from latest run
gh run list --limit 1
gh run view <run-id> --log

# Download all artifacts
gh run download <run-id>

# Download specific artifact
gh run download <run-id> --name coverage-reports
```

## 🐛 Debugging

### Failed Tests

```bash
# Run tests with debugging
pnpm test:debug

# Run specific test file
pnpm test tests/unit/example.test.ts

# Run tests in UI mode
pnpm test:ui
```

### Failed CI Jobs

```bash
# View logs for failed job
gh run view <run-id> --log-failed

# Re-run failed jobs
gh run rerun <run-id> --failed

# Re-run all jobs
gh run rerun <run-id>
```

### Cache Debugging

```bash
# Check cache hit status in CI logs
gh run view <run-id> --log | grep "Cache restored from key"

# Verify pnpm lock file hasn't changed
git diff pnpm-lock.yaml
```

## 💡 Performance Tips

### Optimize Test Performance

1. **Use test sharding** for large test suites
2. **Run browser tests separately** (they're slower)
3. **Use `test:watch`** for rapid development
4. **Skip slow tests locally**: `pnpm test -- --skip-slow`

### Optimize CI Performance

1. **Merge small PRs quickly** to avoid cache staleness
2. **Keep dependencies updated** for better caching
3. **Use `workflow_dispatch`** to manually trigger workflows
4. **Cancel outdated runs** when pushing new commits

### Reduce CI Minutes

```bash
# Cancel all in-progress runs
gh run list --status in_progress --json databaseId --jq '.[].databaseId' | \
  xargs -I {} gh run cancel {}

# Cancel runs for specific workflow
gh run list --workflow test.yml --status in_progress --json databaseId --jq '.[].databaseId' | \
  xargs -I {} gh run cancel {}
```

## 📈 Monitoring

### CI Metrics

```bash
# View workflow usage (requires admin)
gh api repos/:owner/:repo/actions/runs --jq '.workflow_runs[] | {name: .name, duration: .run_duration_ms}'

# Count successful vs failed runs
gh run list --json conclusion --jq 'group_by(.conclusion) | map({conclusion: .[0].conclusion, count: length})'
```

### Cache Hit Rates

Look for this in CI logs:

```
Cache restored from key: linux-pnpm-store-abc123
Cache hit: true
```

### Storage Usage

```bash
# View artifact storage
gh api repos/:owner/:repo/actions/artifacts --jq '.total_count'

# View cache storage
gh cache list --json size --jq 'map(.size) | add'
```

## 🎯 Common Tasks

### Before Pushing Code

```bash
# Run pre-commit checks (via lefthook)
git add .
git commit -m "feat: add feature"  # Lefthook runs automatically

# Or run manually
pnpm exec lefthook run pre-commit
```

### Before Creating PR

```bash
# Run full CI locally
pnpm run check:all

# Build to verify
pnpm run build

# Check for security issues
pnpm run security
```

### Reviewing PRs

```bash
# Check out PR
gh pr checkout <pr-number>

# View PR checks
gh pr checks

# View PR diff
gh pr diff
```

## 🆘 Emergency Procedures

### CI is Completely Broken

1. Check GitHub Status: https://www.githubstatus.com/
2. Review recent workflow changes
3. Revert problematic changes
4. Contact team lead

### All Tests Failing

1. Check if it's local or CI
2. Clear local caches: `pnpm clean:all && pnpm install`
3. Check for breaking dependency updates
4. Review recent code changes

### Out of Cache Space

```bash
# Emergency cleanup
gh workflow run cache-cleanup.yml --ref main

# Wait 5 minutes then verify
gh cache list
```

### Security Alert in Dependencies

```bash
# View the alert
gh dependabot list

# Update vulnerable dependency
pnpm update <package-name>

# If major version, update manually
pnpm add <package-name>@latest
```

## 📚 Additional Resources

- [Full CI/CD Optimization Guide](./CI_CD_OPTIMIZATION.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vitest Documentation](https://vitest.dev/)
- [Project README](./README.md)

## 🔗 Useful Links

- [GitHub Actions Dashboard](https://github.com/jjsizemore/spotify-time-machine/actions)
- [Codecov Dashboard](https://codecov.io/gh/jjsizemore/spotify-time-machine)
- [Security Alerts](https://github.com/jjsizemore/spotify-time-machine/security)
- [Dependabot Alerts](https://github.com/jjsizemore/spotify-time-machine/security/dependabot)

---

**Tip:** Bookmark this page and the [Actions tab](https://github.com/jjsizemore/spotify-time-machine/actions) for quick access!
