# Sharded Test Debugging Checklist

Quick reference for debugging Vitest sharded test failures in GitHub Actions.

## Symptoms & Solutions

### Symptom: Shard shows "unknown" status

**Likely causes:**

- [ ] Shard didn't complete (check if it timed out)
- [ ] Shard encountered fatal error before reporting
- [ ] Wrong project configuration (trying to run browser tests in shards)

**Check:**

```bash
# Verify shards only run unit/integration tests
grep "test:shard" package.json
# Should see: --project=unit --project=integration
```

### Symptom: "Merge Reports & Coverage" job fails

**Likely causes:**

- [ ] No blob reports to merge (shards didn't upload artifacts)
- [ ] Missing `run` command in merge script
- [ ] Coverage wasn't collected during sharding
- [ ] Wrong merge directory

**Check:**

```bash
# Verify merge command
grep "test:merge-reports" package.json
# Should see: vitest run --merge-reports

# Verify artifacts uploaded
# In GHA, check "Upload shard report" step logs

# Verify coverage collection
grep "test:shard" package.json
# Should see: --coverage.enabled=true --coverage.reporter=blob
```

### Symptom: Shard 3 fails but others pass

**Likely causes:**

- [ ] Specific test in shard 3 is flaky or broken
- [ ] Resource constraints (memory, CPU)
- [ ] VITEST_MAX_THREADS set too high

**Check:**

```bash
# Check thread count in workflow
grep "VITEST_MAX_THREADS" .github/workflows/test.yml
# Should be: 3 for GitHub Actions (4-core machines)

# Run that shard locally to identify failing test
pnpm test:shard --shard=3/4
```

### Symptom: Coverage report is empty or partial

**Likely causes:**

- [ ] Coverage not enabled in shards
- [ ] Coverage not re-generated during merge
- [ ] 'blob' reporter missing from coverage config

**Check:**

```typescript
// In vitest.config.ts
coverage: {
  provider: 'v8',
  reporter: [..., 'blob'],  // Must include 'blob'
}
```

## Quick Verification Commands

```bash
# 1. Check if blob reports are generated
ls -la .vitest-reports/

# 2. Verify blob report structure
cat .vitest-reports/blob.json | jq '.'

# 3. Test single shard locally
pnpm test:shard --shard=1/4

# 4. Test merge locally
pnpm test:merge-reports

# 5. Check for test file pattern matches
vitest list --project=unit --project=integration

# 6. Verify coverage is collected
pnpm test:shard --shard=1/4
ls -la .vitest-reports/coverage-*
```

## Common Fixes

### Fix 1: Reset and clean

```bash
# Remove old reports
rm -rf .vitest-reports/ coverage/ test-results/

# Run fresh shard
pnpm test:shard --shard=1/4

# Verify artifacts
ls -la .vitest-reports/
```

### Fix 2: Check environment variables

```bash
# In GitHub Actions, check these are set correctly:
# - NODE_ENV=test
# - VITEST_MAX_THREADS=3 (for 4-core machines)
# - No conflicting VITEST_* env vars
```

### Fix 3: Validate configuration

```bash
# Test the vitest config
npx vitest --help

# List all test files that would run
npx vitest list

# Run with debug output
DEBUG=vitest:* pnpm test:shard --shard=1/4
```

## GitHub Actions Artifact Debugging

If artifacts aren't uploading/downloading correctly:

```yaml
# Check artifact name is unique per shard
- uses: actions/upload-artifact@v4
  with:
    name: test-report-shard-${{ matrix.shardIndex }} # Must be unique!
    path: .vitest-reports/*

# Check download pattern matches upload names
- uses: actions/download-artifact@v4
  with:
    pattern: test-report-shard-* # Must match upload names
    merge-multiple: true
```

## Performance Tuning

For faster shard execution:

```bash
# Adjust thread count based on machine cores
# Formula: (CPU_CORES - 1) = max threads
# GitHub Actions: 4 cores → 3 threads
# Local 8-core: 4 cores → 7 threads

export VITEST_MAX_THREADS=3  # For CI
export VITEST_MAX_THREADS=7  # For local 8-core machine
```

## Resources

- Check shard logs in GitHub Actions "Run tests (sharded)" step
- Compare working vs failing shard artifact sizes
- Review Vitest documentation: https://vitest.dev/guide/improving-performance.html#sharding
- Check if any tests use hardcoded values that might fail in sharded execution
